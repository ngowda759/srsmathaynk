/**
 * Donations API
 * GET - List donations
 * POST - Create donation
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { donationsRepository } from "@/repositories/donations"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createDonationSchema = z.object({
  amount: z.number().min(1),
  currency: z.string().optional().default("INR"),
  paymentMethod: z.enum(["ONLINE", "UPI", "BANK_TRANSFER", "CASH", "CHEQUE"]).optional().default("ONLINE"),
  donorName: z.string().optional(),
  donorEmail: z.string().email().optional(),
  donorPhone: z.string().optional(),
  anonymous: z.boolean().optional().default(false),
  purpose: z.string().optional(), // e.g., "General", "Annadan", "Building Fund"
  remark: z.string().optional(),
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
    
    // Non-admins can only see their own donations
    if (!isAdmin && !profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const filters: any = {}
    if (!isAdmin) filters.userId = profile?.id
    
    if (searchParams.get("status")) filters.status = searchParams.get("status")
    if (searchParams.get("paymentMethod")) filters.paymentMethod = searchParams.get("paymentMethod")
    if (searchParams.get("purpose")) filters.purpose = searchParams.get("purpose")

    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const result = await donationsRepository.findAll({ page, limit, filters })
    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching donations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = createDonationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    // Link to user if authenticated
    const profile = await getUserProfile()
    const input: any = { ...validation.data }
    if (profile) input.userId = profile.id

    const result = await donationsRepository.create(input)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error("Error creating donation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
