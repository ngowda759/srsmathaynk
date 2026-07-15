/**
 * Event Calendar API Route
 * GET /api/events/calendar - Get events optimized for calendar views
 * 
 * Query params:
 * - startDate: YYYY-MM-DD (required)
 * - endDate: YYYY-MM-DD (required)
 * 
 * Response:
 * [
 *   {
 *     "id": "...",
 *     "date": "YYYY-MM-DD",
 *     "title": "...",
 *     "titleKn": "...",
 *     "type": "FESTIVAL",
 *     "featured": true,
 *     "startTime": "09:00",
 *     "endTime": "17:00",
 *     "location": "Main Hall"
 *   }
 * ]
 */

import { NextRequest, NextResponse } from "next/server";
import { eventService } from "@/services/event.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    // Validate required parameters
    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        {
          success: false,
          error: "startDate and endDate are required (format: YYYY-MM-DD)",
        },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid startDate format",
        },
        { status: 400 }
      );
    }

    if (isNaN(endDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid endDate format",
        },
        { status: 400 }
      );
    }

    if (endDate < startDate) {
      return NextResponse.json(
        {
          success: false,
          error: "endDate must be after startDate",
        },
        { status: 400 }
      );
    }

    // Max range: 1 year to prevent excessive queries
    const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in ms
    if (endDate.getTime() - startDate.getTime() > maxRange) {
      return NextResponse.json(
        {
          success: false,
          error: "Date range cannot exceed 1 year",
        },
        { status: 400 }
      );
    }

    const events = await eventService.getCalendarEvents(startDate, endDate);

    return NextResponse.json({
      success: true,
      data: events,
      count: events.length,
      meta: {
        startDate: startDateStr,
        endDate: endDateStr,
      },
    });
  } catch (error) {
    console.error("[API] Failed to fetch calendar events:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch calendar events",
      },
      { status: 500 }
    );
  }
}
