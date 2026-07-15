/**
 * Events API Route - CRUD operations for temple events
 * GET    /api/events - List all events
 * POST   /api/events - Create a new event
 */

import { NextRequest, NextResponse } from "next/server";
import { EventQuery, EventRequest } from "@/types/event";


export const dynamic = "force-dynamic";

// Lazy load service to prevent Prisma initialization at build time
async function geteventService() {
  const { eventService } = await import("@/services/event.service");
  return eventService;
}

// GET /api/events - List all events with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: EventQuery = {};

    // Parse query parameters
    if (searchParams.get("status")) {
      query.status = searchParams.get("status") as EventQuery["status"];
    }
    if (searchParams.get("type")) {
      query.type = searchParams.get("type") as EventQuery["type"];
    }
    if (searchParams.get("featured")) {
      query.featured = searchParams.get("featured") === "true";
    }
    if (searchParams.get("published")) {
      query.published = searchParams.get("published") === "true";
    }
    if (searchParams.get("search")) {
      query.search = searchParams.get("search") || undefined;
    }
    if (searchParams.get("startDate")) {
      query.startDate = searchParams.get("startDate") || undefined;
    }
    if (searchParams.get("endDate")) {
      query.endDate = searchParams.get("endDate") || undefined;
    }
    if (searchParams.get("page")) {
      query.page = parseInt(searchParams.get("page") || "1");
    }
    if (searchParams.get("limit")) {
      query.limit = parseInt(searchParams.get("limit") || "50");
    }

    const events = await (await geteventService()).getEvents(query);

    return NextResponse.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error("[API] Failed to fetch events:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch events",
      },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const body: EventRequest = await request.json();

    // Basic validation
    if (!body.title || !body.startDate || !body.endDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, start date, and end date are required",
        },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date format",
        },
        { status: 400 }
      );
    }

    if (endDate < startDate) {
      return NextResponse.json(
        {
          success: false,
          error: "End date must be after start date",
        },
        { status: 400 }
      );
    }

    const event = await (await geteventService()).createEvent(body);

    return NextResponse.json(
      {
        success: true,
        data: event,
        message: "Event created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Failed to create event:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create event",
      },
      { status: 500 }
    );
  }
}
