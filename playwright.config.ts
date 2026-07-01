import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

// Running multiple real, visible browser windows in parallel can still
// starve a slow render thread on a constrained host, so headed local runs
// stay single-worker as a safety margin. Detected directly from argv so this
// works no matter how `playwright test --headed` is invoked — it doesn't
// depend on any npm script setting an env var.
//
// Note: WebKit's specific headed failures (timeouts during "setting up
// page" itself, even single-worker) turned out to be a separate, host-level
// issue — this environment can't reliably render a real WebKit window
// (headless WebKit passed 50/50 cleanly). See the `webkit` project below,
// which forces headless regardless of this flag.
const isHeaded = process.argv.includes('--headed') || process.env.HEADLESS === 'false';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // Force single-worker execution for headed local runs so only one real
  // browser window is ever open at a time — eliminates the CPU contention
  // that was causing WebKit's stability checks to exceed 30s.
  workers: process.env.CI ? 2 : isHeaded ? 1 : undefined,
  // A bit more headroom than the 30s default — this host appears to be
  // CPU-constrained enough that WebKit can be genuinely slow, not just
  // contended, especially on its first render after launch.
  timeout: 45_000,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['./hooks/llm-reporter.ts'],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: process.env.HEADLESS !== 'false',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      // Headed WebKit fails to even finish "setting up page" on this host —
      // confirmed by a clean 50/50 pass in headless mode vs. timeouts in
      // headed mode. This is a host display-environment limitation (WebKit's
      // GTK port needs a working X11/Wayland display to render a real
      // window), not a code or config bug, so WebKit always runs headless
      // here regardless of --headed.
      use: {
        ...devices['Desktop Safari'],
        headless: true,
      },
    },
    {
      name: 'mobile-chrome',
      testMatch: /dashboard\.responsive\.spec\.ts/,
      use: { ...devices['Pixel 5'] },
    },
  ],
  outputDir: 'test-results',
});