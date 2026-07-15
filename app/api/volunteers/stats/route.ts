/**
 * Volunteer Statistics API Route
 * GET /api/volunteers/stats - Get volunteer statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { getVolunteerStatistics } from "@/services/volunteer.service";

// GET /api/volunteers/stats
export async function GET(request: NextRequest) {
  try {
    const stats = await getVolunteerStatistics();

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("[API] Failed to fetch volunteer stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
