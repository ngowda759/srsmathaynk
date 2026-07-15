/**
 * Single Campaign API Route
 * GET    /api/donations/campaigns/[id] - Get campaign
 * PATCH  /api/donations/campaigns/[id] - Update campaign
 * DELETE /api/donations/campaigns/[id] - Delete campaign
 */

import { NextRequest, NextResponse } from "next/server";
import { DonationCampaignRequest } from "@/types/donation";

export const dynamic = "force-dynamic";

// Lazy load service to prevent Prisma initialization at build time
async function getdonationService() {
  const { donationService } = await import("@/services/donation.service");
  return donationService;
}


interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/donations/campaigns/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const campaign = await (await getdonationService()).getCampaignById(id);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: campaign });
  } catch (error) {
    console.error("[API] Failed to fetch campaign:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

// PATCH /api/donations/campaigns/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: Partial<DonationCampaignRequest> = await request.json();

    const existing = await (await getdonationService()).getCampaignById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    await (await getdonationService()).updateCampaign(id, body);

    return NextResponse.json({
      success: true,
      message: "Campaign updated successfully",
    });
  } catch (error) {
    console.error("[API] Failed to update campaign:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

// DELETE /api/donations/campaigns/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await (await getdonationService()).getCampaignById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    await (await getdonationService()).deleteCampaign(id);

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("[API] Failed to delete campaign:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
