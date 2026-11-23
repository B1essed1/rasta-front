// ===== Order dock: My order (baskets) + Messages (conversations) =====
function ChatAvatar({ store }){
  const s = store || {};
  return (
    <div className="cw-av" style={{"--ph-tone":s.swatch||"#cdbfa8"}}>
      <span>{s.initials||(s.name||"?").slice(0,2).toUpperCase()}</span>
    </div>
  );
}

function chatTime(ts, lang){
  const d = new Date(ts);
  if(Date.now()-ts < 60000) return I18N[lang].ch_now;
  return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
}

// one line, in a basket or in a sent order
function OrderLine({ it, t, lang, onOpen, onQty, onRemove, issue }){
  return (
    <div className={"cw-item"+(issue?" has-issue":"")}>
      <button className="cw-item-ph" onClick={()=>onOpen&&onOpen(it)} title={t.ch_view_product}
        style={it.image? { backgroundImage:"url("+it.image+")" } : undefined}></button>
      <div className="cw-item-m">
        <button className="cw-item-n" onClick={()=>onOpen&&onOpen(it)}>{it.productName}</button>
        <div>
          {it.variantLabel && <span className="cw-item-v">{it.variantLabel}</span>}
          <span className="cw-item-p">{fmtPrice(it.unitPrice, lang)}</span>
        </div>
        {issue && issue.kind==="short" && (
          <span className="cw-item-warn">{fill(t.ord_short_l,{ a:issue.available, b:it.quantity })}</span>
        )}
        {issue && issue.kind==="gone" && <span className="cw-item-warn">{t.ord_gone}</span>}
      </div>
      {onQty && (
        <div className="cw-item-q">
          <button onClick={()=>onQty(it.id, it.quantity-1)} aria-label="−">{I.minus({width:13,height:13})}</button>
          <b>{it.quantity}</b>
          <button onClick={()=>onQty(it.id, it.quantity+1)} aria-label="+">{I.plus({width:13,height:13})}</button>
        </div>
      )}
      {onRemove && <button className="cw-item-x" onClick={()=>onRemove(it.id)} aria-label={t.ch_remove}>{I.x({width:14,height:14})}</button>}
    </div>
  );
}

