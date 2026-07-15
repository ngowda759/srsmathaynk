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

// POST /api/donations/campaigns/[id]/toggle-active
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await (await getdonationService()).toggleActiveCampaign(id);
    return NextResponse.json({ success: true, message: "Campaign active status updated" });
  } catch (error) {
    console.error("[API] Failed to toggle active:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}
