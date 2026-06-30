# AI Usage Log

Every AI tool used during this assessment, in chronological order.

| Date | Tool | Task | Prompt / Input Summary | What it Produced |
| :--- | :--- | :--- | :--- | :--- |
| 2026-06-30 | Claude (claude.ai) | Task 1 — Project scaffold | "Create a Playwright + TypeScript monorepo structure for an SDET assessment covering Login, Dashboard, and REST API. Include POM, API clients, utils, agents, CI pipeline, and Docker." | Full folder structure: pages/, api-clients/, utils/, agents/, hooks/, tests/e2e/, tests/api/, playwright.config.ts, tsconfig.json, Dockerfile, .github/workflows/playwright.yml |
| 2026-06-30 | Claude (claude.ai) | Task 1 — Base classes | "Write a BaseApiClient abstract class in TypeScript wrapping Playwright's APIRequestContext with GET/POST/PUT/PATCH/DELETE helpers and auth header support." | api-clients/base-api-client.ts with full method set |
| 2026-06-30 | Claude (claude.ai) | Task 1 — Page Object base | "Write a BasePage class for Playwright POM with navigate, waitForPageLoad, and locator helpers." | pages/base.page.ts |
| 2026-06-30 | Claude (claude.ai) | Task 2 — Login tests | Prompt v2 (see prompts.md §1) | tests/e2e/login/ — 5 spec files covering happy path, negative, security, forgot password, session expiry |
| 2026-06-30 | Claude (claude.ai) | Task 2 — Dashboard tests | Prompt v2 (see prompts.md §2) | tests/e2e/dashboard/ — 4 spec files covering widget loading, sorting/filtering, responsive, permissions |
| 2026-06-30 | Claude (claude.ai) | Task 2 — API tests | Prompt v2 (see prompts.md §3) | tests/api/ — 6 spec files covering auth, CRUD, error handling, rate limiting, schema validation |
| 2026-06-30 | Claude (claude.ai) | Task 2 — Schema definitions | "Write AJV-compatible JSON schemas for ReqRes user list, single user, created user, and auth token responses." | api-clients/schemas/user.schema.ts |
| 2026-06-30 | Claude (claude.ai) | Task 3 — LLM reporter (Option A) | "Write a Playwright afterEach hook that sends failed test info to the OpenAI API and returns a plain-English explanation plus suggested fix. Write output to stdout and a Markdown file." | hooks/llm-reporter.ts with real OpenAI call, file output to test-results/llm-explanations/ |
| 2026-06-30 | Claude (claude.ai) | Task 3 — Agent layer | "Write a BaseAgent abstract class using the OpenAI SDK and a TestGeneratorAgent that takes a natural-language scenario and returns Playwright test steps." | agents/base-agent.ts, agents/test-generator.agent.ts |
| 2026-06-30 | Claude (claude.ai) | Debugging — import paths | Provided error logs for 'Cannot find module' errors across API specs | Identified ../../../ vs ../../ depth mismatch, fixed all import paths |
| 2026-06-30 | Claude (claude.ai) | Debugging — ReqRes 401s | Provided test output showing 401 on all reqres.in requests | Identified that reqres.in now requires API key; rewrote API tests to use page.route() mocks — hermetic, no external dependency |
| 2026-06-30 | Claude (claude.ai) | Debugging — page.route interception | Provided test output showing page.request.get() bypassing page.route() mocks | Identified that page.request has separate context; switched to page.evaluate(fetch) and page.waitForResponse() |
| 2026-06-30 | Claude (claude.ai) | Debugging — home.spec.ts | "home.spec.ts looks for Playwright title but baseURL is saucedemo.com" | Fixed assertions to match actual SauceDemo title and login page |