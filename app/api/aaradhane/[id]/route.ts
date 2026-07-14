/**
 * Aaradhane by ID API
 * GET - Get aaradhane
 * PATCH - Update aaradhane
 * DELETE - Delete aaradhane
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await aaradhaneService.getAaradhane(id)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    
    if (!result.data) {
      return NextResponse.json({ error: "Aaradhane not found" }, { status: 404 })
    }
    
    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching aaradhane:", error)
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
    const result = await aaradhaneService.updateAaradhane(id, body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error updating aaradhane:", error)
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
    const result = await aaradhaneService.deleteAaradhane(id)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting aaradhane:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  try {
    const isAdmin = await checkAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params as { id: string }
    
    if (action === "toggleFeatured") {
      const result = await aaradhaneService.toggleFeatured(id)
      return NextResponse.json(result.data)
    }
    
    if (action === "toggleActive") {
      const result = await aaradhaneService.toggleActive(id)
      return NextResponse.json(result.data)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error performing action:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
