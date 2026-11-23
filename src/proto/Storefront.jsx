import { go, back } from '../route.js';
// ===== Storefront — public catalog page =====
const { useState, useMemo, useEffect, useRef } = React;

function themeVars(cfg){
  const t = THEMES[cfg.theme] || THEMES.minimal;
  const pal = getPalette(cfg);
  const vars = { ...t.vars, ...paletteVars(pal) };
  if (cfg.font){ const f = FONT_CHOICES.find(x=>x.id===cfg.font); if(f){ vars["--s-font-display"]=f.display; vars["--s-font-body"]=f.body; } }
  return vars;
}
function pickInk(hex){
  const c = hex.replace("#",""); const r=parseInt(c.substr(0,2),16),g=parseInt(c.substr(2,2),16),b=parseInt(c.substr(4,2),16);
  const lum = (0.299*r+0.587*g+0.114*b)/255;
  return lum > 0.62 ? "#16150f" : "#ffffff";
}
function useEscape(onClose){
  useEffect(()=>{
    function k(e){ if(e.key==="Escape"){ e.stopPropagation(); onClose(); } }
    window.addEventListener("keydown", k);
    return ()=> window.removeEventListener("keydown", k);
  },[onClose]);
}

addI18N({ sf_from:["from","от","dan"] });
// a variant may carry its own price (e.g. 256 GB costs more); otherwise the product price applies
function vPrice(p, v){ return (v && v.price!=null)? v.price : p.price; }
function pMin(p){ const xs = (p.variants||[]).map(v=>vPrice(p,v)); return xs.length? Math.min.apply(null, xs) : p.price; }
function pVaries(p){ return (p.variants||[]).some(v=>v.price!=null && v.price!==p.price); }
function PriceTag({ p, lang, t }){
  return <>{pVaries(p) && <span className="pfrom">{t.sf_from} </span>}{fmtPrice(pMin(p), lang)}</>;
}

// what the Order button needs to know about a product, per the spec
function orderPayload(shop, p, i, lang, v, qty){
  const vid = v? v.id : null;
  return { productId:p.id, storeId:shop.id, name:textFB(p.name,lang), price:vPrice(p, v),
    variantId:vid, variantLabel: v? (variantLabel(p.catId, v.options||{}, lang) || null) : null,
    lineId: p.id + (vid? "|"+vid : ""), addQty: Math.max(1, Number(qty)||1),
    image:photoURL(p.tone, pslot(shop.id,p,0), 200,250, IMG_KW[shop.type], i),
    url:"rastashops.com/"+shop.handle+"?p="+p.id, sold: v? v.qty<=0 : p.stock==="sold" };
}
// options the customer must choose between (a single unnamed variant is not a choice)
function storePayload(shop, cfg){
  return { id:shop.id, name:shop.name, handle:shop.handle, initials:shop.initials,
    swatch:(cfg&&getPalette(cfg).swatch)||shop.cover, type:shop.type };
}

function SizeChart({ chart, lang, onClose, t }){
  return (
    <div className="sz-chart" onClick={e=>e.stopPropagation()}>
      <div className="sz-head"><b>{chart.title[lang]}</b>
        <button onClick={onClose} aria-label={t.g_close}>{I.x({width:15,height:15})}</button></div>
      <table><thead><tr>{chart.cols.map((c,i)=>(<th key={i}>{c[lang]}</th>))}</tr></thead>
        <tbody>{chart.rows.map((r,i)=>(<tr key={i}>{r.map((cell,k)=>(<td key={k}>{cell}</td>))}</tr>))}</tbody></table>
    </div>
  );
}

