/**
 * Gallery Items API Route
 * GET    /api/gallery/items - List items
 * POST   /api/gallery/items - Create item
 */

import { NextRequest, NextResponse } from "next/server";
import { GalleryItemQuery, GalleryItemRequest } from "@/types/gallery";


export const dynamic = "force-dynamic";

// Lazy load service to prevent Prisma initialization at build time
async function getgalleryService() {
  const { galleryService } = await import("@/services/gallery.service");
  return galleryService;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: GalleryItemQuery = {};

    if (searchParams.get("type")) {
      query.type = searchParams.get("type") as GalleryItemQuery["type"];
    }
    if (searchParams.get("featured")) {
      query.featured = searchParams.get("featured") === "true";
    }
    if (searchParams.get("showOnHome")) {
      query.showOnHome = searchParams.get("showOnHome") === "true";
    }
    if (searchParams.get("albumId")) {
      query.albumId = searchParams.get("albumId") || undefined;
    }
    if (searchParams.get("search")) {
      query.search = searchParams.get("search") || undefined;
    }
    if (searchParams.get("tags")) {
      query.tags = searchParams.get("tags")?.split(",") || undefined;
    }
    if (searchParams.get("page")) {
      query.page = parseInt(searchParams.get("page") || "1");
    }
    if (searchParams.get("limit")) {
      query.limit = parseInt(searchParams.get("limit") || "50");
    }

    const items = await (await getgalleryService()).getItems(query);

    return NextResponse.json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error) {
    console.error("[API] Failed to fetch items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GalleryItemRequest = await request.json();

    // Validation
    if (!body.mediaId) {
      return NextResponse.json(
        { success: false, error: "mediaId is required" },
        { status: 400 }
      );
    }

    const item = await (await getgalleryService()).createItem(body);

    return NextResponse.json(
      { success: true, data: item, message: "Item created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Failed to create item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create item" },
      { status: 500 }
    );
  }
}
