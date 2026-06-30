import dotenv from 'dotenv';

dotenv.config();

export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://www.saucedemo.com',
  apiBaseUrl: process.env.API_BASE_URL ?? 'https://reqres.in/api',
  headless: process.env.HEADLESS !== 'false',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  loginUser: process.env.LOGIN_USER ?? 'standard_user',
  loginPassword: process.env.LOGIN_PASSWORD ?? 'secret_sauce',
  lockedOutUser: process.env.LOCKED_OUT_USER ?? 'locked_out_user',
  apiUserEmail: process.env.API_USER_EMAIL ?? 'eve.holt@reqres.in',
  apiUserPassword: process.env.API_USER_PASSWORD ?? 'cityslicka',
} as const;

export function requireEnv(key: keyof typeof env): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return String(value);
}
