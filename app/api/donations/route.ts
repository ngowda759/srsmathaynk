/**
 * Donations API Route
 * GET    /api/donations - List donations
 * POST   /api/donations - Create donation
 */

import { NextRequest, NextResponse } from "next/server";
import { donationService } from "@/services/donation.service";
import { DonationRequest } from "@/types/donation";

// GET /api/donations - List donations with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const options: {
      campaignId?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {};

    if (searchParams.get("campaignId")) {
      options.campaignId = searchParams.get("campaignId")!;
    }
    if (searchParams.get("status")) {
      options.status = searchParams.get("status")!;
    }
    if (searchParams.get("startDate")) {
      options.startDate = new Date(searchParams.get("startDate")!);
    }
    if (searchParams.get("endDate")) {
      options.endDate = new Date(searchParams.get("endDate")!);
    }
    if (searchParams.get("limit")) {
      options.limit = parseInt(searchParams.get("limit")!);
    }
    if (searchParams.get("offset")) {
      options.offset = parseInt(searchParams.get("offset")!);
    }

    const result = await donationService.getDonations(options);

    return NextResponse.json({
      success: true,
      data: result.donations,
      total: result.total,
    });
  } catch (error) {
    console.error("[API] Failed to fetch donations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}

// POST /api/donations - Create a new donation
export async function POST(request: NextRequest) {
  try {
    const body: DonationRequest = await request.json();

    // Validation
    if (!body.donorName || !body.donorEmail || !body.amount) {
      return NextResponse.json(
        { success: false, error: "Donor name, email, and amount are required" },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    const id = await donationService.createDonation(body);

    return NextResponse.json(
      { success: true, data: { id }, message: "Donation created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Failed to create donation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create donation" },
      { status: 500 }
    );
  }
}
