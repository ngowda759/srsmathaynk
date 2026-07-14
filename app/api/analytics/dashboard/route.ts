/**
 * Dashboard Analytics API
 * GET - Get dashboard statistics
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
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
    if (!await checkAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month" // day, week, month, year

    // Calculate date ranges
    const now = new Date()
    let startDate: Date
    let previousStartDate: Date
    let previousEndDate: Date

    if (period === "day") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      previousStartDate = new Date(startDate)
      previousStartDate.setDate(previousStartDate.getDate() - 1)
      previousEndDate = new Date(previousStartDate)
    } else if (period === "week") {
      const dayOfWeek = now.getDay()
      startDate = new Date(now)
      startDate.setDate(now.getDate() - dayOfWeek)
      startDate.setHours(0, 0, 0, 0)
      previousStartDate = new Date(startDate)
      previousStartDate.setDate(previousStartDate.getDate() - 7)
      previousEndDate = new Date(startDate)
    } else if (period === "year") {
      startDate = new Date(now.getFullYear(), 0, 1)
      previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
      previousEndDate = new Date(now.getFullYear() - 1, 11, 31)
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0)
    }

    // Fetch statistics
    const [
      donations,
      previousDonations,
      sevas,
      previousSevas,
      visitors,
      previousVisitors,
      contacts,
      previousContacts,
      testimonials,
      events,
      recentDonations,
      recentBookings,
    ] = await Promise.all([
      // Donations
      prisma.donation.aggregate({
        where: {
          status: "COMPLETED",
          paidAt: { gte: startDate },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.donation.aggregate({
        where: {
          status: "COMPLETED",
          paidAt: { gte: previousStartDate, lte: previousEndDate },
        },
        _sum: { amount: true },
      }),
      // Sevas
      prisma.sevaBooking.count({
        where: {
          preferredDate: { gte: startDate },
        },
      }),
      prisma.sevaBooking.count({
        where: {
          preferredDate: { gte: previousStartDate, lte: previousEndDate },
        },
      }),
      // Visitors (approximated from page views)
      prisma.pageView.aggregate({
        where: { viewedAt: { gte: startDate } },
        _count: true,
      }),
      prisma.pageView.aggregate({
        where: { viewedAt: { gte: previousStartDate, lte: previousEndDate } },
        _count: true,
      }),
      // Contacts
      prisma.contactEnquiry.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.contactEnquiry.count({
        where: { createdAt: { gte: previousStartDate, lte: previousEndDate } },
      }),
      // Testimonials
      prisma.testimonial.count({
        where: { createdAt: { gte: startDate } },
      }),
      // Events
      prisma.event.count({
        where: {
          startDate: { gte: startDate },
          published: true,
        },
      }),
      // Recent activity
      prisma.donation.findMany({
        where: { status: "COMPLETED" },
        orderBy: { paidAt: "desc" },
        take: 5,
        select: {
          id: true,
          donorName: true,
          amount: true,
          purpose: true,
          paidAt: true,
        },
      }),
      prisma.sevaBooking.findMany({
        where: { preferredDate: { gte: new Date() } },
        orderBy: { preferredDate: "asc" },
        take: 5,
        include: {
          seva: { select: { name: true } },
        },
      }),
    ])

    // Calculate percentages
    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const donationsTotal = donations._sum.amount || 0
    const previousDonationsTotal = previousDonations._sum.amount || 0

    return NextResponse.json({
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
      stats: {
        donations: {
          amount: donationsTotal,
          count: donations._count,
          previousAmount: previousDonationsTotal,
          change: calcChange(donationsTotal, previousDonationsTotal),
        },
        sevas: {
          count: sevas,
          previousCount: previousSevas,
          change: calcChange(sevas, previousSevas),
        },
        visitors: {
          count: visitors._count,
          previousCount: previousVisitors._count,
          change: calcChange(visitors._count, previousVisitors._count),
        },
        contacts: {
          count: contacts,
          previousCount: previousContacts,
          change: calcChange(contacts, previousContacts),
        },
        testimonials: {
          count: testimonials,
        },
        events: {
          count: events,
        },
      },
      recentActivity: {
        donations: recentDonations,
        upcomingSevas: recentBookings,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
