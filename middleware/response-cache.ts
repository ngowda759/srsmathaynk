/**
 * Response Cache Middleware
 * Caches API responses based on cache headers
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cacheService, CacheKeys } from '@/services/cache/cache.service'

// Routes that should be cached
const CACHEABLE_ROUTES = [
  '/api/events',
  '/api/sevas',
  '/api/announcements',
  '/api/campaigns',
]

// Cache TTLs in milliseconds
const TTL = {
  short: 60 * 1000,      // 1 minute
  medium: 5 * 60 * 1000, // 5 minutes
  long: 30 * 60 * 1000,   // 30 minutes
}

export function getCacheTTL(route: string): number {
  if (route.includes('/api/events')) return TTL.medium
  if (route.includes('/api/sevas')) return TTL.medium
  if (route.includes('/api/announcements')) return TTL.short
  if (route.includes('/api/campaigns')) return TTL.long
  return TTL.medium
}

export function generateCacheKey(request: NextRequest): string {
  const url = request.nextUrl
  return `${url.pathname}:${url.search}`
}

export function isCacheable(request: NextRequest): boolean {
  // Only cache GET requests
  if (request.method !== 'GET') return false

  // Check if route is cacheable
  const pathname = request.nextUrl.pathname
  return CACHEABLE_ROUTES.some(route => pathname.startsWith(route))
}

export async function withCache(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  // Check if this request should be cached
  if (!isCacheable(request)) {
    return handler()
  }

  const cacheKey = generateCacheKey(request)

  // Try to get from cache
  const cached = cacheService.get<{ body: string; headers: Record<string, string> }>(cacheKey)
  
  if (cached) {
    // Return cached response
    const response = new NextResponse(cached.body, {
      status: 200,
      headers: {
        ...cached.headers,
        'X-Cache': 'HIT',
        'X-Cache-Key': cacheKey,
      },
    })
    
    // Add cache headers
    const ttl = getCacheTTL(request.nextUrl.pathname)
    response.headers.set('Cache-Control', `public, max-age=${Math.floor(ttl / 1000)}, stale-while-revalidate=60`)
    
    return response
  }

  // Execute handler
  const response = await handler()

  // Only cache successful responses
  if (response.status === 200) {
    const body = await response.text()
    const headers: Record<string, string> = {}
    
    response.headers.forEach((value, key) => {
      headers[key] = value
    })

    // Store in cache
    cacheService.set(
      cacheKey,
      { body, headers },
      { ttl: getCacheTTL(request.nextUrl.pathname) }
    )

    // Return new response with cache headers
    const newResponse = new NextResponse(body, {
      status: 200,
      headers: {
        ...headers,
        'X-Cache': 'MISS',
        'X-Cache-Key': cacheKey,
      },
    })
    
    newResponse.headers.set('Cache-Control', `public, max-age=${Math.floor(getCacheTTL(request.nextUrl.pathname) / 1000)}, stale-while-revalidate=60`)
    
    return newResponse
  }

  return response
}

/**
 * Invalidate cache for specific routes
 */
export function invalidateRouteCache(pattern: string): void {
  cacheService.deletePattern(pattern)
}

/**
 * Invalidate all public caches
 */
export function invalidateAllPublicCache(): void {
  cacheService.clear()
}
