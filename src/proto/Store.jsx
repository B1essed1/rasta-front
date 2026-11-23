// ===== rastashops.com — app store: a cache of the server (BACKEND-PLAN §14) =====
// Every method keeps the prototype's name and shape, so screens are unchanged. Reads are synchronous from the
// cache; the cache is filled from GET /catalog (public), /dash/{id}/bootstrap (seller) and /b/{code}.
// Writes apply the prototype's own reducer first (instant on weak internet), call the API, then merge the
// server's answer (real ids, sale numbers, barcodes, costs). On an error: a toast and a fresh bootstrap.
const RASTA_KEY = "rasta.v3.ui";            // device-only UI state: language and the shop last opened
const OUTBOX_KEY = "rasta.pos.outbox";      // POS sales not sent yet (weak internet)

function readUi(){ try{ return JSON.parse(localStorage.getItem(RASTA_KEY) || "{}") || {}; }catch(e){ return {}; } }
function writeUi(p){ try{ localStorage.setItem(RASTA_KEY, JSON.stringify({ ...readUi(), ...p })); }catch(e){} }

// SHOPS / SHOP_ORDER are globals the UI reads directly: they become a registry filled from the API.
function clearDemoGlobals(){
  Object.keys(SHOPS).forEach(k => { delete SHOPS[k]; });
  SHOP_ORDER.splice(0, SHOP_ORDER.length);
}
function registerShop(base, products){
  SHOPS[base.id] = { ...(SHOPS[base.id] || {}), ...base, products: products || (SHOPS[base.id] && SHOPS[base.id].products) || [] };
  if(!SHOP_ORDER.includes(base.id)) SHOP_ORDER.push(base.id);
}
function emptyState(){
  const ui = readUi();
  return { v: 16, lang: ui.lang || "uz", session: null, currentId: ui.currentId || null,
    catalog: {}, movements: {}, sales: {}, orders: {}, reviews: {}, requests: {}, settings: {}, cfgs: {}, stats: {},
    team: {}, extraShops: {}, order: [], operator: {}, lastRestock: {}, dash: {}, viewer: {}, pop: {} };
}
function sessionFromMe(me){
  if(!me || !me.account) return null;
  return { phone: me.account.phone, name: me.account.name, at: Date.now(),
    staff: (me.shops || []).map(s => ({ shopId: s.shopId, staffId: s.staffId, role: s.role })) };
}
// public catalog payload → globals + state slices
function absorbCatalog(state, res){
  const s = { ...state, catalog: { ...state.catalog }, settings: { ...state.settings }, cfgs: { ...state.cfgs }, pop: { ...state.pop, ...(res.pop || {}) } };
  (res.shops || []).forEach(e => {
    const id = e.shop.id;
    const products = (res.products || {})[id] || [];
    registerShop(e.shop, products);
    if(!s.dash[id]){ s.catalog[id] = products; s.settings[id] = e.settings; s.cfgs[id] = e.cfg; }
  });
  if(res.photos) PhotoStore.load(res.photos);
  window.__shopCount = res.shopCount;
  s.order = [...SHOP_ORDER];
  return s;
}
// one shop by handle (paused shops, shops of the logged-in person)
function absorbShop(state, e){
  const id = e.shop.id;
  registerShop(e.shop, e.products || []);
  if(e.photos) PhotoStore.load(e.photos);
  if(state.dash[id]) return { ...state, order: [...SHOP_ORDER] };
  return { ...state, order: [...SHOP_ORDER], catalog: { ...state.catalog, [id]: e.products || [] },
    settings: { ...state.settings, [id]: e.settings }, cfgs: { ...state.cfgs, [id]: e.cfg }, pop: { ...state.pop, ...(e.pop || {}) } };
}
function absorbBootstrap(state, b){
  const id = b.shopId;
  registerShop(b.shop, b.catalog);
  if(b.photos) PhotoStore.load(b.photos);
  const keepOpt = (list) => (list || []).filter(x => x._op);          // optimistic rows still waiting for the server
  return { ...state, order: [...SHOP_ORDER],
    catalog: { ...state.catalog, [id]: b.catalog },
    movements: { ...state.movements, [id]: [...keepOpt(state.movements[id]), ...b.movements] },
    sales: { ...state.sales, [id]: [...keepOpt(state.sales[id]), ...b.sales] },
    requests: { ...state.requests, [id]: b.requests },
    settings: { ...state.settings, [id]: b.settings }, cfgs: { ...state.cfgs, [id]: b.cfg },
    team: { ...state.team, [id]: b.team }, stats: { ...state.stats, [id]: b.stats },
    lastRestock: { ...state.lastRestock, [id]: b.lastRestock || null },
    viewer: { ...state.viewer, [id]: b.viewer },
    dash: { ...state.dash, [id]: { at: Date.now(), rangeFrom: b.rangeFrom, branches: b.branches } } };
}
// Loaded before the first render (App.jsx boot), so the screens' synchronous reads see real data.
async function bootData(route){
  clearDemoGlobals();
  let s = emptyState();
  const [cat] = await Promise.all([Api.get("/catalog").catch(() => null), Api.restore()]);
  if(cat) s = absorbCatalog(s, cat);
  s.session = sessionFromMe(Api.me);
  if(route && route.handle && !SHOP_ORDER.some(id => SHOPS[id].handle === route.handle)){
    try{ const e = await Api.get("/shops/" + encodeURIComponent(route.handle)); if(e && e.shop) s = absorbShop(s, e);
      else if(e && e.movedTo) window.__movedTo = e.movedTo; }catch(e){}
  }
  if(route && route.view === "request" && route.code){
    try{ const r = await Api.get("/b/" + encodeURIComponent(route.code));
      s = { ...s, requests: { ...s.requests, [r.shopId]: [r.req, ...((s.requests[r.shopId]) || [])] } };
      if(!SHOPS[r.shopId]){ const e = await Api.get("/shops/" + encodeURIComponent(r.shop.handle)); if(e && e.shop) s = absorbShop(s, e); }
    }catch(e){}
  }
  const mine = (s.session && s.session.staff || []).map(x => x.shopId);
  if(mine.length && (!s.currentId || (!SHOPS[s.currentId] && !mine.includes(s.currentId)))) s.currentId = mine[0];
  if(!s.currentId && SHOP_ORDER.length) s.currentId = SHOP_ORDER[0];
  // the dashboard opens with the shop's data already loaded
  if(route && route.view === "dashboard" && s.currentId && mine.includes(s.currentId)){
    try{ s = absorbBootstrap(s, await Api.get("/dash/" + s.currentId + "/bootstrap")); }catch(e){}
  }
  return s;
}

