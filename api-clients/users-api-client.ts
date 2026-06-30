import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './base-api-client';

export interface UserPayload {
  name: string;
  job: string;
}

export class UsersApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseURL: string, token?: string) {
    super(request, {
      baseURL,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  }

  async listUsers(page = 1) {
    return this.get(`/users?page=${page}`);
  }

  async getUser(id: number) {
    return this.get(`/users/${id}`);
  }

  async createUser(payload: UserPayload) {
    return this.post('/users', payload);
  }

  async updateUser(id: number, payload: UserPayload) {
    return this.put(`/users/${id}`, payload);
  }

  async patchUser(id: number, payload: Partial<UserPayload>) {
    return this.patch(`/users/${id}`, payload);
  }

  async deleteUser(id: number) {
    return this.delete(`/users/${id}`);
  }
}
