# rastashops.com: backend plan (Spring Boot) for the existing frontend

Status: **built and deployed to the dev server** (https://labaratory.rastashops.com) on 23.11.2026: see **§21 build
status** and **§22 deployment**. Code: `back/` (GitHub `B1essed1/rasta-back`), `front/` (`B1essed1/rasta-front`), branch
`main` = `feature/prototype-port` · Written 21.11.2026 · Revised 23.11.2026 · Scope: replace every piece of mock data in
`front/src/proto/*` with a real **Java 21 + Spring Boot** + PostgreSQL + MinIO backend, then switch the frontend over.
**Goal: after step 15 the frontend has no filler data left; every value on screen comes from the API (or is one of
the device-only values listed in D7).**

How this was made: every screen of the frontend was read handler by handler (every button, link, chip, input,
swipe, keyboard shortcut and every value shown on screen) and each was classified as **server read**,
**server write** or **stays on the device**. The design on claude.ai was compared file by file with
`front/src/proto`. It is identical, so the frontend is the spec.

---

## Contents
1. Decisions
2. Stack and project layout
3. Where every piece of data lives (server vs device), screen by screen
4. JSON or table: the rule and every decision
5. Database schema (full DDL)
6. Photos: upload, storage, sizes, display, deletion
7. Auth, sessions, roles, till operator
8. API: conventions
9. API: every endpoint
10. Business rules (ported from `Store.jsx`, bugs fixed)
11. Telegram bot
12. Open Graph link previews
13. Seed data
14. Frontend switch-over
15. Build steps (do in this order)
16. Testing and verification
17. Bugs found in the frontend and how the backend fixes them
18. Later (not in v1)
19. The draft code in `back/` vs this plan
20. Branches
21. Build status
22. Deployment

---

## 1. Decisions

| # | Decision | Why |
|---|---|---|
| D1 | **Rewrite** the backend in the existing `back/` repo on branch `feature/prototype-port` (the deployed `main` keeps the old code; tag it `legacy-backend`). Java package stays **`uz.rasta`** (no churn in deploy, CI, IDE). Fresh Flyway `V1`. Locally it runs in its own database `rasta`. **On the server it shares `rasta_db` but lives in its own schema `app` (D14)**; the old app's tables and Flyway history in `public` are not touched. The draft `V14__prototype_schema.sql` (moves old tables into a `legacy` schema) is **dropped**. | The old code was designed for a different product (orders, SMS login). Reuse ideas and the draft services listed in §19. |
| D1a | **Java 21 (LTS)** + **Spring Boot 4.x** (latest patch of the newest 4.x line at build time; check start.spring.io). `pom.xml` today is 3.3.5, whose free support has ended; 3.5's free support ended 30.06.2026. Boot 4 runs on Java 21; it brings Spring Framework 7, Spring Security 7, Hibernate 7 and Jackson 3 (`tools.jackson.*`), so the draft code's `com.fasterxml` `JsonNode` usage is ported to Jackson 3 in step 0. If the team prefers to stay on 3.x, use 3.5.x only with paid support; do not stay on 3.3. | A new product should not start on an unsupported framework. |
| D11 | **Branch-ready from day one** (§20): every shop gets one default `branches` row; stock, movements, sales and requests carry `branch_id`. While a shop has one branch the UI shows nothing new. | Adding `branch_id` to a stock journal later means back-filling and re-proving the stock invariant on live data. |
| D12 | **Dashboard lists are paged, not bootstrapped.** `bootstrap` returns the catalog, team, settings and badges only; History, Sales, Requests, Reports and Team stats load by date range / cursor. This is the one place where screens change (loading state, "load more"). | A shop with months of POS sales would otherwise download megabytes on every dashboard open. |
| D13 | **The buyer starts the direct Telegram chat with the shop; the bot only serves the seller** (decided 23.11.2026). The popup's main button opens `t.me/<shop>?text=<message>`; the server sends the seller a bot card when the request is created. No buyer login for basket or sending; the basket is cleared only by the popup's send button. | A bot cannot open a chat between two people and many buyers have no @username: with the bot in the buyer's path the seller could not reach them. Research on forced login (Baymard ~18–19% abandonment, in-app browser login failures) → no buyer login wall. See root `CLAUDE.md` §6, §9. |
| D14 | **The prod profile runs in schema `app`** (`spring.flyway.schemas/default-schema`, `search_path app, public`, override `APP_DB_SCHEMA`). | The server's `backend.env` points at `rasta_db`, which still holds the old app; v1 starts there without server changes, and a rollback to the old jar still works. |
| D2 | **API returns the frontend's own shapes** (camelCase, ids as strings, times as epoch ms, money as integer so'm, texts as `{uz,ru,en}`). | Screens stay unchanged; only `Store.jsx` / `OrderStore.jsx` internals change. |
| D3 | **jsonb only for data read and written whole and never searched, filtered, sorted, joined, aggregated or referenced by id.** Everything else is columns and tables. | User rule; see §4. |
| D4 | Flags stay as in the frontend: requests **on**; orders, reviews and chat **off**: no tables, no endpoints. | `OrderStore.jsx:8-13`. |
| D5 | **Shop id is immutable and separate from the handle.** A handle change keeps the old handle as a redirect. | Settings warns "old links break" (`st_slug_warn`); now they don't. |
| D6 | **Stock only changes through the movement journal**, in one transaction with row locks. `variants.qty` is a cache that always equals the sum of movements. | Same invariant as the prototype (`reconcile`). |
| D7 | Guest basket, POS held customers, onboarding draft, bigger-text, UI state **stay on the device**. | Device-local by design; no search; works offline. |
| D8 | Photos go to **MinIO**, resized server-side into fixed sizes, served as immutable public URLs. The Unsplash placeholders are only used by the seed. | §6. |
| D9 | One account for buyer and seller (Telegram identity). Roles are per shop (owner / manager / cashier). | `Store.login` + `OrderStore.signIn` merge. |
| D10 | Dates in tables are dd.mm.yyyy in **the shop's time zone** (`Asia/Tashkent` default). Every "today / this month / date range" is computed on the server in that zone. | Browser time is wrong for staff in other zones and for server totals. |

---

## 2. Stack and project layout

- **Java 21**, **Spring Boot 4.x** (D1a): Web MVC, Validation, Security (JWT), **Spring Data JPA** (Hibernate 7, jsonb via
  `@JdbcTypeCode(SqlTypes.JSON)`) for plain CRUD; **`JdbcClient` + native SQL** for search, reports and stock writes.
  Virtual threads on (`spring.threads.virtual.enabled=true`): the long-poll login wait and Telegram calls block cheaply.
- PostgreSQL 16 with extensions `pg_trgm`, `citext`, `unaccent`. Flyway.
- MinIO (S3 API, `io.minio:minio`). Images: **TwelveMonkeys** (read JPEG/PNG/WebP) + **Thumbnailator** (resize) +
  **`org.sejda.imageio:webp-imageio`** (write WebP).
- Caffeine (cache of taxonomy, config, public shop payloads 30 s), Bucket4j (rate limits), springdoc-openapi
  (OpenAPI file at `/api/docs`), Testcontainers (Postgres + MinIO) for tests, ArchUnit (package rules).
- Plain HTTPS to the Telegram Bot API (`RestClient`), no bot library.

```
back/
  pom.xml
  src/main/java/uz/rasta/
    RastaApplication.java
    common/      ApiError, ErrorCode, Ids, Money, I18n, TimeZones, Page/Cursor, Json, Etag
    config/      SecurityConfig, JwtService, CorsConfig, RateLimitConfig, JacksonConfig, OpenApiConfig
    auth/        AuthController, LoginTokenService, RefreshTokenService, DevAuthController(@Profile dev)
    account/     MeController, AccountService, AddressService, SavedShopService
    catalogref/  TaxonomyController, TaxonomyService, ConfigController (pay methods, cities, types, plans)
    shop/        ShopController(public), ShopAdminController(dash), ShopService, HandleService, BioService
    branch/      BranchController, BranchService, TransferService (§20; v1 only the default branch)
    media/       MediaController, MediaService, ImagePipeline, MediaCleanupJob
    catalog/     ProductController, ProductService, VariantService, FacetIndexer, BarcodeService, PhotoService
    stock/       StockController, StockService, RestockMath, MovementQueryService, StockReportService
    sales/       SalesController, SaleService, SaleQueryService, SalesReportService, CsvExport
    requests/    RequestPublicController, RequestAdminController, RequestService, CodeGenerator
    team/        TeamController, TeamService, TillController, OperatorTokenService, TeamStatsService
    explore/     ExploreController, ExploreQueryService
    stats/       StatsController, ViewCounter
    dash/        DashController (bootstrap, home)
    telegram/    TelegramWebhookController, BotService, BotTexts, TelegramApi, BotNotifier
    og/          OgController (link previews)
    seed/        SeedLoader (taxonomy always; demo shops @Profile dev)
  src/main/resources/
    application.yml, application-dev.yml, application-prod.yml
    db/migration/V1__init.sql …
    seed/taxonomy.json, seed/demo.json, seed/images/*.jpg
  tools/export-seed.mjs     (reads front/src/proto/{data,data2,Taxonomy,Team}.jsx → seed/*.json)
```

Rule (checked by ArchUnit): controllers → services → repositories/queries; no controller touches SQL.

---

## 3. Where every piece of data lives, screen by screen

S-R = server read, S-W = server write, DEV = stays on the device. "Pre" = server sends it precomputed.

