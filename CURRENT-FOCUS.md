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

## Task 6 — Vendor ↔ Farmer chat (secure, real-time, responsive)

Requires Task 1 (test infra). Real-time = Socket.IO on the existing Express server; REST for
history, socket for live push. **Free-tier decision (owner: free services only):** stay on Render
free + an external keep-alive ping (UptimeRobot free / cron-job.org, 5-min interval) so the
instance never sleeps — no paid instance, no third-party realtime service.

**Backend**
- [ ] Models: `conversation` (farmerId, buyerId, optional productId, unique per pair+product) and
      `message` (conversationId, senderId, text ≤ 2000 chars, readAt), compound index
      `conversationId + createdAt`.
- [ ] REST (envelope contract): `GET /chat/conversations` (mine only), `GET /chat/:id/messages`
      (paginated), `POST /chat/:id/messages` (fallback when socket down).
- [ ] Socket.IO: JWT verified on handshake (same secret/blacklist as `auth.middleware.js`);
      join room per conversation only after participant check; server assigns senderId from the
      token — never from the client payload.
- [ ] Security: every query scoped to the authenticated participant (client-supplied conversation
      ids verified against membership, 404 not 403 on foreign ids); rate-limit sends (per-socket +
      the existing express-rate-limit for REST); text stored raw, escaped on render (no HTML).
- [ ] Tests: participant scoping abuse case (buyer C cannot read/join A↔B conversation),
      handshake with expired/blacklisted token rejected, pagination, oversized message rejected.
- [ ] `/security-review` — new routes + user-scoped data + new transport (STRIDE per rules/security.md).

**Frontend**
- [ ] "Chat with farmer" entry on `ProductDetails.jsx`; conversation list + thread view.
- [ ] Perceived zero lag: optimistic send (message renders immediately, pending state, confirmed
      on server ack, retry on failure); socket reconnect with backoff; unread badge.
- [ ] Loading + error + empty states on both list and thread; responsive layout (mobile-first —
      thread full-screen on mobile, split view on desktop).
- [ ] Token for the socket handshake read via the central `api.js`/auth layer — never duplicated
      in components.

## Task 7 — Performance (free-tier friendly)

**Frontend (bundle is one 784kB chunk today)**
- [ ] Route-level code-splitting: `React.lazy` + `Suspense` per page in `AppRoutes.jsx`.
- [ ] One toast library: keep `react-hot-toast`, remove `react-toastify` and its imports.
- [ ] Remove `styled-components` (Tailwind-only per code-style rules); migrate any styled blocks.
- [ ] chart.js loaded lazily, only on dashboard routes.
- [ ] Cloudinary image URLs use `f_auto,q_auto,w_<size>` transforms; explicit width/height to
      avoid layout shift.
- [ ] Evidence: build output before/after in PROGRESS.md (target: initial JS < 350kB).

**Backend**
- [ ] `compression` middleware; `.lean()` on read-only Mongoose queries.
- [ ] Indexes: `addProductByFarmer` on `farmerId` + `status`; messages per Task 6.
- [ ] Nodemailer transporter created once at module level, not per request.
- [ ] Drop redundant per-route `UserModel.findOne` role re-checks (auth middleware already
      verified role) — one DB round-trip less on most endpoints.
- [ ] Keep-alive ping configured (UptimeRobot free) + `/api/health` endpoint to ping.

## Task 8 — UI polish: icons + spacing

- [ ] lucide-react is the ONLY icon set — replace mixed/emoji icons; shared `<Icon>` wrapper with
      fixed size/stroke tokens.
- [ ] Consistent Tailwind spacing rhythm (4/8px scale): card padding, section gaps, form fields —
      extract repeated utility runs into shared components (Card, Section, FormField).
- [ ] Colors exclusively from the UX4G design system palette (rules/code-style.md); one hover
      treatment project-wide.
- [ ] Responsive pass: mobile / tablet / desktop on every touched page.

## Task 9 — Trust + engagement v1

**Trust**
- [ ] Verified-farmer badge: admin-set flag on farmer profile, badge on listings + profile.
- [ ] Ratings + reviews: buyer can rate/review a product only after a completed order
      (order-linked, one per order); average shown on listing cards.
- [ ] Order status timeline (placed → confirmed → delivered) on the order page.
- [ ] Freshness label from `harvestDate` on listing cards; transparent per-unit + total pricing.

**Engagement**
- [ ] Surface SeasonalGuide + Weather on the home page (they exist, buried).
- [ ] Wishlist/favourites for buyers; WhatsApp share button on product details (free share link).
- [ ] PWA: manifest + service worker (installable on phones; free re-engagement channel).
- [ ] In-app notification bell fed by order + chat events (poll or socket per Task 6).

## Deferred / later

- `/api/v1` route versioning + `/api/health` endpoint (breaking change — coordinate FE+BE in one task).
- `PORT` bug (`3000 || process.env.PORT`), morgan logging re-enable (env-conditional).
- JWT storage strategy (localStorage → httpOnly cookie) — security decision, human call.
- Payments, delivery tracking, admin dashboards.
