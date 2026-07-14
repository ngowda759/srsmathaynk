/**
 * Gallery API
 * GET - List gallery items
 * POST - Create gallery item
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { galleryRepository } from "@/repositories/gallery"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createGalleryItemSchema = z.object({
  title: z.string().min(1).max(200),
  titleKannada: z.string().max(200).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(["IMAGE", "VIDEO"]).optional().default("IMAGE"),
  url: z.string().min(1),
  thumbnailUrl: z.string().url().optional(),
  altText: z.string().optional(),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional(),
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
    const category = searchParams.get("category")
    const type = searchParams.get("type")
    const featured = searchParams.get("featured")
    const active = searchParams.get("active")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const filters: any = {}
    if (category) filters.category = category
    if (type) filters.type = type
    if (featured === "true") filters.isFeatured = true
    if (active !== "false") filters.isActive = true
    if (search) filters.search = search

    const result = await galleryRepository.findAll({
      page,
      limit,
      filters,
      orderBy: { field: "order", order: "asc" }
    })

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching gallery:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = createGalleryItemSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    const result = await galleryRepository.create(validation.data)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error("Error creating gallery item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
