// ===== Buyer hub — profile, orders, reviews, saved shops, addresses, settings =====
function ByActiveCard({ o, shopStore, t, lang, onOpen }){
  const s = shopStore.shopMeta(o.shopId);
  const n = byLines(o).reduce((m,l)=>m+l.qty,0);
  const m = BY_STATUS[o.status] || BY_STATUS.new;
  const tg = ((shopStore.settings(o.shopId)||{}).contacts||{}).telegram;
  return (
    <div className={"by-active "+m.tone}>
      <div className="by-active-top">
        <ByShopAv shopStore={shopStore} shopId={o.shopId} size={44}/>
        <div className="by-active-id"><b>{s.name}</b><span>{fill(t.by_order_no,{n:o.no})} · {relDay(o.at,lang)}</span></div>
        <ByChip o={o} t={t}/>
      </div>
      <h3 className="by-active-h">{byHeadline(o, s.name, t)}</h3>
      {m.n && <p className="by-active-n">{t[m.n]}</p>}
      <ByProgress o={o} t={t} labels/>
      <div className="by-active-f">
        <ByThumbs shopStore={shopStore} o={o} max={4}/>
        <div className="by-active-sum"><span>{byItemsLabel(n,t)}</span><b>{fmtPrice(o.total,lang)}</b></div>
      </div>
      <div className="by-acts">
        <button className="by-btn primary" onClick={()=>onOpen(o)}>{t.by_track} {I.arrow({width:18,height:18})}</button>
        {tg && <a className="by-btn" href={"https://t.me/"+tg} target="_blank" rel="noreferrer">{I.tg({width:18,height:18})} {t.by_message}</a>}
      </div>
    </div>
  );
}

function ByOrderRow({ o, shopStore, orderStore, t, lang, onOpen, onRate }){
  const s = shopStore.shopMeta(o.shopId);
  const ls = byLines(o);
  const n = ls.reduce((m,l)=>m+l.qty,0);
  const done = o.status==="completed";
  const off = o.status==="cancelled" || o.status==="declined";
  const first = ls[0];
  return (
    <div className={"by-orow"+(off?" off":"")}>
      <button className="by-orow-main" onClick={()=>onOpen(o)}>
        <div className="by-orow-h">
          <ByShopAv shopStore={shopStore} shopId={o.shopId} size={32}/>
          <b>{s.name}</b>
          <span className="by-orow-d">{fmtDate(o.at,lang)}</span>
          <ByChip o={o} t={t}/>
        </div>
        <div className="by-orow-b">
          <ByThumbs shopStore={shopStore} o={o} max={4}/>
          <div className="by-orow-m">
            <b>{first? first.name : ""}{ls.length>1? " +"+(ls.length-1) : ""}</b>
            <span>{fill(t.by_order_no,{n:o.no})} · {byItemsLabel(n,t)}</span>
            {!done && !off && <span className="by-orow-st">{byHeadline(o, s.name, t)}</span>}
            {off && o.cancelReason && <span className="by-orow-st">{o.cancelReason}</span>}
          </div>
          <b className="by-orow-tot">{fmtPrice(o.total,lang)}</b>
        </div>
      </button>
      <div className="by-orow-acts">
        {!done && !off && <button className="by-btn sm primary" onClick={()=>onOpen(o)}>{t.by_track}</button>}
        {(done || off) && <button className="by-btn sm" onClick={()=>{ const k = byBuyAgain(shopStore, orderStore, o.shopId, ls, lang); toast(k? t.by_again_done : t.inv_out, k? "ok":"warn"); }}>{I.undo({width:16,height:16})} {t.by_again}</button>}
        {done && onRate && <button className="by-btn sm" onClick={onRate}>★ {t.by_rate}</button>}
        <button className="by-btn sm ghost" onClick={()=>onOpen(o)}>{t.by_details}</button>
      </div>
    </div>
  );
}

