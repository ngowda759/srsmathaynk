/**
 * Events API
 * GET - List events
 * POST - Create event
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { eventsRepository } from "@/repositories/events"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  titleKannada: z.string().max(200).optional(),
  description: z.string().optional(),
  descriptionKannada: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  isOnline: z.boolean().optional().default(false),
  onlineLink: z.string().url().optional(),
  type: z.enum(["GENERAL", "FESTIVAL", "WORKSHOP", "SPIRITUAL", "CULTURAL", "MAINTENANCE"]).optional().default("GENERAL"),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional().default("UPCOMING"),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
  imageUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  maxAttendees: z.number().int().positive().optional(),
  organizer: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
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
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const featured = searchParams.get("featured")
    const published = searchParams.get("published")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const filters: any = {}
    if (type) filters.type = type
    if (status) filters.status = status
    if (featured === "true") filters.featured = true
    if (published === "true") filters.published = true
    if (search) filters.search = search

    const result = await eventsRepository.findAll({
      page,
      limit,
      filters,
      orderBy: { field: "startDate", order: "asc" }
    })

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching events:", error)
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
    const validation = createEventSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    const input: any = { ...validation.data }
    input.startDate = new Date(input.startDate)
    input.endDate = new Date(input.endDate)

    const result = await eventsRepository.create(input)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
