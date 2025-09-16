import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 60_000,
  retries: 2,
  reporter: [['list'], ['html']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  testIgnore: [
    '**/__tests__/**',
    '**/src/**/*.test.*',
    '**/src/**/*.spec.*'
  ],
});