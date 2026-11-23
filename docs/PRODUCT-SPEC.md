<!-- Copy of the project root CLAUDE.md (product spec + current state). The root folder is not a git repo;
     keep this copy in step with it, and with the same file in the other repo. -->

# rastashops.com — handoff for Claude Code

This folder contains a **clickable prototype** of rastashops.com, built in Claude Design.
It is a front-end demo only: React 18 (UMD) + Babel in the browser, fake data in `localStorage`, no server.
Your job is to **rebuild it as a real product**. Use the prototype as the source of truth for screens,
copy (uz / ru / en) and behaviour, but not for architecture.

---

## 1. Product in one paragraph

rastashops lets small Instagram/Telegram sellers in Uzbekistan get a shop page in minutes
(`rastashops.com/<handle>`), manage products with variants and stock, sell in person with a barcode
scanner, and receive **basket requests** from buyers. There is no online checkout and no payment:
the buyer fills a basket, gets a short code/link and sends it to the seller in Telegram; price, pickup
or delivery and payment are agreed in Telegram. All shops also appear in a marketplace ("Explore",
internally "rasta bozor"). Languages: **Uzbek (Latin, default for the market), Russian, English**.

Target users: sellers on phones with weak internet. Everything must be fast, simple and mobile-first.

---

## 0. Current state (read first) — updated 23.11.2026

The product is **built and running**; the prototype is no longer only a demo. Sections 2 and 11 below describe the
original handoff and are kept for history.

| What | Where |
|---|---|
| Backend: Java 21 + Spring Boot 4 + PostgreSQL + MinIO | `back/` → GitHub `B1essed1/rasta-back` (see `back/CLAUDE.md`) |
| Frontend: the prototype ported to Vite/React ES modules, all data from the API | `front/` → GitHub `B1essed1/rasta-front` (`front/src/proto/*`, `front/src/api.js`) |
| Design + endpoints + what is built / not built | `BACKEND-PLAN.md` (copy in `back/docs/`), **§21 = build status, §22 = deployment** |
| Next plans, ideas, competitor research, what we do NOT build | `NEXT-PLANS-AND-IDEAS.md` |
| Original prototype (reference only) | `prototype/` (unpacked), `rasta.uz – rasta.html` |
| Dev server (CI/CD target) | **https://labaratory.rastashops.com** (API `/api/v1`), server `178.105.45.4` (root). Push to `main` in either repo deploys it. |

Run locally: `docker start rasta-pg rasta-minio` → `cd back && SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run` →
`cd front && npm run dev` → http://localhost:5173. Dev login: "Continue with Telegram" shows a simulated bot; demo owner
Malika Yusupova `+998 97 700 30 40`, till PINs 0000 / 1111 / 2222 / 3333.

