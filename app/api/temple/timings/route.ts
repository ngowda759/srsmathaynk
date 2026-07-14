/**
 * Temple Timings API
 * GET - Get all timings
 * PUT - Update all timings (bulk)
 * PATCH - Update single timing
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { templeRepository } from "@/repositories/temple"
import { prisma } from "@/lib/db"
import { z } from "zod"

const timingSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^([01]?\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  closeTime: z.string().regex(/^([01]?\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  isHoliday: z.boolean().optional().default(false),
  notes: z.string().optional(),
})

const bulkTimingsSchema = z.array(timingSchema)

async function checkAdmin(supabase: Awaited<ReturnType<typeof createServerClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id }
  })
  
  return profile?.role === "SUPER_ADMIN" || profile?.role === "ADMIN" || profile?.role === "STAFF"
}

export async function GET() {
  try {
    const result = await templeRepository.getTimings()
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching timings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const isAdmin = await checkAdmin(supabase)
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = bulkTimingsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    const result = await templeRepository.setTimings(validation.data)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error("Error updating timings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const isAdmin = await checkAdmin(supabase)
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dayOfWeek = searchParams.get("day")

    if (!dayOfWeek) {
      return NextResponse.json({ error: "Day of week is required" }, { status: 400 })
    }

    const day = parseInt(dayOfWeek)
    if (isNaN(day) || day < 0 || day > 6) {
      return NextResponse.json({ error: "Invalid day of week" }, { status: 400 })
    }

    const body = await request.json()
    const validation = timingSchema.partial().safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    const result = await templeRepository.updateTiming(day, validation.data)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error updating timing:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
