# End-to-End UI Test Implementation Plan

Last updated: 2026-06-13

## Goal

Create a practical plan for full end-to-end UI coverage in this Playwright project, against the real `awesome-localstack` application stack through the public gateway (`APP_BASE_URL`, currently `http://localhost:8081`).

This plan is intentionally not a frontend-isolated plan. The tests should not mock frontend API responses. They should use the real frontend, real gateway, real backend, real database/state, real auth, and real supporting services available in the local stack.

## Inputs Used

- Current Playwright project in `/Users/slawek/IdeaProjects/playwright-2025`.
- Existing tests in `tests/ui` and `tests/api`.
- Existing page objects in `pages` and header/toast components in `components`.
- Current app route inventory from the frontend source.
- Live no-mock route probe against `http://localhost:8081`.
- Full current UI suite run: `npm run test:ui`.

## Verification Performed

I ran the existing UI suite from this repository:

```bash
npm run test:ui
```

Result:

- 24 UI tests passed.
- The suite exercised login, registration, authenticated home, logged-in header navigation, products, email, QR, LLM landing, traffic monitor, cart, profile, and logout against the real running stack.

I also ran a no-mock Playwright route probe with an admin session created through the real `/api/v1/users/signin` endpoint. These protected/admin screens were visible in the running stack:

