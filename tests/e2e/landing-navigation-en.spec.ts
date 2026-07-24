import { expect, test } from '@playwright/test';

test('landing chat link preserves English locale', async ({ page }) => {
    await page.goto('/en');
    const chatLink = page.getByRole('navigation').getByRole('link', { name: 'Chat' });
    await expect(chatLink).toHaveAttribute('href', '/en/chat');
});

test('landing brand link preserves English locale', async ({ page }) => {
    await page.goto('/en');
    const brandLink = page.getByRole('link', { name: 'Afalambe' }).first();
    await expect(brandLink).toHaveAttribute('href', '/en');
});
