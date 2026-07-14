/**
 * Donation Reports API
 * GET - Generate donation reports
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { donationsRepository } from "@/repositories/donations"
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
    const type = searchParams.get("type") || "summary"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const groupBy = searchParams.get("groupBy") || "day"

    const dateFilter: any = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)

    const whereClause: any = {
      status: "COMPLETED",
      ...(Object.keys(dateFilter).length ? { paidAt: dateFilter } : {}),
    }

    if (type === "summary") {
      const [total, count, byMethod, byPurpose] = await Promise.all([
        prisma.donation.aggregate({
          where: whereClause,
          _sum: { amount: true },
        }),
        prisma.donation.count({ where: whereClause }),
        prisma.donation.groupBy({
          by: ["paymentMethod"],
          where: whereClause,
          _sum: { amount: true },
          _count: true,
        }),
        prisma.donation.groupBy({
          by: ["purpose"],
          where: whereClause,
          _sum: { amount: true },
          _count: true,
        }),
      ])

      return NextResponse.json({
        summary: {
          totalAmount: total._sum.amount || 0,
          donationCount: count,
          averageDonation: count > 0 ? (total._sum.amount || 0) / count : 0,
        },
        byPaymentMethod: byMethod.map(m => ({
          method: m.paymentMethod,
          amount: m._sum.amount || 0,
          count: m._count,
        })),
        byPurpose: byPurpose.map(p => ({
          purpose: p.purpose || "General",
          amount: p._sum.amount || 0,
          count: p._count,
        })),
      })
    }

    if (type === "timeline") {
      const donations = await prisma.donation.findMany({
        where: whereClause,
        select: { paidAt: true, amount: true, currency: true },
        orderBy: { paidAt: "asc" },
      })

      const grouped = groupByTimeline(donations, groupBy)
      return NextResponse.json({ timeline: grouped, currency: "INR" })
    }

    if (type === "export") {
      const donations = await prisma.donation.findMany({
        where: whereClause,
        orderBy: { paidAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      })

      return NextResponse.json({
        donations: donations.map(d => ({
          id: d.id,
          donorName: d.anonymous ? "Anonymous" : d.donorName,
          donorEmail: d.donorEmail,
          donorPhone: d.donorPhone,
          amount: d.amount,
          currency: d.currency,
          purpose: d.purpose,
          paymentMethod: d.paymentMethod,
          status: d.status,
          paidAt: d.paidAt,
          createdAt: d.createdAt,
        })),
        generatedAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function groupByTimeline(donations: any[], groupBy: string) {
  const grouped: any = {}

  donations.forEach(d => {
    const date = new Date(d.paidAt)
    let key: string

    if (groupBy === "day") key = date.toISOString().split("T")[0]
    else if (groupBy === "week") {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      key = weekStart.toISOString().split("T")[0]
    } else if (groupBy === "month") key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    else key = date.getFullYear().toString()

    if (!grouped[key]) grouped[key] = { period: key, amount: 0, count: 0 }
    grouped[key].amount += d.amount
    grouped[key].count += 1
  })

  return Object.values(grouped).sort((a: any, b: any) => a.period.localeCompare(b.period))
}
