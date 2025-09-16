import { Page, Locator, expect } from '@playwright/test';

export async function getFirst(page: Page, selectors: string[]): Promise<Locator> {
  for (const sel of selectors) {
    const loc = page.locator(sel);
    if (await loc.first().count()) return loc.first();
  }
  throw new Error(`None of selectors matched: ${selectors.join(' | ')}`);
}

export async function clickFirst(page: Page, sels: string[]) {
  const loc = await getFirst(page, sels);
  await loc.click({ timeout: 10000 });
}

export async function expectVisible(page: Page, sels: string[]) {
  const loc = await getFirst(page, sels);
  await expect(loc).toBeVisible();
}
