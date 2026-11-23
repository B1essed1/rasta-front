# rastashops.com — next plans and ideas

Written 23.11.2026, after v1 was built and deployed to the dev server (see `CLAUDE.md` §0, `BACKEND-PLAN.md` §21–22).
Market figures below come from public sources (listed at the end); where a source was weak it says so.

---

## 1. The main idea (the filter for every idea in this file)

**rastashops gives a small Instagram/Telegram seller in Uzbekistan a real shop in minutes, and keeps the sale in
Telegram, where they already talk to buyers.**

1. **A shop page in minutes:** `rastashops.com/<handle>`, products with variants and real stock, link-in-bio.
2. **The basket goes to the seller's Telegram:** no checkout, no online payment, no delivery service. Price, pickup and
   payment are agreed in the chat; the seller marks it Sold and stock goes down.
3. **One marketplace for all shops (Explore / "rasta bozor"):** buyers find shops, shops get free traffic.
4. **Simple stock and selling in person:** inventory journal, barcode POS, team with roles, sales reports.
5. **Weak internet, phones, uz / ru / en:** fast and simple beats feature-rich.

An idea belongs here only if it makes one of these five stronger. Anything that turns rastashops into Uzum (payments,
logistics, warehouses) or into a chat app is out (§8).

---

## 2. Where rastashops stands today

**Strong (already built and working)**
- Shop page with themes and palettes, link-in-bio, product variants with their own price, stock and barcodes.
- **Basket → Telegram** flow (D13): the buyer writes to the shop directly; the seller gets a bot card with Agreed / Sold /
  Cancel; Sold records the sale and stock.
- **Real inventory:** a stock journal where every change is a movement, landed cost with extra costs, undo restock,
  history and reports. Most "Instagram shop" tools have nothing like it.
- **POS:** barcode scanning, several customers at once, offline queue, till PIN per cashier.
- **Team:** owner / manager / cashier with permissions; staff invited by phone.
- **Marketplace (Explore)** with the same filter engine as the storefront.
- **Branch-ready data model** (one default branch per shop).

**Weak or missing (blocks real use)**
- **Nobody can log in on the dev server** until the bot token is set.
- **No link previews:** a shop or product link pasted in Telegram/Instagram shows no photo or price. For a product
  that lives on links, this is the biggest gap.
- **Not tested with real sellers yet.** No funnel numbers (visits → baskets → sent → sold).
- Explore filters run in the browser over the whole catalog: fine for hundreds of shops, not for thousands.
- No nightly jobs (stock check, photo cleanup), tests skipped in CI.
- The seller has to come to the website to add products. Many sellers live in Telegram all day.

---

## 3. Other shops and tools: what they do, and what rastashops should learn

