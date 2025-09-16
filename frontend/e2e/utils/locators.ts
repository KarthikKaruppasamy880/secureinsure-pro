import { Page, expect } from '@playwright/test';

export async function clickSmart(page: Page, primary: string, fallbacks: string[] = []) {
  const selectors = [primary, ...fallbacks];
  for (const s of selectors) {
    const el = page.locator(s);
    if (await el.first().count()) {
      await el.first().click({ trial: true }).catch(() => {});
      await el.first().click();
      return;
    }
  }
  throw new Error(`clickSmart: none matched: ${selectors.join(", ")}`);
}

export async function expectVisibleSmart(page: Page, sel: string | string[]) {
  const arr = Array.isArray(sel) ? sel : [sel];
  for (const s of arr) {
    const el = page.locator(s);
    if (await el.first().count()) {
      await expect(el.first()).toBeVisible();
      return;
    }
  }
  throw new Error(`expectVisibleSmart: none visible: ${arr.join(", ")}`);
}