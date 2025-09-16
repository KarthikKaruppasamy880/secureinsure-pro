import type { FullConfig, Page } from '@playwright/test';

function attachGuards(page: Page) {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      const ignore = [/react-devtools/i];
      if (!ignore.some(r => r.test(text))) throw new Error(`[ConsoleError] ${text}`);
    }
  });
  page.on('response', async (res) => {
    const s = res.status();
    if (s >= 400) {
      const url = res.url();
      const tolerated = [/\/auth\/validate$/, /\/ws$/];
      if (!tolerated.some(r => r.test(url))) throw new Error(`[HTTP ${s}] ${url}`);
    }
  });
}

export default async function globalSetup(_: FullConfig) {
  // guards are attached in tests via fixtures; nothing else required
}
