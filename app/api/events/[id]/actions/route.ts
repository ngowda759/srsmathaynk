/**
 * Event Actions API Route
 * POST /api/events/[id]/actions - Perform actions on an event
 * Actions: toggleFeatured, togglePublished
 */

import { NextRequest, NextResponse } from "next/server";


export const dynamic = "force-dynamic";

// Lazy load service to prevent Prisma initialization at build time
async function geteventService() {
  const { eventService } = await import("@/services/event.service");
  return eventService;
}

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

    let result;
    let message;

    switch (body.action) {
      case "toggleFeatured":
        result = await (await geteventService()).toggleFeatured(id);
        message = result.featured
          ? "Event marked as featured"
          : "Event removed from featured";
        break;

      case "togglePublished":
        result = await (await geteventService()).togglePublished(id);
        message = result.published
          ? "Event published"
          : "Event unpublished";
        break;

      case "incrementAttendees":
        await (await geteventService()).updateAttendeeCount(id, true);
        result = await (await geteventService()).getEvent(id);
        message = "Attendee count incremented";
        break;

      case "decrementAttendees":
        await (await geteventService()).updateAttendeeCount(id, false);
        result = await (await geteventService()).getEvent(id);
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
