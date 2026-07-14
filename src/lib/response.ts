/**
 * API Response Utilities
 * 
 * Provides standardized API response formatting.
 */

import type { ApiResponse, PaginationMeta } from "@/types";
import { AppError } from "@/errors";

// ============================================================================
// Success Responses
// ============================================================================

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  meta?: PaginationMeta
): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return response;
}

/**
 * Create a created response (201)
 */
export function createdResponse<T>(
  data: T,
  meta?: PaginationMeta
): ApiResponse<T> {
  return successResponse(data, meta);
}

/**
 * Create a no content response (204)
 */
export function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

// ============================================================================
// Error Responses
// ============================================================================

/**
 * Create an error response
 */
export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>,
  statusCode: number = 500
): Response {
  const body: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };

  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Create a response from an AppError
 */
export function appErrorToResponse(error: AppError): Response {
  return errorResponse(
    error.code,
    error.message,
    error.details,
    error.statusCode
  );
}

/**
 * Create a generic error response
 */
export function genericErrorResponse(
  message: string = "An unexpected error occurred"
): Response {
  return errorResponse(
    "INTERNAL_ERROR",
    message,
    undefined,
    500
  );
}

// ============================================================================
// JSON Response Helpers
// ============================================================================

/**
 * Create a JSON response with proper headers
 */
export function jsonResponse<T>(
  data: T,
  statusCode: number = 200,
  headers?: Record<string, string>
): Response {
  return new Response(JSON.stringify(data), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

/**
 * Create a success JSON response
 */
export function successJson<T>(
  data: T,
  meta?: PaginationMeta,
  headers?: Record<string, string>
): Response {
  return jsonResponse(successResponse(data, meta), 200, headers);
}

/**
 * Create a created JSON response
 */
export function createdJson<T>(
  data: T,
  headers?: Record<string, string>
): Response {
  return jsonResponse(createdResponse(data), 201, headers);
}

// ============================================================================
// Response Headers
// ============================================================================

/**
 * CORS headers for API responses
 */
export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Cache control headers
 */
export const CACHE_HEADERS = {
  noCache: {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
  shortCache: {
    "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
  },
  longCache: {
    "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
  },
};

// ============================================================================
// Next.js Response Helpers
// ============================================================================

/**
 * Format response for Next.js API routes
 */
export function formatNextResponse<T>(
  data: T,
  meta?: PaginationMeta
): { data: T; meta?: PaginationMeta } {
  return meta ? { data, meta } : { data };
}

/**
 * Format error for Next.js API routes
 */
export function formatNextError(
  error: unknown
): { code: string; message: string; details?: Record<string, unknown> } {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      code: "INTERNAL_ERROR",
      message: error.message,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred",
  };
}

// ============================================================================
// Validation Error Response
// ============================================================================

/**
 * Create a validation error response
 */
export function validationErrorResponse(
  errors: Record<string, string[]>
): Response {
  return errorResponse(
    "VALIDATION_ERROR",
    "Validation failed",
    { errors },
    400
  );
}

// ============================================================================
// Pagination Links
// ============================================================================

/**
 * Generate pagination response headers
 */
export function paginationHeaders(meta: PaginationMeta): Record<string, string> {
  return {
    "X-Total-Count": String(meta.total),
    "X-Total-Pages": String(meta.totalPages),
    "X-Current-Page": String(meta.page),
    "X-Per-Page": String(meta.limit),
    "X-Has-Next-Page": String(meta.hasNextPage),
    "X-Has-Prev-Page": String(meta.hasPrevPage),
  };
}
