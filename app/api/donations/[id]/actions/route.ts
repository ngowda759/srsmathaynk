/**
 * Donation Actions API Route
 * POST /api/donations/[id]/actions - Perform actions on donation
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Lazy load service to prevent Prisma initialization at build time
async function getdonationService() {
  const { donationService } = await import("@/services/donation.service");
  return donationService;
}


interface RouteParams {
  params: Promise<{ id: string }>;
}

type ActionBody = {
  action: "updateStatus" | "generateReceipt" | "markCompleted" | "markFailed";
  data?: Record<string, unknown>;
};

// POST /api/donations/[id]/actions
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: ActionBody = await request.json();
    const { action, data } = body;

    switch (action) {
      case "updateStatus": {
        const status = data?.status as string;
        if (!status) {
          return NextResponse.json(
            { success: false, error: "Status is required" },
            { status: 400 }
          );
        }
        await (await getdonationService()).updateDonationStatus(id, status);
        return NextResponse.json({
          success: true,
          message: `Donation status updated to ${status}`,
        });
      }

      case "generateReceipt": {
        const donation = await (await getdonationService()).getDonationById(id);
        if (!donation) {
          return NextResponse.json(
            { success: false, error: "Donation not found" },
            { status: 404 }
          );
        }
        const receiptNumber = await (await getdonationService()).generateReceiptNumber();
        await (await getdonationService()).updateDonation(id, {
          receiptNumber,
          status: "COMPLETED",
        });
        return NextResponse.json({
          success: true,
          data: { receiptNumber },
          message: "Receipt generated successfully",
        });
      }

      case "markCompleted": {
        await (await getdonationService()).updateDonationStatus(id, "COMPLETED");
        const receiptNumber = await (await getdonationService()).generateReceiptNumber();
        await (await getdonationService()).updateDonation(id, { receiptNumber });
        return NextResponse.json({
          success: true,
          message: "Donation marked as completed",
        });
      }

      case "markFailed": {
        await (await getdonationService()).updateDonationStatus(id, "FAILED");
        return NextResponse.json({
          success: true,
          message: "Donation marked as failed",
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[API] Failed to perform action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform action" },
      { status: 500 }
    );
  }
}
