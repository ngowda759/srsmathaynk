/**
 * Sevas API
 * GET - List sevas
 * POST - Create seva
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sevasRepository } from "@/repositories/sevas"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createSevaSchema = z.object({
  name: z.string().min(1).max(200),
  nameKannada: z.string().max(200).optional(),
  description: z.string().optional(),
  descriptionKannada: z.string().optional(),
  category: z.string().optional(),
  duration: z.string().optional(),
  amount: z.number().min(0).optional().default(0),
  currency: z.string().optional().default("INR"),
  maxPerDay: z.number().int().positive().optional(),
  requiresAdvanceBooking: z.boolean().optional().default(false),
  availableDays: z.array(z.number().int().min(0).max(6)).optional(),
  imageUrl: z.string().url().optional(),
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
  
  return profile?.role === "SUPER_ADMIN" || profile?.role === "ADMIN" || profile?.role === "STAFF" || profile?.role === "PRIEST"
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")
    const active = searchParams.get("active")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const filters: any = {}
    if (category) filters.category = category
    if (featured === "true") filters.isFeatured = true
    if (active !== "false") filters.isActive = true
    if (search) filters.search = search

    const result = await sevasRepository.findAll({ page, limit, filters })
    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching sevas:", error)
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
    const validation = createSevaSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    const result = await sevasRepository.create(validation.data)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error("Error creating seva:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
