import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './base-api-client';

/**
 * Example API client — extend for your application's REST/GraphQL endpoints.
 */
export class ExampleApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseURL: string) {
    super(request, { baseURL });
  }

  async healthCheck() {
    const response = await this.get('/');
    return {
      status: response.status(),
      ok: response.ok(),
    };
  }
}
