/**
 * Profile API Route
 * GET - Get current user profile
 * PATCH - Update current user profile
 */
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"


export const dynamic = "force-dynamic";

// Lazy load to prevent initialization at build time
async function getPrisma() {
  const { prisma } = await import("@/lib/db");
  return prisma;
}

async function getSupabase() {
  const { createServerClient } = await import("@/lib/supabase/server");
  return createServerClient();
}

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().regex(/^[+]?[\d\s-]{10,}$/).optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const prisma = await getPrisma()
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    const prisma = await getPrisma()
    const updatedProfile = await prisma.profile.update({
      where: { userId: user.id },
      data: validatedData,
    })

    return NextResponse.json(updatedProfile)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'errors' in error) {
      return NextResponse.json({ error: (error as { errors: unknown }).errors }, { status: 400 })
    }
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
