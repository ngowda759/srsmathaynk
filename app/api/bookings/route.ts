/**
 * Seva Bookings API
 * GET - List bookings
 * POST - Create booking
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { bookingsRepository } from "@/repositories/sevas"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createBookingSchema = z.object({
  sevaId: z.string().min(1),
  preferredDate: z.string().datetime(),
  preferredTime: z.string().optional(),
  devoteeName: z.string().min(1).max(200),
  devoteePhone: z.string().optional(),
  devoteeEmail: z.string().email().optional(),
  gothra: z.string().optional(),
  nakshatra: z.string().optional(),
  photoUrl: z.string().url().optional(),
  specialRequests: z.string().optional(),
  quantity: z.number().int().min(1).optional().default(1),
})

async function getUserProfile() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return prisma.profile.findUnique({ where: { userId: user.id } })
}

async function checkAdmin() {
  const profile = await getUserProfile()
  return profile?.role === "SUPER_ADMIN" || profile?.role === "ADMIN" || profile?.role === "STAFF"
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profile = await getUserProfile()
    const isAdmin = await checkAdmin()
    
    // Non-admins can only see their own bookings
    if (!isAdmin && !profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const filters: any = {}
    if (!isAdmin) filters.userId = profile?.id // Force filter for non-admins
    
    if (searchParams.get("status")) filters.status = searchParams.get("status")
    if (searchParams.get("sevaId")) filters.sevaId = searchParams.get("sevaId")
    if (searchParams.get("date")) filters.preferredDate = searchParams.get("date")

    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const result = await bookingsRepository.findAll({ page, limit, filters })
    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = createBookingSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    const input: any = { ...validation.data }
    input.preferredDate = new Date(input.preferredDate)

    // Check for past date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (input.preferredDate < today) {
      return NextResponse.json({ error: "Cannot book for past dates" }, { status: 400 })
    }

    // Link to user if authenticated
    const profile = await getUserProfile()
    if (profile) input.userId = profile.id

    const result = await bookingsRepository.create(input)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
