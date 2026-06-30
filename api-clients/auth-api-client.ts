import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './base-api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  token: string;
}

export class AuthApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseURL: string) {
    super(request, { baseURL });
  }

  async login(credentials: LoginCredentials) {
    return this.post('/login', credentials);
  }

  async loginWithToken(credentials: LoginCredentials) {
    const response = await this.login(credentials);
    const body = await response.json();
    return {
      response,
      token: body.token as string | undefined,
      body,
    };
  }

  async getProtectedResource(path: string, token: string) {
    return this.request.get(this.url(path), {
      headers: this.authHeaders(token),
    });
  }
}
