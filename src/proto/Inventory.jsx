// ===== Inventory — stock table, costs, restock drawer, history, labels =====
function reasonLabel(r, t){
  return ({ sale:t.inv_r_sale, restock:t.inv_r_restock, correction:t.inv_r_correction, loss:t.inv_r_loss2, return:t.inv_r_return })[r] || r;
}

// inline qty popover: new count + reason + note
function QtyPopover({ row, t, onClose, onSave }){
  const [val, setVal] = React.useState(String(row.v.qty));
  const [reason, setReason] = React.useState("correction");
  const [note, setNote] = React.useState("");
  const ref = React.useRef(null);
  const [up, setUp] = React.useState(false);
  useEscape(onClose);
  React.useLayoutEffect(()=>{
    if(!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    if(r.bottom > window.innerHeight - 12) setUp(true);
  },[]);
  React.useEffect(()=>{
    function out(e){ if(ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", out);
    return ()=> document.removeEventListener("mousedown", out);
  },[]);
  const n = Number(val)||0;
  const delta = n - row.v.qty;
  return (
    <div className={"qty-pop"+(up?" up":"")} ref={ref} onClick={e=>e.stopPropagation()}>
      <div className="qp-row">
        <label>{t.inv_qty_new}</label>
        <Stepper value={n} min={0} onChange={v=>setVal(String(v))}/>
        {delta!==0 && <span className={"qp-delta "+(delta>0?"up":"down")}>{delta>0? "+"+delta : delta}</span>}
      </div>
      <div className="qp-row">
        <label>{t.inv_reason}</label>
        <select value={reason} onChange={e=>setReason(e.target.value)}>
          <option value="correction">{t.inv_r_correction}</option>
          <option value="loss">{t.inv_r_loss2}</option>
        </select>
      </div>
      <input className="qp-note" value={note} onChange={e=>setNote(e.target.value)} placeholder={t.inv_note}/>
      <div className="qp-foot">
        <button className="btn btn-ghost btn-xs" onClick={onClose}>{t.g_cancel}</button>
        <button className="btn btn-accent btn-xs" disabled={!delta} onClick={()=>{ onSave(n, reason, note); onClose(); }}>{t.g_save}</button>
      </div>
    </div>
  );
}

function BarcodeModal({ store, shop, row, t, lang, onClose }){
  const cur = row.v.barcode || "";
  const auto = /^RS-/.test(cur);
  const [code, setCode] = React.useState(auto? "" : cur);
  const digits = code.replace(/\D/g,"");
  const eanish = digits.length>=12 && digits.length===code.trim().length;
  const bad = eanish && !eanValid(digits);
  const value = code.trim();
  const dupe = value && store.barcodeTaken(shop.id, value, row.v.id);
  const ok = value && !bad && !dupe;
  return (
    <Modal title={t.inv_edit_bc} sub={textFB(row.p.name,lang)+(vLabel(row.p,row.v,lang)? " · "+vLabel(row.p,row.v,lang) : "")} onClose={onClose}
      foot={<>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>{t.g_cancel}</button>
        <div className="mf-right">
          <button className="btn btn-soft btn-sm" onClick={()=>{ store.setBarcode(shop.id, row.v.id, nextBarcode(shop.id)); toast(t.bc_generated); onClose(); }}>{I.spark({width:15,height:15})} {t.bc_generate}</button>
          <button className="btn btn-accent btn-sm" disabled={!ok} onClick={()=>{ store.setBarcode(shop.id, row.v.id, value); toast(t.st_saved); onClose(); }}>{t.g_save}</button>
        </div>
      </>}>
      {cur ? (
        <div className="bc-current">
          <Barcode code={cur} height={38}/>
          <div className="bc-current-code">{cur} · {auto? t.bc_own : t.bc_factory}</div>
        </div>
      ) : (
        <div className="bc-current empty">{I.barcode({width:26,height:26})}<div className="bc-current-code">{t.bc_missing}</div></div>
      )}
      <div className="field">
        <label>{t.bc_has}</label>
        <input value={code} onChange={e=>setCode(e.target.value.toUpperCase().slice(0,20))} placeholder={t.bc_scan_in} autoFocus/>
        {value && (
          dupe ? <div className="err-line">{I.warn({width:14,height:14})} {t.inv_bc_dupe}</div>
          : bad ? <div className="err-line">{I.warn({width:14,height:14})} {t.inv_bc_bad}</div>
          : <div className="ok-line">{I.check({width:14,height:14})} {eanish? t.inv_bc_ok : t.bc_factory}</div>
        )}
        <div className="hint">{t.bc_free}</div>
      </div>
      <div className="bc-alt">{cur? t.bc_replace : <>{t.bc_none} → <b>{t.bc_generate}</b></>}</div>
    </Modal>
  );
}

function ThresholdModal({ rows, t, onClose, onApply }){
  const [v, setV] = React.useState(rows[0].v.threshold!=null? rows[0].v.threshold : DEFAULT_THRESHOLD);
  return (
    <Modal title={t.inv_set_threshold} sub={fill(t.inv_selected,{n:rows.length})} onClose={onClose}
      foot={<>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>{t.g_cancel}</button>
        <div className="mf-right"><button className="btn btn-accent btn-sm" onClick={()=>{ onApply(Number(v)); onClose(); }}>{t.g_apply}</button></div>
      </>}>
      <div className="field"><label>{t.inv_threshold}</label>
        <Stepper value={Number(v)} onChange={setV} min={0}/>
        <div className="hint">{t.sf_low}: qty ≤ {v}</div>
      </div>
    </Modal>
  );
}

function LabelsModal({ rows, t, lang, pro, onClose }){
  const [page, setPage] = React.useState("a4");
  const [sel, setSel] = React.useState(rows.map(r=>r.v.id));
  const chosen = rows.filter(r=>sel.includes(r.v.id));
  const limited = !pro && chosen.length>1 ? chosen.slice(0,1) : chosen;
  return (
    <Modal wide title={t.inv_labels_t} sub={t.inv_labels_d} onClose={onClose}
      foot={<>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>{t.g_close}</button>
        <div className="mf-right">
          <button className="btn btn-accent btn-sm" disabled={!limited.length} onClick={()=>{ toast(t.inv_print_now+" · "+fill(t.lb_selected,{n:limited.length})); onClose(); }}>
            {I.printer({width:16,height:16})} {t.inv_print_now}
          </button>
        </div>
      </>}>
      <div className="lb-bar">
        <div className="field" style={{margin:0, flex:1, minWidth:190}}>
          <label>{t.lb_page}</label>
          <select value={page} onChange={e=>setPage(e.target.value)}>
            <option value="a4">{t.lb_a4}</option>
            <option value="thermal">{t.lb_thermal}</option>
          </select>
        </div>
        <div className="lb-count">
          {fill(t.lb_selected,{n:limited.length})}
          <button className="lnk" onClick={()=>setSel(sel.length===rows.length? [] : rows.map(r=>r.v.id))}>{sel.length===rows.length? t.g_none : t.g_all}</button>
        </div>
      </div>
      {!pro && chosen.length>1 && (
        <div className="pro-note">{I.lock? I.lock({width:14,height:14}) : I.spark({width:14,height:14})} <b>{t.lb_pro_lock}</b> · {t.inv_pro_only}</div>
      )}
      <div className="lb-picker">
        {rows.map(r=>(
          <label key={r.v.id} className={"lb-pick"+(sel.includes(r.v.id)?" on":"")}>
            <input type="checkbox" checked={sel.includes(r.v.id)} onChange={()=>setSel(s=> s.includes(r.v.id)? s.filter(x=>x!==r.v.id) : [...s, r.v.id])}/>
            {textFB(r.p.name,lang)}{vLabel(r.p,r.v,lang)? " · "+vLabel(r.p,r.v,lang) : ""}
          </label>
        ))}
      </div>
      <div className={"label-sheet "+page}>
        {limited.map(({p,v})=>(
          <div key={v.id} className="label">
            <div className="lb-name">{textFB(p.name,lang)}</div>
            <div className="lb-meta">{vLabel(p,v,lang)? vLabel(p,v,lang)+" · " : ""}{fmtPrice(p.price,lang)}</div>
            <Barcode code={v.barcode} height={page==="thermal"?32:26}/>
            <div className="lb-code">{v.barcode}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

Object.assign(I18N.en, { rs_choose:"Which product arrived?", rs_diff_cost:"Different cost per size", rs_more:"Delivery cost & supplier", rs_restock_btn:"Restock", rs_cost_one:"Buying price per piece", rs_how_many:"How many arrived?" });
Object.assign(I18N.ru, { rs_choose:"Какой товар пришёл?", rs_diff_cost:"Разная цена по размерам", rs_more:"Доставка и поставщик", rs_restock_btn:"Приход", rs_cost_one:"Закупочная цена за штуку", rs_how_many:"Сколько пришло?" });
Object.assign(I18N.uz, { rs_choose:"Qaysi mahsulot keldi?", rs_diff_cost:"O\u02bclcham bo\u02bcyicha turli narx", rs_more:"Yetkazish va yetkazuvchi", rs_restock_btn:"Kirim", rs_cost_one:"Bir dona xarid narxi", rs_how_many:"Nechta keldi?" });

// step 1 (only from header button): pick a product
function RestockPicker({ store, shop, t, lang, onPick, onClose, title }){
  const products = store.products(shop.id);
  const [q, setQ] = React.useState("");
  const list = products.filter(p=>{
    if(!q) return true;
    const hay = (textFB(p.name,lang)+" "+textFB(p.name,"en")+" "+p.variants.map(v=>v.barcode||"").join(" ")).toLowerCase();
    return hay.includes(q.toLowerCase());
  });
  return (
    <Modal title={title || t.rs_choose} onClose={onClose}>
      <div className="inline-search">{I.barcode({width:17,height:17})}<input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.inv_search} autoFocus/></div>
      <div className="rsp-list">
        {list.map((p,i)=>(
          <button key={p.id} className="rsp-item" onClick={()=>onPick(p)}>
            <span className="stk-photo"><ImageSlot id={pslot(shop.id,p,0)} src={photoURL(p.tone, pslot(shop.id,p,0), 90,90, IMG_KW[shop.type], products.indexOf(p))} placeholder="" style={FILL}/></span>
            <span className="rsp-tx"><b>{textFB(p.name,lang)}</b><i>{totalQty(p)} {t.rs_units}</i></span>
            {I.arrow({width:16,height:16})}
          </button>
        ))}
        {list.length===0 && <div className="hint" style={{padding:"10px 2px"}}>{t.inv_no_match}</div>}
      </div>
    </Modal>
  );
}

// simple one-product restock popup
function RestockModal({ store, shop, product, t, lang, onClose }){
  const p = product;
  const multi = p.variants.length>1;
  const [qty, setQty] = React.useState(()=>Object.fromEntries(p.variants.map(v=>[v.id,0])));
  const base = p.variants.find(v=>v.avgCost!=null);
  const [cost, setCost] = React.useState(base? String(base.avgCost) : "");
  const [perSize, setPerSize] = React.useState(false);
  const [costs, setCosts] = React.useState(()=>Object.fromEntries(p.variants.map(v=>[v.id, v.avgCost!=null? String(v.avgCost) : ""])));
  const [more, setMore] = React.useState(false);
  const [extra, setExtra] = React.useState("");
  const [note, setNote] = React.useState("");

  const active = p.variants.filter(v=>qty[v.id]>0).map(v=>({ variantId:v.id, qty:qty[v.id], unitCost: perSize? costs[v.id] : cost }));
  const units = active.reduce((n,e)=>n+e.qty,0);
  const plan = store.restockPlan(shop.id, active, extra);
  const costed = plan.filter(e=>e.hasCost);
  const spend = costed.reduce((n,e)=>n+e.qty*e.landed,0);
  const wq = costed.reduce((n,e)=>n+e.qty,0);
  const newAvg = wq? Math.round(costed.reduce((n,e)=>n+e.newAvg*e.qty,0)/wq) : null;
  const oldK = costed.filter(e=>e.oldAvg!=null), oq = oldK.reduce((n,e)=>n+e.qty,0);
  const oldAvg = oq? Math.round(oldK.reduce((n,e)=>n+e.oldAvg*e.qty,0)/oq) : null;
  const oldM = margin(p.price, oldAvg), newM = newAvg!=null? margin(p.price,newAvg) : null;
  const keep = oldM!=null && newAvg!=null? priceForMargin(newAvg, oldM) : null;
  const onHand = p.variants.reduce((n,v)=>n+Math.max(0,v.qty),0);
  const num = (s)=>s.replace(/\D/g,"");

  const foot = (
    <div className="rsm-foot">
      <div className="rsm-sum"><span>{onHand} + <b className="add">{units}</b> = <b>{onHand+units}</b> {t.rs_units}</span>{costed.length>0 && <i>{fmtPrice(spend,lang)}</i>}</div>
      <button className="btn btn-accent" disabled={!units} onClick={()=>{
        store.restock(shop.id, active, note, extra);
        toast(t.inv_received+" · +"+units);
        onClose();
      }}>{I.box({width:17,height:17})} {t.inv_confirm_restock}</button>
    </div>
  );

  return (
    <Modal title={t.rs_title} onClose={onClose} foot={foot}>
      <div className="rsm-prod">
        <span className="rsm-photo"><ImageSlot id={pslot(shop.id,p,0)} src={photoURL(p.tone, pslot(shop.id,p,0), 120,120, IMG_KW[shop.type], 0)} placeholder="" style={FILL}/></span>
        <div><b>{textFB(p.name,lang)}</b><span>{onHand} {t.rs_onhand.toLowerCase()} · {fmtPrice(p.price,lang)}</span></div>
      </div>

      <div className="rsm-label">{t.rs_how_many}</div>
      <div className="rsm-sizes">
        {p.variants.map(v=>(
          <div key={v.id} className={"rsm-size"+(qty[v.id]>0?" on":"")}>
            <div className="rsm-sname"><b>{vLabel(p,v,lang) || t.inv_qty}</b><span>{v.qty} {t.rs_units}</span></div>
            <Stepper value={qty[v.id]} min={0} onChange={n=>setQty(s=>({...s,[v.id]:n}))}/>
            {perSize && <input className="rs-cost" value={costs[v.id]} inputMode="numeric" placeholder={t.rs_cost_unit} onChange={e=>setCosts(s=>({...s,[v.id]:num(e.target.value)}))}/>}
          </div>
        ))}
      </div>

      {!perSize && (
        <div className="field" style={{marginTop:16}}>
          <label>{t.rs_cost_one}</label>
          <input value={cost} inputMode="numeric" placeholder="0" onChange={e=>setCost(num(e.target.value))}/>
        </div>
      )}
      {multi && <label className="rsm-check"><input type="checkbox" checked={perSize} onChange={e=>setPerSize(e.target.checked)}/> {t.rs_diff_cost}</label>}

      {units>0 && newAvg!=null && (
        <div className="margin-callout inline" style={{marginTop:14}}>
          <div className="mc-line"><span>{t.rs_new_avg}</span><b>{fmtPrice(newAvg,lang)}</b></div>
          {newM!=null && <div className="mc-line"><span>{t.rs_margin_at} {fmtNum(p.price)}</span><b className={oldM!=null && newM<oldM? "down":"up"}>{pct(newM)}%{oldM!=null && <i> ({t.rs_was} {pct(oldM)}%)</i>}</b></div>}
          {keep && keep>p.price && <div className="mc-nudge">{fill(t.rs_keep,{m:pct(oldM)})} <b>{fmtPrice(keep,lang)}</b></div>}
        </div>
      )}

      <button className="lnk rsm-more" onClick={()=>setMore(!more)}>{more? I.x({width:13,height:13}) : I.plus({width:13,height:13})} {t.rs_more}</button>
      {more && (
        <div className="rsm-extra">
          <div className="field"><label>{t.rs_extra}</label><input value={extra} onChange={e=>setExtra(num(e.target.value))} placeholder="0" inputMode="numeric"/><div className="hint">{t.rs_extra_hint}</div></div>
          <div className="field"><label>{t.rs_supplier}</label><input value={note} onChange={e=>setNote(e.target.value)} placeholder={SUPPLIERS[0]}/></div>
        </div>
      )}
    </Modal>
  );
}

// legacy multi-product drawer (unused)
function RestockDrawer({ store, shop, t, lang, onClose }){
  const products = store.products(shop.id);
  const [q, setQ] = React.useState("");
  const [lines, setLines] = React.useState({});
  const [extra, setExtra] = React.useState("");
  const [note, setNote] = React.useState("");
  useEscape(onClose);

  const matches = products.filter(p=>{
    if(!q) return false;
    const hay = (textFB(p.name,lang)+" "+textFB(p.name,"en")+" "+p.variants.map(v=>vLabel(p,v,lang)+" "+v.barcode).join(" ")).toLowerCase();
    return hay.includes(q.toLowerCase());
  });
  const entries = Object.keys(lines).map(k=>({ variantId:k, qty:lines[k].qty, unitCost:lines[k].cost }));
  const active = entries.filter(e=>Number(e.qty)>0);
  const plan = store.restockPlan(shop.id, active, extra);
  const units = active.reduce((n,e)=>n+Number(e.qty),0);
  const costedPlan = plan.filter(e=>e.hasCost);
  const spend = costedPlan.reduce((n,e)=>n+e.qty*e.landed,0);
  const anyCost = costedPlan.length>0;
  const partial = anyCost && costedPlan.length<plan.length;

  function setLine(id, patch){ setLines(s=>({ ...s, [id]: { qty:0, cost:"", ...(s[id]||{}), ...patch } })); }
  function addProduct(p){
    setLines(s=>{
      const out = { ...s };
      p.variants.forEach(v=>{
        if(!out[v.id]) out[v.id] = { qty:0, cost: v.avgCost!=null? String(v.avgCost) : "" };
      });
      return out;
    });
    setQ("");
  }
  function dropProduct(p){
    setLines(s=>{ const o={...s}; p.variants.forEach(v=>delete o[v.id]); return o; });
  }
  function applyCostAll(p, cost){
    setLines(s=>{
      const o = { ...s };
      p.variants.forEach(v=>{ if(o[v.id]) o[v.id] = { ...o[v.id], cost }; });
      return o;
    });
  }

  // products currently in the batch, in insertion order
  const inBatch = products.filter(p=>p.variants.some(v=>lines[v.id]));

  return (
    <div className="drawer-scrim" onClick={onClose}>
      <aside className="drawer" onClick={e=>e.stopPropagation()}>
        <div className="drawer-head">
          <div><h3>{t.rs_title}</h3><div className="modal-sub">{t.rs_pick}</div></div>
          <button className="icon-btn" onClick={onClose} aria-label={t.g_close}>{I.x()}</button>
        </div>
        <div className="drawer-body scroll-y">
          <div className="inline-search">{I.barcode({width:17,height:17})}<input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.inv_search} autoFocus/></div>
          {q && (
            <div className="rs-results">
              {matches.slice(0,7).map(p=>(
                <button key={p.id} className="rs-result" onClick={()=>addProduct(p)}>
                  <b>{textFB(p.name,lang)}</b>
                  <span>{p.variants.length>1? p.variants.map(v=>vLabel(p,v,lang)).filter(Boolean).join(" / ") : t.inv_qty}{" · "}{totalQty(p)} {t.rs_units}</span>
                  <span className="rs-add">{I.plus({width:14,height:14})} {t.rs_add_product}</span>
                </button>
              ))}
              {matches.length===0 && <div className="hint" style={{padding:"8px 2px"}}>{t.inv_no_match}</div>}
            </div>
          )}

          {inBatch.length===0 && <div className="rs-empty">{I.box({width:24,height:24})}<span>{t.rs_pick}</span></div>}

          {inBatch.map(p=>{
            const rows = p.variants.filter(v=>lines[v.id]);
            const onHand = rows.reduce((n,v)=>n+Math.max(0,v.qty),0);
            const adding = rows.reduce((n,v)=>n+(Number(lines[v.id].qty)||0),0);
            const firstCost = (lines[rows[0].id]||{}).cost || "";
            const mixed = rows.some(v=>(lines[v.id].cost||"")!==firstCost);
            const pPlan = plan.filter(e=>e.productId===p.id && e.hasCost);
            const noCostN = plan.filter(e=>e.productId===p.id && !e.hasCost && e.qty>0).length;
            const wq = pPlan.reduce((n,e)=>n+e.qty,0);
            const newAvg = wq? Math.round(pPlan.reduce((n,e)=>n+e.newAvg*e.qty,0)/wq) : null;
            const oldKnown = pPlan.filter(e=>e.oldAvg!=null);
            const oldWq = oldKnown.reduce((n,e)=>n+e.qty,0);
            const oldAvgAgg = oldWq? Math.round(oldKnown.reduce((n,e)=>n+e.oldAvg*e.qty,0)/oldWq) : null;
            const oldMargin = margin(p.price, oldAvgAgg);
            const newMargin = newAvg!=null? margin(p.price, newAvg) : null;
            const keep = oldMargin!=null && newAvg!=null? priceForMargin(newAvg, oldMargin) : null;
            return (
              <div key={p.id} className="rs-group">
                <div className="rs-group-h">
                  <b>{textFB(p.name,lang)}</b>
                  <button className="icon-btn sm" onClick={()=>dropProduct(p)} aria-label={t.g_delete}>{I.x({width:14,height:14})}</button>
                </div>
                <div className="rs-tally">
                  <div><span>{t.rs_onhand}</span><b>{onHand}</b></div>
                  <span className="rs-op">+</span>
                  <div><span>{t.rs_adding}</span><b className="add">{adding}</b></div>
                  <span className="rs-op">=</span>
                  <div><span>{t.rs_after}</span><b className="tot">{onHand+adding}</b></div>
                </div>
                {rows.length>1 && (
                  <div className="rs-allcost">
                    <label>{t.rs_same_cost}</label>
                    <input value={mixed? "" : firstCost} placeholder={mixed? "—" : "0"} inputMode="numeric"
                      onChange={e=>applyCostAll(p, e.target.value.replace(/\D/g,""))}/>
                  </div>
                )}
                <div className="rs-sizes">
                  {rows.map(v=>(
                    <div key={v.id} className="rs-size">
                      <b>{vLabel(p,v,lang) || t.inv_qty}</b>
                      <span className="rs-have">{v.qty}</span>
                      <Stepper value={Number(lines[v.id].qty)||0} min={0} onChange={n=>setLine(v.id,{qty:n})}/>
                      <input className="rs-cost" value={lines[v.id].cost} inputMode="numeric" placeholder={t.rs_cost_unit}
                        onChange={e=>setLine(v.id,{cost:e.target.value.replace(/\D/g,"")})}/>
                    </div>
                  ))}
                </div>
                {rows.length>1 && <div className="hint">{t.rs_per_size}</div>}
                {adding>0 && (newAvg!=null || noCostN>0) && (
                  <div className="margin-callout inline">
                    {newAvg!=null && <div className="mc-line"><span>{t.rs_new_avg}</span><b>{fmtPrice(newAvg,lang)}</b></div>}
                    {newMargin!=null && (
                      <div className="mc-line">
                        <span>{t.rs_margin_at} {fmtNum(p.price)}</span>
                        <b className={oldMargin!=null && newMargin<oldMargin? "down":"up"}>
                          {pct(newMargin)+"%"}
                          {oldMargin!=null && <i> ({t.rs_was} {pct(oldMargin)}%)</i>}
                        </b>
                      </div>
                    )}
                    {noCostN>0 && <div className="mc-nudge muted">{fill(t.rs_nocost_n,{n:noCostN})}</div>}
                    {keep && keep>p.price && (
                      <div className="mc-nudge">{fill(t.rs_keep,{m:pct(oldMargin)})} <b>{fmtPrice(keep,lang)}</b></div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="field">
            <label>{t.rs_extra}</label>
            <input value={extra} onChange={e=>setExtra(e.target.value.replace(/\D/g,""))} placeholder="0" inputMode="numeric"/>
            <div className="hint">{t.rs_extra_hint}</div>
          </div>
          <div className="field"><label>{t.rs_supplier}</label><input value={note} onChange={e=>setNote(e.target.value)} placeholder={SUPPLIERS[0]}/></div>
        </div>
        <div className="drawer-foot">
          <div className="df-sum">
            <span>{t.rs_batch} · {units} {t.rs_units}{partial? " · "+t.rs_costed_only : ""}</span>
            {anyCost? <b>{fmtPrice(spend,lang)}</b> : <b className="none">{units? t.rs_no_costs : "—"}</b>}
          </div>
          <button className="btn btn-accent" disabled={!units} onClick={()=>{
            store.restock(shop.id, active, note, extra);
            toast(t.inv_received+" · +"+units);
            onClose();
          }}>{I.box({width:17,height:17})} {t.inv_confirm_restock}</button>
        </div>
      </aside>
    </div>
  );
}

function HistoryDrawer({ row, movements, sales, t, lang, onClose }){
  const list = movements.filter(m=>m.variantId===row.v.id);
  useEscape(onClose);
  const saleNo = (id)=>{ const s = sales.find(x=>x.id===id); return s? "#"+s.no : ""; };
  return (
    <div className="drawer-scrim" onClick={onClose}>
      <aside className="drawer" onClick={e=>e.stopPropagation()}>
        <div className="drawer-head">
          <div><h3>{t.inv_history}</h3><div className="modal-sub">{textFB(row.p.name,lang)}{vLabel(row.p,row.v,lang)? " · "+vLabel(row.p,row.v,lang) : ""}</div></div>
          <button className="icon-btn" onClick={onClose} aria-label={t.g_close}>{I.x()}</button>
        </div>
        <div className="drawer-body scroll-y">
          <div className="hist-now">
            <div><span>{t.inv_qty}</span><b>{row.v.qty}</b></div>
            <div><span>{t.inv_cost}</span><b>{row.v.avgCost!=null? fmtNum(row.v.avgCost) : "—"}</b></div>
            <div><span>{t.inv_barcode}</span><b className="mono">{row.v.barcode}</b></div>
          </div>
          <div className="timeline">
            {list.length===0 && <div className="hint">{t.inv_no_match}</div>}
            {list.map(m=>(
              <div key={m.id} className="tl-row">
                <span className="tl-date">{fmtDate(m.at,lang)}</span>
                <span className={"tl-dot "+(m.delta>0?"up":m.delta<0?"down":"flat")}></span>
                <div className="tl-main">
                  <b>{reasonLabel(m.reason,t)} {m.delta>0? "+"+m.delta : m.delta<0? m.delta : ""}
                    {m.reason==="restock" && m.unitCost!=null && <span className="tl-cost"> @ {fmtNum(m.unitCost)}</span>}
                    {m.saleId && <span className="tl-cost"> · {saleNo(m.saleId)}</span>}
                  </b>
                  {m.note && <span className="tl-note">“{m.note}”</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function InventoryView({ store, shop, t, lang, onScan }){
  const st = store.settings(shop.id);
  const products = store.products(shop.id);
  const movements = store.movements(shop.id);
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [cat, setCat] = React.useState("all");
  const [sel, setSel] = React.useState([]);
  const [modal, setModal] = React.useState(null);
  const [pop, setPop] = React.useState(null);
  const [view, setView] = React.useState("stock");
  const [menu, setMenu] = React.useState(null);
  const [histFocus, setHistFocus] = React.useState(null);

  const rows = [];
  products.forEach(p => p.variants.forEach(v => rows.push({ p, v, state: variantState(v, st.threshold) })));
  const lastOf = (vid)=>{ const m = movements.find(x=>x.variantId===vid); return m? m.at : null; };
  const shown = rows.filter(r=>{
    if(filter==="low" && r.state!=="low") return false;
    if(filter==="out" && r.state!=="out") return false;
    if(cat!=="all" && r.p.catId!==cat) return false;
    if(q){
      const hay = (textFB(r.p.name,lang)+" "+textFB(r.p.name,"en")+" "+variantLabel(r.p.catId,r.v.options||{},lang)+" "+r.v.barcode).toLowerCase();
      if(!hay.includes(q.trim().toLowerCase())) return false;
    }
    return true;
  });
  const selRows = shown.filter(r=>sel.includes(r.v.id));
  const oversold = rows.filter(r=>r.v.qty<0);
  const undoable = store.lastRestock(shop.id);
  const noCode = rows.filter(r=>!r.v.barcode);
  const counts = { all: rows.length, low: rows.filter(r=>r.state==="low").length, out: rows.filter(r=>r.state==="out").length };
  const toggleSel = (id)=> setSel(s=> s.includes(id)? s.filter(x=>x!==id) : [...s,id]);

  if(products.length===0){
    return <EmptyState icon={I.box} title={t.db_inventory} body={t.inv_empty}/>;
  }
  return (
    <div className="inv">
      <div className="db-sec-head">
        <div><h2>{t.db_inventory}</h2><div className="sub">{t.inv_sub}</div></div>
        <div className="head-acts">
          <button className="btn btn-soft btn-sm" onClick={()=>setModal({k:"restock"})}>{I.box({width:16,height:16})} {t.inv_restock}</button>
          <button className="btn btn-soft btn-sm" onClick={()=>setModal({k:"adjpick"})}>{I.edit({width:16,height:16})} {t.adj_title}</button>
          <button className="btn btn-soft btn-sm" onClick={()=>setModal({k:"labels", rows: (selRows.length? selRows : shown).filter(r=>r.v.barcode)})}>{I.printer({width:16,height:16})} {t.inv_print}</button>
          <button className="btn btn-accent btn-sm" onClick={onScan}>{I.camera({width:16,height:16})} {t.inv_scan_sell}</button>
        </div>
      </div>

      <div className="inv-tabs">
        <button className={view==="stock"?"on":""} onClick={()=>setView("stock")}>{I.box({width:16,height:16})} {t.inv_tab_stock}</button>
        <button className={view==="history"?"on":""} onClick={()=>{ setHistFocus(null); setView("history"); }}>{I.undo({width:16,height:16})} {t.inv_tab_hist}</button>
      </div>

      {view==="history" && <StockHistory store={store} shop={shop} t={t} lang={lang} focus={histFocus} clearFocus={()=>setHistFocus(null)}/>}
      {view==="stock" && <React.Fragment>
      {oversold.length>0 && (
        <div className="oversold-bar">
          {I.warn({width:17,height:17})}
          <span><b>{t.inv_oversold}</b> · {fill(t.inv_oversold_d,{n:oversold.length})}</span>
          <button className="btn btn-ghost btn-xs" onClick={()=>setModal({k:"adj", p:oversold[0].p, vid:oversold[0].v.id})}>{t.inv_recount}</button>
        </div>
      )}
      {noCode.length>0 && (
        <div className="undo-bar">
          {I.barcode({width:16,height:16})}
          <span><b>{t.bc_missing}</b> · {fill(t.bc_missing_d,{n:noCode.length})}</span>
          <button className="lnk" onClick={()=>{ store.generateBarcodes(shop.id, noCode.map(r=>r.v.id)); toast(t.bc_generated); }}>{t.bc_gen_all}</button>
        </div>
      )}
      {undoable && (
        <div className="undo-bar">
          {I.undo({width:16,height:16})}
          <span>
            <b>{undoable.map(m=>{
              const x = store.variantIndex(shop.id)[m.variantId];
              return (x? textFB(x.p.name,lang)+(vLabel(x.p,x.v,lang)? " · "+vLabel(x.p,x.v,lang) : "") : "")+" +"+m.delta;
            }).filter(Boolean).join(" · ")}</b>
            {" — "}{t.inv_undo_d}
          </span>
          <button className="lnk" onClick={()=>{ store.undoRestock(shop.id); toast(t.inv_undone); }}>{t.inv_undo_restock}</button>
        </div>
      )}
      <div className="inv-bar">
        <div className="inline-search grow">{I.barcode({width:18,height:18})}<input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.inv_search}/></div>
        <div className="chip-row">
          <button className={"pick-chip"+(filter==="all"?" on":"")} onClick={()=>setFilter("all")}>{t.inv_all} <i>{counts.all}</i></button>
          <button className={"pick-chip"+(filter==="low"?" on":"")} onClick={()=>setFilter("low")}>{t.inv_low} <i>{counts.low}</i></button>
          <button className={"pick-chip"+(filter==="out"?" on":"")} onClick={()=>setFilter("out")}>{t.inv_out} <i>{counts.out}</i></button>
        </div>
        <select className="mini-select" value={cat} onChange={e=>setCat(e.target.value)}>
          <option value="all">{t.cat_platform}: {t.g_all}</option>
          {[...new Set(products.map(x=>x.catId))].map(id=>(<option key={id} value={id}>{catLabel(id,lang)}</option>))}
        </select>
      </div>

      {sel.length>0 && (
        <div className="bulk-bar">
          <b>{fill(t.inv_selected,{n:sel.length})}</b>
          <div className="bulk-acts">
            <button className="btn btn-ghost btn-xs" onClick={()=>setModal({k:"threshold", rows:selRows})}>{t.inv_set_threshold}</button>
            <button className="btn btn-ghost btn-xs" onClick={()=>setModal({k:"labels", rows:selRows})}>{I.printer({width:14,height:14})} {t.inv_print}</button>
            <button className="btn btn-ghost btn-xs" onClick={()=>setSel([])}>{t.g_cancel}</button>
          </div>
        </div>
      )}

      <div className="stock-table">
        <div className="stk-head">
          <span className="stk-c-sel"><input type="checkbox" checked={shown.length>0 && sel.length===shown.length} onChange={e=>setSel(e.target.checked? shown.map(r=>r.v.id):[])}/></span>
          <span className="stk-c-prod">{t.db_products}</span>
          <span className="stk-c-bc">{t.inv_barcode}</span>
          <span className="stk-c-qty">{t.inv_qty}</span>
          <span className="stk-c-cost">{t.inv_cost} <Info text={t.inv_cost_d}/></span>
          <span className="stk-c-st">{t.inv_status}</span>
          <span className="stk-c-last">{t.inv_last}</span>
          <span className="stk-c-more"></span>
        </div>
        {shown.length===0 && <div className="stk-empty">{t.inv_no_match}</div>}
        {shown.map(r=>(
          <div key={r.v.id} className={"stk-row"+(sel.includes(r.v.id)?" sel":"")}>
            <span className="stk-c-sel"><input type="checkbox" checked={sel.includes(r.v.id)} onChange={()=>toggleSel(r.v.id)}/></span>
            <div className="stk-c-prod">
              <div className="stk-photo"><ImageSlot id={pslot(shop.id,r.p,0)} src={photoURL(r.p.tone, pslot(shop.id,r.p,0), 90,90, IMG_KW[shop.type], products.findIndex(x=>x.id===r.p.id))} placeholder="" style={FILL}/></div>
              <div className="stk-name">
                <b>{textFB(r.p.name,lang)}</b>
                <span>{variantLabel(r.p.catId, r.v.options||{}, lang) || catLabel(r.p.catId, lang)}</span>
              </div>
            </div>
            <span className="stk-c-bc">
              <button className={"bc-btn"+(!r.v.barcode? " empty" : /^RS-/.test(r.v.barcode)? "" : " ean")} title={t.inv_edit_bc} onClick={()=>setModal({k:"bc", row:r})}>
                {I.barcode({width:15,height:15})} {r.v.barcode || t.bc_missing}
              </button>
            </span>
            <span className="stk-c-qty">
              <button className={"qty-btn"+(r.v.qty<0?" neg":r.v.qty<=0?" zero":"")} title={t.adj_title} onClick={()=>setModal({k:"adj", p:r.p, vid:r.v.id})}>{r.v.qty}</button>
              {pop===r.v.id && <QtyPopover row={r} t={t} onClose={()=>setPop(null)}
                onSave={(n,reason,note)=>{ store.setQty(shop.id, r.v.id, n, reason, note); toast(t.st_saved); }}/>}
            </span>
            <span className={"stk-c-cost"+(r.v.avgCost==null?" none":"")}>{r.v.avgCost!=null? fmtNum(r.v.avgCost) : t.inv_no_cost}</span>
            <span className="stk-c-st"><StatusPill state={r.state} t={t}/></span>
            <span className="stk-c-last">{lastOf(r.v.id)? fmtDate(lastOf(r.v.id),lang) : "—"}</span>
            <span className="stk-c-more">
              <button className="icon-btn sm stk-restock" title={t.rs_restock_btn} aria-label={t.rs_restock_btn} onClick={()=>setModal({k:"restock1", p:r.p})}>{I.plus({width:16,height:16})}</button>
              <button className="icon-btn sm" title={t.inv_history} onClick={()=>setMenu(menu===r.v.id? null : r.v.id)}>{I.more({width:17,height:17})}</button>
              {menu===r.v.id && (
                <React.Fragment>
                  <div className="row-menu-scrim" onClick={()=>setMenu(null)}></div>
                  <div className="row-menu">
                    <button onClick={()=>{ setMenu(null); setModal({k:"adj", p:r.p, vid:r.v.id}); }}>{I.edit({width:15,height:15})} {t.adj_title}</button>
                    <button onClick={()=>{ setMenu(null); setHistFocus(r.v.id); setView("history"); }}>{I.undo({width:15,height:15})} {t.inv_history}</button>
                    <button onClick={()=>{ setMenu(null); setModal({k:"bc", row:r}); }}>{I.barcode({width:15,height:15})} {t.inv_barcode}</button>
                  </div>
                </React.Fragment>
              )}
            </span>
          </div>
        ))}
      </div>

      </React.Fragment>}

      {modal && modal.k==="threshold" && (
        <ThresholdModal rows={modal.rows} t={t} onClose={()=>setModal(null)}
          onApply={(v)=>{ store.setVariantThreshold(shop.id, modal.rows.map(r=>r.v.id), v); setSel([]); toast(t.st_saved); }}/>
      )}
      {modal && modal.k==="labels" && <LabelsModal rows={modal.rows} t={t} lang={lang} pro={st.plan==="pro"} onClose={()=>setModal(null)}/>}
      {modal && modal.k==="hist" && <HistoryDrawer row={modal.row} movements={movements} sales={store.sales(shop.id)} t={t} lang={lang} onClose={()=>setModal(null)}/>}
      {modal && modal.k==="bc" && <BarcodeModal store={store} shop={shop} row={modal.row} t={t} lang={lang} onClose={()=>setModal(null)}/>}
      {modal && modal.k==="restock" && <RestockPicker store={store} shop={shop} t={t} lang={lang} onPick={(p)=>setModal({k:"restock1", p})} onClose={()=>setModal(null)}/>}
      {modal && modal.k==="adjpick" && <RestockPicker store={store} shop={shop} t={t} lang={lang} title={t.adj_choose} onPick={(p)=>setModal({k:"adj", p})} onClose={()=>setModal(null)}/>}
      {modal && modal.k==="adj" && <AdjustModal store={store} shop={shop} product={store.products(shop.id).find(x=>x.id===modal.p.id)||modal.p} variantId={modal.vid} t={t} lang={lang} onClose={()=>setModal(null)}/>}
      {modal && modal.k==="restock1" && <RestockModal store={store} shop={shop} product={store.products(shop.id).find(x=>x.id===modal.p.id)||modal.p} t={t} lang={lang} onClose={()=>setModal(null)}/>}
    </div>
  );
}

Object.assign(window, { InventoryView, reasonLabel, LabelsModal, RestockDrawer, RestockModal, RestockPicker, HistoryDrawer, BarcodeModal });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { reasonLabel, QtyPopover, BarcodeModal, ThresholdModal, LabelsModal, RestockPicker, RestockModal, RestockDrawer, HistoryDrawer, InventoryView });