function StoreBasketCard({ orderStore, basket, t, lang, onOpenProduct, onCheckout }){
  const issues = orderStore.basketIssues(basket.storeId);
  const issueFor = (id)=> issues.find(x=>x.item.id===id) || null;
  const subtotal = orderStore.basketSubtotal(basket.storeId);
  const n = basket.items.reduce((m,x)=>m+x.quantity, 0);
  const blocked = issues.length>0;
  return (
    <div className="cw-group">
      <div className="cw-group-h">
        <ChatAvatar store={basket.store}/>
        <div className="cw-group-id"><b>{basket.store.name}</b><span>{n===1? t.ch_item_1 : fill(t.ch_items_n,{n})}</span></div>
        <button className="cw-clear" onClick={()=>orderStore.clearBasket(basket.storeId)}>{t.bk_clear}</button>
      </div>
      {basket.items.map(it=>(
        <OrderLine key={it.id} it={it} t={t} lang={lang} onOpen={onOpenProduct} issue={issueFor(it.id)}
          onQty={(id,q)=>orderStore.setBasketQty(basket.storeId,id,q)}
          onRemove={(id)=>orderStore.removeBasketItem(basket.storeId,id)}/>
      ))}
      {blocked && (
        <div className="cw-issue">
          {I.warn({width:15,height:15})}
          <div>
            <b>{t.ord_short_t}</b>
            {issues.map(is=>(
              <button key={is.item.id} className="cw-issue-fix"
                onClick={()=>orderStore.setBasketQty(basket.storeId, is.item.id, is.available)}>
                {is.available>0? fill(t.ord_fix,{n:is.available}) : t.ch_remove}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="cw-group-f"><span>{t.bk_subtotal}</span><b>{fmtPrice(subtotal, lang)}</b></div>
      <button className="cw-send" disabled={blocked} onClick={()=>onCheckout(basket)}>
        {I.bag({width:16,height:16})} {t.bk_order}</button>
    </div>
  );
}

function MyOrderPanel({ orderStore, t, lang, onOpenProduct, onCheckout, onClose }){
  const baskets = orderStore.baskets();
  return (
    <>
      <div className="cw-head">
        <div className="cw-head-id"><b>{t.bk_my_order}</b><span>{t.bk_grouped}</span></div>
        <button className="cw-x" onClick={onClose} aria-label={t.g_close}>{I.x({width:17,height:17})}</button>
      </div>
      {baskets.length===0 ? (
        <div className="cw-empty">
          <div className="cw-empty-ic">{I.bag({width:24,height:24})}</div>
          <b>{t.bk_empty_t2}</b>
          <p>{t.bk_empty_d2}</p>
        </div>
      ) : (
        <div className="cw-list scroll-y">
          <div className="cw-steps"><span>{t.bk_step1}</span><span>{t.bk_step2}</span><span>{t.bk_step3}</span></div>
          {baskets.map(b=>(
            <StoreBasketCard key={b.storeId} orderStore={orderStore} basket={b} t={t} lang={lang}
              onOpenProduct={onOpenProduct} onCheckout={onCheckout}/>
          ))}
        </div>
      )}
    </>
  );
}

function ConversationList({ conversations, orderStore, t, lang, onOpen, onClose }){
  return (
    <>
      <div className="cw-head">
        <div className="cw-head-id"><b>{t.bk_msgs}</b><span>{t.ch_title}</span></div>
        <button className="cw-x" onClick={onClose} aria-label={t.g_close}>{I.x({width:17,height:17})}</button>
      </div>
      {conversations.length===0 ? (
        <div className="cw-empty">
          <div className="cw-empty-ic">{I.chat({width:24,height:24})}</div>
          <b>{t.ch_empty_t2}</b>
          <p>{t.ch_empty_d2}</p>
        </div>
      ) : (
        <div className="cw-list scroll-y">
          {conversations.map(c=>{
            const n = orderStore.orderCount(c);
            const last = c.messages[c.messages.length-1];
            return (
              <button key={c.id} className="cw-row" onClick={()=>onOpen(c.id)}>
                <ChatAvatar store={c.store}/>
                <div className="cw-row-m">
                  <div className="cw-row-t"><b>{c.store.name}</b>
                    <span>{n===0? "" : n===1? t.ch_product_1 : fill(t.ch_products_n,{n})}</span></div>
                  {last && <div className="cw-row-l">{last.from==="customer" && <b>{t.ch_you}: </b>}{last.text}</div>}
                </div>
                {c.unreadCount>0 && <span className="cw-badge">{c.unreadCount}</span>}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

function ChatPanelView({ conversation, orderStore, t, lang, onBack, onClose, onOpenProduct, initialDraft }){
  const [draft, setDraft] = React.useState(initialDraft || "");
  const feed = React.useRef(null);
  const c = conversation;
  React.useEffect(()=>{ if(feed.current) feed.current.scrollTop = feed.current.scrollHeight; },
    [c.messages.length, c.orderItems.length, c.messages.map(m=>m.status).join()]);
  const total = orderStore.orderTotal(c), n = orderStore.orderCount(c);
  function send(){ if(!draft.trim()) return; orderStore.sendMessage(c.id, draft); setDraft(""); }
  return (
    <>
      <div className="cw-head">
        <button className="cw-back" onClick={onBack} aria-label={t.g_back}>{I.back({width:17,height:17})}</button>
        <ChatAvatar store={c.store}/>
        <div className="cw-head-id"><b>{c.store.name}</b><span>@{c.store.handle}</span></div>
        <button className="cw-x" onClick={onClose} aria-label={t.g_close}>{I.x({width:17,height:17})}</button>
      </div>

      <div className="cw-feed scroll-y" ref={feed}>
        {!ordersOn() ? null : c.orderItems.length>0 ? (
          <div className="cw-order">
            <div className="cw-order-h">
              <span>{t.ch_your_order}</span>
              <button className="cw-clear" onClick={()=>orderStore.clearOrderItems(c.id)}>{t.ch_clear}</button>
            </div>
            {c.orderItems.map(it=>(
              <OrderLine key={it.id} it={it} t={t} lang={lang} onOpen={onOpenProduct}
                onQty={(id,q)=>orderStore.setOrderQty(c.id,id,q)}
                onRemove={(id)=>orderStore.removeOrderItem(c.id,id)}/>
            ))}
            <div className="cw-order-f">
              <span>{n===1? t.ch_item_1 : fill(t.ch_items_n,{n})}</span>
              <b>{t.ch_total}: {fmtPrice(total, lang)}</b>
            </div>
          </div>
        ) : (
          <div className="cw-order empty">
            <b>{t.ord_empty_t}</b>
            <p>{t.ord_empty_d}</p>
          </div>
        )}

        {c.messages.map(m=>(
          <div key={m.id} className={"cw-msg "+m.from+(m.status==="failed"?" failed":"")}>
            <span>{m.text}</span>
            {m.status==="sending"
              ? <i>{t.msg_sending}</i>
              : m.status==="failed"
                ? <i className="cw-fail">{t.msg_failed} · <button onClick={()=>orderStore.retryMessage(c.id,m.id)}>{t.msg_retry}</button></i>
                : <i>{chatTime(m.at, lang)}</i>}
          </div>
        ))}
      </div>

      <form className="cw-input" onSubmit={e=>{ e.preventDefault(); send(); }}>
        <input value={draft} onChange={e=>setDraft(e.target.value)} placeholder={t.ch_input} aria-label={t.ch_input}/>
        <button type="submit" disabled={!draft.trim()} aria-label={t.ch_send}>{I.arrow({width:18,height:18})}</button>
      </form>
    </>
  );
}

function OrderDock({ orderStore, lang, onOpenProduct, onCheckout, onTrack, onAccount }){
  const t = I18N[lang];
  const [open, setOpen] = React.useState(null);            // null | "basket" | "messages"
  const [activeId, setActiveId] = React.useState(null);    // conversationId
  const conversations = orderStore.conversations();
  const unread = orderStore.unreadTotal();
  const count = orderStore.basketCount();
  const conversation = activeId? orderStore.conversation(activeId) : null;
  const [draft0, setDraft0] = React.useState("");
  // "Write to the shop" from a product: open (or start) the chat with that shop, message pre-filled
  React.useEffect(()=>{
    function onChat(e){ const d = e.detail || {}; if(!d.store) return; const id = orderStore.startChat(d.store);
      setDraft0(d.draft || ""); setActiveId(id); setOpen("messages"); }
    window.addEventListener("rasta-open-chat", onChat);
    return ()=> window.removeEventListener("rasta-open-chat", onChat);
  }, [orderStore]);

  React.useEffect(()=>{ orderStore.setActive(open==="messages"? activeId : null); }, [open, activeId]);
  React.useEffect(()=>{
    function onOpen(){ setActiveId(null); setOpen("basket"); }
    window.addEventListener("rasta-open-basket", onOpen);
    return ()=> window.removeEventListener("rasta-open-basket", onOpen);
  },[]);
  React.useEffect(()=>{ if(open==="messages" && activeId) orderStore.markRead(activeId); },
    [open, activeId, conversation? conversation.unreadCount : 0]);

  return (
    <>
      <div className="cw-dock">
        {conversations.length>0 && (
          <button className={"cw-fab chat"+(open==="messages"?" on":"")} aria-label={t.bk_msgs}
            onClick={()=>setOpen(o=> o==="messages"? null : "messages")}>
            {I.chat({width:20,height:20})}
            <span className="cw-fab-lab">{t.bk_msgs}</span>
            {unread>0 && <span className="cw-fab-badge">{unread}</span>}
          </button>
        )}
      </div>
      {open==="messages" && (
        <div className="cw-panel">
          {conversation
            ? <ChatPanelView key={conversation.id+"|"+draft0} initialDraft={draft0} conversation={conversation} orderStore={orderStore} t={t} lang={lang}
                onBack={()=>{ setActiveId(null); setDraft0(""); }} onClose={()=>setOpen(null)} onOpenProduct={onOpenProduct}/>
            : <ConversationList conversations={conversations} orderStore={orderStore} t={t} lang={lang}
                onOpen={setActiveId} onClose={()=>setOpen(null)}/>}
        </div>
      )}
    </>
  );
}

addI18N({
  ct_chat: ["Write to the shop", "Написать магазину", "Do‘konga yozish"],
  ct_call: ["Call", "Позвонить", "Qo‘ng‘iroq"],
  ct_copied_note: ["The product link is copied — paste it in Telegram.", "Ссылка на товар скопируется — вставьте её в Telegram.", "Mahsulot havolasi nusxalanadi — Telegramga joylang."],
  ct_hi:   ["Hi! I'm interested in: {p}", "Здравствуйте! Интересует: {p}", "Salom! Menga shu qiziq: {p}"],
  ct_note: ["Ask the shop about price, size and how to get it — you agree directly with the seller.", "Спросите магазин о цене, размере и получении — договариваетесь напрямую с продавцом.", "Narx, o‘lcham va qanday olish haqida do‘kondan so‘rang — sotuvchi bilan to‘g‘ridan-to‘g‘ri kelishasiz."],
});
// While online ordering is off, products show this instead of the Order button:
// chat with the shop in the app (message pre-filled with the product), or Telegram / Instagram / phone.
function ContactShop({ shop, store, product, t }){
  const c = shop.contacts || {};
  const what = product? product.name+(product.variantLabel? " ("+product.variantLabel+")" : "")+(product.url? " — "+product.url : "") : "";
  const draft = product? fill(t.ct_hi,{p:what}) : "";
  const stop = (e)=> e.stopPropagation();
  const openChat = (e)=>{ stop(e); window.dispatchEvent(new CustomEvent("rasta-open-chat", { detail:{ store, draft } })); };
  // most buyers prefer Telegram (53%), so it is the main button; the in-app chat is the fallback
  const tgFirst = !!c.telegram;
  return (
    <div className="ct-box" style={{display:"grid", gap:10, margin:"18px 0 6px"}}>
      {tgFirst
        ? <a className="sf-btn sf-btn-accent" style={{justifyContent:"center", textDecoration:"none"}} href={"https://t.me/"+c.telegram} target="_blank" rel="noreferrer"
            onClick={(e)=>{ stop(e); try{ navigator.clipboard && navigator.clipboard.writeText(draft); }catch(x){} }}>{I.tg({width:17,height:17})} {t.sfh_write_tg || "Telegram"}</a>
        : chatOn()? <button className="sf-btn sf-btn-accent" style={{justifyContent:"center"}} onClick={openChat}>{I.chat({width:17,height:17})} {t.ct_chat}</button> : null}
      <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
        {tgFirst && chatOn() && <button className="sf-btn sf-btn-line" style={{flex:1, justifyContent:"center"}} onClick={openChat}>{I.chat({width:16,height:16})} {t.ct_chat}</button>}
        {c.instagram && <a className="sf-btn sf-btn-line" style={{flex:1, justifyContent:"center", textDecoration:"none"}} href={"https://instagram.com/"+c.instagram} target="_blank" rel="noreferrer" onClick={stop}>Instagram</a>}
        {c.phone && <a className="sf-btn sf-btn-line" style={{flex:1, justifyContent:"center", textDecoration:"none"}} href={"tel:"+String(c.phone).replace(/[^\d+]/g,"")} onClick={stop}>{I.phone({width:16,height:16})} {t.ct_call}</a>}
      </div>
      <p style={{margin:0, fontSize:13, color:"var(--s-soft, var(--soft))"}}>{tgFirst? t.ct_copied_note+" " : ""}{t.ct_note}</p>
    </div>
  );
}

// Product CTA: collects into this store's basket. Never navigates, never touches stock.
function OrderButton({ store, product, chatStore, t, lang, className, label, needsPick, onNeedPick, blocked }){
  const key = product? itemIdOf(product.productId, product.variantId) : null;
  const inBasket = key && chatStore.inBasket(store.id, key);
  if(needsPick){
    return (
      <button className={className||"sf-btn sf-btn-accent"} onClick={(e)=>{ e.stopPropagation(); onNeedPick&&onNeedPick(); }}>
        {I.bag({width:17,height:17})} {t.ch_pick_open}
      </button>
    );
  }
  return (
    <button className={(className||"sf-btn sf-btn-accent")+(inBasket?" is-in":"")} disabled={blocked} onClick={(e)=>{
      e.stopPropagation();
      if(blocked) return;
      window.dispatchEvent(new CustomEvent("rasta-order", { detail:{ store, product, inBasket } }));
    }}>
      {inBasket? I.bag({width:17,height:17}) : I.bag({width:17,height:17})}
      {inBasket? t.bk_go : (label || (ordersOn()? t.bk_add : t.rq_add))}
    </button>
  );
}

// ===== seller side: the shop's inbox in the dashboard =====
function SellerChats({ orderStore, shop, t, lang }){
  const list = orderStore.conversationsForStore(shop.id);
  const [active, setActive] = React.useState(list[0]? list[0].id : null);
  const [draft, setDraft] = React.useState("");
  const [showOrder, setShowOrder] = React.useState(false);
  const feed = React.useRef(null);
  const conv = active? orderStore.conversation(active) : null;
  React.useEffect(()=>{ setShowOrder(false); },[active]);
  React.useEffect(()=>{ orderStore.setSellerActive(active); if(active) orderStore.markSellerRead(active);
    return ()=>orderStore.setSellerActive(null); },[active]);
  React.useEffect(()=>{ if(active) orderStore.markSellerRead(active); },[conv && conv.messages.length]);
  React.useEffect(()=>{ if(feed.current) feed.current.scrollTop = feed.current.scrollHeight; },
    [conv && conv.messages.length, active]);
  function send(){ if(!draft.trim() || !active) return; orderStore.sendStoreMessage(active, draft); setDraft(""); }

  if(!list.length){
    return <EmptyState icon={I.chat} title={t.sch_empty_t} body={t.sch_empty_d}/>;
  }
  const total = conv? orderStore.orderTotal(conv) : 0;
  const n = conv? orderStore.orderCount(conv) : 0;
  return (
    <div className="schat-wrap">
      <div className="db-sec-head">
        <div><h2>{t.db_chats}</h2><div className="sub">{t.sch_sub}</div></div>
      </div>
      <div className="schat">
        <div className="schat-list scroll-y">
          {list.map(c=>{
            const last = c.messages[c.messages.length-1];
            return (
              <button key={c.id} className={"cw-row"+(active===c.id?" sel":"")} onClick={()=>setActive(c.id)}>
                <div className="schat-av">{I.phone({width:16,height:16})}</div>
                <div className="cw-row-m">
                  <div className="cw-row-t"><b>{t.sch_customer}</b>
                    <span>{orderStore.orderCount(c)? fill(t.ch_items_n,{n:orderStore.orderCount(c)}) : ""}</span></div>
                  {last && <div className="cw-row-l">{last.from==="store" && <b>{t.sch_you}: </b>}{last.text}</div>}
                </div>
                {(c.sellerUnread||0)>0 && <span className="cw-badge">{c.sellerUnread}</span>}
              </button>
            );
          })}
        </div>
        {conv ? (
          <div className="schat-room">
            {ordersOn() && conv.orderItems.length>0 && (
              <div className={"cw-order schat-order"+(showOrder?"":" collapsed")}>
                <button className="cw-order-h schat-order-t" onClick={()=>setShowOrder(v=>!v)}>
                  <span>{t.sch_order_block}</span>
                  <b>{n===1? t.ch_item_1 : fill(t.ch_items_n,{n})} · {fmtPrice(total, lang)}</b>
                  <i>{showOrder? I.minus({width:14,height:14}) : I.plus({width:14,height:14})}</i>
                </button>
                {showOrder && <>
                {conv.orderItems.map(it=>(
                  <div key={it.id} className="cw-item">
                    <span className="cw-item-ph" style={it.image? { backgroundImage:"url("+it.image+")" } : undefined}></span>
                    <div className="cw-item-m">
                      <span className="cw-item-n" style={{cursor:"default"}}>{it.productName}</span>
                      <div>
                        {it.variantLabel && <span className="cw-item-v">{it.variantLabel}</span>}
                        <span className="cw-item-p">{it.quantity} × {fmtPrice(it.unitPrice, lang)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="cw-order-f">
                  <span>{n===1? t.ch_item_1 : fill(t.ch_items_n,{n})}</span>
                  <b>{t.ch_total}: {fmtPrice(total, lang)}</b>
                </div>
                </>}
              </div>
            )}
            <div className="cw-feed flip scroll-y" ref={feed}>
              {conv.messages.map(m=>(
                <div key={m.id} className={"cw-msg "+m.from}>
                  <span>{m.text}</span>
                  <i>{chatTime(m.at, lang)}</i>
                </div>
              ))}
            </div>
            <form className="cw-input" onSubmit={e=>{ e.preventDefault(); send(); }}>
              <input value={draft} onChange={e=>setDraft(e.target.value)} placeholder={t.sch_reply_ph} aria-label={t.sch_reply_ph}/>
              <button type="submit" disabled={!draft.trim()} aria-label={t.ch_send}>{I.arrow({width:18,height:18})}</button>
            </form>
          </div>
        ) : (
          <div className="schat-room empty"><span>{t.sch_pick}</span></div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ContactShop, SellerChats, OrderDock, OrderButton, MyOrderPanel, ConversationList, ChatPanelView,
  StoreBasketCard, OrderLine, ChatAvatar, chatTime });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { ChatAvatar, chatTime, OrderLine, StoreBasketCard, MyOrderPanel, ConversationList, ChatPanelView, OrderDock, ContactShop, OrderButton, SellerChats });
