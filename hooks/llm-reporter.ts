// hooks/llm-reporter.ts
//
// WHY OPTION A (Failure Explainer) OVER OPTION B (Flaky Classifier):
//
// Option A gives immediate, actionable value at the moment a developer sees a red
// test — they get a plain-English explanation and a suggested fix without leaving
// the terminal. Option B requires a completed test run and accumulates value only
// over many runs. For a team moving fast in a first sprint, per-failure context
// reduces the "what broke and why" loop from minutes to seconds, which is the
// highest-ROI intervention. Option B is a better fit once a baseline of run history
// exists; Option A is the right starting point.
//
// WHY THIS IS A REPORTER, NOT A PER-SPEC afterEach HOOK:
//
// Wiring explainFailure() into one spec file's afterEach only covers that file —
// every other failing test in the suite (Dashboard, API, the rest of Login) would
// silently skip AI explanation. Playwright's Reporter API gives a single hook
// (onTestEnd) that fires for every test, in every spec file, across every project
// (chromium/firefox/webkit/mobile-chrome), with zero per-file wiring required.
// Registering it once in playwright.config.ts makes the integration suite-wide.

import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { env } from '../utils/env';

const LLM_REPORT_DIR = 'test-results/llm-explanations';

export default class LlmFailureExplainerReporter implements Reporter {
  // Circuit breaker: once we hit a quota/rate-limit error, stop calling the API
  // for the rest of this run instead of retrying (and failing) on every
  // subsequent failing test — this was spamming "429 quota exceeded" for every
  // failure once the account ran out of credits.
  private quotaExhausted = false;

  private writeReport(filePath: string, content: string): void {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
  }

  private buildReportContent(test: TestCase, result: TestResult, explanation: string, errors: string, model: string): string {
    return [
      '# LLM Failure Explanation',
      '',
      `**Test:** ${test.title}`,
      `**File:** ${test.location.file}`,
      `**Status:** ${result.status}`,
      `**Duration:** ${result.duration}ms`,
      `**Model:** ${model}`,
      `**Timestamp:** ${new Date().toISOString()}`,
      '',
      '## Error',
      '```',
      errors.slice(0, 800),
      '```',
      '',
      '## AI Explanation',
      '',
      explanation,
    ].join('\n');
  }

  async onTestEnd(test: TestCase, result: TestResult): Promise<void> {
    if (result.status === 'passed' || result.status === 'skipped') return;

    const errors = result.errors.map((e) => e.message ?? '').join('\n');
    const duration = result.duration;
    const safeTitle = test.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'unnamed-test';
    const filePath = path.join(LLM_REPORT_DIR, `${safeTitle}.md`);

    if (!env.llmApiKey) {
      const explanation = 'AI explanation skipped because no matching LLM API key was configured for the current provider.';
      console.warn(`\n⚠️  [LLM Explainer] ${explanation}`);
      this.writeReport(filePath, this.buildReportContent(test, result, explanation, errors, env.llmModel));
      return;
    }
    if (this.quotaExhausted) {
      console.warn('\n⚠️  [LLM Explainer] Skipping — quota was already exhausted earlier this run.');
      return;
    }

    const prompt = `You are a senior QA automation engineer reviewing a Playwright test failure.

Test title: "${test.title}"
Test file: ${test.location.file}
Status: ${result.status}
Duration: ${duration}ms

Error output:
${errors.slice(0, 1500)}

In 3–5 sentences:
1. Explain in plain English what went wrong.
2. State whether this looks like a real bug, an environment issue, or a flaky test.
3. Suggest one concrete fix the developer should try first.`;

    try {
      const client = new OpenAI({ apiKey: env.llmApiKey, baseURL: env.llmBaseUrl });
      const completion = await client.chat.completions.create({
        model: env.llmModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.3,
      });

      const explanation = completion.choices[0]?.message?.content?.trim() ?? 'No explanation returned.';
      const modelName = completion.model ?? env.llmModel;

      console.log('\n' + '─'.repeat(60));
      console.log(`🔍 [LLM Explainer] "${test.title}"`);
      console.log(`   Model  : ${modelName}`);
      console.log(`   Status : ${result.status}`);
      console.log(`\n${explanation}`);
      console.log('─'.repeat(60) + '\n');

      this.writeReport(filePath, this.buildReportContent(test, result, explanation, errors, modelName));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const explanation = `AI explanation generation failed: ${message}`;
      this.writeReport(filePath, this.buildReportContent(test, result, explanation, errors, env.llmModel));
      if (message.includes('429') || message.toLowerCase().includes('quota')) {
        this.quotaExhausted = true;
        console.error(
          `\n❌ [LLM Explainer] Quota/rate-limit hit — disabling AI explanations for the rest of this run.\n   (${message})\n`,
        );
      } else {
        console.error(`\n❌ [LLM Explainer] API call failed: ${message}\n`);
      }
    }
  }
}