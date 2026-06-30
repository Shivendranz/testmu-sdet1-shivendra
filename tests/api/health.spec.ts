import { test, expect } from '@playwright/test';
import { ExampleApiClient } from '../../api-clients/example-api-client';
import { env } from '../../utils/env';

test.describe('API Health', () => {
  test('should return a successful response from base URL', async ({ request }) => {
    const client = new ExampleApiClient(request, env.baseUrl);
    const result = await client.healthCheck();

    expect(result.ok).toBeTruthy();
    expect(result.status).toBe(200);
  });
});
