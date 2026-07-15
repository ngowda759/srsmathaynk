import { NextRequest, NextResponse } from "next/server";
import { donationService } from "@/services/donation.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/donations/[id]/permanent
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await donationService.permanentDeleteDonation(id);
    return NextResponse.json({ success: true, message: "Donation permanently deleted" });
  } catch (error) {
    console.error("[API] Failed to permanently delete donation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to permanently delete donation" },
      { status: 500 }
    );
  }
}
