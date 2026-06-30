import { APIRequestContext, APIResponse } from '@playwright/test';

export interface ApiClientOptions {
  baseURL: string;
  headers?: Record<string, string>;
}

/**
 * Base API client — wrap Playwright's request context for reusable HTTP calls.
 */
export abstract class BaseApiClient {
  private readonly mergedHeaders: Record<string, string>;

  constructor(
    protected readonly request: APIRequestContext,
    protected readonly options: ApiClientOptions,
  ) {
    // ReqRes free tier requires this key on every request (added late 2024)
    this.mergedHeaders = {
      'x-api-key': 'reqres-free-v1',
      ...options.headers,
    };
  }

  protected url(path: string): string {
    const base = this.options.baseURL.replace(/\/$/, '');
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalized}`;
  }

  protected async get(path: string): Promise<APIResponse> {
    return this.request.get(this.url(path), {
      headers: this.mergedHeaders,
    });
  }

  protected async post(path: string, data?: unknown): Promise<APIResponse> {
    return this.request.post(this.url(path), {
      headers: this.mergedHeaders,
      data,
    });
  }

  protected async put(path: string, data?: unknown): Promise<APIResponse> {
    return this.request.put(this.url(path), {
      headers: this.mergedHeaders,
      data,
    });
  }

  protected async patch(path: string, data?: unknown): Promise<APIResponse> {
    return this.request.patch(this.url(path), {
      headers: this.mergedHeaders,
      data,
    });
  }

  protected async delete(path: string): Promise<APIResponse> {
    return this.request.delete(this.url(path), {
      headers: this.mergedHeaders,
    });
  }

  protected authHeaders(token: string): Record<string, string> {
    return {
      ...this.mergedHeaders,
      Authorization: `Bearer ${token}`,
    };
  }
}