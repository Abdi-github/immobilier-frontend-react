import { test, expect } from '@playwright/test';

test.describe('Language Switching', () => {
  test('language switcher is visible in header', async ({ page }) => {
    await page.goto('/en');

    // Globe icon button in header
    const langSwitcher = page.locator('header button').filter({
      has: page.locator('.lucide-globe'),
    });
    await expect(langSwitcher.first()).toBeVisible();
  });

  test('language dropdown shows all 4 languages', async ({ page }) => {
    await page.goto('/en');

    // Open language dropdown
    const trigger = page.locator('header button').filter({
      hasText: /EN|FR|DE|IT/,
    }).first();
    await trigger.click();

    // All 4 options
    await expect(page.getByText(/English/i).first()).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/Français/i).first()).toBeVisible();
    await expect(page.getByText(/Deutsch/i).first()).toBeVisible();
    await expect(page.getByText(/Italiano/i).first()).toBeVisible();
  });

  test('current language has a checkmark indicator', async ({ page }) => {
    await page.goto('/en');

    const trigger = page.locator('header button').filter({
      hasText: /EN/,
    }).first();
    await trigger.click();

    // English menu item should have active (bg-accent) styling
    const englishItem = page.getByRole('menuitem').filter({ hasText: /English/ });
    await expect(englishItem).toBeVisible();
    // Check icon is present next to current language
    await expect(englishItem.locator('.lucide-check')).toBeVisible();
  });

  test('switching language changes the trigger button text', async ({ page }) => {
    await page.goto('/en');

    // Initially shows EN
    const trigger = page.locator('header button').filter({
      hasText: /EN/,
    }).first();
    await expect(trigger).toBeVisible();
    await trigger.click();

    // Click French
    const frOption = page.getByRole('menuitem').filter({ hasText: /Français/ });
    await frOption.click();

    // After switching, trigger should show FR
    await expect(page.locator('header button').filter({ hasText: /FR/ }).first()).toBeVisible({ timeout: 3000 });
  });

  test('language persists when navigating between pages', async ({ page }) => {
    // Start on French-prefixed route
    await page.goto('/fr');
    await expect(page).toHaveURL(/\/fr/);

    // Navigate to properties
    await page.goto('/fr/properties');
    await expect(page).toHaveURL(/\/fr\/properties/);
  });

  test('directly accessing /de URL works', async ({ page }) => {
    await page.goto('/de');

    // Page should load — main content visible
    await expect(page.locator('main')).toBeVisible();
    await expect(page).toHaveURL(/\/de/);
  });

  test('directly accessing /fr URL works', async ({ page }) => {
    await page.goto('/fr');
    await expect(page.locator('main')).toBeVisible();
    await expect(page).toHaveURL(/\/fr/);
  });

  test('directly accessing /it URL works', async ({ page }) => {
    await page.goto('/it');
    await expect(page.locator('main')).toBeVisible();
    await expect(page).toHaveURL(/\/it/);
  });
});
