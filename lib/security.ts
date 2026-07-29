/**
 * Security Utilities
 * Input validation, sanitization, and security helpers
 */
import { z } from 'zod'

// Input sanitization regex patterns
const DANGEROUS_PATTERNS = {
  // HTML/Script injection
  htmlScript: /<[^>]*script|javascript:|on\w+=/gi,
  // SQL injection patterns
  sqlInjection: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/gi,
  // Path traversal
  pathTraversal: /(\.\.\/|\.\.\\|%2e%2e)/gi,
  // XSS patterns
  xss: /(<|>|'|"|&|#|%|\\x)/g,
}

// Sanitize string input
export function sanitizeString(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// Sanitize for HTML display
export function escapeHtml(unsafe: string): string {
  if (!unsafe) return ''
  
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Check for dangerous patterns
export function containsDangerousPatterns(input: string): {
  isDangerous: boolean
  patterns: string[]
} {
  const foundPatterns: string[] = []
  
  for (const [name, pattern] of Object.entries(DANGEROUS_PATTERNS)) {
    if (pattern.test(input)) {
      foundPatterns.push(name)
    }
    // Reset regex state
    pattern.lastIndex = 0
  }
  
  return {
    isDangerous: foundPatterns.length > 0,
    patterns: foundPatterns,
  }
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone (Indian phone numbers)
export function isValidPhone(phone: string): boolean {
  // Accept formats: +91XXXXXXXXXX, 91XXXXXXXXXX, XXXXXXXXXX
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Validate URL
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// Generate CSRF token
export function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Hash sensitive data (for logging)
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data) return ''
  if (data.length <= visibleChars) return '*'.repeat(data.length)
  return data.slice(0, visibleChars) + '*'.repeat(data.length - visibleChars)
}

// Validate file type
export function isAllowedFileType(
  filename: string,
  allowedTypes: string[]
): boolean {
  const extension = filename.split('.').pop()?.toLowerCase()
  return extension ? allowedTypes.includes(extension) : false
}

// Validate file size (in bytes)
export function isValidFileSize(
  size: number,
  maxSizeMB: number = 10
): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return size > 0 && size <= maxSizeBytes
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255)
}

// Zod validation schemas
export const schemas = {
  // User registration
  registration: z.object({
    email: z.string().email(),
    password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
    name: z.string().min(2).max(100),
    phone: z.string().optional(),
  }),

  // Donation
  donation: z.object({
    amount: z.number().positive().max(1000000),
    campaignId: z.string().uuid().optional(),
    donorName: z.string().min(2).max(100),
    donorEmail: z.string().email(),
    donorPhone: z.string().optional(),
    message: z.string().max(500).optional(),
  }),

  // Booking
  booking: z.object({
    sevaId: z.string().uuid(),
    bookingDate: z.string().datetime(),
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().optional(),
    specialRequests: z.string().max(1000).optional(),
  }),

  // Contact form
  contact: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().optional(),
    subject: z.string().min(5).max(200),
    message: z.string().min(10).max(5000),
  }),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
}

// Rate limiting storage (in-memory)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

// Check rate limit
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  // Clean up old entries
  if (record && now > record.resetAt) {
    rateLimitStore.delete(identifier)
  }

  const current = rateLimitStore.get(identifier)

  if (!current) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    }
  }

  if (current.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    }
  }

  current.count++
  
  return {
    allowed: true,
    remaining: config.maxRequests - current.count,
    resetAt: current.resetAt,
  }
}

// Clear old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Run every minute
