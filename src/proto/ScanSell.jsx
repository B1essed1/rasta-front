// ===== Scan & Sell — phone-width POS panel =====
// Several customers at once: "Next customer" puts the current sale on hold (it keeps its items and payment)
// and starts a new one. Tabs at the top switch between them; finishing one jumps to the next waiting sale.
// Open sales survive a reload (saved per shop on this device).
addI18N({
  pos_cust:       ["Customer {n}", "Покупатель {n}", "Xaridor {n}"],
  pos_waiting:    ["waiting", "ждёт", "kutmoqda"],
  pos_now:        ["now", "сейчас", "hozir"],
  pos_next:       ["Next customer", "Следующий", "Keyingi xaridor"],
  pos_next_d:     ["Put this sale on hold and serve the next customer", "Отложить эту продажу и обслужить следующего", "Bu xaridni kutishga qo‘yib, keyingi xaridorga xizmat qilish"],
  pos_held_toast: ["Customer {n} is waiting — the sale is saved", "Покупатель {n} ждёт — продажа сохранена", "Xaridor {n} kutmoqda — xarid saqlandi"],
  pos_back_toast: ["Back to Customer {n}", "Снова покупатель {n}", "Yana Xaridor {n}"],
  pos_drop:       ["Cancel this customer's sale?", "Отменить продажу этого покупателя?", "Bu xaridorning xaridi bekor qilinsinmi?"],
  pos_max:        ["Up to {n} customers at once", "Не больше {n} покупателей сразу", "Bir vaqtda {n} tagacha xaridor"],
});
const POS_MAX = 8;

