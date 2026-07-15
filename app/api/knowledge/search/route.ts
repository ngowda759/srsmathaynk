/**
 * Knowledge Search API Route - Optimized for Raya AI
 * GET /api/knowledge/search - Search articles with filters
 * 
 * Features:
 * - Text search with relevance scoring
 * - Category filtering
 * - Tag filtering
 * - Keyword matching
 * - Kannada content support
 * - Published/draft filtering
 * - Cached responses for performance
 */

import { NextRequest, NextResponse } from "next/server";
import { knowledgeService } from "@/services/knowledge.service";

// Cache for 5 minutes (300 seconds) - shorter for search
const CACHE_MAX_AGE = 300;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const categoryId = searchParams.get("categoryId");
    const tagIds = searchParams.get("tags")?.split(",").filter(Boolean) || [];
    const keywords = searchParams.get("keywords")?.split(",").filter(Boolean) || [];
    const includeKn = searchParams.get("lang") === "kn" || searchParams.get("lang") === "all";
    const publishedOnly = searchParams.get("published") !== "false"; // Default to true
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100); // Max 100
    const offset = parseInt(searchParams.get("offset") || "0");

    // Require at least one filter
    if (!query && !categoryId && tagIds.length === 0 && keywords.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one filter required: q, categoryId, tags, or keywords" },
        { status: 400 }
      );
    }

    // Build search query from all inputs
    const searchQuery = query || keywords.join(" ") || categoryId || "";

    const results = await knowledgeService.searchAdvanced({
      query: searchQuery,
      categoryId: categoryId || undefined,
      tagIds,
      keywords,
      publishedOnly,
      limit,
      offset,
    });

    // Format for AI retrieval - structured, clean data
    const aiReadyResults = results.articles.map((article, index) => ({
      // Relevance score based on position and view count
      relevanceScore: Math.max(0, (results.total - index) / results.total + article.viewCount / 1000),
      id: article.id,
      // Primary content (Kannada or English)
      title: includeKn && article.titleKn ? article.titleKn : article.title,
      titleKn: article.titleKn,
      titleEn: article.title,
      slug: article.slug,
      // Snippet for quick display
      snippet: article.content.substring(0, 200) + (article.content.length > 200 ? "..." : ""),
      // Full content
      content: article.content,
      contentKn: article.contentKn,
      // Metadata
      excerpt: article.excerpt,
      category: article.category?.name || null,
      categoryId: article.categoryId,
      categorySlug: article.category?.slug || null,
      tags: article.tags?.map((t) => t.name) || [],
      tagIds: article.tags?.map((t) => t.id) || [],
      // Engagement metrics
      viewCount: article.viewCount,
      published: article.published,
      featured: article.featured,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    }));

    // Sort by relevance score
    aiReadyResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    console.log(`[API] Knowledge search: "${searchQuery}" returned ${results.total} results`);

    const response = NextResponse.json({
      success: true,
      data: {
        results: aiReadyResults,
        total: results.total,
        query: searchQuery,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < results.total,
        },
      },
      meta: {
        searchable: true,
        aiReady: true,
        version: "1.0",
        availableCategories: [
          { id: "temple-history", name: "Temple History", slug: "temple-history" },
          { id: "guru-parampara", name: "Guru Parampara", slug: "guru-parampara" },
          { id: "rayaru", name: "Rayaru (Swami Raghavendra)", slug: "rayaru" },
          { id: "madhwa-philosophy", name: "Madhwa Philosophy", slug: "madhwa-philosophy" },
          { id: "aaradhanes", name: "Aaradhanes", slug: "aaradhanes" },
          { id: "panchanga", name: "Panchanga", slug: "panchanga" },
          { id: "sevas", name: "Sevas", slug: "sevas" },
          { id: "festivals", name: "Festivals", slug: "festivals" },
          { id: "slokas", name: "Slokas & Stothras", slug: "slokas" },
          { id: "daily-rituals", name: "Daily Rituals", slug: "daily-rituals" },
          { id: "faqs", name: "FAQs", slug: "faqs" },
        ],
        filters: {
          categoryId: !!categoryId,
          tags: tagIds.length > 0,
          keywords: keywords.length > 0,
          kannada: includeKn,
          publishedOnly,
        },
      },
    });

    // Add cache headers for performance
    response.headers.set("Cache-Control", `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=60`);

    return response;
  } catch (error) {
    console.error("[API] Failed to search knowledge:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search knowledge" },
      { status: 500 }
    );
  }
}
