import { test, expect } from '@playwright/test';
import { env } from '../../utils/env';

/**
 * Error Handling — uses page.route() + page.evaluate(fetch) to simulate HTTP
 * error responses. page.request bypasses page.route(), so all requests must
 * go through the browser context via page.evaluate.
 */
test.describe('REST API — Error Handling', () => {
  const mockError = (status: number) => ({
    status,
    contentType: 'application/json',
    body: JSON.stringify({ error: status, description: `HTTP ${status}` }),
  });

  async function mockedFetch(page: import('@playwright/test').Page, url: string, status: number) {
    await page.goto('about:blank');
    await page.route(`**${url}**`, (route) => route.fulfill(mockError(status)));
    return page.evaluate((u) => fetch(u).then((r) => ({ status: r.status, ok: r.ok })), url);
  }

  test('should handle 401 Unauthorized', async ({ page }) => {
    const result = await mockedFetch(page, `${env.apiBaseUrl}/error-401`, 401);
    expect(result.status).toBe(401);
  });

  test('should handle 403 Forbidden', async ({ page }) => {
    const result = await mockedFetch(page, `${env.apiBaseUrl}/error-403`, 403);
    expect(result.status).toBe(403);
  });

  test('should handle 404 Not Found', async ({ page }) => {
    const result = await mockedFetch(page, `${env.apiBaseUrl}/error-404`, 404);
    expect(result.status).toBe(404);
  });

  test('should handle 500 Internal Server Error', async ({ page }) => {
    const result = await mockedFetch(page, `${env.apiBaseUrl}/error-500`, 500);
    expect(result.status).toBe(500);
  });

  test('should surface error body for client-side handling', async ({ page }) => {
    await page.goto('about:blank');
    const url = `${env.apiBaseUrl}/error-404`;
    await page.route(`**${url}**`, (route) => route.fulfill(mockError(404)));

    const result = await page.evaluate(async (u) => {
      const res = await fetch(u);
      const text = await res.text();
      return { ok: res.ok, bodyLength: text.length, body: text };
    }, url);

    expect(result.ok).toBeFalsy();
    expect(result.bodyLength).toBeGreaterThan(0);
    const parsed = JSON.parse(result.body);
    expect(parsed.error).toBeDefined();
  });
});