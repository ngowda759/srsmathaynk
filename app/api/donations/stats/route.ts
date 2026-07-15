/**
 * Donation Statistics API Route
 * GET /api/donations/stats - Get donation statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { donationService } from "@/services/donation.service";

// GET /api/donations/stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const options: {
      startDate?: Date;
      endDate?: Date;
      campaignId?: string;
    } = {};

    if (searchParams.get("startDate")) {
      options.startDate = new Date(searchParams.get("startDate")!);
    }
    if (searchParams.get("endDate")) {
      options.endDate = new Date(searchParams.get("endDate")!);
    }
    if (searchParams.get("campaignId")) {
      options.campaignId = searchParams.get("campaignId")!;
    }

    const stats = await donationService.getStatistics(options);

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("[API] Failed to fetch stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
