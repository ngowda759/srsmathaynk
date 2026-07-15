/**
 * Statistics API Route
 * GET /api/sevas/stats - Get sevas statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { sevaService } from "@/services/seva.service";

// GET /api/sevas/stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const options: {
      startDate?: Date;
      endDate?: Date;
      sevaId?: string;
    } = {};

    if (searchParams.get("startDate")) {
      options.startDate = new Date(searchParams.get("startDate")!);
    }
    if (searchParams.get("endDate")) {
      options.endDate = new Date(searchParams.get("endDate")!);
    }
    if (searchParams.get("sevaId")) {
      options.sevaId = searchParams.get("sevaId")!;
    }

    const stats = await sevaService.getStatistics(options);

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("[API] Failed to fetch stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
