/**
 * Aaradhane API
 * GET - List aaradhanes
 * POST - Create aaradhane
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { aaradhaneService } from "@/repositories/aaradhane"
import { prisma } from "@/lib/db"

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
    const featured = searchParams.get("featured")
    const id = searchParams.get("id")

    if (id) {
      const result = await aaradhaneService.getAaradhane(id)
      if (!result.success || !result.data) {
        return NextResponse.json({ error: "Aaradhane not found" }, { status: 404 })
      }
      return NextResponse.json(result.data)
    }

    if (featured === "true") {
      const limit = parseInt(searchParams.get("limit") || "5")
      const result = await aaradhaneService.getFeaturedAaradhanaes(limit)
      return NextResponse.json(result.data)
    }

    const activeOnly = searchParams.get("active") !== "false"
    const result = await aaradhaneService.getAllAaradhanaes(activeOnly)
    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching aaradhanes:", error)
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
    const result = await aaradhaneService.createAaradhane(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error("Error creating aaradhane:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
