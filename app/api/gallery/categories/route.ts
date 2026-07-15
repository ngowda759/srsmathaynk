/**
 * Gallery Categories API Route
 * GET    /api/gallery/categories - List categories
 * POST   /api/gallery/categories - Create category
 */

import { NextRequest, NextResponse } from "next/server";
import { galleryService } from "@/services/gallery.service";
import { GalleryCategoryRequest } from "@/types/gallery";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const categories = await galleryService.getCategories(activeOnly);

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("[API] Failed to fetch categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GalleryCategoryRequest = await request.json();

    // Validation
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    const category = await galleryService.createCategory(body);

    return NextResponse.json(
      { success: true, data: category, message: "Category created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Failed to create category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}
