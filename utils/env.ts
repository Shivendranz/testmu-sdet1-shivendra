import dotenv from 'dotenv';

dotenv.config();

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const explicitLlmBaseUrl = process.env.LLM_BASE_URL;
const usesGroq = Boolean(explicitLlmBaseUrl?.includes('groq.com') || process.env.GROQ_API_KEY);
const llmApiKey = process.env.LLM_API_KEY ?? (usesGroq ? process.env.GROQ_API_KEY ?? '' : process.env.OPENAI_API_KEY ?? process.env.GROQ_API_KEY ?? '');
const llmBaseUrl = explicitLlmBaseUrl ?? (process.env.GROQ_API_KEY ? GROQ_BASE_URL : undefined);

export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://www.saucedemo.com',
  apiBaseUrl: process.env.API_BASE_URL ?? 'https://reqres.in/api',
  headless: process.env.HEADLESS !== 'false',
  // LLM config — works with OpenAI or any OpenAI-compatible API (e.g. Groq).
  // If a Groq URL or key is present, prefer GROQ_API_KEY/LLM_API_KEY.
  llmApiKey,
  llmBaseUrl,
  llmModel: process.env.LLM_MODEL ?? process.env.GROQ_MODEL ?? process.env.OPENAI_MODEL ?? 'llama-3.3-70b-versatile',
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