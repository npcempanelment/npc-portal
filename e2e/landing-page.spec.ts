/**
 * E2E tests for the public landing page.
 */

import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load the homepage with NPC branding', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/NPC/);
    // Hero section should be visible
    await expect(page.getByRole('heading', { name: 'National Productivity Council' })).toBeVisible();
  });

  test('should display two engagement pathway cards', async ({ page }) => {
    await page.goto('/');
    // Look for empanelment and contractual sections
    await expect(page.locator('text=Empanelment').first()).toBeVisible();
    await expect(page.locator('text=Contractual').first()).toBeVisible();
  });

  test('should have navigation buttons', async ({ page }) => {
    await page.goto('/');
    // CTA buttons
    const applyBtn = page.locator('a[href="/apply/empanelment"]').first();
    await expect(applyBtn).toBeVisible();
  });

  test('should display footer with contact info', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('text=011-24690331')).toBeVisible();
  });

  test('should navigate to adverts page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/adverts"]');
    await expect(page).toHaveURL(/\/adverts/);
  });
});
