# Prompts & Iterations Log

## 1. Login Module

**Prompt (v1 — too broad):**
"Write test cases for a login page."

**What went wrong:**
The output was generic — just happy path and one negative case. No POM structure, no security scenarios, and the assertions were hardcoded strings rather than using data-test attributes. The brute-force lockout and session expiry scenarios were completely missing.

**Prompt (v2 — used):**
"You are a Senior QA Automation Engineer working with Playwright and TypeScript. Write comprehensive test cases for a Login module with the following coverage: (1) Happy Path — valid credentials land on inventory page, title is verified. (2) Invalid Credentials (Negative) — wrong password, unknown username, both fields empty. (3) Brute-force lockout (Security) — pre-locked account, repeated failed attempts trigger lockout. (4) Forgot Password — valid email sends reset link, invalid email shows validation error. (5) Session Expiry — redirect after cookie clear, re-auth after logout, no access to protected routes without session. Use Page Object Model with a LoginPage class. Use data-test selectors. Return TypeScript code only."

**What changed:**
Adding explicit scenario names in a numbered list forced the LLM to cover every case. Specifying "data-test selectors" and "POM" in the prompt eliminated generic CSS selectors and flat function calls. The security scenario required adding `lockedOutUser` to the env config separately.

---

## 2. Dashboard Module

**Prompt (v1 — missing viewport coverage):**
"Generate Playwright test cases for a Dashboard with widgets, sorting, and filtering."

**What went wrong:**
The first output had no responsive tests at all, and the permission tests were vague — they checked for text content rather than verifying that admin-only elements are hidden for standard users. The widget loading test had no timeout or latency simulation.

**Prompt (v2 — used):**
"You are an expert SDET. Generate Playwright-ready TypeScript test cases for a Dashboard module with these four areas: (1) Widget Loading — verify all widgets load within 3000ms, simulate 1500ms API latency with page.route(), verify loader hides after render. (2) Table Sorting & Filtering — sort A-Z and Z-A and assert order, filter by search input and assert only matching rows show. (3) Responsive Layout — test at 1280x800 (desktop), 390x844 (mobile), 768x1024 (tablet); assert no horizontal overflow and correct widget visibility. (4) Permission-based Visibility — standard user sees user panel but not admin panel; mock admin role via localStorage and verify admin controls appear; assert no admin API endpoints in DOM. Use page.route() for network mocking and page.setViewportSize() for responsive tests. POM in pages/dashboard/."

**What changed:**
Specifying exact viewport sizes eliminated ambiguous breakpoint choices. Adding `page.route()` and `localStorage` as explicit techniques forced the LLM to use Playwright's interception API rather than real network calls. The 3000ms timeout requirement made the widget test measurable rather than subjective.

---

## 3. REST API Module

**Prompt (v1 — missing rate limiting and schema):**
"Write API test cases for a CRUD REST API with auth token validation and error handling."

**What went wrong:**
The first output covered only login and basic GET/POST/DELETE. Rate limiting was absent entirely. Schema validation was mentioned in a comment but not implemented. The error handling tests used a live external service (httpstat.us) which proved unreliable in CI environments.

**Prompt (v2 — used):**
"You are an Automation Engineer focusing on API reliability. Write Playwright TypeScript API tests using the request fixture for these areas: (1) Auth Token Validation — valid login returns 200 + token, missing password returns 400, invalid Bearer token is sent correctly in header, expired JWT returns 401/403. (2) Full CRUD Lifecycle — CREATE POST /users returns 201 with schema match, READ GET /users and /users/:id returns 200 + schema, UPDATE PUT and PATCH return 200, DELETE returns 204. (3) Error Handling — 401, 403, 404, 500 — use page.route() mocking, not external services. (4) Rate Limiting — mock rate limit with page.route() returning 429 after N requests, verify Retry-After header. (5) JSON Schema Validation — use AJV to assert response shapes against defined schemas in api-clients/schemas/. Use AuthApiClient and UsersApiClient classes that extend BaseApiClient."

**What changed:**
Specifying "use page.route() mocking, not external services" eliminated the httpstat.us dependency that caused socket hang-up errors in CI. Adding AJV and the schema file path forced the LLM to wire up actual schema validation rather than loose property checks. Naming the client classes explicitly produced code consistent with the existing project structure.