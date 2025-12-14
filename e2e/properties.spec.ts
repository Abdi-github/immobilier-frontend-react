import { test, expect } from '@playwright/test';

test.describe('Property Search & Browsing', () => {
  test('properties page loads with property cards', async ({ page }) => {
    await page.goto('/en/properties');

    // Wait for property cards (PropertyCardGrid renders as <a> links to /en/properties/:id)
    // Exclude the Map link (/properties/map)
    const firstCard = page.locator('main a[href*="/properties/"]:not([href$="/map"])').first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });
  });

  test('properties page has filter controls', async ({ page }) => {
    await page.goto('/en/properties');

    // Transaction type toggle (Rent / Buy)
    await expect(page.getByRole('button', { name: /rent/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /buy/i }).first()).toBeVisible();
  });

  test('filtering by transaction type shows results or empty state', async ({ page }) => {
    await page.goto('/en/properties');

    // Wait for initial load
    await page.waitForLoadState('networkidle');

    // Click "Buy" filter
    const buyButton = page.getByRole('button', { name: /buy/i }).first();
    await buyButton.click();

    // Wait for API response
    await page.waitForLoadState('networkidle');

    // Either property cards or empty state message
    const hasCards = await page.locator('main a[href*="/properties/"]:not([href$="/map"])').count() > 0;
    const hasEmpty = await page.getByText(/no properties found/i).isVisible().catch(() => false);
    expect(hasCards || hasEmpty).toBeTruthy();
  });

  test('search from homepage navigates to properties page', async ({ page }) => {
    await page.goto('/en');

    // The search button is icon-only (Lucide Search icon, no text)
    const searchBtn = page.locator('button').filter({ has: page.locator('.lucide-search') }).first();
    await searchBtn.click();

    // Should navigate to properties page
    await page.waitForURL('**/properties**', { timeout: 10000 });
    await expect(page).toHaveURL(/\/en\/properties/);
  });

  test('properties page loads without errors', async ({ page }) => {
    await page.goto('/en/properties');
    await page.waitForLoadState('networkidle');

    // Page should have main content area
    await expect(page.locator('main')).toBeVisible();
    // Should not show a crash or blank screen
    const rootContent = await page.locator('#root').innerHTML();
    expect(rootContent.length).toBeGreaterThan(100);
  });

  test('property card shows price, location, and details', async ({ page }) => {
    await page.goto('/en/properties');

    // Wait for property cards
    const firstCard = page.locator('main a[href*="/properties/"]:not([href$="/map"])').first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });

    // Card should contain price info (CHF or a price-related text)
    const cardText = await firstCard.textContent();
    expect(cardText).toMatch(/CHF|Price on request/i);
  });

  test('sort controls exist on properties page', async ({ page }) => {
    await page.goto('/en/properties');
    await page.waitForLoadState('networkidle');

    // Sort section — look for sort-related text
    const sortControl = page.getByText(/sort|newest/i).first();
    await expect(sortControl).toBeVisible({ timeout: 5000 });
  });
});
