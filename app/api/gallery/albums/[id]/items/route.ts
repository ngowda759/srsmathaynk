/**
 * Gallery Album Items API Route
 * GET    /api/gallery/albums/[id]/items - Get items in album
 * POST   /api/gallery/albums/[id]/items - Add item to album
 * DELETE /api/gallery/albums/[id]/items - Remove item from album
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

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const result = await (await getgalleryService()).getAlbumWithItems(id, page, limit);

    return NextResponse.json({
      success: true,
      data: result.items,
      album: result.album,
      total: result.total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[API] Failed to fetch album items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch album items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { itemId, displayOrder } = body;

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "itemId is required" },
        { status: 400 }
      );
    }

    await (await getgalleryService()).addItemToAlbum(itemId, id, displayOrder || 0);

    return NextResponse.json({
      success: true,
      message: "Item added to album successfully",
    });
  } catch (error) {
    console.error("[API] Failed to add item to album:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add item to album" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "itemId is required" },
        { status: 400 }
      );
    }

    await (await getgalleryService()).removeItemFromAlbum(itemId, id);

    return NextResponse.json({
      success: true,
      message: "Item removed from album successfully",
    });
  } catch (error) {
    console.error("[API] Failed to remove item from album:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove item from album" },
      { status: 500 }
    );
  }
}
