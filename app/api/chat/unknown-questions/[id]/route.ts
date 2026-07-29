/**
 * Unknown Question Detail API
 * PATCH /api/chat/unknown-questions/[id] - Update question status (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { chatSessionService } from "@/services/chat-session.service";
import { checkRateLimit } from "@/lib/ai/security";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/chat/unknown-questions/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const body = await request.json();
    const { status, reviewedBy, suggestedAnswer } = body;

    if (!status) {
      return NextResponse.json(
        { error: "status is required" },
        { status: 400 }
      );
    }

    await chatSessionService.updateUnknownQuestion(id, {
      status,
      reviewedBy,
      suggestedAnswer,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Unknown Question Detail API] Error:", error);
    return NextResponse.json(
      { error: "Failed to update unknown question" },
      { status: 500 }
    );
  }
}
