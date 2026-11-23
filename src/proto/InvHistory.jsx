// ===== Inventory → History: readable ledger + Reports =====
Object.assign(I18N.en, { inv_tab_stock:"Stock", inv_tab_hist:"History", h_p7:"Last 7 days", h_p30:"Last 30 days", h_p90:"Last 3 months", h_pall:"All time", h_all:"All", h_in:"Came in", h_out:"Went out", h_more:"Show more", h_today:"Today", h_yday:"Yesterday", h_empty:"No movements for these filters", h_export:"Export CSV", h_search:"Product, size or barcode", h_moves:"movements",
  hx_timeline:"Timeline", hx_reports:"Reports", hx_story:"{in} came in · {sold} sold · {lost} lost or damaged", hx_net:"Net change", hx_sold:"Sold", hx_lost:"Lost / damaged", hx_was:"was", hx_now:"now", hx_only:"Only this product", hx_value:"value",
  hx_stock_val:"Stock value (cost)", hx_retail_val:"Stock value (selling price)", hx_revenue:"Sales", hx_profit:"Profit", hx_units:"pcs", hx_flow:"Stock in & out by day", hx_top:"Best sellers", hx_runout:"Will run out soon", hx_runout_d:"At the current selling pace", hx_days:"{n} days left", hx_dead:"Not selling", hx_dead_d:"In stock, but no sales in this period", hx_tied:"money tied up", hx_losses:"Losses & damage", hx_spend:"Restock spending", hx_avgcost:"avg cost", hx_nodata:"Not enough data yet", hx_sellthru:"sell-through", hx_restock_btn:"Restock", hx_cost_unknown:"cost not set" });
Object.assign(I18N.ru, { inv_tab_stock:"Остатки", inv_tab_hist:"История", h_p7:"7 дней", h_p30:"30 дней", h_p90:"3 месяца", h_pall:"Всё время", h_all:"Все", h_in:"Пришло", h_out:"Ушло", h_more:"Показать ещё", h_today:"Сегодня", h_yday:"Вчера", h_empty:"Нет движений по этим фильтрам", h_export:"Экспорт CSV", h_search:"Товар, размер или штрихкод", h_moves:"движений",
  hx_timeline:"Лента", hx_reports:"Отчёты", hx_story:"Пришло {in} · продано {sold} · списано {lost}", hx_net:"Итого", hx_sold:"Продано", hx_lost:"Потери / брак", hx_was:"было", hx_now:"стало", hx_only:"Только этот товар", hx_value:"сумма",
  hx_stock_val:"Стоимость остатка (закуп)", hx_retail_val:"Стоимость остатка (продажа)", hx_revenue:"Продажи", hx_profit:"Прибыль", hx_units:"шт", hx_flow:"Приход и расход по дням", hx_top:"Лидеры продаж", hx_runout:"Скоро закончится", hx_runout_d:"При текущем темпе продаж", hx_days:"осталось {n} дн.", hx_dead:"Не продаётся", hx_dead_d:"Есть на складе, но нет продаж за период", hx_tied:"заморожено", hx_losses:"Потери и брак", hx_spend:"Затраты на закуп", hx_avgcost:"ср. цена", hx_nodata:"Пока мало данных", hx_sellthru:"продано", hx_restock_btn:"Пополнить", hx_cost_unknown:"закуп не указан" });
Object.assign(I18N.uz, { inv_tab_stock:"Qoldiq", inv_tab_hist:"Tarix", h_p7:"7 kun", h_p30:"30 kun", h_p90:"3 oy", h_pall:"Hammasi", h_all:"Hammasi", h_in:"Kirdi", h_out:"Chiqdi", h_more:"Yana ko\u02bcrsatish", h_today:"Bugun", h_yday:"Kecha", h_empty:"Bu filtrlar bo\u02bcyicha harakat yo\u02bcq", h_export:"CSV eksport", h_search:"Mahsulot, o\u02bclcham yoki shtrix-kod", h_moves:"harakat",
  hx_timeline:"Lenta", hx_reports:"Hisobotlar", hx_story:"{in} kirdi · {sold} sotildi · {lost} yo\u02bcqotildi", hx_net:"Jami o\u02bczgarish", hx_sold:"Sotildi", hx_lost:"Yo\u02bcqotish / nuqson", hx_was:"edi", hx_now:"bo\u02bcldi", hx_only:"Faqat shu mahsulot", hx_value:"summa",
  hx_stock_val:"Qoldiq qiymati (tannarx)", hx_retail_val:"Qoldiq qiymati (sotuv)", hx_revenue:"Savdo", hx_profit:"Foyda", hx_units:"dona", hx_flow:"Kunlik kirim va chiqim", hx_top:"Eng ko\u02bcp sotilgan", hx_runout:"Tez orada tugaydi", hx_runout_d:"Hozirgi sotuv sur\u02bcatida", hx_days:"{n} kun qoldi", hx_dead:"Sotilmayapti", hx_dead_d:"Omborda bor, lekin bu davrda sotilmagan", hx_tied:"muzlatilgan pul", hx_losses:"Yo\u02bcqotish va nuqson", hx_spend:"Xarid xarajatlari", hx_avgcost:"o\u02bcrt. narx", hx_nodata:"Hozircha ma\u02bclumot kam", hx_sellthru:"sotildi", hx_restock_btn:"To\u02bcldirish", hx_cost_unknown:"tannarx yo\u02bcq" });

