import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * End-to-end tests run against the production build:
 *   npm run build
 *   npm run test:e2e
 * An already-running server on the same port is reused locally.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  // One worker locally: on the Windows dev machine, parallel browsers intermittently stalled
  // first page loads (3 workers: 3–5 of 46 failed; 1 worker: 46/46 in ~45 s).
  workers: process.env.CI ? 2 : 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://localhost:${PORT}`,
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `node node_modules/next/dist/bin/next start -p ${PORT}`,
    url: `http://localhost:${PORT}/robots.txt`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
