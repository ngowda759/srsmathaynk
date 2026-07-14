/**
 * Homepage Settings API
 * GET - Get homepage settings
 * PATCH - Update homepage settings
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { templeRepository } from "@/repositories/temple"
import { z } from "zod"

const updateHomepageSchema = z.object({
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroImageUrl: z.string().url().optional().or(z.literal("")),
  heroVideoUrl: z.string().url().optional().or(z.literal("")),
  aboutTitle: z.string().optional(),
  aboutContent: z.string().optional(),
  aboutImageUrl: z.string().url().optional().or(z.literal("")),
  showFeaturedEvents: z.boolean().optional(),
  showFeaturedSevas: z.boolean().optional(),
  showDonationSection: z.boolean().optional(),
  showGalleryPreview: z.boolean().optional(),
  showAnnouncements: z.boolean().optional(),
  featuredEventsLimit: z.number().int().positive().optional(),
  featuredSevasLimit: z.number().int().positive().optional(),
  galleryPreviewLimit: z.number().int().positive().optional(),
  donationTitle: z.string().optional(),
  donationSubtitle: z.string().optional(),
  newsTitle: z.string().optional(),
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
    const result = await templeRepository.getHomepageSettings()
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching homepage settings:", error)
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
    const validation = updateHomepageSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    const result = await templeRepository.updateHomepageSettings(validation.data)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error updating homepage settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
