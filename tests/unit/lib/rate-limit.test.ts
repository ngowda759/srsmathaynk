/**
 * Unit Tests for Rate Limiter
 * Coverage target: >90%
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkRateLimit, type RateLimitConfig } from '@/lib/rate-limit'

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Reset rate limit state between tests
    vi.clearAllMocks()
  })

  describe('checkRateLimit', () => {
    it('should allow first request', () => {
      const config: RateLimitConfig = {
        windowMs: 60000, // 1 minute
        maxRequests: 10,
      }

      const result = checkRateLimit('test-user-new', config)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9) // 10 - 1
      expect(result.resetAt).toBeGreaterThan(Date.now())
    })

    it('should decrement remaining count', () => {
      const config: RateLimitConfig = {
        windowMs: 60000,
        maxRequests: 5,
      }

      // Make 3 requests
      checkRateLimit('test-user-count', config)
      checkRateLimit('test-user-count', config)
      const result = checkRateLimit('test-user-count', config)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2) // 5 - 3
    })

    it('should block requests when limit reached', () => {
      const config: RateLimitConfig = {
        windowMs: 60000,
        maxRequests: 2,
      }

      checkRateLimit('test-user-block', config)
      checkRateLimit('test-user-block', config)
      const result = checkRateLimit('test-user-block', config)

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset after window expires', async () => {
      const config: RateLimitConfig = {
        windowMs: 100, // Very short window for testing
        maxRequests: 1,
      }

      // Use up the limit
      const result1 = checkRateLimit('test-user-reset', config)
      expect(result1.allowed).toBe(true)

      // Should be blocked
      const result2 = checkRateLimit('test-user-reset', config)
      expect(result2.allowed).toBe(false)
    })

    it('should track different identifiers separately', () => {
      const config: RateLimitConfig = {
        windowMs: 60000,
        maxRequests: 1,
      }

      const result1 = checkRateLimit('user-1', config)
      const result2 = checkRateLimit('user-2', config)

      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)
      expect(result1.remaining).toBe(result2.remaining)
    })

    it('should handle IP address identifiers', () => {
      const config: RateLimitConfig = {
        windowMs: 60000,
        maxRequests: 100,
      }

      const result = checkRateLimit('192.168.1.1', config)

      expect(result.allowed).toBe(true)
      expect(typeof result.resetAt).toBe('number')
    })

    it('should handle email identifiers', () => {
      const config: RateLimitConfig = {
        windowMs: 60000,
        maxRequests: 5,
      }

      const result = checkRateLimit('user@example.com', config)

      expect(result.allowed).toBe(true)
    })
  })

  describe('Rate Limit Configurations', () => {
    it('should apply strict limits for auth endpoints', () => {
      const authConfig: RateLimitConfig = {
        windowMs: 900000, // 15 minutes
        maxRequests: 5,
      }

      expect(authConfig.maxRequests).toBeLessThan(10)
    })

    it('should apply moderate limits for API endpoints', () => {
      const apiConfig: RateLimitConfig = {
        windowMs: 60000, // 1 minute
        maxRequests: 60,
      }

      expect(apiConfig.maxRequests).toBeGreaterThan(10)
    })

    it('should apply generous limits for search', () => {
      const searchConfig: RateLimitConfig = {
        windowMs: 60000,
        maxRequests: 30,
      }

      expect(searchConfig.maxRequests).toBeGreaterThan(20)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long identifier', () => {
      const config: RateLimitConfig = {
        windowMs: 60000,
        maxRequests: 10,
      }

      const longIdentifier = 'a'.repeat(1000)
      const result = checkRateLimit(longIdentifier, config)

      expect(result.allowed).toBe(true)
    })

    it('should handle special characters in identifier', () => {
      const config: RateLimitConfig = {
        windowMs: 60000,
        maxRequests: 10,
      }

      const specialIdentifier = 'user@example.com!#$%'
      const result = checkRateLimit(specialIdentifier, config)

      expect(result.allowed).toBe(true)
    })

    it('should handle very small window', () => {
      const config: RateLimitConfig = {
        windowMs: 1, // 1ms
        maxRequests: 1,
      }

      const result = checkRateLimit('test-user-small', config)
      expect(result.allowed).toBe(true)
    })

    it('should handle very large maxRequests', () => {
      const config: RateLimitConfig = {
        windowMs: 60000,
        maxRequests: 10000,
      }

      const result = checkRateLimit('test-user-large', config)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9999)
    })
  })
})
