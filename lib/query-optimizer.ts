/**
 * Database Query Optimizer
 * Utilities for optimized database queries
 */

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginationResult {
  page: number
  limit: number
  offset: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

/**
 * Parse and validate pagination parameters
 */
export function parsePagination(params: PaginationParams): PaginationResult {
  const page = Math.max(1, params.page || 1)
  const limit = Math.min(100, Math.max(1, params.limit || 20))
  const offset = params.offset ?? (page - 1) * limit

  return {
    page,
    limit,
    offset,
    total: 0, // Will be set by caller
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: page > 1,
  }
}

/**
 * Calculate pagination result
 */
export function calculatePagination(
  params: PaginationResult,
  total: number
): PaginationResult {
  const totalPages = Math.ceil(total / params.limit)

  return {
    ...params,
    total,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPrevPage: params.page > 1,
  }
}

/**
 * Build cursor-based pagination cursor
 */
export function encodeCursor(data: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(data)).toString('base64')
}

/**
 * Decode cursor for cursor-based pagination
 */
export function decodeCursor<T>(cursor: string): T | null {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8')
    return JSON.parse(decoded) as T
  } catch {
    return null
  }
}

/**
 * Select only needed fields to reduce payload
 */
export function createSelect<T extends Record<string, unknown>>(
  fields: (keyof T)[]
): Record<keyof T, boolean> {
  return fields.reduce((acc, field) => {
    acc[field] = true
    return acc
  }, {} as Record<keyof T, boolean>)
}

/**
 * Build where clause with search
 */
export function buildSearchWhere(
  fields: string[],
  search: string,
  additionalWhere?: Record<string, unknown>
): Record<string, unknown> {
  const searchLower = search.toLowerCase()
  
  const orConditions = fields.map(field => ({
    [field]: {
      contains: searchLower,
      mode: 'insensitive' as const,
    },
  }))

  return {
    ...additionalWhere,
    OR: orConditions,
  }
}

/**
 * Batch queries with concurrency limit
 */
export async function batchQueries<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number = 5
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.all(batch.map(processor))
    results.push(...batchResults)
  }

  return results
}

/**
 * Create a cursor for paginating by date
 */
export function createDateCursor(date: Date, id: string): string {
  return encodeCursor({
    createdAt: date.toISOString(),
    id,
  })
}

/**
 * Parse date cursor for pagination
 */
export function parseDateCursor(
  cursor: string
): { createdAt: Date; id: string } | null {
  const decoded = decodeCursor<{ createdAt: string; id: string }>(cursor)
  if (!decoded) return null

  return {
    createdAt: new Date(decoded.createdAt),
    id: decoded.id,
  }
}

/**
 * Add cursor-based pagination to where clause
 */
export function addCursorToWhere(
  where: Record<string, unknown>,
  cursor: { createdAt: Date; id: string }
): Record<string, unknown> {
  return {
    ...where,
    OR: [
      { createdAt: { gt: cursor.createdAt } },
      {
        AND: [
          { createdAt: cursor.createdAt },
          { id: { gt: cursor.id } },
        ],
      },
    ],
  }
}

/**
 * Rate limiter helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get existing requests
    const requests = this.requests.get(identifier) || []
    
    // Filter out old requests
    const recentRequests = requests.filter(time => time > windowStart)
    
    // Check if under limit
    if (recentRequests.length >= this.maxRequests) {
      return false
    }

    // Add new request
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)

    return true
  }

  reset(identifier: string): void {
    this.requests.delete(identifier)
  }

  cleanup(): void {
    const windowStart = Date.now() - this.windowMs
    
    for (const [id, requests] of this.requests.entries()) {
      const recent = requests.filter(time => time > windowStart)
      if (recent.length === 0) {
        this.requests.delete(id)
      } else {
        this.requests.set(id, recent)
      }
    }
  }
}
