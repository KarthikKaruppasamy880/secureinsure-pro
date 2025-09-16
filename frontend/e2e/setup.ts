import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      const type = msg.type();
      if (type === 'error') errors.push(`[console.${type}] ${msg.text()}`);
    });

    page.on('response', (resp) => {
      const url = resp.url();
      const status = resp.status();
      if (status >= 400 && !url.endsWith('/sourceMap')) {
        errors.push(`[network ${status}] ${url}`);
      }
    });

    await use(page);

    if (errors.length) {
      throw new Error(`Console/Network failures:\n${errors.join('\n')}`);
    }
  },
});

export const expect = base.expect;
