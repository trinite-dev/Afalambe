import { expect, test } from '@playwright/test';

test('landing chat link uses French path', async ({ page }) => {
    await page.goto('/');
    const chatLink = page.getByRole('navigation').getByRole('link', { name: 'Chat' });
    await expect(chatLink).toHaveAttribute('href', '/chat');
});
