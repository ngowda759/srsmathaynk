/**
 * Knowledge Search API Route
 * GET /api/knowledge/search?q=query - Search articles
 * 
 * This endpoint is optimized for AI retrieval systems like Raya AI.
 * Returns structured data suitable for embedding and semantic search.
 */

import { NextRequest, NextResponse } from "next/server";
import { knowledgeService } from "@/services/knowledge.service";

// GET /api/knowledge/search?q=query&limit=20
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const results = await knowledgeService.search(query, limit);

    // Format for AI retrieval - structured, clean data
    const aiReadyResults = results.articles.map((article) => ({
      id: article.id,
      title: article.title,
      titleKn: article.titleKn,
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category?.name || null,
      categorySlug: article.category?.slug || null,
      tags: article.tags?.map((t) => t.name) || [],
      viewCount: article.viewCount,
      published: article.published,
      createdAt: article.createdAt,
      // Structured content for embedding
      content: {
        main: article.content.substring(0, 500), // First 500 chars
        full: article.content,
        kn: article.contentKn || null,
      },
    }));

    console.log(`[API] Knowledge search: "${query}" returned ${results.total} results`);

    return NextResponse.json({
      success: true,
      data: {
        results: aiReadyResults,
        total: results.total,
        query: results.query,
      },
      meta: {
        searchable: true,
        aiReady: true,
        categories: [
          "Temple History",
          "Guru Parampara",
          "Rayaru",
          "Madhwa Philosophy",
          "Aaradhanes",
          "Panchanga",
          "Sevas",
          "Festivals",
          "Slokas & Stothras",
          "Daily Rituals",
          "FAQs",
        ],
      },
    });
  } catch (error) {
    console.error("[API] Failed to search knowledge:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search knowledge" },
      { status: 500 }
    );
  }
}
