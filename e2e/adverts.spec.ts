/**
 * E2E tests for the public adverts (open positions) page.
 */

import { test, expect } from '@playwright/test';

test.describe('Open Positions Page', () => {
  test('should load the adverts listing page', async ({ page }) => {
    await page.goto('/adverts');
    await expect(page).toHaveTitle(/NPC/);
    // Should show a heading for open positions
    await expect(page.locator('text=/open positions|current openings|contractual/i').first()).toBeVisible();
  });

  test('should display advert cards or empty message', async ({ page }) => {
    await page.goto('/adverts');
    // Either show advert cards or "no positions" message
    const hasAdverts = await page.locator('[class*="card"], [style*="border"]').count();
    const hasEmpty = await page.locator('text=/no positions|no openings|no adverts/i').count();
    expect(hasAdverts + hasEmpty).toBeGreaterThan(0);
  });

  test('should have working navigation back to home', async ({ page }) => {
    await page.goto('/adverts');
    // Click on Home or logo
    const homeLink = page.locator('a[href="/"]').first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});
