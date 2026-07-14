import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIP, createRateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const clientIP = getClientIP(request);
  const rateLimitResult = rateLimit(`set-role:${clientIP}`, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
  });

  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  // Firebase has been removed - this endpoint is no longer available
  return NextResponse.json(
    { error: "Role assignment is not available - backend services have been removed" },
    { status: 503 }
  );
}
