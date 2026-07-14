/**
 * Trust Member by ID API
 * GET - Get trust member
 * PATCH - Update trust member
 * DELETE - Delete trust member
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { trustRepository } from "@/repositories/trust"
import { prisma } from "@/lib/db"
import { z } from "zod"

const updateTrustMemberSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  nameKannada: z.string().max(200).optional(),
  designation: z.string().min(1).max(200).optional(),
  designationKannada: z.string().max(200).optional(),
  bio: z.string().optional(),
  bioKannada: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  type: z.enum(["PONTIFF", "TRUSTEE", "MEMBER", "SECRETARY", "STAFF", "PRIEST"]).optional(),
  order: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
  isPontiff: z.boolean().optional(),
  isResident: z.boolean().optional(),
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await trustRepository.findTrustMemberById(id)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    
    if (!result.data) {
      return NextResponse.json({ error: "Trust member not found" }, { status: 404 })
    }
    
    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching trust member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validation = updateTrustMemberSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    const result = await trustRepository.updateTrustMember(id, validation.data)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error updating trust member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const result = await trustRepository.deleteTrustMember(id)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting trust member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
