# Source notes

These notes support the first four HTML slides. Slide text is intentionally sparse so the presenter can provide the context verbally.

## AI_Testers context

- `https://aitesters.pl/` was reachable on June 13, 2026.
- Page metadata describes `AI_Testers 2.0` as a program about AI, Playwright, agents, MCP, quality gates, mentors, and community.
- `https://aitesters.pl/turbo` and `https://aitesters.pl/turbo/` returned HTTP 404 during this pass, so no course-specific text was copied from that page.

## Pricing and cache

- OpenAI pricing: `https://developers.openai.com/api/docs/pricing`
- OpenAI prompt caching: `https://developers.openai.com/api/docs/guides/prompt-caching`
- Anthropic Claude pricing: `https://platform.claude.com/docs/en/about-claude/pricing`

Used claims:

- OpenAI GPT-5.5 standard pricing visible in the pricing page: `$2.50` input, `$0.25` cached input, `$15.00` output per 1M tokens.
- Codex priority pricing for `gpt-5.3-codex` appears as `$3.50` input, `$0.35` cached input, `$28.00` output per 1M tokens.
- Claude cache reads use the `0.1x` input-price mental model; cache writes have separate multipliers.
- OpenAI prompt caching applies to repeated prefixes of at least 1,024 tokens and exposes cache hits through `cached_tokens`.

## Market signal slide

- User-provided links:
  - `https://x.com/Polymarket/status/2060104070141002191`
  - `https://x.com/Polymarket/status/2065521634560106535`
- Direct X body text was not fetchable in this environment, so slide wording uses the indexed headline-level wording only.
