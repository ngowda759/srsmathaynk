/**
 * Gallery Item Actions API Route
 * POST /api/gallery/items/[id]/actions - Perform actions (toggle featured, showOnHome)
 */

import { NextRequest, NextResponse } from "next/server";
import { galleryService } from "@/services/gallery.service";

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
        result = await galleryService.toggleItemFeatured(id);
        return NextResponse.json({
          success: true,
          data: result,
          message: `Item ${result.featured ? "featured" : "unfeatured"} successfully`,
        });

      case "toggleShowOnHome":
        result = await galleryService.toggleItemShowOnHome(id);
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