| Who | What they offer | Where they beat rastashops | Where rastashops wins | Lesson |
|---|---|---|---|---|
| **Uzum Market** (the big marketplace) | Huge audience (72% name it their go-to e-commerce, one survey); payments, instalments (Nasiya), logistics; commission **3–35% by category** (2024 figures, newer table not public); 90% of its sellers are small businesses; now also lets sellers deliver themselves (DBS) | Traffic, trust, payment, delivery | No commission, the seller keeps the customer and the chat, own brand and page, sells in person too | Don't compete on logistics or payments. Be the **seller's own channel**, and make it easy to be on both (Uzum + rastashops). One report says Uzum is **moving into Telegram chat commerce**: watch it, it's the biggest risk (§9). |
| **Plain Instagram / Telegram** (most sellers today) | Free, the audience is already there | No new tool to learn | A catalog with sizes, colours and **real stock**, a link that works, baskets instead of "price?" DMs, sales and stock reports | Never make the seller leave Telegram for daily work: the bot must do more (§5 B). |
| **Telegram shop bots / Mini App builders** (uShop ~$9.99/mo, TG Shop Constructor with a free 15-product plan, BotLaunch, Tiny Shops; local agencies build custom ones from ~$200 to 30M+ so'm) | The shop lives **inside Telegram**; some take payments (Stars, cards) | Buyer never leaves Telegram | No developer needed, a public web page + marketplace, real inventory and POS, uz/ru/en | **Make rastashops also open as a Telegram Mini App** (same shop, same data): the strongest single next step (§5 B1). |
| **Taplink / link-in-bio tools** | Many links + a simple product page in the Instagram bio; mostly digital goods or links to other stores | Known brand, simple | Real catalog with variants and stock, basket to Telegram, marketplace | Keep the bio page as a first-class product (it's how sellers start), and let sellers start with only the bio page. |
| **Take.app** (closest foreign twin: WhatsApp ordering links, SE Asia/LatAm) | Store link → order arrives in WhatsApp; free 50 orders/month, paid ~$19–50/mo; POS app, broadcasts, staff, multi-store | Mature product: broadcasts, repeat orders, QR ordering | Telegram instead of WhatsApp (Uzbekistan's channel), marketplace, inventory journal | The model works elsewhere. Copy what proved useful: **broadcasts to past buyers, QR codes for the shop/POS, order limits for the free plan**. |
| **Billz / MoySklad** (POS and inventory for shops; Billz says 5,000+ stores, bought by TBC Bank) | Strong POS, inventory, CRM, fiscal cash registers | Fiscal integration, deep reports, offline-shop focus | Free start, a public shop page + marketplace + Telegram baskets built in | Stay "light POS" for small sellers. Fiscal receipts only if sellers ask (it's regulation-heavy). |
| **OLX** | Classifieds; people still use it but its share is falling (one survey) | Free listings, wide reach | A real shop with brand and catalog | No action. |

**Where rastashops fits:** no one else combines **a free shop page + Telegram baskets + real stock/POS + a shared
marketplace**, in uz/ru/en, for phones on weak internet. Keep that combination; don't chase any single competitor's
strength (Uzum's logistics, Billz's fiscal cash registers, Mini-App builders' in-chat payments).

---

## 4. Plan: now (next 2–4 weeks) — make it usable with real sellers

| # | Work | Why (main idea) | Size |
|---|---|---|---|
| A1 | **Bot token + webhook on the dev server**, test login and seller cards with real Telegram | Nothing works for sellers without login (§2) | S |
| A2 | **Open Graph link previews** for shop, product and basket links (`BACKEND-PLAN.md` §12) | Every sale starts with a link pasted in Telegram/Instagram; a preview with photo and price gets far more taps | M |
| A3 | **Onboard 10 real sellers by hand** (fashion, cosmetics, sweets); watch them use it, write down every confusion | Real feedback before building more | M |
| A4 | **Funnel numbers** in the dashboard and for us: shop visits → product views → baskets → sent (popup button) → agreed → sold | Know what works; decide the buyer-login question with data (D13) | S |
| A5 | **Telegram username required at onboarding** (pre-filled from the Telegram login) | Baskets reach the seller only through it | S |
| A6 | **Instagram in-app browser:** detect it; if something fails there (photo upload, login), show "open in browser" | Most buyers arrive from Instagram links | S |
| A7 | Keep the pending basket code after a page reload (store it with the basket) | No duplicate "New" requests | S |
| A8 | Nightly jobs (stock check, photo cleanup, expired logins), tests on in CI, production setup (own schema/DB, seed off) | Safety before real data | M |
| A9 | Photos: WebP + small first image, check first load on "Slow 3G" | Weak internet is the norm | S |

---

## 5. Plan: next (1–3 months) — grow sellers and baskets, stay in Telegram

### B. Live where the seller and buyer already are (Telegram)
| # | Idea | Why | Size |
|---|---|---|---|
| **B1** | **The shop as a Telegram Mini App:** the same storefront opens inside Telegram (from the shop's channel, bio or bot button); the basket's "send" opens the chat with the shop | Buyers never leave Telegram; matches how Uzbekistan already shops (Telegram ~44% as a go-to channel, one survey). Mini-App builders prove the demand, but none has a marketplace or real stock | M |
| **B2** | **Seller bot as a mobile admin:** send a photo + "name, price, sizes" to the bot → a draft product; "/stock 42 navy +5"; daily summary ("3 new baskets, 2 sold, 4 low-stock items") | Many sellers never open a website; the dashboard comes to them | M |
| **B3** | **Post to my Telegram channel / Instagram:** one tap posts a product card (photo, price, sizes) with a "Add to basket" button that opens the shop/Mini App | Sellers already post daily; every post becomes a sales link | M |
| B4 | **Reminders:** "This basket has waited 24 h" to the seller; optional "Still interested?" message the seller can send | Fewer lost baskets | S |

### C. Make the shop page sell better
| # | Idea | Why | Size |
|---|---|---|---|
| C1 | **Import from Instagram** (posts → draft products with photos) | The biggest onboarding pain is typing products in | L |
| C2 | **Barcode lookup** from open databases when scanning an unknown code (Open Food Facts, UPCitemdb free tier, and later our own shared barcode table) | Faster POS onboarding for packaged goods | M |
| C3 | Product ♡ (save products), "New" and sale (old price) badges | Brings buyers back; sale badges sell | S |
| C4 | Category picker redesign (one searchable picker, suggestions from the name) | Fewer wrong categories → better Explore filters | M |
| C5 | "Exchange & returns" text per shop, pickup hours | Answers buyers' first questions without a chat | S |
| C6 | QR codes: for the shop (stickers, shop window) and for each product label | Offline → online, like Take.app | S |

### D. The marketplace (Explore) brings buyers to all shops
| # | Idea | Why | Size |
|---|---|---|---|
| D1 | **Server-side search and filters** with facet counts (`product_facets`) | Needed once there are thousands of products | M |
| D2 | City and "near me" (branch coordinates), "open now" | Most deals are pickup; nearby shops convert | M |
| D3 | Collections curated by us ("Eid gifts", "Back to school", "Wedding season") | Seasonal traffic spikes in Uzbekistan | S |
| D4 | Basic quality rules for Explore: real photos, stock > 0, answered baskets → ranked higher; inactive shops ranked lower | Buyers trust the marketplace | S |

### E. Buyers come back
| # | Idea | Why | Size |
|---|---|---|---|
| E1 | "My requests" for logged-in buyers (status per basket) | A reason to log in **after** buying, not before | S |
| E2 | **Broadcast to past buyers** (only people who sent the shop a basket and agreed to news), through the bot | Take.app's most-used paid feature; repeat sales are cheap | M |

---

## 6. Plan: later (3–6+ months)

| # | Idea | Why | Size |
|---|---|---|---|
| F1 | **Branches UI** (`BACKEND-PLAN.md` §20): per-branch stock, transfers, POS per branch, "available at" on the product page | Growing sellers open a second point; the data model is ready | L |
| F2 | **Pro plan with billing** (Payme / Click subscription): more products/photos, more staff, branches, broadcasts, custom domain, CSV export | The business model (see below) | M |
| F3 | **Featured places in Explore** (paid, clearly marked) | Revenue that also helps sellers | M |
| F4 | Wholesale price lists (a second price per variant for B2B buyers, shown with a code) | Many Tashkent sellers also sell wholesale | M |
| F5 | Shop verification badge (documents + real activity) | Trust in the marketplace | S |
| F6 | Reviews (only on sold requests, so they're real) | Trust, once there is enough volume; flag is already in the code | M |

**How rastashops earns money, without breaking the main idea**
1. **Free:** shop page, Telegram baskets, Explore listing, basic stock, up to N products and 1 staff (like Take.app's free 50 orders/month).
2. **Pro subscription:** POS with several cashiers, branches, broadcasts, **full analytics (§7: product scorecard, sources, restock advice, real profit, weekly summary)**, CSV, custom domain, more photos.
3. **Featured places in Explore.**

Never a commission on sales: that's Uzum's model and the main reason sellers prefer their own channel.

---

## 7. Seller analytics — show the seller the whole picture of their shop

Goal: a seller should open one screen (or read one Telegram message) and know **what sells, what doesn't, where buyers
come from, how much money they really make, and what to do next**. Every report answers one plain question, in
uz / ru / en, with dates as dd.mm.yyyy and people by full name. No vanity charts.

### 7.1 What sellers can already see (built)
| Screen | Shows |
|---|---|
| Home | today's sales, things that need attention (new baskets, sold out, low stock, incomplete products), last 30 days: visitors, product views, items sold, revenue |
| Sales | revenue, profit %, number of sales, average sale, returns and losses, revenue by day, payment-method split, every sale with its lines and seller |
| Inventory → History | every stock movement (who, when, why, stock left) with filters and CSV |
| Inventory → Reports | stock value at cost and at retail price, sales and profit, losses, stock flow, top sellers, about to run out, not selling, restock spend |
| Team | revenue, receipts, items, returns and commission per staff member, best products and last receipts per person |

### 7.2 What to add (in order of value)

| # | Report | The question it answers | Data needed | Size | Plan |
|---|---|---|---|---|---|
| **AN1** | **Sales funnel** of the shop: visits → product views → added to basket → basket sent (popup button) → agreed → sold, with % between steps, per day / week | "Where do I lose buyers?" (e.g. many basket adds, few sent → buyers hesitate; many sent, few sold → I answer too slowly or the price is too high) | new events: basket add, basket sent (popup button) — the rest exists | M | Free (simple), Pro (by product and source) |
| **AN2** | **Product scorecard**: per product — views, basket adds, requests, sold, conversion %, revenue, profit, margin, stock left, days of stock left | "Which product is a star, which one is looked at but never bought (photo or price problem), which one makes no money?" | basket-add event; everything else exists | M | Pro |
| **AN3** | **Where buyers come from**: Instagram, Telegram (chat / channel), Explore (rasta bozor), direct link, QR code, link-in-bio — visits, baskets and sales per source | "Is my Instagram or my Telegram channel bringing the sales? Is rastashops' marketplace sending me buyers?" | referrer + `?src=` on every link we generate (bio, QR, channel posts), in-app browser detection | M | Free (top 3), Pro (full) |
| **AN4** | **Basket requests report**: how fast I answer (time to agreed / sold), agreed rate, cancel rate and reasons, money lost in cancelled baskets, **average discount I give in chat** (listed total vs agreed total) | "Am I losing sales by answering late? How much do I give away in bargaining?" | exists (request history, total vs final total); add a cancel-reason choice | S | Free |
| **AN5** | **Missed demand**: sizes / colours / variants that buyers tried to pick while sold out; search words in my shop and in Explore that found nothing | "What should I restock or start selling?" (e.g. "17 tries for navy · M this week while sold out") | new events: sold-out variant tapped, search with no result | M | Pro |
| **AN6** | **Restock advice**: sales speed per variant → days until sold out → "order 12 more of navy · M by Friday"; dead stock (no sale in 60 days) and the money stuck in it | "What do I buy next, and what should I put on sale?" | exists (movements, sales) | M | Pro |
| **AN7** | **Real profit**: revenue − cost of goods (landed cost) − losses − returns − staff commission, by week / month; profit per product, per category, per **supplier** (restock note) | "Do I actually make money, and which supplier's goods earn the most?" | exists; supplier becomes a field instead of a free note | M | Pro |
| **AN8** | **Best times**: baskets and in-person sales by weekday and hour | "When should I post, and when do I need a second cashier?" | exists | S | Free |
| **AN9** | **Buyers**: new vs returning buyers, repeat rate, top buyers (only those who logged in or wrote through the shop's chat with the code), how many came back after a broadcast | "Do people come back to me?" | requests linked to buyer accounts (logged-in buyers); later the bot link | M | Pro |
| **AN10** | **Post performance**: for products posted with the one-tap channel post (idea B3) — views, basket adds and sales per post | "Which post sold, which was a waste?" | tracking link per post (`?src=post_…`) | S (after B3) | Pro |
| **AN11** | **Compared to similar shops** (anonymous): my conversion, average price and answer speed vs the median of my category / city on rastashops | "Am I doing well compared to others?" | aggregates across shops, never another shop's names or numbers | M | Pro |
| **AN12** | **Branches** (after F1): sales, stock and staff per branch, transfers between branches | "Which point works better?" | branch_id already on every row | M | Pro |

### 7.3 How the seller gets it (they live in Telegram)
- **Weekly Telegram summary from the bot** (Monday morning): revenue and profit vs last week, best and worst product,
  baskets answered late, 3 things to restock, missed demand. One message, numbers + one suggestion. Free (short) / Pro (full).
- **Daily alert only when something needs action:** a product sold out, a basket waiting 24 h, visits dropped by half.
- **Goals:** "this month: 15 000 000 so'm" with a progress bar on Home and in the weekly summary.
- **Export:** CSV / Excel for sales, stock and the product scorecard (Pro), for accountants.
- **Plain language:** every number has one line explaining it ("Basket → sent 38%: 6 of 10 buyers who filled a
  basket did not send it").

### 7.4 Rules (privacy and trust)
- A seller sees only their own buyers, and only what the buyer gave them (the Telegram name/phone in their chat, or a
  logged-in buyer's name). The public basket link never shows the buyer.
- Comparisons with other shops (AN11) use anonymous medians only; never another shop's name or numbers.
- Views count once per visitor per day, and the shop's own staff are not counted (already so).
- Events are small and batched (weak internet); a failed event is never retried at the cost of the page.

### 7.5 What to build first
1. **AN1 funnel + AN4 requests report + AN8 best times**, shown on Home, and the **weekly Telegram summary**: little new
   data, answers the seller's first questions, and also gives us the numbers in §10.
2. Then **AN3 sources** (needed to judge Instagram vs Telegram vs Explore) and **AN2 product scorecard**.
3. Then **AN6 restock advice** and **AN7 real profit**: these make the Pro plan worth paying for.

---

## 8. Not doing (off the main idea), and why

| Idea | Why not |
|---|---|
| Online checkout and payments inside rastashops | That's Uzum's game (instalments, payment, trust); it adds regulation and support. Price and payment stay in the chat. Flag `ORDERS_ON` stays off. |
| Own delivery / couriers / warehouses | Logistics is capital-heavy; sellers already arrange pickup and taxi delivery. |
| In-app buyer ↔ seller chat | Telegram is the chat. A second inbox would be ignored (flag `CHAT_ON` stays off). |
| Forcing buyers to log in | Costs buyers (Baymard ~18–19% abandon on forced accounts; in-app browser logins break). Login stays optional (D13). |
| Commission on sales | Sellers come to rastashops to avoid it. |
| Fiscal cash registers (for now) | Regulation-heavy; only if many sellers ask. Billz already covers it. |
| Becoming a full CRM / ERP | Small sellers need simple; that's what keeps rastashops fast. |

---

## 9. Risks to watch

- **Uzum moving into Telegram chat commerce** (one analyst report): if Uzum gives Telegram sellers a free shop link, rastashops' edge is the
  seller's own brand, real stock/POS and no commission. Move fast on B1–B3.
- **Telegram changes** (bot or Mini App rules, `?text=` prefill support): keep the copy-message fallback.
- **Instagram's in-app browser** breaking flows (A6).
- **Empty marketplace:** Explore only matters with many active shops. Seed it with real sellers (A3) before promoting it to buyers.
- **Seller time:** if adding products is slow, sellers won't stay. C1 and B2 matter more than new screens.

---

## 10. Numbers to watch (weekly)

| Number | Why |
|---|---|
| New shops / shops with ≥ 5 products / shops active this week | Are sellers staying? |
| Basket → sent (popup button pressed) | Is the buyer flow smooth? (decides the buyer-login question) |
| Sent → agreed → sold, time to the seller's first answer | Do sellers use the requests? |
| Share of traffic from Instagram in-app browser vs Telegram vs Explore | Where buyers come from, where flows break |
| POS sales per active shop | Is the inventory/POS side used? |

---

## Sources
- [Uzum: Digital Habits Study of Uzbekistan](https://uzum.com/en/press-center/news-and-press-releases/first-digital-habits-study-of-uzbekistan-uzum-ecosystem-services-are-the-most-in-demand-digital-products-in-the-country/) (Uzum 72%, Instagram 45%, Telegram 44% as go-to e-commerce)
- [Spot.uz: Uzum Market fees (2024)](https://www.spot.uz/ru/2024/04/17/uzum-market-fees/) (3–35% commission by category)
- [Yespress: Uzum seller agreement (2026)](https://yespress.io/uzum)
- [Uzum: sellers can now deliver orders themselves](https://uzum.com/en/press-center/news-and-press-releases/uzum-market-sellers-can-now-deliver-orders-themselves/)
- [Spot.uz: Uzum Market (2026)](https://www.spot.uz/ru/2026/07/08/uzum-market/) (90% of sellers are small businesses)
- [Sacra: Uzum wraps Telegram chat commerce](https://sacra.com/chat/h/66d000cc-a113-41d1-8599-8daffc282f32/) (analyst view, not official)
- [Take.app: WhatsApp ordering](https://www.take.app/features/whatsapp) · [SaaSworthy: Take App pricing](https://www.saasworthy.com/product/take-app) (may be outdated)
- [uShop (ucoz) Telegram store bot](https://www.ucoz.com/bot/) · [TG Shop Constructor](https://tgshop.es/) · [BotLaunch](https://www.botlaunch.io/commerce) · [Tiny Shops](https://tiny-shops.com/telegram-shop-builder)
- [Sanjardev: website, bot or app](https://sanjardev.uz/en/blog/online-store-development-website-bot-or-app) · [Adminz: Telegram Mini Apps (Tashkent)](https://adminz.uz/en/services/telegram-mini-apps) · [MoySklad: Telegram shop in Uzbekistan](https://www.moysklad.uz/poleznoe/shkola-torgovli/kak-sozdat-magazin-v-telegram/)
- [Taplink](https://taplink.at/en/) · [Taplink: bio links for e-commerce](https://taplink.at/en/blog/instagram-bio-links-for-ecommerce.html)
- [Digital Business: BILLZ and TBC Bank](https://digitalbusiness.kz/en/2025-10-09/invested-200-000-of-personal-funds-how-a-startup-from-uzbekistan-secured-12-million-from-a-large-bank/) · [IT Park: Rustam Khamdamov (BILLZ)](https://www.outsource.gov.uz/top-it-leaders-rating/rustam-hamdamov)
- [Baymard: cart abandonment statistics](https://baymard.com/blog/cart-abandonment-rate-statistics) (forced account creation ~18–19%)