- `/`
- `/products`
- `/products/1`
- `/cart`
- `/orders/1`
- `/profile`
- `/email`
- `/qr`
- `/llm`
- `/llm/chat`
- `/llm/generate`
- `/llm/tools`
- `/traffic`
- `/users`
- `/users/admin/edit`
- `/admin`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/edit/1`
- `/admin/orders`

Special route behavior:

- `/checkout` redirected to `/cart` with the current admin account because the cart was empty. Checkout needs real cart setup first.
- `/orders` redirected to `/profile`; this should be tested as redirect behavior, not as a separate screen.

## Test Strategy

Use real data setup through API clients, not browser-level route mocks.

Allowed setup:

- API clients under `http-clients`.
- Fixtures that create users through real signup/signin endpoints.
- Admin fixture that signs in through the real signin endpoint.
- Helper clients for products, cart, orders, password reset, email outbox, or traffic if the backend exposes those operations.
- Cleanup through real API endpoints when available.

Avoid:

- `page.route(...)` for stubbing app API responses.
- Synthetic localStorage data that was not obtained from real signin.
- Frontend-only component assumptions as proof of E2E coverage.

Keep the existing project conventions:

- Page objects go in `pages`.
- Reusable UI components go in `components`.
- Tests use given / when / then comments.
- Prefer `data-testid` selectors.
- New UI tests should be run first by file, then the full suite with `npm run test:ui`.

## Current Coverage

Screen coverage here means a Playwright UI test opens or reaches the routed screen and asserts user-visible behavior. A route observed manually by the probe is not counted as automated coverage.

| Area | Route | Access | Existing automated UI coverage | Status |
| --- | --- | --- | --- | --- |
| Auth | `/login` | Public | `tests/ui/login.ui.spec.ts` | Covered |
| Auth | `/register` | Public | `tests/ui/register.ui.spec.ts`, login navigation tests | Covered |
| Auth | `/forgot-password` | Public | `tests/ui/auth-recovery/forgot-password.ui.spec.ts` | Covered |
| Auth | `/reset` | Public | `tests/ui/auth-recovery/reset-password.ui.spec.ts` | Covered validation |
| Auth | `/auth/sso/callback` | Public/SSO | None | Missing |
| Home | `/` | User | `tests/ui/home.ui.spec.ts` | Covered |
| Catalog | `/products` | User | `tests/ui/products.ui.spec.ts`, header and home navigation checks | Covered workflow |
| Catalog | `/products/:id` | User | `tests/ui/products.ui.spec.ts` | Covered workflow |
| Cart | `/cart` | User | Header navigation to empty cart; `tests/ui/cart-checkout.ui.spec.ts` product-in-cart workflow | Covered workflow |
| Checkout | `/checkout` | User | `tests/ui/cart-checkout.ui.spec.ts` reaches checkout when supported after real cart setup | Covered workflow |
| Orders | `/orders` | User | None | Missing redirect assertion |
| Orders | `/orders/:id` | User/Admin | `tests/ui/cart-checkout.ui.spec.ts` asserts order details when checkout completes | Covered workflow |
| Profile | `/profile` | User | `tests/ui/profile.ui.spec.ts`, header/home navigation | Covered workflow |
| Email | `/email` | User | Header navigation smoke check | Covered smoke |
| QR | `/qr` | User | Header navigation smoke check | Covered smoke |
| LLM | `/llm` | User | `tests/ui/llm/llm-workflows.ui.spec.ts` | Covered workflow |
| LLM | `/llm/chat` | User | `tests/ui/llm/llm-workflows.ui.spec.ts` | Covered workflow |
| LLM | `/llm/generate` | User | `tests/ui/llm/llm-workflows.ui.spec.ts` | Covered workflow |
| LLM | `/llm/tools` | User | `tests/ui/llm/llm-workflows.ui.spec.ts` | Covered workflow |
| Traffic | `/traffic` | User | Header/home navigation smoke check | Covered smoke |
| Users | `/users` | Admin behavior in protected user route | None | Missing |
| Users | `/users/:username/edit` | Admin behavior in protected user route | None | Missing |
| Admin | `/admin` | Admin | `tests/ui/admin-access/` | Covered smoke |
| Admin | `/admin/products` | Admin | `tests/ui/admin-products.ui.spec.ts` | Covered workflow |
| Admin | `/admin/products/new` | Admin | `tests/ui/admin-products.ui.spec.ts` | Covered workflow |
| Admin | `/admin/products/edit/:id` | Admin | `tests/ui/admin-products.ui.spec.ts` | Covered workflow |
| Admin | `/admin/orders` | Admin | None | Missing |

Current automated screen coverage:

- Covered or smoke-covered concrete screens: 20/26.
- Missing concrete screens: 6/26.
- Missing route behavior assertion: `/orders` redirect to `/profile`.

## Regular User Plan

### 1. Auth Recovery Screens

Status:

- Implemented page objects for `/forgot-password` and `/reset`.
- Implemented UI coverage for forgot-password rendering, neutral reset request behavior, reset-token prefill from URL, invalid reset-token errors, and back-to-login navigation.
- Full reset happy path remains pending because the production reset request returns `token: null` and no email outbox/test-support token endpoint is available in this repository.

Remaining scenarios:

- Read the reset token through a real outbox/test-support endpoint if one becomes available.
- Open `/reset?token=<token>`, set a new password, and sign in with the new password.

Risk:

- This depends on how reset tokens are exposed in `awesome-localstack`. If there is no test-support endpoint, add one to the stack before automating the full happy path.

### 2. Product List and Product Details

Extend:

- `pages/ProductsPage.ts`

Add:

- `pages/ProductDetailsPage.ts`
- `tests/ui/products.ui.spec.ts`

Status:

- Implemented workflow coverage for catalog rendering, filtering, search, sorting, product details navigation, and add-to-cart entry points.
- Implemented cart/checkout workflow coverage in `tests/ui/cart-checkout.ui.spec.ts`: a regular generated user adds a real product through the UI, verifies the cart with real API state, proceeds to checkout when the app allows it, and asserts either order details after order creation or the observed redirect behavior.

Scenarios:

- Open `/products` and assert product cards from real catalog data.
- Search/filter/sort if the UI supports it.
- Open first available product details through the UI, not by hardcoding only `/products/1`.
- Assert detail title, price, stock/category/description, and Add to Cart controls.
- Add product to cart and verify cart badge or cart page state.

Data setup:

- Prefer existing seeded catalog from the stack.
- For mutation tests, use admin API/client to create a disposable product when available, then delete it in cleanup.

### 3. Cart and Checkout

Extend:

- `pages/CartPage.ts`

Add:

- `pages/CheckoutPage.ts`
- `pages/OrderDetailsPage.ts`
- `tests/ui/cart-checkout.ui.spec.ts`

Scenarios:

- Start with a newly registered user.
- Add a real product to cart from product details.
- Verify cart item row, quantity, total, update quantity, remove item, and clear cart.
- Re-add item and go to checkout.
- Fill shipping form.
- Submit order.
- Assert redirect to `/orders/:id` or the app’s actual post-checkout destination.
- Assert order details contain item, total, status, and shipping address.
- Assert `/checkout` redirects to `/cart` when the cart is empty.
- Assert `/orders` redirects to `/profile`.

Data setup:

- Use the real UI for add-to-cart in the primary happy path.
- Use real API clients only to speed up setup for secondary edge cases.

### 4. Profile

Status:

- Implemented dedicated profile coverage in `tests/ui/profile.ui.spec.ts`.
- The suite opens profile as a generated authenticated user, verifies account details, prompt controls, and empty order history, updates personal information, and confirms values persist after reload.

Remaining scenario:

- Assert order history appears after placing an order in checkout flow.

### 5. Email

Extend:

- `pages/EmailPage.ts`

Add:

- `tests/ui/email.ui.spec.ts`

Scenarios:

- Open `/email`.
- Submit empty form and assert field validation.
- Send an email to a real registered user.
- Assert success toast.
- If the stack exposes an outbox endpoint, assert the message was delivered to the outbox.
- Assert invalid recipient or backend failure behavior only if it can be triggered naturally through real inputs.

### 6. QR Code

Extend:

- `pages/QrCodePage.ts`

Add:

- `tests/ui/qr.ui.spec.ts`

Scenarios:

- Open `/qr`.
- Submit empty text and assert validation/toast.
- Generate QR code with real backend endpoint.
- Assert generated image is visible and has a blob/object URL or loaded dimensions.
- Clear the QR code and assert input/result reset.

### 7. LLM Screens

Extend:

- `pages/LlmPage.ts`

Add:

- `pages/LlmModePage.ts`
- `pages/LlmChatPage.ts`
- `pages/LlmGeneratePage.ts`
- `pages/LlmToolsPage.ts`
- `tests/ui/llm/llm-workflows.ui.spec.ts`

Status:

- Implemented workflow coverage for landing `/llm` navigation to Generate, Chat, and Tools.
- Implemented `/llm/generate` coverage for default generation settings, model editability, thinking toggle, prompt entry, and enabled submit state.
- Implemented `/llm/chat` coverage for default chat settings, system prompt guidance, message entry, and enabled send state.
- Implemented `/llm/tools` coverage for default tool-chat settings, catalog tool definitions, tool-specific system prompt guidance, message entry, and enabled send state.

Risk:

- These tests intentionally avoid asserting exact streamed model responses because production LLM output and latency are nondeterministic. Add response assertions only if the service exposes a stable mock mode or contract.

### 8. Traffic Monitor

Extend:

- `pages/TrafficMonitorPage.ts`

Add:

- `tests/ui/traffic.ui.spec.ts`

Scenarios:

- Open `/traffic`.
- Wait for connected status.
- Trigger real API requests through `request` or UI actions.
- Assert traffic rows appear for those requests.
- Clear events and assert empty state.

## Admin Plan

Create an admin fixture that signs in with `ADMIN_USERNAME` / `ADMIN_PASSWORD` through the real signin endpoint and seeds browser storage with the returned real tokens. Keep secrets in `.env`.

Suggested file:

- `fixtures/admin.fixture.ts`

### 1. Admin Navigation and Access Control

Add:

- `tests/ui/admin-access/`

Status:

- Implemented read-only access smoke coverage with an admin fixture that signs in through the real `/api/v1/users/signin` endpoint and seeds localStorage with returned tokens.

Scenarios:

- Admin sees Admin navigation entry.
- Regular user does not see Admin navigation entry.
- Regular user visiting `/admin` is redirected or denied according to current app behavior.
- Logged-out user visiting `/admin` is redirected to `/login`.

### 2. Admin Dashboard

Add:

- `pages/AdminDashboardPage.ts`
- `tests/ui/admin-dashboard.ui.spec.ts`

Scenarios:

- Open `/admin`.
- Assert dashboard metrics are visible.
- Assert recent orders and low-stock sections.
- Navigate from dashboard to manage products and orders.

Data setup:

- Use seeded products/orders if stable.
- If specific counts are needed, create disposable product/order data through real admin APIs first.

### 3. Admin Products

Add:

- `pages/AdminProductsPage.ts`
- `pages/AdminProductFormPage.ts`
- `tests/ui/admin-products.ui.spec.ts`

Scenarios:

- Open `/admin/products`.
- Assert product table against real API data.
- Create a disposable product through `/admin/products/new`.
- Assert product appears in list.
- Open `/admin/products/edit/:id` for a disposable product and assert existing values are prefilled.
- Delete a disposable product and assert it is removed.
- Assert form validation for required fields.
- Assert regular and logged-out users are redirected away from admin product management.

Status:

- Implemented in `tests/ui/admin-products.ui.spec.ts` with `AdminProductsPage` and `AdminProductFormPage`.

Data setup:

- Use a unique product name per test, generated in the test.
- Clean up created products through real API or UI delete.

### 4. Admin Orders

Add:

- `pages/AdminOrdersPage.ts`
- `tests/ui/admin-orders.ui.spec.ts`

Scenarios:

- Create a real order as a regular user.
- Sign in as admin.
- Open `/admin/orders`.
- Assert the order appears.
- Filter by status.
- Open details.
- Update order status from order details if the UI supports it.
- Assert status change persists in admin list and order details.

### 5. Users Management

Add:

- `pages/UsersPage.ts`
- `pages/EditUserPage.ts`
- `tests/ui/users-admin.ui.spec.ts`

Scenarios:

- Create a disposable regular user.
- Sign in as admin.
- Open `/users`.
- Assert user row, roles, edit, and delete actions.
- Edit the user details.
- Assert updated values appear in list and after direct reload.
- Delete the user.
- Assert user no longer appears.
- Sign in as regular user and assert edit/delete actions are hidden or edit route is denied.

Risk:

- Deleting users can affect parallel tests if shared users are used. Only delete users created inside the test.

## Parallelization Plan

These streams can be worked on independently:

| Stream | Scope | New files |
| --- | --- | --- |
| Auth recovery | Forgot/reset password | `ForgotPasswordPage.ts`, `ResetPasswordPage.ts`, `password-reset.ui.spec.ts`, optional outbox client |
| Catalog/cart/checkout | Product details, cart, checkout, order details | `ProductDetailsPage.ts`, `CheckoutPage.ts`, `OrderDetailsPage.ts`, `products.ui.spec.ts`, `cart-checkout.ui.spec.ts` |
| Utilities | Email, QR, traffic | `email.ui.spec.ts`, `qr.ui.spec.ts`, `traffic.ui.spec.ts` |
| LLM | Landing and three LLM modes | `LlmModePage.ts`, `LlmChatPage.ts`, `LlmGeneratePage.ts`, `LlmToolsPage.ts`, `llm-workflows.ui.spec.ts` |
| Admin catalog/orders | Admin dashboard/products/orders | `admin.fixture.ts`, admin page objects, admin specs |
| Users admin | `/users`, edit user | `UsersPage.ts`, `EditUserPage.ts`, `users-admin.ui.spec.ts` |

Recommended sequencing:

1. Add `admin.fixture.ts` and missing page objects with only selectors/navigation.
2. Add smoke tests for every missing screen.
3. Expand smoke tests into full workflows that create their own real data.
4. Add cleanup helpers for created users/products/orders.
5. Add coverage tracking once the route list is stable.

## Coverage Measurement

Track two levels separately:

- Screen smoke coverage: every routed screen can be opened and its main UI is asserted.
- Workflow coverage: the highest-value user action on that screen is performed against the real stack.

Suggested tracked matrix fields:

- `route`
- `screenName`
- `access`
- `smokeSpec`
- `workflowSpec`
- `status`: `missing`, `smoke`, `workflow`, `redirect`
- `testDataStrategy`
- `lastVerified`

Proposed target:

- Short term: 26/26 concrete screens have smoke coverage, and `/orders` redirect is asserted.
- Medium term: checkout, orders, products, profile, admin products, admin orders, users, and LLM modes have workflow coverage.
- Long term: add a small route inventory check that compares the frontend route list with this coverage matrix.

## Next Implementation Targets

High-value order:

1. `admin.fixture.ts`
2. `cart-checkout.ui.spec.ts` with `CheckoutPage` and `OrderDetailsPage`
3. `admin-products.ui.spec.ts`
4. `admin-orders.ui.spec.ts`
5. `users-admin.ui.spec.ts`
6. `password-reset.ui.spec.ts`
7. `llm.ui.spec.ts`
8. `email.ui.spec.ts`
9. `qr.ui.spec.ts`
10. `traffic.ui.spec.ts`

## Commands

For each new UI spec:

```bash
npx playwright test tests/ui/<new-spec>.ui.spec.ts
npm run test:ui
```

For all tests:

```bash
npm test
```

For API-only helper/client work:

```bash
npm run test:api
```
