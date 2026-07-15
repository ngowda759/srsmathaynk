/**
 * Gallery Album by ID API Route
 * GET    /api/gallery/albums/[id] - Get album
 * PATCH  /api/gallery/albums/[id] - Update album
 * DELETE /api/gallery/albums/[id] - Delete album
 */

import { NextRequest, NextResponse } from "next/server";
import { galleryService } from "@/services/gallery.service";
import { GalleryAlbumRequest } from "@/types/gallery";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const album = await galleryService.getAlbum(id);

    if (!album) {
      return NextResponse.json(
        { success: false, error: "Album not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: album });
  } catch (error) {
    console.error("[API] Failed to fetch album:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch album" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: Partial<GalleryAlbumRequest> = await request.json();

    const album = await galleryService.updateAlbum(id, body);

    return NextResponse.json({
      success: true,
      data: album,
      message: "Album updated successfully",
    });
  } catch (error) {
    console.error("[API] Failed to update album:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update album" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await galleryService.deleteAlbum(id);

    return NextResponse.json({
      success: true,
      message: "Album deleted successfully",
    });
  } catch (error) {
    console.error("[API] Failed to delete album:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete album" },
      { status: 500 }
    );
  }
}
