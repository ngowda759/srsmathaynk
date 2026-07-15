/**
 * Knowledge Statistics API Route
 * GET /api/knowledge/stats - Get knowledge base statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { knowledgeService } from "@/services/knowledge.service";

// GET /api/knowledge/stats
export async function GET(request: NextRequest) {
  try {
    const stats = await knowledgeService.getStatistics();

    console.log(`[API] Knowledge stats: ${stats.totalArticles} articles, ${stats.totalViews} views`);

    return NextResponse.json({
      success: true,
      data: stats,
      meta: {
        forAI: true,
        categories: stats.totalCategories,
        publishedContent: stats.publishedArticles,
      },
    });
  } catch (error) {
    console.error("[API] Failed to fetch knowledge stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
