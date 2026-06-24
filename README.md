# Playwright Multi-Agent Demo

This repository packages the course demo as a monorepo-style comparison:

- `main/` is the starting project before the multi-agent implementation.
- `wynik/` is the finished result after applying the prompt.
- `PROMPT.md` is the root-level implementation prompt that drives the change from `main/` to `wynik/`.
- `BONUS-playwright-cli-vs-mcp.md` is a Polish bonus note comparing Playwright CLI and Playwright MCP for agentic testing workflows.
- `slides/` contains the HTML slide deck copied from `~/IdeaProjects/empty2/multiagent-html-slides`.

The intended reading flow is:

1. Open `PROMPT.md`.
2. Read `BONUS-playwright-cli-vs-mcp.md` for the optional CLI vs MCP context.
3. Inspect the starting point in `main/`.
4. Compare it with the completed implementation in `wynik/`.
5. Use `slides/index.html` or `slides/multiagent-slides.pdf` while presenting the workflow.

## How The Demo Works

The prompt asks a supervising coding agent to split one larger Playwright UI testing task into three parallel subagent workstreams:

- LLM workflow tests.
- Admin product management and access tests.
- Profile and authentication recovery tests.

Each subagent owns a focused slice of pages and test files, explores the production app with Playwright CLI, implements page objects and tests, and reports only its changed files, test results, risks, and shared-file touches.

After the subagents finish, the supervising agent integrates the work, reviews the combined result, extracts duplicated helpers where needed, checks for brittle selectors and hardcoded data, and runs final validation against:

```bash
APP_BASE_URL=https://aitesters.byst.re
```

## Difference Between `main/` And `wynik/`

`main/` contains the baseline Playwright project with the existing test coverage, fixtures, page objects, API clients, and local Playwright CLI skill files.

`wynik/` contains the expanded implementation produced by the multi-agent workflow. The major additions are:

- New LLM page objects and UI coverage under `pages/Llm*` and `tests/ui/llm/`.
- New admin product management page objects and tests.
- New profile, forgot password, and reset password page objects and tests.
- Additional data generation support, including product generation.
- Updates to fixtures, product API client behavior, and the high-level UI test implementation plan.
- A materialized `.agents/skills/playwright-cli/` directory for agent-oriented Playwright exploration.

In short: `main/` is the input, `PROMPT.md` is the instruction, and `wynik/` is the output.

## Running Either Project

Run commands from inside the project folder you want to inspect:

```bash
cd main
npm ci
npm run test:ui
```

or:

```bash
cd wynik
npm ci
npm run test:ui
```

Both folders are configured for the same production demo target through their project files.
