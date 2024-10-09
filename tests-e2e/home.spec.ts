import { test } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://lgtmeow.com/');

  await page.getByText('LGTMeow').click();
});
