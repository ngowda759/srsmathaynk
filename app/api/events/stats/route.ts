/**
 * Event Stats API Route
 * GET /api/events/stats - Get event statistics
 */

import { NextResponse } from "next/server";


export const dynamic = "force-dynamic";

// Lazy load service to prevent Prisma initialization at build time
async function geteventService() {
  const { eventService } = await import("@/services/event.service");
  return eventService;
}

// GET /api/events/stats - Get event statistics
export async function GET() {
  try {
    const stats = await (await geteventService()).getStats();

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
