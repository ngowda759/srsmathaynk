/**
 * Donation Receipts API Route
 * POST /api/donations/receipts - Generate receipt for donation
 */

import { NextRequest, NextResponse } from "next/server";
import { donationService } from "@/services/donation.service";

// POST /api/donations/receipts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { donationId } = body;

    if (!donationId) {
      return NextResponse.json(
        { success: false, error: "Donation ID is required" },
        { status: 400 }
      );
    }

    const donation = await donationService.getDonationById(donationId);
    if (!donation) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    // Generate receipt number
    const receiptNumber = await donationService.generateReceiptNumber();
    
    // Update donation with receipt number and mark as completed
    await donationService.updateDonation(donationId, {
      receiptNumber,
      status: "COMPLETED",
    });

    return NextResponse.json({
      success: true,
      data: { receiptNumber },
      message: "Receipt generated successfully",
    });
  } catch (error) {
    console.error("[API] Failed to generate receipt:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate receipt" },
      { status: 500 }
    );
  }
}
