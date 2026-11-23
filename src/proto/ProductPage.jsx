// ===== Product page — full page inside the storefront (replaces the drawer), with reviews =====
function Stars({ value, size, onPick }){
  // static stars are spans — a <button> inside .pp-rv-link would nest interactive controls
  const Tag = onPick? "button" : "span";
  return (
    <span className={"stars"+(onPick?" pick":"")}>
      {[1,2,3,4,5].map(k=>(
        <Tag key={k} type={onPick? "button" : undefined}
          className={"star"+(value>=k?" on":"")} style={size?{fontSize:size}:undefined}
          onClick={onPick? ()=>onPick(k) : undefined} aria-label={onPick? k+"★" : undefined}>{"\u2605"}</Tag>
      ))}
    </span>
  );
}

function ReviewForm({ t, lang, chatStore, shopId, productId, reviews, onSubmit, onRemove }){
  const acct = chatStore && chatStore.account();
  const mine = acct && (reviews||[]).find(r=>r.author===acct.phone);
  const [rating, setRating] = React.useState(mine? mine.rating : 0);
  const [text, setText] = React.useState(mine? mine.text : "");
  const [editing, setEditing] = React.useState(!mine);
  React.useEffect(()=>{ setRating(mine? mine.rating : 0); setText(mine? mine.text : ""); setEditing(!mine); }, [acct && acct.phone, mine && mine.id]);
  if(!acct) return (
    <div className="pp-rv-form pp-rv-gate">
      <b>{t.rv_write}</b>
      <p>{t.rv_login_d}</p>
      <button className="tg-btn sm" onClick={()=>window.dispatchEvent(new CustomEvent("rasta-account"))}>{TG_I.plane({width:17,height:17})} <span>{t.rv_login}</span></button>
    </div>
  );
  const bought = (window.__shopStore? ordersForPhone(window.__shopStore, acct.phone) : []).some(o=>o.shopId===shopId && !["cancelled","declined"].includes(o.status) && (o.lines||[]).some(l=>l.productId===productId));
  const who = (
    <div className="pp-rv-who">
      <span className="bp-av sm">{buyerInitials(acct)}</span>
      <div><b>{acct.name || acct.phone}</b><small>{bought? <span className="rv-vb">{I.check({width:11,height:11})} {t.rv_verified}</span> : t.rv_public}</small></div>
    </div>
  );
  if(mine && !editing) return (
    <div className="pp-rv-form">
      <b>{t.rv_yours}</b>
      {who}
      <div className="pp-rv-mine"><Stars value={mine.rating}/>{mine.text && <p>{mine.text}</p>}</div>
      <div className="pp-rv-acts">
        <button className="sf-btn sf-btn-line" onClick={()=>setEditing(true)}>{t.rv_edit}</button>
        <button className="sf-btn sf-btn-line" onClick={()=>{ onRemove(mine.id); toast(t.rv_removed); }}>{t.g_delete}</button>
      </div>
    </div>
  );
  return (
    <div className="pp-rv-form">
      <b>{mine? t.rv_edit : t.rv_write}</b>
      {who}
      <div className="pp-rv-row"><span>{t.rv_your_rating}</span><Stars value={rating} size={26} onPick={setRating}/></div>
      <textarea rows="3" value={text} onChange={e=>setText(e.target.value)} placeholder={t.rv_text_ph}></textarea>
      <button className="sf-btn sf-btn-accent" disabled={!rating} onClick={()=>{
        onSubmit({ rating, text, name: acct.name || t.rv_anon, author: acct.phone, verified: bought });
        setEditing(false); toast(mine? t.rv_updated : t.rv_thanks);
      }}>{mine? t.rv_update : t.rv_submit}</button>
      {mine && <button className="lnk" style={{marginTop:8}} onClick={()=>setEditing(false)}>{t.g_cancel}</button>}
    </div>
  );
}

