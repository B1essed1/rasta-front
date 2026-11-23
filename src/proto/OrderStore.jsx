// ===== Order state: anonymous customer, baskets by store, conversations by id =====
// Persistence and messaging sit behind the two adapters at the top of this file.
// Replacing them with REST + WebSocket does not touch any UI component.

// ---- feature switches -------------------------------------------------------
// Online ordering (basket, checkout, order tracking, seller Orders tab) and ratings/reviews
// are switched OFF for now — they will be rewritten. Flip to true to bring the old flow back.
window.ORDERS_ON = false;
window.REVIEWS_ON = false;
window.CHAT_ON = false;      // in-app buyer ↔ shop chat (buyers write in Telegram / Instagram / phone instead)
// Basket requests: buyer fills a basket in one shop → gets a short code/link → sends it to the seller in Telegram;
// the seller sees it under Requests, agrees the price, marks it Sold (stock + sale recorded). No checkout, no payment.
window.REQUESTS_ON = true;
function requestsOn(){ return window.REQUESTS_ON !== false; }
window.requestsOn = requestsOn;
function chatOn(){ return window.CHAT_ON !== false; }
window.chatOn = chatOn;
function ordersOn(){ return window.ORDERS_ON !== false; }
function reviewsOn(){ return window.REVIEWS_ON !== false; }
window.ordersOn = ordersOn; window.reviewsOn = reviewsOn;

const ORDER_KEY = "rasta_chat_state";
const ORDER_VERSION = 1;
const CURRENCY_CODE = "UZS";

function uuid(prefix){
  const rnd = ()=> Math.random().toString(36).slice(2,10);
  return (prefix? prefix+"_" : "") + rnd() + rnd();
}

// ---- persistence adapter ---------------------------------------------------
const orderPersistence = {
  load(){
    try{
      const raw = localStorage.getItem(ORDER_KEY);
      if(raw) return orderPersistence.migrate(JSON.parse(raw));
    }catch(e){}
    return null;
  },
  save(state){
    try{ localStorage.setItem(ORDER_KEY, JSON.stringify(state)); }catch(e){}
  },
  // every future shape lands here; v1 is the first
  migrate(s){
    if(!s || typeof s!=="object") return null;
    if(s.version===ORDER_VERSION) return s;
    return null;
  },
};

// ---- messaging adapter (mock) ---------------------------------------------
// Swap for REST (send) + WebSocket (incoming) with the same three methods.
const MOCK_REPLIES = (t)=>[t.ch_reply_1, t.ch_reply_2, t.ch_reply_3];
const messagingService = {
  latency: 420,
  replyDelay: 2600,
  timers: {},
  // resolves when the shop's side has the message; rejects on failure
  send(conversationId, text){
    return new Promise((resolve, reject)=>{
      setTimeout(()=> Math.random()<0.06 ? reject(new Error("network")) : resolve({ at:Date.now() }),
        messagingService.latency);
    });
  },
  // stands in for a socket push
  onIncoming(conversationId, replyIndex, lang, cb){
    clearTimeout(messagingService.timers[conversationId]);
    messagingService.timers[conversationId] = setTimeout(()=>{
      const list = MOCK_REPLIES(I18N[lang]);
      cb({ id:uuid("m"), from:"store", text:list[replyIndex % list.length], at:Date.now(), status:"sent" });
    }, messagingService.replyDelay);
  },
  cancelAll(){ Object.values(messagingService.timers).forEach(clearTimeout); },
};