function OptionPicker({ p, offered, sel, setSel, t, lang }){
  const attrs = variantAttrs(p.catId).filter(a=> (offered[a.id]||[]).length);
  const chart = sizeChartFor(p.catId);
  const [showChart, setShowChart] = useState(false);
  return (
    <div className="opt-groups">
      {attrs.map(a=>{
        const chosen = sel[a.id];
        const isChart = chart && chart.attr.id===a.id;
        return (
          <div key={a.id} className="opt-group">
            <div className="opt-label">
              <span className="sf-up">{a.id==="option" && p.optName? p.optName : a.name[lang]}</span>
              {chosen && a.swatch && <b>{attrValueName(a.id, chosen, lang)}</b>}
              {isChart && <button className="opt-chart-link" onClick={()=>setShowChart(v=>!v)}>{t.sf_size_chart}</button>}
            </div>
            {isChart && showChart && <SizeChart chart={chart.chart} lang={lang} t={t} onClose={()=>setShowChart(false)}/>}
            <div className={"opt-values "+(a.swatch?"color":"size")}>
              {(offered[a.id]||[]).map(v=>{
                const rest = { ...sel }; delete rest[a.id];
                const off = !optionReachable(p, rest, a.id, v);
                const on = chosen===v;
                if(a.swatch){
                  return (
                    <button key={v} className={"opt-sw"+(on?" on":"")+(off?" off":"")} disabled={off}
                      title={attrValueName(a.id,v,lang)+(off? " — "+t.opt_out : "")}
                      onClick={()=>setSel(s=>({ ...s, [a.id]:v }))}>
                      <i style={{background:attrValueHex(a.id,v)||"#ccc"}}></i>
                      <span>{attrValueName(a.id,v,lang)}</span>
                    </button>
                  );
                }
                return (
                  <button key={v} className={"opt-chip"+(on?" on":"")+(off?" off":"")} disabled={off}
                    onClick={()=>setSel(s=>({ ...s, [a.id]:v }))}>{attrValueName(a.id,v,lang)}</button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SpecTable({ p, t, lang }){
  const attrs = specAttrs(p.catId).filter(a=>{
    const v = (p.specs||{})[a.id];
    return v!=null && v!=="" && !(Array.isArray(v) && !v.length);
  });
  if(!attrs.length) return null;
  return (
    <div className="spec-block">
      <div className="sf-sizes-label sf-up">{t.sf_specs}</div>
      <table className="spec-table"><tbody>
        {attrs.map(a=>{
          const v = (p.specs||{})[a.id];
          let text;
          if(a.kind==="bool") text = v? t.g_yes : t.g_no;
          else if(a.kind==="number") text = fmtNum(v)+(a.unit? " "+a.unit[lang] : "");
          else if(a.kind==="multi") text = v.map(x=>attrValueName(a.id,x,lang)).join(", ");
          else if(a.kind==="text") text = String(v);
          else text = attrValueName(a.id, v, lang);
          return (<tr key={a.id}><th>{a.name[lang]}</th><td>{text}</td></tr>);
        })}
      </tbody></table>
    </div>
  );
}

function StockBadge({ stock, t }){
  if(stock==="in") return <span className="badge in"><span className="dotx"></span>{t.sf_in_stock}</span>;
  if(stock==="low") return <span className="badge low"><span className="dotx"></span>{t.sf_low}</span>;
  return <span className="badge sold">{t.sf_sold}</span>;
}

function ProductCard({ p, i, shop, lang, t, onOpen, list, chatStore, store }){
  const sold = p.stock==="sold";
  const kw = IMG_KW[shop.type];
  return (
    <div className={"pcard"+(sold?" dim":"")} onClick={()=>onOpen(p)}>
      <div className={"pimg"+(sold?" is-sold":"")+((p.ai&&p.ai[0])?" is-ai":"")} style={fxStyle(p.fx)}>
        <ImageSlot id={pslot(shop.id,p,0)} src={photoURL(p.tone, pslot(shop.id,p,0), 320,400, kw, i)} placeholder={textFB(p.name,"en").toLowerCase()} style={FILL}/>
        <StockBadge stock={p.stock} t={t}/>
      </div>
      <div className="pbody">
        <div className="pname">{textFB(p.name,lang)}</div>
        <div className="pprice"><PriceTag p={p} lang={lang} t={t}/></div>
        {reviewsOn() && p._rv && p._rv.n>0 && <div className="pcard-rv"><span className="star on">{"\u2605"}</span> {p._rv.avg} <i>({p._rv.n})</i></div>}
        {list!=="gallery" && <div className="pdesc">{textFB(p.desc,lang)}</div>}
        {chatStore && (ordersOn() || requestsOn()) && <OrderButton className="sf-btn sf-btn-line sf-btn-card" store={store} chatStore={chatStore} t={t} lang={lang}
          product={orderPayload(shop,p,i,lang,(p.variants||[])[0])} blocked={p.stock==="sold"}
          needsPick={variantAttrs(p.catId).length>0 && (p.variants||[]).length>1} onNeedPick={()=>onOpen(p)}/>}
      </div>
    </div>
  );
}
function ListCard({ p, i, shop, lang, t, onOpen, chatStore, store }){
  const sold = p.stock==="sold";
  return (
    <div className={"pcard"+(sold?" dim":"")} onClick={()=>onOpen(p)}>
      <div className={"pimg"+(sold?" is-sold":"")} style={fxStyle(p.fx)}>
        <ImageSlot id={pslot(shop.id,p,0)} src={photoURL(p.tone, pslot(shop.id,p,0), 240,240, IMG_KW[shop.type], i)} placeholder={textFB(p.name,"en").toLowerCase()} style={FILL}/>
        <StockBadge stock={p.stock} t={t}/>
      </div>
      <div className="pbody">
        <div className="pname">{textFB(p.name,lang)}</div>
        <div className="pdesc">{textFB(p.desc,lang)}</div>
      </div>
      <div className="plist-right">
        <div className="pprice"><PriceTag p={p} lang={lang} t={t}/></div>
        {chatStore && (ordersOn() || requestsOn()) && <OrderButton className="sf-btn sf-btn-line sf-btn-card" store={store} chatStore={chatStore} t={t} lang={lang}
          product={orderPayload(shop,p,i,lang,(p.variants||[])[0])} blocked={p.stock==="sold"}
          needsPick={variantAttrs(p.catId).length>0 && (p.variants||[]).length>1} onNeedPick={()=>onOpen(p)}/>}
      </div>
    </div>
  );
}

function ProductDetail({ p, i, shop, lang, t, onClose, inFrame, onShare, chatStore, store }){
  const [idx, setIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const tX = useRef(null);
  const dragY = useRef(null);
  const sheetRef = useRef(null);
  const [drag, setDrag] = useState(0);
  const sold = p.stock==="sold";
  const kw = IMG_KW[shop.type];
  const offered = offeredOptions(p);
  const pickAttrs = variantAttrs(p.catId).filter(a=>(offered[a.id]||[]).length);
  const [sel, setSel] = useState({});
  const chosen = pickAttrs.length
    ? (pickAttrs.every(a=>sel[a.id])? variantFor(p, sel) : null)
    : ((p.variants||[])[0] || null);
  const needsPick = pickAttrs.length>0 && !chosen;
  const missing = pickAttrs.filter(a=>!sel[a.id]).map(a=>a.name[lang].toLowerCase()).join(" + ");
  const swatchAttr = pickAttrs.find(a=>a.swatch) || null;
  const colorPick = swatchAttr? sel[swatchAttr.id] : null;
  const [qty, setQty] = useState(1);
  const unit = chosen? vPrice(p, chosen) : pMin(p);
  // "In basket · view" hands off to the basket panel — the sheet must get out of the way
  useEffect(()=>{
    function handOff(){ onClose(); }
    window.addEventListener("rasta-open-basket", handOff);
    return ()=> window.removeEventListener("rasta-open-basket", handOff);
  },[onClose]);
  const maxQty = chosen? Math.max(1, chosen.qty) : 1;
  useEffect(()=>{ setQty(q=>Math.min(Math.max(1,q), maxQty)); }, [chosen && chosen.id]);
  useEffect(()=>{ if(colorPick!=null) setIdx(0); }, [colorPick]);
  useEscape(onClose);
  useEffect(()=>{
    function onKey(e){
      if(e.key==="ArrowRight") setIdx(x=>Math.min(PRODUCT_IMAGES-1,x+1));
      if(e.key==="ArrowLeft") setIdx(x=>Math.max(0,x-1));
    }
    window.addEventListener("keydown", onKey);
    let prev;
    if(!inFrame){ prev=document.body.style.overflow; document.body.style.overflow="hidden"; }
    return ()=>{ window.removeEventListener("keydown", onKey); if(!inFrame) document.body.style.overflow=prev||""; };
  },[]);
  function tStart(e){ tX.current = e.touches[0].clientX; }
  function tEnd(e){
    if(tX.current==null) return;
    const dx = e.changedTouches[0].clientX - tX.current;
    if(Math.abs(dx)>45) setIdx(x=> Math.max(0, Math.min(PRODUCT_IMAGES-1, x+(dx<0?1:-1))));
    tX.current=null;
  }
  // drag-to-dismiss (phone sheet): only from the grip/header, never from the scroll body
  function dStart(e){ dragY.current = e.touches[0].clientY; }
  function dMove(e){
    if(dragY.current==null) return;
    const dy = e.touches[0].clientY - dragY.current;
    if(dy>0) setDrag(dy);
  }
  function dEnd(){
    if(dragY.current==null) return;
    if(drag>110) onClose(); else setDrag(0);
    dragY.current=null;
  }
  function share(){
    const url = "rastashops.com/"+shop.handle+"?p="+p.id;
    try{
      if(navigator.share) navigator.share({ title:textFB(p.name,lang), url:"https://"+url }).catch(()=>{});
      else if(navigator.clipboard) navigator.clipboard.writeText(url);
    }catch(e){}
    setCopied(true); setTimeout(()=>setCopied(false), 2200);
    if(onShare) onShare();
  }
  return (
    <div className={"sf-detail-scrim"+(inFrame?" in-frame":"")} onClick={onClose}>
      <div className="sf-detail scroll-y" ref={sheetRef} onClick={e=>e.stopPropagation()}
        style={drag? { transform:"translateY("+drag+"px)", transition:"none" } : undefined}>
        <div className="sf-sheet-grip" onTouchStart={dStart} onTouchMove={dMove} onTouchEnd={dEnd}><i></i></div>
        <div className={"sf-detail-img"+(sold?" is-sold":"")} style={fxStyle(p.fx)} onTouchStart={tStart} onTouchEnd={tEnd}>
          {Array.from({length:PRODUCT_IMAGES}).map((_,k)=>{
            const isGen = p.gen && p.gen[k];
            // frame 0 is colour-aware: each colour has its own slot and photo
            const perColor = k===0 && colorPick;
            const sid = perColor? "pc-"+shop.id+"-"+p.id+"-"+colorPick : pslot(shop.id,p,k);
            const src = perColor
              ? photoURL(attrValueHex(swatchAttr.id, colorPick)||p.tone, sid, 480,600, kw, i + (_hash(String(colorPick)) % 5))
              : photoURL(p.tone, sid, 480,600, kw, i+k*2);
            return (
              <div key={perColor? sid : k} className={"sf-gal-frame"+(idx===k?" on":"")+(isGen?" is-gen":"")}>
                {isGen && !perColor
                  ? <div className="gen-layer" style={genStyle(k, photoURL(p.tone, pslot(shop.id,p,0), 480,600, kw, i))}></div>
                  : <ImageSlot id={sid} src={src} placeholder={k===0? textFB(p.name,"en").toLowerCase() : "+ photo "+(k+1)} style={FILL}/>}
              </div>
            );
          })}
          <StockBadge stock={p.stock} t={t}/>
          <button className="sf-detail-close" onClick={onClose} aria-label={t.g_close}>
            <span className="sfc-x">{I.x()}</span><span className="sfc-back">{I.back({width:19,height:19})}</span>
          </button>
          {idx>0 && <button className="sf-gal-nav prev" aria-label="previous photo" onClick={()=>setIdx(idx-1)}>{I.back({width:18,height:18})}</button>}
          {idx<PRODUCT_IMAGES-1 && <button className="sf-gal-nav next" aria-label="next photo" onClick={()=>setIdx(idx+1)}>{I.arrow({width:18,height:18})}</button>}
          <div className="sf-gal-count">{idx+1}/{PRODUCT_IMAGES}</div>
          <div className="sf-gal-dots">
            {Array.from({length:PRODUCT_IMAGES}).map((_,k)=>(
              <button key={k} className={"sf-gal-dot"+(idx===k?" on":"")} aria-label={"photo "+(k+1)} onClick={()=>setIdx(k)}></button>
            ))}
          </div>
        </div>
        <div className="sf-detail-body">
          <div className="pname sf-display">{textFB(p.name,lang)}</div>
          <div className="pprice">{chosen? fmtPrice(unit, lang) : <PriceTag p={p} lang={lang} t={t}/>}</div>
          <div className="sf-detail-desc">{textFB(p.desc,lang)}</div>
          {pickAttrs.length>0 && <OptionPicker p={p} offered={offered} sel={sel} setSel={setSel} t={t} lang={lang}/>}
          {!ordersOn() && !requestsOn() && <ContactShop shop={shop} store={store} t={t} product={orderPayload(shop,p,i,lang,chosen,1)}/>}
          {chatStore && (ordersOn() || requestsOn()) && (
            <div className="buy-box">
              <div className="buy-row">
                <div className="opt-label"><span className="sf-up">{t.opt_qty}</span></div>
                <div className="qty-pick">
                  <button disabled={qty<=1} onClick={()=>setQty(q=>Math.max(1,q-1))} aria-label="−">{I.minus({width:16,height:16})}</button>
                  <b>{qty}</b>
                  <button disabled={qty>=maxQty} onClick={()=>setQty(q=>Math.min(maxQty,q+1))} aria-label="+">{I.plus({width:16,height:16})}</button>
                </div>
                {chosen && chosen.qty>0 && <span className={"buy-left"+(chosen.qty<=5?" low":"")}>{fill(t.opt_left,{n:chosen.qty})}</span>}
              </div>
              <OrderButton store={store} chatStore={chatStore} t={t} lang={lang}
                product={orderPayload(shop,p,i,lang,chosen,qty)} blocked={needsPick || p.stock==="sold"}
                label={needsPick? fill(t.opt_pick_hint,{what:missing})
                     : p.stock==="sold"? t.sf_sold
                     : fill(t.opt_ready,{sum:fmtPrice(unit*qty, lang)})}/>
            </div>
          )}
          <div className="sf-detail-cta">
            <button className="sf-btn sf-btn-line" onClick={share}>{copied? I.check():I.share()} {copied? t.sf_copied_p : t.sf_share_p}</button>
          </div>
          <SpecTable p={p} t={t} lang={lang}/>
          <div className="sf-contact-block">
            <div className="sf-sizes-label sf-up">{t.sf_contact}</div>
            <ContactRows shop={shop}/>
          </div>
        </div>
        <div className="sf-detail-bar">
          <div className="sf-bar-price"><b>{fmtPrice(unit, lang)}</b><span>{p.stock==="sold"? t.sf_sold : t.sf_in_stock}</span></div>
          {chatStore && (ordersOn() || requestsOn())
            ? <OrderButton store={store} chatStore={chatStore} t={t} lang={lang}
                product={orderPayload(shop,p,i,lang,chosen,qty)} blocked={needsPick || p.stock==="sold"}
                label={needsPick? fill(t.opt_pick_hint,{what:missing}) : undefined}/>
            : <button className="sf-btn sf-btn-accent" onClick={share}>{copied? I.check():I.share()} {copied? t.sf_copied_p : t.sf_share_p}</button>}
          <button className="sf-btn sf-btn-line sf-btn-icon" onClick={share} aria-label={t.sf_share_p}>{copied? I.check():I.share()}</button>
        </div>
      </div>
    </div>
  );
}

function ContactRows({ shop }){
  const c = shop.contacts || {};
  const rows = [
    c.instagram && ["Instagram", "@"+c.instagram],
    c.telegram && ["Telegram", "@"+c.telegram],
    c.phone && ["Phone", c.phone],
  ].filter(Boolean);
  return (
    <div className="sf-contacts">
      {rows.map(([k,v])=>(<div key={k} className="sf-contact"><span>{k}</span><b>{v}</b></div>))}
    </div>
  );
}

// ===== Shop header v2: products first, trust signals, "how to buy" (no online ordering for now) =====
addI18N({
  sfh_write_tg: ["Write in Telegram", "Написать в Telegram", "Telegramda yozish"],
  sfh_about:    ["About the shop", "О магазине", "Do‘kon haqida"],
  sfh_how:      ["How to buy", "Как купить", "Qanday xarid qilinadi"],
  sfh_s1:       ["Pick a product", "Выберите товар", "Mahsulotni tanlang"],
  sfh_s1d:      ["Choose the size or colour if it has one.", "Выберите размер или цвет, если есть.", "O‘lcham yoki rangni tanlang (bo‘lsa)."],
  sfh_s2:       ["Write to the shop", "Напишите магазину", "Do‘konga yozing"],
  sfh_s2d:      ["In Telegram, Instagram or by phone — send the product link.", "В Telegram, Instagram или по телефону — отправьте ссылку на товар.", "Telegram, Instagram yoki telefon orqali — mahsulot havolasini yuboring."],
  sfh_s3:       ["Agree, pay, receive", "Договоритесь, оплатите, получите", "Kelishing, to‘lang, oling"],
  sfh_s3d:      ["Price, pickup or delivery and payment — directly with the seller.", "Цена, самовывоз или доставка и оплата — напрямую с продавцом.", "Narx, olib ketish yoki yetkazish va to‘lov — sotuvchi bilan to‘g‘ridan-to‘g‘ri."],
  sfh_pay:      ["Payment", "Оплата", "To‘lov"],
  sfh_get:      ["How you get it", "Как получить", "Qanday olasiz"],
  sfh_get_d:    ["Pickup in {c} or delivery — agree with the seller", "Самовывоз ({c}) или доставка — по договорённости", "{c}da olib ketish yoki yetkazish — sotuvchi bilan kelishing"],
  sfh_returns:  ["Exchange & returns", "Обмен и возврат", "Almashtirish va qaytarish"],
  sfh_returns_d:["Ask the seller before you pay.", "Уточните у продавца до оплаты.", "To‘lovdan oldin sotuvchidan so‘rang."],
  sfh_tg_ok:    ["Telegram verified", "Подтверждён в Telegram", "Telegram orqali tasdiqlangan"],
  sfh_sold:     ["{n} sold", "продано {n}", "{n} ta sotilgan"],
  sfh_since:    ["On rastashops since {y}", "На rastashops с {y}", "{y}-yildan rastashops’da"],
  sfh_items:    ["{n} products", "{n} товаров", "{n} ta mahsulot"],
});
const sfhSoldLabel = (n)=> n>=1000? (Math.floor(n/100)*100)+"+" : n>=100? (Math.floor(n/10)*10)+"+" : String(n);
const sfhPays = (shop, lang, t)=> (shop.payments||[]).map(id=>{ const m = PAY_METHODS.find(x=>x.id===id); return m? m.label[lang] : id; }).join(" · ") || t.sf_pay_def;

// trust row under the shop name: Telegram verified · N sold · N products · city · since · Instagram
function SfTrust({ shop, t, soldTotal }){
  const c = shop.contacts || {};
  const since = shop.since || shop.createdAt;
  const items = [
    c.telegram && [I.check, t.sfh_tg_ok],
    soldTotal>0 && [I.bag, fill(t.sfh_sold,{n:sfhSoldLabel(soldTotal)})],
    [I.grid, fill(t.sfh_items,{n:shop.products.length})],
    shop.location && [I.store, shop.location],
    since && [I.clock, fill(t.sfh_since,{y:new Date(since).getFullYear()})],
    c.instagram && [null, "Instagram @"+c.instagram, "https://instagram.com/"+c.instagram],
  ].filter(Boolean);
  return (
    <div className="sfh-trust">
      {items.map(([ic,txt,href],k)=> href
        ? <a key={k} href={href} target="_blank" rel="noreferrer">{txt}</a>
        : <span key={k} className={k===0 && c.telegram? "ok" : ""}>{ic && ic({width:14,height:14})}{txt}</span>)}
    </div>
  );
}
// payment · how you get it · exchange & returns (shop page + every product page)
function SfFacts({ shop, t, lang }){
  const ret = shop.returns? (typeof shop.returns==="string"? shop.returns : textFB(shop.returns, lang)) : t.sfh_returns_d;
  return (
    <div className="sfh-facts">
      <div><small>{t.sfh_pay}</small><b>{sfhPays(shop, lang, t)}</b></div>
      <div><small>{t.sfh_get}</small><b>{fill(t.sfh_get_d,{c:shop.location||""})}</b></div>
      <div><small>{t.sfh_returns}</small><b>{ret}</b></div>
    </div>
  );
}
addI18N({
  sfh_r1:  ["Add to basket", "Соберите корзину", "Savatga qo‘shing"],
  sfh_r1d: ["Pick everything you want — sizes and colours included.", "Выберите всё нужное — с размерами и цветами.", "Kerakli hammasini tanlang — o‘lcham va rangi bilan."],
  sfh_r2:  ["Send the basket link", "Отправьте ссылку на корзину", "Savat havolasini yuboring"],
  sfh_r2d: ["One tap sends it to the shop in Telegram.", "Одним нажатием — в Telegram магазину.", "Bir bosishda Telegramda do‘konga ketadi."],
});
function SfHowTo({ t, compact }){
  const steps = requestsOn()
    ? [[t.sfh_r1,t.sfh_r1d],[t.sfh_r2,t.sfh_r2d],[t.sfh_s3,t.sfh_s3d]]
    : [[t.sfh_s1,t.sfh_s1d],[t.sfh_s2,t.sfh_s2d],[t.sfh_s3,t.sfh_s3d]];
  if(compact) return (
    <div className="sfh-how-strip" aria-label={t.sfh_how}><b>{t.sfh_how}:</b>{steps.map((s,k)=><span key={k}><i>{k+1}</i>{s[0]}</span>)}</div>
  );
  return <div className="sfh-steps">{steps.map((s,k)=><div key={k} className="sfh-step"><i>{k+1}</i><b>{s[0]}</b><span>{s[1]}</span></div>)}</div>;
}
const SFH_CSS = `
.sfh-tag{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-top:10px!important}
.sfh-trust{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px;font-size:13px;color:var(--s-soft)}
.sfh-trust span,.sfh-trust a{display:inline-flex;align-items:center;gap:5px;color:inherit;text-decoration:none}
.sfh-trust a{text-decoration:underline;text-underline-offset:3px}
.sfh-trust .ok{color:var(--s-ink);font-weight:600}.sfh-trust .ok svg{color:var(--s-accent)}
.sfh-acts{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
.sfh-acts .sf-btn{height:42px;text-decoration:none}
.sfh-how-strip{display:flex;gap:6px 14px;flex-wrap:wrap;align-items:center;margin-top:14px;padding:10px 12px;border-radius:var(--s-radius);background:var(--s-accent-soft);font-size:13px}
.sfh-how-strip span{display:inline-flex;align-items:center;gap:6px}
.sfh-how-strip i,.sfh-step i{font-style:normal;display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:var(--s-accent);color:var(--s-accent-ink);font-size:11px;font-weight:700}
.sfh-about{padding-top:32px;padding-bottom:12px;border-top:1px solid var(--s-line);margin-top:30px;scroll-margin-top:90px}
.sfh-about h3{font-size:26px;margin:0 0 16px}
.sfh-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
.sfh-step{padding:14px;border:1px solid var(--s-line);border-radius:var(--s-radius);background:var(--s-surface);display:grid;gap:6px}
.sfh-step span{font-size:13px;color:var(--s-soft)}
.sfh-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin:12px 0 18px}
.sfh-facts div{padding:12px 14px;border-radius:var(--s-radius);background:var(--s-accent-soft);display:grid;gap:3px;font-size:14px}
.sfh-facts small{font-size:12px;color:var(--s-soft)}
@media (max-width:640px){
  .storefront .sf-cover{height:120px}
  .storefront .sf-deco{display:none}
  .sfh-acts .sf-btn:not(.sf-btn-icon){flex:1;justify-content:center}
  .sfh-how-strip b{width:100%}
}
`;

function Storefront({ shop, cfg, lang, compact=false, embedded=false, openId=null, onTrackProduct, chatStore, reviews, onAddReview, reviewerName, pop }){
  const t = I18N[lang];
  // filters live in one object and in the link (?f_size=M&pmax=300000&sort=pop), so a shared link keeps them
  const syncUrl = !(embedded || compact);
  const urlF = useMemo(()=> syncUrl? sfxRead() : null, []);
  const [cat, setCat] = useState(()=> (urlF && urlF.cat && catEntry(urlF.cat))? urlF.cat : "all");
  const [F, setF] = useState(()=> urlF? urlF.F : SFX_EMPTY);
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(null);
  const layout = cfg.layout || (THEMES[cfg.theme]||THEMES.minimal).layout;
  const vars = useMemo(()=>themeVars(cfg), [cfg.theme, cfg.palette, cfg.customPalette, cfg.font]);
  const paused = shop.status==="paused";

  // chips are the leaf categories this shop actually sells in
  const inCat = (p)=> cat==="all" || catPathIds(p.catId).includes(cat);
  // category tree: level-by-level drill-down, only branches that hold products
  const catNav = useMemo(()=>{
    const used = {};
    shop.products.forEach(p=> catPathIds(p.catId).forEach(id=>{ used[id]=(used[id]||0)+1; }));
    const count = (id)=> used[id]||0;
    const e = cat==="all"? null : catEntry(cat);
    const trail = e? e.path : [];
    let level;
    if(!e) level = catRoots().map(n=>n.id);
    else if(!e.leaf) level = ((e.node.children)||[]).map(n=>n.id);
    else level = ((catNode(e.parent)||{}).children||[]).map(n=>n.id);
    level = level.filter(count);
    const parentOfLevel = !e? "all" : (e.leaf? e.parent : cat);
    return { trail, level:level.map(id=>({ id, name:catLabel(id,lang), n:count(id) })), parentOfLevel, count };
  }, [shop.products, lang, cat]);
  const rvMap = useMemo(()=>{
    const m = {}; (reviews||[]).forEach(r=>{ (m[r.productId] = m[r.productId] || []).push(r); });
    const out = {}; Object.keys(m).forEach(pid=>{ const s = ratingStats(m[pid]); if(s && s.n) out[pid] = { avg:Number(s.avg), n:s.n }; });
    return out;
  }, [reviews]);
  const ctx = { rating:(p)=> reviewsOn()? (rvMap[p.id]||null) : null, sold:(p)=>p.stock==="sold", pop:(p)=>(pop||{})[p.id]||0 };
  // the pool = this category + the search; filters and their counts work on top of it
  const pool = useMemo(()=> shop.products.filter(p=>{
    if(!inCat(p)) return false;
    if(shop.showSold===false && p.stock==="sold") return false;
    if(q && !(textFB(p.name,lang)+" "+textFB(p.name,"en")+" "+textFB(p.desc,lang)).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [shop.products, cat, q, lang, shop.showSold]);
  const facets = useMemo(()=>sfxFacets(pool), [pool]);
  const list = sfxSort(pool.filter(p=>sfxMatch(p, F, ctx)), F.sort, ctx);
  const pickCat = (id)=>{ setCat(id); setF(f=>({ ...f, sel:{} })); };
  const clearFilters = ()=> setF(f=>({ ...SFX_EMPTY, sort:f.sort }));
  const pills = sfxPills(F, setF, facets, lang, t);
  const acct = chatStore && chatStore.account ? chatStore.account() : null;
  const mySize = acct && acct.mySize || null;
  // "My size": the first time a signed-in buyer filters by a size, it is remembered on their account
  const saveSize = (aid, v)=>{ if(!acct || !chatStore.setAccountMeta) return; const cur = acct.mySize; if(cur && cur.aid===aid && cur.v===v) return;
    chatStore.setAccountMeta({ mySize:{ aid, v } }); if(!cur) toast(t.sfx_mysize_ok); };

  // (old v1 filters below are kept unused for reference)
  const attrFilters = useMemo(()=>{
    const pool = shop.products.filter(inCat);
    const map = {};
    pool.forEach(p=>{
      variantAttrs(p.catId).forEach(a=>{
        if(!a.values || !a.values.length) return;   // seller-named options are not shop-wide filters
        (p.variants||[]).forEach(v=>{
          const val = (v.options||{})[a.id];
          if(!val) return;
          map[a.id] = map[a.id] || { attr:a, values:[] };
          if(!map[a.id].values.includes(val)) map[a.id].values.push(val);
        });
      });
    });
    return Object.keys(map).map(k=>map[k]).filter(x=>x.values.length>1).slice(0,4);
  }, [shop.products, cat]);

  // a different shop starts clean (but not on first load, so a shared link keeps its filters)
  const aboutRef = useRef(null);
  const soldTotal = Object.keys(pop||{}).reduce((n,k)=> n + (shop.products.some(p=>p.id===k)? Math.max(0, pop[k]) : 0), 0);
  const firstShop = useRef(true);
  useEffect(()=>{ if(firstShop.current){ firstShop.current = false; return; } setOpen(null); setCat("all"); setQ(""); setF(SFX_EMPTY); }, [shop.id]);
  useEffect(()=>{ if(syncUrl) sfxWrite(F, cat); }, [F, cat]);
  useEffect(()=>{
    if(!openId){ if(syncUrl && prodUrl.current) setOpen(null); return; }   // port: Back from /:handle/p/:id closes the product
    const p = shop.products.find(x=>x.id===openId);
    if(p) setOpen(p);
  },[openId, shop.id]);
  // port: the open product is in the URL (/:handle/p/:id); closing goes back to /:handle
  const prodUrl = useRef(false);
  useEffect(()=>{
    if(!syncUrl) return;
    if(!prodUrl.current){ prodUrl.current = true; return; }
    const want = open? open.id : null;
    if(want===(openId||null)) return;
    if(want) go("/"+shop.handle+"/p/"+encodeURIComponent(want)); else back("/"+shop.handle);
  },[open && open.id]);
  useEffect(()=>{ if(open && onTrackProduct) onTrackProduct(open.id); },[open&&open.id]);

  function copyLink(){
    const url = "rastashops.com/"+shop.handle;
    try{
      if(navigator.share && !embedded) navigator.share({ title:shop.name, url:"https://"+url }).catch(()=>{});
      else if(navigator.clipboard) navigator.clipboard.writeText(url);
    }catch(e){}
    setCopied(true); setTimeout(()=>setCopied(false), 2200);
  }

  const rvByProduct = useMemo(()=>{
    const m = {};
    (reviews||[]).forEach(r=>{ (m[r.productId] = m[r.productId] || []).push(r); });
    const out = {};
    Object.keys(m).forEach(pid=>{ out[pid] = ratingStats(m[pid]); });
    return out;
  }, [reviews]);
  const Card = layout==="list" ? ListCard : ProductCard;
  const idxOf = (p)=> shop.products.findIndex(x=>x.id===p.id);
  // re-resolve so stock/edits reflect live state
  const openLive = open? shop.products.find(x=>x.id===open.id) : null;
  return (
    <div className={"storefront "+cfg.theme+(compact?" compact":"")} style={{...vars, position:"relative"}}>
      <style>{SFH_CSS}</style>
      <div className="sf-cover ph" style={{"--ph-tone":shop.cover||getPalette(cfg).swatch}}>
        <div className="sf-cover-wm">{shop.name}</div>
        <ImageSlot id={"cover-"+shop.id} src={photoURL(shop.cover||getPalette(cfg).swatch, "cover-"+shop.id, 1200,360, IMG_KW[shop.type])} placeholder="Drop a cover photo" style={FILL}/>
      </div>
      <div className="sf-deco" aria-hidden="true"><div className="sf-deco-track">{[0,1,2,3,4,5,6,7].map(i=><span key={i}>{shop.name} ✦ {shop.location} ✦ rastashops.com/{shop.handle} ✦ </span>)}</div><i></i><i></i><i></i></div>
      <div className="sf-header">
        <div className="sf-wrap" data-title={shop.handle+".exe"}>
          <div className="sf-id">
            <div className="sf-avatar" style={{"--ph-tone":getPalette(cfg).swatch}}>
              <ImageSlot id={"avatar-"+shop.id} src={photoURL(getPalette(cfg).swatch, "avatar-"+shop.id, 200,200, IMG_KW[shop.type], 3)} placeholder={shop.initials} style={FILL}/>
            </div>
            <div className="sf-id-main">
              <div className="sf-name sf-display">{shop.name}</div>
              <div className="sf-handle">
                <span>@{shop.handle}</span>
                <span className="pin">{I.store({width:14,height:14})} {shop.location}</span>
                <span>{shop.products.length} {t.sf_products}</span>
              </div>
            </div>
          </div>
          <div className="sf-tag sfh-tag">{textFB(shop.tagline,lang)}</div>
          <SfTrust shop={shop} t={t} soldTotal={soldTotal}/>
          {/* products come right after this: one main action, details live in "About the shop" below */}
          <div className="sfh-acts">
            {!requestsOn() && (shop.contacts||{}).telegram && <a className="sf-btn sf-btn-accent" href={"https://t.me/"+shop.contacts.telegram} target="_blank" rel="noreferrer">{I.tg({width:17,height:17})} {t.sfh_write_tg}</a>}
            <button className="sf-btn sf-btn-line" onClick={()=>{ const el = aboutRef.current; if(el) el.scrollIntoView({ behavior:"smooth", block:"start" }); }}>{I.store({width:16,height:16})} {t.sfh_about}</button>
            {!embedded && <button className="sf-btn sf-btn-line sf-btn-icon" onClick={copyLink} aria-label={t.sf_share} title={t.sf_share}>{copied? I.check():I.share()}</button>}
          </div>
          {!ordersOn() && <SfHowTo t={t} compact/>}
        </div>
      </div>

      {!paused && shop.products.length>0 && openLive ? (
        <ProductPage p={openLive} i={idxOf(openLive)} shop={shop} lang={lang} t={t}
          chatStore={chatStore} store={storePayload(shop,cfg)}
          reviews={(reviews||[]).filter(r=>r.productId===openLive.id)}
          onAddReview={onAddReview} reviewerName={reviewerName} sold={(pop||{})[openLive.id]||0}
          onClose={()=>setOpen(null)}/>
      ) : paused ? (
        <div className="sf-wrap"><div className="sf-closed">
          <div className="sf-closed-ic">{I.store({width:26,height:26})}</div>
          <b className="sf-display">{t.sf_closed_t}</b>
          <p>{t.sf_closed_d}</p>
        </div></div>
      ) : shop.products.length===0 ? (
        <div className="sf-wrap"><div className="sf-empty big">{t.sf_setting_up}</div></div>
      ) : (
        <>
          <div className="sf-toolbar">
            <div className="sf-wrap sf-toolbar-in">
              <div className="sff-row" style={{display:"flex", gridTemplateColumns:"none"}}>
                <div className="sf-search">
                  {I.search()}
                  <input placeholder={t.sf_search} value={q} onChange={e=>setQ(e.target.value)}/>
                  {q && <button className="sff-qx" onClick={()=>setQ("")} aria-label="Clear">{I.x({width:14,height:14})}</button>}
                </div>
              </div>
              <SfCatBar nav={catNav} cat={cat} setCat={pickCat} t={t} lang={lang}/>
              <SfxBar t={t} lang={lang} pool={pool} facets={facets} F={F} setF={setF} ctx={ctx} total={list.length} mySize={mySize} onPickSize={saveSize}/>
            </div>
          </div>
          <div className="sf-wrap"><SfResultBar t={t} lang={lang} cat={cat} count={list.length} pills={pills} onClear={clearFilters}/></div>

          <div className="sf-products">
            <div className="sf-wrap">
              {list.length>0 ? (
                <div className={"lay-"+layout}>
                  {list.map(p=> <Card key={p.id} p={{ ...p, _rv: rvByProduct[p.id] }} i={idxOf(p)} shop={shop} lang={lang} t={t} onOpen={setOpen} list={layout} chatStore={chatStore} store={storePayload(shop,cfg)}/>)}
                </div>
              ) : (
                <div className="sf-empty">{pills.length? <>{t.sfx_none}<br/><button className="sf-btn sf-btn-line" style={{marginTop:12}} onClick={clearFilters}>{t.sfx_reset_all}</button></> : t.sf_empty}</div>
              )}
            </div>
          </div>
        </>
      )}

      {!paused && (
        <div className="sf-wrap sfh-about" ref={aboutRef} id="sf-about">
          <h3 className="sf-display">{t.sfh_about}</h3>
          <div className="sf-tag" style={{marginTop:0, marginBottom:16}}>{textFB(shop.tagline,lang)}</div>
          {!ordersOn() && <><div className="sf-sizes-label sf-up" style={{marginBottom:10}}>{t.sfh_how}</div><SfHowTo t={t}/></>}
          <SfFacts shop={shop} t={t} lang={lang}/>
          <SfLocation shop={shop} t={t} compact={compact}/>
          <div className="sf-reach">
            <div className="sf-reach-l">
              <div className="sf-sizes-label sf-up">{t.sf_contact}</div>
              <ContactRows shop={shop}/>
            </div>
          </div>
        </div>
      )}

      <div className="sf-footer">
        <div className="sf-wrap" style={{display:"flex", justifyContent:"space-between", width:"100%", alignItems:"center", flexWrap:"wrap", gap:12}}>
          <span>@{shop.handle} · {shop.location}</span>
          <span className="pw">{I.store({width:15,height:15})} <span>rastashops.com/{shop.handle}</span></span>
        </div>
      </div>

    </div>
  );
}

Object.assign(window, { SfTrust, SfFacts, SfHowTo, sfhSoldLabel, vPrice, pMin, pVaries, PriceTag, Storefront, themeVars, pickInk, StockBadge, ContactRows, useEscape, orderPayload, storePayload, OptionPicker, SpecTable, SizeChart });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { useState, useMemo, useEffect, useRef, themeVars, pickInk, useEscape, vPrice, pMin, pVaries, PriceTag, orderPayload, storePayload, SizeChart, OptionPicker, SpecTable, StockBadge, ProductCard, ListCard, ProductDetail, ContactRows, sfhSoldLabel, sfhPays, SfTrust, SfFacts, SfHowTo, SFH_CSS, Storefront });
