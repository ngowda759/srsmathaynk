/**
 * Single Donation API Route
 * GET    /api/donations/[id] - Get donation
 * PATCH  /api/donations/[id] - Update donation
 * DELETE /api/donations/[id] - Delete donation
 */

import { NextRequest, NextResponse } from "next/server";
import { donationService } from "@/services/donation.service";
import { DonationRequest } from "@/types/donation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/donations/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const donation = await donationService.getDonationById(id);

    if (!donation) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: donation });
  } catch (error) {
    console.error("[API] Failed to fetch donation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch donation" },
      { status: 500 }
    );
  }
}

// PATCH /api/donations/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: Partial<DonationRequest & { status?: string }> = await request.json();

    const existing = await donationService.getDonationById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    await donationService.updateDonation(id, body);

    return NextResponse.json({
      success: true,
      message: "Donation updated successfully",
    });
  } catch (error) {
    console.error("[API] Failed to update donation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update donation" },
      { status: 500 }
    );
  }
}

// DELETE /api/donations/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await donationService.getDonationById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    await donationService.deleteDonation(id);

    return NextResponse.json({
      success: true,
      message: "Donation deleted successfully",
    });
  } catch (error) {
    console.error("[API] Failed to delete donation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete donation" },
      { status: 500 }
    );
  }
}
