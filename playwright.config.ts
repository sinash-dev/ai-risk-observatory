import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  retries: 1,
  timeout: 45_000,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4173', trace: 'off' },
  webServer: { command: 'npm run preview -- --port 4173 --strictPort', port: 4173, reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
});
