import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('sign-in page is accessible', async ({ page }) => {
    await page.goto('/en/sign-in');

    // Login form — email input
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    // Password input
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('sign-in page has submit button', async ({ page }) => {
    await page.goto('/en/sign-in');

    const submitBtn = page.getByRole('button', { name: /log in/i });
    await expect(submitBtn).toBeVisible({ timeout: 5000 });
  });

  test('sign-in page has link to register', async ({ page }) => {
    await page.goto('/en/sign-in');

    // "Create an account" link
    const registerLink = page.getByText(/create an account/i).first();
    await expect(registerLink).toBeVisible({ timeout: 5000 });
  });

  test('sign-in submit button is disabled when fields are empty', async ({ page }) => {
    await page.goto('/en/sign-in');

    // Submit button should be disabled when inputs are empty
    const submitBtn = page.getByRole('button', { name: /log in/i });
    await expect(submitBtn).toBeVisible({ timeout: 5000 });
    await expect(submitBtn).toBeDisabled();
  });

  test('wrong credentials show error message', async ({ page }) => {
    await page.goto('/en/sign-in');

    // Fill in wrong credentials
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('wrong@example.com');

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('wrongpassword123');

    // Submit
    const submitBtn = page.getByRole('button', { name: /log in/i });
    await submitBtn.click();

    // Should show error
    const error = page.getByText(/invalid|incorrect|error|failed/i).first();
    await expect(error).toBeVisible({ timeout: 10000 });
  });

  test('register page is accessible', async ({ page }) => {
    await page.goto('/en/create-an-account');

    // Registration form — heading
    await expect(page.getByText(/create an account/i).first()).toBeVisible({ timeout: 5000 });

    // Email field
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    // Password field
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('register page has individual and professional tabs', async ({ page }) => {
    await page.goto('/en/create-an-account');

    await expect(page.getByText(/individual/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/professional/i).first()).toBeVisible();
  });

  test('register page has submit button', async ({ page }) => {
    await page.goto('/en/create-an-account');

    const submitBtn = page.getByRole('button', { name: /create an account/i });
    await expect(submitBtn).toBeVisible({ timeout: 5000 });
  });

  test('unauthenticated users are redirected from dashboard', async ({ page }) => {
    await page.goto('/en/dashboard/profile');

    // Should redirect to sign-in
    await page.waitForURL('**/sign-in**', { timeout: 5000 });
    await expect(page).toHaveURL(/sign-in/);
  });

  test('header has sign-in access for unauthenticated users', async ({ page }) => {
    await page.goto('/en');

    // The header contains links to sign-in for unauthenticated users
    const header = page.locator('header');
    const signInLinks = header.locator('a[href*="/sign-in"]');
    const count = await signInLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});