function ScanSell({ store, shop, t, lang, onClose, onAddProduct }){
  const st = store.settings(shop.id);
  const products = store.products(shop.id);
  const [manual, setManual] = React.useState(false);
  // ---- several open sales (one per waiting customer) ----
  const defPay = (st.payments||["cash"])[0] || "cash";
  const POS_KEY = "rasta.pos.carts."+shop.id;
  const fresh = (no)=> ({ id:"c"+no+"-"+Date.now(), no, items:[], pay:defPay, at:Date.now() });
  const [carts, setCarts] = React.useState(()=>{
    try{ const s = JSON.parse(localStorage.getItem(POS_KEY)||"null"); if(s && s.list && s.list.length && s.list.some(c=>c.id===s.active)) return s; }catch(e){}
    const c = fresh(1); return { list:[c], active:c.id, seq:1 };
  });
  React.useEffect(()=>{ try{ localStorage.setItem(POS_KEY, JSON.stringify(carts)); }catch(e){} }, [carts]);
  const act = carts.list.find(c=>c.id===carts.active) || carts.list[0];
  const cart = act.items, pay = act.pay;
  const setCart = (fn)=> setCarts(s=>({ ...s, list:s.list.map(c=> c.id===s.active? { ...c, items: typeof fn==="function"? fn(c.items) : fn } : c) }));
  const setPay = (p)=> setCarts(s=>({ ...s, list:s.list.map(c=> c.id===s.active? { ...c, pay:p } : c) }));
  const nextCustomer = ()=>{
    if(carts.list.length>=POS_MAX){ toast(fill(t.pos_max,{n:POS_MAX}), "warn"); return; }
    toast(fill(t.pos_held_toast,{n:act.no}));
    setCarts(s=>{ const no = Math.max(0, ...s.list.map(c=>c.no))+1; const c = fresh(no); return { list:[...s.list, c], active:c.id, seq:no }; });
  };
  const switchCart = (id)=>{ const c = carts.list.find(x=>x.id===id); if(c && id!==carts.active) toast(fill(t.pos_back_toast,{n:c.no})); setCarts(s=>({ ...s, active:id })); };
  // finishing or cancelling a sale: drop it and jump to the customer who has waited longest
  const dropCart = (id)=> setCarts(s=>{
    let list = s.list.filter(c=>c.id!==id);
    if(!list.length){ const c = fresh(1); return { list:[c], active:c.id, seq:1 }; }
    const waiting = list.filter(c=>c.items.length).sort((a,b)=>a.at-b.at)[0];
    const active = s.active===id? (waiting || list[0]).id : s.active;
    return { ...s, list, active };
  });
  const [q, setQ] = React.useState("");
  const [warn, setWarn] = React.useState(null);
  const [flash, setFlash] = React.useState(null);
  const [err, setErr] = React.useState(null);
  const [camState, setCamState] = React.useState("idle");
  const videoRef = React.useRef(null);
  const buf = React.useRef("");
  useEscape(onClose);

  const sales = store.sales(shop.id);
  const today = sales.filter(s=> new Date(s.at).toDateString()===new Date().toDateString());
  const todayItems = today.reduce((n,s)=>n+s.lines.reduce((m,l)=>m+(l.qty-l.returned),0),0);
  const todayRev = today.reduce((n,s)=>n+s.total,0);

  React.useEffect(()=>{
    let stream, timer, det, stop=false;
    if(manual) return;
    (async ()=>{
      try{
        stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:"environment" } });
        if(videoRef.current){ videoRef.current.srcObject = stream; await videoRef.current.play().catch(()=>{}); }
        setCamState("live");
        if("BarcodeDetector" in window){
          det = new window.BarcodeDetector({ formats:["code_128","ean_13","upc_a","qr_code"] });
          const tick = async ()=>{
            if(stop) return;
            try{ const codes = await det.detect(videoRef.current); if(codes && codes[0]) handleCode(codes[0].rawValue); }catch(e){}
            timer = setTimeout(tick, 400);
          };
          tick();
        }
      }catch(e){ setCamState("denied"); }
    })();
    return ()=>{ stop=true; clearTimeout(timer); if(stream) stream.getTracks().forEach(x=>x.stop()); };
  },[manual]);

  // keyboard-wedge scanner always listening
  React.useEffect(()=>{
    function onKey(e){
      if(e.target && /input|textarea/i.test(e.target.tagName)) return;
      if(e.key==="Enter"){ if(buf.current.length>3){ handleCode(buf.current); } buf.current=""; return; }
      if(e.key.length===1) buf.current += e.key;
      if(buf.current.length>40) buf.current="";
    }
    window.addEventListener("keydown", onKey);
    return ()=> window.removeEventListener("keydown", onKey);
  },[products]);

  function addRow(p, v, force){
    if(v.qty<=0 && !force){ setWarn({ p, v }); return; }
    setCart(c=>{
      const i = c.findIndex(l=>l.variantId===v.id);
      if(i>=0){ const out=[...c]; out[i]={...out[i], qty:out[i].qty+1}; return out; }
      return [...c, { variantId:v.id, productId:p.id, name:textFB(p.name,lang), label:vLabel(p,v,lang), qty:1, unit:(v.price!=null? v.price : p.price), over:v.qty<=0 }];
    });
    setErr(null); setWarn(null);
    setFlash(textFB(p.name,lang)+(vLabel(p,v,lang)? " · "+vLabel(p,v,lang) : ""));
    setTimeout(()=>setFlash(null), 1500);
  }
  function handleCode(code){
    const hit = store.findByBarcode(shop.id, code);
    if(!hit){ setErr(String(code)); return; }
    addRow(hit.p, hit.v);
  }
  const total = cart.reduce((n,l)=>n+l.qty*l.unit,0);
  const items = cart.reduce((n,l)=>n+l.qty,0);

  const searchRows = [];
  products.forEach(p=>p.variants.forEach(v=>{
    const hay=(textFB(p.name,lang)+" "+textFB(p.name,"en")+" "+vLabel(p,v,lang)+" "+v.barcode).toLowerCase();
    if(!q || hay.includes(q.toLowerCase())) searchRows.push({p,v});
  }));

  return (
    <div className="pos-scrim">
      <div className="pos">
        <div className="pos-top">
          <button className="icon-btn light" onClick={onClose} aria-label={t.g_close}>{I.x()}</button>
          <div className="pos-title">{I.scan({width:17,height:17})} {t.db_scan}<span className="pos-as">· {staffFirst(store.operator(shop.id), t)}</span></div>
        </div>

        <div className="pos-scan">
          {!manual ? (
            <div className="pos-cam">
              <video ref={videoRef} playsInline muted></video>
              <div className="pos-reticle"><span className="pos-scanline"></span></div>
              <div className="pos-cam-hint">{camState==="denied"? t.sc_cam_off : t.sc_point}</div>
            </div>
          ) : (
            <div className="pos-manual">
              <div className="inline-search dark">{I.search({width:17,height:17})}
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.inv_search} autoFocus/>
              </div>
              <div className="pos-list scroll-y">
                {searchRows.slice(0,30).map(({p,v})=>(
                  <button key={v.id} className="pos-item" onClick={()=>addRow(p,v)}>
                    <div className="pos-item-ph"><ImageSlot id={pslot(shop.id,p,0)} src={photoURL(p.tone,pslot(shop.id,p,0),80,80,IMG_KW[shop.type],products.findIndex(x=>x.id===p.id))} placeholder="" style={FILL}/></div>
                    <div className="pos-item-m"><b>{textFB(p.name,lang)}</b><span>{vLabel(p,v,lang)? vLabel(p,v,lang)+" · ":""}{t.inv_qty} {v.qty}</span></div>
                    <span className="pos-item-p">{fmtNum(v.price!=null? v.price : p.price)}</span>
                  </button>
                ))}
                {searchRows.length===0 && <div className="pos-cart-empty" style={{height:120}}>{t.inv_no_match}</div>}
              </div>
              <button className="pos-alt inline" onClick={()=>setManual(false)}>{I.camera({width:15,height:15})} {t.sc_camera}</button>
            </div>
          )}
          {!manual && (
            <button className="pos-alt inline" onClick={()=>setManual(true)}>{I.search({width:14,height:14})} {t.sc_enter}</button>
          )}
          {!manual && (
            <button className="pos-sim" onClick={()=>{
              const all=[]; products.forEach(p=>p.variants.forEach(v=>all.push(v.barcode)));
              if(all.length) handleCode(all[Math.floor(Math.random()*all.length)]);
            }}>{I.spark({width:14,height:14})} {t.sc_demo_scan}</button>
          )}
        </div>

        <div className="pos-alerts">
          {flash && <div className="pos-flash">{I.check({width:16,height:16})} <b>{flash}</b> {t.sc_added}</div>}
          {warn && (
            <div className="pos-warncard">
              <div className="pw-t">{I.warn({width:16,height:16})} {fill(t.sc_soldout_line,{name:textFB(warn.p.name,lang)+(vLabel(warn.p,warn.v,lang)? " · "+vLabel(warn.p,warn.v,lang):"")})}</div>
              <div className="pw-acts">
                <button className="btn btn-ghost btn-xs" onClick={()=>setWarn(null)}>{t.g_cancel}</button>
                <button className="btn btn-amber btn-xs" onClick={()=>addRow(warn.p, warn.v, true)}>{t.sc_sell_anyway}</button>
              </div>
            </div>
          )}
          {err && (
            <div className="pos-err">
              <b>{t.sc_notfound}</b><code>{err}</code>
              <div className="pos-err-acts">
                <button className="btn btn-accent btn-xs" onClick={()=>{ setErr(null); onAddProduct&&onAddProduct(); }}>{I.plus({width:14,height:14})} {t.sc_addnew}</button>
                <button className="btn btn-ghost btn-xs" onClick={()=>setErr(null)}>{t.g_close}</button>
              </div>
            </div>
          )}
        </div>

        {/* customers being served: tap a tab to switch, "Next customer" puts this one on hold */}
        <div className="pos-tabs" style={{display:"flex", gap:8, overflowX:"auto", padding:"10px 12px", borderTop:"1px solid rgba(255,255,255,.1)", flex:"none"}}>
          {carts.list.map(c=>{ const n = c.items.reduce((m,l)=>m+l.qty,0); const sum = c.items.reduce((m,l)=>m+l.qty*l.unit,0); const on = c.id===act.id;
            return (
              <div key={c.id} style={{flex:"none", display:"flex", alignItems:"stretch", borderRadius:12, border:"1.5px solid "+(on? "#e8573a" : "rgba(255,255,255,.2)"), background:on? "rgba(232,87,58,.16)" : "transparent"}}>
                <button type="button" onClick={()=>switchCart(c.id)} aria-pressed={on}
                  style={{display:"grid", textAlign:"left", gap:2, padding:"7px 10px 7px 12px", background:"none", border:0, color:"inherit", cursor:"pointer", font:"inherit"}}>
                  <b style={{fontSize:13.5, whiteSpace:"nowrap"}}>{fill(t.pos_cust,{n:c.no})} <span style={{fontWeight:600, color: on? "#ffb39f" : (n? "#f5b041" : "rgba(255,255,255,.55)")}}>· {on? t.pos_now : t.pos_waiting}</span></b>
                  <small style={{opacity:.75, whiteSpace:"nowrap"}}>{n} {t.sc_items} · {fmtNum(sum)}</small>
                </button>
                {carts.list.length>1 && (
                  <button type="button" aria-label={t.pos_drop} title={t.pos_drop}
                    onClick={()=>{ if(!c.items.length || window.confirm(t.pos_drop)) dropCart(c.id); }}
                    style={{padding:"0 9px", background:"none", border:0, borderLeft:"1px solid rgba(255,255,255,.12)", color:"inherit", opacity:.7, cursor:"pointer"}}>{I.x({width:13,height:13})}</button>
                )}
              </div>
            ); })}
          <button type="button" onClick={nextCustomer} disabled={!cart.length} title={t.pos_next_d}
            style={{flex:"none", display:"inline-flex", alignItems:"center", gap:6, padding:"0 14px", borderRadius:12, border:"1.5px dashed rgba(255,255,255,.35)", background:"none", color:"inherit", fontWeight:700, cursor: cart.length? "pointer" : "default", opacity: cart.length? 1 : .4, whiteSpace:"nowrap", font:"inherit"}}>
            {I.plus({width:15,height:15})} {t.pos_next}</button>
        </div>

        <div className="pos-cart-list scroll-y">
          {cart.length===0 && <div className="pos-cart-empty">{I.scan({width:24,height:24})}<span>{t.sc_cart_empty}</span></div>}
          {cart.map((l,i)=>(
            <div key={l.variantId} className="pos-line">
              <div className="pl-main">
                <b>{l.name}{l.over && <span className="pl-over">{t.inv_override}</span>}</b>
                <span>{l.label? l.label+" · ":""}
                  <input className="pl-price" value={l.unit} inputMode="numeric" title={t.sc_discount}
                    onChange={e=>{ const v=Number(e.target.value.replace(/\D/g,""))||0; setCart(c=>c.map((x,k)=>k===i?{...x,unit:v}:x)); }}/>
                  <span className="pl-cur">{CURRENCY[lang]}</span>
                </span>
              </div>
              <Stepper value={l.qty} min={1} onChange={n=>setCart(c=>c.map((x,k)=>k===i?{...x,qty:n}:x))}/>
              <span className="pl-sum">{fmtNum(l.qty*l.unit)}</span>
              <button className="icon-btn sm" onClick={()=>setCart(c=>c.filter((_,k)=>k!==i))} aria-label={t.g_delete}>{I.x({width:14,height:14})}</button>
            </div>
          ))}
        </div>

        <div className="pos-foot">
          <div className="pos-paychips">
            {PAY_METHODS.filter(m=>(st.payments||[]).includes(m.id)||m.id==="cash").map(m=>(
              <button key={m.id} className={"pick-chip"+(pay===m.id?" on":"")} onClick={()=>setPay(m.id)}>{m.label[lang]}</button>
            ))}
          </div>
          <div className="pos-total"><span>{carts.list.length>1? fill(t.pos_cust,{n:act.no})+" · " : ""}{items} {t.sc_items}</span><b>{fmtPrice(total,lang)}</b></div>
          <button className="btn btn-accent" disabled={!cart.length} onClick={()=>{
            store.completeSale(shop.id, cart.map(({variantId,productId,name,label,qty,unit})=>({variantId,productId,name,label,qty,unit})), pay);
            toast(t.sc_recorded+" · "+fmtPrice(total,lang));
            // this customer is done — continue with whoever is waiting (or start clean)
            dropCart(act.id);
          }}>{I.check({width:18,height:18})} {t.sc_complete}</button>
          <div className="pos-today">{t.sc_today}: <b>{todayItems} {t.sc_items}</b> · <b>{fmtPrice(todayRev,lang)}</b></div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScanSell });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { POS_MAX, ScanSell });
