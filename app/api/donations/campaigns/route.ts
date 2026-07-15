/**
 * Donation Campaigns API Route
 * GET    /api/donations/campaigns - List campaigns
 * POST   /api/donations/campaigns - Create campaign
 */

import { NextRequest, NextResponse } from "next/server";
import { donationService } from "@/services/donation.service";
import { DonationCampaignRequest } from "@/types/donation";

// GET /api/donations/campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const options: {
      active?: boolean;
      featured?: boolean;
      category?: string;
      limit?: number;
    } = {};

    if (searchParams.get("active")) {
      options.active = searchParams.get("active") === "true";
    }
    if (searchParams.get("featured")) {
      options.featured = searchParams.get("featured") === "true";
    }
    if (searchParams.get("category")) {
      options.category = searchParams.get("category")!;
    }
    if (searchParams.get("limit")) {
      options.limit = parseInt(searchParams.get("limit")!);
    }

    const result = await donationService.getCampaigns(options);

    return NextResponse.json({
      success: true,
      data: result.campaigns,
      total: result.total,
    });
  } catch (error) {
    console.error("[API] Failed to fetch campaigns:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

// POST /api/donations/campaigns
export async function POST(request: NextRequest) {
  try {
    const body: DonationCampaignRequest = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Campaign title is required" },
        { status: 400 }
      );
    }

    const id = await donationService.createCampaign(body);

    return NextResponse.json(
      { success: true, data: { id }, message: "Campaign created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Failed to create campaign:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
