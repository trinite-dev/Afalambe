import { expect, test } from '@playwright/test';

test('sign-in page renders English form controls', async ({ page }) => {
    await page.goto('/en/sign-in');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('sign-up page renders English form controls', async ({ page }) => {
    await page.goto('/en/sign-up');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
});

test('forgot-password page renders English reset form', async ({ page }) => {
    await page.goto('/en/forgot-password');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send reset link' })).toBeVisible();
});
