/**
 * Calendar API
 * GET - Get calendar data (festivals, events, timings)
 */
import { NextRequest, NextResponse } from "next/server"
import { templeRepository } from "@/repositories/temple"
import { eventsRepository } from "@/repositories/events"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // "festivals", "events", "timings", "all"
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : new Date().getFullYear()
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : undefined

    const result: any = {}

    if (!type || type === "all" || type === "festivals") {
      // Get festivals for the year
      const festivalsResult = await templeRepository.getFestivals()
      if (festivalsResult.success) {
        result.festivals = festivalsResult.data.filter((f: any) => {
          const festivalYear = new Date(f.date).getFullYear()
          return festivalYear === year
        })
      }
    }

    if (!type || type === "all" || type === "events") {
      // Get events for the year
      const eventsResult = await eventsRepository.findAll({
        filters: {
          published: true,
          startDate: new Date(`${year}-01-01`),
          endDate: new Date(`${year}-12-31`)
        }
      })
      if (eventsResult.success) {
        result.events = eventsResult.data?.items || []
      }
    }

    if (!type || type === "all" || type === "timings") {
      // Get temple timings
      const timingsResult = await templeRepository.getTimings()
      if (timingsResult.success) {
        result.timings = timingsResult.data
      }
    }

    if (!type || type === "all" || type === "panchanga") {
      // Get panchanga data
      const startDate = month 
        ? new Date(year, month - 1, 1)
        : new Date(`${year}-01-01`)
      const endDate = month
        ? new Date(year, month, 0)
        : new Date(`${year}-12-31`)
      
      const panchangaResult = await prisma.panchanga.findMany({
        where: {
          date: { gte: startDate, lte: endDate }
        },
        orderBy: { date: "asc" }
      })
      result.panchanga = panchangaResult
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching calendar data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