Data layer rule: `front/src/proto/Store.jsx` and `OrderStore.jsx` keep the prototype's method names; they are a cache of
the server (loaded before the first render, optimistic writes merged with the server's answer). Screens read them
synchronously as before. Guest baskets, POS held sales, language and the onboarding draft stay on the device.

---

## 2. How to run the prototype

- Open `project/rasta.html` in a browser served over HTTP (e.g. `npx serve project` then open `/rasta.html`).
- Scripts load in the order listed in `rasta.html`; files share globals via `Object.assign(window, …)`.
- State is in `localStorage` key `rasta.v2.state` (shop data, version 15) and `rasta_chat_state` (buyer side).
  Clear them to reset demo data.
- A floating "page navigator" (bottom of screen) jumps to every screen. `?view=explore|store|dashboard|…`
  and `?p=<productId>` and `?b=<basketCode>` also work.
- `project/rasta.uz (standalone).html` is an old frozen export — ignore it.

---

## 3. Feature switches (top of `project/OrderStore.jsx`)

| Flag | Value | Meaning |
|---|---|---|
| `ORDERS_ON` | **false** | Old online checkout, order tracking, seller "Orders" tab. Will be rewritten — do not build. |
| `REVIEWS_ON` | **false** | Ratings/reviews everywhere. Do not build now. |
| `CHAT_ON` | **false** | In-app buyer↔shop chat. Do not build (Telegram is the channel). |
| `REQUESTS_ON` | **true** | Basket requests (section 6). **Build this.** |

Code behind the OFF flags still exists in the prototype; treat it as reference only.

---

## 4. Screens

### Public
- **Landing** (`LandingPlus.jsx`, `Landing.jsx`) — hero with logo, claim-your-handle field, features.
- **Explore / marketplace** (`ExplorePlus.jsx`, `Marketplace.jsx`) — search-first header, full category
  mega-menu (all categories shown, even empty), shop cards with ♡ save, product results with the
  same filter engine as the storefront (section 8).
- **Storefront** (`Storefront.jsx`, `StoreFilters.jsx`, `ProductPage.jsx`, `StoreThemes.jsx`, CSS in
  `storefront.css`, `store-themes.css`, `storefront-mobile.css`) — per-shop themes/palettes/fonts.
  Header is compact on purpose (products come first): avatar, name, 2-line tagline, **trust row**
  (Telegram verified · N sold · N products · city · since · Instagram), buttons "About the shop" + Share,
  and a "How to buy" strip (Add to basket → Send the basket link → Agree, pay, receive).
  "About the shop" section at the bottom: how-to steps, facts (payment · how you get it · exchange & returns),
  map/address, contacts.
- **Product page** — gallery shows **every uploaded photo (up to 6)**; per-colour photos when the
  chosen colour has them. Variant picker (size buttons, colour swatches, unavailable values disabled),
  size chart, quantity, "Add to basket · {sum}", "N sold", spec table, facts.
- **Link-in-bio page** (`BioLink.jsx`, `BioConcepts.jsx`, `BioEditor.jsx`).
- **Basket link page** `rastashops.com/b/<CODE>` (`RequestPublic` in `Orders.jsx`) — shows the basket,
  status, total; "Go to the shop"; "I'm the seller — open in dashboard".

### Buyer
- **Basket** (`BuyerCart.jsx` → `BasketPage`) — one basket per shop, "Send to {shop}" per basket.
- **"Your basket is ready" sheet** (`RequestSentSheet` in `Orders.jsx`) — big 5-char code, link, one main
  button "Send to @shop" (see 6.3), small "Copy link".
- **Buyer profile** (`BuyerHub.jsx`, `BuyerProfile.jsx`) — Telegram login, **Saved shops (♡)**, addresses,
  settings (name, bigger text, language, logout). Header shows ♡ with count + bag with count.
- Saving a favourite **requires login**; a guest tapping ♡ gets the Telegram login sheet, then the shop is saved.
- "My size": first size a logged-in buyer filters by is saved to the account and offered as a one-tap chip.

### Seller dashboard (`Dashboard.jsx`, `DashMobile.jsx`)
Tabs: Home · **Requests** · Products · Inventory · Sales · Team · Design · Settings
(Orders, Chats, Reviews hidden by flags).
- **Home** — scan-and-sell hero, today's sales, attention list (new requests, sold out, low stock,
  incomplete products), shop link, quick actions.
- **Requests** (`RequestsView`) — table: code · buyer · items · total · status · date; filters
  Open/New/Agreed/Sold/Cancelled/All; search by pasted code; row expands to items with photo, variant,
  barcode, qty × price, **live stock warnings** ("only 1 left", "no longer in stock"); actions
  Mark agreed · Mark sold… (agreed total + payment) · Reply in Telegram · Copy link · Cancel.
- **Products** (`Products.jsx`, `Attributes.jsx`) — add/edit product: photos (up to 6, per-colour groups),
  names/descriptions in 3 languages, price, category (3-level cascade + name-based suggestion),
  "Add sizes, colours or options" → variant chooser (cross product = variant rows, each with its own
  price, qty, optional barcode + cost), "More details (optional)" spec fields, "Barcodes & cost" switch.
- **Inventory** (`Inventory.jsx`, `InvHistory.jsx`, `InvAdjust.jsx`) — Stock table; **History** table
  (ID/sale no · product+variant · qty · price · amount · stock left · what happened (pill) · date dd.mm.yyyy ·
  who (full name) · barcode), modern date-range picker (`HxRange`), reports.
- **Sales** (`Sales.jsx`) — KPI cards (revenue, profit %, number of sales, average sale, returns/losses),
  revenue-by-day chart, payment-type split, table: ID · products · qty · amount · profit · payment ·
  seller (full name) · status · date; row expands to lines with returns. Manual sale modal.
- **Scan & sell / POS** (`ScanSell.jsx`) — barcode scanning till (camera + USB scanner + search),
  price editable per line, sold-out warning with "sell anyway", unknown barcode → add product.
  **Several customers at once**: "Next customer" puts the current sale on hold; tabs
  "Customer N · waiting/now · items · sum" switch between open sales; Complete jumps to the customer
  who waited longest; × cancels a held sale; max 8; open sales survive reload. Line price = variant price.
- **Mobile dashboard** (`DashMobile.jsx`) — bottom bar shows the first 3 existing tabs (Home, Requests,
  Sales…) + central Scan + "More" sheet; never assume a tab exists (switched-off tabs crash it otherwise).
- **Team** (`Team.jsx`) — owner / manager / cashier roles and permissions; staff always shown by
  **first + last name, never "You"** (`staffName`).
