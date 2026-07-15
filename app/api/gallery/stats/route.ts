/**
 * Gallery Stats API Route
 * GET /api/gallery/stats - Get gallery statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { galleryService } from "@/services/gallery.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get("albumId");

    let stats;

    if (albumId) {
      stats = await galleryService.getAlbumStats(albumId);
    } else {
      stats = await galleryService.getStats();
    }

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("[API] Failed to fetch stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
