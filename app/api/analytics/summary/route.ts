/**
 * Daily Summary API
 * GET - Get daily summary of temple activities
 */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")
    const date = dateParam ? new Date(dateParam) : new Date()
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    // Fetch daily data
    const [
      donations,
      sevas,
      visitors,
      events,
      announcements,
    ] = await Promise.all([
      // Donations for the day
      prisma.donation.findMany({
        where: {
          status: "COMPLETED",
          paidAt: { gte: dayStart, lt: dayEnd },
        },
        select: {
          id: true,
          amount: true,
          purpose: true,
          paymentMethod: true,
          donorName: true,
        },
        orderBy: { paidAt: "desc" },
      }),
      // Sevas for the day
      prisma.sevaBooking.findMany({
        where: {
          preferredDate: { gte: dayStart, lt: dayEnd },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        include: {
          seva: { select: { name: true, amount: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      // Visitors count (approximated)
      prisma.pageView.aggregate({
        where: {
          viewedAt: { gte: dayStart, lt: dayEnd },
        },
        _count: true,
      }),
      // Today's events
      prisma.event.findMany({
        where: {
          startDate: { gte: dayStart, lt: dayEnd },
          published: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
        },
      }),
      // Active announcements
      prisma.announcement.findMany({
        where: {
          active: true,
          OR: [
            { publishAt: { lte: dayEnd } },
            { publishAt: null },
          ],
        },
        orderBy: { priority: "desc" },
        take: 5,
      }),
    ])

    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0)
    const totalSevas = sevas.reduce((sum, s) => sum + (s.seva?.amount || 0), 0)

    return NextResponse.json({
      date: dayStart.toISOString().split("T")[0],
      donations: {
        count: donations.length,
        total: totalDonations,
        items: donations.slice(0, 10),
        byPurpose: groupBy(donations, "purpose"),
      },
      sevas: {
        count: sevas.length,
        total: totalSevas,
        items: sevas.slice(0, 10),
      },
      visitors: {
        count: visitors._count,
      },
      events: events,
      announcements: announcements,
      summary: {
        totalIncome: totalDonations + totalSevas,
        transactionCount: donations.length + sevas.length,
      },
    })
  } catch (error) {
    console.error("Error fetching daily summary:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function groupBy(items: any[], key: string) {
  return items.reduce((acc, item) => {
    const group = item[key] || "General"
    if (!acc[group]) acc[group] = { count: 0, total: 0 }
    acc[group].count++
    acc[group].total += item.amount
    return acc
  }, {})
}
