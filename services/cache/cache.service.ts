/**
 * Cache Service
 * In-memory caching with TTL support
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  prefix?: string
}

class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Start cleanup interval
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000) // Cleanup every minute
    }
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value as T
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL
    const expiresAt = Date.now() + ttl

    this.cache.set(key, {
      value,
      expiresAt,
    })
  }

  /**
   * Delete a specific key
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Delete all keys matching a pattern
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cached value or fetch and cache it
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = this.get<T>(key)
    
    if (cached !== null) {
      return cached
    }

    const value = await fetchFn()
    this.set(key, value, options)
    
    return value
  }

  /**
   * Invalidate cache for a specific entity
   */
  invalidateEntity(entityType: string, entityId?: string): void {
    if (entityId) {
      this.delete(`${entityType}:${entityId}`)
    }
    this.deletePattern(`${entityType}:*`)
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    hits: number
    misses: number
  } {
    return {
      size: this.cache.size,
      hits: 0,
      misses: 0,
    }
  }

  /**
   * Destroy the cache service
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}

// Singleton instance
export const cacheService = new CacheService()

// Cache key generators
export const CacheKeys = {
  event: (id: string) => `event:${id}`,
  events: (page?: number) => `events:${page || 'all'}`,
  seva: (id: string) => `seva:${id}`,
  sevas: (page?: number) => `sevas:${page || 'all'}`,
  announcement: (id: string) => `announcement:${id}`,
  announcements: (page?: number) => `announcements:${page || 'all'}`,
  campaign: (id: string) => `campaign:${id}`,
  campaigns: () => 'campaigns:all',
  user: (id: string) => `user:${id}`,
  analytics: (type: string) => `analytics:${type}`,
}
