/**
 * Gallery Album Actions API Route
 * POST /api/gallery/albums/[id]/actions - Perform actions (toggle featured, publish, reorder)
 */

import { NextRequest, NextResponse } from "next/server";


export const dynamic = "force-dynamic";

// Lazy load service to prevent Prisma initialization at build time
async function getgalleryService() {
  const { galleryService } = await import("@/services/gallery.service");
  return galleryService;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    let result;

    switch (action) {
      case "toggleFeatured":
        result = await (await getgalleryService()).toggleAlbumFeatured(id);
        return NextResponse.json({
          success: true,
          data: result,
          message: `Album ${result.featured ? "featured" : "unfeatured"} successfully`,
        });

      case "togglePublished":
        result = await (await getgalleryService()).toggleAlbumPublished(id);
        return NextResponse.json({
          success: true,
          data: result,
          message: `Album ${result.published ? "published" : "unpublished"} successfully`,
        });

      case "reorderItems": {
        const { itemIds } = body;
        if (!Array.isArray(itemIds)) {
          return NextResponse.json(
            { success: false, error: "itemIds must be an array" },
            { status: 400 }
          );
        }
        await (await getgalleryService()).reorderAlbumItems(id, itemIds);
        return NextResponse.json({
          success: true,
          message: "Album items reordered successfully",
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[API] Album action failed:", error);
    return NextResponse.json(
      { success: false, error: "Action failed" },
      { status: 500 }
    );
  }
}
