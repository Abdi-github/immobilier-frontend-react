import { test, expect } from '@playwright/test';

test.describe('Homepage & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
  });

  test('loads the homepage with hero section', async ({ page }) => {
    // Hero title from HeroSearch
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/find your dream property/i)).toBeVisible();

    // Search button (icon-only, contains svg)
    const searchBtn = page.locator('button').filter({ has: page.locator('.lucide-search') });
    await expect(searchBtn.first()).toBeVisible();
  });

  test('hero has section tabs and transaction toggle', async ({ page }) => {
    // Section tabs
    await expect(page.getByText('Residential').first()).toBeVisible();
    await expect(page.getByText('Commercial').first()).toBeVisible();

    // Transaction type radio
    await expect(page.getByText('Buy').first()).toBeVisible();
    await expect(page.getByText('Rent').first()).toBeVisible();
  });

  test('header shows logo and navigation links', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Logo link
    await expect(header.locator('a').first()).toBeVisible();

    // Desktop nav
    await expect(header.getByText(/residential/i).first()).toBeVisible();
  });

  test('footer is visible with links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Footer uses "Who are we?" and "Get in touch with us"
    await expect(footer.getByText(/who are we/i).first()).toBeVisible();
    await expect(footer.getByText(/get in touch/i).first()).toBeVisible();
  });

  test('navigating to properties page via nav', async ({ page }) => {
    const header = page.locator('header');
    await header.getByRole('link', { name: /residential/i }).first().click();
    await page.waitForURL('**/properties**');
    await expect(page).toHaveURL(/\/en\/properties/);
  });

  test('homepage shows featured properties section', async ({ page }) => {
    const featuredSection = page.getByText(/featured properties/i).first();
    await expect(featuredSection).toBeVisible();
  });

  test('homepage shows services section', async ({ page }) => {
    await expect(page.getByText(/our services to support you/i)).toBeVisible();
  });

  test('404 page displayed for unknown routes', async ({ page }) => {
    await page.goto('/en/this-page-does-not-exist');
    await expect(page.getByText(/not found|404/i).first()).toBeVisible();
  });

  test('root URL redirects to language-prefixed route', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/en**');
    await expect(page).toHaveURL(/\/en/);
  });
});
