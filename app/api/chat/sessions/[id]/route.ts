/**
 * Chat Session Detail API
 * GET /api/chat/sessions/[id] - Get session with messages
 * DELETE /api/chat/sessions/[id] - Delete session
 */

import { NextRequest, NextResponse } from "next/server";
import { chatSessionService } from "@/services/chat-session.service";
import { checkRateLimit } from "@/lib/ai/security";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/chat/sessions/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    
    // Rate limit check
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const beforeId = searchParams.get("beforeId") || undefined;

    // Get session
    const session = await chatSessionService.getSession(id);
    if (!session) {
      // Try by session key
      const sessionByKey = await chatSessionService.getSessionByKey(id);
      if (!sessionByKey) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
    }

    // Get messages
    const sessionId = session?.id || (await chatSessionService.getSessionByKey(id))?.id;
    if (!sessionId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const messages = await chatSessionService.getSessionMessages(sessionId, { limit, beforeId });

    return NextResponse.json({
      sessionId: sessionId,
      messages,
    });
  } catch (error) {
    console.error("[Session Detail API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/sessions/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    
    // Rate limit check
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Get session to verify it exists
    let sessionId = id;
    const session = await chatSessionService.getSession(id);
    if (!session) {
      const sessionByKey = await chatSessionService.getSessionByKey(id);
      if (!sessionByKey) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
      sessionId = sessionByKey.id;
    }

    await chatSessionService.deleteSession(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Session Detail API] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