function ByRateCard({ item, shopStore, acct, t, lang, initial, compact }){
  const [rating, setRating] = React.useState(initial || 0);
  const [text, setText] = React.useState("");
  const src = byImg(shopStore, item.shopId, item.productId, 200, 250);
  const s = shopStore.shopMeta(item.shopId);
  function send(){
    shopStore.addReview(item.shopId, { name: acct.name || "", text, author: acct.phone, verified:true, rating, productId:item.productId });
    toast(t.by_rv_sent);
  }
  return (
    <div className={"by-rate"+(rating?" open":"")+(compact?" compact":"")}>
      <span className="by-rate-img" style={src?{backgroundImage:"url("+src+")"}:undefined}></span>
      <div className="by-rate-m">
        <b>{item.name}</b>
        <span>{s.name} · {fill(t.by_bought_on,{d:fmtDate(item.at,lang)})}</span>
        <ByStars value={rating} onPick={setRating} size={compact?28:32}/>
      </div>
      {rating>0 && (
        <div className="by-rate-x">
          <textarea rows="3" value={text} onChange={e=>setText(e.target.value)} placeholder={t.by_rv_write}></textarea>
          <div className="by-rate-f"><span>{TG_I.logo({width:16,height:16})} {t.rv_public}</span>
            <button className="by-btn primary" onClick={send}>{t.by_rv_send}</button></div>
        </div>
      )}
    </div>
  );
}

function ByAddresses({ orderStore, t, ask }){
  const acct = orderStore.account();
  const list = (acct && acct.addresses) || [];
  const [adding, setAdding] = React.useState(false);
  const [label, setLabel] = React.useState("");
  const [text, setText] = React.useState("");
  return (
    <div className="by-stack">
      {list.length===0 && !adding && <div className="by-empty"><span className="by-empty-ic">{EZ_I.pin({width:30,height:30})}</span><b>{t.ez_addr_none}</b><p>{t.ez_addr_none_d}</p></div>}
      <div className="by-addr-grid">
        {list.map(a=>(
          <div key={a.id} className={"by-card by-addr"+(a.isDefault?" main":"")}>
            <div className="by-addr-h"><span className="by-addr-ic">{EZ_I.pin({width:20,height:20})}</span><b>{a.label || t.co_address}</b>{a.isDefault && <span className="by-tag">{t.ez_addr_main}</span>}</div>
            <p>{a.text}</p>
            <div className="by-acts">
              {!a.isDefault && <button className="by-btn sm" onClick={()=>{ orderStore.setDefaultAddress(a.id); toast(t.ac_saved); }}>{t.ez_addr_make}</button>}
              <button className="by-btn sm ghost" onClick={()=>ask({ text:t.ez_addr_del_q, yes:t.ez_yes_del, go:()=>{ orderStore.removeAddress(a.id); toast(t.ez_addr_deleted); } })}>{t.g_delete}</button>
            </div>
          </div>
        ))}
      </div>
      {adding ? (
        <div className="by-card">
          <label className="by-lab" htmlFor="by-al">{t.ez_addr_name}</label>
          <input id="by-al" className="by-input" value={label} onChange={e=>setLabel(e.target.value)} placeholder="Uy / Дом / Home"/>
          <label className="by-lab" htmlFor="by-at">{t.ez_addr_text}</label>
          <textarea id="by-at" className="by-input" rows="3" value={text} onChange={e=>setText(e.target.value)} placeholder={t.co_address_ph}></textarea>
          <div className="by-acts">
            <button className="by-btn primary" disabled={text.trim().length<6} onClick={()=>{ orderStore.addAddress({ label:label.trim(), text:text.trim() }); toast(t.ac_saved); setAdding(false); setLabel(""); setText(""); }}>{t.ez_addr_save}</button>
            <button className="by-btn ghost" onClick={()=>setAdding(false)}>{t.g_cancel}</button>
          </div>
        </div>
      ) : <button className="by-btn dashed" onClick={()=>setAdding(true)}>{I.plus({width:20,height:20})} {t.ez_addr_add}</button>}
    </div>
  );
}

