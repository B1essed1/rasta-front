// ===== Sales — revenue, cost, gross profit, returns =====
function ReturnModal({ sale, line, t, lang, onClose, onConfirm }){
  const max = line.qty - line.returned;
  const [qty, setQty] = React.useState(max);
  const [mode, setMode] = React.useState("stock");
  return (
    <Modal title={t.sl_return_t} sub={line.name+(line.label && line.label!=="default"? " · "+line.label : "")+" · #"+sale.no} onClose={onClose}
      foot={<>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>{t.g_cancel}</button>
        <div className="mf-right"><button className="btn btn-accent btn-sm" disabled={!qty} onClick={()=>{ onConfirm(qty, mode); onClose(); }}>{t.sl_confirm}</button></div>
      </>}>
      <div className="field"><label>{t.inv_qty} · max {max}</label>
        <Stepper value={qty} min={1} onChange={n=>setQty(Math.min(max,n))}/>
      </div>
      <div className="field"><label>{t.inv_reason}</label>
        <div className="radio-list">
          {[["stock",t.sl_return_stock],["writeoff",t.sl_return_off]].map(([id,lab])=>(
            <label key={id} className={"radio"+(mode===id?" on":"")}>
              <input type="radio" checked={mode===id} onChange={()=>setMode(id)}/>
              <span className="radio-dot"></span>{lab}
            </label>
          ))}
        </div>
      </div>
    </Modal>
  );
}

addI18N({
  sl_c_items:   ["Products", "Товары", "Mahsulotlar"],
  sl_c_pay:     ["Payment", "Оплата", "To‘lov"],
  sl_c_seller:  ["Seller", "Продавец", "Sotuvchi"],
  sl_c_status:  ["Status", "Статус", "Holat"],
  sl_st_done:   ["Completed", "Завершена", "Yakunlandi"],
  sl_st_part:   ["Partly returned", "Частичный возврат", "Qisman qaytarildi"],
  sl_st_ret:    ["Returned", "Возврат", "Qaytarildi"],
  sl_k_rev:     ["Revenue", "Выручка", "Tushum"],
  sl_k_receipts:["Number of sales", "Кол-во продаж", "Sotuvlar soni"],
  sl_k_units:   ["items sold", "шт продано", "dona sotildi"],
  sl_k_avg:     ["Average sale", "Средний чек", "O‘rtacha chek"],
  sl_k_ret:     ["Returns", "Возвраты", "Qaytarishlar"],
  sl_k_daily:   ["Revenue by day", "Выручка по дням", "Kunlik tushum"],
  sl_k_pay:     ["By payment type", "По способу оплаты", "To‘lov turlari bo‘yicha"],
  sl_k_sales:   ["sales", "продаж", "ta sotuv"],
  sl_more_n:    ["+{n} more", "+ещё {n}", "+{n} ta boshqa"],
  sl_search:    ["Receipt no., product or barcode", "№ чека, товар или штрихкод", "Chek raqami, mahsulot yoki shtrix-kod"],
  sl_none:      ["No sales for these filters", "Нет продаж по этим фильтрам", "Bu filtrlar bo‘yicha sotuv yo‘q"],
  sl_c_line:    ["Qty × price", "Кол-во × цена", "Soni × narxi"],
});
// Sales: same table look as Stock / History — ID first, then what you need at a glance
const SL_COLS = "84px minmax(250px,2fr) 70px 120px 110px 110px 170px 150px 150px 36px";
const SL_LINE_COLS = "minmax(260px,2fr) 140px 120px 110px 160px";
const SL_PAY = [["#e2f3ea","#1f7a4d"],["#e6edf8","#2f5ea8"],["#eee8f8","#5b3d99"],["#fdf0d9","#8a5a14"],["#f1efe9","#5c564c"]];
const SL_ST = { done:["#e2f3ea","#1f7a4d"], part:["#fdf0d9","#8a5a14"], ret:["#fde7e2","#b83f28"] };
const slPill = (c, txt)=> <span style={{display:"inline-block", padding:"3px 10px", borderRadius:999, fontSize:12.5, fontWeight:700, background:c[0], color:c[1], whiteSpace:"nowrap"}}>{txt}</span>;
const slHM = (ts)=>{ const d = new Date(ts); return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); };
const slCalc = (s)=>{ let n=0, sum=0, cost=0, costKnown=true, retN=0, retSum=0;
  s.lines.forEach(l=>{ const r = l.returned||0, k = l.qty - r; retN += r; retSum += r*l.unit; if(k<=0) return;
    n += k; sum += k*l.unit; if(l.cost!=null) cost += k*l.cost; else costKnown = false; });
  return { n, sum, cost, profit: costKnown? sum-cost : null, retN, retSum, status: n===0? "ret" : retN>0? "part" : "done" }; };

