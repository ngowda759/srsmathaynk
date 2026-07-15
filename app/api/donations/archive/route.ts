/**
 * Donation Archive API Route
 * GET    /api/donations/archive - List archived donations
 * POST   /api/donations/archive - Archive donations
 */

import { NextRequest, NextResponse } from "next/server";
import { donationService } from "@/services/donation.service";

// GET /api/donations/archive - List archived donations
export async function GET() {
  try {
    const donations = await donationService.getArchivedDonations();
    return NextResponse.json({ success: true, data: donations });
  } catch (error) {
    console.error("[API] Failed to fetch archived donations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch archived donations" },
      { status: 500 }
    );
  }
}

// POST /api/donations/archive - Archive/restore donations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "IDs array is required" },
        { status: 400 }
      );
    }

    if (action === "restore") {
      await donationService.restoreDonations(ids);
      return NextResponse.json({
        success: true,
        message: `${ids.length} donation(s) restored successfully`,
      });
    } else {
      await donationService.archiveDonations(ids);
      return NextResponse.json({
        success: true,
        message: `${ids.length} donation(s) archived successfully`,
      });
    }
  } catch (error) {
    console.error("[API] Failed to archive donations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to archive donations" },
      { status: 500 }
    );
  }
}