- **Design**, **Settings** (`Settings.jsx`) — theme, palette, layout; shop name, handle, city, contacts,
  payments (Cash, Click, Payme…), status live/paused, plan (free/pro).

### Onboarding (`OnboardingV2.jsx`)
Two steps only: **Telegram login → Your shop** (name, handle, shop type chips). No "first product" step,
no delivery step.

---

## 5. Data model (from `Store.jsx`, `data.jsx`, `data2.jsx`)

- **Shop**: id, handle, name, tagline {uz,ru,en}, city/location, type, contacts {telegram, instagram, phone},
  payments[], status (live|paused), plan, theme cfg, showSold, threshold (low stock).
- **Product**: id, catId (leaf category), name {uz,ru,en}, desc {uz,ru,en}, price (base), specs {attrId: value},
  optName (seller's own option name), visible, sort, created, photos (≤6, per colour optional),
  **variants[]**.
- **Variant**: id, options {attrId: valueId}, price (null = product price), qty, barcode (EAN or `RS-…`
  auto), avgCost (weighted average, null = unknown), threshold.
- **Movement** (stock journal — the only way stock changes): id, variantId, productId, delta, reason
  (`restock | sale | correction | loss | return`), unitCost, saleId, note, at.
  **Invariant: cached variant.qty === sum of its movements.** (`reconcile()` repairs drift.)
- **Sale**: id, no (sequential per shop), at, pay, status (completed|partially_returned|returned),
  sellerId, lines [{variantId, productId, name, label, qty, unit, cost, returned}], total.
- **Request (basket)**: id, **code** (5 chars from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`), at,
  status `new → agreed → sold | cancelled`, lines [{variantId, productId, name, label, qty, unit}], total,
  finalTotal, buyer {name, phone, tg} | null, saleId, saleNo, history[].
- **Staff**: id, name, phone, role, status (invited|active|inactive), tg.
- **Buyer account**: phone (from Telegram), name, tg, addresses[], favShops[], mySize {aid, v}.
- Money: integer so'm (UZS), formatted with spaces ("1 780 000 so'm").

---

## 6. Basket requests — the core flow to build

1. **Add to basket** — any product, any variant, no login. One basket per shop.
   There is **no direct "send this product to the shop"** — buying always goes through the basket.
2. **Send** — "{shop} ga yuborish" in the basket → `POST /api/v1/requests` → the server makes the code + link
   `<site>/b/<CODE>` and the "Your basket is ready" popup opens **over the basket page**.
   - The basket is **NOT** cleared yet. Closing the popup (× or tapping outside) returns to the basket.
   - Pressing "Send" again with the same basket reopens the same code (no second request); a changed basket makes a
     new request.
   - The basket is cleared **only** when the buyer presses the popup's main button "@shop ga yuborish".
3. **Deliver to the seller — decided 23.11.2026 (replaces the old "Target: bot in the buyer's path")**
    - **The buyer always starts the direct chat with the shop.** The popup's main button opens
      `https://t.me/<shopUsername>?text=<urlencoded message>`; the buyer presses Send in Telegram. Price, pickup place
      and payment are agreed in that chat (a bot cannot open a chat between two people, and many buyers have no
      @username, so the seller could not reach them otherwise). The message is also copied to the clipboard.
      If the shop has no username: `https://t.me/share/url?url=<link>&text=<msg>` (Settings warns about this).
    - **The bot `@rastashops_bot` works only for the seller:** when the request is created the server sends the shop
      owner a card with **View · Agreed · Sold… · Cancel**. Sold… asks the agreed total (one tap or type it) and the
      payment method, then records the sale. The card is edited on every status change (web or bot).
    - `t.me/rastashops_bot?start=b_<CODE>` still works for old links but is no longer offered to buyers.
4. **Message template** (uz shown; also ru/en):
   ```
   Salom! 👋 rastashops orqali savat yubordim.

   🛍 Savat: RRWEJ
   1) Nike Air Max 270 — 42, qora × 1 — 890 000
   2) Adidas Samba — 41, oq × 1 — 890 000

   Jami: 1 780 000 so'm
   🔗 rastashops.com/b/RRWEJ

   Narx va olib ketishni kelishsak bo'ladimi?
   ```
   Plain text only (no markdown), keep ≤ ~15 lines; Telegram max 4096 chars.
5. **Seller side** — Requests tab (section 4). **Mark sold** asks for the agreed total + payment method,
   spreads the agreed total proportionally over the lines, calls `completeSale` → creates a Sale and
   `sale` movements (stock goes down). Requests never reserve stock; show live stock warnings instead.
6. Codes must be random and unguessable; the public basket page must not expose the buyer's phone.

---

## 7. Categories (`Taxonomy.jsx`)

- 3 levels: root › group › leaf, aligned to **Google Product Taxonomy** (gid stored per node), trimmed,
  plus groups for Instagram/Telegram sellers: cakes/bento/sweet boxes/national sweets, abaya/modest
  sets/hijab/maternity, wedding, nails, smartwatches, party, curtains/kurpacha, handmade (soap, knit,
  embroidery, resin), religious goods (5605: mats, tasbeh, Quran, gifts), sport groups. Every root has an
  "Other" group/leaf.
- Each leaf declares `v` (variant attributes: size, colour, memory, weight…) and `s` (spec attributes).
  Every leaf also gets the free-text `option` variant attribute; most get `condition`.
- Sellers can add their own values (`"c:<text>"`).
- Known UX debt: replace the 3 dropdowns with one searchable picker (suggested from name, shop's usual
  categories as chips, search across all leaves, "browse all"); nothing pre-selected; confirm before a
  category change wipes chosen variants.

---

## 8. Filters (`StoreFilters.jsx` — `SfxBar` engine, used by storefront and Explore)

- Quick chip row on screen: Sort ▾ · (My size) · top 2–3 facets for the current category ▾ · Price ▾ ·
  ★4+ (only when reviews on) · All filters (count). Popovers on desktop, bottom sheets on mobile.
- Facets come from the products' categories (variant + spec attributes), ordered by coverage.
- Counts on every value; values with 0 results disabled. Multi-select inside a facet.
- Seller-typed look-alike values merged (e.g. "Qora" / "black" / "чёрный" → black).
- Sort: Newest, Popular (units sold), Highest rated (reviews on), Cheapest, Most expensive.
- Price: 3 presets built from real prices + own range. In-stock toggle.
- Filters live in the URL (`?cat=&f_<attr>=a,b&pmin=&pmax=&sort=&instock=1`) so shared links keep them.

---

## 9. Decisions made (do not undo without asking)

- Domain/brand: **rastashops.com** (old name rasta.uz is gone; "rasta bozor" label in Explore still to rename).
- **No delivery feature** — handover is agreed in Telegram. Only pickup/agreement wording.
- No online checkout, no payments, no reviews, no in-app chat (flags above).
- Buyer contacts the shop only via the basket flow; shop's Telegram/Instagram/phone are listed in
  "About the shop".
- Dates always shown as **dd.mm.yyyy** (never "today/yesterday") in tables.
- People always shown by full name, never "You".
- Variant price can differ per variant ("from" price on cards).
- Favourites require login and are stored on the account.

Added 23.11.2026:
- **Buyers do not log in to add to the basket or to send it.** Researched (Baymard: ~18–19% of shoppers abandon
  when forced to create an account; logins through Instagram's in-app browser often fail). Login stays optional for
  buyers (♡ saved shops, addresses, "my size"); if logged in, the buyer's name and phone go on the request. Revisit
  only if spam baskets become a real problem — then "login before sending" per shop, never "login to add".
- **The buyer starts the direct Telegram chat; the bot only notifies the seller** (section 6.3). Every shop needs a
  Telegram username.
- **The basket is cleared only by the popup's send button** (section 6.2).
- **Backend is Java 21 + Spring Boot 4** (not Node); ids are text, money integer so'm, every stock change goes
  through the movement journal; branches exist in the data model (one default branch per shop, no UI yet).
- Seller and staff login: Telegram via the bot ("Share my phone"). Staff are invited by phone and activated when
  they log in with that phone. Till PINs are checked on the server and never shown.

---

## 10. Known gaps / next work

Current list: `BACKEND-PLAN.md` §21 ("Not built yet"). Highlights: bot token + webhook on the server (until then
nobody can log in on the dev server), Open Graph previews, nightly jobs, tests in CI, branch screens.

Original list:
- ~~Telegram bot (section 6.3) + Telegram Login for buyers and sellers.~~ Built; needs the real bot token.
- Link previews (Open Graph: photo, name, price) for shop, product and basket links — important for Telegram.
- Product ♡ (save products), "New" / sale (old price) badges.
- Category picker redesign (section 7).
- Skip single-child category levels in storefront chips.
- Shop "exchange & returns" setting (currently a default text).
- Image compression / fast first load for weak internet.

---

## 11. Suggested build approach (original handoff — done: see section 0 and BACKEND-PLAN.md)

1. Read the prototype; run it; list screens and confirm this spec.
2. Propose stack (e.g. Next.js + PostgreSQL + Prisma, Telegram Login, a small bot service) and the
   schema from section 5. **Plan first, no code.**
3. Build in this order: auth + shops → products/variants/stock journal → storefront + filters →
   basket requests + Requests tab → Telegram bot → POS/sales/inventory history → Explore.
4. Keep all copy in uz/ru/en from the prototype (`addI18N` blocks in each file).