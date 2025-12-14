import { test, expect } from '@playwright/test';

test.describe('Property Detail Page', () => {
  // Helper: navigate to first property detail
  async function goToFirstProperty(page: import('@playwright/test').Page) {
    await page.goto('/en/properties');
    // PropertyCardGrid renders as <a> links — exclude Map link
    const firstCard = page.locator('main a[href*="/properties/"]:not([href$="/map"])').first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });
    await firstCard.click();
    await page.waitForURL(/\/en\/properties\/[a-f0-9]{24}/, { timeout: 10000 });
  }

  test('clicking a property card opens detail page', async ({ page }) => {
    await goToFirstProperty(page);
    await expect(page).toHaveURL(/\/en\/properties\/[a-zA-Z0-9]/);
  });

  test('detail page shows property title', async ({ page }) => {
    await goToFirstProperty(page);

    // Title/heading should be visible
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    const text = await heading.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });

  test('detail page shows price information', async ({ page }) => {
    await goToFirstProperty(page);

    await expect(
      page.getByText(/CHF|Price on request/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('detail page shows property images', async ({ page }) => {
    await goToFirstProperty(page);

    // At least one image
    const image = page.locator('img').first();
    await expect(image).toBeVisible({ timeout: 5000 });
  });

  test('detail page has contact/inquiry section', async ({ page }) => {
    await goToFirstProperty(page);

    // Contact or inquiry form/section
    const contactSection = page.getByText(/contact|inquiry|interested|send message/i).first();
    await expect(contactSection).toBeVisible({ timeout: 5000 });
  });

  test('detail page shows location info', async ({ page }) => {
    await goToFirstProperty(page);

    const location = page.getByText(/location|address|map/i).first().or(
      page.locator('[class*="location"], [class*="address"]').first()
    );
    await expect(location).toBeVisible({ timeout: 5000 });
  });

  test('back navigation returns to property list', async ({ page }) => {
    await goToFirstProperty(page);

    // Go back
    await page.goBack();
    await page.waitForURL('**/properties', { timeout: 5000 });
    await expect(page).toHaveURL(/\/en\/properties/);
  });
});
