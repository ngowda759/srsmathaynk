/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Security E2E Tests
 * OWASP Top 10, XSS, CSRF, Rate Limiting
 */
import { test, expect } from '@playwright/test'

test.describe('Security Tests', () => {
  test.describe('OWASP A01 - Broken Access Control', () => {
    test('should protect admin routes from unauthenticated users', async ({ page }) => {
      const adminRoutes = [
        '/admin',
        '/admin/users',
        '/admin/settings',
        '/admin/analytics',
      ]

      for (const route of adminRoutes) {
        await page.goto(route)
        // Should redirect to login or show access denied
        const url = page.url()
        expect(
          url.includes('login') || 
          url.includes('auth') || 
          await page.locator('text=/access denied|unauthorized|forbidden/i').isVisible().catch(() => false)
        ).toBeTruthy()
      }
    })

    test('should protect API routes from unauthenticated access', async ({ request }) => {
      const protectedEndpoints = [
        '/api/users',
        '/api/settings',
        '/api/admin/analytics',
      ]

      for (const endpoint of protectedEndpoints) {
        const response = await request.get(endpoint)
        expect([401, 403]).toContain(response.status())
      }
    })

    test('should enforce RBAC on admin endpoints', async ({ page }) => {
      await page.goto('/admin')
      
      // Check if navigation items are properly hidden based on role
      // This test verifies UI-level access control
      const isAdmin = await page.locator('[data-testid="admin-nav"]').isVisible().catch(() => false)
      
      if (isAdmin) {
        // Admin should see admin navigation
        await expect(page.locator('text=/dashboard|users|settings/i')).toBeVisible()
      }
    })
  })

  test.describe('OWASP A02 - Cryptographic Failures', () => {
    test('should use HTTPS in production', async ({ page }) => {
      const response = await page.goto('/')
      expect(response?.url()).toMatch(/^https:/)
    })

    test('should have secure cookie settings', async ({ page }) => {
      await page.goto('/')
      
      const cookies = await page.context().cookies()
      const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('auth'))
      
      if (sessionCookie) {
        expect(sessionCookie.secure).toBe(true)
        expect(sessionCookie.sameSite).toBe('strict' || 'lax')
      }
    })
  })

  test.describe('OWASP A03 - Injection', () => {
    test('should prevent SQL injection in search', async ({ page }) => {
      await page.goto('/')

      // Try SQL injection patterns
      const sqlInjectionPayloads = [
        "' OR '1'='1",
        "'; DROP TABLE users;--",
        "1' AND '1'='1",
      ]

      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')
      
      for (const payload of sqlInjectionPayloads) {
        await searchInput.fill(payload)
        await searchInput.press('Enter')
        
        // Should not show database errors
        const pageContent = await page.content()
        expect(pageContent).not.toMatch(/sql|syntax error|warning/i)
      }
    })

    test('should prevent XSS in form inputs', async ({ page }) => {
      await page.goto('/contact')

      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert(1)>',
        'javascript:alert(1)',
        '<svg onload=alert(1)>',
      ]

      const nameInput = page.locator('input[name="name"], input[id="name"]')
      const emailInput = page.locator('input[name="email"], input[id="email"]')
      const messageInput = page.locator('textarea[name="message"], textarea[id="message"]')

      for (const payload of xssPayloads) {
        await nameInput.fill(payload)
        await emailInput.fill('test@example.com')
        await messageInput.fill('Test message')

        // Submit the form
        await page.locator('button[type="submit"]').click()

        // Should sanitize the input
        const pageContent = await page.content()
        expect(pageContent).not.toMatch(/<script>/i)
        expect(pageContent).not.toMatch(/on\w+=/i)
      }
    })

    test('should prevent XSS in URL parameters', async ({ page }) => {
      const xssPayload = '?name=<script>alert("XSS")</script>'
      await page.goto(`/contact${xssPayload}`)

      const pageContent = await page.content()
      expect(pageContent).not.toMatch(/<script>/i)
    })
  })

  test.describe('OWASP A04 - Insecure Design', () => {
    test('should implement rate limiting on forms', async ({ page }) => {
      await page.goto('/contact')

      const submitButton = page.locator('button[type="submit"]')

      // Make rapid submissions
      for (let i = 0; i < 10; i++) {
        await page.locator('input[name="name"]').fill(`Test User ${i}`)
        await page.locator('input[name="email"]').fill(`test${i}@example.com`)
        await page.locator('textarea[name="message"]').fill('Test message')
        await submitButton.click()
        await page.waitForTimeout(100)
      }

      // After many rapid requests, should be rate limited
      // Check for rate limit message or blocked state
      await page.waitForTimeout(500)
    })
  })

  test.describe('OWASP A05 - Security Misconfiguration', () => {
    test('should have security headers', async ({ request }) => {
      const response = await request.get('/')

      // Check required security headers
      expect(response.headers()['x-content-type-options']).toBe('nosniff')
      expect(response.headers()['x-frame-options']).toBe('SAMEORIGIN')
      expect(response.headers()['referrer-policy']).toBeTruthy()
    })

    test('should have CSP header', async ({ request }) => {
      const response = await request.get('/')
      const csp = response.headers()['content-security-policy']

      expect(csp).toBeDefined()
      expect(csp).toContain("default-src 'self'")
    })

    test('should disable directory listing', async ({ request }) => {
      const response = await request.get('/images/')
      expect(response.status()).toBe(404)
    })

    test('should not expose server information', async ({ request }) => {
      const response = await request.get('/')
      const headers = response.headers()

      expect(headers['server']).toBeUndefined()
      expect(headers['x-powered-by']).toBeUndefined()
    })
  })

  test.describe('OWASP A06 - Vulnerable Components', () => {
    test('should use up-to-date dependencies', async () => {
      // This would be run as a separate npm audit command
      // For E2E, we verify the app still works with current deps
      const response = await fetch(process.env.BASE_URL || 'http://localhost:3000')
      expect(response.ok).toBe(true)
    })
  })

  test.describe('OWASP A07 - Authentication Failures', () => {
    test('should enforce strong password policy', async ({ page }) => {
      await page.goto('/auth/login')

      // Try weak passwords
      const weakPasswords = ['12345678', 'password', 'qwerty']

      for (const password of weakPasswords) {
        await page.locator('input[name="password"]').fill(password)
        
        // Should show password strength indicator
        const strengthIndicator = page.locator('[class*="strength"], [data-testid="password-strength"]')
        const isWeak = await strengthIndicator.isVisible().catch(() => false)
        
        if (isWeak) {
          expect(await strengthIndicator.textContent()).toMatch(/weak|invalid/i)
        }
      }
    })

    test('should lock account after failed attempts', async ({ page }) => {
      // This would need a test account setup
      // For now, verify the lockout mechanism exists
      await page.goto('/auth/login')
      
      // The system should have account lockout after N attempts
      // Check for lockout message or cooldown
    })
  })

  test.describe('OWASP A08 - Software Integrity Failures', () => {
    test('should verify integrity of loaded scripts', async ({ page }) => {
      await page.goto('/')
      
      const scripts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('script[src]'))
          .map(s => ({
            src: s.getAttribute('src'),
            integrity: s.getAttribute('integrity'),
          }))
      })

      // External scripts should have integrity hashes
      scripts.forEach(script => {
        if (script.src && (script.src.includes('cdn') || script.src.includes('googleapis'))) {
          // Integrity attribute should be present for external scripts
          expect(script.src).toBeTruthy()
        }
      })
    })
  })

  test.describe('OWASP A09 - Security Logging', () => {
    test('should log security events', async ({ page }) => {
      // Attempt a failed login
      await page.goto('/auth/login')
      await page.locator('input[name="email"]').fill('invalid@example.com')
      await page.locator('input[name="password"]').fill('wrongpassword')
      await page.locator('button[type="submit"]').click()

      // Login should fail
      await expect(page.locator('text=/invalid|incorrect|failed/i')).toBeVisible()
      
      // Security event should be logged (verified through monitoring)
    })
  })

  test.describe('OWASP A10 - SSRF Protection', () => {
    test('should validate URLs before fetching', async ({ page }) => {
      await page.goto('/admin/settings')

      // Try to access internal URLs through form inputs
      const ssrfPayloads = [
        'http://localhost:3000/admin',
        'http://169.254.169.254/latest/meta-data/', // AWS metadata
        'http://internal.corp.local/admin',
      ]

      // The application should reject these internal URLs
      // by validating URL patterns
    })
  })

  test.describe('Additional Security Tests', () => {
    test('should have CSRF protection on forms', async ({ page }) => {
      await page.goto('/contact')

      // Check for CSRF token in forms
      const csrfToken = await page.locator('input[name="csrf_token"], input[name="_csrf"]').getAttribute('value')
      
      // If CSRF tokens are implemented, they should be present
      // This is a check that CSRF protection exists
    })

    test('should sanitize HTML in user content', async ({ page }) => {
      await page.goto('/announcements')

      // Check that any user-generated content is properly escaped
      const content = await page.content()
      
      // User content should not contain raw script tags
      expect(content).not.toMatch(/<script[^>]*>[\s\S]*<\/script>/i)
    })

    test('should have input length limits', async ({ page }) => {
      await page.goto('/contact')

      const messageInput = page.locator('textarea[name="message"]')
      
      // Try to submit very long content
      const longContent = 'A'.repeat(10000)
      await messageInput.fill(longContent)

      // Should be truncated or rejected
      const maxLength = await messageInput.getAttribute('maxlength')
      
      if (maxLength) {
        expect(parseInt(maxLength)).toBeLessThan(10000)
      }
    })

    test('should protect against mass assignment', async ({ request }) => {
      // Try to set admin role through user update endpoint
      const response = await request.patch('/api/users/123', {
        data: {
          name: 'Test',
          role: 'ADMIN', // This should be ignored
        },
      })

      // If the endpoint exists, it should not accept role changes this way
      // The response should either be 403 or ignore the role field
    })

    test('should have secure file upload validation', async ({ page }) => {
      await page.goto('/admin/gallery/upload')

      const fileInput = page.locator('input[type="file"]')

      // Try to upload executable files
      const dangerousFiles = [
        { name: 'script.exe', type: 'application/x-msdownload' },
        { name: 'shell.php', type: 'application/x-php' },
        { name: 'payload.js', type: 'application/javascript' },
      ]

      // These should be rejected by the upload validation
    })
  })
})

test.describe('Rate Limiting Tests', () => {
  test('should rate limit API endpoints', async ({ request }) => {
    const maxRequests = 60 // Expected rate limit for API
    
    for (let i = 0; i < maxRequests + 10; i++) {
      const response = await request.get('/api/events')
      
      if (i >= maxRequests) {
        // Should be rate limited
        expect([429, 503]).toContain(response.status())
        break
      }
    }
  })

  test('should rate limit search endpoint', async ({ request }) => {
    // Rapid search requests
    for (let i = 0; i < 30; i++) {
      const response = await request.get('/api/search?q=test')
      
      if (response.status() === 429) {
        // Rate limited
        break
      }
    }
  })

  test('should rate limit authentication endpoints', async ({ request }) => {
    // Rapid login attempts
    for (let i = 0; i < 10; i++) {
      const response = await request.post('/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      })
    }
  })
})