addI18N({
  hc_date:   ["Date", "Дата", "Sana"],
  hc_product:["Product", "Товар", "Mahsulot"],
  hc_variant:["Variant", "Вариант", "Variant"],
  hc_barcode:["Barcode", "Штрихкод", "Shtrix-kod"],
  hc_what:   ["What happened", "Что произошло", "Nima bo‘ldi"],
  hc_qty:    ["Qty", "Кол-во", "Soni"],
  hc_price:  ["Price", "Цена", "Narxi"],
  hc_sum:    ["Amount", "Сумма", "Summa"],
  hc_stock:  ["Stock left", "Остаток", "Qoldiq"],
  hc_who:    ["Who", "Кто", "Kim"],
  h_pcustom: ["Pick dates", "Свои даты", "Sanani tanlash"],
  h_from:    ["From", "С", "Dan"],
  h_to:      ["To", "По", "Gacha"],
});
// dates are always shown in full (dd.mm.yyyy) — never "today" / "yesterday"
const hxDate = (ts)=>{ const d = new Date(ts); return String(d.getDate()).padStart(2,"0")+"."+String(d.getMonth()+1).padStart(2,"0")+"."+d.getFullYear(); };
const hxISO = (ts)=>{ const d = new Date(ts); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };

addI18N({
  hc_id:    ["ID", "ID", "ID"],
  dr_today: ["Today", "Сегодня", "Bugun"],
  dr_yday:  ["Yesterday", "Вчера", "Kecha"],
  dr_7:     ["Last 7 days", "Последние 7 дней", "Oxirgi 7 kun"],
  dr_30:    ["Last 30 days", "Последние 30 дней", "Oxirgi 30 kun"],
  dr_month: ["This month", "Этот месяц", "Shu oy"],
  dr_prev:  ["Last month", "Прошлый месяц", "O‘tgan oy"],
  dr_all:   ["All time", "Всё время", "Hammasi"],
  dr_apply: ["Apply", "Применить", "Qo‘llash"],
  dr_start: ["Pick the start date", "Выберите начало", "Boshlanish sanasini tanlang"],
  dr_end:   ["Now pick the end date", "Теперь выберите конец", "Endi tugash sanasini tanlang"],
});
const DR_WD = { en:["Mo","Tu","We","Th","Fr","Sa","Su"], ru:["Пн","Вт","Ср","Чт","Пт","Сб","Вс"], uz:["Du","Se","Ch","Pa","Ju","Sh","Ya"] };
const DR_MON = {
  en:["January","February","March","April","May","June","July","August","September","October","November","December"],
  ru:["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
  uz:["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"],
};
const DR_CSS = `
.dr{position:relative;display:inline-block}
.dr-btn{display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 14px;border-radius:999px;border:1.5px solid var(--line);background:#fff;font-weight:600;font-size:14px}
.dr-btn:hover,.dr-btn.on{border-color:var(--ink)}
.dr-pop{position:absolute;top:calc(100% + 8px);right:0;z-index:60;display:flex;background:#fff;border:1px solid var(--line);border-radius:18px;box-shadow:0 24px 60px rgba(40,30,20,.18);overflow:hidden}
.dr-pre{display:flex;flex-direction:column;padding:10px;border-right:1px solid var(--line-2);min-width:160px}
.dr-pre button{text-align:left;padding:9px 12px;border-radius:10px;font-size:14px;font-weight:550}
.dr-pre button:hover{background:var(--paper)}
.dr-pre button.on{background:var(--ink);color:#fff}
.dr-cal{padding:14px 16px}
.dr-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.dr-nav button{width:32px;height:32px;border-radius:50%;font-size:18px}
.dr-nav button:hover{background:var(--paper)}
.dr-months{display:flex;gap:22px}
.dr-mh{text-align:center;font-weight:700;margin-bottom:8px}
.dr-grid{display:grid;grid-template-columns:repeat(7,36px);gap:2px 0}
.dr-wd{text-align:center;font-size:11.5px;font-weight:700;color:var(--faint);padding-bottom:4px}
.dr-d{height:34px;font-size:13.5px;font-weight:550;border-radius:0}
.dr-d:hover:not(:disabled){background:var(--primary-tint);border-radius:8px}
.dr-d.in{background:var(--primary-tint)}
.dr-d.edge{background:var(--primary);color:#fff;border-radius:8px}
.dr-d.today:not(.edge){box-shadow:inset 0 0 0 1.5px var(--ink);border-radius:8px}
.dr-d:disabled{color:var(--line);cursor:default}
.dr-foot{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:12px;padding-top:12px;border-top:1px solid var(--line-2);font-size:13px;color:var(--soft)}
.dr-foot b{color:var(--ink)}
@media (max-width:720px){.dr-pop{position:fixed;left:8px;right:8px;top:auto;bottom:8px;flex-direction:column}.dr-pre{flex-direction:row;flex-wrap:wrap;border-right:0;border-bottom:1px solid var(--line-2)}.dr-months>div+div{display:none}}
`;
function hxPresets(){
  const n = Date.now(), DAY = 86400000, d = new Date();
  const m0 = new Date(d.getFullYear(), d.getMonth(), 1), pm0 = new Date(d.getFullYear(), d.getMonth()-1, 1), pm1 = new Date(d.getFullYear(), d.getMonth(), 0);
  return [["dr_today",hxISO(n),hxISO(n)],["dr_yday",hxISO(n-DAY),hxISO(n-DAY)],["dr_7",hxISO(n-6*DAY),hxISO(n)],["dr_30",hxISO(n-29*DAY),hxISO(n)],
    ["dr_month",hxISO(m0),hxISO(n)],["dr_prev",hxISO(pm0),hxISO(pm1)],["dr_all","",""]];
}
// one button → presets on the left, a two-month calendar on the right; click start, click end, Apply
function HxRange({ from, to, onChange, t, lang }){
  const [open, setOpen] = React.useState(false);
  const [a, setA] = React.useState(from), [b, setB] = React.useState(to), [hov, setHov] = React.useState(null);
  const [view, setView] = React.useState(()=>{ const d = new Date(); return new Date(d.getFullYear(), d.getMonth()-1, 1); });
  const ref = React.useRef(null);
  React.useEffect(()=>{
    if(!open) return; setA(from); setB(to);
    const c = (e)=>{ if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const k = (e)=>{ if(e.key==="Escape") setOpen(false); };
    document.addEventListener("mousedown", c); addEventListener("keydown", k);
    return ()=>{ document.removeEventListener("mousedown", c); removeEventListener("keydown", k); };
  }, [open]);
  const presets = hxPresets();
  const active = presets.find(p=>p[1]===from && p[2]===to);
  const fmt = (iso)=> iso? hxDate(new Date(iso+"T00:00:00")) : "";
  const label = active? t[active[0]] : (from? fmt(from)+" – "+fmt(to||from) : t.dr_all);
  const todayISO = hxISO(Date.now());
  const pick = (iso)=>{ if(!a || b){ setA(iso); setB(""); } else if(iso < a){ setB(a); setA(iso); } else setB(iso); };
  const hi = b || (a && hov) || "";
  const inRange = (iso)=>{ if(!a || !hi) return false; const x = a < hi? a : hi, y = a < hi? hi : a; return iso >= x && iso <= y; };
  const month = (m)=>{
    const y = m.getFullYear(), mo = m.getMonth(), first = (new Date(y, mo, 1).getDay()+6)%7, n = new Date(y, mo+1, 0).getDate();
    const cells = []; for(let i=0;i<first;i++) cells.push(null); for(let d=1; d<=n; d++) cells.push(d);
    return (
      <div key={y+"-"+mo}>
        <div className="dr-mh">{DR_MON[lang][mo]} {y}</div>
        <div className="dr-grid" onMouseLeave={()=>setHov(null)}>
          {DR_WD[lang].map(w=><span key={w} className="dr-wd">{w}</span>)}
          {cells.map((d,i)=>{ if(!d) return <span key={i}></span>;
            const iso = y+"-"+String(mo+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");
            return <button key={i} type="button" disabled={iso > todayISO}
              className={"dr-d"+(inRange(iso)?" in":"")+(iso===a || iso===b?" edge":"")+(iso===todayISO?" today":"")}
              onMouseEnter={()=>setHov(iso)} onClick={()=>pick(iso)}>{d}</button>; })}
        </div>
      </div>
    );
  };
  const next = new Date(view.getFullYear(), view.getMonth()+1, 1);
  return (
    <div className="dr" ref={ref}>
      <style>{DR_CSS}</style>
      <button type="button" className={"dr-btn"+(open?" on":"")} onClick={()=>setOpen(o=>!o)} aria-expanded={open}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        {label}
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {open && (
        <div className="dr-pop" role="dialog">
          <div className="dr-pre">
            {presets.map(([k,f,tt])=>(
              <button key={k} type="button" className={active && active[0]===k? "on" : ""} onClick={()=>{ onChange(f, tt); setOpen(false); }}>{t[k]}</button>
            ))}
          </div>
          <div className="dr-cal">
            <div className="dr-nav">
              <button type="button" aria-label="←" onClick={()=>setView(new Date(view.getFullYear(), view.getMonth()-1, 1))}>‹</button>
              <button type="button" aria-label="→" onClick={()=>setView(new Date(view.getFullYear(), view.getMonth()+1, 1))}>›</button>
            </div>
            <div className="dr-months">{month(view)}{month(next)}</div>
            <div className="dr-foot">
              <span>{a && b ? <b>{fmt(a)} – {fmt(b)}</b> : a ? t.dr_end : t.dr_start}</span>
              <button type="button" className="btn btn-accent btn-sm" disabled={!a} onClick={()=>{ onChange(a, b || a); setOpen(false); }}>{t.dr_apply}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// "What happened" as a fixed set of coloured labels (good for counting and filtering)
// History uses the same table look as the Stock tab (stock-table / stk-head / stk-row)
const HX_COLS = "84px minmax(240px,2.2fr) 70px 110px 120px 80px 120px 150px 160px 150px";
const HX_PILL = { sale:["#fde7e2","#b83f28"], restock:["#e2f3ea","#1f7a4d"], correction:["#e6edf8","#2f5ea8"], loss:["#fdf0d9","#8a5a14"], return:["#eee8f8","#5b3d99"] };

const HX_R = {
  sale:      { c:"sale",  ic:(p)=><svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 8h14l-1.2 10.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  restock:   { c:"in",    ic:(p)=><svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M12 9v6M9 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  correction:{ c:"fix",   ic:(p)=><svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 20h4L19 9l-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg> },
  loss:      { c:"loss",  ic:(p)=><svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 4 3 19h18L12 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M12 10v4M12 16.5v.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg> },
  return:    { c:"ret",   ic:(p)=><svg viewBox="0 0 24 24" fill="none" {...p}><path d="M9 7 4 12l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 12h10a6 6 0 0 1 0 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" transform="translate(0 -6)"/></svg> },
};
const hxR = (r)=> HX_R[r] || HX_R.correction;

function StockHistory({ store, shop, t, lang, focus, clearFocus }){
  const movements = store.movements(shop.id);
  const idx = store.variantIndex(shop.id);
  const sales = store.sales(shop.id);
  const [view, setView] = React.useState("timeline");
  const [q, setQ] = React.useState("");
  const [reason, setReason] = React.useState("all");
  const [period, setPeriod] = React.useState("30");
  const [from, setFrom] = React.useState(()=>hxISO(Date.now()-29*86400000));
  const [to, setTo] = React.useState(()=>hxISO(Date.now()));
  const [limit, setLimit] = React.useState(40);
  const [pFocus, setPFocus] = React.useState(null);
  React.useEffect(()=>{ setLimit(40); }, [q, reason, period, from, to, focus, pFocus]);
  React.useEffect(()=>{ if(focus) setPFocus(null); }, [focus]);

  const now = Date.now(), DAY = 86400000;
  const since = from? new Date(from+"T00:00:00").getTime() : 0;
  const until = to? new Date(to+"T23:59:59").getTime() : Infinity;
  const repPeriod = from? String(Math.max(1, Math.round(((until===Infinity? now : Math.min(now, until)) - since)/DAY))) : "all";
  const whoOf = (m)=>{ if(m.reason!=="sale" || !m.saleId) return "—"; const s = sales.find(x=>x.id===m.saleId); if(!s) return "—";
    const id = store.saleSeller(shop.id, s); const mm = store.team(shop.id).find(x=>x.id===id); if(!mm) return "—";
    // always a real first + last name, never "You"
    if(mm.name) return mm.name;
    const ses = store.state.session; return (ses && ses.name) || ""; };
  const fx = focus && idx[focus];

  // running stock: walk newest → oldest from current qty
  const after = React.useMemo(()=>{
    const cur = {}; Object.keys(idx).forEach(k=>{ cur[k] = idx[k].v.qty; });
    const out = {};
    movements.forEach(m=>{ if(cur[m.variantId]==null) return; out[m.id] = cur[m.variantId]; cur[m.variantId] -= m.delta; });
    return out;
  }, [movements, idx]);

  const scoped = movements.filter(m=>{
    const x = idx[m.variantId]; if(!x) return false;
    if(m.at < since || m.at > until) return false;
    if(focus && m.variantId!==focus) return false;
    if(pFocus && x.p.id!==pFocus) return false;
    if(q){
      const hay = (textFB(x.p.name,lang)+" "+textFB(x.p.name,"en")+" "+(vLabel(x.p,x.v,lang)||"")+" "+(x.v.barcode||"")+" "+(m.note||"")).toLowerCase();
      if(!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  const list = reason==="all"? scoped : scoped.filter(m=>m.reason===reason);
  const cnt = (k)=> k==="all"? scoped.length : scoped.filter(m=>m.reason===k).length;
  const sumBy = (arr, f)=> arr.reduce((n,m)=>n+f(m),0);
  const inN = sumBy(scoped.filter(m=>m.delta>0), m=>m.delta);
  const soldN = sumBy(scoped.filter(m=>m.reason==="sale"), m=>-m.delta);
  const lostN = sumBy(scoped.filter(m=>m.reason==="loss"), m=>Math.abs(m.delta||m.qty||0));
  const netN = sumBy(scoped, m=>m.delta);
  const saleNo = (id)=>{ const s = sales.find(x=>x.id===id); return s? "#"+s.no : ""; };

  const dayKey = (ts)=>{ const d=new Date(ts); return d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate(); };
  const today = dayKey(now), yday = dayKey(now-DAY);
  const dayLabel = (ts)=>{ const k=dayKey(ts); if(k===today) return t.h_today; if(k===yday) return t.h_yday;
    const d=new Date(ts); return fmtDate(ts,lang)+(d.getFullYear()!==new Date().getFullYear()? " "+d.getFullYear() : ""); };
  const groups = [];
  list.slice(0,limit).forEach(m=>{
    const k = dayKey(m.at);
    let g = groups[groups.length-1];
    if(!g || g.k!==k){ g = { k, label:dayLabel(m.at), items:[], inn:0, out:0 }; groups.push(g); }
    g.items.push(m); if(m.delta>0) g.inn += m.delta; else g.out -= m.delta;
  });
  const hhmm = (ts)=>{ const d=new Date(ts); return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); };
  const unitOf = (m)=> m.reason==="sale" && m.saleId ? ((sales.find(s=>s.id===m.saleId)||{lines:[]}).lines.find(l=>l.variantId===m.variantId)||{}).unit : m.unitCost;

  function exportCSV(){
    const rows = [["date","time","product","variant","barcode","what","qty","price","amount","stock_before","stock_after","who","note"]];
    list.forEach(m=>{ const x=idx[m.variantId]; const unit = unitOf(m); const a = after[m.id];
      rows.push([hxDate(m.at), hhmm(m.at), textFB(x.p.name,lang), vLabel(x.p,x.v,lang)||"", x.v.barcode||"", reasonLabel(m.reason,t)+(m.saleId? " "+saleNo(m.saleId) : ""), m.delta, unit!=null? unit : "", unit!=null? Math.abs(m.delta||m.qty||0)*unit : "", a!=null? a-m.delta : "", a!=null? a : "", whoOf(m), m.note&&m.note!=="initial"? m.note : ""]); });
    const csv = rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download = "stock-history.csv"; a.click();
  }

  const reasons = [["all",t.h_all],["sale",t.inv_r_sale],["restock",t.inv_r_restock],["correction",t.inv_r_correction],["loss",t.inv_r_loss2],["return",t.inv_r_return]];
  const pf = pFocus && store.products(shop.id).find(p=>p.id===pFocus);

  return (
    <div className="hist hx">
      <div className="hx-top">
        <div className="hx-seg">
          <button className={view==="timeline"?"on":""} onClick={()=>setView("timeline")}>{t.hx_timeline}</button>
          <button className={view==="reports"?"on":""} onClick={()=>setView("reports")}>{t.hx_reports}</button>
        </div>
        <HxRange from={from} to={to} t={t} lang={lang} onChange={(f, tt)=>{ setFrom(f); setTo(tt); setPeriod(f? "custom" : "all"); store.ensureRange(shop.id, f ? new Date(f+"T00:00:00").getTime() : 0); }}/>
      </div>

      {view==="reports" ? <HxReports store={store} shop={shop} t={t} lang={lang} since={since} period={repPeriod} movements={movements} sales={sales} idx={idx}/> : (
      <React.Fragment>
        <div className="hx-story">
          <div className="hx-kpi in"><span>{t.h_in}</span><b>+{inN}</b></div>
          <div className="hx-kpi sale"><span>{t.hx_sold}</span><b>−{soldN}</b></div>
          <div className="hx-kpi loss"><span>{t.hx_lost}</span><b>−{lostN}</b></div>
          <div className="hx-kpi"><span>{t.hx_net}</span><b className={netN>0?"up":netN<0?"down":""}>{netN>0?"+":""}{netN}</b></div>
        </div>

        <div className="inv-bar hx-bar">
          <div className="inline-search grow">{I.search({width:17,height:17})}<input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.h_search}/></div>
          <button className="btn btn-ghost btn-sm" disabled={!list.length} onClick={exportCSV}>{I.download? I.download({width:15,height:15}) : null} {t.h_export}</button>
        </div>
        <div className="chip-row hist-chips hx-chips">
          {fx && <button className="pick-chip on focus" onClick={clearFocus}>{textFB(fx.p.name,lang)}{vLabel(fx.p,fx.v,lang)? " · "+vLabel(fx.p,fx.v,lang) : ""} {I.x({width:12,height:12})}</button>}
          {pf && <button className="pick-chip on focus" onClick={()=>setPFocus(null)}>{textFB(pf.name,lang)} {I.x({width:12,height:12})}</button>}
          {reasons.map(([k,l])=>{ const n=cnt(k); return <button key={k} className={"pick-chip"+(reason===k?" on":"")+(!n && reason!==k?" zero":"")} onClick={()=>setReason(k)}>{k!=="all" && <span className={"hx-dot "+hxR(k).c}></span>}{l} <i>{n}</i></button>; })}
        </div>

        {list.length===0 && <div className="stk-empty card">{t.h_empty}</div>}
        {list.length>0 && (
          <div className="stock-table hx-stock" style={{overflowX:"auto"}}>
            <div style={{minWidth:1120}}>
              <div className="stk-head" style={{display:"grid", gridTemplateColumns:HX_COLS, alignItems:"center"}}>
                {/* what you need at a glance first: which product, how many, at what price, total, stock left — then the details */}
                {[t.hc_id, t.db_products, t.hc_qty, t.hc_price, t.hc_sum, t.hc_stock, t.hc_what, t.hc_date, t.hc_who, t.hc_barcode].map((h,i)=>(
                  <span key={i} style={{whiteSpace:"nowrap", textAlign: i>=2 && i<=5? "right" : "left"}}>{h}</span>))}
              </div>
                {list.slice(0,limit).map(m=>{ const x = idx[m.variantId], R = hxR(m.reason), a = after[m.id], b = a!=null? a - m.delta : null;
                  const unit = unitOf(m), qty = Math.abs(m.delta||m.qty||0), val = unit!=null? qty*unit : null;
                  const td = {};
                  return (
                    <div key={m.id} className="stk-row" style={{display:"grid", gridTemplateColumns:HX_COLS, alignItems:"center"}}>
                      <span style={{...td, whiteSpace:"nowrap", fontFamily:"'Space Mono', monospace", fontSize:12.5, color: m.saleId? "var(--ink)" : "var(--faint)"}}>{m.saleId? saleNo(m.saleId) : "—"}</span>
                      <span style={{minWidth:0}}>
                        {/* same as the Stock tab: photo, name, variant (or category) underneath */}
                        <button className="stk-c-prod" style={{display:"flex", alignItems:"center", gap:10, textAlign:"left", padding:0, background:"none", border:0, cursor:"pointer"}} onClick={()=>setPFocus(x.p.id)} title={t.hx_only}>
                          <span className="stk-photo"><ImageSlot id={pslot(shop.id,x.p,0)} src={photoURL(x.p.tone, pslot(shop.id,x.p,0), 90,90, IMG_KW[shop.type], store.products(shop.id).findIndex(y=>y.id===x.p.id))} placeholder="" style={FILL}/></span>
                          <span className="stk-name"><b>{textFB(x.p.name,lang)}</b><span>{variantLabel(x.p.catId, x.v.options||{}, lang) || catLabel(x.p.catId, lang)}</span></span>
                        </button>
                      </span>
                      <span style={{...td, textAlign:"right", fontWeight:700}} className={"mv-delta "+(m.delta>0?"up":m.delta<0?"down":"")}>{m.delta>0? "+"+m.delta : m.delta}</span>
                      <span style={{...td, textAlign:"right", whiteSpace:"nowrap"}}>{unit!=null? fmtNum(unit) : "—"}</span>
                      <span style={{...td, textAlign:"right", whiteSpace:"nowrap", fontWeight:600}}>{val!=null? fmtNum(val) : "—"}</span>
                      <span style={{...td, textAlign:"right", whiteSpace:"nowrap", fontWeight:700}}>{a!=null? a : "—"}</span>
                      <span style={{...td, whiteSpace:"nowrap"}}><span title={m.note && m.note!=="initial"? m.note : undefined} style={{display:"inline-block", padding:"3px 10px", borderRadius:999, fontSize:12.5, fontWeight:700,
                        background:(HX_PILL[m.reason]||HX_PILL.correction)[0], color:(HX_PILL[m.reason]||HX_PILL.correction)[1]}}>{reasonLabel(m.reason,t)}</span></span>
                      <span style={{...td, whiteSpace:"nowrap"}}><b>{hxDate(m.at)}</b> <span style={{color:"var(--soft)"}}>{hhmm(m.at)}</span></span>
                      <span style={{...td, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{whoOf(m)}</span>
                      <span className="stk-c-bc" style={{...td, whiteSpace:"nowrap"}}><span className={"bc-btn"+(!x.v.barcode? " empty" : /^RS-/.test(x.v.barcode)? "" : " ean")} style={{cursor:"default"}}>{I.barcode({width:15,height:15})} {x.v.barcode || t.bc_missing}</span></span>
                    </div>
                  ); })}
            </div>
          </div>
        )}
        <div className="hist-days" style={{display:"none"}}>
          {groups.map(g=>(
            <div key={g.k} className="hist-day card">
              <div className="hist-day-h hx-day-h"><b>{g.label}</b><span>{g.inn>0 && <em className="up">{"+"+g.inn}</em>}{g.out>0 && <em className="down">{"−"+g.out}</em>}</span></div>
              {g.items.map(m=>{ const x = idx[m.variantId], R = hxR(m.reason), a = after[m.id], b = a!=null? a - m.delta : null;
                const unit = m.reason==="sale" && m.saleId ? ((sales.find(s=>s.id===m.saleId)||{lines:[]}).lines.find(l=>l.variantId===m.variantId)||{}).unit : m.unitCost;
                const val = unit!=null ? Math.abs(m.delta||m.qty||0)*unit : null;
                return (
                  <div key={m.id} className="hx-row">
                    <span className={"hx-ic "+R.c}>{R.ic({width:17,height:17})}</span>
                    <button className="hx-main" onClick={()=>setPFocus(x.p.id)} title={t.hx_only}>
                      <b>{textFB(x.p.name,lang)}{vLabel(x.p,x.v,lang)? <i> · {vLabel(x.p,x.v,lang)}</i> : null}</b>
                      <span>{reasonLabel(m.reason,t)}{m.saleId? " "+saleNo(m.saleId) : ""}{m.note && m.note!=="initial"? " · "+m.note : ""} · {hhmm(m.at)}</span>
                    </button>
                    {b!=null && <span className="hx-flow"><s>{b}</s>→<b>{a}</b></span>}
                    <span className="hx-right">
                      <span className={"mv-delta "+(m.delta>0?"up":m.delta<0?"down":"")}>{m.delta>0? "+"+m.delta : m.delta}</span>
                      {val!=null && <small>{fmtNum(val)}</small>}
                    </span>
                  </div>
                ); })}
            </div>
          ))}
        </div>
        {list.length>limit && <button className="btn btn-soft hist-more" onClick={()=>setLimit(limit+40)}>{t.h_more} · {list.length-limit}</button>}
      </React.Fragment>
      )}
    </div>
  );
}

function HxReports({ store, shop, t, lang, since, period, movements, sales, idx }){
  const DAY = 86400000, now = Date.now();
  const days = period==="all"? Math.max(1, Math.ceil((now - Math.min(now, ...movements.map(m=>m.at)))/DAY)) : Number(period);
  const prods = store.products(shop.id);
  const price = (p,v)=> v.price!=null? v.price : p.price;
  const nm = (p)=> textFB(p.name, lang);

  const stockCost = prods.reduce((n,p)=>n+p.variants.reduce((m,v)=>m+Math.max(0,v.qty)*(v.avgCost||0),0),0);
  const stockRetail = prods.reduce((n,p)=>n+p.variants.reduce((m,v)=>m+Math.max(0,v.qty)*(price(p,v)||0),0),0);
  const costUnknown = prods.some(p=>p.variants.some(v=>v.qty>0 && v.avgCost==null));

  const ps = sales.filter(s=>s.at>=since && s.status!=="returned");
  const per = {};
  const P = (id)=> per[id] || (per[id] = { sold:0, rev:0, cost:0, costKnown:true, lost:0, lostVal:0, inQty:0, inCost:0 });
  ps.forEach(s=> s.lines.forEach(l=>{ const x = idx[l.variantId]; if(!x) return; const q = l.qty - (l.returned||0); if(q<=0) return;
    const r = P(x.p.id); r.sold += q; r.rev += q*l.unit; if(l.cost!=null) r.cost += q*l.cost; else r.costKnown = false; }));
  movements.filter(m=>m.at>=since).forEach(m=>{ const x = idx[m.variantId]; if(!x) return; const r = P(x.p.id);
    if(m.reason==="loss"){ const q = Math.abs(m.delta||m.qty||0); r.lost += q; r.lostVal += q*(m.unitCost||0); }
    if(m.reason==="restock" && m.delta>0){ r.inQty += m.delta; if(m.unitCost!=null) r.inCost += m.delta*m.unitCost; } });
  const rev = Object.values(per).reduce((n,r)=>n+r.rev,0);
  const profit = Object.values(per).reduce((n,r)=>n+(r.rev-r.cost),0);
  const lostVal = Object.values(per).reduce((n,r)=>n+r.lostVal,0);

  const stockOf = (p)=> p.variants.reduce((n,v)=>n+Math.max(0,v.qty),0);
  const top = prods.filter(p=>per[p.id] && per[p.id].sold>0).sort((a,b)=>per[b.id].rev-per[a.id].rev).slice(0,5);
  const topMax = top.length? per[top[0].id].rev : 1;
  const runout = prods.map(p=>{ const s = per[p.id]? per[p.id].sold : 0, st = stockOf(p); const rate = s/days; return { p, st, rate, d: rate>0? Math.floor(st/rate) : Infinity }; })
    .filter(x=>x.rate>0 && x.d<=21).sort((a,b)=>a.d-b.d).slice(0,5);
  const dead = prods.map(p=>({ p, st:stockOf(p), val:p.variants.reduce((n,v)=>n+Math.max(0,v.qty)*(v.avgCost!=null? v.avgCost : (price(p,v)||0)),0) }))
    .filter(x=>x.st>0 && !(per[x.p.id] && per[x.p.id].sold)).sort((a,b)=>b.val-a.val).slice(0,5);
  const losses = prods.filter(p=>per[p.id] && per[p.id].lost).sort((a,b)=>per[b.id].lost-per[a.id].lost).slice(0,5);
  const spend = prods.filter(p=>per[p.id] && per[p.id].inQty).sort((a,b)=>per[b.id].inCost-per[a.id].inCost).slice(0,5);

  // flow chart: buckets (days for ≤30, weeks beyond)
  const nB = Math.min(days, 30), bSize = Math.ceil(days/nB);
  const buckets = Array.from({length:Math.ceil(days/bSize)}, (_,i)=>({ inn:0, out:0, at: now - (Math.ceil(days/bSize)-1-i)*bSize*DAY }));
  movements.forEach(m=>{ if(m.at<since && period!=="all") return; const i = buckets.length-1-Math.floor((now-m.at)/(bSize*DAY)); if(i<0||i>=buckets.length) return;
    if(m.delta>0) buckets[i].inn += m.delta; else buckets[i].out -= m.delta; });
  const bMax = Math.max(1, ...buckets.map(b=>Math.max(b.inn,b.out)));

  const Th = ({p})=> <span className="hx-th" style={{background:p.tone||"#ddd"}}><ImageSlot id={pslot(shop.id,p,0)} src={photoURL(p.tone, pslot(shop.id,p,0), 80,80, (window.IMG_KW||{})[shop.type], 0)} placeholder="" style={FILL}/></span>;
  const Empty = ()=> <div className="hx-empty">{t.hx_nodata}</div>;

  return (
    <div className="hx-rep">
      <div className="hx-cards">
        <div className="hx-card"><span>{t.hx_stock_val}</span><b>{fmtNum(stockCost)}</b>{costUnknown && <small>⚠ {t.hx_cost_unknown}</small>}</div>
        <div className="hx-card"><span>{t.hx_retail_val}</span><b>{fmtNum(stockRetail)}</b></div>
        <div className="hx-card"><span>{t.hx_revenue}</span><b>{fmtNum(rev)}</b><small>{t.hx_profit}: <em className={profit>=0?"up":"down"}>{fmtNum(profit)}</em></small></div>
        <div className="hx-card"><span>{t.hx_lost}</span><b className={lostVal? "down":""}>{fmtNum(lostVal)}</b></div>
      </div>

      <div className="hx-panel">
        <div className="hx-ph"><b>{t.hx_flow}</b><span className="hx-leg"><i className="in"></i>{t.h_in}<i className="out"></i>{t.h_out}</span></div>
        <div className="hx-chart">
          {buckets.map((b,i)=>(
            <div key={i} className="hx-col" title={fmtDate(b.at,lang)+": +"+b.inn+" / −"+b.out}>
              <i className="in" style={{height:(b.inn/bMax*100)+"%"}}></i>
              <i className="out" style={{height:(b.out/bMax*100)+"%"}}></i>
            </div>
          ))}
        </div>
        <div className="hx-axis"><span>{hxDate(buckets[0].at)}</span><span>{hxDate(now)}</span></div>
      </div>

      <div className="hx-grid">
        <div className="hx-panel">
          <div className="hx-ph"><b>{t.hx_top}</b></div>
          {!top.length? <Empty/> : top.map((p,i)=>{ const r = per[p.id], st = stockOf(p);
            return (
              <div key={p.id} className="hx-li">
                <span className="hx-rank">{i+1}</span><Th p={p}/>
                <div className="hx-lt"><b>{nm(p)}</b><span className="hx-bar-in"><i style={{width:(r.rev/topMax*100)+"%"}}></i></span><small>{r.sold} {t.hx_units} · {Math.round(r.sold/(r.sold+st)*100)}% {t.hx_sellthru}</small></div>
                <b className="hx-num">{fmtNum(r.rev)}</b>
              </div>
            ); })}
        </div>

        <div className="hx-panel">
          <div className="hx-ph"><b>{t.hx_runout}</b><small>{t.hx_runout_d}</small></div>
          {!runout.length? <Empty/> : runout.map(x=>(
            <div key={x.p.id} className="hx-li">
              <Th p={x.p}/>
              <div className="hx-lt"><b>{nm(x.p)}</b><small>{x.st} {t.hx_units} · ~{(x.rate*7).toFixed(1)}/{lang==="ru"?"нед":lang==="uz"?"hafta":"wk"}</small></div>
              <span className={"hx-pill "+(x.d<=7?"bad":"warn")}>{fill(t.hx_days,{n:x.d})}</span>
            </div>
          ))}
        </div>

        <div className="hx-panel">
          <div className="hx-ph"><b>{t.hx_dead}</b><small>{t.hx_dead_d}</small></div>
          {!dead.length? <Empty/> : dead.map(x=>(
            <div key={x.p.id} className="hx-li">
              <Th p={x.p}/>
              <div className="hx-lt"><b>{nm(x.p)}</b><small>{x.st} {t.hx_units}</small></div>
              <span className="hx-num-s"><b>{fmtNum(x.val)}</b><small>{t.hx_tied}</small></span>
            </div>
          ))}
        </div>

        <div className="hx-panel">
          <div className="hx-ph"><b>{t.hx_losses}</b></div>
          {!losses.length? <Empty/> : losses.map(p=>{ const r = per[p.id]; return (
            <div key={p.id} className="hx-li">
              <Th p={p}/>
              <div className="hx-lt"><b>{nm(p)}</b><small>{r.lost} {t.hx_units}</small></div>
              <b className="hx-num down">−{fmtNum(r.lostVal)}</b>
            </div>
          ); })}
        </div>

        <div className="hx-panel hx-wide">
          <div className="hx-ph"><b>{t.hx_spend}</b></div>
          {!spend.length? <Empty/> : spend.map(p=>{ const r = per[p.id]; return (
            <div key={p.id} className="hx-li">
              <Th p={p}/>
              <div className="hx-lt"><b>{nm(p)}</b><small>+{r.inQty} {t.hx_units}{r.inCost? " · "+t.hx_avgcost+" "+fmtNum(Math.round(r.inCost/r.inQty)) : ""}</small></div>
              <b className="hx-num">{r.inCost? fmtNum(r.inCost) : "—"}</b>
            </div>
          ); })}
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { StockHistory, HxReports });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { hxDate, hxISO, DR_WD, DR_MON, DR_CSS, hxPresets, HxRange, HX_COLS, HX_PILL, HX_R, hxR, StockHistory, HxReports });
