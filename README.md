# Playwright Multi-Agent Demo

This repository is exclusive material for AI Testers course participants.

It demonstrates how coding agents can split a larger Playwright testing task into smaller independent workstreams, run those workstreams in parallel with subagents, and then integrate the result into one reviewed test suite.

## What This Demo Shows

- How a supervisor agent can delegate focused tasks to multiple subagents.
- How parallel subagents can work on separate workflow slices without stepping on each other.
- How page objects, fixtures, generators, and API clients help keep Playwright tests maintainable.
- How production-targeted UI tests can be validated against a real deployment.
- How final integration still needs human-level review for duplicated helpers, brittle selectors, shared setup, and flaky behavior.

## Branches

- `master` contains the starting point for the demo.
- `wynik` contains the finished multi-agent implementation.

Use the branch diff to inspect what changed during the multi-agent phase.

## Prompt

The original task prompt is stored in [`PROMPT.md`](./PROMPT.md). It describes the three-agent split:

- LLM workflow
- Admin workflow
- Account and auth recovery workflow

## Running Tests

The demo is configured to run against:

```bash
APP_BASE_URL=https://aitesters.byst.re
```

Install dependencies and run the suite:

```bash
npm ci
npx playwright test
```

The committed `.env` is included intentionally for this training demo environment, so participants can run the tests without extra setup.

