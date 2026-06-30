import { APIRequestContext, APIResponse } from '@playwright/test';

export interface ApiClientOptions {
  baseURL: string;
  headers?: Record<string, string>;
}

/**
 * Base API client — wrap Playwright's request context for reusable HTTP calls.
 */
export abstract class BaseApiClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly options: ApiClientOptions,
  ) {}

  protected url(path: string): string {
    const base = this.options.baseURL.replace(/\/$/, '');
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalized}`;
  }

  protected async get(path: string): Promise<APIResponse> {
    return this.request.get(this.url(path), {
      headers: this.options.headers,
    });
  }

  protected async post(path: string, data?: unknown): Promise<APIResponse> {
    return this.request.post(this.url(path), {
      headers: this.options.headers,
      data,
    });
  }
}