// the revenue chart's buckets from the server's per-day totals (BACKEND-PLAN §23): days / weeks as before
function slBuckets(days, since, until, minAt, total){
  const DAY = 86400000;
  const day0 = (ts)=> new Date(hxISO(ts)+"T00:00:00").getTime();
  const endTs = day0(Math.min(Date.now(), until));
  const startTs = since? day0(since) : (total? day0(minAt) : endTs);
  const nDays = Math.max(1, Math.round((endTs - startTs)/DAY) + 1);
  const bSize = Math.ceil(nDays/31);
  const buckets = Array.from({length:Math.ceil(nDays/bSize)}, (_,i)=>({ at: startTs + i*bSize*DAY, v:0, n:0 }));
  (days||[]).forEach(d=>{ const i = Math.floor(Math.round((d.at - startTs)/DAY)/bSize); if(buckets[i]){ buckets[i].v += d.v; buckets[i].n += d.n; } });
  return { buckets, bSize };
}

// Sales come from the server in pages with the period's totals (BACKEND-PLAN §23): the browser keeps only 2 days.
function SalesView({ store, shop, t, lang, onOpenOrders, viewer }){
  const st = store.settings(shop.id);
  const idx = store.variantIndex(shop.id);
  const prods = store.products(shop.id);
  const vw = viewer || store.operator(shop.id);
  const vp = permsOf(vw);
  const mine = vw.role==="cashier";
  const team = store.team(shop.id);
  const [who, setWho] = React.useState("all");
  const [from, setFrom] = React.useState(()=>hxISO(Date.now()-29*86400000));
  const [to, setTo] = React.useState(()=>hxISO(Date.now()));
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(null);
  const [ret, setRet] = React.useState(null);
  const [manual, setManual] = React.useState(false);

  const DAY = 86400000;
  const sellerOf = (s)=> store.saleSeller(shop.id, s);
  const sellerName = (s)=>{ const m = team.find(x=>x.id===sellerOf(s)); return m? staffName(m,t) : "—"; };
  const since = from? new Date(from+"T00:00:00").getTime() : 0;
  const until = to? new Date(to+"T23:59:59").getTime() : Infinity;
  const inRange = (ts)=> ts>=since && ts<=until;
  const lineVar = (l)=>{ const x = idx[l.variantId];
    return (x && variantLabel(x.p.catId, x.v.options||{}, lang)) || (l.label && l.label!=="default"? l.label : "") || (x? catLabel(x.p.catId, lang) : ""); };
  const lineName = (l)=>{ const x = idx[l.variantId]; return x? textFB(x.p.name, lang) : l.name; };
  // the period's sales (seller, search) in pages; the totals below are the whole period's, from the server
  const query = (page, size)=> store.dashGet(shop.id, "/sales/page?"+dashQS({ from:since, to:until, seller: mine? vw.id : (who==="all"? "" : who),
    q, lang, tz:new Date().getTimezoneOffset(), page, size }));
  const pages = useDashPages(query, JSON.stringify([since, until, who, q, lang, mine && vw.id]), store.histRev(shop.id));
  const list = pages.items;
  const sm = (pages.res && pages.res.summary) || { revenue:0, cost:0, counted:0, uncounted:0, units:0, retSum:0, receipts:0, pay:{}, losses:0 };
  const revenue = sm.revenue, cost = sm.cost||0, counted = sm.counted, uncounted = sm.uncounted, units = sm.units, retSum = sm.retSum, receipts = sm.receipts;
  const payTot = sm.pay || {};
  const profit = revenue - cost;
  const profitPct = revenue? Math.round(profit/revenue*100) : 0;
  const avg = receipts? Math.round(revenue/receipts) : 0;
  const losses = sm.losses||0;
  const pending = ordersOn()? store.orders(shop.id).filter(o=>o.status==="new") : [];
  const payLabel = (id)=>{ const m=PAY_METHODS.find(x=>x.id===id); return m? m.label[lang] : id; };
  const payColor = (id)=>{ const i = PAY_METHODS.findIndex(m=>m.id===id); return i<0? SL_PAY[SL_PAY.length-1] : SL_PAY[i % (SL_PAY.length-1)]; };
  const payRows = Object.keys(payTot).map(k=>[k, payTot[k]]).filter(r=>r[1]>0).sort((a,b)=>b[1]-a[1]);

  // revenue by day (by week-ish buckets when the range is long), from the server's per-day totals
  const { buckets, bSize } = slBuckets(pages.res && pages.res.days, since, until, pages.res && pages.res.minAt, pages.total);
  const bMax = Math.max(1, ...buckets.map(b=>b.v));

  const photo = (x)=> <span className="stk-photo">{x? <ImageSlot id={pslot(shop.id,x.p,0)} src={photoURL(x.p.tone, pslot(shop.id,x.p,0), 90,90, IMG_KW[shop.type], prods.findIndex(y=>y.id===x.p.id))} placeholder="" style={FILL}/> : null}</span>;

  async function exportCSV(){
    if(st.plan!=="pro"){ toast(t.inv_pro_only, "warn"); return; }
    let all;
    try{ all = (await dashAll(query)).items; }catch(e){ toast(Api.errorText(e, lang), "err"); return; }
    const rows = [["id","date","time","product","variant","barcode","qty","price","amount","cost","profit","payment","seller","status"]];
    all.forEach(s=>{ const c = slCalc(s); s.lines.forEach(l=>{
      const k = l.qty-(l.returned||0); const x = idx[l.variantId];
      rows.push(["#"+s.no, hxDate(s.at), slHM(s.at), lineName(l), lineVar(l), x? (x.v.barcode||"") : "", k, l.unit, k*l.unit, l.cost==null?"":l.cost,
        l.cost==null?"":k*(l.unit-l.cost), payLabel(s.pay), sellerName(s), t["sl_st_"+c.status]]);
    }); });
    try{
      const csv = rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(",")).join("\n");
      const a=document.createElement("a");
      a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
      a.download=shop.handle+"-sales.csv"; a.click();
    }catch(e){}
    toast(t.sl_export);
  }

  const num = { textAlign:"right", whiteSpace:"nowrap" };
  return (
    <div className="sales hx">
      <div className="db-sec-head">
        <div><h2>{t.db_sales}</h2><div className="sub">{t.sl_sub}</div></div>
        <div className="head-acts">
          <button className="btn btn-soft btn-sm" onClick={exportCSV}>{I.down({width:16,height:16})} {t.sl_export}{st.plan!=="pro"? <span className="pro-badge">Pro</span> : null}</button>
          <button className="btn btn-accent btn-sm" onClick={()=>setManual(true)}>{I.plus({width:16,height:16})} {t.sl_manual}</button>
        </div>
      </div>

      <div className="inv-bar hx-bar" style={{alignItems:"center"}}>
        <div className="inline-search grow">{I.search({width:17,height:17})}<input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.sl_search}/></div>
        <HxRange from={from} to={to} t={t} lang={lang} onChange={(f, tt)=>{ setFrom(f); setTo(tt); }}/>
      </div>

      {mine ? <div className="tm-mine">{I.team({width:15,height:15})} {t.tm_my_sales} · {staffName(vw,t)}</div> : team.length>1 && (
        <div className="chip-row tm-filter">
          <button className={"pick-chip"+(who==="all"?" on":"")} onClick={()=>setWho("all")}>{t.tm_all}</button>
          {team.filter(m=>m.status!=="invited").map(m=>(
            <button key={m.id} className={"pick-chip"+(who===m.id?" on":"")} onClick={()=>setWho(m.id)}><StaffAv m={m} t={t} size={20}/>{staffName(m,t)}</button>
          ))}
        </div>
      )}

      <div className="hx-cards" style={{gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))"}}>
        <div className="hx-card"><span>{t.sl_k_rev}</span><b>{fmtNum(revenue)}</b><small>{receipts} {t.sl_k_sales} · {units} {t.sl_k_units}</small></div>
        {vp.costs && <div className="hx-card"><span>{t.sl_profit} <Info text={t.pf_what}/></span><b className={profit<0?"down":""}>{fmtNum(profit)}</b>
          <small>{profitPct}%{uncounted>0? " · "+fill(t.sl_profit_note,{a:counted,b:units,c:uncounted}) : ""}</small></div>}
        <div className="hx-card"><span>{t.sl_k_receipts}</span><b>{receipts}</b><small>{units} {t.sl_k_units}</small></div>
        <div className="hx-card"><span>{t.sl_k_avg}</span><b>{fmtNum(avg)}</b></div>
        <div className="hx-card"><span>{t.sl_k_ret}</span><b className={retSum? "down" : ""}>{fmtNum(retSum)}</b>{vp.costs && <small>{t.sl_losses}: {fmtNum(losses)}</small>}</div>
      </div>

      {pages.total>0 && (
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:14, margin:"14px 0"}}>
          <div className="hx-panel" style={{gridColumn:"span 2", minWidth:0}}>
            <div className="hx-ph"><b>{t.sl_k_daily}</b></div>
            <div style={{display:"flex", alignItems:"flex-end", gap:3, height:130}}>
              {buckets.map((b,i)=>(
                <div key={i} title={hxDate(b.at)+(bSize>1? " – "+hxDate(b.at+(bSize-1)*DAY) : "")+" · "+fmtNum(b.v)+" · "+b.n+" "+t.sl_k_sales} style={{flex:1, height:"100%", display:"flex", alignItems:"flex-end"}}>
                  <i style={{display:"block", width:"100%", height:(b.v? Math.max(3, b.v/bMax*100) : 0)+"%", background:"var(--primary)", borderRadius:"4px 4px 0 0"}}></i>
                </div>
              ))}
            </div>
            <div className="hx-axis"><span>{hxDate(buckets[0].at)}</span><span>{hxDate(buckets[buckets.length-1].at)}</span></div>
          </div>
          <div className="hx-panel" style={{minWidth:0}}>
            <div className="hx-ph"><b>{t.sl_k_pay}</b></div>
            {payRows.map(([k,v])=>{ const c = payColor(k), pc = revenue? Math.round(v/revenue*100) : 0; return (
              <div key={k} style={{display:"grid", gridTemplateColumns:"1fr auto", gap:"4px 10px", alignItems:"center", padding:"8px 0"}}>
                <span>{slPill(c, payLabel(k))}</span>
                <b style={{whiteSpace:"nowrap"}}>{fmtNum(v)} <span style={{color:"var(--soft)", fontWeight:600}}>{pc}%</span></b>
                <span style={{gridColumn:"1 / -1", height:6, borderRadius:6, background:"var(--line-2)", overflow:"hidden"}}><i style={{display:"block", height:"100%", width:pc+"%", background:c[1]}}></i></span>
              </div>
            ); })}
          </div>
        </div>
      )}

      {pending.length>0 && (
        <div className="pending-block">
          <div className="pending-h">
            <b>{t.or_pending_row}</b>
            <span>{t.or_pending_note}</span>
            <button className="lnk" onClick={onOpenOrders}>{t.db_orders} {I.arrow({width:13,height:13})}</button>
          </div>
          {pending.map(o=>(
            <button key={o.id} className="pending-row" onClick={onOpenOrders}>
              <span className="pr-no">#{o.no}</span>
              <span className="pr-who">{o.customer.name}</span>
              <span className="pr-n">{o.lines.reduce((n,l)=>n+l.qty,0)} {t.sc_items}</span>
              <span className="pr-tot">{fmtPrice(o.total,lang)}</span>
              <span className="pr-tag">{t.or_new}</span>
            </button>
          ))}
        </div>
      )}

      {!pages.res && pages.loading ? <div className="stk-empty card"><span className="tg-spin"></span></div> : pages.res && !pages.res.any ? (
        <EmptyState icon={I.wallet} title={t.db_sales} body={t.sl_empty}
          cta={<button className="btn btn-accent" onClick={()=>setManual(true)}>{I.plus({width:17,height:17})} {t.sl_manual}</button>}/>
      ) : list.length===0 ? <div className="stk-empty card">{t.sl_none}</div> : (
        <div className="stock-table" style={{overflowX:"auto"}}>
          <div style={{minWidth:1180}}>
            <div className="stk-head" style={{display:"grid", gridTemplateColumns:SL_COLS, alignItems:"center"}}>
              {[t.hc_id, t.sl_c_items, t.hc_qty, t.hc_sum, vp.costs? t.sl_profit : "", t.sl_c_pay, t.sl_c_seller, t.sl_c_status, t.hc_date, ""].map((h,i)=>(
                <span key={i} style={{whiteSpace:"nowrap", textAlign: i>=2 && i<=4? "right" : "left"}}>{h}</span>))}
            </div>
            {list.map(s=>{
              const c = slCalc(s), isOpen = open===s.id, l0 = s.lines[0], x0 = l0 && idx[l0.variantId];
              const v0 = l0? lineVar(l0) : "", more = s.lines.length-1;
              return (
                <React.Fragment key={s.id}>
                  <div className="stk-row" role="button" tabIndex={0} aria-expanded={isOpen} onClick={()=>setOpen(isOpen?null:s.id)}
                    onKeyDown={e=>{ if(e.key==="Enter") setOpen(isOpen?null:s.id); }}
                    style={{display:"grid", gridTemplateColumns:SL_COLS, alignItems:"center", cursor:"pointer", background:isOpen? "var(--paper)" : undefined}}>
                    <span style={{whiteSpace:"nowrap", fontFamily:"'Space Mono', monospace", fontSize:12.5}}>#{s.no}</span>
                    <span style={{display:"flex", alignItems:"center", gap:10, minWidth:0}}>
                      {photo(x0)}
                      <span className="stk-name" style={{minWidth:0}}><b>{l0? lineName(l0) : "—"}</b><span>{v0}{more>0? (v0? " · " : "")+fill(t.sl_more_n,{n:more}) : ""}</span></span>
                    </span>
                    <span style={{...num, fontWeight:700}}>{c.n}</span>
                    <span style={{...num, fontWeight:700}}>{fmtNum(c.sum)}</span>
                    <span style={{...num, fontWeight:600}} className={c.profit!=null && c.profit<0? "down" : ""}>{!vp.costs? "" : c.profit!=null? fmtNum(c.profit) : "—"}</span>
                    <span>{slPill(payColor(s.pay), payLabel(s.pay))}</span>
                    <span style={{whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{sellerName(s)}</span>
                    <span>{slPill(SL_ST[c.status], t["sl_st_"+c.status])}</span>
                    <span style={{whiteSpace:"nowrap"}}><b>{hxDate(s.at)}</b> <span style={{color:"var(--soft)"}}>{slHM(s.at)}</span></span>
                    <span style={{color:"var(--soft)", display:"flex", justifyContent:"center"}}>{isOpen? I.minus({width:15,height:15}) : I.plus({width:15,height:15})}</span>
                  </div>
                  {isOpen && (
                    <div style={{padding:"4px 16px 14px 100px", background:"var(--paper)", borderBottom:"1px solid var(--line-2)"}}>
                      <div style={{display:"grid", gridTemplateColumns:SL_LINE_COLS, gap:12, padding:"8px 0", fontSize:12, fontWeight:700, color:"var(--soft)", textTransform:"uppercase", letterSpacing:".03em"}}>
                        <span>{t.hc_product}</span><span style={num}>{t.sl_c_line}</span><span style={num}>{t.hc_sum}</span><span style={num}>{vp.costs? t.sl_profit : ""}</span><span></span>
                      </div>
                      {s.lines.map(l=>{
                        const k = l.qty - (l.returned||0), x = idx[l.variantId];
                        const pf = l.cost!=null? k*(l.unit-l.cost) : null;
                        return (
                          <div key={l.variantId} style={{display:"grid", gridTemplateColumns:SL_LINE_COLS, gap:12, alignItems:"center", padding:"8px 0", borderTop:"1px solid var(--line-2)", opacity:k<=0? .55 : 1}}>
                            <span style={{display:"flex", alignItems:"center", gap:10, minWidth:0}}>{photo(x)}<span className="stk-name" style={{minWidth:0}}><b>{lineName(l)}</b><span>{lineVar(l)}{x && x.v.barcode? " · "+x.v.barcode : ""}</span></span></span>
                            <span style={num}>{l.qty} × {l.unit>0? fmtNum(l.unit) : <i>{t.pf_free}</i>}{l.returned>0 && <small style={{display:"block", color:"#b83f28"}}>−{l.returned} {t.sl_returned}</small>}{l.oversold && <span className="ln-over">{t.inv_oversold}</span>}</span>
                            <span style={{...num, fontWeight:700}}>{fmtNum(Math.max(0,k)*l.unit)}</span>
                            <span style={num} className={pf!=null && pf<0? "down" : ""}>{!vp.costs? "" : pf!=null? fmtNum(pf) : <i style={{color:"var(--faint)"}}>{t.sl_no_cost_line}</i>}</span>
                            <span style={{textAlign:"right"}}>{k<=0
                              ? slPill(SL_ST.ret, t.sl_st_ret)
                              : vp.returns? <button className="btn btn-ghost btn-xs" onClick={()=>setRet({sale:s, line:l})}>{I.undo({width:14,height:14})} {t.sl_return}…</button> : null}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
      {pages.hasMore && <button className="btn btn-soft hist-more" disabled={pages.loading} onClick={pages.more}>{t.h_more} · {pages.total-list.length}</button>}
      {manual && <ManualSaleModal store={store} shop={shop} t={t} lang={lang} onClose={()=>setManual(false)}/>}
      {ret && <ReturnModal sale={ret.sale} line={ret.line} t={t} lang={lang} onClose={()=>setRet(null)}
        onConfirm={(qty,mode)=>{ store.returnLine(shop.id, ret.sale.id, ret.line.variantId, qty, mode); toast(t.inv_r_return); }}/>}
    </div>
  );
}

// previous card-list version, kept for reference (not used)
function SalesViewOld({ store, shop, t, lang, onOpenOrders, viewer }){
  const st = store.settings(shop.id);
  const sales = store.sales(shop.id);
  const movements = store.movements(shop.id);
  const vw = viewer || store.operator(shop.id);
  const vp = permsOf(vw);
  const mine = vw.role==="cashier";
  const team = store.team(shop.id);
  const [who, setWho] = React.useState("all");
  const sellerOf = (s)=> store.saleSeller(shop.id, s);
  const sellerName = (s)=>{ const m = team.find(x=>x.id===sellerOf(s)); return m? staffFirst(m,t) : ""; };
  const [range, setRange] = React.useState("month");
  const [custom, setCustom] = React.useState({ from:"", to:"" });
  const [open, setOpen] = React.useState(null);
  const [ret, setRet] = React.useState(null);
  const [manual, setManual] = React.useState(false);

  const bounds = (()=>{
    const d = new Date();
    if(range==="today"){ const s=new Date(d); s.setHours(0,0,0,0); return [s.getTime(), Infinity]; }
    if(range==="week"){ const s=new Date(d); s.setDate(s.getDate()-7); return [s.getTime(), Infinity]; }
    if(range==="month"){ const s=new Date(d); s.setDate(s.getDate()-30); return [s.getTime(), Infinity]; }
    const f = custom.from? new Date(custom.from).getTime() : 0;
    const to = custom.to? new Date(custom.to).getTime()+86400000 : Infinity;
    return [f, to];
  })();
  const inRange = (ts)=> ts>=bounds[0] && ts<bounds[1];
  const list = sales.filter(s=>inRange(s.at) && (mine? sellerOf(s)===vw.id : (who==="all" || sellerOf(s)===who)));

  let revenue=0, cost=0, counted=0, uncounted=0, units=0;
  list.forEach(s=>s.lines.forEach(l=>{
    const q = l.qty - l.returned;
    if(q<=0) return;
    units += q; revenue += q*l.unit;
    if(l.cost!=null){ cost += q*l.cost; counted += q; } else uncounted += q;
  }));
  const profit = revenue - cost;
  const profitPct = revenue? Math.round(profit/revenue*100) : 0;
  const losses = movements.filter(m=>m.reason==="loss" && inRange(m.at))
    .reduce((n,m)=> n + (m.unitCost!=null? Math.abs(m.qty!=null? m.qty : m.delta)*m.unitCost : 0), 0);
  const pending = store.orders(shop.id).filter(o=>o.status==="new");
  const payLabel = (id)=>{ const m=PAY_METHODS.find(x=>x.id===id); return m? m.label[lang] : id; };

  function exportCSV(){
    if(st.plan!=="pro"){ toast(t.inv_pro_only, "warn"); return; }
    const rows = [["receipt","date","product","variant","qty","unit","cost","profit","payment","status"]];
    list.forEach(s=>s.lines.forEach(l=>{
      const q=l.qty-l.returned;
      rows.push(["#"+s.no, new Date(s.at).toISOString(), l.name, l.label, q, l.unit, l.cost==null?"":l.cost,
        l.cost==null?"":q*(l.unit-l.cost), s.pay, s.status]);
    }));
    try{
      const a=document.createElement("a");
      a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"}));
      a.download=shop.handle+"-sales.csv"; a.click();
    }catch(e){}
    toast(t.sl_export);
  }

  return (
    <div className="sales">
      <div className="db-sec-head">
        <div><h2>{t.db_sales}</h2><div className="sub">{t.sl_sub}</div></div>
        <div className="head-acts">
          <button className="btn btn-soft btn-sm" onClick={exportCSV}>{I.down({width:16,height:16})} {t.sl_export}{st.plan!=="pro"? <span className="pro-badge">Pro</span> : null}</button>
          <button className="btn btn-accent btn-sm" onClick={()=>setManual(true)}>{I.plus({width:16,height:16})} {t.sl_manual}</button>
        </div>
      </div>

      <div className="chip-row" style={{marginBottom:14}}>
        {[["today",t.sl_today],["week",t.sl_week],["month",t.sl_month],["custom",t.sl_custom]].map(([id,lab])=>(
          <button key={id} className={"pick-chip"+(range===id?" on":"")} onClick={()=>setRange(id)}>{lab}</button>
        ))}
        {range==="custom" && (
          <div className="date-range">
            <label>{t.sl_from}<input type="date" value={custom.from} onChange={e=>setCustom(c=>({...c,from:e.target.value}))}/></label>
            <label>{t.sl_to}<input type="date" value={custom.to} onChange={e=>setCustom(c=>({...c,to:e.target.value}))}/></label>
          </div>
        )}
      </div>

      {mine ? <div className="tm-mine">{I.team({width:15,height:15})} {t.tm_my_sales} · {staffName(vw,t)}</div> : team.length>1 && (
        <div className="chip-row tm-filter">
          <button className={"pick-chip"+(who==="all"?" on":"")} onClick={()=>setWho("all")}>{t.tm_all}</button>
          {team.filter(m=>m.status!=="invited").map(m=>(
            <button key={m.id} className={"pick-chip"+(who===m.id?" on":"")} onClick={()=>setWho(m.id)}><StaffAv m={m} t={t} size={20}/>{staffFirst(m,t)}</button>
          ))}
        </div>
      )}

      <div className="pnl">
        <div className="pnl-row">
          <div className="pnl-cell"><span>{t.sl_revenue}</span><b>{fmtNum(revenue)}</b></div>
          {vp.costs ? <>
          <div className="pnl-cell"><span>{t.sl_cost}</span><b>{fmtNum(cost)}</b></div>
          <div className="pnl-cell strong"><span>{t.sl_profit} <Info text={t.pf_what}/></span><b>{fmtNum(profit)} <i>{profitPct}%</i></b></div>
          </> : <>
          <div className="pnl-cell"><span>{t.tm_receipts}</span><b>{list.length}</b></div>
          <div className="pnl-cell"><span>{t.tm_items}</span><b>{units}</b></div>
          </>}
        </div>
        {vp.costs && uncounted>0 && (
          <div className="pnl-note">{fill(t.sl_profit_note,{a:counted,b:units,c:uncounted})}</div>
        )}
        {vp.costs && <div className="pnl-loss">{t.sl_losses}: {fmtPrice(losses,lang)}</div>}
      </div>

      {pending.length>0 && (
        <div className="pending-block">
          <div className="pending-h">
            <b>{t.or_pending_row}</b>
            <span>{t.or_pending_note}</span>
            <button className="lnk" onClick={onOpenOrders}>{t.db_orders} {I.arrow({width:13,height:13})}</button>
          </div>
          {pending.map(o=>(
            <button key={o.id} className="pending-row" onClick={onOpenOrders}>
              <span className="pr-no">#{o.no}</span>
              <span className="pr-who">{o.customer.name}</span>
              <span className="pr-n">{o.lines.reduce((n,l)=>n+l.qty,0)} {t.sc_items}</span>
              <span className="pr-tot">{fmtPrice(o.total,lang)}</span>
              <span className="pr-tag">{t.or_new}</span>
            </button>
          ))}
        </div>
      )}

      {list.length===0 ? (
        <EmptyState icon={I.wallet} title={t.db_sales} body={t.sl_empty}
          cta={<button className="btn btn-accent" onClick={()=>setManual(true)}>{I.plus({width:17,height:17})} {t.sl_manual}</button>}/>
      ) : (
        <div className="sale-list">
          {list.map(s=>{
            const isOpen = open===s.id;
            const n = s.lines.reduce((m,l)=>m+(l.qty-l.returned),0);
            return (
              <div key={s.id} className={"sale"+(isOpen?" open":"")}>
                <button className="sale-head" onClick={()=>setOpen(isOpen?null:s.id)}>
                  <span className="sale-when"><b>{fmtDateTime(s.at,lang).split("· ")[1]}</b><span>{relDay(s.at,lang)}</span></span>
                  <span className="sale-id">#{s.no}</span>
                  <span className="sale-n">{n} {t.sc_items}</span>
                  <span className="sale-pay">{payLabel(s.pay)}<small className="sale-by">{sellerName(s)}</small></span>
                  {s.status!=="completed" && <span className="sale-ret">{t.sl_returned}</span>}
                  <span className="sale-total">{fmtPrice(s.total,lang)}</span>
                  <span className="sale-cv">{isOpen? I.minus({width:15,height:15}) : I.plus({width:15,height:15})}</span>
                </button>
                {isOpen && (
                  <div className="sale-lines">
                    {s.lines.map(l=>{
                      const q = l.qty - l.returned;
                      const pf = l.cost!=null? q*(l.unit-l.cost) : null;
                      return (
                        <div key={l.variantId} className={"sale-line"+(q<=0?" returned":"")}>
                          <b>{l.name}{l.label? " · "+l.label : ""}</b>
                          <span>{l.qty} × {l.unit>0? fmtNum(l.unit) : <i>{t.pf_free}</i>}{l.oversold && <span className="ln-over">{t.inv_oversold}</span>}</span>
                          <span className={"sl-profit"+(pf!=null && pf<0?" neg":"")}>{!vp.costs? "" : pf!=null? (pf<0? "−"+fmtNum(Math.abs(pf)) : fmtNum(pf)) : <i>{t.sl_no_cost_line}</i>}</span>
                          {q<=0
                            ? <span className="sl-badge">{t.sl_returned}</span>
                            : vp.returns? <button className="btn btn-ghost btn-xs" onClick={()=>setRet({sale:s, line:l})}>{I.undo({width:14,height:14})} {t.sl_return}…</button> : <span></span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {manual && <ManualSaleModal store={store} shop={shop} t={t} lang={lang} onClose={()=>setManual(false)}/>}
      {ret && <ReturnModal sale={ret.sale} line={ret.line} t={t} lang={lang} onClose={()=>setRet(null)}
        onConfirm={(qty,mode)=>{ store.returnLine(shop.id, ret.sale.id, ret.line.variantId, qty, mode); toast(t.inv_r_return); }}/>}
    </div>
  );
}

function ManualSaleModal({ store, shop, t, lang, onClose }){
  const st = store.settings(shop.id);
  const products = store.products(shop.id);
  const [q, setQ] = React.useState("");
  const [lines, setLines] = React.useState({});
  const [pay, setPay] = React.useState((st.payments||["cash"])[0]||"cash");
  const rows = [];
  products.forEach(p=>p.variants.forEach(v=>{
    const hay=(textFB(p.name,lang)+" "+vLabel(p,v,lang)+" "+v.barcode).toLowerCase();
    if(!q || hay.includes(q.toLowerCase())) rows.push({p,v});
  }));
  const picked = Object.keys(lines).filter(k=>lines[k]>0);
  const idx = store.variantIndex(shop.id);
  const total = picked.reduce((n,k)=> n + (idx[k]? (idx[k].v.price!=null? idx[k].v.price : idx[k].p.price)*lines[k] : 0), 0);
  return (
    <Modal wide title={t.sl_manual} sub={t.sl_sub} onClose={onClose}
      foot={<>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>{t.g_cancel}</button>
        <div className="mf-right">
          <button className="btn btn-accent btn-sm" disabled={!picked.length} onClick={()=>{
            store.completeSale(shop.id, picked.map(k=>({ variantId:k, productId:idx[k].p.id, name:textFB(idx[k].p.name,lang),
              label:vLabel(idx[k].p, idx[k].v, lang), qty:lines[k], unit:(idx[k].v.price!=null? idx[k].v.price : idx[k].p.price) })), pay, "manual");
            toast(t.sc_recorded+" · "+fmtPrice(total,lang)); onClose();
          }}>{I.check({width:16,height:16})} {t.sc_complete} {total? "· "+fmtPrice(total,lang):""}</button>
        </div>
      </>}>
      <div className="inline-search">{I.search({width:17,height:17})}<input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.inv_search} autoFocus/></div>
      <div className="restock-list">
        {rows.slice(0,40).map(({p,v})=>(
          <div key={v.id} className="restock-row">
            <div className="rr-main"><b>{textFB(p.name,lang)}</b><span>{vLabel(p,v,lang)? vLabel(p,v,lang)+" · ":""}{fmtNum(v.price!=null? v.price : p.price)} · {t.inv_qty} {v.qty}</span></div>
            <Stepper value={Number(lines[v.id])||0} min={0} onChange={n=>setLines(s=>({...s,[v.id]:n}))}/>
          </div>
        ))}
      </div>
      <div className="field" style={{marginTop:14}}>
        <label>{t.sc_payment}</label>
        <div className="chip-row">
          {PAY_METHODS.map(m=>(<button key={m.id} className={"pick-chip"+(pay===m.id?" on":"")} onClick={()=>setPay(m.id)}>{m.label[lang]}</button>))}
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, { SalesView, ManualSaleModal, ReturnModal });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { ReturnModal, SL_COLS, SL_LINE_COLS, SL_PAY, SL_ST, slPill, slHM, slCalc, SalesView, SalesViewOld, ManualSaleModal });
