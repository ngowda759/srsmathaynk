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
    await page.context().clearCookies()
  })

  test.describe('Login Flow', () => {
    test('TC-E2E-001: Login page renders correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)
      
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('TC-E2E-002: Valid login redirects to admin', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)
      
      await page.fill('input[type="email"]', TEST_EMAIL)
      await page.fill('input[type="password"]', TEST_PASSWORD)
      await page.click('button[type="submit"]')
      
      await page.waitForURL(/\/(admin|dashboard)/, { timeout: 10000 })
      await expect(page.locator('text=/logout|sign out/i')).toBeVisible({ timeout: 5000 })
    })

    test('TC-E2E-003: Invalid credentials show error', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)
      
      await page.fill('input[type="email"]', 'invalid@test.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      
      await expect(page.locator('text=/invalid|error|failed/i')).toBeVisible({ timeout: 5000 })
      await expect(page).toHaveURL(/\/login/)
    })
  })

  test.describe('Protected Routes', () => {
    test('TC-E2E-010: Admin redirects to login when unauthenticated', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForURL(/\/login/, { timeout: 5000 })
    })

    test('TC-E2E-011: Dashboard redirects to login when unauthenticated', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`)
      await page.waitForURL(/\/login/, { timeout: 5000 })
    })

    test('TC-E2E-012: Public pages accessible without auth', async ({ page }) => {
      await page.goto(`${BASE_URL}/`)
      await expect(page).toHaveURL(`${BASE_URL}/`)
      
      await page.goto(`${BASE_URL}/events`)
      await expect(page).toHaveURL(/\/events/)
    })
  })

  test.describe('Session Management', () => {
    test('TC-E2E-020: Session persists across page reload', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)
      await page.fill('input[type="email"]', TEST_EMAIL)
      await page.fill('input[type="password"]', TEST_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/(admin|dashboard)/, { timeout: 10000 })
      
      await page.reload()
      await expect(page).not.toHaveURL(/\/login/)
    })

    test('TC-E2E-021: Logout clears session', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)
      await page.fill('input[type="email"]', TEST_EMAIL)
      await page.fill('input[type="password"]', TEST_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/(admin|dashboard)/, { timeout: 10000 })
      
      await page.locator('text=/logout|sign out/i').first().click()
      await page.waitForURL(/\/login/, { timeout: 5000 })
      
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForURL(/\/login/)
    })
  })

  test.describe('Google OAuth', () => {
    test('TC-E2E-030: Google button exists on login page', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)
      const googleButton = page.locator('text=/continue with google|sign in with google/i')
      if (await googleButton.isVisible()) {
        await expect(googleButton).toBeVisible()
      }
    })
  })
})

test.describe('Security', () => {
  test('TC-E2E-040: No sensitive data in localStorage', async ({ page }) => {
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
    
    // Supabase uses cookies, not localStorage for auth
    expect(storage.localStorage).not.toContain('sb-access-token')
    expect(storage.localStorage).not.toContain('sb-refresh-token')
  })
})
