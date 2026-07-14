/**
 * Volunteers API
 * GET - List volunteers
 * POST - Apply to become volunteer
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

const applyVolunteerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  skills: z.array(z.string()).optional(),
  availability: z.enum(["WEEKDAYS", "WEEKENDS", "FLEXIBLE"]).optional(),
  experience: z.string().optional(),
  reason: z.string().optional(),
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

export async function GET() {
  try {
    // Get approved volunteers
    const volunteers = await prisma.trustMember.findMany({
      where: { type: "MEMBER", active: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        designation: true,
        imageUrl: true,
        phone: true,
        email: true,
      },
    })

    return NextResponse.json(volunteers)
  } catch (error) {
    console.error("Error fetching volunteers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = applyVolunteerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    // Check if user already applied
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id }
      })

      if (profile) {
        // Check for existing enquiry
        const existing = await prisma.contactEnquiry.findFirst({
          where: {
            email: validation.data.email,
            category: "FEEDBACK",
          },
        })

        if (existing) {
          return NextResponse.json(
            { message: "You have already submitted a volunteer application" },
            { status: 200 }
          )
        }
      }
    }

    // Create contact enquiry as volunteer application
    const enquiry = await prisma.contactEnquiry.create({
      data: {
        name: validation.data.name,
        email: validation.data.email,
        phone: validation.data.phone,
        subject: "Volunteer Application",
        message: [
          `Name: ${validation.data.name}`,
          `Email: ${validation.data.email}`,
          `Phone: ${validation.data.phone || "N/A"}`,
          `Address: ${validation.data.address || "N/A"}`,
          `Skills: ${validation.data.skills?.join(", ") || "N/A"}`,
          `Availability: ${validation.data.availability || "N/A"}`,
          `Experience: ${validation.data.experience || "N/A"}`,
          `Reason: ${validation.data.reason || "N/A"}`,
        ].join("\n"),
        category: "FEEDBACK",
        status: "NEW",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Thank you for your interest in volunteering! Our team will contact you soon.",
      applicationId: enquiry.id,
    }, { status: 201 })
  } catch (error) {
    console.error("Error submitting volunteer application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
