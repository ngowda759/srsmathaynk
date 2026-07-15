/**
 * Knowledge Tags API Route
 * GET    /api/knowledge/tags - List tags
 * POST   /api/knowledge/tags - Create tag
 */

import { NextRequest, NextResponse } from "next/server";
import { knowledgeService } from "@/services/knowledge.service";
import { z } from "zod";

const createTagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
});

// GET /api/knowledge/tags
export async function GET(request: NextRequest) {
  try {
    const tags = await knowledgeService.getTags();

    console.log(`[API] Fetched ${tags.length} tags`);

    return NextResponse.json({
      success: true,
      data: tags,
      total: tags.length,
    });
  } catch (error) {
    console.error("[API] Failed to fetch tags:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

// POST /api/knowledge/tags
// Also supports auto-creating tags via getOrCreate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = createTagSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Use getOrCreate to handle duplicates gracefully
    const id = await knowledgeService.getOrCreateTag(validation.data.name);

    console.log(`[API] Tag created/get: ${id} - ${validation.data.name}`);

    return NextResponse.json(
      { success: true, data: { id }, message: "Tag created or found" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Failed to create tag:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
