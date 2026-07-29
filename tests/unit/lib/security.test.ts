/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Unit Tests for Security Utilities
 * Coverage target: >90%
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import {
  sanitizeString,
  escapeHtml,
  containsDangerousPatterns,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  generateCsrfToken,
  maskSensitiveData,
  isAllowedFileType,
  isValidFileSize,
  sanitizeFilename,
  checkRateLimit,
  schemas,
} from '@/lib/security'

describe('Security Utilities', () => {
  describe('sanitizeString', () => {
    it('should remove HTML tags and script injections', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('')
      expect(sanitizeString('<img src=x onerror=alert(1)>')).toBe('')
    })

    it('should remove javascript: protocol', () => {
      expect(sanitizeString('javascript:alert(1)')).toBe('')
      expect(sanitizeString('javascript:')).toBe('')
      expect(sanitizeString('JaVaScRiPt:alert(1)')).toBe('')
    })

    it('should remove event handlers', () => {
      expect(sanitizeString('onclick=alert(1)')).toBe('')
      expect(sanitizeString('onerror=alert(1)')).toBe('')
      expect(sanitizeString('onload=alert(1)')).toBe('')
    })

    it('should preserve normal text', () => {
      expect(sanitizeString('Hello World')).toBe('Hello World')
      expect(sanitizeString('नमस्ते')).toBe('नमस्ते') // Kannada text
    })

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('')
      expect(sanitizeString(null as any)).toBe('')
      expect(sanitizeString(undefined as any)).toBe('')
    })

    it('should trim whitespace', () => {
      expect(sanitizeString('  Hello  ')).toBe('Hello')
    })
  })

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<')).toBe('&lt;')
      expect(escapeHtml('>')).toBe('&gt;')
      expect(escapeHtml('&')).toBe('&amp;')
      expect(escapeHtml('"')).toBe('&quot;')
      expect(escapeHtml("'")).toBe('&#039;')
    })

    it('should escape complex strings', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      )
    })

    it('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('')
    })
  })

  describe('containsDangerousPatterns', () => {
    it('should detect SQL injection patterns', () => {
      const result = containsDangerousPatterns("'; DROP TABLE users;--")
      expect(result.isDangerous).toBe(true)
      expect(result.patterns).toContain('sqlInjection')
    })

    it('should detect XSS patterns', () => {
      const result = containsDangerousPatterns('<script>alert(1)</script>')
      expect(result.isDangerous).toBe(true)
    })

    it('should detect path traversal', () => {
      const result = containsDangerousPatterns('../../etc/passwd')
      expect(result.isDangerous).toBe(true)
    })

    it('should allow safe strings', () => {
      const result = containsDangerousPatterns('Hello World 123')
      expect(result.isDangerous).toBe(false)
      expect(result.patterns).toHaveLength(0)
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.org',
        'user+tag@example.co.in',
        'firstname.lastname@company.com',
      ]

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true)
      })
    })

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        '@nodomain.com',
        'no@',
        'spaces in@email.com',
        '',
        'missing@.com',
      ]

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false)
      })
    })
  })

  describe('isValidPhone', () => {
    it('should validate Indian phone numbers', () => {
      const validPhones = [
        '9876543210',
        '+919876543210',
        '919876543210',
        '9880888080',
      ]

      validPhones.forEach(phone => {
        expect(isValidPhone(phone)).toBe(true)
      })
    })

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '1234567890', // Too short
        '+1123456789', // Wrong country code
        'abcdefghij', // Letters
        '987654321', // Too short
        '',
      ]

      invalidPhones.forEach(phone => {
        expect(isValidPhone(phone)).toBe(false)
      })
    })
  })

  describe('isValidUrl', () => {
    it('should validate HTTP/HTTPS URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
      expect(isValidUrl('https://example.com/path?query=1')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('ftp://example.com')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })

  describe('generateCsrfToken', () => {
    it('should generate a 64-character hex token', () => {
      const token = generateCsrfToken()
      expect(token).toHaveLength(64)
      expect(/^[0-9a-f]+$/.test(token)).toBe(true)
    })

    it('should generate unique tokens', () => {
      const token1 = generateCsrfToken()
      const token2 = generateCsrfToken()
      expect(token1).not.toBe(token2)
    })
  })

  describe('maskSensitiveData', () => {
    it('should mask data with visible prefix', () => {
      expect(maskSensitiveData('secret123', 4)).toBe('secr****')
      expect(maskSensitiveData('card_number_1234', 4)).toBe('card****')
    })

    it('should mask short data completely', () => {
      expect(maskSensitiveData('abc', 4)).toBe('***')
    })

    it('should handle empty strings', () => {
      expect(maskSensitiveData('')).toBe('')
      expect(maskSensitiveData(null as any)).toBe('')
    })
  })

  describe('isAllowedFileType', () => {
    it('should allow valid image types', () => {
      const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp']
      expect(isAllowedFileType('photo.jpg', allowedTypes)).toBe(true)
      expect(isAllowedFileType('photo.PNG', allowedTypes)).toBe(true)
    })

    it('should reject disallowed file types', () => {
      const allowedTypes = ['jpg', 'png', 'pdf']
      expect(isAllowedFileType('script.exe', allowedTypes)).toBe(false)
      expect(isAllowedFileType('file.mp3', allowedTypes)).toBe(false)
    })
  })

  describe('isValidFileSize', () => {
    it('should validate file size within limit', () => {
      const maxSizeMB = 10
      expect(isValidFileSize(1024 * 1024, maxSizeMB)).toBe(true) // 1MB
      expect(isValidFileSize(5 * 1024 * 1024, maxSizeMB)).toBe(true) // 5MB
    })

    it('should reject oversized files', () => {
      const maxSizeMB = 10
      expect(isValidFileSize(11 * 1024 * 1024, maxSizeMB)).toBe(false) // 11MB
    })

    it('should reject zero or negative sizes', () => {
      expect(isValidFileSize(0)).toBe(false)
      expect(isValidFileSize(-100)).toBe(false)
    })
  })

  describe('sanitizeFilename', () => {
    it('should remove special characters', () => {
      expect(sanitizeFilename('file<>:?"/\\|name.jpg')).toBe('file________name.jpg')
    })

    it('should collapse multiple underscores', () => {
      expect(sanitizeFilename('file___name.jpg')).toBe('file_name.jpg')
    })

    it('should truncate to 255 characters', () => {
      const longName = 'a'.repeat(300) + '.jpg'
      expect(sanitizeFilename(longName)).toHaveLength(255)
    })

    it('should preserve normal filenames', () => {
      expect(sanitizeFilename('photo_2024.jpg')).toBe('photo_2024.jpg')
    })
  })

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const config = { windowMs: 60000, maxRequests: 5 }
      const result = checkRateLimit('test-user-1', config)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeLessThanOrEqual(5)
    })

    it('should block requests over limit', () => {
      const config = { windowMs: 60000, maxRequests: 2 }
      // Make requests up to limit
      checkRateLimit('test-user-2', config)
      checkRateLimit('test-user-2', config)
      const result = checkRateLimit('test-user-2', config)
      expect(result.allowed).toBe(false)
    })
  })

  describe('Zod Validation Schemas', () => {
    describe('registration schema', () => {
      it('should validate correct registration data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'SecurePass123',
          name: 'Test User',
          phone: '919876543210',
        }

        const result = schemas.registration.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject weak passwords', () => {
        const weakPasswords = ['short', 'nouppercase1', 'NOLOWERCASE1', 'NoNumbers']

        weakPasswords.forEach(password => {
          const result = schemas.registration.safeParse({
            email: 'test@example.com',
            password,
            name: 'Test',
          })
          expect(result.success).toBe(false)
        })
      })

      it('should reject invalid email', () => {
        const result = schemas.registration.safeParse({
          email: 'notanemail',
          password: 'SecurePass123',
          name: 'Test',
        })
        expect(result.success).toBe(false)
      })
    })

    describe('donation schema', () => {
      it('should validate correct donation data', () => {
        const validData = {
          amount: 1000,
          donorName: 'Test Donor',
          donorEmail: 'donor@example.com',
          message: 'Test donation',
        }

        const result = schemas.donation.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject negative amounts', () => {
        const result = schemas.donation.safeParse({
          amount: -100,
          donorName: 'Test',
          donorEmail: 'test@example.com',
        })
        expect(result.success).toBe(false)
      })

      it('should enforce maximum donation amount', () => {
        const result = schemas.donation.safeParse({
          amount: 2000000, // Over 1,000,000 limit
          donorName: 'Test',
          donorEmail: 'test@example.com',
        })
        expect(result.success).toBe(false)
      })
    })

    describe('booking schema', () => {
      it('should validate correct booking data', () => {
        const validData = {
          sevaId: '123e4567-e89b-12d3-a456-426614174000',
          bookingDate: '2024-12-25T10:00:00Z',
          name: 'Test User',
          email: 'user@example.com',
          phone: '919876543210',
        }

        const result = schemas.booking.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject invalid UUID', () => {
        const result = schemas.booking.safeParse({
          sevaId: 'not-a-uuid',
          bookingDate: '2024-12-25T10:00:00Z',
          name: 'Test',
          email: 'test@example.com',
        })
        expect(result.success).toBe(false)
      })
    })

    describe('pagination schema', () => {
      it('should apply defaults', () => {
        const result = schemas.pagination.parse({})
        expect(result.page).toBe(1)
        expect(result.limit).toBe(20)
      })

      it('should coerce string numbers', () => {
        const result = schemas.pagination.parse({ page: '2', limit: '50' })
        expect(result.page).toBe(2)
        expect(result.limit).toBe(50)
      })

      it('should reject invalid pagination', () => {
        expect(() => schemas.pagination.parse({ page: -1 })).toThrow()
        expect(() => schemas.pagination.parse({ limit: 200 })).toThrow()
      })
    })
  })
})
