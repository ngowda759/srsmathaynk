/**
 * Pagination Utilities
 */

import type { PaginationOptions, PaginationMeta, PaginatedResult } from "@/types";

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalize pagination options with defaults
 */
export function normalizePagination(options: PaginationOptions = {}): Required<PaginationOptions> {
  const page = Math.max(1, Math.floor(Number(options.page) || DEFAULT_PAGE));
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(Number(options.limit) || DEFAULT_LIMIT)));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(
  total: number,
  options: Required<PaginationOptions>
): PaginationMeta {
  const { page, limit } = options;
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Create a paginated result
 */
export function createPaginatedResult<T>(
  data: T[],
  total: number,
  options: Required<PaginationOptions>
): PaginatedResult<T> {
  return {
    data,
    meta: calculatePaginationMeta(total, options),
  };
}

/**
 * Parse pagination from search params
 */
export function parsePaginationParams(
  params: Record<string, string | undefined>
): PaginationOptions {
  const page = params.page ? parseInt(params.page, 10) : undefined;
  const limit = params.limit ? parseInt(params.limit, 10) : undefined;

  return { page, limit };
}

/**
 * Generate pagination links for API responses
 */
export function generatePaginationLinks(
  baseUrl: string,
  meta: PaginationMeta
): {
  self: string;
  first: string;
  last: string;
  prev?: string;
  next?: string;
} {
  const url = new URL(baseUrl);
  
  const links = {
    self: `${url.origin}${url.pathname}?page=${meta.page}&limit=${meta.limit}`,
    first: `${url.origin}${url.pathname}?page=1&limit=${meta.limit}`,
    last: `${url.origin}${url.pathname}?page=${meta.totalPages}&limit=${meta.limit}`,
  };

  if (meta.hasPrevPage) {
    links.prev = `${url.origin}${url.pathname}?page=${meta.page - 1}&limit=${meta.limit}`;
  }

  if (meta.hasNextPage) {
    links.next = `${url.origin}${url.pathname}?page=${meta.page + 1}&limit=${meta.limit}`;
  }

  return links;
}

/**
 * Create cursor for cursor-based pagination
 */
export function createCursor<T extends { id: string }>(
  items: T[],
  page: number
): string | null {
  if (items.length === 0) {
    return null;
  }
  
  const lastItem = items[items.length - 1];
  const cursor = Buffer.from(`${lastItem.id}:${page}`).toString("base64");
  
  return cursor;
}

/**
 * Parse cursor for cursor-based pagination
 */
export function parseCursor(cursor: string): { id: string; page: number } | null {
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    const [id, pageStr] = decoded.split(":");
    
    return {
      id,
      page: parseInt(pageStr, 10),
    };
  } catch {
    return null;
  }
}
