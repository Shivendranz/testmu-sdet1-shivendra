# testmu-sdet1-shivendra

A professional **Playwright + TypeScript** automation framework built for the **TestMu AI SDET-1 Hackathon**. It combines UI and API testing with a Page Object Model (POM), reusable API clients, and an LLM agent layer for AI-assisted test workflows.

---

## Folder Structure

```
testmu-sdet1-shivendra/
├── .github/
│   └── workflows/
│       └── playwright.yml      # CI pipeline — install, test, upload artifacts
├── agents/                     # LLM agent layer (OpenAI SDK) — scaffolding for
│   ├── base-agent.ts           # Task 3 roadmap items (see "What I'd Build Next");
│   ├── test-generator.agent.ts # not currently called from any test
│   └── index.ts
├── api-clients/                # HTTP/API abstraction over Playwright request
│   ├── base-api-client.ts      # Shared GET/POST/PUT/PATCH/DELETE + auth headers
│   ├── auth-api-client.ts      # Auth-specific client (scaffolding, not yet used by specs)
│   ├── users-api-client.ts     # Users CRUD client (scaffolding, not yet used by specs)
│   ├── example-api-client.ts   # Used by tests/api/health.spec.ts
│   ├── schemas/
│   │   └── user.schema.ts      # AJV JSON schemas + matching TS interfaces
│   └── index.ts
├── hooks/
│   └── llm-reporter.ts         # Task 3 — LlmFailureExplainerReporter (Option A).
│                                # Registered as a Playwright reporter in
│                                # playwright.config.ts, so it runs automatically
│                                # for every failing test in every spec file/project —
│                                # no per-spec wiring required.
├── pages/                      # Page Object Model (POM)
│   ├── base.page.ts            # Base class with navigation helpers
│   ├── home.page.ts
│   ├── login/
│   │   ├── login.page.ts
│   │   ├── forgot-password.page.ts
│   │   ├── inventory.page.ts
│   │   └── index.ts
│   ├── dashboard/
│   │   ├── dashboard.page.ts
│   │   └── index.ts
│   └── index.ts
├── tests/
│   ├── e2e/
│   │   ├── home.spec.ts
│   │   ├── login/               # happy-path, negative, security, forgot-password, session-expiry
│   │   └── dashboard/            # widgets, table sort/filter, responsive, permissions
│   └── api/                      # auth, crud, error-handling, rate-limiting, schema-validation, health
├── utils/                      # Shared utilities
│   ├── env.ts                  # Typed environment config (dotenv)
│   ├── logger.ts               # Structured console logger
│   ├── schema-validator.ts     # AJV assertSchema<T>() helper used in API tests
│   └── index.ts
├── prompts.md                  # Task 2 — raw prompts + iteration notes per module
├── ai-usage-log.md             # Every AI tool used, chronologically
├── .env.example                # Environment variable template
├── .gitignore
├── Dockerfile                  # Headless containerized test runner
├── package.json
├── playwright.config.ts        # Playwright projects, reporters, retries
├── README.md
└── tsconfig.json
```

---

## Architecture Overview

This framework follows a **layered, separation-of-concerns** design:

| Layer | Responsibility |
|-------|----------------|
| **tests/** | Test specs only — assertions and orchestration, no raw selectors |
| **pages/** | Page Object Model — encapsulates UI locators and user actions |
| **api-clients/** | API layer — typed HTTP clients built on Playwright's `request` fixture |
| **utils/** | Cross-cutting concerns — env loading, logging, shared helpers |
| **hooks/** | Playwright `Reporter` implementations — `llm-reporter.ts` is the Task 3 LLM Failure Explainer, wired suite-wide via `playwright.config.ts` |
| **agents/** | LLM integration scaffolding — OpenAI-powered agents for future test generation/self-healing work (see roadmap below) |

**Data flow (E2E):** `spec → Page Object → Playwright Page → Browser`

**Data flow (API):** `spec → API Client → Playwright APIRequestContext → HTTP`

**Data flow (Agent):** `spec or CLI → Agent → OpenAI API → structured output`

Key design decisions:

- **Playwright Test Runner** — built-in parallelism, fixtures, tracing, and multi-browser projects (Chromium, Firefox, WebKit).
- **TypeScript strict mode** — compile-time safety across all layers.
- **dotenv** — environment-driven configuration for local, CI, and Docker runs.
- **CI-ready** — GitHub Actions workflow with HTML/JUnit reporters and artifact uploads.
- **Docker** — reproducible headless execution using the official Playwright base image.

---

## Prerequisites

- **Node.js** ≥ 18 (recommended: 22 LTS)
- **npm** ≥ 9

---

## How to Run

### 1. Install dependencies

```bash
npm install
npx playwright install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your BASE_URL and LLM_API_KEY (Groq or OpenAI — see .env.example)
```

### 3. Run tests

```bash
# Full suite (all browsers)
npm test

# E2E only
npm run test:e2e

# API only
npm run test:api

# Headed mode (visible browser)
npm run test:headed

# Interactive UI mode
npm run test:ui

# Debug mode
npm run test:debug
```

### 4. View report

```bash
npm run report
```

### 4b. View AI failure explanations (Task 3)

Whenever a test fails and `LLM_API_KEY` is set in `.env` (works with Groq or
OpenAI — see `.env.example`), `hooks/llm-reporter.ts` (registered as a
Playwright reporter — see `playwright.config.ts`) automatically calls the LLM
for every failing test, across every spec file and browser project. Each
explanation is:

- printed to stdout during the run, prefixed with `🔍 [LLM Explainer]`
- written as a Markdown file to `test-results/llm-explanations/<test-title>.md`

```bash
cat test-results/llm-explanations/*.md
```

If `LLM_API_KEY` is missing or the account has no quota, the reporter logs a
warning and skips the call without failing the test run.

### 5. Run in Docker (headless)

```bash
docker build -t testmu-playwright .
docker run --rm testmu-playwright
```

Pass environment variables at runtime:

```bash
docker run --rm -e BASE_URL=https://your-app.com testmu-playwright
```

### 6. Type-check

```bash
npm run lint
```

---

## What I'd Build Next (with More Time)

1. **Option B — Flaky Test Classifier** — Feed full run logs to an LLM after each CI run and output a structured JSON report bucketing failures into: `real_bug`, `environment_issue`, or `flaky_test`. This complements the Failure Explainer (Option A) already built — together they cover both per-test diagnosis and cross-run pattern detection.

2. **Self-healing locators** — When a test fails on a missing selector, automatically send the current DOM snapshot to the LLM and get back a suggested replacement selector. `agents/base-agent.ts` already wraps the OpenAI SDK for this kind of call; it isn't invoked by any test yet — next step is a DOM-diff prompt in `TestGeneratorAgent` and an auto-apply step.

3. **Natural-language test authoring** — A CLI that takes a plain-English scenario (e.g. "user resets password then logs in") and produces a runnable Playwright spec with POM bindings via the `TestGeneratorAgent`.

4. **Visual regression with AI diff classification** — Integrate Playwright's screenshot comparison with an AI vision agent to classify UI diffs as intentional (design change) vs. accidental (regression). Cuts false positives from pixel-diff tools.

5. **Test data factory** — Faker-driven builders in `utils/` with API seeding via `api-clients/` for isolated, parallel-safe test state. Eliminates shared state bugs between parallel workers.

6. **Cloud grid + observability** — Wire `playwright.config.ts` to a cloud browser grid (LambdaTest / BrowserStack) and aggregate JUnit + HTML reports into a flake-detection dashboard with MTTR metrics.

---

## License

MIT