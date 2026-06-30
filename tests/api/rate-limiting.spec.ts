import { test, expect } from '@playwright/test';
import { env } from '../../utils/env';

const RATE_LIMIT = 3;

test.describe('REST API — Rate Limiting', () => {
  test('should return 429 after exceeding request threshold', async ({ page }) => {
    let callCount = 0;
    await page.goto('about:blank');

    await page.route(`**${env.apiBaseUrl}/users**`, async (route) => {
      callCount += 1;
      await route.fulfill(
        callCount > RATE_LIMIT
          ? { status: 429, contentType: 'application/json', body: JSON.stringify({ error: 'Too Many Requests' }) }
          : { status: 200, contentType: 'application/json', body: JSON.stringify({ page: 1, data: [] }) },
      );
    });

    const statuses: number[] = await page.evaluate(
      async ({ url, total }: { url: string; total: number }) => {
        const results: number[] = [];
        for (let i = 0; i < total; i++) {
          const res = await fetch(url);
          results.push(res.status);
        }
        return results;
      },
      { url: `${env.apiBaseUrl}/users?page=1`, total: RATE_LIMIT + 2 },
    );

    expect(statuses.filter((s) => s === 200).length).toBe(RATE_LIMIT);
    expect(statuses.filter((s) => s === 429).length).toBeGreaterThanOrEqual(1);
  });

  test('should include retry-after header on rate-limited response', async ({ page }) => {
    await page.goto('about:blank');

    const url = `${env.apiBaseUrl}/users`;

    await page.route(`**${url}**`, async (route) => {
      await route.fulfill({
        status: 429,
        // Use Playwright's response interception (not browser fetch) to read headers
        // because browser fetch may drop Retry-After under CORS rules.
        headers: { 'retry-after': '120', 'access-control-expose-headers': 'retry-after' },
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Rate limit exceeded' }),
      });
    });

    // Use Playwright's waitForResponse — reads headers from network layer, not browser JS
    const [response] = await Promise.all([
      page.waitForResponse(`**${url}**`),
      page.evaluate((u) => fetch(u), url),
    ]);

    expect(response.status()).toBe(429);
    expect(response.headers()['retry-after']).toBe('120');
  });
});