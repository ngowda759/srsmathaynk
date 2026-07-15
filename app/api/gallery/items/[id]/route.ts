/**
 * Gallery Item by ID API Route
 * GET    /api/gallery/items/[id] - Get item
 * PATCH  /api/gallery/items/[id] - Update item
 * DELETE /api/gallery/items/[id] - Delete item
 */

import { NextRequest, NextResponse } from "next/server";
import { galleryService } from "@/services/gallery.service";
import { GalleryItemRequest } from "@/types/gallery";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const item = await galleryService.getItem(id);

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("[API] Failed to fetch item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: Partial<GalleryItemRequest> = await request.json();

    const item = await galleryService.updateItem(id, body);

    return NextResponse.json({
      success: true,
      data: item,
      message: "Item updated successfully",
    });
  } catch (error) {
    console.error("[API] Failed to update item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await galleryService.deleteItem(id);

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("[API] Failed to delete item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
