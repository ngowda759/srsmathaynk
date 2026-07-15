import { NextRequest, NextResponse } from "next/server";
import { donationService } from "@/services/donation.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/donations/campaigns/[id]/toggle-featured
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await donationService.toggleFeaturedCampaign(id);
    return NextResponse.json({ success: true, message: "Campaign featured status updated" });
  } catch (error) {
    console.error("[API] Failed to toggle featured:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}
