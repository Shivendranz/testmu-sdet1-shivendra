import { test, expect } from '@playwright/test';
import { validateSchema } from '../../utils/schema-validator';
import {
  userListSchema,
  userSchema,
  createdUserSchema,
  authTokenSchema,
} from '../../api-clients/schemas/user.schema';
import { env } from '../../utils/env';

/**
 * Schema Validation — mocked via page.route() + page.evaluate(fetch).
 * Validates that our schema definitions match expected ReqRes response shapes.
 */
test.describe('REST API — JSON Schema Validation', () => {
  const BASE = env.apiBaseUrl;

  test('should validate user list response schema', async ({ page }) => {
    await page.goto('about:blank');
    const mockBody = {
      page: 1, per_page: 6, total: 12, total_pages: 2,
      data: [{ id: 1, email: 'g@b.com', first_name: 'George', last_name: 'Bluth', avatar: 'https://x.com/a.jpg' }],
    };
    await page.route(`**${BASE}/users**`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockBody) }),
    );

    const body = await page.evaluate(
      (url: string) => fetch(url).then((r) => r.json()),
      `${BASE}/users?page=1`,
    );

    expect(validateSchema(userListSchema, body)).toBeTruthy();
    expect(body.data[0]).toHaveProperty('email');
    expect(body.data[0]).toHaveProperty('avatar');
  });

  test('should validate single user response schema', async ({ page }) => {
    await page.goto('about:blank');
    const mockBody = {
      data: { id: 1, email: 'g@b.com', first_name: 'George', last_name: 'Bluth', avatar: 'https://x.com/a.jpg' },
    };
    await page.route(`**${BASE}/users/1**`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockBody) }),
    );

    const body = await page.evaluate(
      (url: string) => fetch(url).then((r) => r.json()),
      `${BASE}/users/1`,
    );

    expect(validateSchema(userSchema, body)).toBeTruthy();
    expect(typeof body.data.id).toBe('number');
  });

  test('should validate created user response schema', async ({ page }) => {
    await page.goto('about:blank');
    const mockBody = { name: 'Schema Test', job: 'QA', id: '999', createdAt: '2025-01-01T00:00:00.000Z' };
    await page.route(`**${BASE}/users**`, (route) =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(mockBody) }),
    );

    const body = await page.evaluate(
      async (url: string) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Schema Test', job: 'QA' }),
        });
        return res.json();
      },
      `${BASE}/users`,
    );

    expect(validateSchema(createdUserSchema, body)).toBeTruthy();
    expect(body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test('should validate auth token response schema', async ({ page }) => {
    await page.goto('about:blank');
    const mockBody = { token: 'QpwL5tpe83ilfN2' };
    await page.route(`**${BASE}/login**`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockBody) }),
    );

    const body = await page.evaluate(
      async ({ url, email, password }: { url: string; email: string; password: string }) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        return res.json();
      },
      { url: `${BASE}/login`, email: env.apiUserEmail, password: env.apiUserPassword },
    );

    expect(validateSchema(authTokenSchema, body)).toBeTruthy();
    expect(body.token.length).toBeGreaterThan(10);
  });

  test('should fail validation when required fields are missing', async () => {
    const invalidPayload = { page: 1, data: [{ id: 'not-a-number' }] };
    expect(() => validateSchema(userListSchema, invalidPayload)).toThrow(/Schema validation failed/);
  });
});