/**
 * Testimonials API
 * GET - List testimonials
 * POST - Create testimonial
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { testimonialsRepository } from "@/repositories/testimonials"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createTestimonialSchema = z.object({
  name: z.string().min(1).max(200),
  location: z.string().max(200).optional(),
  title: z.string().max(200).optional(),
  content: z.string().min(10),
  rating: z.number().int().min(1).max(5).optional(),
  imageUrl: z.string().url().optional(),
})

async function checkAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id }
  })
  
  return profile?.role === "SUPER_ADMIN" || profile?.role === "ADMIN" || profile?.role === "STAFF"
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured")
    const approved = searchParams.get("approved")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const filters: any = {}
    if (featured === "true") filters.isFeatured = true
    if (approved !== "false") filters.isApproved = true
    if (approved === "all") delete filters.isApproved

    const result = await testimonialsRepository.findAll({
      page,
      limit,
      filters,
    })

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = createTestimonialSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    // Get user profile if authenticated
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    let userId: string | undefined

    if (user) {
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id }
      })
      userId = profile?.id
    }

    // Create testimonial (requires approval)
    const result = await testimonialsRepository.create({
      ...validation.data,
      userId,
      isApproved: false,
      isFeatured: false,
      isPublished: false,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      ...result.data,
      message: "Testimonial submitted for approval"
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating testimonial:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
