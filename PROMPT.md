# Multi-Agent Implementation Prompt

```text
We are on branch sun08 in the playwright-2025 repository.

Goal:
Implement the next production-capable Playwright test coverage phase, similar in scope to the sun09 branch, using parallel subagents.

Production target:
APP_BASE_URL=https://aitesters.byst.re

Spawn three separate subagent threads in parallel. Do not start nested Codex sessions.

General rules for all subagents:
- Work independently in your assigned workflow slice.
- Treat the listed files as primary ownership, not an absolute boundary.
- You may create or edit small supporting utilities, fixtures, types, generators, or page-object helpers when necessary for clean implementation.
- Prefer local helpers inside owned page/test files at first, but do not leave duplicated or broadly useful logic there.
- Do not make broad fixture, config, package, or test-runner changes unless explicitly required.
- If you touch a shared file, report it clearly and explain why.
- Do not edit files likely to be owned by another subagent unless there is no clean alternative.
- If you inspect the app manually with playwright-cli, use your own named browser session:
  - LLM agent: playwright-cli -s=llm-agent open https://aitesters.byst.re
  - Admin agent: playwright-cli -s=admin-agent open https://aitesters.byst.re
  - Account agent: playwright-cli -s=account-agent open https://aitesters.byst.re
- Close your own playwright-cli session when done.
- Keep implementation in English.
- Do not add Polish text to source files, tests, prompts, reports, or comments.
- Do not use test.only, test.skip, ts-ignore, ts-nocheck, or any.
- Keep tests pointed at the configured APP_BASE_URL, not hardcoded localhost.
- Run only the focused tests for your assigned workflow slice. Do not run the complete UI suite, the full test suite, or `npm run test:ui`; the supervising agent owns that final verification.
- Return only: changed files, tests run, result, risks, and any shared files touched.

Agent 1: LLM workflow
Primary ownership:
- pages/Llm*
- tests/ui/llm/*

Task:
Add page objects and UI tests for the LLM overview, generate, chat, and tools workflows. Prefer deterministic assertions against visible UI behavior. Keep selectors maintainable and consistent with existing page-object style.

Agent 2: Admin workflow
Primary ownership:
- pages/Admin*
- tests/ui/admin-*

Task:
Add page objects and UI tests for admin product management and readonly/admin-access behavior. Use existing auth/admin fixtures where possible. Avoid broad fixture rewrites unless necessary.

Agent 3: Account workflow
Primary ownership:
- pages/ProfilePage.ts
- pages/ForgotPasswordPage.ts
- pages/ResetPasswordPage.ts
- tests/ui/profile.ui.spec.ts
- tests/ui/auth-recovery/*

Task:
Add page objects and UI tests for profile and auth recovery flows. Keep generated or disposable data isolated. Avoid assumptions that depend on local-only state.

After spawning:
- Wait for all three subagents.
- Review their summaries and changed files.
- Integrate their work yourself.
- Perform a complete code review of the combined result before final validation.
- Look specifically for duplicated helpers, misplaced setup logic, overly large page objects, hardcoded data, hardcoded URLs, brittle selectors, and shared logic hidden inside test files.
- Extract reusable data creation into generators where appropriate.
- Extract reusable non-UI logic into utils where appropriate.
- Extract reusable browser/page interactions into page objects or fixtures where appropriate.
- Keep tests readable and focused on behavior, not setup mechanics.
- Resolve integration conflicts yourself.
- Run focused production validation with APP_BASE_URL=https://aitesters.byst.re.
- Run the full UI suite against production as the final verification step.
- Summarize final changed files, test results, review fixes, risks
```
