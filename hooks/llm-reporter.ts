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

import { TestInfo } from '@playwright/test';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { env } from '../utils/env';

const LLM_REPORT_DIR = 'test-results/llm-explanations';

/**
 * Called in afterEach hooks. When a test fails, sends the error + test context
 * to the OpenAI API and logs a plain-English explanation with a suggested fix.
 * Output is written to both stdout and a Markdown file in test-results/.
 */
export async function explainFailure(testInfo: TestInfo): Promise<void> {
  if (testInfo.status === 'passed' || testInfo.status === 'skipped') return;
  if (!env.openaiApiKey) {
    console.warn('\n⚠️  [LLM Explainer] OPENAI_API_KEY not set — skipping AI explanation.');
    return;
  }

  const errors = testInfo.errors.map(e => e.message ?? '').join('\n');
  const duration = testInfo.duration;

  const prompt = `You are a senior QA automation engineer reviewing a Playwright test failure.

Test title: "${testInfo.title}"
Test file: ${testInfo.file}
Status: ${testInfo.status}
Duration: ${duration}ms

Error output:
${errors.slice(0, 1500)}

In 3–5 sentences:
1. Explain in plain English what went wrong.
2. State whether this looks like a real bug, an environment issue, or a flaky test.
3. Suggest one concrete fix the developer should try first.`;

  try {
    const client = new OpenAI({ apiKey: env.openaiApiKey });
    const completion = await client.chat.completions.create({
      model: env.openaiModel,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.3,
    });

    const explanation = completion.choices[0]?.message?.content?.trim() ?? 'No explanation returned.';

    // ── stdout output ────────────────────────────────────────────────────────
    console.log('\n' + '─'.repeat(60));
    console.log(`🔍 [LLM Explainer] "${testInfo.title}"`);
    console.log(`   Model  : ${completion.model}`);
    console.log(`   Status : ${testInfo.status}`);
    console.log(`\n${explanation}`);
    console.log('─'.repeat(60) + '\n');

    // ── write to file ────────────────────────────────────────────────────────
    fs.mkdirSync(LLM_REPORT_DIR, { recursive: true });
    const safeTitle = testInfo.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const filePath = path.join(LLM_REPORT_DIR, `${safeTitle}.md`);
    const content = [
      `# LLM Failure Explanation`,
      ``,
      `**Test:** ${testInfo.title}`,
      `**File:** ${testInfo.file}`,
      `**Status:** ${testInfo.status}`,
      `**Duration:** ${duration}ms`,
      `**Model:** ${completion.model}`,
      `**Timestamp:** ${new Date().toISOString()}`,
      ``,
      `## Error`,
      `\`\`\``,
      errors.slice(0, 800),
      `\`\`\``,
      ``,
      `## AI Explanation`,
      ``,
      explanation,
    ].join('\n');
    fs.writeFileSync(filePath, content, 'utf8');

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ [LLM Explainer] API call failed: ${message}\n`);
  }
}