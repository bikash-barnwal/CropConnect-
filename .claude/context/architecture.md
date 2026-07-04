# CropConnect — Architecture Map

Marketplace connecting **farmers** (list crops) with **buyers/vendors** (browse, cart, order).
Two independent npm projects in one repo — no root package.json, no workspaces.

## Stack

| Layer | Tech | Location |
| --- | --- | --- |
| API | Express 5 (CommonJS), Mongoose 8, JWT auth, Multer + Cloudinary uploads, Nodemailer order mails, express-rate-limit | `Backend/` (entry: `server.js`, port 3000) |
| DB | MongoDB via Mongoose (no SQL, no migrations) | models in `Backend/Models/` |
| UI | React 19 + Vite, react-router-dom 7, axios, Tailwind (v3 config + v4 vite plugin both present), react-hot-toast + react-toastify (both), chart.js | `Frontend/` (dev server 5173) |
| Deploy | Backend on Render (`cropconnect-un44.onrender.com`), Frontend on Vercel (`crop-connect-zeta.vercel.app`) | `Frontend/vercel.json` |

## Roles

`user.model.js` roles: **farmer**, **buyer** (aka vendor), **admin**. JWT carries `userID` + `role`;
`Backend/Middlewares/auth.middleware.js` (`Authentication([roles])`) guards routes and is a
**protected path** — human-owned. Blacklisted-token model backs logout.

## Backend route mounts (`server.js`)

| Mount | File | Purpose |
| --- | --- | --- |
| `/user` | `user.routes.js` | signup/signin/JWT, password reset |
| `/farmerProfile` | `farmerProfile.routes.js` | farmer profile CRUD |
| `/buyerProfile` | `buyerProfile.routes.js` | buyer profile CRUD |
| `/addProductByFarmer` | `addProductByFarmer.routes.js` | farmer lists/updates/deletes crops; sees buyer interest |
| `/orderProduct` | `orderProduct.routes.js` | buyer browses all products, cart add/remove, place order (+ email), order CRUD |
| `/setProfileImg` | `profileImg.routes.js` | Cloudinary profile image |

## Frontend

- `src/utils/api.js` — the centralized axios instance (JWT from `localStorage.cropconnect_token`).
  **Base URL is hardcoded to prod Render** — should come from `import.meta.env`.
- `src/routes/AppRoutes.jsx` + `PrivateRoute`/`PublicRoute` — role-gated routing.
- `src/pages/` — farmer flow (`FarmerDashboard`, `FarmerHome`, `ListProduct/`, `EditProduct/`),
  buyer flow (`BuyerDashboard`, `BrowserProduct`, `ProductDetails`), auth pages.
- `src/hooks/useAuth.jsx` — auth state.

## Known debt (pre-loop code — fix as routes/components are touched)

- API responses do **not** follow the envelope contract in `rules/api-standards.md`
  (`{status, status_code, message, timestamp, data, error}`); ad-hoc shapes + wrong codes
  (201 on GETs, 200 on errors).
- No request-body validation layer (no schema validator); `req.body` spread straight into
  `Model.create` (mass-assignment risk).
- `orderProduct.routes.js /orderProduct` trusts client-supplied `buyerId`/`farmerId` query params
  instead of deriving buyer from the JWT; no stock decrement; no transaction.
- `addToCart` flips product `status` to `unavailable` on cart-add (cart ≠ purchase).
- `cancelOrder` calls `findOneAndUpdate` with no update object — order is never actually cancelled.
- Unpaginated list endpoints (`find()` with no filter/limit).
- `console.log` debug lines and commented-out code throughout; no tests anywhere; no unversioned
  `/api/v1` prefix; `PORT` bug: `3000 || process.env.PORT` always 3000.
- Frontend: JWT in `localStorage`, hardcoded prod base URL, duplicate toast libraries, Tailwind
  v3/v4 both configured.
