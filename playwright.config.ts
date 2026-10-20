import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', testMatch: '**/*.pw.ts', fullyParallel: false, workers: 1,
  timeout: 45000, expect: { timeout: 15000 }, reporter: 'list',
  use: { channel: 'msedge', headless: true, baseURL: 'http://127.0.0.1:5175', viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure' },
  webServer: { command: 'npm.cmd run dev -- --host 127.0.0.1 --port 5175 --strictPort', url: 'http://127.0.0.1:5175', reuseExistingServer: false, timeout: 30000 },
});
