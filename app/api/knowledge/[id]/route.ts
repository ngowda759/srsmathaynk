/**
 * Single Knowledge Article API Route
 * GET    /api/knowledge/[id] - Get article
 * PATCH  /api/knowledge/[id] - Update article
 * DELETE /api/knowledge/[id] - Delete article
 * POST   /api/knowledge/[id] - Actions (publish, feature toggle)
 */

import { NextRequest, NextResponse } from "next/server";
import { knowledgeService } from "@/services/knowledge.service";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateArticleSchema = z.object({
  title: z.string().min(1).optional(),
  titleKn: z.string().optional(),
  slug: z.string().optional(),
  content: z.string().optional(),
  contentKn: z.string().optional(),
  excerpt: z.string().optional(),
  excerptKn: z.string().optional(),
  categoryId: z.string().optional(),
  authorId: z.string().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  tagIds: z.array(z.string()).optional(),
});

// GET /api/knowledge/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const article = await knowledgeService.getArticleById(id);

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    // Return SEO metadata alongside content
    const seoMetadata = {
      title: article.title,
      description: article.excerpt || article.content.substring(0, 160),
      keywords: article.tags?.map((t) => t.name).join(", ") || "",
      ogTitle: article.title,
      ogDescription: article.excerpt || "",
      canonicalUrl: `/knowledge/${article.slug}`,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...article,
        seo: seoMetadata,
      },
    });
  } catch (error) {
    console.error("[API] Failed to fetch article:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

// PATCH /api/knowledge/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = updateArticleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const existing = await knowledgeService.getArticleById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    await knowledgeService.updateArticle(id, validation.data);

    console.log(`[API] Article updated: ${id}`);

    return NextResponse.json({
      success: true,
      message: "Article updated successfully",
    });
  } catch (error) {
    console.error("[API] Failed to update article:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE /api/knowledge/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await knowledgeService.getArticleById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    await knowledgeService.deleteArticle(id);

    console.log(`[API] Article deleted: ${id}`);

    return NextResponse.json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("[API] Failed to delete article:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete article" },
      { status: 500 }
    );
  }
}

// POST /api/knowledge/[id] - Actions
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, ...actionData } = body;

    const article = await knowledgeService.getArticleById(id);
    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    switch (action) {
      case "toggleFeatured":
        const isFeatured = await knowledgeService.toggleFeatured(id);
        console.log(`[API] Article featured toggled: ${id}, now featured: ${isFeatured}`);
        return NextResponse.json({
          success: true,
          data: { featured: isFeatured },
          message: isFeatured ? "Article featured" : "Article unfeatured",
        });

      case "togglePublished":
        const isPublished = await knowledgeService.togglePublished(id);
        console.log(`[API] Article published toggled: ${id}, now published: ${isPublished}`);
        return NextResponse.json({
          success: true,
          data: { published: isPublished },
          message: isPublished ? "Article published" : "Article unpublished",
        });

      case "view":
        // Track view (idempotent - already done in GET, but can be called explicitly)
        await knowledgeService.incrementViewCount(id);
        console.log(`[API] Article view recorded: ${id}`);
        return NextResponse.json({
          success: true,
          message: "View recorded",
        });

      case "helpful":
        // Record if user found article helpful
        const helpful = actionData.helpful !== false;
        await knowledgeService.recordHelpful(id, helpful);
        console.log(`[API] Article feedback: ${id}, helpful: ${helpful}`);
        return NextResponse.json({
          success: true,
          message: helpful ? "Thank you for your feedback!" : "Sorry this wasn't helpful",
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[API] Failed to perform article action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform action" },
      { status: 500 }
    );
  }
}