function BuyerHub({ orderStore, shopStore, lang, setLang, onClose, onOpenOrder, onOpenShop, onExplore, onBasket, initialTab }){
  const t = I18N[lang];
  const acct = orderStore.account();
  const [tab, setTab] = React.useState(initialTab || "home");
  const [filter, setFilter] = React.useState("all");
  const [ask, setAsk] = React.useState(null);
  const [name, setName] = React.useState((acct && acct.name) || "");
  const [big, setBig] = useBigText();
  React.useEffect(()=>{ setName((orderStore.account()||{}).name || ""); }, [acct && acct.phone]);
  React.useEffect(()=>{ try{ window.scrollTo(0,0); }catch(e){} }, [tab]);
  // saved shops load when the profile opens (public shops come in pages, not all at once)
  React.useEffect(()=>{ shopStore.loadShops && shopStore.loadShops(orderStore.favShops(), 3); }, [orderStore.favShops().join(",")]);
  React.useEffect(()=>{ const k=(e)=>{ if(e.key==="Escape"){ if(ask) setAsk(null); else onClose(); } }; addEventListener("keydown",k); return ()=>removeEventListener("keydown",k); });
  const bcount = orderStore.basketCount();

  const top = (
    <header className="by-top">
      <button className="by-back" onClick={onClose}>{I.back({width:20,height:20})}<span>{t.by_back_shop}</span></button>
      <div className="by-brand"><Logo/> <BrandName/></div>
      <div className="by-top-r">
        <LangPill lang={lang} setLang={setLang}/>
        <button className="by-bag" onClick={onBasket} aria-label={t.by_basket}>{I.bag({width:22,height:22})}{bcount>0 && <i>{bcount}</i>}</button>
      </div>
    </header>
  );

  if(!acct) return (
    <div className="by">
      {top}
      <div className="by-guest">
        <div className="by-guest-card">
          <span className="by-guest-ic">{TG_I.logo({width:56,height:56})}</span>
          <h1>{t.bp_guest_t}</h1>
          <p>{t.bp_guest_d}</p>
          <ul className="by-why">
            {ordersOn() && <li><span>{EZ_I.box({width:20,height:20})}</span>{t.bp_b1}</li>}
            <li><span>{EZ_I.pin({width:20,height:20})}</span>{t.bp_b2}</li>
            <li><span>{I.tg({width:20,height:20})}</span>{t.bp_b3}</li>
          </ul>
          <AuthFlow t={t} headless onDone={(phone, tg)=>{
            orderStore.signIn(phone);
            if(tg){ if(tg.name) orderStore.setAccountName(tg.name); orderStore.setAccountMeta && orderStore.setAccountMeta({ tg:tg.username }); }
            toast(t.ac_signedin_toast);
          }}/>
          <p className="by-help">{t.by_need_help}</p>
        </div>
      </div>
    </div>
  );

  const orders = ordersForPhone(shopStore, acct.phone);
  const active = orders.filter(o=>!BY_DONE.includes(o.status));
  const delivered = orders.filter(o=>o.status==="completed");
  const cancelled = orders.filter(o=>o.status==="cancelled"||o.status==="declined");
  const pending = byPending(shopStore, acct, orders);
  const mine = byMyReviews(shopStore, acct);
  const favs = orderStore.favShops().filter(id=>SHOPS[id]);
  const first = (acct.name||"").split(" ")[0];
  const notif = acct.notif!==false;
  const again = [];
  delivered.forEach(o=>byLines(o).forEach(l=>{ if(again.length<6 && !again.some(x=>x.l.productId===l.productId)) again.push({ o, l }); }));

  const nav = [
    ["home", t.by_overview, I.home, null],
    ordersOn() && ["orders", t.by_orders, EZ_I.box, active.length || null],
    reviewsOn() && ["review", t.by_toreview, EZ_I.star, pending.length || null],
    ["fav", t.by_fav, EZ_I.heart, null],
    ["addr", t.by_addr, EZ_I.pin, null],
    ["set", t.by_settings, EZ_I.gear, null],
  ].filter(Boolean);
  const listFor = filter==="active"? active : filter==="done"? delivered : filter==="off"? cancelled : orders;
  const go = (k)=>setTab(k);
  const Empty = ({ icon, title, desc, demo })=>(
    <div className="by-empty">
      <span className="by-empty-ic">{icon({width:30,height:30})}</span>
      <b>{title}</b>{desc && <p>{desc}</p>}
      <div className="by-acts center">
        <button className="by-btn primary" onClick={()=>{ onClose(); onExplore && onExplore(); }}>{t.by_explore}</button>
        {demo && <button className="by-btn ghost" onClick={()=>bySeedDemo(shopStore, acct, lang)}>{t.by_demo}</button>}
      </div>
    </div>
  );

  return (
    <div className="by">
      {top}
      <div className="by-layout">
        <aside className="by-side">
          <div className="by-me">
            <span className="by-me-av">{buyerInitials(acct)}<i>{TG_I.logo({width:22,height:22})}</i></span>
            <div className="by-me-m"><b>{acct.name || t.bp_profile}</b><span>{acct.phone}</span><em>{I.check({width:13,height:13})} {t.by_tg_verified}</em></div>
          </div>
          <nav className="by-nav" aria-label={t.bp_profile}>
            {nav.map(([k,lab,ic,badge])=>(
              <button key={k} className={tab===k?"on":""} onClick={()=>go(k)} aria-current={tab===k?"page":undefined}>
                {ic({width:22,height:22})}<span>{lab}</span>{badge? <i>{badge}</i> : null}
              </button>
            ))}
          </nav>
          <p className="by-help">{t.by_need_help}</p>
        </aside>

        <main className="by-main">
          {tab==="home" && (
            <>
              <div className="by-hello"><h1>{first? fill(t.by_hello,{n:first}) : t.bp_profile}</h1><p>{t.by_one_account}</p></div>
              {ordersOn() && <section className="by-sec">
                <div className="by-sec-h"><h2>{t.by_active_t}</h2>{orders.length>0 && <button className="by-link" onClick={()=>go("orders")}>{t.by_orders} {I.arrow({width:16,height:16})}</button>}</div>
                {active.length ? <div className="by-active-list">{active.map(o=><ByActiveCard key={o.id} o={o} shopStore={shopStore} t={t} lang={lang} onOpen={onOpenOrder}/>)}</div>
                  : orders.length ? <div className="by-calm">{EZ_I.box({width:22,height:22})}<span>{t.by_nothing_now}</span><button className="by-btn sm" onClick={()=>{ onClose(); onExplore && onExplore(); }}>{t.by_explore}</button></div>
                  : <Empty icon={EZ_I.box} title={t.by_no_orders} desc={t.by_no_orders_d} demo/>}
              </section>}
              {reviewsOn() && pending.length>0 && (
                <section className="by-sec">
                  <div className="by-sec-h"><div><h2>{t.by_rate_t}</h2><p>{t.by_rate_d}</p></div>{pending.length>2 && <button className="by-link" onClick={()=>go("review")}>{t.by_see_all} ({pending.length}) {I.arrow({width:16,height:16})}</button>}</div>
                  <div className="by-rate-row">{pending.slice(0,2).map(it=><ByRateCard key={it.shopId+it.productId} item={it} shopStore={shopStore} acct={acct} t={t} lang={lang} compact/>)}</div>
                </section>
              )}
              {ordersOn() && again.length>0 && (
                <section className="by-sec">
                  <div className="by-sec-h"><h2>{t.by_buy_again_t}</h2></div>
                  <div className="by-again">
                    {again.map(({o,l})=>{ const src = byImg(shopStore, o.shopId, l.productId, 260, 320); const p = byProduct(shopStore, o.shopId, l.productId);
                      return (
                        <div key={l.productId} className="by-again-c">
                          <span className="by-again-img" style={src?{backgroundImage:"url("+src+")"}:undefined}></span>
                          <b>{l.name}</b>
                          <span>{shopStore.shopMeta(o.shopId).name}</span>
                          <em>{fmtPrice(p? p.price : l.unit, lang)}</em>
                          <button className="by-btn sm" onClick={()=>{ const k = byBuyAgain(shopStore, orderStore, o.shopId, [{ ...l, qty:1 }], lang); toast(k? t.by_again_done : t.inv_out, k?"ok":"warn"); }}>{I.plus({width:16,height:16})} {t.by_again}</button>
                        </div>
                      ); })}
                  </div>
                </section>
              )}
              {!ordersOn() && !favs.length && <Empty icon={EZ_I.heart} title={t.bp_fav_none} desc={t.bp_fav_none_d}/>}
              {favs.length>0 && (
                <section className="by-sec">
                  <div className="by-sec-h"><h2>{t.by_fav}</h2><button className="by-link" onClick={()=>go("fav")}>{t.by_see_all} {I.arrow({width:16,height:16})}</button></div>
                  <div className="by-favrow">{favs.slice(0,6).map(id=>(
                    <button key={id} className="by-favchip" onClick={()=>{ onClose(); onOpenShop(id); }}><ByShopAv shopStore={shopStore} shopId={id} size={48}/><b>{shopStore.shopMeta(id).name}</b></button>
                  ))}</div>
                </section>
              )}
            </>
          )}

          {tab==="orders" && ordersOn() && (
            <>
              <div className="by-page-h"><h1>{t.by_orders}</h1></div>
              {!orders.length ? <Empty icon={EZ_I.box} title={t.by_no_orders} desc={t.by_no_orders_d} demo/> : (
                <>
                  <div className="by-filter" role="tablist">
                    {[["all",t.by_all,orders.length],["active",t.by_in_progress,active.length],["done",t.by_delivered,delivered.length],["off",t.by_cancelled,cancelled.length]].map(([k,lab,n])=>(
                      <button key={k} role="tab" aria-selected={filter===k} className={filter===k?"on":""} onClick={()=>setFilter(k)}>{lab}<i>{n}</i></button>
                    ))}
                  </div>
                  {listFor.length===0 ? <div className="by-calm">{t.by_no_match}</div> : (
                    <div className="by-stack">{listFor.map(o=><ByOrderRow key={o.id} o={o} shopStore={shopStore} orderStore={orderStore} t={t} lang={lang} onOpen={onOpenOrder}
                      onRate={pending.some(p=>p.order.id===o.id)? ()=>go("review") : null}/>)}</div>
                  )}
                </>
              )}
            </>
          )}

          {tab==="review" && reviewsOn() && (
            <>
              <div className="by-page-h"><h1>{t.by_toreview}</h1><p>{t.by_rate_d}</p></div>
              {pending.length ? <div className="by-stack">{pending.map(it=><ByRateCard key={it.shopId+it.productId} item={it} shopStore={shopStore} acct={acct} t={t} lang={lang}/>)}</div>
                : <div className="by-calm">{EZ_I.star({width:22,height:22})}<span><b>{t.by_rv_none_p}</b> · {t.by_rv_none_pd}</span></div>}
              <div className="by-sec-h" style={{marginTop:32}}><h2>{t.by_reviews}</h2></div>
              {mine.length===0 ? <div className="by-calm">{t.bp_rv_none}</div> : (
                <div className="by-stack">{mine.map(r=>{ const p = byProduct(shopStore, r.shopId, r.productId); const src = byImg(shopStore, r.shopId, r.productId, 160, 200);
                  return (
                    <div key={r.id} className="by-card by-myrv">
                      <span className="by-rate-img" style={src?{backgroundImage:"url("+src+")"}:undefined}></span>
                      <div className="by-myrv-m">
                        <b>{p? textFB(p.name,lang) : "—"}</b>
                        <span>{shopStore.shopMeta(r.shopId).name} · {fmtDate(r.editedAt||r.at,lang)}{r.verified && <em> · {I.check({width:12,height:12})} {t.rv_verified}</em>}</span>
                        <ByStars value={r.rating} size={22}/>
                        {r.text && <p>{r.text}</p>}
                        <div className="by-acts">
                          <button className="by-btn sm" onClick={()=>{ onClose(); onOpenShop(r.shopId); }}>{t.rv_edit}</button>
                          <button className="by-btn sm ghost" onClick={()=>setAsk({ text:t.ez_confirm_rv, yes:t.ez_yes_del, go:()=>{ shopStore.removeReview(r.shopId, r.id); toast(t.rv_removed); } })}>{t.g_delete}</button>
                        </div>
                      </div>
                    </div>
                  ); })}</div>
              )}
            </>
          )}

          {tab==="fav" && (
            <>
              <div className="by-page-h"><h1>{t.by_fav}</h1><p>{t.ez_fav_d}</p></div>
              {!favs.length ? <Empty icon={EZ_I.heart} title={t.bp_fav_none} desc={t.bp_fav_none_d}/> : (
                <div className="by-fav-grid">{favs.map(id=>{ const s = shopStore.shopMeta(id); const pal = getPalette(shopStore.cfg(id));
                  const prods = (shopStore.products(id)||[]).slice(0,3);
                  return (
                    <div key={id} className="by-fav">
                      <div className="by-fav-cover" style={{background:pal.swatch, backgroundImage:"url("+photoURL(pal.swatch,"cover-"+id,600,240,IMG_KW[s.type])+")"}}></div>
                      <div className="by-fav-b">
                        <ByShopAv shopStore={shopStore} shopId={id} size={52}/>
                        <b>{s.name}</b><span>{s.location} · {TYPES[s.type]? TYPES[s.type][lang] : ""}</span>
                        <div className="by-fav-th">{prods.map(p=><span key={p.id} style={{backgroundImage:"url("+byImg(shopStore,id,p.id,140,170)+")"}}></span>)}</div>
                        <div className="by-acts">
                          <button className="by-btn primary" onClick={()=>{ onClose(); onOpenShop(id); }}>{t.by_visit}</button>
                          <button className="by-btn ghost" onClick={()=>{ orderStore.toggleFav(id); toast(t.fav_removed); }}>{t.by_remove}</button>
                        </div>
                      </div>
                    </div>
                  ); })}</div>
              )}
            </>
          )}

          {tab==="addr" && (<><div className="by-page-h"><h1>{t.by_addr}</h1><p>{t.ez_addr_d}</p></div><ByAddresses orderStore={orderStore} t={t} ask={setAsk}/></>)}

          {tab==="set" && (
            <>
              <div className="by-page-h"><h1>{t.by_settings}</h1></div>
              <div className="by-stack">
                <div className="by-card">
                  <label className="by-lab" htmlFor="by-name">{t.ac_name}</label>
                  <div className="by-inline"><input id="by-name" className="by-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Dilnoza R."/>
                    <button className="by-btn primary" disabled={name.trim()===(acct.name||"")} onClick={()=>{ orderStore.setAccountName(name.trim()); toast(t.ac_saved); }}>{t.ez_name_save}</button></div>
                  <p className="by-hint">{t.ac_name_d}</p>
                </div>
                <div className="by-card by-set-row">
                  <div><b>{t.ez_big}</b><p className="by-hint">{t.ez_big_d}</p></div>
                  <div className="by-onoff"><button className={!big?"on":""} onClick={()=>setBig(false)}>{t.ez_off}</button><button className={big?"on":""} onClick={()=>setBig(true)}>{t.ez_on}</button></div>
                </div>
                <div className="by-card by-set-row">
                  <div><b>{t.bp_notif}</b><p className="by-hint">{t.bp_notif_d}</p></div>
                  <div className="by-onoff"><button className={!notif?"on":""} onClick={()=>orderStore.setAccountMeta({ notif:false })}>{t.ez_off}</button><button className={notif?"on":""} onClick={()=>orderStore.setAccountMeta({ notif:true })}>{t.ez_on}</button></div>
                </div>
                <div className="by-card by-set-row">
                  <div><b>{t.bp_lang}</b></div>
                  <div className="by-onoff">{["uz","ru","en"].map(l=><button key={l} className={lang===l?"on":""} onClick={()=>setLang(l)}>{I18N[l]._label}</button>)}</div>
                </div>
                <div className="by-card by-set-row">
                  <span className="by-tg-ic">{TG_I.logo({width:40,height:40})}</span>
                  <div style={{flex:1}}><b>{t.bp_tg}</b><p className="by-hint">{acct.phone}{acct.tg? " · @"+acct.tg : ""} — {t.bp_tg_d}</p></div>
                </div>
                <div className="by-card by-set-row">
                  <div><b>{t.bp_logout}</b><p className="by-hint">{t.bp_logout_d}</p></div>
                  <button className="by-btn danger" onClick={()=>setAsk({ text:t.ez_confirm_out, yes:t.ez_yes_out, go:()=>{ orderStore.signOut(); toast(t.bp_logout); onClose(); } })}>{t.bp_logout}</button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      {ask && <EzConfirm text={ask.text} yes={ask.yes} no={t.ez_no} onYes={()=>{ const g = ask.go; setAsk(null); g(); }} onNo={()=>setAsk(null)}/>}
    </div>
  );
}

Object.assign(window, { BuyerHub, ByActiveCard, ByOrderRow, ByRateCard });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { ByActiveCard, ByOrderRow, ByRateCard, ByAddresses, BuyerHub });
