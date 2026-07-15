/**
 * Donation Archive API Route
 * GET    /api/donations/archive - List archived donations
 * POST   /api/donations/archive - Archive/restore/permanent-delete donations
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Lazy load service to prevent Prisma initialization at build time
async function getdonationService() {
  const { donationService } = await import("@/services/donation.service");
  return donationService;
}


// GET /api/donations/archive - List archived donations
export async function GET() {
  try {
    const donations = await (await getdonationService()).getArchivedDonations();
    return NextResponse.json({ success: true, data: donations });
  } catch (error) {
    console.error("[API] Failed to fetch archived donations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch archived donations" },
      { status: 500 }
    );
  }
}

// POST /api/donations/archive - Archive/restore/permanent-delete donations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, action, id } = body;

    // Handle single permanent delete
    if (action === "permanent-delete" && id) {
      await (await getdonationService()).permanentDeleteDonation(id);
      return NextResponse.json({
        success: true,
        message: "Donation permanently deleted",
      });
    }

    // Handle bulk permanent delete
    if (action === "permanent-delete" && ids && Array.isArray(ids)) {
      for (const donationId of ids) {
        await (await getdonationService()).permanentDeleteDonation(donationId);
      }
      return NextResponse.json({
        success: true,
        message: `${ids.length} donation(s) permanently deleted`,
      });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "IDs array is required" },
        { status: 400 }
      );
    }

    if (action === "restore") {
      await (await getdonationService()).restoreDonations(ids);
      return NextResponse.json({
        success: true,
        message: `${ids.length} donation(s) restored successfully`,
      });
    } else {
      await (await getdonationService()).archiveDonations(ids);
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
