# Current Focus — Farmer lists crop → Vendor buys crop (v1 hardening)

Epic: a farmer can list a crop and a vendor (buyer) can purchase it, end to end, on code that
passes the loop's Definition of Done. The endpoints exist (see `.claude/context/architecture.md`)
but predate the guardrails — this focus hardens the sell/buy path task by task.

Work each task through the loop: freeze plan-lock → code + tests → /review → ship.
One task = one unit = one commit. Update the checkbox + PROGRESS.md when a task ships.

## Task 1 — Test + lint infrastructure (unblocks everything)

The review gate requires tests in every feature diff; the repo has none.

- [ ] Frontend: fix the 23 existing eslint errors (`npm --prefix Frontend run lint`). Two are real
      runtime bugs: `saveRes` undefined in `src/CropConnectImages/ProfileImage.jsx:43`, `err`
      undefined in `src/pages/Signup.jsx:47` (both crash their catch/response paths).
- [ ] Backend: add `vitest` + `supertest` + `mongodb-memory-server` (dev deps), `npm test` script,
      and a first smoke test (`Backend/tests/`) hitting `/test` via a exported `app`
      (refactor `server.js`: export `app`, move `listen` + DB connect behind
      `require.main === module` or a separate `index.js`).
- [ ] Backend: add ESLint 9 flat config + `npm run lint` (match Frontend's eslint version).
- [ ] Frontend: add `vitest` + `@testing-library/react` + `jsdom`, `npm test` script, one smoke test.
- [ ] Extend `config.verify.frontend` with:
      `npm --prefix Backend run lint`, `npm --prefix Backend test`, `npm --prefix Frontend test`.
- [ ] Verify pipeline green.

## Task 2 — Farmer lists crop (backend contract + validation)

- [ ] `POST /addProductByFarmer/add-productByFarmer`: validate body at the boundary (name, variety,
      pricePerUnit > 0, quantityAvailable > 0, unit enum, harvestDate) — reject unknown fields
      (no raw `...req.body` into `create`).
- [ ] All `/addProductByFarmer` responses use the standard envelope
      `{status, status_code, message, timestamp, data, error}` with correct codes (200/201/4xx).
- [ ] Remove `console.log`/dead code from the touched routes; errors return generic message,
      detail logged server-side.
- [ ] Tests: create (valid + invalid body + duplicate 409), list, update, delete — incl. the
      "farmer A cannot touch farmer B's product" abuse case.

## Task 3 — Vendor browses + carts crops

- [ ] `GET /orderProduct/get-AllListedProduct`: pagination (`page`, `limit`, `sort_by`, `order`),
      only `status: "available"` products, envelope contract.
- [ ] Cart add/remove: stop flipping product `status` on cart-add (cart ≠ reservation);
      envelope contract; tests incl. add-twice and remove-not-in-cart.
- [ ] Fix `cancelOrder` no-op bug (`findOneAndUpdate` with no update object).

## Task 4 — Vendor buys crop (the money path)

- [ ] `POST /orderProduct/orderProduct`: derive `buyerId` from JWT (never from query params);
      resolve `farmerId` from the product; validate quantity ≤ `quantityAvailable`.
- [ ] Atomically decrement `quantityAvailable` (conditional `findOneAndUpdate`) — product becomes
      `unavailable` only at 0; compute `totalPrice` server-side.
- [ ] Order confirmation email moved behind an env flag (`EMAIL_ENABLED`) and out of the
      request's critical path (failure to send ≠ failed order).
- [ ] Envelope contract on all `/orderProduct` responses; tests: happy path, insufficient stock,
      buyer-role enforcement, order visible to its buyer only (`find()` currently returns ALL orders
      to any buyer — scope it).
- [ ] `/security-review` (touches auth'd routes + money path) — STRIDE per `rules/security.md`.

## Task 5 — Frontend: list + buy flows on the contract

- [ ] `src/utils/api.js`: base URL from `import.meta.env.VITE_API_BASE_URL` (`.env.example` added).
- [ ] Farmer ListProduct + buyer BrowserProduct/ProductDetails consume the new envelope; every
      data-fetching component renders loading + error + empty states.
- [ ] One toast library (drop the other); labels from a constants file.

## Deferred / later

- `/api/v1` route versioning + `/api/health` endpoint (breaking change — coordinate FE+BE in one task).
- `PORT` bug (`3000 || process.env.PORT`), morgan logging re-enable (env-conditional).
- JWT storage strategy (localStorage → httpOnly cookie) — security decision, human call.
- Payments, delivery tracking, admin dashboards.
