/**
 * Event Stats API Route
 * GET /api/events/stats - Get event statistics
 */

import { NextResponse } from "next/server";
import { eventService } from "@/services/event.service";

// GET /api/events/stats - Get event statistics
export async function GET() {
  try {
    const stats = await eventService.getStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("[API] Failed to fetch event stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch event statistics",
      },
      { status: 500 }
    );
  }
}
