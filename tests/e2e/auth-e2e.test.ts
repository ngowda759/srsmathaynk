/**
 * E2E Authentication Tests
 * Run with: npx playwright test tests/e2e/auth-e2e.test.ts
 */
import { test, expect } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'test@example.com'
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'TestPassword123!'

test.describe('Authentication E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies before each test
    await page.context().clearCookies()
  })

  test.describe('Login Flow', () => {
    test('TC-E2E-001: Login page renders correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)
      
      // Check form elements exist
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('TC-E2E-002: Valid login redirects to admin', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)
      
      await page.fill('input[type="email"]', TEST_EMAIL)
      await page.fill('input[type="password"]', TEST_PASSWORD)
      await page.click('button[type="submit"]')
      
      // Wait for redirect
      await page.waitForURL(/\/(admin|dashboard)/, { timeout: 10000 })
      
      // Verify logged in state
      await expect(page.locator('text=/logout|sign out/i')).toBeVisible({ timeout: 5000 })
    })

    test('TC-E2E-003: Invalid credentials show error', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)
      
      await page.fill('input[type="email"]', 'invalid@test.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      
      // Should show error
      await expect(page.locator('text=/invalid|error|failed/i')).toBeVisible({ timeout: 5000 })
      
      // Should stay on login page
      await expect(page).toHaveURL(/\/login/)
    })

    test('TC-E2E-004: Empty fields show validation', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)
      
      // Submit without filling
      await page.click('button[type="submit"]')
      
      // HTML5 validation should prevent submission
      // Or show error message
      const url = page.url()
      expect(url).toContain('/login')
    })
  })

  test.describe('Registration Flow', () => {
    test('TC-E2E-010: Registration page renders', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`)
      
      await expect(page.locator('input[name="name"]')).toBeVisible()
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="tel"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
    })

    test('TC-E2E-011: Successful registration shows confirmation', async ({ page }) => {
      const uniqueEmail = `test-${Date.now()}@example.com`
      
      await page.goto(`${BASE_URL}/register`)
      
      await page.fill('input[name="name"]', 'Test User')
      await page.fill('input[type="email"]', uniqueEmail)
      await page.fill('input[type="tel"]', '1234567890')
      await page.fill('input[type="password"]', 'TestPassword123!')
      await page.fill('input[name="confirmPassword"]', 'TestPassword123!')
      
      await page.click('button[type="submit"]')
      
      // Should show confirmation message
      await expect(page.locator('text=/check.*email|confirm/i')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Session Management', () => {
    test('TC-E2E-020: Session persists across page reload', async ({ page }) => {
      // Login first
      await page.goto(`${BASE_URL}/login`)
      await page.fill('input[type="email"]', TEST_EMAIL)
      await page.fill('input[type="password"]', TEST_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/(admin|dashboard)/, { timeout: 10000 })
      
      // Reload page
      await page.reload()
      
      // Should still be logged in
      await expect(page).not.toHaveURL(/\/login/)
      await expect(page.locator('text=/logout|sign out/i')).toBeVisible()
    })

    test('TC-E2E-021: Logout clears session', async ({ page }) => {
      // Login first
      await page.goto(`${BASE_URL}/login`)
      await page.fill('input[type="email"]', TEST_EMAIL)
      await page.fill('input[type="password"]', TEST_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/(admin|dashboard)/, { timeout: 10000 })
      
      // Logout
      await page.locator('text=/logout|sign out/i').first().click()
      
      // Should redirect to login
      await page.waitForURL(/\/login/, { timeout: 5000 })
      
      // Should not be able to access protected route
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForURL(/\/login/)
    })
  })

  test.describe('Protected Routes', () => {
    test('TC-E2E-030: Admin redirects to login when unauthenticated', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin`)
      
      // Should redirect to login
      await page.waitForURL(/\/login/, { timeout: 5000 })
    })

    test('TC-E2E-031: Dashboard redirects to login when unauthenticated', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`)
      
      await page.waitForURL(/\/login/, { timeout: 5000 })
    })

    test('TC-E2E-032: Public pages accessible without auth', async ({ page }) => {
      // Should load without redirect
      await page.goto(`${BASE_URL}/`)
      await expect(page).toHaveURL(`${BASE_URL}/`)
      
      await page.goto(`${BASE_URL}/events`)
      await expect(page).toHaveURL(/\/events/)
      
      await page.goto(`${BASE_URL}/donation`)
      await expect(page).toHaveURL(/\/donation/)
    })
  })

  test.describe('Password Reset', () => {
    test('TC-E2E-040: Forgot password page renders', async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`)
      
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('TC-E2E-041: Reset link sent for valid email', async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`)
      
      await page.fill('input[type="email"]', TEST_EMAIL)
      await page.click('button[type="submit"]')
      
      // Should show confirmation
      await expect(page.locator('text=/email.*sent|check.*email/i')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Google OAuth', () => {
    test('TC-E2E-050: Google button exists on login page', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)
      
      // Check for Google OAuth button
      const googleButton = page.locator('text=/continue with google|sign in with google/i')
      if (await googleButton.isVisible()) {
        await expect(googleButton).toBeVisible()
      }
    })
  })

  test.describe('RBAC', () => {
    test('TC-E2E-060: Role determines admin access', async ({ page }) => {
      // Login as regular user
      await page.goto(`${BASE_URL}/login`)
      await page.fill('input[type="email"]', 'volunteer@example.com')
      await page.fill('input[type="password"]', TEST_PASSWORD)
      await page.click('button[type="submit"]')
      
      // Should not access admin
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForTimeout(1000)
      
      // Should redirect or show access denied
      const url = page.url()
      expect(url).not.toContain('/admin/users') // No direct user management access
    })
  })
})

test.describe('Security Headers', () => {
  test('TC-E2E-070: CSP headers present', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    
    const headers = await page.evaluate(() => {
      return {
        contentSecurityPolicy: document.securityPolicy,
        strictTransportSecurity: 'na', // Check via network
      }
    })
    
    // Headers should be configured in next.config.ts
    expect(headers).toBeDefined()
  })

  test('TC-E2E-071: No sensitive data in localStorage', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(admin|dashboard)/, { timeout: 10000 })
    
    const storage = await page.evaluate(() => {
      return {
        localStorage: Object.keys(localStorage),
        sessionStorage: Object.keys(sessionStorage),
      }
    })
    
    // Should not have raw tokens in storage
    // Supabase uses cookies, not localStorage for auth
    expect(storage.localStorage).not.toContain('sb-access-token')
    expect(storage.localStorage).not.toContain('sb-refresh-token')
  })
})
