/**
 * Chat Analytics API
 * GET /api/chat/analytics - Get AI analytics (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { chatSessionService } from "@/services/chat-session.service";
import { checkRateLimit } from "@/lib/ai/security";

export const dynamic = "force-dynamic";

// GET /api/chat/analytics
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    
    // Rate limit check
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Check admin authorization (in production, add proper auth check)
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    const analytics = await chatSessionService.getAnalytics({ startDate, endDate });

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("[Analytics API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
