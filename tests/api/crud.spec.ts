import { test, expect } from '@playwright/test';
import { assertSchema } from '../../utils/schema-validator';
import { userListSchema, userSchema, createdUserSchema } from '../../api-clients/schemas/user.schema';
import { env } from '../../utils/env';

/**
 * CRUD Lifecycle — mocked via page.route() + page.evaluate(fetch).
 * Tests are hermetic: no live API key required.
 */
test.describe('REST API — CRUD Lifecycle', () => {
  const BASE = env.apiBaseUrl;
  const newUser = { name: 'TestMu User', job: 'SDET' };
  const updatedUser = { name: 'TestMu User Updated', job: 'Senior SDET' };

  test('CREATE — should create a new user', async ({ page }) => {
    await page.goto('about:blank');
    await page.route(`**${BASE}/users**`, (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ ...newUser, id: '101', createdAt: new Date().toISOString() }),
      }),
    );

    const result = await page.evaluate(
      async ({ url, payload }: { url: string; payload: object }) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return { status: res.status, body: await res.json() };
      },
      { url: `${BASE}/users`, payload: newUser },
    );

    expect(result.status).toBe(201);
    assertSchema(createdUserSchema, result.body);
    expect(result.body.name).toBe(newUser.name);
    expect(result.body.job).toBe(newUser.job);
  });

  test('READ — should list users with pagination', async ({ page }) => {
    await page.goto('about:blank');
    const mockBody = {
      page: 1, per_page: 6, total: 12, total_pages: 2,
      data: [{ id: 1, email: 'a@b.com', first_name: 'A', last_name: 'B', avatar: 'http://x.com/a.jpg' }],
    };
    await page.route(`**${BASE}/users**`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockBody) }),
    );

    const result = await page.evaluate(
      (url: string) => fetch(url).then(async (r) => ({ status: r.status, body: await r.json() })),
      `${BASE}/users?page=1`,
    );

    expect(result.status).toBe(200);
    assertSchema(userListSchema, result.body);
    expect(result.body.data.length).toBeGreaterThan(0);
  });

  test('READ — should fetch a single user by ID', async ({ page }) => {
    await page.goto('about:blank');
    const mockBody = {
      data: { id: 2, email: 'j@b.com', first_name: 'Janet', last_name: 'Weaver', avatar: 'http://x.com/a.jpg' },
    };
    await page.route(`**${BASE}/users/2**`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockBody) }),
    );

    const result = await page.evaluate(
      (url: string) => fetch(url).then(async (r) => ({ status: r.status, body: await r.json() })),
      `${BASE}/users/2`,
    );

    expect(result.status).toBe(200);
    assertSchema(userSchema, result.body);
    expect(result.body.data.id).toBe(2);
  });

  test('UPDATE — should replace user via PUT', async ({ page }) => {
    await page.goto('about:blank');
    await page.route(`**${BASE}/users/2**`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...updatedUser, updatedAt: new Date().toISOString() }),
      }),
    );

    const result = await page.evaluate(
      async ({ url, payload }: { url: string; payload: object }) => {
        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return { status: res.status, body: await res.json() };
      },
      { url: `${BASE}/users/2`, payload: updatedUser },
    );

    expect(result.status).toBe(200);
    expect(result.body.name).toBe(updatedUser.name);
    expect(result.body.job).toBe(updatedUser.job);
  });

  test('UPDATE — should partially update user via PATCH', async ({ page }) => {
    await page.goto('about:blank');
    await page.route(`**${BASE}/users/2**`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ job: 'Lead SDET', updatedAt: new Date().toISOString() }),
      }),
    );

    const result = await page.evaluate(
      async ({ url, payload }: { url: string; payload: object }) => {
        const res = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return { status: res.status, body: await res.json() };
      },
      { url: `${BASE}/users/2`, payload: { job: 'Lead SDET' } },
    );

    expect(result.status).toBe(200);
    expect(result.body.job).toBe('Lead SDET');
  });

  test('DELETE — should delete a user', async ({ page }) => {
    await page.goto('about:blank');
    await page.route(`**${BASE}/users/2**`, (route) =>
      route.fulfill({ status: 204, body: '' }),
    );

    const result = await page.evaluate(
      (url: string) => fetch(url, { method: 'DELETE' }).then((r) => r.status),
      `${BASE}/users/2`,
    );

    expect(result).toBe(204);
  });
});