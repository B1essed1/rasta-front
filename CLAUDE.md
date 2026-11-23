# rastashops.com — frontend

The Claude Design prototype ported to Vite + React 18 ES modules (`src/proto/*`, one file per prototype script,
same names), with every screen fed by the backend (`/api/v1`). Product spec: `docs/PRODUCT-SPEC.md` (§0 current state,
§6 basket flow, §9 decisions). API and data rules: `docs/BACKEND-PLAN.md` (§14 switch-over, §21 status, §22 deploy).
Next plans and seller analytics ideas: `docs/NEXT-PLANS-AND-IDEAS.md`.

## Run

```bash
npm install && npm run dev      # http://localhost:5173, proxies /api → http://localhost:8080 (backend in dev profile)
npm run build                   # what CI runs
```

Push to `main` deploys to https://labaratory.rastashops.com (GitHub Actions → `rasta-deploy-frontend`).

## How the data layer works

- `src/api.js` (`window.Api`): fetch client; access token in memory, refresh cookie (`/auth/refresh`), one retry on a
  dropped connection, error `code` → toast text (`Api.errorText`), `X-Operator` (till seller) and `X-Branch` headers.
- `src/proto/Store.jsx` (`useShopStore`): keeps **every prototype method name and shape**; it is a cache of the server.
  `bootData()` loads `/catalog`, the session and (on `/dashboard`) the shop's bootstrap **before the first render**
  (`App.jsx` bottom). Writes apply the prototype's reducer at once, call the API, then merge the server's answer
  (`apply()`); on an error: toast + fresh bootstrap. POS sales made offline queue in `rasta.pos.outbox` (same id =
  idempotent). Dashboard history is a 120-day window; date pickers call `store.ensureRange()` for older days.
- `src/proto/OrderStore.jsx` (`useOrderStore`): the account comes from `/me` (saved shops, addresses, my size);
  **guest baskets stay in `localStorage` (`rasta_chat_state`)** and are synced between tabs (`storage` event).
- Photos: `PhotoStore` / `pickPhoto` in `Icons.jsx` — slots (`pi-…`, `pc-…`, `avatar-…`, `cover-…`) map to server
  photos; uploads go to `/media` then `PUT /dash/{shop}/photos`. `photoURL()` returns the real photo, Unsplash only for
  demo (seed) shops, else a flat colour.
- `SHOPS` / `SHOP_ORDER` (from `data.jsx`) are cleared at boot and filled from the API; the demo data in
  `data.jsx` / `data2.jsx` / `Team.jsx` is no longer used at runtime (the backend seed exports it).

## Basket flow (decided 23.11.2026)

"{shop} ga yuborish" in the basket creates the request on the server and opens `RequestSentSheet` (`Orders.jsx`)
over the basket page. The basket is cleared **only** by the popup's main button, which opens the shop's own Telegram
chat with the message typed (`t.me/<shop>?text=`); closing the popup returns to the basket; the same basket reopens
the same code (`pendingReq` in `App.jsx`). Buyers never need to log in for this.

## Gotchas

- Feature flags stay off: `ORDERS_ON`, `REVIEWS_ON`, `CHAT_ON` (their store methods are local no-ops).
- Files are UTF-8 with Uzbek/Russian text: edit with UTF-8-safe tools (PowerShell 5 `Get-Content` breaks them).
- `DevTour.jsx` (page navigator) loads only in `npm run dev`.
