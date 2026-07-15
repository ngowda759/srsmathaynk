import { NextRequest, NextResponse } from "next/server";
import { reportService } from "@/services/report.service";

// GET /api/reports
export async function GET(request: NextRequest) {
  try {
    const summary = await reportService.getSummary();
    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error("[API] Failed to fetch reports:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
