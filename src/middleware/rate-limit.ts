/**
 * Rate Limiting Middleware
 * 
 * Placeholder for rate limiting implementation.
 * Will be implemented in future sprints for public API rate limiting.
 * 
 * Architecture:
 * 
 * Public API
 *     ↓
 * Rate Limiter (memory/Redis)
 *     ↓
 * Route Handler
 * 
 * Rate Limits:
 * - Anonymous: 100 requests/minute
 * - Authenticated: 1000 requests/minute
 * - Admin: 5000 requests/minute
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { ErrorCodes } from "@/errors";

// ============================================================================
// Types
// ============================================================================

export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyGenerator?: (req: NextRequest) => string;
}

export interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Anonymous users - strict limits
  anonymous: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  
  // Authenticated users
  authenticated: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000,
  },
  
  // Admin users - generous limits
  admin: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5000,
  },
  
  // Strict API limits
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  },
};

// ============================================================================
// In-Memory Store (Placeholder)
// ============================================================================

// Note: In production, use Redis or a distributed cache
// This is a simple in-memory implementation for development

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute

// ============================================================================
// Default Key Generator
// ============================================================================

function defaultKeyGenerator(req: NextRequest): string {
  // Use IP address as the key
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `ratelimit:${ip}`;
}

// ============================================================================
// Rate Limit Check
// ============================================================================

/**
 * Check if a request is within rate limits
 * 
 * Note: This is a placeholder implementation.
 * In production, use Redis with sliding window or token bucket algorithm.
 */
export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig = DEFAULT_RATE_LIMITS.anonymous
): RateLimitResult {
  const key = config.keyGenerator ? config.keyGenerator(req) : defaultKeyGenerator(req);
  const now = Date.now();
  
  let record = rateLimitStore.get(key);
  
  // Initialize or reset if window has passed
  if (!record || record.resetTime < now) {
    record = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }
  
  // Increment count
  record.count++;
  rateLimitStore.set(key, record);
  
  // Calculate remaining
  const remaining = Math.max(0, config.maxRequests - record.count);
  const resetTime = new Date(record.resetTime);
  
  // Check if over limit
  if (record.count > config.maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: resetTime,
      retryAfter,
    };
  }
  
  return {
    success: true,
    limit: config.maxRequests,
    remaining,
    reset: resetTime,
  };
}

// ============================================================================
// Rate Limit Headers
// ============================================================================

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.floor(result.reset.getTime() / 1000)),
    ...(result.retryAfter && { "Retry-After": String(result.retryAfter) }),
  };
}

// ============================================================================
// Rate Limit Middleware
// ============================================================================

/**
 * Create rate limiting middleware
 * 
 * Usage:
 * ```typescript
 * // Apply rate limiting to all routes
 * const withRateLimit = createRateLimitMiddleware();
 * 
 * // Apply to specific routes
 * const withApiRateLimit = createRateLimitMiddleware("api");
 * const withAuthRateLimit = createRateLimitMiddleware("authenticated");
 * 
 * // Custom configuration
 * const withCustomLimit = createRateLimitMiddleware({
 *   windowMs: 60 * 1000,
 *   maxRequests: 100,
 * });
 * ```
 */
export function createRateLimitMiddleware(
  preset?: string | RateLimitConfig,
  options?: {
    skipFailedRequests?: boolean;
    skipSuccessfulRequests?: boolean;
  }
) {
  const config: RateLimitConfig = typeof preset === "string"
    ? DEFAULT_RATE_LIMITS[preset] || DEFAULT_RATE_LIMITS.anonymous
    : preset || DEFAULT_RATE_LIMITS.anonymous;

  return function rateLimitHandler<T extends (req: NextRequest) => Promise<NextResponse>>(
    handler: T
  ): (req: NextRequest) => Promise<NextResponse> {
    return async (req: NextRequest) => {
      // Skip rate limiting for non-mutating requests (optional)
      if (options?.skipSuccessfulRequests && req.method === "GET") {
        return handler(req);
      }

      const result = checkRateLimit(req, config);

      // Add rate limit headers to all responses
      const headers = getRateLimitHeaders(result);

      if (!result.success) {
        logger.warn("Rate limit exceeded", {
          ip: req.headers.get("x-forwarded-for"),
          path: req.nextUrl.pathname,
          limit: result.limit,
        });

        return NextResponse.json(
          {
            success: false,
            error: {
              code: ErrorCodes.APP_BAD_REQUEST,
              message: "Too many requests. Please try again later.",
              details: {
                retryAfter: result.retryAfter,
                reset: result.reset.toISOString(),
              },
            },
          },
          { status: 429, headers }
        );
      }

      // Execute handler and add headers
      const response = await handler(req);

      // Add rate limit headers to successful responses
      for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
      }

      return response;
    };
  };
}

// ============================================================================
// Rate Limit Presets
// ============================================================================

/**
 * Strict rate limiting for public endpoints
 */
export const withAnonymousRateLimit = createRateLimitMiddleware("anonymous");

/**
 * Standard rate limiting for authenticated users
 */
export const withAuthenticatedRateLimit = createRateLimitMiddleware("authenticated");

/**
 * Generous rate limiting for admin endpoints
 */
export const withAdminRateLimit = createRateLimitMiddleware("admin");

/**
 * Very strict rate limiting for public API
 */
export const withApiRateLimit = createRateLimitMiddleware("api");

// ============================================================================
// Future Enhancements
// ============================================================================

// TODO: Implement Redis-based rate limiting for production
// TODO: Add sliding window algorithm for more accurate limiting
// TODO: Add distributed rate limiting for multi-instance deployments
// TODO: Add rate limit by user ID (authenticated users)
// TODO: Add rate limit by endpoint-specific configs
// TODO: Add rate limit analytics and monitoring
