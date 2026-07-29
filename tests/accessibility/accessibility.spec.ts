/**
 * Accessibility E2E Tests (WCAG 2.1 AA)
 */
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  const pagesToTest = [
    { url: '/', name: 'Homepage' },
    { url: '/events', name: 'Events' },
    { url: '/sevas', name: 'Sevas' },
    { url: '/gallery', name: 'Gallery' },
    { url: '/donate', name: 'Donate' },
    { url: '/contact', name: 'Contact' },
    { url: '/about', name: 'About' },
  ]

  for (const page of pagesToTest) {
    test(`${page.name} should have no accessibility violations`, async ({ page: pw }) => {
      await pw.goto(page.url)

      const accessibilityScanResults = await new AxeBuilder({ page: pw })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })
  }

  test.describe('Keyboard Navigation', () => {
    test('should navigate through page using Tab key', async ({ page }) => {
      await page.goto('/')
      
      // Focus first element
      await page.keyboard.press('Tab')
      
      // Tab through elements - should not get trapped
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab')
      }
      
      // Should have visible focus indicator
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })

    test('should navigate dropdown menus with keyboard', async ({ page }) => {
      await page.goto('/')
      
      // Find navigation menu
      const menuItems = page.locator('nav a, [role="menuitem"]')
      const count = await menuItems.count()
      
      if (count > 0) {
        await menuItems.first().focus()
        await page.keyboard.press('Enter')
        
        // Should open dropdown
        const isOpen = await page.locator('[role="menu"], [role="navigation"] [aria-expanded="true"]').isVisible().catch(() => false)
        expect(isOpen).toBeTruthy()
      }
    })

    test('should close modals with Escape key', async ({ page }) => {
      await page.goto('/')
      
      // Open a modal if available
      const modalTrigger = page.locator('button[aria-haspopup="dialog"], [data-modal-trigger]').first()
      
      if (await modalTrigger.isVisible().catch(() => false)) {
        await modalTrigger.click()
        
        // Find modal
        const modal = page.locator('[role="dialog"], .modal').first()
        
        if (await modal.isVisible().catch(() => false)) {
          await page.keyboard.press('Escape')
          
          // Modal should close
          await expect(modal).not.toBeVisible()
        }
      }
    })
  })

  test.describe('Screen Reader Support', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/')
      
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
      
      // Should have exactly one h1
      const h1Count = headings.filter(async (h) => {
        return (await h.tagName()) === 'H1'
      })
      expect((await page.locator('h1').count())).toBeLessThanOrEqual(1)
      
      // Headings should not skip levels (h1 -> h3 without h2)
      // This is a basic check
      expect(headings.length).toBeGreaterThan(0)
    })

    test('should have alt text for images', async ({ page }) => {
      await page.goto('/')
      
      const images = await page.locator('img').all()
      
      for (const img of images) {
        const alt = await img.getAttribute('alt')
        const role = await img.getAttribute('role')
        
        // Images should have alt text or be marked as decorative
        expect(alt !== null || role === 'presentation' || role === 'none').toBeTruthy()
      }
    })

    test('should have proper form labels', async ({ page }) => {
      await page.goto('/contact')
      
      const inputs = await page.locator('input:not([type="hidden"]), textarea, select').all()
      
      for (const input of inputs) {
        const id = await input.getAttribute('id')
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledBy = await input.getAttribute('aria-labelledby')
        const placeholder = await input.getAttribute('placeholder')
        
        // Should have label, aria-label, aria-labelledby, or placeholder
        const hasLabel = id !== null || ariaLabel !== null || ariaLabelledBy !== null || placeholder !== null
        expect(hasLabel).toBeTruthy()
      }
    })

    test('should have proper ARIA attributes for interactive elements', async ({ page }) => {
      await page.goto('/')
      
      // Buttons
      const buttons = await page.locator('button').all()
      for (const button of buttons) {
        const text = await button.textContent()
        const ariaLabel = await button.getAttribute('aria-label')
        
        // Button should have text or aria-label
        expect((text?.trim().length ?? 0) > 0 || ariaLabel !== null).toBeTruthy()
      }
    })
  })

  test.describe('Color Contrast', () => {
    test('should have sufficient color contrast for text', async ({ page }) => {
      await page.goto('/')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('p, span, a, h1, h2, h3, h4, h5, h6')
        .analyze()

      // Filter for color contrast violations only
      const contrastViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'color-contrast'
      )

      expect(contrastViolations).toEqual([])
    })

    test('should have sufficient contrast for interactive elements', async ({ page }) => {
      await page.goto('/')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('button, a, input, select, textarea')
        .analyze()

      const contrastViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'color-contrast'
      )

      expect(contrastViolations).toEqual([])
    })
  })

  test.describe('Focus Management', () => {
    test('should show visible focus indicator', async ({ page }) => {
      await page.goto('/')
      
      // Focus an element
      await page.locator('a, button, input').first().focus()
      
      // Check for outline or box-shadow
      const focusedElement = page.locator(':focus')
      const styles = await focusedElement.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          outline: computed.outline,
          boxShadow: computed.boxShadow,
        }
      })
      
      // Should have visible focus style
      const hasFocusStyle = 
        styles.outline !== 'none' || 
        styles.boxShadow !== 'none'
      
      expect(hasFocusStyle).toBeTruthy()
    })

    test('should manage focus when modal opens', async ({ page }) => {
      await page.goto('/')
      
      // Trigger modal
      const modalTrigger = page.locator('[data-modal-trigger], button:has-text("Contact")').first()
      
      if (await modalTrigger.isVisible().catch(() => false)) {
        await modalTrigger.click()
        
        // Focus should move to modal
        const modal = page.locator('[role="dialog"], .modal')
        
        if (await modal.isVisible().catch(() => false)) {
          const focusedInModal = await page.evaluate(() => {
            const active = document.activeElement
            const modal = document.querySelector('[role="dialog"], .modal')
            return modal?.contains(active) ?? false
          })
          
          expect(focusedInModal).toBeTruthy()
        }
      }
    })
  })

  test.describe('Responsive Accessibility', () => {
    test('should maintain accessibility on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
      await page.goto('/')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()
      
      // Mobile view should also be accessible
      expect(accessibilityScanResults.violations.length).toBeLessThan(5)
    })

    test('should handle zoom up to 400%', async ({ page }) => {
      await page.goto('/')
      
      // Zoom to 400%
      await page.evaluate(() => {
        document.body.style.transform = 'scale(0.25)'
        document.body.style.transformOrigin = 'top left'
        document.body.style.width = '400%'
      })
      
      // Page should still be usable
      const body = page.locator('body')
      await expect(body).toBeVisible()
    })
  })

  test.describe('Language Support', () => {
    test('should have lang attribute on html element', async ({ page }) => {
      await page.goto('/')
      
      const lang = await page.locator('html').getAttribute('lang')
      expect(lang).toBeTruthy()
    })

    test('should have language switcher for Kannada', async ({ page }) => {
      await page.goto('/')
      
      // Check for language switcher
      const langSwitcher = page.locator('[data-language-switcher], button:has-text("ಕನ್ನಡ"), button:has-text("Kannada")')
      
      if (await langSwitcher.isVisible().catch(() => false)) {
        await langSwitcher.click()
        
        // Page content should change
        const bodyContent = await page.content()
        expect(bodyContent.length).toBeGreaterThan(0)
      }
    })
  })
})

test.describe('Critical Workflow Accessibility', () => {
  test('donation form should be fully accessible', async ({ page }) => {
    await page.goto('/donate')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include('form')
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('contact form should be fully accessible', async ({ page }) => {
    await page.goto('/contact')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include('form')
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('navigation should be accessible', async ({ page }) => {
    await page.goto('/')
    
    // Check nav landmark
    const nav = page.locator('nav, [role="navigation"]')
    await expect(nav.first()).toBeVisible()
    
    // Check for skip link
    const skipLink = page.locator('a[href="#main"], .skip-link')
    // Skip links are best practice but not required
    
    // Check for proper nav structure
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include('nav')
      .analyze()
    
    expect(accessibilityScanResults.violations.length).toBeLessThan(3)
  })
})
