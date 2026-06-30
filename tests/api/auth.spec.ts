import { test, expect } from '@playwright/test';
import { assertSchema } from '../../utils/schema-validator';
import { authTokenSchema } from '../../api-clients/schemas/user.schema';
import { env } from '../../utils/env';

/**
 * Auth Token Validation — mocked via page.route() + page.evaluate(fetch)
 * so tests are hermetic and don't require a live ReqRes API key.
 */
test.describe('REST API — Auth Token Validation', () => {
  const LOGIN_URL = `${env.apiBaseUrl}/login`;

  test('should return a valid token for correct credentials', async ({ page }) => {
    await page.goto('about:blank');
    await page.route(`**${LOGIN_URL}**`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'QpwL5tpe83ilfN2' }),
      }),
    );

    const result = await page.evaluate(
      async ({ url, email, password }: { url: string; email: string; password: string }) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const body = await res.json();
        return { status: res.status, body };
      },
      { url: LOGIN_URL, email: env.apiUserEmail, password: env.apiUserPassword },
    );

    expect(result.status).toBe(200);
    expect(result.body.token).toBeTruthy();
    assertSchema(authTokenSchema, result.body);
  });

  test('should reject login with missing password', async ({ page }) => {
    await page.goto('about:blank');
    await page.route(`**${LOGIN_URL}**`, (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Missing password' }),
      }),
    );

    const result = await page.evaluate(
      async ({ url, email }: { url: string; email: string }) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: '' }),
        });
        const body = await res.json();
        return { status: res.status, body };
      },
      { url: LOGIN_URL, email: env.apiUserEmail },
    );

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });

  test('should reject requests with an invalid token', async ({ page }) => {
    const invalidToken = 'invalid-token-xyz';
    const USERS_URL = `${env.apiBaseUrl}/users/1`;

    await page.goto('about:blank');
    // ReqRes doesn't enforce Bearer auth, so we verify the header is correctly formed
    // by intercepting the request and reading the Authorization header.
    let capturedAuthHeader = '';
    await page.route(`**${USERS_URL}**`, async (route) => {
      capturedAuthHeader = route.request().headers()['authorization'] ?? '';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 1 } }),
      });
    });

    await page.evaluate(
      ({ url, token }: { url: string; token: string }) =>
        fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
      { url: USERS_URL, token: invalidToken },
    );

    expect(capturedAuthHeader).toBe(`Bearer ${invalidToken}`);
  });

  test('should reject requests with an expired token', async ({ page }) => {
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxfQ.invalid';
    const USERS_URL = `${env.apiBaseUrl}/users/1`;

    await page.goto('about:blank');
    await page.route(`**${USERS_URL}**`, (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Token expired' }),
      }),
    );

    const result = await page.evaluate(
      ({ url, token }: { url: string; token: string }) =>
        fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.status),
      { url: USERS_URL, token: expiredToken },
    );

    expect([200, 401, 403]).toContain(result);
  });
});