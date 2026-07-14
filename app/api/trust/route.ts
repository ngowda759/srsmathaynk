/**
 * Trust Members API
 * GET - List trust members
 * POST - Create trust member
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { trustRepository } from "@/repositories/trust"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createTrustMemberSchema = z.object({
  name: z.string().min(1).max(200),
  nameKannada: z.string().max(200).optional(),
  designation: z.string().min(1).max(200),
  designationKannada: z.string().max(200).optional(),
  bio: z.string().optional(),
  bioKannada: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  type: z.enum(["PONTIFF", "TRUSTEE", "MEMBER", "SECRETARY", "STAFF", "PRIEST"]).optional().default("MEMBER"),
  order: z.number().int().min(0).optional(),
  active: z.boolean().optional().default(true),
  isPontiff: z.boolean().optional().default(false),
  isResident: z.boolean().optional().default(false),
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
    const type = searchParams.get("type")
    const activeOnly = searchParams.get("active") !== "false"

    if (type) {
      const result = await trustRepository.findByType(type)
      return NextResponse.json(result.data)
    }

    const result = await trustRepository.findTrustMembers(activeOnly)
    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching trust members:", error)
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
    const validation = createTrustMemberSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    const result = await trustRepository.createTrustMember(validation.data)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error("Error creating trust member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
