/**
 * Knowledge Base Articles API Route
 * GET    /api/knowledge - List articles
 * POST   /api/knowledge - Create article
 */

import { NextRequest, NextResponse } from "next/server";
import { knowledgeService } from "@/services/knowledge.service";
import { z } from "zod";

const createArticleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleKn: z.string().optional(),
  slug: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  contentKn: z.string().optional(),
  excerpt: z.string().optional(),
  excerptKn: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  authorId: z.string().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  tagIds: z.array(z.string()).optional(),
});

// GET /api/knowledge
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const options: {
      categoryId?: string;
      published?: boolean;
      featured?: boolean;
      search?: string;
      limit?: number;
    } = {};

    if (searchParams.get("categoryId")) {
      options.categoryId = searchParams.get("categoryId")!;
    }
    if (searchParams.get("published")) {
      options.published = searchParams.get("published") === "true";
    }
    if (searchParams.get("featured")) {
      options.featured = searchParams.get("featured") === "true";
    }
    if (searchParams.get("search")) {
      options.search = searchParams.get("search")!;
    }
    if (searchParams.get("limit")) {
      options.limit = parseInt(searchParams.get("limit")!);
    }

    const result = await knowledgeService.getArticles(options);

    console.log(`[API] Fetched ${result.total} knowledge articles`);

    return NextResponse.json({
      success: true,
      data: result.articles,
      total: result.total,
    });
  } catch (error) {
    console.error("[API] Failed to fetch articles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// POST /api/knowledge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = createArticleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const id = await knowledgeService.createArticle(validation.data);

    console.log(`[API] Article created: ${id}`);

    return NextResponse.json(
      { success: true, data: { id }, message: "Article created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Failed to create article:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create article" },
      { status: 500 }
    );
  }
}
