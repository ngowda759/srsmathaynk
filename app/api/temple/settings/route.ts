/**
 * Temple Settings API
 * GET - Get temple settings
 * PATCH - Update temple settings
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { templeRepository } from "@/repositories/temple"
import { z } from "zod"

const updateSettingsSchema = z.object({
  templeName: z.string().optional(),
  shortName: z.string().optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  mapEmbedUrl: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  socialFacebook: z.string().optional(),
  socialTwitter: z.string().optional(),
  socialInstagram: z.string().optional(),
  socialYoutube: z.string().optional(),
  socialWhatsapp: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIFSCCode: z.string().optional(),
  bankUPIId: z.string().optional(),
  establishedYear: z.number().optional(),
})

async function checkAdmin(supabase: Awaited<ReturnType<typeof createServerClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const profile = await import("@/lib/db").then(m => m.prisma.profile.findUnique({
    where: { userId: user.id }
  }))
  
  return profile?.role === "SUPER_ADMIN" || profile?.role === "ADMIN"
}

export async function GET() {
  try {
    const result = await templeRepository.getSettings()
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching temple settings:", error)
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

    const body = await request.json()
    const validation = updateSettingsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    const result = await templeRepository.updateSettings(validation.data)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error updating temple settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
