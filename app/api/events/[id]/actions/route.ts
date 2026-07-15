/**
 * Event Actions API Route
 * POST /api/events/[id]/actions - Perform actions on an event
 * Actions: toggleFeatured, togglePublished
 */

import { NextRequest, NextResponse } from "next/server";
import { eventService } from "@/services/event.service";

interface Props {
  params: Promise<{ id: string }>;
}

interface ActionBody {
  action: "toggleFeatured" | "togglePublished" | "incrementAttendees" | "decrementAttendees";
}

// POST /api/events/[id]/actions - Perform action on event
export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body: ActionBody = await request.json();

    // Check if event exists
    const existingEvent = await eventService.getEvent(id);

    if (!existingEvent) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404 }
      );
    }

    let result;
    let message;

    switch (body.action) {
      case "toggleFeatured":
        result = await eventService.toggleFeatured(id);
        message = result.featured
          ? "Event marked as featured"
          : "Event removed from featured";
        break;

      case "togglePublished":
        result = await eventService.togglePublished(id);
        message = result.published
          ? "Event published"
          : "Event unpublished";
        break;

      case "incrementAttendees":
        await eventService.updateAttendeeCount(id, true);
        result = await eventService.getEvent(id);
        message = "Attendee count incremented";
        break;

      case "decrementAttendees":
        await eventService.updateAttendeeCount(id, false);
        result = await eventService.getEvent(id);
        message = "Attendee count decremented";
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Invalid action: ${body.action}`,
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message,
    });
  } catch (error) {
    console.error("[API] Failed to perform action:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to perform action",
      },
      { status: 500 }
    );
  }
}
