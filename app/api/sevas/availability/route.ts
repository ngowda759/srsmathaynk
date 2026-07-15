/**
 * Availability API Route
 * GET /api/sevas/availability - Get availability for a seva
 */

import { NextRequest, NextResponse } from "next/server";
import { sevaService } from "@/services/seva.service";

// GET /api/sevas/availability?sevaId=xxx&startDate=xxx&endDate=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const sevaId = searchParams.get("sevaId");
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    if (!sevaId) {
      return NextResponse.json(
        { success: false, error: "sevaId is required" },
        { status: 400 }
      );
    }

    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    const endDate = endDateStr
      ? new Date(endDateStr)
      : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days default

    const availability = await sevaService.getAvailability(sevaId, startDate, endDate);

    return NextResponse.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("[API] Failed to fetch availability:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