// ---- shapes ---------------------------------------------------------------
function freshOrderState(){
  return { version:ORDER_VERSION, anonymousCustomerId:uuid("customer"), account:null,
    baskets:{}, conversations:{}, placed:[] };
}
const itemIdOf = (productId, variantId)=> productId + (variantId? "|"+variantId : "");
function makeOrderItem(product, quantity){
  return {
    id: itemIdOf(product.productId, product.variantId),
    productId: product.productId,
    variantId: product.variantId || null,
    productName: product.name,
    variantLabel: product.variantLabel || null,
    image: product.image || null,
    url: product.url || null,
    unitPrice: Number(product.price) || 0,
    currency: CURRENCY_CODE,
    quantity: Math.max(1, Number(quantity)||1),
    status: "REQUESTED",
  };
}
function storeRefOf(store){
  return { id:store.id, name:store.name, handle:store.handle,
    initials:store.initials, swatch:store.swatch, type:store.type };
}

// ---- hook ----------------------------------------------------------------
// soleVariantOf(productId) -> variantId when the product has exactly one sellable variant
// stockOf(productId, variantId) -> { qty, exists } from the catalog, injected by the caller
// the server's Me → the account shape the buyer screens read
function acctFromMe(me){
  if(!me || !me.account) return null;
  const a = me.account;
  return { phone:a.phone, name:a.name||"", tg:a.tg||"", notif:a.notif!==false, mySize:a.mySize||null,
    favShops:a.favShops||[], addresses:a.addresses||[], createdAt:a.createdAt, verifiedAt:Date.now() };
}
function useOrderStore(lang, stockOf, soleVariantOf){
  // baskets stay on this device (guest, no login); the account always comes from the session
  const [state, setState] = React.useState(()=>{ const s = orderPersistence.load() || freshOrderState(); return { ...s, account: acctFromMe(Api.me) }; });
  // Baskets are shared by every tab of this browser. Each tab used to write its own copy over the others, so a
  // basket filled in one tab vanished when another tab changed anything. Now a tab takes the other tabs' writes
  // (the "storage" event) before its next change, and does not write back what it just received.
  const fromOtherTab = React.useRef(false);
  React.useEffect(()=>{
    if(fromOtherTab.current){ fromOtherTab.current = false; return; }
    orderPersistence.save({ ...state, account:null });
  }, [state]);
  React.useEffect(()=>{
    const onStorage = (e)=>{
      if(e.key !== ORDER_KEY) return;
      let next = null;
      try{ next = e.newValue ? orderPersistence.migrate(JSON.parse(e.newValue)) : null; }catch(err){}
      fromOtherTab.current = true;
      setState(s => next ? { ...s, baskets: next.baskets || {}, conversations: next.conversations || s.conversations, placed: next.placed || s.placed }
                         : { ...s, baskets: {} });
    };
    addEventListener("storage", onStorage);
    return ()=> removeEventListener("storage", onStorage);
  }, []);
  React.useEffect(()=> Api.onAuth(me => setState(s => ({ ...s, account: acctFromMe(me) }))), []);
  // the server's answer is the truth; on an error the account is reloaded
  const meWrite = (p)=> p.then(me => { if(me && me.account) Api.setMe(me); })
    .catch(e => { toast(Api.errorText(e), "err"); Api.get("/me").then(me => Api.setMe(me)).catch(()=>{}); });
  React.useEffect(()=> ()=> messagingService.cancelAll(), []);
  const activeRef = React.useRef(null);       // conversation the CUSTOMER is viewing
  const sellerActiveRef = React.useRef(null); // conversation the SELLER is viewing
  const stock = stockOf || (()=>({ qty:Infinity, exists:true }));

  // Baskets hold live intent, so a retired variant is dropped. Conversation items are
  // historical snapshots and are kept — they render from their own stored fields.
  const sole = soleVariantOf || (()=>null);
  React.useEffect(()=>{
    setState(s=>{
      let changed = false;
      const baskets = {};
      Object.keys(s.baskets).forEach(sid=>{
        const b = s.baskets[sid];
        const merged = [];
        b.items.forEach(it=>{
          // a line written before the sole variant was addressable is the same unit
          let line = it;
          if(!it.variantId){
            const vid = sole(it.productId);
            if(vid){ line = { ...it, variantId:vid, id:itemIdOf(it.productId, vid) }; changed = true; }
          }
          if(line.variantId && !stock(line.productId, line.variantId).exists){ changed = true; return; }
          const at = merged.findIndex(x=>x.id===line.id);
          if(at>=0){ merged[at] = { ...merged[at], quantity:merged[at].quantity+line.quantity }; changed = true; }
          else merged.push(line);
        });
        if(merged.length) baskets[sid] = { ...b, items:merged };
        else if(b.items.length) changed = true;
      });
      return changed? { ...s, baskets } : s;
    });
  },[]);

  const patch = (fn)=> setState(s=> fn(s) || s);
  function withConversation(conversationId, fn){
    patch(s=>{
      const c = s.conversations[conversationId]; if(!c) return s;
      const next = fn(c); if(!next) return s;
      return { ...s, conversations:{ ...s.conversations, [conversationId]:{ ...next, updatedAt:Date.now() } } };
    });
  }
  function findConversationForStore(s, storeId){
    const ids = Object.keys(s.conversations);
    for(const id of ids){
      const c = s.conversations[id];
      if(c.store.id===storeId && c.status==="OPEN") return c;
    }
    return null;
  }

  const api = {
    state,
    customerId: state.anonymousCustomerId,
    currency: CURRENCY_CODE,
    setActive(conversationId){ activeRef.current = conversationId; },

    // ---------- basket ----------
    baskets(){
      return Object.keys(state.baskets).map(id=>state.baskets[id])
        .filter(b=>b && b.items.length)
        .sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
    },
    basket(storeId){ return state.baskets[storeId] || null; },
    basketCount(){ return api.baskets().reduce((n,b)=>n+b.items.reduce((m,x)=>m+x.quantity,0), 0); },
    basketSubtotal(storeId){
      const b = state.baskets[storeId];
      return b? b.items.reduce((n,x)=>n+x.unitPrice*x.quantity, 0) : 0;
    },
    inBasket(storeId, key){
      const b = state.baskets[storeId];
      return !!(b && b.items.some(x=>x.id===key));
    },
    // stock is never decremented here — this is intent, not a reservation
    addToBasket(store, product){
      const storeId = store.id;
      const add = Math.max(1, Number(product.addQty)||1);
      const incoming = makeOrderItem(product, add);
      patch(s=>{
        const cur = s.baskets[storeId] || { storeId, store:storeRefOf(store), items:[], createdAt:Date.now() };
        const i = cur.items.findIndex(x=>x.id===incoming.id);
        const items = i>=0
          ? cur.items.map((x,k)=> k===i? { ...x, quantity:x.quantity+add } : x)   // merge, never duplicate
          : [...cur.items, incoming];
        return { ...s, baskets:{ ...s.baskets, [storeId]:{ ...cur, store:storeRefOf(store), items, updatedAt:Date.now() } } };
      });
    },
    setBasketQty(storeId, itemId, quantity){
      patch(s=>{
        const cur = s.baskets[storeId]; if(!cur) return s;
        const items = quantity<=0 ? cur.items.filter(x=>x.id!==itemId)
                                  : cur.items.map(x=> x.id===itemId? { ...x, quantity } : x);
        const baskets = { ...s.baskets };
        if(items.length) baskets[storeId] = { ...cur, items, updatedAt:Date.now() };
        else delete baskets[storeId];
        return { ...s, baskets };
      });
    },
    removeBasketItem(storeId, itemId){ api.setBasketQty(storeId, itemId, 0); },
    clearBasket(storeId){
      patch(s=>{ const b = { ...s.baskets }; delete b[storeId]; return { ...s, baskets:b }; });
    },
    // requested quantity vs what the catalog can actually supply right now
    basketIssues(storeId){
      const b = state.baskets[storeId];
      if(!b) return [];
      return b.items.map(it=>{
        const s = stock(it.productId, it.variantId);
        if(!s.exists) return { item:it, kind:"gone", available:0 };
        if(s.qty < it.quantity) return { item:it, kind:"short", available:Math.max(0, s.qty) };
        return null;
      }).filter(Boolean);
    },

    // ---------- account (server: /me) ----------
    // The Telegram phone IS the account. Name, favourites, addresses and "my size" live on the server
    // (decision D9), so they follow the person to any device. Writes show at once, then the server's answer wins.
    account(){ return state.account || null; },
    signedIn(){ return !!(state.account && state.account.phone); },
    // called after AuthFlow, when the session already exists
    signIn(){ const me = Api.me; if(me) patch(s=>({ ...s, account: acctFromMe(me) })); },
    signOut(){ Api.logout(); patch(s=>({ ...s, account:null })); },
    setAccountName(name){
      if(!state.account || (state.account.name||"") === name) return;
      patch(s=> s.account? { ...s, account:{ ...s.account, name } } : s);
      meWrite(Api.patch("/me", { name }));
    },
    // favourites belong to the logged-in account; a guest has none and must log in first
    favShops(){ return state.account? (state.account.favShops || []) : []; },
    isFav(id){ return api.favShops().includes(id); },
    toggleFav(id){
      if(!state.account) return null;               // caller shows the login sheet
      const on = !api.favShops().includes(id);
      patch(s=>{ if(!s.account) return s; const f = (s.account.favShops || []).filter(x=>x!==id);
        return { ...s, account:{ ...s.account, favShops: on? [id, ...f] : f } }; });
      meWrite(on ? Api.put("/me/saved-shops/" + encodeURIComponent(id)) : Api.del("/me/saved-shops/" + encodeURIComponent(id)));
      return on;
    },
    setAccountMeta(p){
      patch(s=> s.account? { ...s, account:{ ...s.account, ...p } } : s);
      const body = {};
      if("notif" in p) body.notif = !!p.notif;
      if("mySize" in p) body.mySize = p.mySize;
      if(Object.keys(body).length) meWrite(Api.patch("/me", body));   // tg comes from Telegram, never from the client
    },
    addAddress(entry){
      if(!state.account) return;
      const addr = { id:uuid("addr"), label:entry.label||"", text:entry.text,
        isDefault: entry.isDefault || (state.account.addresses||[]).length===0 };
      patch(s=>{
        if(!s.account) return s;
        const list = s.account.addresses || [];
        const next = addr.isDefault? list.map(a=>({ ...a, isDefault:false })) : list;
        return { ...s, account:{ ...s.account, addresses:[...next, addr] } };
      });
      meWrite(Api.post("/me/addresses", addr));
    },
    removeAddress(id){
      patch(s=>{
        if(!s.account) return s;
        const list = (s.account.addresses||[]).filter(a=>a.id!==id);
        if(list.length && !list.some(a=>a.isDefault)) list[0] = { ...list[0], isDefault:true };
        return { ...s, account:{ ...s.account, addresses:list } };
      });
      meWrite(Api.del("/me/addresses/" + encodeURIComponent(id)));
    },
    setDefaultAddress(id){
      patch(s=> s.account? { ...s, account:{ ...s.account,
        addresses:(s.account.addresses||[]).map(a=>({ ...a, isDefault:a.id===id })) } } : s);
      meWrite(Api.post("/me/addresses/" + encodeURIComponent(id) + "/default"));
    },
    defaultAddress(){
      const a = state.account;
      if(!a) return null;
      return (a.addresses||[]).find(x=>x.isDefault) || (a.addresses||[])[0] || null;
    },

    // ---------- placed requests (the customer's copy of an order) ----------
    placed(){ return (state.placed || []).slice().sort((a,b)=>b.at-a.at); },
    placedFor(shopId){ return (state.placed || []).filter(x=>x.shopId===shopId); },
    // a request was accepted by the shop's store: keep the customer's reference and open the thread
    attachOrder(shopId, order, storeRef){
      const r = api.orderThroughChat(shopId);
      patch(s=>({ ...s, placed:[...(s.placed||[]), { shopId, orderId:order.id, no:order.no, at:order.at,
        conversationId: r? r.conversationId : null, store:storeRef }] }));
      return r;
    },

    // ---------- conversations ----------
    // a plain chat with a shop — no basket, no order items (used while online ordering is off)
    startChat(store){
      const existing = findConversationForStore(state, store.id);
      if(existing) return existing.id;
      const id = uuid("conv"), now = Date.now();
      setState(s=>({ ...s, conversations:{ ...s.conversations, [id]:{ id, anonymousCustomerId:s.anonymousCustomerId, store,
        status:"OPEN", orderItems:[], messages:[], unreadCount:0, createdAt:now, updatedAt:now } } }));
      return id;
    },
    conversations(){
      return Object.keys(state.conversations).map(id=>state.conversations[id])
        .sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
    },
    conversation(conversationId){ return state.conversations[conversationId] || null; },
    conversationForStore(storeId){ return findConversationForStore(state, storeId); },
    unreadTotal(){ return api.conversations().reduce((n,c)=>n+(c.unreadCount||0), 0); },
    orderTotal(c){ return (c.orderItems||[]).reduce((n,x)=>n+x.unitPrice*x.quantity, 0); },
    orderCount(c){ return (c.orderItems||[]).reduce((n,x)=>n+x.quantity, 0); },

    // one active conversation per anonymous customer + store, reused forever
    orderThroughChat(storeId){
      const b = state.baskets[storeId];
      if(!b || !b.items.length) return null;
      const existing = findConversationForStore(state, storeId);
      const conversationId = existing? existing.id : uuid("conv");
      const now = Date.now();
      const message = { id:uuid("m"), from:"customer", text:I18N[lang].ch_first_msg, at:now, status:"sent" };
      setState(s=>{
        const prev = s.conversations[conversationId] || {
          id:conversationId, anonymousCustomerId:s.anonymousCustomerId, store:b.store,
          status:"OPEN", orderItems:[], messages:[], unreadCount:0, createdAt:now,
        };
        const orderItems = [...prev.orderItems];
        b.items.forEach(it=>{
          const i = orderItems.findIndex(x=>x.id===it.id);
          if(i>=0) orderItems[i] = { ...orderItems[i], quantity:orderItems[i].quantity+it.quantity };
          else orderItems.push({ ...it });
        });
        const baskets = { ...s.baskets };
        delete baskets[storeId];                                  // only this store's basket
        return { ...s, baskets, conversations:{ ...s.conversations, [conversationId]:{
          ...prev, store:b.store, orderItems, messages:[...prev.messages, message],
          sellerUnread:(prev.sellerUnread||0)+1, updatedAt:now } } };
      });
      api.receiveReply(conversationId);
      return { conversationId, created: !existing };
    },
    setOrderQty(conversationId, itemId, quantity){
      withConversation(conversationId, c=>({ ...c, orderItems: quantity<=0
        ? c.orderItems.filter(x=>x.id!==itemId)
        : c.orderItems.map(x=> x.id===itemId? { ...x, quantity, status:"CHANGED" } : x) }));
    },
    removeOrderItem(conversationId, itemId){ api.setOrderQty(conversationId, itemId, 0); },
    clearOrderItems(conversationId){ withConversation(conversationId, c=>({ ...c, orderItems:[] })); },

    // ---------- messages ----------
    sendMessage(conversationId, text){
      const body = String(text||"").trim(); if(!body) return;
      const msg = { id:uuid("m"), from:"customer", text:body, at:Date.now(), status:"sending" };
      withConversation(conversationId, c=>({ ...c, messages:[...c.messages, msg],
        sellerUnread: sellerActiveRef.current===conversationId? 0 : (c.sellerUnread||0)+1 }));
      messagingService.send(conversationId, body)
        .then(()=>{
          api.setMessageStatus(conversationId, msg.id, "sent");
          api.receiveReply(conversationId);
        })
        .catch(()=> api.setMessageStatus(conversationId, msg.id, "failed"));
    },
    retryMessage(conversationId, messageId){
      const c = state.conversations[conversationId]; if(!c) return;
      const m = c.messages.find(x=>x.id===messageId); if(!m) return;
      api.setMessageStatus(conversationId, messageId, "sending");
      messagingService.send(conversationId, m.text)
        .then(()=>{ api.setMessageStatus(conversationId, messageId, "sent"); api.receiveReply(conversationId); })
        .catch(()=> api.setMessageStatus(conversationId, messageId, "failed"));
    },
    setMessageStatus(conversationId, messageId, status){
      withConversation(conversationId, c=>({ ...c,
        messages:c.messages.map(m=> m.id===messageId? { ...m, status } : m) }));
    },
    receiveReply(conversationId){
      const c = state.conversations[conversationId];
      const n = c? c.messages.filter(m=>m.from==="store").length : 0;
      messagingService.onIncoming(conversationId, n, lang, (msg)=>{
        setState(s=>{
          const conv = s.conversations[conversationId]; if(!conv) return s;
          const looking = activeRef.current === conversationId;
          return { ...s, conversations:{ ...s.conversations, [conversationId]:{ ...conv,
            messages:[...conv.messages, msg],
            unreadCount: looking? 0 : (conv.unreadCount||0)+1, updatedAt:Date.now() } } };
        });
      });
    },
    // ---- seller side: the same conversations, seen from the shop ----
    setSellerActive(conversationId){ sellerActiveRef.current = conversationId; },
    conversationsForStore(storeId){
      return api.conversations().filter(c=>c.store.id===storeId);
    },
    sellerUnreadFor(storeId){
      return api.conversationsForStore(storeId).reduce((n,c)=>n+(c.sellerUnread||0),0);
    },
    markSellerRead(conversationId){
      clearTimeout(messagingService.timers[conversationId]); // a human is here; the canned reply stands down
      patch(s=>{
        const c = s.conversations[conversationId];
        if(!c || !c.sellerUnread) return s;
        return { ...s, conversations:{ ...s.conversations, [conversationId]:{ ...c, sellerUnread:0 } } };
      });
    },
    sendStoreMessage(conversationId, text){
      const body = String(text||"").trim(); if(!body) return;
      clearTimeout(messagingService.timers[conversationId]);
      const msg = { id:uuid("m"), from:"store", text:body, at:Date.now(), status:"sent" };
      setState(s=>{
        const c = s.conversations[conversationId]; if(!c) return s;
        const looking = activeRef.current === conversationId;
        return { ...s, conversations:{ ...s.conversations, [conversationId]:{ ...c,
          messages:[...c.messages, msg], unreadCount: looking? 0 : (c.unreadCount||0)+1, updatedAt:Date.now() } } };
      });
    },
    markRead(conversationId){
      patch(s=>{
        const c = s.conversations[conversationId];
        if(!c || !c.unreadCount) return s;
        return { ...s, conversations:{ ...s.conversations, [conversationId]:{ ...c, unreadCount:0 } } };
      });
    },
    reset(){ localStorage.removeItem(ORDER_KEY); setState(freshOrderState()); },
  };
  return api;
}

Object.assign(window, { useOrderStore, orderPersistence, messagingService, freshOrderState,
  makeOrderItem, itemIdOf, uuid, ORDER_KEY, ORDER_VERSION, CURRENCY_CODE });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { requestsOn, chatOn, ordersOn, reviewsOn, ORDER_KEY, ORDER_VERSION, CURRENCY_CODE, uuid, orderPersistence, MOCK_REPLIES, messagingService, freshOrderState, itemIdOf, makeOrderItem, storeRefOf, useOrderStore });