### 3.1 Public
| Screen | Server reads | Server writes | Stays on device |
|---|---|---|---|
| **Landing** (`Landing.jsx`, `LandingPlus.jsx`) | hero shop + its public products; 5 shop avatars; 6 shop cards; shop count (replaces hardcoded "2,400+"); plans & features; handle availability + suggestions | – | theme preview (**must not** write the demo shop's design, as `App.jsx:226` does today), pricing monthly/yearly tab, FAQ accordion, claimed handle → `rasta.wizard2` |
| **Explore** (`ExplorePlus.jsx`, `StoreFilters.jsx`, `Marketplace.jsx` cards) | live shops (paged), product search with facets & counts, category counts tree, popular groups, type & city lists, suggestions; "sold" per product (Pre) | my size (on first size filter, logged in), save shop ♡ | search text before submit, mega-menu state, popovers, "show more" (becomes paging) |
| **Storefront** (`Storefront.jsx`) | shop (no private fields), design, public products with variants (no cost/barcode), photo URLs, trust row (**Pre**: soldTotal, productCount, createdAt, telegramVerified), place, facts (payments, returns text), category chips | view count, product view count, ♡ | search box, category chip, filters (in URL), sort, layout |
| **Product page** (`ProductPage.jsx`) | same payload: photos per colour, variants availability, "N sold" (Pre), "N left" (capped: exact only when ≤ 5, else none), spec table, size chart (static taxonomy) | product view | picked options, qty, gallery index |
| **Link in bio** (`BioLink.jsx`, `BioVibe.jsx`, `BioConcepts.jsx`) | name, tagline, city, type, contacts, place, bio design, avatar/cover, top 4 in-stock products **by units sold** | bio view (new) | – |
| **Basket sheet** (`BuyerCart.jsx`) | current price, name, label, stock state per line (basket check) | – | the basket itself (per shop) |
| **Basket sent sheet** (`Orders.jsx RequestSentSheet`) | code, link, total, shop Telegram handle (from create response) | request create | the message text (built on device from the template) |
| **/b/CODE** (`RequestPublic`) | code, date, status, lines, total, shop name/handle; **no buyer, no sale info** | – | – |
| **Buyer hub /me** (`BuyerHub.jsx`) | account, saved shops (cards + 3 **public** product thumbs) | name, notifications on/off, language, addresses, remove ♡, logout | bigger text |
| **Header ♡ / bag** | ♡ count (logged in) | – | bag count |

### 3.2 Seller
| Screen | Server reads | Server writes | Stays on device |
|---|---|---|---|
| **Login** (`Auth.jsx`, `App.jsx LoginView`) | login token status, `me` with shops + roles | Telegram login (bot contact), logout | which shop is open (also `?shop=` in URL) |
| **Onboarding** (`OnboardingV2.jsx`) | handle check + suggestions | create shop (+ cover, logo), owner session | draft in `rasta.wizard2` until "Create my shop" |
| **Dashboard shell** (`Dashboard.jsx`, `DashMobile.jsx`) | shops I can open, viewer role + perms, nav badges (new requests, low/out counts) | logout | tab, language, mobile "More" sheet |
| **Home** | today revenue, attention list counts, last-30-days visitors/product views/items sold/revenue, status, handle | publish (draft → live) | copy link, share sheet |
| **Products** (`Products.jsx`) | product list with stock state, category, options summary, total qty, missing-description flag | create/update product + variants + photos, duplicate, delete, visibility, reorder | list search/filters (client over loaded catalog), editor UI state |
| **Inventory: Stock** (`Inventory.jsx`) | variant rows (qty, cost if perm, barcode, state, last change date), counts, undo-restock candidate | adjust, recount, loss, customer return, restock, undo, barcode set/generate, thresholds | label printing (print dialog), search/filter chips |
| **Inventory: History** (`InvHistory.jsx`) | movements paged by date range/reason/variant/product/text, KPIs, reason counts, running stock, sale no, who | – | – |
| **Inventory: Reports** | stock value at cost/retail, sales & profit, losses, flow chart, top sellers, run-out soon, not selling, losses, restock spend | – | – |
| **Sales** (`Sales.jsx`) | sales paged by date/seller/text, KPIs, by-day chart, payment split, losses; CSV | manual sale, line return | row expand |
| **Scan & sell** (`ScanSell.jsx`) | barcode lookup (from cached catalog; server endpoint as fallback), today's items + revenue | complete sale | held customers (`rasta.pos.carts.*`), camera/USB scanner, search |
| **Requests** (`Orders.jsx RequestsView`) | requests by status/code, counts per status, live stock per line | agree, cancel, sell (agreed total + payment) | – |
| **Team** (`Team.jsx`) | members (no PINs), per-member stats for a range, chart series, member detail (best products, last receipts) | invite, edit, deactivate/activate, cancel invite, PIN reset, till operator switch | – |
| **Design** (`StoreThemes.jsx`, `Studio.jsx`) | design (theme, palette, layout, font, custom palette) | design patch (debounced) | hover preview, device toggle |
| **Bio editor** (`BioEditor.jsx`) | bio design | bio patch (debounced) | hover preview |
| **Settings** (`Settings.jsx`, `Location.jsx`) | everything in settings, plan, trial end, account phone | settings save, cover/avatar, relink Telegram, delete shop | map-link parsing, geolocation (then saved) |

### 3.3 Static reference data (served once, cached forever by version)
Taxonomy (16 roots, 58 groups, 172 leaves, 84 attributes, ~291 values, size charts), themes (10), palettes (16),
fonts (8), bio templates (20) / backgrounds (28) / fonts (9), pay methods (5), cities (8), shop types (21+), plans.
**Themes/palettes/fonts/bio presets stay bundled in the frontend** (pure presentation); the server only keeps the
list of allowed ids to validate writes. **Taxonomy, pay methods, cities, types and plans are served by the API**
(`GET /api/v1/reference`), because the server validates against them and Explore counts by them.

### 3.4 Every source of filler data in the frontend and what replaces it
Step 15 is done only when every row here is ✓ (checked with `grep` on `front/src`).

| Filler today (file) | What it feeds | Replaced by |
|---|---|---|
| `SHOPS`, `SHOP_ORDER` (`data.jsx:~230-354`), 6 demo shops with products | Landing, Explore, storefronts, bio, buyer hub, baskets | `/landing`, `/explore/*`, `/shops/{handle}`, `/me/saved-shops`; the globals become a registry filled from those payloads, then are removed |
| `freshState()` / `loadState()` (`Store.jsx:4-41`, key `rasta.v2.state`) | the whole seller store | `/dash/{id}/bootstrap` + paged lists (D12) |
| `buildCatalog()` (`data2.jsx:961`) | variants, barcodes, costs, qty | `AdminProduct` in bootstrap |
| `seedHistory()` (`data2.jsx:982`), `SUPPLIERS` | movements, restocks, History, Reports | `/movements`, `/reports/stock` |
| `seedStats()` (`data2.jsx:1038`) | visitors, product views on Home | `/home` from `shop_daily_stats` / `product_daily_views` |
| sales inside `freshState` (`data2.jsx:~1009-1021`, pay by `h % 5`) | Sales KPIs, chart, table, Team stats | `/sales`, `/sales/summary`, `/team/stats` |
| `defaultSettings()` (`data2.jsx:914`) | settings defaults | DB column defaults; the server sends the full settings |
| `seedTeam()` (`Team.jsx:98`), `genPin()` (`Team.jsx:391`) | staff list, plain PINs | `/team`, `POST /team/{id}/pin` |
| `TG_DEMO` + random pick (`Auth.jsx:53,71`), demo owner list (`App.jsx:62`), `DevTour.jsx` | fake Telegram login | real bot login (§7.1); `TelegramSim` only in `dev` |
| request code made on device (`Store.jsx:490`), `uid()` ids (`Store.jsx:87`, `Products.jsx:97`, `Team.jsx:404`) | codes and ids | server ids (§5), codes from `POST /requests` |
| `photoURL()` Unsplash placeholders (`Icons.jsx:141`), `PhotoStore` | every photo | media URLs from payloads (§6) |
| "2,400+" (`LandingPlus.jsx:81`) | landing claim | `shopCount` from `/landing` |
| `UZ_CITIES`, `PAY_METHODS` (`data2.jsx:768-769`), `TYPES`, `PLANS`, `Taxonomy.jsx` | pickers, validation | `/reference` |
| simulated network failure (`OrderStore.jsx:61`), bot toast `RequestBotToast` | fake latency / fake bot | real API errors; the real bot message |
| `ScanSell.jsx:161` "scan a random product" demo button | POS demo | removed outside `dev` |
| Off by flag, not built: `seedReviews`, `seedOrders`, `ORDER_*`, `DELIVERY_METHODS`, `RV_*` (`data2.jsx:613-735`) | reviews, orders | stay as local no-ops behind the flags |

Stays in the frontend on purpose (not filler): `I18N` texts, themes, palettes, fonts, bio presets, random palette
generator (`data.jsx:196`), toast ids.

---

## 4. JSON or table: the rule and every decision

**Rule:** a value is stored as `jsonb` only if all of these hold:
1. it is always read and written as a whole,
2. no query filters, sorts, searches, groups or joins on anything inside it,
3. nothing inside it is an id of another row that must stay valid,
4. it will not grow without limit.

Otherwise it gets columns or its own table.

| Data | Storage | Reason |
|---|---|---|
| shop name, handle, city, type, status, moderation, plan | **columns** | Explore filters/sorts/searches on them |
| shop tagline `{uz,ru,en}` | jsonb | shown whole; Explore text search goes through `shops.search_text` |
| shop contacts `{telegram,instagram,phone}` | jsonb | shown whole; the bot reads the Telegram handle by primary key only |
| shop payments `["cash","payme"]` | `text[]` | small list, validated against reference; may be filtered later |
| shop design `{theme,palette,layout,font,customPalette}` | jsonb | presentation, whole |
| shop bio `{tpl,bg,btn,radius,font}` | jsonb | presentation, whole |
| shop place `{has,address,landmark,lat,lng}` | jsonb | shown whole; no geo search in v1 (when "shops near me" comes: move lat/lng to columns + index) |
| shop returns text `{uz,ru,en}` | jsonb | shown whole |
| shop avatar / cover | **FK to media** | referenced, cleanup |
| category names, attribute names, value names | jsonb `{uz,ru,en}` | shown whole; search uses `categories.search_text` |
| category variant/spec attribute lists | `text[]` | small, read whole |
| value aliases ("qora", "черный" → black) | `text[]` + GIN | searched when normalising |
| product name, description | jsonb `{uz,ru,en}` | shown whole; search uses generated `products.search_text` (trigram index) |
| product specs `{attrId: value}` | jsonb | shown whole in the spec table; **filters use `product_facets`** |
| variant options `{attrId: valueId}` | jsonb **+ `options_key` column** | read whole; matching variants on save uses `options_key`; filters use `product_facets` |
| product photos | **table `product_photos`** | ordered, per colour, references media, card cover query, cleanup |
| facets (attr/value per product) | **table `product_facets`** | Explore and storefront filter counts |
| min/max price, in-stock, stock state, units sold | **columns on products** | sorted, filtered, shown on every card |
| movements, sales, sale lines | **tables** | filtered by date/reason/seller, aggregated in reports |
| request lines | **table `request_lines`** | joined to live variant stock for warnings, copied into the sale |
| request buyer snapshot `{name,phone,tg}` | jsonb | shown whole; the real link is `buyer_user_id` |
| request history `[{status,at,by}]` | jsonb | shown whole, small (≤ 4 entries) |
| request Telegram message ids `{chatId,messageId}` | jsonb | used whole by the bot |
| staff perms `{returns,stock,products,costs}` | jsonb | read whole and checked in code |
| user "my size" `{aid,v}` | jsonb | read whole |
| user addresses | **table** | list with default, edited one by one |
| saved shops ♡ | **table** | counted, listed, joined to shops |
| bot chat state | jsonb | conversation step, whole |
| daily views | **table** | summed over date ranges |
| audit log details | jsonb | free-form detail, filtered only by the indexed columns |

---

## 5. Database schema (Flyway `V1__init.sql`)

Ids: `text` with a type prefix plus 12 random base32 characters made on the server (`p_`, `v_`, `m_`, `s_`, `rq_`,
`st_`, `md_`, `u_`, `sh_`), e.g. `p_9k2m4x7q1z3a`. Exceptions: demo seed keeps prototype ids (`lola`, `l1`, …);
taxonomy keeps its own ids (`cl-w-dresses`, `color`, `navy`). Money: `bigint` so'm. Time: `timestamptz`.

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ============ accounts ============
CREATE TABLE users (
  id            text PRIMARY KEY,
  tg_id         bigint UNIQUE,
  tg_username   text,
  tg_chat_id    bigint,                     -- private chat with the bot (for notifications)
  phone         text,                       -- "+998 97 700 30 40"
  phone_key     text UNIQUE,                -- last 9 digits: the account key
  name          text NOT NULL DEFAULT '',   -- "First Last" from Telegram, editable
  lang          text NOT NULL DEFAULT 'uz' CHECK (lang IN ('uz','ru','en')),
  notif         boolean NOT NULL DEFAULT true,
  my_size       jsonb,                      -- {aid, v}
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz
);

CREATE TABLE login_tokens (                  -- one Telegram login attempt
  token       text PRIMARY KEY,              -- 32 random chars
  purpose     text NOT NULL CHECK (purpose IN ('login','relink')),
  status      text NOT NULL CHECK (status IN ('pending','done','used','expired')),
  user_id     text REFERENCES users(id),
  for_user_id text REFERENCES users(id),     -- relink: whose account
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL
);

CREATE TABLE refresh_tokens (
  id          text PRIMARY KEY,
  user_id     text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  text NOT NULL UNIQUE,          -- sha256 of the cookie value
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  revoked_at  timestamptz
);

CREATE TABLE user_addresses (
  id          text PRIMARY KEY,
  user_id     text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       text NOT NULL,
  text        text NOT NULL CHECK (length(text) >= 6),
  is_default  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ux_addr_default ON user_addresses(user_id) WHERE is_default;

-- ============ media (photos) ============
CREATE TABLE media (
  id          text PRIMARY KEY,               -- md_…
  shop_id     text,                           -- null while a draft (onboarding before the shop exists)
  uploaded_by text NOT NULL REFERENCES users(id),
  status      text NOT NULL DEFAULT 'temp' CHECK (status IN ('temp','attached','deleted')),
  width       int NOT NULL, height int NOT NULL,
  bytes       int NOT NULL,                   -- original upload size
  sha256      text NOT NULL,
  dominant    text,                           -- "#c7b09a", placeholder colour while loading
  keys        text[] NOT NULL,                -- object keys of every size written
  created_at  timestamptz NOT NULL DEFAULT now(),
  attached_at timestamptz
);
CREATE INDEX ix_media_cleanup ON media(status, created_at);

-- ============ shops ============
CREATE TABLE shops (
  id              text PRIMARY KEY,
  handle          citext NOT NULL,
  owner_id        text NOT NULL REFERENCES users(id),
  name            text NOT NULL,
  tagline         jsonb NOT NULL DEFAULT '{"uz":"","ru":"","en":""}',
  city            text NOT NULL,
  type            text NOT NULL,
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','live','paused')),
  moderation      text NOT NULL DEFAULT 'pending' CHECK (moderation IN ('pending','approved','rejected')),
  plan            text NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter','pro')),
  trial_ends_at   timestamptz,
  payments        text[] NOT NULL DEFAULT '{cash,payme,click}',
  contacts        jsonb NOT NULL DEFAULT '{}',        -- {telegram, instagram, phone}
  telegram_verified boolean NOT NULL DEFAULT false,    -- owner's bot chat connected + handle matches
  threshold       int NOT NULL DEFAULT 3 CHECK (threshold >= 0),
  show_sold       boolean NOT NULL DEFAULT true,
  bot_alerts      boolean NOT NULL DEFAULT true,
  place           jsonb NOT NULL DEFAULT '{"has":false}',
  returns_text    jsonb,                              -- {uz,ru,en}; null = default text
  design          jsonb NOT NULL,                     -- {theme,palette,layout,font,customPalette}
  bio             jsonb NOT NULL DEFAULT '{"tpl":"clean"}',
  avatar_media_id text REFERENCES media(id),
  cover_media_id  text REFERENCES media(id),
  tone            text NOT NULL DEFAULT '#c7b09a',    -- fallback colour (prototype `cover`)
  initials        text NOT NULL,
  tz              text NOT NULL DEFAULT 'Asia/Tashkent',
  ai_used         int NOT NULL DEFAULT 0,
  products_count  int NOT NULL DEFAULT 0,             -- visible products (maintained)
  sold_total      int NOT NULL DEFAULT 0,             -- units sold net of returns (maintained)
  search_text     text GENERATED ALWAYS AS (
                    lower(name || ' ' || handle::text || ' ' || coalesce(tagline->>'uz','') || ' ' ||
                          coalesce(tagline->>'ru','') || ' ' || coalesce(tagline->>'en',''))) STORED,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);
CREATE UNIQUE INDEX ux_shops_handle ON shops(handle) WHERE deleted_at IS NULL;
CREATE INDEX ix_shops_owner   ON shops(owner_id);
CREATE INDEX ix_shops_list    ON shops(status, moderation, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX ix_shops_city    ON shops(city) WHERE deleted_at IS NULL;
CREATE INDEX ix_shops_type    ON shops(type) WHERE deleted_at IS NULL;
CREATE INDEX ix_shops_search  ON shops USING gin (search_text gin_trgm_ops);

CREATE TABLE shop_handle_history (           -- old handles keep working (301 to the new one)
  handle     citext PRIMARY KEY,
  shop_id    text NOT NULL REFERENCES shops(id),
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reserved_handles (handle citext PRIMARY KEY);

CREATE TABLE shop_counters (                 -- per-shop sequences, row-locked
  shop_id        text PRIMARY KEY REFERENCES shops(id),
  next_sale_no   int NOT NULL DEFAULT 201,
  next_barcode   int NOT NULL DEFAULT 1
);

CREATE TABLE branches (                      -- §20; every shop has exactly one is_default row from creation
  id          text PRIMARY KEY,               -- 'br_…'
  shop_id     text NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name        text NOT NULL,                  -- "Chilonzor"; default branch: the shop name
  place       jsonb NOT NULL DEFAULT '{"has":false}',   -- same shape as shops.place (which becomes the default branch's place)
  phone       text,
  hours       jsonb,                          -- [{d:1..7, from:"09:00", to:"20:00"}], shown whole
  pickup      boolean NOT NULL DEFAULT true,  -- buyers may pick it in the basket
  tg_chat_id  bigint,                         -- requests for this branch go here; null = owner
  is_default  boolean NOT NULL DEFAULT false,
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed')),
  sort        int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ux_branch_default ON branches(shop_id) WHERE is_default;
CREATE INDEX ix_branch_shop ON branches(shop_id, sort);

CREATE TABLE saved_shops (
  user_id    text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_id    text NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, shop_id)
);

-- ============ team ============
CREATE TABLE staff (
  id            text PRIMARY KEY,             -- 'st_…'; the owner row uses id = 'own_' || shop id
  shop_id       text NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id       text REFERENCES users(id),    -- null until the invite is accepted
  name          text NOT NULL,                -- full name; owner row: copied from the user
  phone         text,
  phone_key     text,
  tg            text,
  role          text NOT NULL CHECK (role IN ('owner','manager','cashier')),
  status        text NOT NULL CHECK (status IN ('invited','active','inactive')),
  pin_hash      text NOT NULL,                -- bcrypt of 4 digits
  pin_fail      int  NOT NULL DEFAULT 0,
  pin_locked_until timestamptz,
  commission    numeric(4,1) NOT NULL DEFAULT 0 CHECK (commission BETWEEN 0 AND 50),
  perms         jsonb NOT NULL,               -- {returns,stock,products,costs}
  tone          int NOT NULL DEFAULT 0,
  invite_token  text UNIQUE,
  invite_expires_at timestamptz,
  joined_at     timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ux_staff_phone ON staff(shop_id, phone_key) WHERE phone_key IS NOT NULL;
CREATE UNIQUE INDEX ux_staff_owner ON staff(shop_id) WHERE role = 'owner';
CREATE INDEX ix_staff_user ON staff(user_id);
CREATE TABLE staff_branches (                 -- no rows = all branches (owner, manager, and every cashier in v1)
  staff_id  text NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  branch_id text NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, branch_id)
);

-- ============ taxonomy (seeded, read-only at runtime) ============
CREATE TABLE categories (
  id            text PRIMARY KEY,             -- 'cl-w-dresses'
  parent_id     text REFERENCES categories(id),
  level         smallint NOT NULL CHECK (level IN (0,1,2)),
  gid           int,                          -- Google product taxonomy id
  sort          int NOT NULL,
  name          jsonb NOT NULL,
  variant_attrs text[] NOT NULL DEFAULT '{}', -- leaves only, ends with 'option'
  spec_attrs    text[] NOT NULL DEFAULT '{}',
  search_text   text NOT NULL                 -- names in 3 languages, lowercased
);
CREATE INDEX ix_cat_parent ON categories(parent_id);
CREATE INDEX ix_cat_search ON categories USING gin (search_text gin_trgm_ops);

CREATE TABLE attributes (
  id     text PRIMARY KEY,                    -- 'color', 'size_w', 'memory', 'option'
  kind   text NOT NULL CHECK (kind IN ('select','multi','number','text','bool')),
  swatch boolean NOT NULL DEFAULT false,
  chart  text,                                -- size chart id
  unit   jsonb, min_v numeric, max_v numeric,
  name   jsonb NOT NULL,
  sort   int NOT NULL
);
CREATE TABLE attribute_values (
  attr_id text NOT NULL REFERENCES attributes(id),
  id      text NOT NULL,                      -- 'navy', 'm', '64 gb'
  sort    int NOT NULL,
  name    jsonb NOT NULL,
  hex     text,
  aliases text[] NOT NULL DEFAULT '{}',       -- lowercased look-alikes for merging
  PRIMARY KEY (attr_id, id)
);
CREATE INDEX ix_attrval_alias ON attribute_values USING gin (aliases);
CREATE TABLE size_charts (id text PRIMARY KEY, data jsonb NOT NULL);   -- {title, cols, rows}, shown whole

-- ============ catalog ============
CREATE TABLE products (
  id            text PRIMARY KEY,
  shop_id       text NOT NULL REFERENCES shops(id),
  category_id   text NOT NULL REFERENCES categories(id),
  name          jsonb NOT NULL,               -- {uz,ru,en}, empty languages filled on save
  descr         jsonb NOT NULL DEFAULT '{"uz":"","ru":"","en":""}',
  price         bigint NOT NULL CHECK (price > 0),
  opt_name      text CHECK (length(opt_name) <= 24),
  specs         jsonb NOT NULL DEFAULT '{}',
  visible       boolean NOT NULL DEFAULT true,
  sort          int NOT NULL DEFAULT 0,
  tone          text NOT NULL DEFAULT '#cdbfa8',
  fx            text NOT NULL DEFAULT 'none' CHECK (fx IN ('none','studio','warm','cool','mono')),
  threshold     int CHECK (threshold >= 0),   -- null = shop threshold
  -- maintained (never sent by the client):
  min_price     bigint NOT NULL,
  max_price     bigint NOT NULL,
  total_qty     int NOT NULL DEFAULT 0,       -- Σ max(0, variant qty)
  stock_state   text NOT NULL DEFAULT 'sold' CHECK (stock_state IN ('in','low','sold')),
  sold_units    int NOT NULL DEFAULT 0,       -- net of returns
  has_desc      boolean NOT NULL DEFAULT false,
  search_text   text GENERATED ALWAYS AS (lower(
                  coalesce(name->>'uz','')||' '||coalesce(name->>'ru','')||' '||coalesce(name->>'en','')||' '||
                  coalesce(descr->>'uz','')||' '||coalesce(descr->>'ru','')||' '||coalesce(descr->>'en',''))) STORED,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);
CREATE INDEX ix_products_shop   ON products(shop_id, sort) WHERE deleted_at IS NULL;
CREATE INDEX ix_products_cat    ON products(category_id) WHERE deleted_at IS NULL AND visible;
CREATE INDEX ix_products_search ON products USING gin (search_text gin_trgm_ops);
CREATE INDEX ix_products_pop    ON products(sold_units DESC) WHERE deleted_at IS NULL AND visible;
CREATE INDEX ix_products_new    ON products(created_at DESC) WHERE deleted_at IS NULL AND visible;
CREATE INDEX ix_products_price  ON products(min_price) WHERE deleted_at IS NULL AND visible;

CREATE TABLE variants (
  id          text PRIMARY KEY,
  product_id  text NOT NULL REFERENCES products(id),
  shop_id     text NOT NULL REFERENCES shops(id),
  options     jsonb NOT NULL DEFAULT '{}',    -- {attrId: valueId | "c:text"}
  options_key text NOT NULL,                  -- sorted "k:v|k:v", '' for no options
  price       bigint CHECK (price > 0),       -- null = product price
  qty         int NOT NULL DEFAULT 0,         -- cache of Σ movements.delta over all branches (= Σ stock_levels.qty)
  barcode     text,
  avg_cost    bigint,                         -- weighted average, null = unknown
  threshold   int CHECK (threshold >= 0),
  pos         int NOT NULL DEFAULT 0,
  deleted_at  timestamptz
);
CREATE UNIQUE INDEX ux_variant_options ON variants(product_id, options_key) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX ux_variant_barcode ON variants(shop_id, upper(barcode))
  WHERE barcode IS NOT NULL AND barcode <> '' AND deleted_at IS NULL;
CREATE INDEX ix_variants_product ON variants(product_id);

CREATE TABLE product_photos (
  product_id  text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_value text NOT NULL DEFAULT '',       -- '' = general gallery; else colour value id
  pos         smallint NOT NULL CHECK (pos BETWEEN 0 AND 5),
  media_id    text NOT NULL REFERENCES media(id),
  ai          boolean NOT NULL DEFAULT false, -- "studio photo" badge
  PRIMARY KEY (product_id, color_value, pos)
);
CREATE INDEX ix_pphotos_media ON product_photos(media_id);

CREATE TABLE product_facets (                 -- derived on every product save
  product_id  text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  shop_id     text NOT NULL,
  category_id text NOT NULL,
  attr_id     text NOT NULL,
  value_key   text NOT NULL,                  -- normalised: 'navy', 'm', 'c:lavanda', '1' for bool
  in_stock    boolean NOT NULL,               -- some variant with this value has qty > 0
  PRIMARY KEY (product_id, attr_id, value_key)
);
CREATE INDEX ix_facets_lookup ON product_facets(attr_id, value_key);
CREATE INDEX ix_facets_shop   ON product_facets(shop_id, attr_id);

-- ============ stock journal ============
CREATE TABLE stock_levels (                   -- per-branch cache: qty = Σ movements.delta for (variant, branch)
  variant_id text NOT NULL REFERENCES variants(id),
  branch_id  text NOT NULL REFERENCES branches(id),
  shop_id    text NOT NULL,
  qty        int NOT NULL DEFAULT 0,
  PRIMARY KEY (variant_id, branch_id)
);
CREATE INDEX ix_levels_branch ON stock_levels(branch_id);

CREATE TABLE stock_batches (                  -- one restock action (replaces the "within 4 s" guess)
  id          text PRIMARY KEY,
  shop_id     text NOT NULL REFERENCES shops(id),
  branch_id   text NOT NULL REFERENCES branches(id),
  kind        text NOT NULL CHECK (kind IN ('restock','initial')),
  extra_cost  bigint NOT NULL DEFAULT 0,
  note        text,                           -- supplier
  actor_staff_id text,
  at          timestamptz NOT NULL DEFAULT now(),
  undone_at   timestamptz
);

CREATE TABLE movements (
  id          text PRIMARY KEY,
  seq         bigserial UNIQUE,
  shop_id     text NOT NULL REFERENCES shops(id),
  branch_id   text NOT NULL REFERENCES branches(id),
  variant_id  text NOT NULL REFERENCES variants(id),
  product_id  text NOT NULL REFERENCES products(id),
  delta       int NOT NULL,                   -- change of qty (0 for write-off returns)
  qty         int NOT NULL,                   -- pieces involved (abs), used for losses/returns
  reason      text NOT NULL CHECK (reason IN ('restock','sale','correction','loss','return','transfer')),
  transfer_id text,                           -- both halves of a branch transfer share it (§20)
  unit_cost   bigint,                         -- landed cost (restock) or avg cost at the time
  unit_price  bigint,                         -- sale/return: the sale line unit price
  avg_before  bigint,                         -- avg cost before this movement (undo restores it)
  avg_after   bigint,                         -- avg cost after this movement
  qty_after   int NOT NULL,                   -- running stock of this variant in this branch ("stock left")
  batch_id    text REFERENCES stock_batches(id),
  sale_id     text,                           -- FK added after sales
  request_id  text,
  actor_staff_id text,                        -- who (every movement now has one)
  actor_user_id  text REFERENCES users(id),
  barcode     text,                           -- barcode at the time
  note        text,
  at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_mov_shop_at  ON movements(shop_id, at DESC, seq DESC);
CREATE INDEX ix_mov_variant  ON movements(variant_id, at DESC, seq DESC);
CREATE INDEX ix_mov_reason   ON movements(shop_id, reason, at DESC);
CREATE INDEX ix_mov_batch    ON movements(batch_id);
CREATE INDEX ix_mov_branch   ON movements(branch_id, at DESC, seq DESC);

-- ============ sales ============
CREATE TABLE sales (
  id          text PRIMARY KEY,
  shop_id     text NOT NULL REFERENCES shops(id),
  branch_id   text NOT NULL REFERENCES branches(id),
  no          int NOT NULL,                   -- per shop, not per branch
  at          timestamptz NOT NULL DEFAULT now(),
  pay         text NOT NULL CHECK (pay IN ('cash','payme','click','uzcard','transfer')),
  status      text NOT NULL CHECK (status IN ('completed','partially_returned','returned')),
  seller_staff_id text NOT NULL,
  channel     text NOT NULL CHECK (channel IN ('pos','manual','request')),
  total       bigint NOT NULL,                -- net of returns
  cost_total  bigint,                         -- null if any line has no cost
  units       int NOT NULL,                   -- net of returns
  request_id  text,
  client_key  text,                           -- idempotency (POS retry on bad internet)
  created_by  text NOT NULL REFERENCES users(id),
  UNIQUE (shop_id, no),
  UNIQUE (shop_id, client_key)
);
CREATE INDEX ix_sales_shop_at ON sales(shop_id, at DESC);
CREATE INDEX ix_sales_seller  ON sales(shop_id, seller_staff_id, at DESC);

CREATE TABLE sale_lines (
  sale_id    text NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  pos        smallint NOT NULL,
  variant_id text NOT NULL REFERENCES variants(id),
  product_id text NOT NULL REFERENCES products(id),
  name       text NOT NULL,                   -- snapshot in the seller's language
  label      text NOT NULL,
  barcode    text,
  qty        int NOT NULL CHECK (qty > 0),
  unit       bigint NOT NULL CHECK (unit >= 0),
  cost       bigint,
  oversold   boolean NOT NULL DEFAULT false,
  returned   int NOT NULL DEFAULT 0 CHECK (returned BETWEEN 0 AND qty),
  PRIMARY KEY (sale_id, pos)
);
CREATE INDEX ix_salelines_product ON sale_lines(product_id);
ALTER TABLE movements ADD CONSTRAINT fk_mov_sale FOREIGN KEY (sale_id) REFERENCES sales(id);

-- ============ basket requests ============
CREATE TABLE requests (
  id            text PRIMARY KEY,
  code          text NOT NULL UNIQUE CHECK (code ~ '^[A-HJ-NP-Z2-9]{5,6}$'),
  shop_id       text NOT NULL REFERENCES shops(id),
  branch_id     text REFERENCES branches(id), -- pickup branch: chosen by the buyer or set by the seller; null = not decided
  status        text NOT NULL CHECK (status IN ('new','agreed','sold','cancelled')),
  total         bigint NOT NULL,
  final_total   bigint,
  units         int NOT NULL,
  lang          text NOT NULL,
  buyer_user_id text REFERENCES users(id),
  buyer         jsonb,                        -- {name, phone, tg} snapshot, null for guests
  buyer_tg_chat_id bigint,                    -- set when the buyer opens the bot with the code
  sale_id       text REFERENCES sales(id),
  sale_no       int,
  history       jsonb NOT NULL,               -- [{status, at, by}]
  tg_seller_msg jsonb,                        -- {chatId, messageId}
  cancel_reason text,
  at            timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_req_shop ON requests(shop_id, status, at DESC);
CREATE TABLE request_lines (
  request_id text NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  pos        smallint NOT NULL,
  variant_id text NOT NULL REFERENCES variants(id),
  product_id text NOT NULL REFERENCES products(id),
  name       text NOT NULL,                   -- buyer's language
  label      text NOT NULL,
  qty        int NOT NULL CHECK (qty > 0),
  unit       bigint NOT NULL,
  PRIMARY KEY (request_id, pos)
);
ALTER TABLE movements ADD CONSTRAINT fk_mov_req FOREIGN KEY (request_id) REFERENCES requests(id);
ALTER TABLE sales ADD CONSTRAINT fk_sale_req FOREIGN KEY (request_id) REFERENCES requests(id);

-- ============ stats ============
CREATE TABLE shop_daily_stats (
  shop_id text NOT NULL REFERENCES shops(id),
  day     date NOT NULL,                      -- in the shop's time zone
  views   int NOT NULL DEFAULT 0,             -- unique visitors per day
  bio_views int NOT NULL DEFAULT 0,
  PRIMARY KEY (shop_id, day)
);
CREATE TABLE product_daily_views (
  shop_id    text NOT NULL,
  product_id text NOT NULL REFERENCES products(id),
  day        date NOT NULL,
  views      int NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, day)
);
CREATE INDEX ix_pviews_shop ON product_daily_views(shop_id, day);

-- ============ bot & audit ============
CREATE TABLE bot_chats (
  chat_id    bigint PRIMARY KEY,
  user_id    text REFERENCES users(id),
  state      jsonb NOT NULL DEFAULT '{}',     -- {step, loginToken, sellRequestId, total}
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE audit_log (
  id         bigserial PRIMARY KEY,
  shop_id    text,
  actor_user_id text,
  action     text NOT NULL,                   -- 'product.delete', 'restock.undo', 'shop.handle', …
  entity_id  text,
  data       jsonb,
  at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_audit_shop ON audit_log(shop_id, at DESC);
```

Never stored: orders, reviews, conversations (flags off); guest baskets; POS held carts; onboarding drafts.

---

## 6. Photos

### 6.1 What exists today (and what's broken)
- Two stores that don't talk: `PhotoStore` (localStorage data-URLs, JPEG 0.82, ~5 MB quota) and the
  `<image-slot>` web component (drag-drop, WebP, **lost on reload under Vite**).
- "Filled" is detected by polling the DOM every 500 ms, so a camera upload doesn't satisfy the "≥ 2 photos" rule and
  an Unsplash placeholder does.
- Explore, BuyerHub and baskets show only Unsplash placeholders, never real uploads.
- A product photographed only per colour gets no card cover.
- Delete, duplicate and colour removal never clean or copy photos.

### 6.2 Slots kept, storage replaced
The frontend's slot ids keep working as **addresses inside a product**, but the data comes from the server:

| Frontend slot | Server meaning |
|---|---|
| `pi-{shop}-{pid}-{k}` | `product_photos(product_id=pid, color_value='', pos=k)` |
| `pc-{shop}-{pid}-{colour}-{k}` | `product_photos(product_id=pid, color_value=colour, pos=k)` |
| `avatar-{shop}` | `shops.avatar_media_id` |
| `cover-{shop}` | `shops.cover_media_id` |
| `o2c-/o2l-/o2p-{draft}` | `media` rows with `status='temp'`, `shop_id=null`; attached at "Create my shop" |

Limits: 6 photos in the general gallery, 6 per colour, 1 avatar, 1 cover.

### 6.3 Upload flow
1. **Device**: `pickPhoto` keeps the canvas resize but changes to **max 1600 px, JPEG 0.85** (≈150–400 KB instead of
   several MB: important on weak internet). HEIC from iPhones becomes JPEG this way.
2. **`POST /api/v1/media`** (multipart: `file`, `purpose` = `product|avatar|cover|draft`, `shopId?`), with a progress bar
   in the slot. Limits: 10 MB, ≤ 20 uploads/min/user.
3. **Server** (`ImagePipeline`):
   - check type by magic bytes (JPEG, PNG, WebP only); reject anything else (`media.type`);
   - decode, apply EXIF orientation, **strip all metadata** (GPS!);
   - reject < 300 px on the short side (`media.too_small`);
   - compute sha256 (same file uploaded twice by the same shop → same media row) and dominant colour;
   - write sizes as **WebP q80** (and a JPEG for the OG size, because Telegram previews need JPEG):

     | Size key | Box | Used by |
     |---|---|---|
     | `t` | 320×320 max | thumbnails, list rows, basket, POS, inventory, explore chips |
     | `c` | 800×1000 max | cards (storefront grid, explore results, bio products) |
     | `f` | 1600×2000 max | product page gallery, cover |
     | `og` | 1200×630 crop, JPEG | link previews |
     | avatar: `a` | 256×256 crop | shop avatar |
   - object keys `m/{shopOrDraft}/{mediaId}/{size}.webp`, bucket `rasta-media`, public read, header
     `Cache-Control: public, max-age=31536000, immutable` (keys never change: a new photo = a new media id);
   - insert `media(status='temp')` and return
     `{mediaId, w, h, dominant, urls:{t, c, f, og}}`.
4. **Attach**: the product save (or avatar/cover PUT) sends media ids per slot; the server checks they belong to this
   user/shop, sets `status='attached'` and writes `product_photos`.

### 6.4 Display
- Every product in a payload carries
  `photos: { general:[Photo], byColor:{ "navy":[Photo], … } }` with
  `Photo = {id, dominant, ai, t, c, f}` (absolute URLs from `media.public-base-url` = CDN or MinIO address).
- Shop payload carries `avatar:{t,a}|null`, `cover:{c,f}|null`.
- `ImageSlot` becomes a plain `<img src={c} srcSet="{t} 320w, {c} 800w, {f} 1600w" sizes=… loading="lazy"
  decoding="async" style={{background: dominant}}>`. While loading, the dominant colour shows; no Unsplash.
- **Card cover** = `general[0]`, else the first colour group's `[0]`, else the `tone` colour with initials.
- **Product page**: colour picked and `byColor[colour]` non-empty → that set (big + thumbnails); otherwise `general`.
  This is exactly what the frontend's `ProductPage.jsx:87-91` does, fed from the payload instead of slot polling.
- The "≥ 2 photos" rule is checked on the payload's counts, not the DOM; the server also checks it on save (§10.2).
- Demo tint on seeded photos stays a frontend effect, applied only to seed products (flag `seed:true`).

### 6.5 Delete, duplicate, cleanup
- Removing a photo in the editor = not sending it on save → the row in `product_photos` goes; the media row goes
  back to `temp`.
- Unselecting a colour removes that colour's group on save.
- Deleting a product (soft) keeps photos 30 days, then cleanup.
- **Duplicate copies the photo rows** (same media ids; media are shared, so nothing is copied in storage).
- `MediaCleanupJob` (nightly): deletes objects and rows for media `temp` older than 24 h and not referenced, and for
  media referenced only by products deleted > 30 days ago.

### 6.6 "Studio photo" / "generate angles"
Today these are CSS tricks (`Studio.jsx`). v1 stores only the `ai` badge per photo and the counter `shops.ai_used`
(quota 3 starter / 50 pro, checked on the server). A real image job is §18.

---

## 7. Auth, sessions, roles, till operator

### 7.1 Telegram login (phone included)
The Telegram Login Widget does not give the phone number, and the phone is the account key here, so login goes
through the bot:
1. `POST /api/v1/auth/telegram/start {purpose:"login"}` → `{token, botUrl:"https://t.me/rastashops_bot?start=login_<token>", expiresAt}` (5 min).
2. The page opens `botUrl` and polls `GET /api/v1/auth/telegram/wait?token=` (long-poll up to 25 s, repeat).
3. Bot: `/start login_<token>` → asks "Share phone number" (reply keyboard `request_contact`).
4. Contact received (must be the sender's own contact: `contact.user_id == from.id`) → upsert `users` by `tg_id`,
   then by `phone_key`; set name, username, chat id; **claim staff invites** with the same `phone_key`
   (`invited` → `active`, `user_id` set); token → `done`.
5. `wait` returns `{status:"done", accessToken, me}` and sets the refresh cookie.

**Dev profile**: `POST /api/v1/auth/dev/confirm {token, phone, name, username}` completes step 4 without Telegram,
so the existing `TelegramSim` UI keeps working locally (its "Share" button calls this).
`POST /api/v1/auth/dev/login {phone, name}` for scripts. Both 404 outside `dev`.

### 7.2 Tokens
- Access token: JWT HS256, 15 min, claims `sub` (user id).
- Refresh token: random 48 bytes, cookie `rs_rt` (`HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth`), 60 days,
  rotated on every refresh, stored hashed; reuse of an old one revokes the family.
- `POST /auth/logout` revokes the refresh token.

### 7.3 Roles and permissions (server-side, same rules as `Dashboard.jsx:185-198` and `Team.jsx`)
| Action | owner | manager | cashier |
|---|---|---|---|
| Home, Sales (own sales only for cashier), Scan & sell, Requests | ✓ | ✓ | ✓ |
| Products tab, product writes | ✓ | perms.products | perms.products |
| Inventory tab, stock writes, history, reports | ✓ | perms.stock | perms.stock |
| Returns | ✓ | perms.returns | perms.returns |
| See costs / profit (stripped from every response otherwise) | ✓ | perms.costs | perms.costs |
| Team: view | ✓ | ✓ (read-only) | ✗ |
| Team: edit, invite, PINs | ✓ | ✗ | ✗ |
| Design, bio | ✓ | ✓ | ✗ |
| Settings, delete shop, publish | ✓ | ✗ | ✗ |

Implemented as `@PreAuthorize("@access.can(#shopId, 'stock')")` on every dash endpoint; `Access` loads
`staff` for (shop, user) once per request.

### 7.4 Till operator (shared POS device, `SwitchSeller` in `Team.jsx`)
- Staff logged in with their own Telegram: the operator is always themselves.
- Owner's device used by several cashiers: `POST /dash/{shopId}/till/operator {staffId, pin}` → server checks bcrypt
  PIN, 5 wrong tries → locked 5 min → returns `operatorToken` (JWT: shop, staff, 12 h). The frontend sends it as
  `X-Operator` on sales and stock writes; the server uses it for `seller_staff_id` / `actor_staff_id`. Without it,
  the actor is the logged-in user's own staff row.
- PINs are never returned by any endpoint. The owner can reset a PIN; the new one is shown once.
  (Removes "Demo PIN" and plain-text PINs.)

---

## 8. API conventions

- Base `/api/v1`. JSON UTF-8. Request ids in `X-Request-Id`.
- Success: the object itself (no envelope). Errors: HTTP status + `{code, message, field?, details?}` where `code` is
  a stable key the frontend maps to its i18n strings (e.g. `handle.taken`, `barcode.taken`, `stock.variant_gone`,
  `request.bad_status`, `pin.wrong`, `plan.pro_only`).
- Ids are strings, times are epoch ms (`at`), dates in query strings are `yyyy-mm-dd` read in the shop's time zone,
  money is integer so'm.
- Lists: cursor paging `?limit=40&cursor=…` → `{items, nextCursor}`; counts endpoints are separate.
- Every write that can be retried on bad internet accepts `Idempotency-Key` (sales, restock, requests, adjust).
- Public GETs send `ETag` and `Cache-Control: public, max-age=30`; the reference data sends
  `max-age=86400` + a version.
- Rate limits (Bucket4j, per IP / per user): request create 10/min/IP, handle check 60/min, login start 10/min,
  PIN 10/min/device, media 20/min/user.
- CORS: only the frontend origins from config.

---

## 9. Every endpoint

### 9.1 Reference & config (public)
| Method & path | Response | Used by |
|---|---|---|
| `GET /reference?v=` | `{version, taxonomy:{categories, attributes, values, sizeCharts}, payMethods, cities, shopTypes, plans, planFeatures, limits:{photos:6, posCarts:8}, allowed:{themes, palettes, fonts, layouts, bioTpls, bioBgs, bioFonts}}` | everything that today reads `Taxonomy.jsx`, `PAY_METHODS`, `UZ_CITIES`, `TYPES`, `PLANS` |
| `GET /handles/check?h=` | `{handle, status: ok\|empty\|short\|invalid\|reserved\|taken, suggest:[≤3]}` | Landing claim box, onboarding, settings |

Handle rule (one rule everywhere): lowercase, `^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$` (3–30, hyphen inside only),
not in `reserved_handles` (the 32 words of `O2_RESERVED` + route words `link p b me new login dashboard explore api
og m assets static help`), not used by a live shop, not in another shop's handle history.

### 9.2 Auth & me
| Method & path | Body → response |
|---|---|
| `POST /auth/telegram/start` | `{purpose:"login"\|"relink"}` → `{token, botUrl, expiresAt}` |
| `GET /auth/telegram/wait?token=` | → `{status:"pending"}` \| `{status:"expired"}` \| `{status:"done", accessToken, me}` |
| `POST /auth/refresh` | (cookie) → `{accessToken}` |
| `POST /auth/logout` | → 204 |
| `POST /auth/dev/confirm`, `POST /auth/dev/login` | dev only (§7.1) |
| `GET /me` | → `Me` |
| `PATCH /me` | `{name?, lang?, notif?, mySize?: {aid,v}\|null}` → `Me` |
| `GET /me/saved-shops` | → `[ShopCard + thumbs[3]]` (public products only) |
| `PUT /me/saved-shops/{shopId}` · `DELETE …` | → `{favShops:[id]}` |
| `POST /me/addresses` | `{label, text, isDefault?}` → `Me` (first address = default) |
| `PATCH /me/addresses/{id}` · `DELETE /me/addresses/{id}` · `POST /me/addresses/{id}/default` | → `Me` |
| `GET /me/shops` | → `[{shopId, handle, name, initials, swatch, avatar, role, staffId, perms, status}]` |

`Me = {account:{id, phone, name, tg, lang, notif, mySize, favShops:[shopId], addresses:[{id,label,text,isDefault}]}, shops:[…as /me/shops]}`.

### 9.3 Public pages
| Method & path | Response |
|---|---|
| `GET /landing` | `{hero:{shop:ShopPublic, products:[PublicProduct ≤8]}, avatars:[ShopMini ×5], shops:[ShopCard ×6], shopCount}` |
| `GET /explore/shops?q=&type=&city=&cat=&sort=new\|products&limit=&cursor=` | `{items:[ShopCard], nextCursor, total}`; only `status='live'` and `moderation<>'rejected'`; `sort=rating` removed while reviews are off |
| `GET /explore/products?q=&cat=&f_<attr>=a,b&pmin=&pmax=&instock=1&sort=new\|pop\|low\|high&limit=24&cursor=` | `{items:[ExploreProduct], total, facets:[{attr, values:[{key, count}]}], priceBands:[{min,max,count}×3], categoryCounts:{catId:n}}` |
| `GET /explore/suggest?q=` | `{cats:[{id, path, count}×4], products:[ExploreProduct×5], shops:[ShopMini×5]}` (q ≥ 2 chars) |
| `GET /explore/categories` | `{counts:{catId:n incl. ancestors}, popular:[groupId×6], types:[…], cities:[…]}` (cached 60 s) |
| `GET /shops/{handle}` | `StorefrontPayload` (below); old handle → `301` with `Location` and body `{movedTo}`; unknown → 404; paused → payload with `status:"paused"` and no products |
| `GET /shops/{handle}/products/{productId}` | `{shop:ShopPublic, product:PublicProduct}` (deep link, OG) |
| `GET /shops/{handle}/bio` | `{shop:ShopPublic(+bio), products:[PublicProduct ×4, in stock, by sold units]}` |
| `POST /basket/check` | `{shopId, lang, lines:[{variantId, qty}]}` → `{lines:[{variantId, ok, issue: null\|"gone"\|"hidden"\|"short", available, unit, name, label, photo}], total}` |
| `POST /requests` (201) | `{shopId, lang, lines:[{variantId, qty}]}` (+ `Idempotency-Key`) → `{req, code, link:"<site>/b/CODE", botUrl:null, shop:{id, name, handle, telegram}}` (`botUrl` is always null since D13: the buyer writes to the shop directly) |
| `GET /b/{code}` | `{code, at, status, lines:[{name,label,qty,unit,photo}], total, shop:{id, handle, name}}`; **no buyer, no sale info** |
| `POST /stats/view` | `{shopId, productId?, kind:"shop"\|"product"\|"bio"}` + header `X-Visitor` (random id kept on device) → 204 |

Shapes:
```
ShopMini    = {id, handle, name, initials, swatch, avatar}
ShopCard    = ShopMini + {type, city, tagline, tone, cover, productsCount, theme, thumbs:[photo.t ×4]}
ShopPublic  = ShopCard + {status, contacts, payments, returnsText, place:{has,address,landmark,lat,lng,exact},
              showSold, design, bio, soldTotal, createdAt, telegramVerified}
PublicProduct = {id, catId, name, desc, price, minPrice, priceVaries, optName, specs, sort, created, tone, fx,
              stock:"in"|"low"|"sold", sold, seed?, photos:{general, byColor},
              variants:[{id, options, price, available:boolean, left: number|null}]}   // left only when ≤ 5
ExploreProduct = {id, shopId, shopHandle, shopName, name, catId, minPrice, priceVaries, stock, sold, photo}
StorefrontPayload = {shop:ShopPublic, products:[PublicProduct], categoryChips:[{catId, count}]}
```
Never public: owner phone, plan, trial, threshold, barcode, avgCost, exact qty above 5, hidden products, buyers.

### 9.4 Seller: shop
All under `/dash/{shopId}`, JWT + access check (§7.3).

| Method & path | Body → response | Perm |
|---|---|---|
| `POST /api/v1/shops` (201) | `{name, handle, type, city, design:{theme,palette}, payments, botAlerts, coverMediaId?, logoMediaId?}` → `{shop, settings}`; creates owner staff row (PIN random, shown once), counters, `trial_ends_at = now + 3 months`, `status='draft'` | logged in |
| `GET /bootstrap` | → `{shop:ShopAdmin, viewer:{staffId, role, perms, name, branchIds}, branches:[Branch], catalog:[AdminProduct], team:[Staff], badges:{newRequests, lowVariants, outVariants}, lastRestock:Batch\|null}`. **Never** movements, sales or requests (D12): those are paged endpoints | any |
| `GET /branches` · `POST /branches` · `PATCH /branches/{id}` | `Branch = {id, name, place, phone, hours, pickup, isDefault, status, sort}`; create/edit owner only, `plan.pro_only` past 1 branch (§20) | any / owner |
| `GET /home` | → `{today:{revenue, units}, attention:{newRequests, soldOut, low, incomplete}, month:{visitors, productViews, itemsSold, revenue}, status, handle}` | any |
| `PATCH /settings` | any of `{name, handle, tagline, city, type, contacts, payments, threshold, showSold, status:"live"\|"paused", place, returnsText}` → `ShopAdmin` (handle change → history row + audit) | owner |
| `POST /publish` | → `ShopAdmin` (draft → live; allowed without products, the shop shows "setting up") | owner |
| `PATCH /design` | `{theme?, palette?, layout?, font?, customPalette?}` → `{design}` (ids validated; custom palette fields validated as colours) | owner, manager |
| `PUT /bio` | `{tpl, bg?, btn?, radius?, font?}` → `{bio}` | owner, manager |
| `PUT /avatar` · `PUT /cover` | `{mediaId\|null}` → `{avatar}` / `{cover}` | owner |
| `POST /relink-telegram` | → `{token, botUrl}`; on completion the owner's user gets the new phone/Telegram | owner |
| `DELETE /` | `{confirmName}` must equal the shop name → 204 (soft delete; handle freed after 30 days) | owner |
| `POST /ai/use` | `{photoId}` → `{aiUsed, left}`; 402 `plan.no_credits` | products |

`ShopAdmin = ShopPublic + {plan, trialEndsAt, threshold, botAlerts, aiUsed, aiQuota, moderation, ownerPhone}`.

### 9.5 Seller: products
| Method & path | Body → response | Perm |
|---|---|---|
| `POST /products` (201) · `PUT /products/{id}` | `ProductDraft` → `{product:AdminProduct, movements:[Movement]}` | products |
| `POST /products/{id}/duplicate` | → `{product}` (hidden, "(copy)" in all 3 names, qty 0, new barcodes only where the original had one, photos copied) | products |
| `PATCH /products/{id}` | `{visible}` → `{product}` | products |
| `PUT /products/order` | `{ids:[…all product ids in new order]}` → `{order:[{id, sort}]}` | products |
| `DELETE /products/{id}` | → 204 (soft; movements and sales stay) | products |

```
ProductDraft = {catId, name:{uz,ru,en}, desc:{uz,ru,en}, price, optName, specs, visible, fx,
  variants:[{options, price|null, barcode|null, avgCost|null, qty /* only when creating the variant */}],
  photos:{general:[{mediaId, ai}], byColor:{valueId:[{mediaId, ai}]}}}
AdminProduct = PublicProduct + {visible, threshold, totalQty, hasDesc,
  variants:[{id, options, optionsKey, price, qty, barcode, avgCost /* only with costs */, threshold, state:"ok"|"low"|"out"}]}
```

### 9.6 Seller: stock & inventory
| Method & path | Body → response | Perm |
|---|---|---|
| `POST /stock/adjust` | `{variantId, kind:"recount"\|"loss"\|"return", value, note}` (recount: value = counted; loss/return: value = pieces) → `{variant, movement}` | stock |
| `POST /stock/restock/preview` | `{entries:[{variantId, qty, unitCost\|null}], extra}` → `{lines:[{variantId, landed, oldAvg, newAvg, oldMargin, newMargin, keepPrice}], spend, newAvg}` | stock |
| `POST /stock/restock` | same + `{note}` → `{batch, variants, movements}` | stock |
| `GET /stock/restock/last` | → `Batch \| null` (undo still allowed) | stock |
| `POST /stock/restock/{batchId}/undo` | → `{variants}`; 409 `restock.undo_expired` / `restock.undo_blocked` | stock |
| `PUT /variants/{id}/barcode` | `{code\|null}` → `{variant}`; 409 `barcode.taken`, 422 `barcode.ean_invalid` | stock |
| `POST /variants/barcodes` | `{variantIds\|null}` → `{variants}` (fills missing with `RS-<SHOP4>-<00001>`) | stock |
| `GET /barcodes/{code}` | → `{product, variant}` \| 404 (scanner fallback) | any |
| `GET /barcodes/check?code=&exceptId=` | → `{taken}` | stock |
| `PUT /variants/threshold` | `{variantIds, value\|null}` → `{variants}` | stock |
| `PUT /variants/{id}/cost` | `{avgCost}` → `{variant}` | stock + costs |
| `GET /movements?from=&to=&reason=&variantId=&productId=&q=&limit=&cursor=` | → `{items:[Movement], nextCursor}` | stock |
| `GET /movements/summary?…same filters except reason` | → `{in, sold, lost, net, reasonCounts:{restock,sale,correction,loss,return}}` | stock |
| `GET /movements.csv?…` | streamed CSV (columns as `InvHistory.jsx` export) | stock |
| `GET /reports/stock?from=&to=` | → `{stockValueCost, costUnknown, stockValueRetail, sales, profit, lost, flow:[{from,to,in,out}], top:[…5], runOut:[…5], notSelling:[…5], losses:[…5], restockSpend:[…5]}` (uses **both** from and to) | stock |

`Movement = {id, variantId, productId, name, label, photo, delta, qty, reason, unitCost*, unitPrice, amount, qtyAfter, saleId, saleNo, actor:{staffId, name}, barcode, note, at}` (*costs only).

### 9.7 Seller: sales & POS
| Method & path | Body → response | Perm |
|---|---|---|
| `POST /sales` | `{channel:"pos"\|"manual", lines:[{variantId, qty, unit}], pay}` + `Idempotency-Key` + `X-Operator?` → `{sale, variants}` | any |
| `POST /sales/{id}/returns` | `{variantId, qty, mode:"stock"\|"writeoff"}` → `{sale, movement, variant}` | returns |
| `GET /sales?from=&to=&sellerId=&q=&limit=&cursor=` | → `{items:[Sale], nextCursor}` (cashier: forced to own) | any |
| `GET /sales/summary?from=&to=&sellerId=` | → `{revenue, units, receipts, avg, returns, profit*, profitPct*, costCoverage*:{known,total}, losses*, byDay:[{from,to,sum,count}], byPay:[{pay,sum,pct}]}` | any |
| `GET /sales.csv?…` | streamed; 402 `plan.pro_only` on starter | any |
| `GET /sales/today` | → `{units, revenue}` (POS header) | any |

`Sale = {id, no, at, pay, status, channel, seller:{staffId,name}, total, units, profit*, lines:[{variantId, productId, name, label, barcode, photo, qty, unit, cost*, oversold, returned}], requestCode?}`.

### 9.8 Seller: requests
| Method & path | Body → response |
|---|---|
| `GET /requests?status=open\|new\|agreed\|sold\|cancelled\|all&q=&limit=&cursor=` | → `{items:[Request], nextCursor}` (q = code, ≥ 3 chars, also `?code=` opens one) |
| `GET /requests/counts` | → `{open, new, agreed, sold, cancelled, all}` |
| `POST /requests/{id}/agree` | → `{request}` (only from `new`) |
| `POST /requests/{id}/cancel` | `{reason?}` → `{request}` (from `new` or `agreed`) |
| `POST /requests/{id}/sell` | `{finalTotal, pay}` + `X-Operator?` → `{request, sale, variants}` (from `new` or `agreed`) |

`Request = {id, code, at, status, total, finalTotal, units, buyer:{name,phone,tg}|null, lines:[{variantId, productId, name, label, photo, barcode, qty, unit, stock:{available, gone}}], history, saleId, saleNo}`. All roles can see requests.

### 9.9 Seller: team & till
| Method & path | Body → response | Perm |
|---|---|---|
| `GET /team` | → `[Staff]` (no PINs) | owner, manager |
| `POST /team` (201) | `{name, phone, tg, role, perms, commission}` → `{member, pin, inviteLink:"https://t.me/rastashops_bot?start=join_<token>"}`; bot DMs the person if they've used the bot before | owner |
| `PATCH /team/{staffId}` | `{name?, phone?, tg?, role?, perms?, commission?, status?:"active"\|"inactive"}` → `{member}` | owner |
| `POST /team/{staffId}/pin` | → `{pin}` (new one, shown once) | owner |
| `DELETE /team/{staffId}` | → 204 (only `invited`) | owner |
| `GET /team/stats?range=today\|week\|month\|quarter\|all` | → `{summary:{revenue, receipts, avg, top}, series:[{at, by:{staffId: net}}], rows:[{staffId, revenue, cost*, profit*, receipts, items, returns, commissionEarned}]}` | owner, manager |
| `GET /team/{staffId}/detail?range=` | → `{stats, bestProducts:[{name,qty,rev}×5], lastReceipts:[Sale×8]}` | owner, manager |
| `POST /till/operator` | `{staffId, pin}` → `{operatorToken, staff}`; 403 `pin.wrong`, 423 `pin.locked` | any |

`Staff = {id, name, phone, tg, role, status, commission, perms, tone, joined, invitePending}`.

### 9.10 Telegram, OG, health
| Method & path | Notes |
|---|---|
| `POST /api/telegram/webhook` | header `X-Telegram-Bot-Api-Secret-Token` must match |
| `GET /og/{handle}` · `/og/{handle}/p/{id}` · `/og/b/{code}` | HTML with Open Graph tags (§12) |
| `GET /actuator/health` | liveness/readiness |

---

## 10. Business rules

All stock-changing operations run in one transaction, lock the touched `variants` rows (`SELECT … FOR UPDATE`, in id
order to avoid deadlocks), insert movements with `qty_after`, update `stock_levels.qty` **and** `variants.qty`, then
refresh product-level derived columns (`total_qty`, `stock_state`, `min/max_price`, facets `in_stock`) and shop counters.
Every stock write and every sale takes a `branchId`; when the client omits it, the shop's default branch is used, so the
v1 frontend sends nothing new (§20). Invariants checked by tests and the nightly job:
`stock_levels.qty = Σ movements.delta per (variant, branch)` and `variants.qty = Σ stock_levels.qty`.

### 10.1 Derived values
- variant state: `qty ≤ 0` → out; `qty ≤ (v.threshold ?? p.threshold ?? shop.threshold)` → low; else ok.
- product `stock_state`: on Σ max(0, qty) with `p.threshold ?? shop.threshold`: 0 → sold, ≤ th → low, else in.
- `min_price/max_price` over `coalesce(v.price, p.price)`; `priceVaries = min ≠ max or min ≠ p.price`.
- `sold_units` and `shops.sold_total` change on sale and return.
- `products_count` = visible, not deleted.
- facets: for every variant attribute value and every spec value (select/multi/bool), normalised by
  `attribute_values.aliases` (look-alike merge, e.g. "Qora", "black", "чёрный" → `black`; unknown custom → `c:<key>`);
  `in_stock` per value.

### 10.2 Product save
1. Validate: category is a leaf; option attributes ⊆ `variant_attrs`; values exist or are `c:` (≤ 30 chars);
   price > 0; at least one name; `optName` ≤ 24; photos: ≥ 2 in the general gallery, or ≥ 2 in **every** chosen
   colour when the category has a swatch attribute and colours are chosen; ≤ 6 per group; barcodes unique in the shop
   and EAN-13/12 valid when 12–13 digits.
2. Names: empty languages filled from the first filled one (uz → ru → en).
3. Variants matched by `options_key` (server computes it; fixes the slug collision of non-Latin custom values):
   - same key → update price/barcode/avgCost (qty is **not** taken from the draft for existing variants; qty changes
     only in Inventory, as the editor already shows qty read-only on edit);
   - new key → insert with new id; if `qty > 0` → a batch `initial` + `restock` movement (note "initial",
     **not undoable**);
   - key gone → soft delete the variant (its history stays).
4. Write photos (§6.3 step 4), facets, derived columns. New product: `sort = min(sort) - 1` (appears first).

### 10.3 Adjust (recount / loss / return)
- recount: delta = counted − qty (reason `correction`).
- loss: delta = −min(value, max(qty,0)); if qty ≤ 0, reject `stock.nothing_to_lose` (fixes "positive loss").
- return (customer, not linked to a sale): delta = +value.
- `unit_cost` = current avg cost; delta 0 → nothing written.

### 10.4 Restock (port of `restockPlan`, `Store.jsx:291-334`)
- Lines with qty > 0 only. Cost known = number ≥ 0 (0 allowed).
- `base = Σ qty×unit` over known lines; share = `(qty×unit/base)×extra`, or extra split evenly over known lines if
  base = 0; unknown-cost lines get no share.
- `landed = unit + share/qty`; `newAvg = roundSoum((oldQty×oldAvg + qty×landed)/(oldQty+qty))` if old avg known and
  `oldQty = max(0, qty) > 0`, else `roundSoum(landed)`; unknown cost → avg unchanged.
- `roundSoum` = nearest 500. One `stock_batches` row; one movement per line with `unit_cost = roundSoum(landed)`,
  `avg_after = newAvg`.

### 10.5 Undo restock
Allowed if: it's the shop's newest `restock` batch, `kind='restock'`, less than 1 hour old, not undone, and no later
non-restock movement touches its variants. Effect: `qty -= delta` per line; `avg_cost` = the line's `avg_before` (the average cost right before
the batch), so a manual or seeded cost is never lost to null. The batch's
movements are deleted, the batch gets `undone_at`, plus an audit row. (Movements after it can't exist, so `qty_after`
stays correct.)

### 10.6 Complete sale
1. Lock `shop_counters` row → `no = next_sale_no++` (unique, gap-free, safe under concurrency).
2. For each line: lock variant; `cost = avg_cost`; `oversold = qty_before < line.qty`; stock may go negative
   (sell anyway, as in the POS); movement `sale` with `delta = -qty`, `unit_price = unit`.
3. `seller_staff_id` from `X-Operator` or the user's staff row; `channel`; `total = Σ qty×unit`;
   `cost_total` null if any cost unknown; `units`.
4. Same `Idempotency-Key` again → the same sale is returned, nothing new written.
5. Payment must be in the shop's `payments` (or `cash`): fixes manual sale / request sell offering all methods.

### 10.7 Return a line
`qty = min(remaining, wanted || remaining)`; `returned += qty`; mode `stock` → movement `return` `+qty`;
mode `writeoff` → movement `loss` with `delta 0, qty`; sale `total`, `units`, `status` recomputed; `sold_units` down.

### 10.8 Requests
- **Create** (public): shop live; each variant exists, not deleted, product visible (else 409 `request.variant_gone`
  with the list); qty ≥ 1, ≤ 99 per line, ≤ 50 lines; server reads name (`name[lang]`), label
  (`variantLabel`), `unit = coalesce(v.price, p.price)`; buyer = logged-in user or null; code = 5 chars from
  `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` by `SecureRandom`, retry on clash, 6 chars after 5 clashes; history
  `[{status:"new", at}]`; after commit → bot notifies the seller (§11).
- **Agree**: only from `new`. **Cancel**: from `new`/`agreed`, optional reason.
- **Sell**: from `new`/`agreed`, in one transaction: lines whose variant is deleted are **reported back**
  (409 `request.variant_gone` unless `{dropMissing:true}`); `k = finalTotal / Σ(qty×unit)` (1 if finalTotal ≤ 0);
  `unit = round(unit×k)`; **rounding remainder added to the last line's unit** so the sale total equals the agreed
  total exactly when possible; then §10.6 with `channel='request'`; request → `sold`, `final_total`, `sale_id`,
  `sale_no`. Double sell blocked by the status check under a row lock.
- Requests never reserve stock; the seller list shows live `available` / `gone` per line.

### 10.9 Views
`POST /stats/view` counts at most once per (visitor, shop|product, day) using an in-memory Caffeine set
(expires at midnight shop time); visits by the shop's own staff are not counted.

### 10.10 Nightly jobs
- `StockReconcileJob`: checks `variants.qty = Σ movements.delta`; logs and repairs drift with an audit row.
- `MediaCleanupJob` (§6.5). `LoginTokenCleanup`. `TrialReminderJob` (bot message 7 days before trial end).

---

## 11. Telegram bot `@rastashops_bot` (as built, 23.11.2026)

Code: `back/src/main/java/uz/rasta/telegram/` (`BotService`, `TelegramApi`, `TelegramWebhookController`).
Config: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET`, `APP_PUBLIC_URL`,
`TELEGRAM_API_BASE` (tests only). No token → bot disabled, the app still runs. Webhook: `POST /api/telegram/webhook`
with header `X-Telegram-Bot-Api-Secret-Token` = the secret (401 otherwise). The bot is **not in the buyer's path** (D13).

| Update | Behaviour | Built |
|---|---|---|
| `/start login_<token>` | asks for the contact ("📱 Share my number") | ✓ |
| contact | must be the sender's own; finishes login / relink (§7.1), claims staff invites by phone, "You're in ✓" | ✓ |
| plain `/start` | greeting; stores the person's chat id (needed for seller cards) | ✓ |
| request created (server event, after commit) | card to the shop owner's chat if known and `bot_alerts` is on: items, total, buyer (name · @username · phone when logged in, else "the buyer writes to you in Telegram (with the code)"), link, status, buttons **View** (URL) · **Agreed** · **Sold…** · **Cancel** | ✓ |
| callback Agreed / Cancel | only the owner or active staff of that shop; §10.8 | ✓ |
| callback Sold… | "Agreed total?" with a one-tap button for the listed total, or a typed number (`bot_chats.state.sellRequestId`) → payment buttons (cash + the shop's methods) → sale recorded, "Sold ✓ Sale #N" | ✓ |
| status change (web or bot) | the card is edited; buttons removed when sold / cancelled | ✓ |
| `/start b_<CODE>` | old links only: links the buyer's chat to the request, edits the card, "Sent ✓" | ✓ (no longer offered) |
| `/start join_<token>` | staff invite link | ✗ (invites are claimed by phone at login) |
| trial reminder | 7 days before the trial ends | ✗ |

Tested against a local stand-in for the Bot API (card, Sold → amount → payment → sale #, card edited, stranger
refused, webhook without the secret → 401). **Not yet tested with real Telegram** (no token on the server yet).

Seller card (seller's language; en shown):
```
🛍 New basket: 5EVTS
1) Sahar linen dress — Navy · M × 2 — 1 180 000
Total: 1 180 000 so'm
👤 The buyer writes to you in Telegram (with the code)
🔗 labaratory.rastashops.com/b/5EVTS
Status: new
[View] [Agreed]
[Sold…] [Cancel]
```
The buyer's message to the shop is built on the device (`rqMessage` in `Orders.jsx`, template in root `CLAUDE.md` §6.4).

---

## 12. Open Graph link previews
Telegram, Instagram and WhatsApp read OG tags without running JavaScript. nginx sends requests whose User-Agent
matches `TelegramBot|facebookexternalhit|WhatsApp|Twitterbot|Slackbot|LinkedInBot|Discordbot` on `/{handle}`,
`/{handle}/p/{id}`, `/b/{code}` to `/og/…`; everyone else gets the SPA.
- shop: title = name, description = tagline + city, image = cover `og` (else avatar).
- product: title = name · price ("from" if varies), description = description, image = first photo `og`.
- basket: title = "Savat RRWEJ · 2 ta · 1 780 000 so'm", description = shop name, image = first line photo.

---

## 13. Seed

- `tools/export-seed.mjs` (Node 22, no deps) evaluates `front/src/proto/data.jsx`, `data2.jsx`, `Taxonomy.jsx`,
  `Team.jsx` in a `vm` context and writes `seed/taxonomy.json` (categories with gid/v/s, attributes, values with hex,
  **aliases from `SFX_COLOR_SYN`**, size charts, reserved handles) and `seed/demo.json` (6 shops, settings, designs,
  products, variants, movements, sales, team, stats).
- **Taxonomy is loaded in every profile** (upsert by id, version stored).
- **Demo data only in `dev`** and only into an empty database: owner Malika Yusupova `+998 97 700 30 40`, staff
  Dilnoza / Aziza / Bekzod (PINs printed to the log once), times shifted to "now", journal rebuilt so
  `qty = Σ movements` (the prototype seed doesn't add up), photos: the curated Unsplash images from `Icons.jsx`
  downloaded once into `seed/images/` and uploaded to MinIO like real uploads, so dev shows real photo URLs;
  products marked `seed:true` (the frontend keeps its colour-tint effect for them).

---

## 14. Frontend switch-over

Goal: screens unchanged; only the data layer changes.

1. `front/src/api/client.js`: fetch wrapper (base `/api/v1`, access token in memory + refresh on 401, error `code` →
   i18n toast, one retry on network error, `Idempotency-Key` helper, `X-Visitor`, `X-Operator`).
2. `useShopStore` keeps its method names; its state becomes a **server cache**:
   - reads of the catalog, team, settings and design stay synchronous from the cache (no component changes);
   - reads of movements, sales and requests **do not** (D12): `InvHistory.jsx`, `Sales.jsx`, `HxReports`, `Orders.jsx
     RequestsView`, Team stats and Home get a small `useApiList(path, params)` hook with loading / "load more" states.
     Filters that run in the browser today (date range, reason, seller, text) become query parameters;
   - the cache fills the globals `SHOPS`/`SHOP_ORDER` like `loadState` does today (19 files read them);
   - writes call the API and merge the response; optimistic only for visibility, reorder, design/bio (debounced 400 ms);
   - mutators that returned values now return Promises; callers get `await` + a busy state:
     `createRequest` (`App.jsx sendRequest`), `completeSale` (`ScanSell.jsx`, `Sales.jsx` manual sale),
     `sellRequest` (`Orders.jsx`), `saveProduct`/`duplicateProduct` (`Products.jsx`), `undoRestock`
     (`Inventory.jsx`), `addShop`/publish (`OnboardingV2.jsx`), `login`, `restock`, `returnLine`, `adjust/setQty`.
2a. **POS outbox (weak internet):** `completeSale` from `ScanSell.jsx` writes the sale to an on-device queue
   (`rasta.pos.outbox.<shopId>`) with its `Idempotency-Key`, shows it as done, and sends it in the background with
   retries; the header shows "N sales not sent yet". The server's answer replaces the temporary sale number. Other
   writes stay online-only (a clear error toast).
3. Route-aware loading (`App.jsx viewFromUrl`): `/` → `/landing`; `/explore` → `/explore/*`; `/:handle[...]` →
   `/shops/{handle}`; `/:handle/link` → `/shops/{handle}/bio`; `/b/:code` → `/b/{code}`; `/me` → `/me` +
   `/me/saved-shops`; `/dashboard/*` → `/me/shops` + `/dash/{id}/bootstrap`; History, Sales, Reports, Team stats fetch
   on demand with their date range. Small skeleton while loading.
4. `useOrderStore`: basket stays local; account calls (`signIn`, `toggleFav`, addresses, name, notif, mySize) go to
   `/me`; `basketIssues` uses `POST /basket/check`.
5. Photos: `PhotoStore`, `usePhoto`, `useSlotsFilled` and `image-slot.js` are replaced by URLs from payloads;
   `pickPhoto` uploads (§6.3); `ImageSlot` renders `<img srcset>`; `photoURL()` only for `seed` products in dev.
6. Auth: `AuthFlow` → start/wait; `TelegramSim` kept for dev (calls `/auth/dev/confirm`). Demo login shortcuts
   (`App.jsx:205`, `DevTour`) only in dev.
7. Explore: uses `/explore/products` + server facets; filters go into the URL like the storefront. Storefront keeps
   its client filter engine over the shop payload.
8. Remove bundled mock data (`SHOPS` products, `freshState`, `seedTeam` fallback, `seedHistory`, `seedStats`,
   `injectOrders`); keep `I18N`, `THEMES`, `PALETTES`, fonts, bio presets.
9. Small UI fixes needed by the API (from §17): seller "open in dashboard" requires login; `/b` without code → 404;
   share links `/{handle}/p/{id}`; bio links real `href`s; basket qty max = available; payment chips = shop's methods;
   PIN never shown; "N left" only ≤ 5.

---

## 15. Build steps (each ends runnable, tested, committed)

| Step | Work | Done when |
|---|---|---|
| 0 | Commit the current draft on `feature/prototype-port` (both repos) so nothing is lost; tag `main` as `legacy-backend`. `pom.xml` → Spring Boot 4.x, Java 21, Jackson 3, virtual threads; drop `V1`–`V14`, start the new `V1`; skeleton per §2, error model, OpenAPI, Testcontainers base test, CI job (tests **on**, not skipped as in today's `deploy.yml`) | `./mvnw verify` green, `/actuator/health` up |
| 1 | `V1__init.sql`; `tools/export-seed.mjs`; taxonomy loader; `GET /reference`; `GET /handles/check` | reference JSON matches `Taxonomy.jsx` counts (16/58/172/84) |
| 2 | Auth: login tokens, bot-less dev confirm, JWT + refresh cookie, `/me`, addresses, saved shops, `/me/shops` | login → me → refresh → logout tested |
| 3 | Media: upload, pipeline, MinIO, cleanup job | upload JPEG/PNG/WebP → 4 sizes, EXIF gone, bad types rejected |
| 4 | Shops: create (onboarding), settings, design, bio, avatar/cover, publish, delete, handle history, public `GET /shops/{handle}`, bio, landing | onboarding → storefront payload shows the new shop |
| 5 | Catalog: product save (variants by options key, photos, facets, derived columns), duplicate, visibility, order, delete; barcodes | product appears on the storefront with photos per colour |
| 6 | Stock: adjust, restock (+ preview), undo, thresholds, cost; movements list/summary/CSV; stock report | invariant test passes after every write |
| 7 | Sales: complete sale (POS/manual, idempotent, operator), returns, list/summary/CSV, today | 20 parallel sales → unique numbers, journal consistent |
| 8 | Requests: basket check, create (public), `/b/{code}`, seller list/counts/agree/cancel/sell | full basket → sold flow over HTTP |
| 9 | Team: staff CRUD, invite, PIN, till operator, team stats/detail; permission checks on every dash endpoint | permission matrix test (§7.3) green |
| 10 | Dashboard: bootstrap, home | numbers equal hand-computed fixtures |
| 11 | Explore: shops, products + facets + price bands, suggest, categories; stats/view | filter counts match a brute-force check on the seed |
| 12 | Telegram bot (login, invites, request delivery, buttons, edits); OG pages | bot tested against a local Bot API stand-in |
| 13 | Dev seed (shops, journal, sales, team, photos) | fresh DB in dev = the prototype's demo, with real photo URLs |
| 14 | Frontend switch-over (§14), screen group by screen group: public → buyer → onboarding/login → products/photos → inventory → sales/POS → requests → team/design/settings | each group verified side by side with the design |
| 15 | Delete frontend mock data; docs (`back/README.md`, `back/CLAUDE.md`, this file updated) | every row of §3.4 ✓; no `localStorage` keys left except the device-only ones in D7 (+ POS outbox) |

---

## 16. Testing and verification

- **Unit**: every rule in §10 (restock maths with the prototype's numbers, undo window/blocking, sale numbering,
  request spread + remainder, return status, facet normalisation, handle rule, code alphabet).
- **Integration (Testcontainers)**: one test class per controller; after every stock write assert
  `qty == Σ movements` for all touched variants; permission matrix per role; costs stripped without `costs`.
- **Concurrency**: 20 parallel sales of the last unit; 2 parallel sells of the same request (one wins).
- **Security**: public endpoints never return phone/plan/barcode/cost/hidden products (snapshot test of payloads);
  `/b/{code}` has no buyer; rate limits; webhook secret.
- **End to end (local)**: backend `dev` on a fresh DB + Vite 5173, localStorage cleared, in Chrome:
  dev login as Malika → create shop → add product with 2 colours × 3 sizes and photos per colour → storefront:
  colour switch changes the big photo and thumbnails → guest basket → Send → `/b/CODE` (no phone) → dashboard Requests:
  agree → sold with an agreed total → Sales shows it, History shows `sale` movements with the seller's name,
  stock went down → return one line → reports update. Reload at every step: data must survive.
- **Weak internet**: Chrome "Slow 3G": storefront first paint < 3 s with card images (`c` size, lazy).

---

## 17. Bugs found in the frontend and how the backend fixes them

| # | Bug (file) | Fix |
|---|---|---|
| 1 | Photos lost on reload (drag-drop path), uploads not counted as "filled", only Unsplash shown in Explore/BuyerHub/basket | §6 |
| 2 | Product with only colour photos has no card cover | card cover rule §6.4 |
| 3 | Delete/duplicate/colour removal leave or lose photos | §6.5 |
| 4 | Variant id slug collision for non-Latin custom values (`catSlug`) | server ids + `options_key` |
| 5 | Barcode sequence and uniqueness only in memory | `shop_counters` + unique index |
| 6 | Sale number = newest + 1, can collide | locked counter |
| 7 | Request codes not unique, made on the device | server `SecureRandom` + unique |
| 8 | `sellRequest` rounding drift, silently drops missing lines | §10.8 |
| 9 | Undo restock resets cost to null; "initial" stock undoable; 4-second batch guess | batches + §10.5 |
| 10 | Loss on negative stock writes a positive "loss" | §10.3 |
| 11 | Reports ignore the end date | report queries use from and to |
| 12 | History "who" only on sales; barcode shown is today's | `actor_staff_id`, `barcode` on every movement |
| 13 | Profit counts unknown cost as 0 without saying so | `costCoverage` returned, UI shows the note |
| 14 | Deleting a product deletes its stock history | soft delete, history kept |
| 15 | Manual sale / request sell offer every payment method | server validates against shop payments |
| 16 | Login doesn't check shop ownership; demo seller auto-login | JWT + access check; demo shortcuts dev-only |
| 17 | PINs plain text, "Demo PIN" shown, checked on the device | bcrypt, server check, lockout, never returned |
| 18 | Landing theme preview changes the demo shop's real design | preview stays on the device, no write |
| 19 | `/b` without a code shows another shop's request | 404 |
| 20 | Hidden products leak (shopMeta, BuyerHub thumbs, basket check) | public payloads only include visible products |
| 21 | "Telegram verified" = "has a handle" | `telegram_verified` set when the owner's bot chat is connected |
| 22 | Exact stock shown publicly ("N left") | `left` only when ≤ 5 |
| 23 | Onboarding vs Settings handle rules differ; no reserved list in Settings | one rule, §9.1 |
| 24 | Signature themes get `font: undefined` at onboarding (`FONT_FOR`) | server fills the theme's default font |
| 25 | Visitors/product views are all-time but labelled "this month"; owner's own visits counted | daily table, 30-day window, staff excluded |
| 26 | Settings "Reconnect Telegram" saves unsaved edits too; phone stored on the shop | relink endpoint, phone lives on the user |
| 27 | Plan "Upgrade" set directly by the client | plan only changed by billing/admin (§18) |
| 28 | Share links use old `?p=` format; bio links only show a toast | frontend fix during §14 |

---

## 18. Later (not in v1)
- Billing (Payme / Click subscriptions) → `plan`, `trial_ends_at`; until then "Upgrade" opens a Telegram chat with
  support and an admin endpoint sets the plan.
- Moderation admin screen (approve/reject shops for Explore).
- Real AI studio photo / extra angles (image job queue).
- Product ♡, "New" / old-price badges, reviews, orders, chat (flags).
- Shops near me (geo columns + index), Instagram import.
- Redis when there is more than one backend instance (view dedupe, rate limits, caches).

---

## 19. The draft code in `back/` vs this plan (review 23.11.2026)

The draft (`uz.rasta`, `V14__prototype_schema.sql`, endpoints under `/api`) was written from an earlier, simpler plan.
The frontend does not call it yet (`front/src` has no `fetch`), so it can still change freely.

**Keep (port into the §2 modules, with tests):**
`dash/Journal.java` (variant row locks), `core/StockMath.java` (restock blend: check against §10.4 numbers),
`dash/RequestService.java` (create / sell / bot sync), `telegram/*` (webhook, login by contact, texts),
`media/MinioConfig.java`, `auth` login-token long-poll, `DashService.stripCosts` idea, `seed/export-seed.mjs`.

**Change:**
| Draft | Problem | Plan |
|---|---|---|
| `shops.base`, `shops.settings` jsonb (V14) | Explore can't filter or sort city / type / status; violates D3 | columns (§5) |
| `requests.lines` jsonb | no join to live stock, no FK | `request_lines` table |
| `staff.pin` plain text; owner receives every PIN (`TeamService.java:38`) | PIN leak | bcrypt, lockout, never returned (§7.4) |
| restock batch = "restock movements within 4 s" (`StockMath.java:96`) | wrong undo when two restocks are close | `stock_batches` (§10.5) |
| sale no = `max(no)+1` (`SaleService.java:46`), no idempotency key | duplicate sale when a POS retries | `shop_counters` + `client_key` (§10.6) |
| `bootstrap` returns all movements, sales, requests (`DashService.java:35-38`) | megabytes on weak internet after a few months | D12, paged endpoints |
| `shop_photos(slot, url)` | no sizes, no cleanup, no sharing on duplicate | `media` + `product_photos` (§6) |
| movements without `qty_after`, actor, barcode | History "stock left" / "who" columns can't be filled | §5 movements |
| no `product_facets`, no min price / stock state columns | Explore counts become full scans | §5 catalog |
| JWT + blacklist, no refresh | 15-min sessions or long-lived tokens | §7.2 |
| `/api/...` | no version | `/api/v1/...` |
| Spring Boot 3.3.5, `com.fasterxml` Jackson | unsupported | D1a |
| CI `-DskipTests` (`deploy.yml:35`) | broken code deploys | tests run in CI |
| `back/CLAUDE.md` points to `PLAN-BACKEND.md` (missing), says "rasta.uz" | wrong docs | point to this file, rastashops.com |

---

## 20. Branches (one shop, several locations)

**v1 (this plan): data model only.** Every shop gets a default branch at creation; all stock, sales and journal rows
carry `branch_id`; the API takes an optional `branchId` and defaults it. Nothing changes on screen.

**Later (Pro feature), when a shop has 2+ branches:**
- **Settings → Branches:** name, address/map (the `Location.jsx` editor per branch), phone, hours, pickup on/off,
  Telegram chat for its requests. `shops.place` becomes the default branch's place.
- **Stock:** `stock_levels` per branch; Inventory gets a branch switcher and an "all branches" view with one column per
  branch. **Transfer** A → B = two `transfer` movements (−n at A, +n at B) with one `transfer_id`, in one transaction.
  Average cost stays **per shop** (one `variants.avg_cost`); barcodes, prices and products stay per shop.
- **POS:** the device remembers its branch (`rasta.pos.branch.<shopId>`, chosen once); sold-out warnings use that
  branch's stock; sale numbers stay per shop.
- **Staff:** `staff_branches` limits a cashier to their branches (POS, Sales, Inventory filtered); owner/manager see all.
- **Sales, History, Reports, Team stats, Home:** a branch filter (`?branchId=`); default "all".
- **Requests:** the buyer may pick a pickup branch in the basket (only branches with `pickup`); the Telegram message
  and the seller's row show it; the seller can change it; stock warnings show per-branch availability
  ("Chilonzor 2 · Yunusobod 0"); the bot sends the request to the branch's `tg_chat_id`, else the owner.
- **Storefront / product page:** "About the shop" lists all branches (map, hours, phone); the product page shows
  "Available at: Chilonzor ✓ · Yunusobod: few left" (same ≤ 5 rule as §9.3). Explore "shops near me" later uses
  branch coordinates.
- **Public payloads:** `ShopPublic.branches:[{id, name, place, phone, hours, pickup}]`; `PublicProduct.variants[].byBranch:
  [{branchId, available, left|null}]` only when the shop has 2+ branches.
- **Plan gate:** starter = 1 branch, pro = up to N (server checks, `plan.pro_only`).

---

## 21. Build status (23.11.2026)

Built and checked locally (backend `dev` on a fresh `rasta` database + Vite, in Chrome and with curl):

| Area | State | Checked |
|---|---|---|
| Java 21 + Spring Boot 4.0 + Jackson 3, fresh `V1__init.sql` (incl. branches, stock levels, batches) | done | migration applies; demo seed: `qty = Σ movements` for every variant |
| Auth: Telegram start / long-poll wait, dev confirm, JWT 15 min + rotating refresh cookie, `/me`, saved shops, addresses, my size | done | login in the browser (simulated bot), session survives reload, refresh rotation, logout |
| Public: `/catalog`, `/shops/{handle}` (+ old-handle 301), `/handles/check`, `/b/{code}` (no buyer), `/stats/view` | done | Explore / storefront / product page / basket link from the API |
| Basket requests: create (server code + names + prices), agree, cancel, sell (agreed total spread, remainder on a line), bot hooks | done | basket → code → seller login → Requests → Sold → sale #, stock −1, movement with seller |
| Products: save (variants matched by id / options key, initial stock batch), duplicate (photos shared), visibility, order, delete (soft) | done | via UI store + curl |
| Stock: set qty / loss / return, restock with landed cost + batch, undo (batch-based), cost, thresholds, barcodes (counter) | done | 70 000 + 5 000 extra / 5 → avg 71 000; undo restores avg |
| Sales: POS / manual / request, idempotent by client id, counter-locked numbers, returns, operator (PIN, bcrypt, lockout) | done | 20 parallel sales → 20 unique numbers; same id twice → one sale |
| Team: list (no PINs), invite by phone (claimed on login), edit, deactivate, till operator token | done | invite activated by logging in with that phone |
| Photos: upload → 3 JPEG sizes → MinIO, slots → `product_photos` / avatar / cover, EXIF dropped by re-encode | done | upload, public URL 200, non-image → `media.type` |
| Onboarding: `POST /shops` (owner row, default branch, counters), handle rule on the server | done | created in the browser |
| Frontend: `api.js`, `Store.jsx` / `OrderStore.jsx` as a server cache with optimistic writes + merge, boot before first render, POS outbox, PhotoStore on the server, Unsplash only for seed shops, real login, PIN on the server | done | no console errors on Explore, storefront, basket, requests, sales, inventory |

Deviations from this plan (to revisit):
- Taxonomy stays in `seed/taxonomy.json` (memory) and the frontend bundle; no taxonomy tables, no `GET /reference`.
- No `product_facets`: Explore filters run in the browser over `/catalog` (fine for hundreds of shops; move to SQL later).
- Dashboard bootstrap carries a **120-day window** of journal / sales / requests (+ open requests); older ranges load
  through `GET /dash/{id}/history` when a date picker goes further back (`store.ensureRange`). Screens are unchanged.
- Client-proposed ids are accepted (validated) for products, variants and sales so optimistic writes keep their ids; the
  sale id is the idempotency key. Request codes and every other id are made on the server.
- Public variant qty is capped at 10 (not "≤ 5 exact, else none") so the unchanged UI keeps its stock states.
- Photo sizes are JPEG (no WebP encoder yet); no `og` size.

Later on 23.11.2026:
- D13 implemented: the popup opens the shop's own chat; the basket is cleared only by the popup's send button; the popup
  sits over the basket page (closing it returns to the basket); the same basket reopens the same code; baskets are shared
  correctly between browser tabs (`storage` event); bot Sold… flow; Settings warns when the shop has no Telegram username.
- Deployed to the dev server (§22).

Not built yet: Open Graph pages (§12), nightly jobs (reconcile, media cleanup, login-token cleanup, trial reminder),
staff invite links and the trial reminder in the bot, Testcontainers integration tests and CI with tests on (CI still
`-DskipTests`), branch UI (§20), barcode lookup (external databases), audit of every write, WebP photos.
**Open on the dev server: nobody can log in yet** — needs the bot token (or `APP_AUTH_DEV_LOGIN=true`, unsafe on a
public site). The pending basket code is kept only until a page reload.

---

## 22. Deployment (dev server, as of 23.11.2026)

| | |
|---|---|
| Site | https://labaratory.rastashops.com (frontend + `/api/` proxied to the backend); `dev-api.rastashops.com` also proxies the API and MinIO (`/rasta-media`) |
| Server | `178.105.45.4` (Ubuntu, root SSH), Cloudflare in front |
| CI/CD | GitHub Actions in each repo: **push to `main` → build → rsync to `/opt/rasta/backend/incoming` or `/srv/rasta/frontend/incoming` → `sudo rasta-deploy` / `rasta-deploy-frontend`** (atomic symlink swap). Tests are skipped in CI. |
| Backend service | systemd `rasta-backend`, `/opt/rasta/backend/current.jar`, Java 21, profile `prod`, listens on 127.0.0.1:8080 |
| Settings | `/etc/rasta/backend.env` (never touched by CI). Added for v1: `APP_PUBLIC_URL=https://labaratory.rastashops.com`, `APP_SEED_DEMO=true`. Still to add: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET`. Template: `back/deploy/backend.env.example`. |
| Database | Postgres `rasta_db` (owner `rasta`): **v1 tables in schema `app`** (Flyway history `app.flyway_schema_history`); the old app's 19 tables + history (V9) remain in `public`, untouched (D14) |
| Deploy script | `/usr/local/bin/rasta-deploy` (repo copy `back/deploy/bin/rasta-deploy`): pg_dump before the deploy, health check **`/api/v1/catalog`** (was the old `/api/shops`), rollback to the previous jar if unhealthy |
| Backups made on 23.11.2026 | `/usr/local/bin/rasta-deploy.bak-20261123-182344`, `/etc/rasta/backend.env.bak-20261123-182344` |
| Photos | MinIO bucket `rasta-media` (public read, made by an admin); the app never changes its policy |
| Verified after the deploy | migration in schema `app`, app started, demo seed loaded; `/`, `/<handle>`, `/api/v1/catalog` → 200, missing asset → 404; Explore shows the 6 demo shops |

Turning the bot on: set the three `TELEGRAM_*` values in `backend.env`, `systemctl restart rasta-backend`, then
`curl "https://api.telegram.org/bot<TOKEN>/setWebhook" -d url=https://labaratory.rastashops.com/api/telegram/webhook -d secret_token=<SECRET>`.
For production (rastashops.com) later: its own database or schema, `APP_SEED_DEMO` off, the real domain in
`APP_PUBLIC_URL` and `APP_CORS_ALLOWED_ORIGINS`, tests on in CI.
