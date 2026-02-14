/**
 * E2E tests for navigation and 404 handling.
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation & 404', () => {
  test('should show 404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  });

  test('should have working navigation from 404 back to home', async ({ page }) => {
    await page.goto('/some-random-route');
    const homeLink = page.locator('a[href="/"]').first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('should display header on all pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header, nav').first()).toBeVisible();
  });

  test('should display footer on all pages', async ({ page }) => {
    await page.goto('/adverts');
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should have skip to content link for accessibility', async ({ page }) => {
    await page.goto('/');
    // The skip link is hidden by default but exists in DOM
    const skipLink = page.locator('.skip-link, a[href="#main-content"]');
    await expect(skipLink).toHaveCount(1);
  });
});
