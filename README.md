# testmu-sdet1-shivendra

A professional **Playwright + TypeScript** automation framework built for the **TestMu AI SDET-1 Hackathon**. It combines UI and API testing with a Page Object Model (POM), reusable API clients, and an LLM agent layer for AI-assisted test workflows.

---

## Folder Structure

```
testmu-sdet1-shivendra/
├── .github/
│   └── workflows/
│       └── playwright.yml      # CI pipeline — install, test, upload artifacts
├── agents/                     # LLM integration layer (OpenAI SDK)
│   ├── base-agent.ts           # Abstract agent with chat completion
│   ├── test-generator.agent.ts # Example: NL scenario → test steps
│   └── index.ts
├── api-clients/                # HTTP/API abstraction over Playwright request
│   ├── base-api-client.ts      # Shared GET/POST helpers
│   ├── example-api-client.ts   # Example health-check client
│   └── index.ts
├── pages/                      # Page Object Model (POM)
│   ├── base.page.ts            # Base class with navigation helpers
│   ├── home.page.ts            # Example page object
│   └── index.ts
├── tests/
│   ├── e2e/                    # Browser-based end-to-end tests
│   │   └── home.spec.ts
│   └── api/                    # API-level tests
│       └── health.spec.ts
├── utils/                      # Shared utilities
│   ├── env.ts                  # Typed environment config (dotenv)
│   ├── logger.ts               # Structured console logger
│   └── index.ts
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
| **agents/** | LLM integration — OpenAI-powered agents for test generation, analysis, or self-healing |

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
# Edit .env with your BASE_URL and OPENAI_API_KEY (for agent features)
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

## Future Vision: What I Would Build Next

1. **Self-healing locators** — An agent that inspects failed test DOM snapshots and suggests or auto-applies updated selectors, reducing flaky-test maintenance.

2. **Natural-language test authoring** — A CLI or web UI where QA engineers describe scenarios in plain English; the `TestGeneratorAgent` produces runnable Playwright specs with POM bindings.

3. **Visual regression layer** — Integrate Playwright's screenshot comparison with an AI vision agent to classify intentional vs. accidental UI diffs.

4. **Test data factory** — Faker-driven data builders in `utils/` with API seeding via `api-clients/` for isolated, parallel-safe test environments.

5. **LambdaTest / TestMu cloud grid** — Wire `playwright.config.ts` to run against a cloud browser grid for cross-browser matrix at scale, with trace and video artifacts pushed to CI.

6. **Observability dashboard** — Aggregate JUnit + HTML reports into a single pass/fail trend dashboard with flake detection and mean-time-to-recovery metrics.

---

## License

MIT
