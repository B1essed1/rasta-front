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
  `bootData()` loads the session and only what the first screen needs **before the first render** (`App.jsx` bottom):
  the landing's shops, one shop's header (+ the product of a `/:handle/p/:id` link, the bio's products), the basket's
  products, saved shops, or (on `/dashboard`) the shop's bootstrap. **Never the whole marketplace** (BACKEND-PLAN §23):
  public products come in pages (`store.browse()`), and products / shop headers seen once are kept by id
  (`state.pub`, `state.pubShop`). `store.products(shopId)` = the seller's whole catalog for their own shop, else the
  public products seen so far. The buyer's storefront and Explore use the server's pages and filters
  (`Storefront server={store}`, `useSfxPages`, `SfxBar sv=`); previews (landing hero, design studio) filter locally.
  A basket line is dropped only when the server lists its product as `gone` (not just "not loaded yet").
  Writes apply the prototype's reducer at once, call the API, then merge the server's answer (`apply()`); on an
  error: toast + fresh bootstrap. POS sales made offline queue in `rasta.pos.outbox` (same id =
  idempotent). The dashboard keeps the whole catalog but only **2 days** of history; Sales, Inventory history and
  reports, Team, Home's 30 days and Requests load their period from the server in pages with totals
  (`store.dashGet`, `useDashPages`, reloaded in place when `store.histRev(shopId)` changes after writes or polling).
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