// invariant: cached qty === sum of that variant's journal rows (checked on the server now; kept for the UI)
function reconcile(state){ return { state, fixed: 0 }; }
function loadState(){ return window.__bootState || emptyState(); }
function saveState(s){ writeUi({ lang: s.lang, currentId: s.currentId }); }

function useShopStore(){
  const [state, setState] = React.useState(loadState);
  const ref = React.useRef(state);
  ref.current = state;
  React.useEffect(()=>{ registerCatalogBarcodes(state.catalog); }, [state.catalog]);
  React.useEffect(() => { saveState(state); }, [state.lang, state.currentId]);

  const up = (fn) => setState(s => fn(s) || s);
  const mapShop = (s, shopId, key, fn) => ({ ...s, [key]: { ...s[key], [shopId]: fn(s[key][shopId] || []) } });
  const uid = (p) => p + Math.random().toString(36).slice(2, 10);
  const mv = (shopId, list, op) => (s) => mapShop(s, shopId, "movements", (m) => [...list.map(x => op ? { ...x, _op: op } : x), ...m]);
  const t = () => I18N[ref.current.lang] || I18N.uz;
  const canDash = (shopId) => !!(ref.current.session && (ref.current.session.staff || []).some(e => e.shopId === shopId));

  // ---- server answers → cache ----
  function apply(shopId, res, op){
    if(!res) return;
    if(res.photos) PhotoStore.load(res.photos);
    if(res.shop) registerShop(res.shop);
    up(s => {
      let catalog = res.catalog ? res.catalog : (s.catalog[shopId] || []);
      [].concat(res.product ? [res.product] : [], res.products || []).forEach(p => {
        const i = catalog.findIndex(x => x.id === p.id);
        catalog = i >= 0 ? catalog.map(x => x.id === p.id ? p : x) : [p, ...catalog];
      });
      let movements = s.movements[shopId] || [];
      if(op) movements = movements.filter(m => m._op !== op);
      if(res.removedMovementIds) movements = movements.filter(m => !res.removedMovementIds.includes(m.id));
      if(res.movements && res.movements.length){
        const ids = new Set(res.movements.map(m => m.id));
        movements = [...res.movements, ...movements.filter(m => !ids.has(m.id))].sort((a, b) => b.at - a.at);
      }
      let sales = s.sales[shopId] || [];
      if(op) sales = sales.filter(x => x._op !== op || (res.sale && x.id === res.sale.id));
      if(res.sale){ const i = sales.findIndex(x => x.id === res.sale.id); sales = i >= 0 ? sales.map(x => x.id === res.sale.id ? res.sale : x) : [res.sale, ...sales]; }
      let requests = (s.requests || {})[shopId] || [];
      const rq = res.request || null;
      if(rq){ const i = requests.findIndex(x => x.id === rq.id); requests = i >= 0 ? requests.map(x => x.id === rq.id ? rq : x) : [rq, ...requests]; }
      const out = { ...s, catalog: { ...s.catalog, [shopId]: catalog }, movements: { ...s.movements, [shopId]: movements },
        sales: { ...s.sales, [shopId]: sales }, requests: { ...(s.requests || {}), [shopId]: requests } };
      if(res.team) out.team = { ...s.team, [shopId]: res.team };
      if(res.lastRestock !== undefined) out.lastRestock = { ...s.lastRestock, [shopId]: res.lastRestock };
      if(res.settings) out.settings = { ...s.settings, [shopId]: res.settings };
      if(res.cfg) out.cfgs = { ...s.cfgs, [shopId]: res.cfg };
      if(SHOPS[shopId] && res.catalog) SHOPS[shopId].products = catalog;
      return out;
    });
  }
  function fail(shopId, e){
    console.warn("[api]", e);
    toast(Api.errorText(e, ref.current.lang), "err");
    if(shopId && canDash(shopId)) api.loadDash(shopId);   // resync: drops the optimistic change
  }
  function run(shopId, promise, op){
    return promise.then(res => { apply(shopId, res, op); return res; }).catch(e => { fail(shopId, e); return null; });
  }
  const dash = (shopId) => "/dash/" + encodeURIComponent(shopId);

  // ---- POS outbox: sales made while the internet is down are sent later with the same id (idempotent) ----
  function outbox(){ try{ return JSON.parse(localStorage.getItem(OUTBOX_KEY) || "[]"); }catch(e){ return []; } }
  function setOutbox(l){ try{ localStorage.setItem(OUTBOX_KEY, JSON.stringify(l)); }catch(e){} }
  async function flushOutbox(){
    const list = outbox(); if(!list.length || !Api.token) return;
    const left = [];
    for(const it of list){
      try{ const res = await Api.post(dash(it.shopId) + "/sales", it.body); apply(it.shopId, res, it.op); }
      catch(e){ if(e.code === "network") left.push(it); else fail(it.shopId, e); }
    }
    setOutbox(left);
  }
  React.useEffect(() => {
    const i = setInterval(flushOutbox, 15000); addEventListener("online", flushOutbox); flushOutbox();
    return () => { clearInterval(i); removeEventListener("online", flushOutbox); };
  }, []);
  // session changes (login / logout / refresh) from anywhere → session slice
  React.useEffect(() => Api.onAuth((me) => {
    up(s => {
      const session = sessionFromMe(me);
      if(!session) return { ...s, session: null };
      const mine = session.staff.map(x => x.shopId);
      const currentId = mine.length && !mine.includes(s.currentId) && !SHOPS[s.currentId] ? mine[0] : s.currentId;
      return { ...s, session, currentId };
    });
  }), []);
  // the open dashboard picks up new basket requests and other devices' sales
  React.useEffect(() => {
    const i = setInterval(() => {
      const s = ref.current, id = s.currentId;
      if(document.hidden || !id || !s.dash[id] || !canDash(id)) return;
      const from = Date.now() - 2 * 86400000;
      Api.get(dash(id) + "/history?from=" + from + "&to=" + (Date.now() + 86400000)).then(h => mergeHistory(id, h)).catch(() => {});
    }, 30000);
    return () => clearInterval(i);
  }, []);
  function mergeHistory(id, h){
    up(s => {
      const merge = (old, add) => { const ids = new Set(add.map(x => x.id)); return [...add, ...(old || []).filter(x => !ids.has(x.id))].sort((a, b) => b.at - a.at); };
      return { ...s, movements: { ...s.movements, [id]: merge(s.movements[id], h.movements) },
        sales: { ...s.sales, [id]: merge(s.sales[id], h.sales) },
        requests: { ...s.requests, [id]: merge((s.requests || {})[id], h.requests) },
        dash: h.from < ((s.dash[id] || {}).rangeFrom || Infinity) ? { ...s.dash, [id]: { ...s.dash[id], rangeFrom: h.from } } : s.dash };
    });
  }
  // design changes are sent at most every 400 ms
  const cfgTimer = React.useRef({});

  const api = {
    state,
    get shopId(){ return state.currentId; },
    products(shopId){ return state.catalog[shopId] || []; },
    settings(shopId){ return state.settings[shopId] || { name: (SHOPS[shopId] || {}).name || "", handle: (SHOPS[shopId] || {}).handle || "",
      city: "", type: "", tagline: { uz: "", ru: "", en: "" }, contacts: {}, delivery: { uz: "", ru: "", en: "" }, payments: ["cash"],
      threshold: DEFAULT_THRESHOLD, showSold: true, status: "live", plan: "starter", trialDays: 0, phone: "" }; },
    cfg(shopId){ return state.cfgs[shopId] || { theme: "minimal", palette: "mist", layout: "grid", font: "grotesk" }; },
    movements(shopId){ return state.movements[shopId] || []; },
    sales(shopId){ return state.sales[shopId] || []; },
    orders(shopId){ return state.orders[shopId] || []; },
    reviews(shopId){ return state.reviews[shopId] || []; },
    productReviews(shopId, productId){ return api.reviews(shopId).filter(r=>r.productId===productId); },
    // reviews are switched off (REVIEWS_ON=false): local only, never sent
    addReview(shopId, rev){ return { id: uid("rv"), at: Date.now(), ...rev }; },
    removeReview(){},
    stats(shopId){ return state.stats[shopId] || { views: 0, productViews: {} }; },
    pop(shopId){ const out = {}; api.products(shopId).forEach(p => { const n = p.sold != null ? p.sold : state.pop[p.id]; if(n) out[p.id] = n; }); return out; },
    team(shopId){ return state.team[shopId] || []; },
    dashReady(shopId){ return !!state.dash[shopId]; },
    rangeFrom(shopId){ return (state.dash[shopId] || {}).rangeFrom || 0; },
    branches(shopId){ return (state.dash[shopId] || {}).branches || []; },
    canDash,
    async loadDash(shopId){
      if(!shopId || !canDash(shopId)) return null;
      try{ const b = await Api.get(dash(shopId) + "/bootstrap"); setState(s => absorbBootstrap(s, b)); return b; }
      catch(e){ console.warn("[bootstrap]", e); return null; }
    },
    // History / Sales pickers asking for days before the loaded window
    async ensureRange(shopId, from){
      const have = api.rangeFrom(shopId);
      if(!have || from >= have) return;
      try{ mergeHistory(shopId, await Api.get(dash(shopId) + "/history?from=" + from + "&to=" + have)); }catch(e){ fail(null, e); }
    },
    async loadShopByHandle(handle){
      try{ const e = await Api.get("/shops/" + encodeURIComponent(handle)); if(e && e.shop){ setState(s => absorbShop(s, e)); return e.shop.id; } }catch(e){}
      return null;
    },
    operatorId(shopId){
      const op = state.operator && state.operator[shopId];
      if(op && api.team(shopId).some(x => x.id === op && x.status === "active")) return op;
      const ss = api.staffShops(); const e = ss && ss.find(x => x.shopId === shopId);
      return e ? e.staffId : "owner";
    },
    operator(shopId){ const tm = api.team(shopId); return tm.find(m=>m.id===api.operatorId(shopId)) || tm[0] || { id: "owner", name: (state.session && state.session.name) || "", role: "owner", status: "active", perms: { returns:true, stock:true, products:true, costs:true } }; },
    // the till switches back to the logged-in member (no PIN needed for yourself)
    setOperator(shopId, id){
      const self = (api.staffShops() || []).find(x => x.shopId === shopId);
      if(self && self.staffId === id){ delete Api.operator[shopId]; up(s => ({ ...s, operator: { ...(s.operator||{}), [shopId]: null } })); }
    },
    // SwitchSeller: the PIN is checked on the server; the till then sends that person's operator token
    async switchOperator(shopId, staffId, pin){
      try{
        const r = await Api.post(dash(shopId) + "/till/operator", { staffId, pin });
        if(r.operatorToken) Api.operator[shopId] = r.operatorToken; else delete Api.operator[shopId];
        up(s => ({ ...s, operator: { ...(s.operator||{}), [shopId]: staffId } }));
        return { ok: true };
      }catch(e){ return { ok: false, code: e.code }; }
    },
    saveStaff(shopId, m){
      up(s => { const cur = s.team[shopId] || []; const has = cur.some(x=>x.id===m.id);
        return { ...s, team: { ...s.team, [shopId]: has ? cur.map(x=>x.id===m.id ? { ...x, ...m, pin: null } : x) : [...cur, { ...m, pin: null }] } }; });
      return run(shopId, Api.put(dash(shopId) + "/team/" + encodeURIComponent(m.id), m));
    },
    removeStaff(shopId, id){
      up(s => ({ ...s, team: { ...s.team, [shopId]: (s.team[shopId] || []).filter(x=>x.id!==id) } }));
      return run(shopId, Api.del(dash(shopId) + "/team/" + encodeURIComponent(id)));
    },
    saleSeller(shopId, sale){ const id = sale.sellerId || "owner"; return api.team(shopId).some(m=>m.id===id) ? id : "owner"; },
    shopMeta(shopId){
      const base = SHOPS[shopId] || {};
      const st = api.settings(shopId);
      return { ...base, name: st.name || base.name, handle: st.handle || base.handle, location: st.city || base.location, type: st.type || base.type,
        tagline: st.tagline || base.tagline, contacts: st.contacts, delivery: st.delivery, payments: st.payments, status: st.status, plan: st.plan,
        threshold: st.threshold, showSold: st.showSold, place: shopPlace(st, shopId), products: api.products(shopId) };
    },
    variantIndex(shopId){
      const out = {};
      api.products(shopId).forEach(p => p.variants.forEach(v => { out[v.id] = { p, v }; }));
      return out;
    },
    findByBarcode(shopId, code){
      const c = String(code).trim().toUpperCase();
      let hit = null;
      api.products(shopId).forEach(p => p.variants.forEach(v => { if(String(v.barcode).toUpperCase() === c) hit = { p, v }; }));
      return hit;
    },

    setLang(lang){ up(s => ({ ...s, lang })); if(Api.token) Api.patch("/me", { lang }).catch(()=>{}); },
    setShop(id){ up(s => ({ ...s, currentId: id })); if(id && canDash(id) && !ref.current.dash[id] && ref.current.session) api.loadDash(id); },
    // after a Telegram login (AuthFlow): the session comes from the server; returns the person's shops
    login(){
      const session = sessionFromMe(Api.me);
      up(s => {
        if(!session) return s;
        const mine = session.staff.map(x => x.shopId);
        return { ...s, session, currentId: mine.length && !mine.includes(s.currentId) ? mine[0] : s.currentId };
      });
      return session ? session.staff : [];
    },
    staffShops(){ return state.session ? (state.session.staff || []) : null; },
    logout(){ Api.logout(); Api.operator = {}; up(s => ({ ...s, session: null, dash: {}, operator: {}, movements: {}, sales: {}, requests: {}, team: {} })); },

    setCfg(shopId, patch){
      up(s => ({ ...s, cfgs: { ...s.cfgs, [shopId]: { ...s.cfgs[shopId], ...patch } } }));
      if(!canDash(shopId)) return;   // the landing's theme preview stays on this device (bug #18)
      const tm = cfgTimer.current;
      tm[shopId] = { ...(tm[shopId] && tm[shopId].patch || {}), ...patch };
      clearTimeout(tm["t" + shopId]);
      tm["t" + shopId] = setTimeout(() => { const p = tm[shopId]; tm[shopId] = null;
        run(shopId, Api.patch(dash(shopId) + "/design", p)); }, 400);
    },
    setSettings(shopId, patch){
      const p = { ...patch }; delete p.plan; delete p.trialDays; delete p.phone;
      up(s => ({ ...s, settings: { ...s.settings, [shopId]: { ...s.settings[shopId], ...p } } }));
      return run(shopId, Api.patch(dash(shopId) + "/settings", p));
    },

    saveProduct(shopId, draft){
      const op = uid("op");
      up(s => {
        const list = s.catalog[shopId] || [];
        const prev = list.find(p => p.id === draft.id);
        const newMv = [];
        const variants = draft.variants.map(v => {
          const old = prev && prev.variants.find(x => x.id === v.id);
          const barcode = v.barcode !== undefined ? v.barcode : (old ? old.barcode : null);
          const qty = Math.max(0, Number(v.qty) || 0);
          if(!old && qty > 0) newMv.push({ id: uid("m"), variantId: v.id, productId: draft.id, delta: qty, reason: "restock", note: "initial", at: Date.now() });
          else if(old && old.qty !== qty) newMv.push({ id: uid("m"), variantId: v.id, productId: draft.id, delta: qty - old.qty, reason: "correction", note: "", at: Date.now() });
          const avgCost = v.avgCost !== undefined ? v.avgCost : (old ? old.avgCost : null);
          return { ...v, barcode, qty, avgCost };
        });
        const p = { ...draft, specs: draft.specs || {}, variants };
        const catalog = { ...s.catalog, [shopId]: prev ? list.map(x => x.id === p.id ? p : x) : [{ ...p, sort: -1, created: Date.now() }, ...list] };
        return mv(shopId, newMv, op)({ ...s, catalog });
      });
      return run(shopId, Api.put(dash(shopId) + "/products/" + encodeURIComponent(draft.id), draft), op);
    },
    deleteProduct(shopId, id){
      up(s => mapShop(s, shopId, "catalog", l => l.filter(p => p.id !== id)));
      return run(shopId, Api.del(dash(shopId) + "/products/" + encodeURIComponent(id)));
    },
    duplicateProduct(shopId, id){
      const nid = uid("p");
      up(s => {
        const list = s.catalog[shopId] || [];
        const p = list.find(x => x.id === id); if(!p) return s;
        const copy = { ...p, id: nid, created: Date.now(), visible: false,
          name: { ...p.name, en: p.name.en + " (copy)" },
          variants: p.variants.map(v => ({ ...v, id: nid + "-" + (catSlug(optionsKey(v.options||{}))||"default"), barcode: v.barcode ? nextBarcode(shopId) : null, qty: 0 })) };
        const i = list.findIndex(x => x.id === id);
        const out = [...list]; out.splice(i + 1, 0, copy);
        return { ...s, catalog: { ...s.catalog, [shopId]: out } };
      });
      return run(shopId, Api.post(dash(shopId) + "/products/" + encodeURIComponent(id) + "/duplicate", { newId: nid }));
    },
    toggleVisible(shopId, id){
      const p = api.products(shopId).find(x => x.id === id); if(!p) return;
      up(s => mapShop(s, shopId, "catalog", l => l.map(x => x.id === id ? { ...x, visible: !x.visible } : x)));
      return run(shopId, Api.patch(dash(shopId) + "/products/" + encodeURIComponent(id), { visible: !p.visible }));
    },
    moveProduct(shopId, fromId, toId){
      const l = api.products(shopId);
      const a = l.findIndex(p => p.id === fromId), b = l.findIndex(p => p.id === toId);
      if(a < 0 || b < 0 || a === b) return;
      const out = [...l]; const [it] = out.splice(a, 1); out.splice(b, 0, it);
      up(s => mapShop(s, shopId, "catalog", () => out.map((p, i) => ({ ...p, sort: i }))));
      return run(shopId, Api.put(dash(shopId) + "/products/order", { ids: out.map(p => p.id) }));
    },

    adjust(shopId, variantId, delta, reason, note){
      if(!delta) return;
      const idx = api.variantIndex(shopId)[variantId];
      const op = uid("op");
      up(s => {
        const withQty = mapShop(s, shopId, "catalog", l => l.map(p => ({
          ...p, variants: p.variants.map(v => v.id === variantId ? { ...v, qty: v.qty + delta } : v) })));
        return mv(shopId, [{ id: uid("m"), variantId, productId: idx && idx.p.id, delta,
          reason: reason || "correction", unitCost: idx ? idx.v.avgCost : null, note: note || "", at: Date.now() }], op)(withQty);
      });
      return run(shopId, Api.post(dash(shopId) + "/stock/set-qty", { variantId, delta, reason: reason || "correction", note: note || "" }), op);
    },
    setBarcode(shopId, variantId, code){
      registerBarcode(code);
      up(s => mapShop(s, shopId, "catalog", l => l.map(p => ({
        ...p, variants: p.variants.map(v => v.id === variantId ? { ...v, barcode: code } : v) }))));
      return run(shopId, Api.put(dash(shopId) + "/stock/barcode", { variantId, code: code || null }));
    },
    generateBarcodes(shopId, ids){
      const list = ids || [];
      up(s => mapShop(s, shopId, "catalog", l => l.map(p => ({
        ...p, variants: p.variants.map(v => (!v.barcode && (!ids || list.indexOf(v.id) > -1)) ? { ...v, barcode: nextBarcode(shopId) } : v) }))));
      return run(shopId, Api.post(dash(shopId) + "/stock/barcodes", ids ? { variantIds: ids } : {}));
    },
    barcodeTaken(shopId, code, exceptId){
      let hit = false;
      api.products(shopId).forEach(p => p.variants.forEach(v => {
        if(v.id !== exceptId && String(v.barcode).toUpperCase() === String(code).toUpperCase()) hit = true;
      }));
      return hit;
    },
    // the server names the batch that can still be undone; any later movement on its variants blocks it
    lastRestock(shopId){
      const lr = state.lastRestock[shopId];
      if(!lr || Date.now() - lr.at > 3600000) return null;
      const batch = api.movements(shopId).filter(m => lr.movementIds.includes(m.id));
      if(!batch.length) return null;
      const ids = batch.map(m => m.variantId);
      const blocked = api.movements(shopId).some(m => m.at > lr.at && !lr.movementIds.includes(m.id) && ids.includes(m.variantId));
      return blocked ? null : batch;
    },
    undoRestock(shopId){
      if(!api.lastRestock(shopId)) return false;
      run(shopId, Api.post(dash(shopId) + "/stock/restock/undo"));
      return true;
    },
    setCost(shopId, variantId, cost){
      up(s => mapShop(s, shopId, "catalog", l => l.map(p => ({
        ...p, variants: p.variants.map(v => v.id === variantId ? { ...v, avgCost: cost == null ? null : roundSoum(Number(cost)) } : v) }))));
      return run(shopId, Api.put(dash(shopId) + "/stock/cost", { variantId, cost: cost == null ? null : Number(cost) }));
    },
    setQty(shopId, variantId, qty, reason, note){
      const idx = api.variantIndex(shopId)[variantId];
      if(!idx) return;
      const delta = Number(qty) - idx.v.qty;
      if(!delta) return;
      const op = uid("op");
      up(s => {
        const withQty = mapShop(s, shopId, "catalog", l => l.map(p => ({
          ...p, variants: p.variants.map(v => v.id === variantId ? { ...v, qty: Number(qty) } : v) })));
        return mv(shopId, [{ id: uid("m"), variantId, productId: idx.p.id, delta, reason: reason || "correction",
          unitCost: idx.v.avgCost, note: note || "", at: Date.now() }], op)(withQty);
      });
      return run(shopId, Api.post(dash(shopId) + "/stock/set-qty", { variantId, qty: Number(qty), reason: reason || "correction", note: note || "" }), op);
    },
    setVariantThreshold(shopId, ids, value){
      up(s => mapShop(s, shopId, "catalog", l => l.map(p => ({
        ...p, variants: p.variants.map(v => ids.includes(v.id) ? { ...v, threshold: Number(value) } : v) }))));
      return run(shopId, Api.put(dash(shopId) + "/stock/threshold", { variantIds: ids, value: value === "" || value == null ? null : Number(value) }));
    },
    // entries: [{variantId, qty, unitCost}], extra = costs spread across the intake by value.
    // A blank unitCost means UNKNOWN (never 0): the blend is skipped and the prior avg is kept. (Preview only:
    // the server runs the same rule when the restock is saved.)
    restockPlan(shopId, entries, extra){
      const idx = api.variantIndex(shopId);
      const list = entries.filter(e => Number(e.qty) > 0 && idx[e.variantId]);
      const known = (e) => e.unitCost !== "" && e.unitCost != null && !isNaN(Number(e.unitCost));
      const base = list.filter(known).reduce((n, e) => n + Number(e.qty) * Number(e.unitCost), 0);
      const ex = Number(extra) || 0;
      const costedCount = list.filter(known).length;
      return list.map(e => {
        const { p, v } = idx[e.variantId];
        const qty = Number(e.qty);
        const hasCost = known(e);
        const oldQty = Math.max(0, v.qty), oldAvg = v.avgCost;
        if(!hasCost){
          return { variantId: v.id, productId: p.id, qty, unitCost: null, landed: null, hasCost: false,
            product: p, variant: v, oldAvg, newAvg: oldAvg,
            oldMargin: margin(p.price, oldAvg), newMargin: margin(p.price, oldAvg), keepPrice: null };
        }
        const unit = Number(e.unitCost);
        const share = base > 0 ? (qty * unit / base) * ex : (costedCount ? ex / costedCount : 0);
        const landed = unit + (qty ? share / qty : 0);
        const newAvg = roundSoum(oldAvg != null && oldQty > 0
          ? (oldQty * oldAvg + qty * landed) / (oldQty + qty)
          : landed);
        return { variantId: v.id, productId: p.id, qty, unitCost: unit, landed: roundSoum(landed), hasCost: true,
          product: p, variant: v, oldAvg, newAvg,
          oldMargin: margin(p.price, oldAvg), newMargin: margin(p.price, newAvg),
          keepPrice: priceForMargin(newAvg, margin(p.price, oldAvg)) };
      });
    },
    restock(shopId, entries, note, extra){
      const plan = api.restockPlan(shopId, entries, extra);
      if(!plan.length) return;
      const op = uid("op");
      up(s => {
        const withQty = mapShop(s, shopId, "catalog", l => l.map(p => ({
          ...p, variants: p.variants.map(v => {
            const e = plan.find(x => x.variantId === v.id);
            if(!e) return v;
            return e.hasCost ? { ...v, qty: v.qty + e.qty, avgCost: e.newAvg } : { ...v, qty: v.qty + e.qty };
          }) })));
        return mv(shopId, plan.map(e => ({ id: uid("m"), variantId: e.variantId, productId: e.productId,
          delta: e.qty, reason: "restock", unitCost: e.landed, avgAfter: e.hasCost ? e.newAvg : e.oldAvg,
          note: note || "", at: Date.now() })), op)(withQty);
      });
      return run(shopId, Api.post(dash(shopId) + "/stock/restock", {
        entries: plan.map(e => ({ variantId: e.variantId, qty: e.qty, unitCost: e.hasCost ? e.unitCost : null })),
        note: note || "", extra: Number(extra) || 0 }), op);
    },
    // returns the sale at once (receipt on screen); the server's answer brings the real number
    completeSale(shopId, lines, pay, channel){
      const idx = api.variantIndex(shopId);
      const op = uid("op");
      const prev = (state.sales[shopId] || [])[0];
      const sale = { id: uid("s"), _op: op, no: (prev && prev.no ? prev.no : 200) + 1, at: Date.now(), pay: pay || "cash", status: "completed", sellerId: api.operatorId(shopId),
        lines: lines.map(l => ({ ...l, cost: idx[l.variantId] ? idx[l.variantId].v.avgCost : null,
          oversold: idx[l.variantId] ? idx[l.variantId].v.qty < l.qty : false, returned: 0 })),
        total: lines.reduce((n, l) => n + l.qty * l.unit, 0) };
      up(s => {
        const withQty = mapShop(s, shopId, "catalog", l => l.map(p => ({
          ...p, variants: p.variants.map(v => {
            const ln = sale.lines.find(x => x.variantId === v.id);
            return ln ? { ...v, qty: v.qty - ln.qty } : v;
          }) })));
        const withSale = { ...withQty, sales: { ...withQty.sales, [shopId]: [sale, ...(withQty.sales[shopId] || [])] } };
        return mv(shopId, sale.lines.map(l => ({ id: uid("m"), variantId: l.variantId, productId: l.productId,
          delta: -l.qty, reason: "sale", saleId: sale.id, at: sale.at })), op)(withSale);
      });
      const body = { id: sale.id, pay: sale.pay, channel: channel || "pos",
        lines: lines.map(l => ({ variantId: l.variantId, qty: l.qty, unit: l.unit, name: l.name, label: l.label })) };
      Api.post(dash(shopId) + "/sales", body).then(res => apply(shopId, res, op)).catch(e => {
        if(e.code === "network"){ setOutbox([...outbox(), { shopId, body, op }]); toast(t().api_saved_offline || "Saved offline", "ok"); }
        else fail(shopId, e);
      });
      return sale;
    },
    returnLine(shopId, saleId, variantId, qtyWanted, mode){
      const op = uid("op");
      up(s => {
        const sales = (s.sales[shopId] || []);
        const sale = sales.find(x => x.id === saleId); if(!sale) return s;
        const line = sale.lines.find(l => l.variantId === variantId); if(!line || line.returned >= line.qty) return s;
        const qty = Math.min(line.qty - line.returned, Number(qtyWanted) || (line.qty - line.returned));
        const toStock = mode !== "writeoff";
        const newSale = { ...sale, lines: sale.lines.map(l => l.variantId === variantId ? { ...l, returned: l.returned + qty } : l) };
        newSale.total = newSale.lines.reduce((n, l) => n + (l.qty - l.returned) * l.unit, 0);
        newSale.status = newSale.lines.every(l => l.returned >= l.qty) ? "returned" : (newSale.lines.some(l => l.returned) ? "partially_returned" : "completed");
        const withQty = toStock ? mapShop(s, shopId, "catalog", l => l.map(p => ({
          ...p, variants: p.variants.map(v => v.id === variantId ? { ...v, qty: v.qty + qty } : v) }))) : s;
        const withSale = { ...withQty, sales: { ...withQty.sales, [shopId]: sales.map(x => x.id === saleId ? newSale : x) } };
        return mv(shopId, [{ id: uid("m"), variantId, productId: line.productId, delta: toStock ? qty : 0,
          reason: toStock ? "return" : "loss", qty, saleId, note: toStock ? "" : "return · write-off", at: Date.now() }], op)(withSale);
      });
      return run(shopId, Api.post(dash(shopId) + "/sales/" + encodeURIComponent(saleId) + "/returns",
        { variantId, qty: Number(qtyWanted) || 0, mode: mode === "writeoff" ? "writeoff" : "stock" }), op);
    },

    // ---------- orders (ORDERS_ON=false): old online checkout, not built, local no-ops ----------
    orderCounts(shopId){
      const list = api.orders(shopId);
      return { all: list.length, new: 0, stale: 0, open: 0 };
    },
    injectOrders(){},
    createOrder(shopId, draft){ return { id: uid("o"), no: 0, at: Date.now(), status: "new", lines: draft.lines, history: [] }; },
    orderIssues(){ return []; },
    confirmOrder(){ return null; },
    setOrderStatus(){},
    cancelOrder(){},

    // ---------- basket requests (buyer sends a code/link; price is agreed in Telegram) ----------
    requests(shopId){ return (state.requests && state.requests[shopId]) || []; },
    findRequest(code){
      const c = String(code||"").replace(/[^A-Za-z0-9]/g,"").toUpperCase(); let hit = null;
      Object.keys(state.requests||{}).forEach(sid=> (state.requests[sid]||[]).forEach(r=>{ if(r.code===c) hit = { shopId:sid, req:r }; }));
      return hit;
    },
    // /b/CODE opened later in this session
    async fetchRequest(code){
      try{
        const r = await Api.get("/b/" + encodeURIComponent(code));
        if(!SHOPS[r.shopId]) await api.loadShopByHandle(r.shop.handle);
        up(s => { const cur = (s.requests || {})[r.shopId] || [];
          if(cur.some(x => x.id === r.req.id)) return s;
          return { ...s, requests: { ...(s.requests || {}), [r.shopId]: [r.req, ...cur] } }; });
        return { shopId: r.shopId, req: r.req };
      }catch(e){ return null; }
    },
    // the code is made on the server (random, unique); the basket is cleared only when this resolves
    async createRequest(shopId, lines, buyer){
      const res = await Api.post("/requests", { shopId, lang: state.lang, lines: lines.map(l => ({ variantId: l.variantId, qty: l.qty })) });
      const req = { ...res.req, link: res.link, botUrl: res.botUrl, buyer: buyer || null };
      up(s => ({ ...s, requests: { ...(s.requests||{}), [shopId]: [req, ...((s.requests||{})[shopId]||[]).filter(x => x.id !== req.id)] } }));
      return req;
    },
    setRequestStatus(shopId, id, status, patch){
      up(s => ({ ...s, requests:{ ...(s.requests||{}), [shopId]:((s.requests||{})[shopId]||[]).map(r=> r.id===id
        ? { ...r, ...(patch||{}), status, history:[...(r.history||[]), { status, at:Date.now() }] } : r) } }));
      if(status === "agreed") return run(shopId, Api.post(dash(shopId) + "/requests/" + id + "/agree"));
      if(status === "cancelled") return run(shopId, Api.post(dash(shopId) + "/requests/" + id + "/cancel", { reason: patch && patch.reason || null }));
    },
    // "Sold": the server spreads the agreed total over the lines (remainder on the last line), records the sale
    sellRequest(shopId, id, finalTotal, pay){
      const r = api.requests(shopId).find(x=>x.id===id); if(!r) return null;
      const idx = api.variantIndex(shopId);
      const lines = r.lines.filter(l=>idx[l.variantId]);
      if(!lines.length) return null;
      const base = lines.reduce((n,l)=>n+l.qty*l.unit,0) || 1;
      const k = finalTotal>0? finalTotal/base : 1;
      const op = uid("op");
      const sale = { id: uid("s"), _op: op, no: ((state.sales[shopId] || [])[0] || {}).no + 1 || 201, at: Date.now(), pay: pay || "cash", status: "completed",
        sellerId: api.operatorId(shopId), requestId: id,
        lines: lines.map(l => ({ variantId:l.variantId, productId:l.productId, name:l.name, label:l.label, qty:l.qty, unit:Math.round(l.unit*k),
          cost: idx[l.variantId].v.avgCost, oversold: idx[l.variantId].v.qty < l.qty, returned: 0 })), total: finalTotal || r.total };
      up(s => {
        const withQty = mapShop(s, shopId, "catalog", l => l.map(p => ({ ...p, variants: p.variants.map(v => {
          const ln = sale.lines.find(x => x.variantId === v.id); return ln ? { ...v, qty: v.qty - ln.qty } : v; }) })));
        const withSale = { ...withQty, sales: { ...withQty.sales, [shopId]: [sale, ...(withQty.sales[shopId] || [])] },
          requests: { ...(withQty.requests||{}), [shopId]: ((withQty.requests||{})[shopId]||[]).map(x => x.id === id
            ? { ...x, status: "sold", finalTotal: finalTotal || r.total, saleId: sale.id, saleNo: sale.no, history: [...(x.history||[]), { status: "sold", at: Date.now() }] } : x) } };
        return mv(shopId, sale.lines.map(l => ({ id: uid("m"), variantId: l.variantId, productId: l.productId,
          delta: -l.qty, reason: "sale", saleId: sale.id, at: sale.at })), op)(withSale);
      });
      run(shopId, Api.post(dash(shopId) + "/requests/" + id + "/sell", { finalTotal: finalTotal || 0, pay: pay || "cash", saleId: sale.id, dropMissing: true }), op);
      return sale;
    },

    trackVisit(shopId){ Api.post("/stats/view", { shopId, kind: "shop" }).catch(()=>{}); },
    trackProduct(shopId, pid){ Api.post("/stats/view", { shopId, productId: pid, kind: "product" }).catch(()=>{}); },
    trackBio(shopId){ Api.post("/stats/view", { shopId, kind: "bio" }).catch(()=>{}); },

    // OnboardingV2: the server makes the shop (id, owner row, default branch) → its id
    async addShop(shop, settings){
      const res = await Api.post("/shops", { shop, settings });
      const id = res.shopId;
      registerShop(res.shop, []);
      try{ Api.setMe(await Api.get("/me")); }catch(e){}
      up(s => ({ ...s, currentId: id, order: [...SHOP_ORDER],
        catalog: { ...s.catalog, [id]: [] }, movements: { ...s.movements, [id]: [] }, sales: { ...s.sales, [id]: [] },
        requests: { ...(s.requests||{}), [id]: [] }, stats: { ...s.stats, [id]: { views: 0, productViews: {} } },
        settings: { ...s.settings, [id]: res.settings }, cfgs: { ...s.cfgs, [id]: res.cfg } }));
      api.loadDash(id);
      return id;
    },
    deleteShop(shopId){
      const name = api.settings(shopId).name;
      Api.del(dash(shopId) + "?confirmName=" + encodeURIComponent(name)).then(async () => {
        try{ Api.setMe(await Api.get("/me")); }catch(e){}
      }).catch(e => fail(null, e));
      up(s => {
        const drop = (o) => { const c = { ...o }; delete c[shopId]; return c; };
        const order = s.order.filter(x => x !== shopId);
        return { ...s, order, currentId: order[0] || null, catalog: drop(s.catalog), movements: drop(s.movements),
          sales: drop(s.sales), orders: drop(s.orders), reviews: drop(s.reviews), settings: drop(s.settings), cfgs: drop(s.cfgs), dash: drop(s.dash) };
      });
      const i = SHOP_ORDER.indexOf(shopId);
      if(i > -1) SHOP_ORDER.splice(i, 1);
    },
    reset(){ api.loadDash(state.currentId); },
  };
  return api;
}

// visible-to-visitors products for a shop, with derived stock state
function publicProducts(store, shopId){
  const st = store.settings(shopId);
  return store.products(shopId).filter(p => p.visible !== false)
    .map(p => ({ ...p, stock: stockState(p, st.threshold) }))
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
}

Object.assign(window, { useShopStore, publicProducts, RASTA_KEY, bootData, reconcile, loadState, saveState });
