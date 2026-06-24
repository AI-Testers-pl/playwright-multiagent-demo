- Use english in all your responses even though I prompt in polish

For UI tests:
- run newly created tests first and then full suite via `npm run test:ui`
- prefer `data-testid` selectors
- use given (test setup) / when(tested action) / then (assertions)
- use page object model, add pages to `/pages`, add components to `/components`. inject components in pages
- keep `e2e-ui-test-implementation-plan.md` up-to-date after adding a new test suite (make it high-level)
- use Playwright CLI skill from the repo to explore the tested page first