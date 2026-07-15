/**
 * Gallery Albums API Route
 * GET    /api/gallery/albums - List albums
 * POST   /api/gallery/albums - Create album
 */

import { NextRequest, NextResponse } from "next/server";
import { galleryService } from "@/services/gallery.service";
import { GalleryAlbumQuery, GalleryAlbumRequest } from "@/types/gallery";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: GalleryAlbumQuery = {};

    // Parse query parameters
    if (searchParams.get("status")) {
      query.status = searchParams.get("status") as GalleryAlbumQuery["status"];
    }
    if (searchParams.get("categoryId")) {
      query.categoryId = searchParams.get("categoryId") || undefined;
    }
    if (searchParams.get("festivalId")) {
      query.festivalId = searchParams.get("festivalId") || undefined;
    }
    if (searchParams.get("featured")) {
      query.featured = searchParams.get("featured") === "true";
    }
    if (searchParams.get("published")) {
      query.published = searchParams.get("published") === "true";
    }
    if (searchParams.get("year")) {
      query.year = parseInt(searchParams.get("year") || "");
    }
    if (searchParams.get("search")) {
      query.search = searchParams.get("search") || undefined;
    }
    if (searchParams.get("page")) {
      query.page = parseInt(searchParams.get("page") || "1");
    }
    if (searchParams.get("limit")) {
      query.limit = parseInt(searchParams.get("limit") || "20");
    }
    if (searchParams.get("sortBy")) {
      query.sortBy = searchParams.get("sortBy") as GalleryAlbumQuery["sortBy"];
    }
    if (searchParams.get("sortOrder")) {
      query.sortOrder = searchParams.get("sortOrder") as "asc" | "desc";
    }

    const albums = await galleryService.getAlbums(query);

    return NextResponse.json({
      success: true,
      data: albums,
      count: albums.length,
    });
  } catch (error) {
    console.error("[API] Failed to fetch albums:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GalleryAlbumRequest = await request.json();

    // Validation
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    const album = await galleryService.createAlbum(body);

    return NextResponse.json(
      { success: true, data: album, message: "Album created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Failed to create album:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create album" },
      { status: 500 }
    );
  }
}