function ProductPage({ p, i, shop, lang, t, chatStore, store, reviews, onAddReview, reviewerName, onClose, sold: soldN }){
  const kw = IMG_KW[shop.type];
  const sold = p.stock==="sold";
  const [idx, setIdx] = React.useState(0);
  const offered = offeredOptions(p);
  const pickAttrs = variantAttrs(p.catId).filter(a=>(offered[a.id]||[]).length);
  const [sel, setSel] = React.useState({});
  const chosen = pickAttrs.length
    ? (pickAttrs.every(a=>sel[a.id])? variantFor(p, sel) : null)
    : ((p.variants||[])[0] || null);
  const needsPick = pickAttrs.length>0 && !chosen;
  const missing = pickAttrs.filter(a=>!sel[a.id]).map(a=>a.name[lang].toLowerCase()).join(" + ");
  const swatchAttr = pickAttrs.find(a=>a.swatch) || null;
  const colorPick = swatchAttr? sel[swatchAttr.id] : null;
  const [qty, setQty] = React.useState(1);
  const unit = chosen? vPrice(p, chosen) : pMin(p);   // the picked version's own price
  const maxQty = chosen? Math.max(1, chosen.qty) : 1;
  const [copied, setCopied] = React.useState(false);
  const tX = React.useRef(null);
  // seeded demo products have a full photo set; seller-created ones only show slots that exist
  const seeded = !!(SHOPS[shop.id] && (SHOPS[shop.id].products||[]).some(x=>x.id===p.id));
  // every photo the seller uploaded (up to 6), not only the first one; colour photos when the picked colour has them
  const NSLOT = 6;
  const genIds = React.useMemo(()=>Array.from({length:NSLOT}).map((_,k)=>pslot(shop.id,p,k)), [shop.id, p.id]);
  const colIds = React.useMemo(()=>Array.from({length:NSLOT}).map((_,k)=> colorPick? "pc-"+shop.id+"-"+p.id+"-"+colorPick+"-"+k : pslot(shop.id,p,k)), [shop.id, p.id, colorPick]);
  const genF = useSlotsFilled(genIds) || [], colF = useSlotsFilled(colIds) || [];
  const useCol = !!colorPick && (seeded || colIds.some((_,k)=>colF[k]));
  const ids = useCol? colIds : genIds, fl = useCol? colF : genF;
  const frames = seeded? Array.from({length:PRODUCT_IMAGES}).map((_,k)=>k) : ids.map((_,k)=>k).filter(k=> k===0 || fl[k]);
  const nPhotos = frames.length;
  const colorHex = colorPick? attrValueHex(swatchAttr.id, colorPick) : null;
  // light shades (ivory, white) need no tint; darker ones recolour the photo
  const tint = (hex)=>{
    if(!hex) return null;
    const c = hex.replace("#",""); const r=parseInt(c.substr(0,2),16),g=parseInt(c.substr(2,2),16),b=parseInt(c.substr(4,2),16);
    const lum = (0.299*r+0.587*g+0.114*b)/255;
    return lum > 0.86 ? null : hex;
  };
  React.useEffect(()=>{ setQty(q=>Math.min(Math.max(1,q), maxQty)); }, [chosen && chosen.id]);
  React.useEffect(()=>{ if(colorPick!=null) setIdx(0); }, [colorPick]);
  const studio = { filter:"contrast(1.04) saturate(1.05) brightness(1.03)" };
  React.useEffect(()=>{ setIdx(0); setSel({}); setQty(1); try{ window.scrollTo(0,0); }catch(e){} }, [p.id]);
  const stats = ratingStats(reviews||[]);

  function share(){
    const url = "rastashops.com/"+shop.handle+"?p="+p.id;
    try{
      if(navigator.share) navigator.share({ title:textFB(p.name,lang), url:"https://"+url }).catch(()=>{});
      else if(navigator.clipboard) navigator.clipboard.writeText(url);
    }catch(e){}
    setCopied(true); setTimeout(()=>setCopied(false), 2200);
  }

  return (
    <div className="pp">
      <div className="sf-wrap">
        <button className="pp-back" onClick={onClose}>{I.back({width:16,height:16})} {t.pp_back}</button>
        <div className="pp-grid">
          <div className="pp-media">
            <div className={"pp-gal"+(sold?" is-sold":"")} style={fxStyle(p.fx)}
              onTouchStart={e=>{ tX.current = e.touches[0].clientX; }}
              onTouchEnd={e=>{
                if(tX.current==null) return;
                const dx = e.changedTouches[0].clientX - tX.current;
                if(Math.abs(dx)>45) setIdx(x=>Math.max(0, Math.min(nPhotos-1, x+(dx<0?1:-1))));
                tX.current = null;
              }}>
              {frames.map((fk,k)=>{
                const perColor = useCol;
                const sid = ids[fk];
                const src = !seeded? undefined
                  : photoURL(p.tone, sid, 560,700, kw, i+fk*2);
                // demo photos are tinted to fake a colour; real seller photos are never recoloured
                const tw = perColor && seeded? tint(colorHex) : null;
                return (
                  <div key={perColor? sid : k} className={"sf-gal-frame"+(idx===k?" on":"")}>
                    <ImageSlot id={sid} src={src} placeholder={textFB(p.name,"en").toLowerCase()} style={{...FILL, ...studio}}/>
                    {tw && <span className="pp-tint" style={{background:tw}}></span>}
                  </div>
                );
              })}
              <StockBadge stock={p.stock} t={t}/>
              {idx>0 && <button className="sf-gal-nav prev" aria-label="previous photo" onClick={()=>setIdx(idx-1)}>{I.back({width:18,height:18})}</button>}
              {idx<nPhotos-1 && <button className="sf-gal-nav next" aria-label="next photo" onClick={()=>setIdx(idx+1)}>{I.arrow({width:18,height:18})}</button>}
              {nPhotos>1 && (
                <div className="sf-gal-dots ind">
                  {Array.from({length:nPhotos}).map((_,k)=>(
                    <span key={k} className={"sf-gal-dot"+(idx===k?" on":"")}></span>
                  ))}
                </div>
              )}
            </div>
            {nPhotos>1 && (
              <div className="pp-thumbs">
                {frames.map((fk,k)=>{
                  const src = seeded? photoURL(p.tone, pslot(shop.id,p,fk), 120,150, kw, i+fk*2) : null;
                  const tw = useCol && seeded? tint(colorHex) : null;
                  return (
                    <button key={k} className={"pp-thumb"+(idx===k?" on":"")} aria-label={"photo "+(k+1)}
                      onClick={()=>setIdx(k)} style={{position:"relative", overflow:"hidden", backgroundImage: src? "url("+src+")" : undefined}}>
                      {!seeded && <span style={{position:"absolute", inset:0, pointerEvents:"none"}}><ImageSlot id={ids[fk]} placeholder="" style={FILL}/></span>}
                      {tw && <span className="pp-tint" style={{background:tw}}></span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pp-info">
            <div className="pname sf-display">{textFB(p.name,lang)}</div>
            <div className="pp-price-row">
              <div className="pprice">{chosen? fmtPrice(unit, lang) : <PriceTag p={p} lang={lang} t={t}/>}</div>
              {soldN>0 && <span className="pp-sold" style={{fontSize:13, fontWeight:600, color:"var(--s-soft)"}}>{I.bag({width:14,height:14})} {fill(t.sfh_sold,{n:sfhSoldLabel(soldN)})}</span>}
              {reviewsOn() && stats.n>0 && (
                <button className="pp-rv-link" onClick={()=>{ const el=document.getElementById("pp-reviews"); if(el) el.parentElement.scrollTop = el.offsetTop; }}>
                  <Stars value={Math.round(stats.avg)}/> <b>{stats.avg}</b> · {fill(t.rv_count,{n:stats.n})}
                </button>
              )}
            </div>
            <div className="sf-detail-desc">{textFB(p.desc,lang)}</div>
            {pickAttrs.length>0 && <OptionPicker p={p} offered={offered} sel={sel} setSel={setSel} t={t} lang={lang}/>}
            {/* buying goes through the basket only — no direct "send to the shop" from a product */}
            {!ordersOn() && !requestsOn() && <ContactShop shop={shop} store={store} t={t} product={orderPayload(shop,p,i,lang,chosen,1)}/>}
            {!ordersOn() && <SfFacts shop={shop} t={t} lang={lang}/>}
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
                  product={orderPayload(shop,p,i,lang,chosen,qty)} blocked={needsPick || sold}
                  label={needsPick? fill(t.opt_pick_hint,{what:missing})
                       : sold? t.sf_sold
                       : fill(ordersOn()? t.opt_ready : t.rq_add_sum,{sum:fmtPrice(unit*qty, lang)})}/>
              </div>
            )}
            <div className="sf-detail-cta" style={{display:"flex"}}>
              <button className="sf-btn sf-btn-line" onClick={share}>{copied? I.check():I.share()} {copied? t.sf_copied_p : t.sf_share_p}</button>
            </div>
            <SpecTable p={p} t={t} lang={lang}/>
            <div className="sf-contact-block">
              <div className="sf-sizes-label sf-up">{t.sf_contact}</div>
              <ContactRows shop={shop}/>
            </div>
          </div>
        </div>

        {reviewsOn() && <div className="pp-reviews" id="pp-reviews">
          <div className="pp-rv-head">
            <b className="sf-display">{t.rv_title}</b>
            {stats.n>0 && <span className="pp-rv-sum"><Stars value={Math.round(stats.avg)}/> <b>{stats.avg}</b> · {fill(t.rv_based,{n:stats.n})}</span>}
          </div>
          {stats.n===0 && <div className="pp-rv-none"><b>{t.rv_none}</b><p>{t.rv_none_d}</p></div>}
          <div className="pp-rv-grid">
            <div className="pp-rv-list">
              {(reviews||[]).map(r=>(
                <div key={r.id} className={"pp-rv"+(chatStore && chatStore.account() && r.author===chatStore.account().phone? " mine":"")}>
                  <div className="pp-rv-top">
                    <span className="pp-rv-av">{(r.name||"?").trim().split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase()}</span>
                    <div className="pp-rv-n"><b>{r.name || t.rv_anon}</b>{r.verified && <small className="rv-vb">{I.check({width:11,height:11})} {t.rv_verified}</small>}</div>
                    <span>{fmtDate(r.editedAt||r.at, lang)}{r.editedAt? " · "+t.rv_edited : ""}</span>
                  </div>
                  <Stars value={r.rating}/>
                  {r.text && <p>{r.text}</p>}
                </div>
              ))}
            </div>
            {onAddReview && <ReviewForm t={t} lang={lang} chatStore={chatStore} shopId={shop.id} productId={p.id} reviews={reviews}
              onSubmit={(rev)=>onAddReview({ ...rev, productId:p.id })}
              onRemove={(id)=>window.__shopStore && window.__shopStore.removeReview(shop.id, id)}/>}
          </div>
        </div>}
      </div>
    </div>
  );
}

Object.assign(window, { ProductPage, Stars, ReviewForm });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { Stars, ReviewForm, ProductPage });
