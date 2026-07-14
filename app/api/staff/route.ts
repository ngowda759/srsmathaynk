/**
 * Staff API
 * GET - List staff members
 * POST - Create staff member
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { trustRepository } from "@/repositories/trust"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createStaffSchema = z.object({
  name: z.string().min(1).max(200),
  designation: z.string().min(1).max(200),
  department: z.string().max(100).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  bio: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  active: z.boolean().optional().default(true),
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
    const department = searchParams.get("department")
    const activeOnly = searchParams.get("active") !== "false"

    if (department) {
      const result = await trustRepository.findByDepartment(department)
      return NextResponse.json(result.data)
    }

    const result = await trustRepository.findStaffMembers(activeOnly)
    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching staff:", error)
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
    const validation = createStaffSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    const result = await trustRepository.createStaffMember(validation.data)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error("Error creating staff:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
