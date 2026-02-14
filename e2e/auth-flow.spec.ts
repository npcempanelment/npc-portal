/**
 * E2E tests for authentication flows — registration, login, dashboard access.
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('should reject login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    // Should show error message
    await expect(page.locator('text=/invalid|error|failed/i')).toBeVisible({ timeout: 5000 });
  });

  test('should login with valid admin credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@npcindia.gov.in');
    await page.fill('input[type="password"]', 'NpcAdmin@2026');
    await page.click('button[type="submit"]');
    // Should redirect to dashboard or admin page
    await expect(page).toHaveURL(/\/(dashboard|admin)/, { timeout: 10000 });
  });

  test('should redirect unauthenticated user from empanelment form', async ({ page }) => {
    await page.goto('/apply/empanelment');
    // Should see login prompt or redirect
    await expect(page.locator('a[href="/login"]').first()).toBeVisible({ timeout: 5000 });
  });
});
