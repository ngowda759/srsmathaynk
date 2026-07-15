/**
 * Single Knowledge Category API Route
 * GET    /api/knowledge/categories/[id] - Get category
 * PATCH  /api/knowledge/categories/[id] - Update category
 * DELETE /api/knowledge/categories/[id] - Delete category
 */

import { NextRequest, NextResponse } from "next/server";
import { knowledgeService } from "@/services/knowledge.service";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  nameKn: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().optional(),
  active: z.boolean().optional(),
});

// GET /api/knowledge/categories/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const category = await knowledgeService.getCategoryById(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("[API] Failed to fetch category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PATCH /api/knowledge/categories/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = updateCategorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const existing = await knowledgeService.getCategoryById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    await knowledgeService.updateCategory(id, validation.data);

    console.log(`[API] Category updated: ${id}`);

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("[API] Failed to update category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/knowledge/categories/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await knowledgeService.getCategoryById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    await knowledgeService.deleteCategory(id);

    console.log(`[API] Category deleted: ${id}`);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("[API] Failed to delete category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
