/**
 * Unknown Questions API
 * GET /api/chat/unknown-questions - List unknown questions (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { chatSessionService } from "@/services/chat-session.service";
import { checkRateLimit } from "@/lib/ai/security";

export const dynamic = "force-dynamic";

// GET /api/chat/unknown-questions
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
    const status = searchParams.get("status") || undefined;
    const language = searchParams.get("language") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const result = await chatSessionService.getUnknownQuestions({
      status,
      language,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Unknown Questions API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch unknown questions" },
      { status: 500 }
    );
  }
}
