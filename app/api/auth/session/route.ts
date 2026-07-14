/**
 * Session API Route
 * Get current user session
 */
import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ user: null, profile: null })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role || "DEVOTEE",
      },
      profile,
    })
  } catch (error) {
    console.error("Error getting session:", error)
    return NextResponse.json({ user: null, profile: null })
  }
}
