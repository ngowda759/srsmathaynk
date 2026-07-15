/**
 * Document Statistics API Route
 * GET /api/documents/stats - Get document statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { documentService } from "@/services/document.service";

// GET /api/documents/stats
export async function GET(request: NextRequest) {
  try {
    const stats = await documentService.getStatistics();

    console.log(`[API] Document stats fetched: ${stats.totalDocuments} documents, ${stats.totalDownloads} downloads`);

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("[API] Failed to fetch document stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
