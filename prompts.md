# Prompts & Iterations Log

## 1. Login Module
**Prompt:** "You are a Senior QA Automation Engineer. Write Playwright/TypeScript test scenarios for the 'Login' module. Coverage: Happy Path, Invalid Credentials (negative), Brute-force lockout (security), Forgot Password, and Session expiry. Provide Page Object Model (POM) structure."

**Note:** Initially, the prompt was too broad. I updated it to specifically request POM integration and security edge cases (like brute-force lockout) to ensure the test suite is robust for a production-grade application.

---

## 2. Dashboard Module
**Prompt:** "You are an expert SDET. Generate Playwright-ready test cases for a Dashboard module with real-time widgets. Focus on: Widget loading under high latency, Table sorting/filtering, Responsive layout (Mobile vs Desktop), and Permission-based visibility (Admin vs User)."

**Note:** The first iteration lacked validation for different viewports. I refined the prompt to include explicit 'Responsive layout checks' to ensure cross-device consistency, which is critical for a dashboard.

---

## 3. REST API Module
**Prompt:** "You are an Automation Engineer focusing on API reliability. Write technical test cases for a CRUD-based REST API. Coverage: Auth token validation (expired/invalid), Full CRUD lifecycle, Error handling (401, 403, 404, 500), Rate limiting, and JSON schema validation."

**Note:** I realized the initial prompt missed 'Rate Limiting' and 'Schema Validation'. I updated the prompt to include these specifically, as they are essential for detecting regression in API contracts.
