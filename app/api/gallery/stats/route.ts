/**
 * Gallery Stats API Route
 * GET /api/gallery/stats - Get gallery statistics
 */

import { NextRequest, NextResponse } from "next/server";


export const dynamic = "force-dynamic";

// Lazy load service to prevent Prisma initialization at build time
async function getgalleryService() {
  const { galleryService } = await import("@/services/gallery.service");
  return galleryService;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get("albumId");

    let stats;

    if (albumId) {
      stats = await (await getgalleryService()).getAlbumStats(albumId);
    } else {
      stats = await (await getgalleryService()).getStats();
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
