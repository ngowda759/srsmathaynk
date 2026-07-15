/**
 * Document Categories API Route
 * GET    /api/documents/categories - List categories
 * POST   /api/documents/categories - Create category
 */

import { NextRequest, NextResponse } from "next/server";
import { documentService } from "@/services/document.service";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameKn: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().optional(),
  active: z.boolean().optional(),
});

// GET /api/documents/categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const options: {
      active?: boolean;
    } = {};

    if (searchParams.get("active")) {
      options.active = searchParams.get("active") === "true";
    }

    const result = await documentService.getCategories(options);

    console.log(`[API] Fetched ${result.total} document categories`);

    return NextResponse.json({
      success: true,
      data: result.categories,
      total: result.total,
    });
  } catch (error) {
    console.error("[API] Failed to fetch categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/documents/categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = createCategorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const id = await documentService.createCategory(validation.data);

    console.log(`[API] Category created: ${id}`);

    return NextResponse.json(
      { success: true, data: { id }, message: "Category created successfully" },
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
