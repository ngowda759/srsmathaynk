/**
 * Chat Feedback API
 * POST /api/chat/feedback - Submit feedback
 * GET /api/chat/feedback - Get feedback stats
 */

import { NextRequest, NextResponse } from "next/server";
import { chatSessionService } from "@/services/chat-session.service";
import { checkRateLimit } from "@/lib/ai/security";

export const dynamic = "force-dynamic";

// POST /api/chat/feedback
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    
    // Rate limit check
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await request.json();
    const { sessionId, messageId, isHelpful, rating, comment, userQuery, aiResponse, userId } = body;

    if (!sessionId || isHelpful === undefined) {
      return NextResponse.json(
        { error: "sessionId and isHelpful are required" },
        { status: 400 }
      );
    }

    const feedbackId = await chatSessionService.submitFeedback({
      sessionId,
      messageId,
      isHelpful,
      rating,
      comment,
      userQuery,
      aiResponse,
      userId,
    });

    return NextResponse.json({ feedbackId }, { status: 201 });
  } catch (error) {
    console.error("[Feedback API] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

// GET /api/chat/feedback
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    
    // Rate limit check
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId") || undefined;

    const stats = await chatSessionService.getFeedbackStats(sessionId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[Feedback API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback stats" },
      { status: 500 }
    );
  }
}
