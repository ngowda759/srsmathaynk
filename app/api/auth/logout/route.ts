/**
 * Logout API Route
 */
import { NextResponse } from "next/server"


export const dynamic = "force-dynamic";

async function getSupabase() {
  const { createServerClient } = await import("@/lib/supabase/server");
  return createServerClient();
}

export async function POST() {
  try {
    const supabase = await getSupabase()
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging out:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
