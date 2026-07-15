/**
 * Gallery Item Actions API Route
 * POST /api/gallery/items/[id]/actions - Perform actions (toggle featured, showOnHome)
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
        result = await (await getgalleryService()).toggleItemFeatured(id);
        return NextResponse.json({
          success: true,
          data: result,
          message: `Item ${result.featured ? "featured" : "unfeatured"} successfully`,
        });

      case "toggleShowOnHome":
        result = await (await getgalleryService()).toggleItemShowOnHome(id);
        return NextResponse.json({
          success: true,
          data: result,
          message: `Item ${result.showOnHome ? "shown on home" : "hidden from home"} successfully`,
        });

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[API] Item action failed:", error);
    return NextResponse.json(
      { success: false, error: "Action failed" },
      { status: 500 }
    );
  }
}
