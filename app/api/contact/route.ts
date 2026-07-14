/**
 * Contact Form API
 * GET - List enquiries (admin)
 * POST - Submit contact enquiry
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { contactRepository } from "@/repositories/contact"
import { prisma } from "@/lib/db"
import { z } from "zod"

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  category: z.enum(["GENERAL", "SEVA", "DONATION", "EVENT", "VISIT", "COMPLAINT", "FEEDBACK"]).optional().default("GENERAL"),
  message: z.string().min(10),
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
    if (!await checkAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const filters: any = {}
    if (status) filters.status = status
    if (category) filters.category = category

    const result = await contactRepository.findAll({
      page,
      limit,
      filters,
    })

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching enquiries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = contactSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    // Get IP for spam prevention
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : "unknown"

    const result = await contactRepository.create({
      ...validation.data,
      ipAddress: ip,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for your enquiry. We will get back to you soon.",
      enquiryId: result.data?.id,
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating enquiry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
