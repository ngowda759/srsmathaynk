/**
 * Event API Route - Individual event operations
 * GET    /api/events/[id] - Get a single event
 * PUT    /api/events/[id] - Update an event
 * DELETE /api/events/[id] - Delete an event
 */

import { NextRequest, NextResponse } from "next/server";
import { EventRequest } from "@/types/event";


export const dynamic = "force-dynamic";

// Lazy load service to prevent Prisma initialization at build time
async function geteventService() {
  const { eventService } = await import("@/services/event.service");
  return eventService;
}

interface Props {
  params: Promise<{ id: string }>;
}

// GET /api/events/[id] - Get a single event
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;

    const event = await (await geteventService()).getEvent(id);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("[API] Failed to fetch event:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch event",
      },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update an event
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body: Partial<EventRequest> = await request.json();

    // Check if event exists
    const existingEvent = await (await geteventService()).getEvent(id);

    if (!existingEvent) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404 }
      );
    }

    // Validate dates if provided
    if (body.startDate || body.endDate) {
      const startDate = body.startDate
        ? new Date(body.startDate)
        : existingEvent.startDate;
      const endDate = body.endDate
        ? new Date(body.endDate)
        : existingEvent.endDate;

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
    }

    const event = await (await geteventService()).updateEvent(id, body);

    return NextResponse.json({
      success: true,
      data: event,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("[API] Failed to update event:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update event",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete an event (soft delete)
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;

    // Check if event exists
    const existingEvent = await (await geteventService()).getEvent(id);

    if (!existingEvent) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404 }
      );
    }

    await (await geteventService()).deleteEvent(id);

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("[API] Failed to delete event:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete event",
      },
      { status: 500 }
    );
  }
}
