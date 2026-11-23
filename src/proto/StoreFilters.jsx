// ===== Storefront filters: toolbar, category drill-down, filter sheet, active pills =====
Object.assign(I18N.en, { sff_filters:"Filters", sff_sort:"Sort", sff_clear:"Clear all", sff_show:"Show {n} items", sff_price:"Price", sff_from:"From", sff_to:"To", sff_avail:"Availability", sff_instock:"In stock only", sff_items:"items", sff_item:"item", sff_show1:"Show 1 item", sff_all_products:"All products", sff_back:"Back" });
Object.assign(I18N.ru, { sff_filters:"Фильтры", sff_sort:"Сортировка", sff_clear:"Сбросить всё", sff_show:"Показать {n}", sff_price:"Цена", sff_from:"От", sff_to:"До", sff_avail:"Наличие", sff_instock:"Только в наличии", sff_items:"товаров", sff_all_products:"Все товары", sff_back:"Назад" });
Object.assign(I18N.uz, { sff_filters:"Filtrlar", sff_sort:"Saralash", sff_clear:"Hammasini tozalash", sff_show:"{n} ta ko\u02bbrsatish", sff_price:"Narx", sff_from:"Dan", sff_to:"Gacha", sff_avail:"Mavjudlik", sff_instock:"Faqat sotuvdagilar", sff_items:"mahsulot", sff_all_products:"Barcha mahsulotlar", sff_back:"Orqaga" });

const SFF_I = {
  sliders: (p)=> <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="16" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.8"/><circle cx="10" cy="17" r="2.2" stroke="currentColor" strokeWidth="1.8"/></svg>,
  back: (p)=> <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M14.5 6 8.5 12l6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

function SfCatBar({ nav, cat, setCat, t, lang }){
  const e = cat==="all"? null : catEntry(cat);
  const backTo = !e? null : (e.leaf? ((catEntry(e.parent)||{}).parent || "all") : (e.parent || "all"));
  const scope = !e? null : (e.leaf? e.parent : cat);
  return (
    <div className="sf-cats sff-cats">
      {e && (
        <button className="sf-chip sff-back" onClick={()=>setCat(backTo)} aria-label={t.sff_back}>
          {SFF_I.back({width:16,height:16})}
        </button>
      )}
      {scope && <button className={"sf-chip"+(cat===scope?" on":"")} onClick={()=>setCat(scope)}>{t.sf_all} {catLabel(scope,lang)} <i className="sf-chip-n">{nav.count(scope)}</i></button>}
      {nav.level.map(c=>{ const ce = catEntry(c.id);
        return (
          <button key={c.id} className={"sf-chip"+(cat===c.id?" on":"")} onClick={()=>setCat(c.id)}>
            {c.name} <i className="sf-chip-n">{c.n}</i>{ce && !ce.leaf && <span className="sf-chip-more">›</span>}
          </button>
        ); })}
    </div>
  );
}

function SfFilterSheet({ t, lang, filters, sel, setSel, price, setPrice, hideSold, setHideSold, sort, setSort, count, onClear, onClose, embedded }){
  React.useEffect(()=>{ const k=(e)=>{ if(e.key==="Escape") onClose(); }; addEventListener("keydown",k); return ()=>removeEventListener("keydown",k); }, []);
  const toggle = (aid, v)=> setSel(s=>{ const cur = s[aid]||[]; const nx = cur.includes(v)? cur.filter(x=>x!==v) : [...cur, v]; return { ...s, [aid]: nx }; });
  const num = (s)=> s.replace(/\D/g,"");
  const sorts = [["new",t.sf_sort_new],["low",t.sf_sort_low],["high",t.sf_sort_high]];
  return (
    <div className={"sff-scrim"+(embedded?" in-frame":"")} onClick={onClose}>
      <div className="sff-sheet" onClick={e=>e.stopPropagation()}>
        <div className="sff-head">
          <b className="sf-display">{t.sff_filters}</b>
          <button className="sff-x" onClick={onClose} aria-label="Close">{I.x({width:18,height:18})}</button>
        </div>
        <div className="sff-body">
          <div className="sff-sec">
            <div className="sff-lab">{t.sff_sort}</div>
            <div className="sff-seg">
              {sorts.map(([k,l])=><button key={k} className={sort===k?"on":""} onClick={()=>setSort(k)}>{l}</button>)}
            </div>
          </div>
          {filters.map(({attr,values})=>(
            <div key={attr.id} className="sff-sec">
              <div className="sff-lab">{attr.name[lang]}{(sel[attr.id]||[]).length>0 && <i> · {(sel[attr.id]||[]).length}</i>}</div>
              <div className={"sff-vals"+(attr.swatch?" sw":"")}>
                {values.map(v=>{ const on = (sel[attr.id]||[]).includes(v);
                  return attr.swatch ? (
                    <button key={v} className={"sff-sw"+(on?" on":"")} onClick={()=>toggle(attr.id,v)}>
                      <i style={{background:attrValueHex(attr.id,v)||"#ccc"}}></i><span>{attrValueName(attr.id,v,lang)}</span>
                    </button>
                  ) : (
                    <button key={v} className={"sff-val"+(on?" on":"")} onClick={()=>toggle(attr.id,v)}>{attrValueName(attr.id,v,lang)}</button>
                  ); })}
              </div>
            </div>
          ))}
          <div className="sff-sec">
            <div className="sff-lab">{t.sff_price}</div>
            <div className="sff-price">
              <label><span>{t.sff_from}</span><input inputMode="numeric" value={price.min} placeholder="0" onChange={e=>setPrice(p=>({...p, min:num(e.target.value)}))}/></label>
              <i>—</i>
              <label><span>{t.sff_to}</span><input inputMode="numeric" value={price.max} placeholder="∞" onChange={e=>setPrice(p=>({...p, max:num(e.target.value)}))}/></label>
            </div>
          </div>
          <div className="sff-sec">
            <div className="sff-lab">{t.sff_avail}</div>
            <label className="sff-switch">
              <span>{t.sff_instock}</span>
              <input type="checkbox" checked={hideSold} onChange={e=>setHideSold(e.target.checked)}/>
              <i></i>
            </label>
          </div>
        </div>
        <div className="sff-foot">
          <button className="sf-btn sf-btn-line" onClick={onClear}>{t.sff_clear}</button>
          <button className="sf-btn sf-btn-accent" onClick={onClose}>{count===1 && t.sff_show1? t.sff_show1 : fill(t.sff_show,{n:count})}</button>
        </div>
      </div>
    </div>
  );
}

function SfResultBar({ t, lang, cat, count, pills, onClear }){
  const title = cat==="all"? t.sff_all_products : catBreadcrumb(cat, lang, " › ");
  return (
    <div className="sff-res">
      <div className="sff-res-t"><b>{title}</b><span>{count} {count===1 && t.sff_item? t.sff_item : t.sff_items}</span></div>
      {pills.length>0 && (
        <div className="sff-pills">
          {pills.map(p=><button key={p.k} className="sff-pill" onClick={p.off}>{p.sw && <i style={{background:p.sw}}></i>}{p.lab}{I.x({width:12,height:12})}</button>)}
          <button className="sff-clear" onClick={onClear}>{t.sff_clear}</button>
        </div>
      )}
    </div>
  );
}

// ===== Filters v2 — quick chips on screen, counts on every option, category-aware facets,
// price presets, rating, popular sort, look-alike seller values merged, filters kept in the link =====
addI18N({
  sfx_sort_new: ["Newest", "Новинки", "Yangilari"],
  sfx_sort_pop: ["Popular", "Популярные", "Ommabop"],
  sfx_sort_rate:["Highest rated", "Высокий рейтинг", "Yuqori baholangan"],
  sfx_sort_low: ["Cheapest first", "Сначала дешёвые", "Avval arzonlari"],
  sfx_sort_high:["Most expensive first", "Сначала дорогие", "Avval qimmatlari"],
  sfx_sort:     ["Sort", "Сортировка", "Saralash"],
  sfx_price:    ["Price", "Цена", "Narx"],
  sfx_from:     ["From", "От", "Dan"],
  sfx_to:       ["To", "До", "Gacha"],
  sfx_rating:   ["Rating", "Рейтинг", "Reyting"],
  sfx_r_any:    ["Any", "Любой", "Istalgan"],
  sfx_r4:       ["4★ and up", "4★ и выше", "4★ va yuqori"],
  sfx_r3:       ["3★ and up", "3★ и выше", "3★ va yuqori"],
  sfx_all:      ["All filters", "Все фильтры", "Barcha filtrlar"],
  sfx_upto:     ["Up to {a}", "До {a}", "{a} gacha"],
  sfx_over:     ["{a} and up", "От {a}", "{a} dan yuqori"],
  sfx_own:      ["Your own range", "Свой диапазон", "O‘z oralig‘ingiz"],
  sfx_show:     ["Show {n}", "Показать {n}", "{n} ta ko‘rsatish"],
  sfx_reset:    ["Reset", "Сбросить", "Tozalash"],
  sfx_reset_all:["Reset all", "Сбросить всё", "Hammasini tozalash"],
  sfx_more:     ["Show all ({n})", "Показать все ({n})", "Hammasi ({n})"],
  sfx_less:     ["Show less", "Свернуть", "Kamroq"],
  sfx_mysize:   ["My size: {v}", "Мой размер: {v}", "Mening o‘lchamim: {v}"],
  sfx_mysize_ok:["Saved as your size — it will be one tap next time", "Сохранено как ваш размер", "O‘lchamingiz sifatida saqlandi"],
  sfx_yes:      ["Yes", "Да", "Ha"],
  sfx_instock:  ["In stock", "В наличии", "Sotuvda bor"],
  sfx_none:     ["Nothing matches these filters", "Ничего не найдено по этим фильтрам", "Bu filtrlar bo‘yicha hech narsa yo‘q"],
});

const SFX_EMPTY = { sel:{}, pmin:"", pmax:"", rate:0, stock:false, sort:"new" };
const sfxKey = (s)=> String(s).trim().toLowerCase().replace(/[ʻʼ‘’'`]/g,"");
// seller-typed colours in any language land on the same swatch ("Qora", "black", "чёрный" → Black)
const SFX_COLOR_SYN = (()=>{ const m = {};
  try{ (typeof COLORS!=="undefined"? COLORS : []).forEach(c=>{ [c.id, c.name.en, c.name.ru, c.name.uz].forEach(n=>{ if(n) m[sfxKey(n)] = c.id; }); }); }catch(e){}
  Object.assign(m, { "черный":"black", "чёрная":"black", "черная":"black", "белая":"white", "голубой":"blue", "zangori":"blue", "красная":"red", "зеленый":"green",
    "розовая":"pink", "gray":"grey", "серая":"grey", "бежевый":"sand", "beige":"sand", "bej":"sand", "бежевая":"sand", "коричневая":"brown", "тёмно-синий":"navy", "темно-синий":"navy" });
  return m; })();
function sfxNorm(attr, v){
  if(v==null || v==="" || v===false) return null;
  if(v===true) return "1";
  v = String(v);
  if(!v.startsWith("c:")) return v;
  const s = sfxKey(v.slice(2));
  if(attr && attr.swatch && SFX_COLOR_SYN[s]) return SFX_COLOR_SYN[s];
  return "c:"+s;
}
// every value a product offers for one attribute (its variants + its details), normalised
function sfxVals(p, aid){
  const out = [];
  const add = (x)=>{ if(x && !out.includes(x)) out.push(x); };
  const va = variantAttrs(p.catId).find(a=>a.id===aid);
  if(va) (p.variants||[]).forEach(v=> add(sfxNorm(va, (v.options||{})[aid])));
  const sa = specAttrs(p.catId).find(a=>a.id===aid);
  if(sa){ const raw = (p.specs||{})[aid]; (Array.isArray(raw)? raw : [raw]).forEach(r=> add(sfxNorm(sa, r))); }
  return out;
}
// which filters exist for this list — driven by the categories in it, most common first
function sfxFacets(products){
  const map = {};
  products.forEach(p=>{
    variantAttrs(p.catId).concat(specAttrs(p.catId)).forEach(a=>{
      if(a.id==="option" || a.kind==="number" || a.kind==="text") return;
      const vals = sfxVals(p, a.id); if(!vals.length) return;
      const f = map[a.id] || (map[a.id] = { attr:a, cover:0, vals:{} });
      f.cover++; vals.forEach(x=>{ f.vals[x] = 1; });
    });
  });
  return Object.keys(map).map(k=>{
    const f = map[k], order = (f.attr.values||[]).map(v=>v.id);
    const values = Object.keys(f.vals).sort((x,y)=>{ const i = order.indexOf(x), j = order.indexOf(y);
      if(i>=0 && j>=0) return i-j; if(i>=0) return -1; if(j>=0) return 1; return x.localeCompare(y, undefined, { numeric:true }); });
    return { attr:f.attr, cover:f.cover, values };
  }).filter(f=> f.values.length>1 || (f.attr.kind==="bool" && f.cover<products.length))
    .sort((a,b)=> (b.cover-a.cover) || ((b.attr.swatch?1:0)-(a.attr.swatch?1:0)));
}
function sfxLabel(attr, id, lang, t){
  if(attr && attr.kind==="bool") return t.sfx_yes;
  const n = String(attrValueName(attr.id, id, lang));
  if(String(id).startsWith("c:")) return /^[a-z0-9]{1,4}$/.test(n)? n.toUpperCase() : n.charAt(0).toUpperCase()+n.slice(1);
  return n;
}
function sfxPrice(p){ const xs = (p.variants||[]).map(v=> (v && v.price!=null)? v.price : p.price); return xs.length? [Math.min.apply(null,xs), Math.max.apply(null,xs)] : [p.price, p.price]; }
function sfxMatch(p, F, ctx, skip){
  for(const aid in F.sel){ if(aid===skip) continue; const want = F.sel[aid]||[]; if(!want.length) continue;
    const have = sfxVals(p, aid); if(!want.some(w=>have.includes(w))) return false; }
  if(skip!=="price"){ const r = sfxPrice(p); if(F.pmin && r[1] < Number(F.pmin)) return false; if(F.pmax && r[0] > Number(F.pmax)) return false; }
  if(skip!=="rate" && F.rate){ const r = ctx.rating(p); if(!r || r.avg < F.rate) return false; }
  if(skip!=="stock" && F.stock && ctx.sold(p)) return false;
  return true;
}
function sfxSort(list, sort, ctx){
  const out = list.slice();
  // rating sort weighs how many reviews there are, not only the average
  const bay = (p)=>{ const r = ctx.rating(p); return r? (r.avg*r.n + 4*3)/(r.n+3) : 0; };
  if(sort==="low") out.sort((a,b)=>sfxPrice(a)[0]-sfxPrice(b)[0]);
  else if(sort==="high") out.sort((a,b)=>sfxPrice(b)[0]-sfxPrice(a)[0]);
  else if(sort==="rate") out.sort((a,b)=>bay(b)-bay(a));
  else if(sort==="pop") out.sort((a,b)=>(ctx.pop(b)-ctx.pop(a)) || (((ctx.rating(b)||{}).n||0)-((ctx.rating(a)||{}).n||0)));
  else out.sort((a,b)=>(b.created||0)-(a.created||0));
  return out;
}
const sfxNice = (x)=>{ if(x<=0) return 0; const m = Math.pow(10, Math.max(0, Math.floor(Math.log10(x))-1)); return Math.round(x/m)*m; };
// three ready price ranges built from the real prices in the list
function sfxPresets(products){
  const ps = products.map(p=>sfxPrice(p)[0]).sort((a,b)=>a-b);
  if(ps.length<4) return [];
  const a = sfxNice(ps[Math.floor(ps.length/3)]), b = sfxNice(ps[Math.floor(ps.length*2/3)]);
  if(!a || !b || a>=b) return [];
  return [["", String(a)], [String(a), String(b)], [String(b), ""]];
}
function sfxPriceLabel(a, b, t){
  if(a && b) return fmtNum(Number(a))+" – "+fmtNum(Number(b));
  if(b) return fill(t.sfx_upto,{a:fmtNum(Number(b))});
  return fill(t.sfx_over,{a:fmtNum(Number(a))});
}
const sfxToggle = (F, aid, v)=>{ const cur = F.sel[aid]||[]; return { ...F, sel:{ ...F.sel, [aid]: cur.includes(v)? cur.filter(x=>x!==v) : [...cur, v] } }; };
const sfxActive = (F)=> Object.keys(F.sel).reduce((n,k)=>n+(F.sel[k]||[]).length,0) + ((F.pmin||F.pmax)?1:0) + (F.rate?1:0) + (F.stock?1:0);
function sfxPills(F, setF, facets, lang, t){
  const out = [];
  Object.keys(F.sel).forEach(aid=>{ const f = (facets||[]).find(x=>x.attr.id===aid); const a = f? f.attr : { id:aid, name:{} };
    (F.sel[aid]||[]).forEach(v=> out.push({ k:aid+":"+v, lab: a.kind==="bool"? a.name[lang] : sfxLabel(a,v,lang,t), sw: a.swatch? (attrValueHex(aid,v)||"#ccc") : null,
      off:()=>setF(f0=>({ ...f0, sel:{ ...f0.sel, [aid]:(f0.sel[aid]||[]).filter(x=>x!==v) } })) })); });
  if(F.pmin || F.pmax) out.push({ k:"price", lab:sfxPriceLabel(F.pmin,F.pmax,t), off:()=>setF(f0=>({ ...f0, pmin:"", pmax:"" })) });
  if(F.rate) out.push({ k:"rate", lab:"★ "+(F.rate>=4? t.sfx_r4 : t.sfx_r3), off:()=>setF(f0=>({ ...f0, rate:0 })) });
  if(F.stock) out.push({ k:"stock", lab:t.sfx_instock, off:()=>setF(f0=>({ ...f0, stock:false })) });
  return out;
}
// the link keeps the filters, so a link shared in Telegram opens the same list
const SFX_URL_KEYS = ["pmin","pmax","rate","instock","sort","cat"];
function sfxRead(){
  try{ const q = new URLSearchParams(location.search);
    const F = { sel:{}, pmin:q.get("pmin")||"", pmax:q.get("pmax")||"", rate:Number(q.get("rate"))||0, stock:q.get("instock")==="1", sort:q.get("sort")||"new" };
    q.forEach((v,k)=>{ if(k.indexOf("f_")===0) F.sel[k.slice(2)] = v.split(",").filter(Boolean); });
    return { F, cat:q.get("cat")||null };
  }catch(e){ return null; }
}
function sfxWrite(F, cat){
  try{ const q = new URLSearchParams(location.search);
    Array.from(q.keys()).forEach(k=>{ if(k.indexOf("f_")===0 || SFX_URL_KEYS.includes(k)) q.delete(k); });
    if(cat && cat!=="all") q.set("cat", cat);
    Object.keys(F.sel).forEach(a=>{ if((F.sel[a]||[]).length) q.set("f_"+a, F.sel[a].join(",")); });
    if(F.pmin) q.set("pmin", F.pmin); if(F.pmax) q.set("pmax", F.pmax);
    if(F.rate) q.set("rate", String(F.rate)); if(F.stock) q.set("instock","1");
    if(F.sort && F.sort!=="new") q.set("sort", F.sort);
    const s = q.toString();
    history.replaceState(history.state, "", location.pathname+(s? "?"+s : "")+location.hash);
  }catch(e){}
}
const sfxHost = (el)=> (el && el.closest && el.closest(".storefront")) || document.body;

const SFX_CSS = `
.sfx-row{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding:2px 0}
.sfx-row::-webkit-scrollbar{display:none}
.sfx-chip{flex:none;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 13px;border-radius:999px;border:1.5px solid var(--s-line,var(--line,#e5e0d8));background:var(--s-surface,#fff);color:var(--s-ink,var(--ink,#1d1b16));font-weight:600;font-size:13.5px;font-family:inherit;cursor:pointer;white-space:nowrap}
.sfx-chip:hover{border-color:var(--s-ink,var(--ink,#1d1b16))}
.sfx-chip.on{background:var(--s-ink,var(--ink,#1d1b16));color:var(--s-bg,#fff);border-color:transparent}
.sfx-chip .cv{font-size:10px;opacity:.7}
.sfx-chip b{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--s-accent,var(--primary,#c2532f));color:var(--s-accent-ink,#fff);font-size:11px}
.sfx-chip.all{border-style:dashed}
.sfx-scrim{position:fixed;inset:0;z-index:80;background:transparent}
.sfx-scrim.dim{background:rgba(20,15,10,.38)}
.sfx-pop{position:fixed;z-index:81;width:320px;max-height:min(70vh,470px);display:flex;flex-direction:column;background:var(--s-surface,#fff);color:var(--s-ink,var(--ink,#1d1b16));border:1px solid var(--s-line,var(--line,#e5e0d8));border-radius:16px;box-shadow:0 22px 50px rgba(30,20,10,.22);overflow:hidden}
.sfx-pop-b{padding:10px;overflow-y:auto;flex:1}
.sfx-pop-f{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--s-line,var(--line,#eee))}
.sfx-pop-f button{flex:1}
.sfx-opt{display:flex;align-items:center;gap:10px;width:100%;padding:9px 10px;border-radius:10px;text-align:left;font-size:14px;background:none;border:0;color:inherit;font-family:inherit;cursor:pointer}
.sfx-opt:hover:not(:disabled){background:var(--s-accent-soft,var(--paper,#f4efe7))}
.sfx-opt:disabled{opacity:.35;cursor:default}
.sfx-opt .box{width:18px;height:18px;border-radius:5px;border:1.5px solid currentColor;display:grid;place-items:center;flex:none;opacity:.7}
.sfx-opt.radio .box{border-radius:50%}
.sfx-opt.on .box{background:var(--s-accent,var(--primary,#c2532f));border-color:transparent;color:var(--s-accent-ink,#fff);opacity:1}
.sfx-opt .sw,.sfx-val .sw{width:18px;height:18px;border-radius:50%;border:1px solid rgba(0,0,0,.15);flex:none;font-style:normal}
.sfx-opt .lb{flex:1}
.sfx-opt i,.sfx-val i{font-style:normal;opacity:.55;font-size:12.5px}
.sfx-pre{display:flex;flex-direction:column;margin-bottom:6px}
.sfx-range{display:flex;align-items:center;gap:8px}
.sfx-range input{width:100%;min-width:0;height:40px;border-radius:10px;border:1.5px solid var(--s-line,var(--line,#e5e0d8));padding:0 10px;font-size:14px;background:transparent;color:inherit;font-family:inherit}
.sfx-btn{height:42px;border-radius:12px;font-weight:700;font-size:14px;font-family:inherit;cursor:pointer;border:1.5px solid var(--s-line,var(--line,#e5e0d8));background:transparent;color:inherit}
.sfx-btn.pri{background:var(--s-accent,var(--primary,#c2532f));color:var(--s-accent-ink,#fff);border-color:transparent}
.sfx-sheet{position:fixed;z-index:81;top:0;right:0;bottom:0;width:min(420px,100vw);display:flex;flex-direction:column;background:var(--s-surface,#fff);color:var(--s-ink,var(--ink,#1d1b16));box-shadow:-20px 0 50px rgba(30,20,10,.2)}
.sfx-sheet-h{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--s-line,var(--line,#eee));font-size:18px}
.sfx-x{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:none;border:0;color:inherit;cursor:pointer}
.sfx-sheet-b{flex:1;overflow-y:auto;padding:4px 12px}
.sfx-sec{padding:14px 0;border-bottom:1px solid var(--s-line,var(--line,#eee))}
.sfx-sec:last-child{border-bottom:0}
.sfx-sec-t{display:flex;align-items:center;justify-content:space-between;font-weight:700;font-size:14px;margin:0 0 10px}
.sfx-grid{display:flex;flex-wrap:wrap;gap:6px}
.sfx-val{height:36px;padding:0 12px;border-radius:999px;border:1.5px solid var(--s-line,var(--line,#e5e0d8));background:transparent;color:inherit;font-size:13.5px;font-weight:600;font-family:inherit;display:inline-flex;align-items:center;gap:6px;cursor:pointer}
.sfx-val.on{background:var(--s-ink,var(--ink,#1d1b16));color:var(--s-bg,#fff);border-color:transparent}
.sfx-val:disabled{opacity:.35;cursor:default}
.sfx-lnk{background:none;border:0;padding:0;color:var(--s-accent,var(--primary,#c2532f));font-weight:700;font-size:13px;font-family:inherit;cursor:pointer}
.sfx-pills{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 14px}
@media (max-width:640px){
  .sfx-scrim{background:rgba(20,15,10,.38)}
  .sfx-pop{left:0!important;right:0;bottom:0;top:auto!important;width:auto;max-height:75vh;border-radius:18px 18px 0 0}
  .sfx-sheet{top:auto;height:90vh;width:100vw;border-radius:18px 18px 0 0}
}
`;

function SfxOpt({ on, radio, disabled, sw, label, n, onClick }){
  return (
    <button type="button" className={"sfx-opt"+(radio?" radio":"")+(on?" on":"")} disabled={disabled} onClick={onClick} aria-pressed={on}>
      <u className="box" style={{textDecoration:"none"}}>{on && !radio? I.check({width:12,height:12}) : null}</u>
      {sw && <em className="sw" style={{background:sw}}></em>}
      <span className="lb">{label}</span>{n!=null && <i>{n}</i>}
    </button>
  );
}

// the chip row under the categories (Sort · Size · Colour · Price · 4★ · In stock · All filters) + its popovers + the full sheet
function SfxBar({ t, lang, pool, facets, F, setF, ctx, total, promote, mySize, onPickSize }){
  const [pop, setPop] = React.useState(null);
  const [sheet, setSheet] = React.useState(null);
  const [more, setMore] = React.useState({});
  React.useEffect(()=>{ if(!pop) return; const c = ()=>setPop(null); addEventListener("resize", c); return ()=>removeEventListener("resize", c); }, [pop]);
  React.useEffect(()=>{ if(!pop && !sheet) return; const k = (e)=>{ if(e.key==="Escape"){ setPop(null); setSheet(null); } }; addEventListener("keydown", k); return ()=>removeEventListener("keydown", k); }, [pop, sheet]);
  const presets = React.useMemo(()=>sfxPresets(pool), [pool]);
  const fs = facets || [];
  const cnt = (aid, v)=> pool.filter(p=>sfxMatch(p,F,ctx,aid) && sfxVals(p,aid).includes(v)).length;
  const priceCnt = (a, b)=> pool.filter(p=>{ if(!sfxMatch(p,F,ctx,"price")) return false; const r = sfxPrice(p); return (!a || r[1]>=Number(a)) && (!b || r[0]<=Number(b)); }).length;
  const rateCnt = (r)=> pool.filter(p=>sfxMatch(p,F,ctx,"rate") && ((ctx.rating(p)||{}).avg||0)>=r).length;
  const stockCnt = pool.filter(p=>sfxMatch(p,F,ctx,"stock") && !ctx.sold(p)).length;
  const sorts = [["new",t.sfx_sort_new],["pop",t.sfx_sort_pop],["rate",t.sfx_sort_rate],["low",t.sfx_sort_low],["high",t.sfx_sort_high]]
    .filter(s=> s[0]!=="rate" || (typeof reviewsOn!=="function" || reviewsOn()));
  const hasRatings = pool.some(p=>ctx.rating(p));
  const pick = (aid, v)=>{ const on = !(F.sel[aid]||[]).includes(v); setF(sfxToggle(F, aid, v)); if(on && onPickSize && /size/.test(aid)) onPickSize(aid, v); };
  const openPop = (k, e)=>{ const el = e.currentTarget, r = el.getBoundingClientRect();
    setPop(p=> p && p.k===k? null : { k, top:r.bottom+6, left:Math.max(8, Math.min(r.left, innerWidth-336)), host:sfxHost(el) }); };
  const openSheet = (e)=>{ setPop(null); setSheet({ host:sfxHost(e.currentTarget) }); };
  // phones get fewer promoted chips so the row stays short (Baymard: only 2–3 fit on one line)
  const top = fs.slice(0, promote || (innerWidth<640? 2 : 3));
  const nAct = sfxActive(F);
  const priceOn = !!(F.pmin || F.pmax);
  const sortLab = (sorts.find(s=>s[0]===F.sort)||sorts[0])[1];
  const ms = mySize && fs.find(f=>f.attr.id===mySize.aid && f.values.includes(mySize.v));
  const msOn = ms && (F.sel[mySize.aid]||[]).includes(mySize.v);
  const caret = <span className="cv">▾</span>;
  const resetKey = (k)=>{ if(k==="price") setF({ ...F, pmin:"", pmax:"" }); else if(k!=="sort") setF({ ...F, sel:{ ...F.sel, [k]:[] } }); };
  const priceBox = (
    <div>
      {presets.length>0 && <div className="sfx-pre">{presets.map(([a,b])=>{ const on = F.pmin===a && F.pmax===b; const n = priceCnt(a,b);
        return <SfxOpt key={a+"-"+b} radio on={on} disabled={!on && !n} label={sfxPriceLabel(a,b,t)} n={n} onClick={()=>setF(on? { ...F, pmin:"", pmax:"" } : { ...F, pmin:a, pmax:b })}/>; })}</div>}
      <div className="sfx-sec-t" style={{margin:"6px 2px 8px", fontSize:13}}>{t.sfx_own}</div>
      <div className="sfx-range">
        <input inputMode="numeric" placeholder={t.sfx_from} value={F.pmin} onChange={e=>setF({ ...F, pmin:e.target.value.replace(/\D/g,"") })} aria-label={t.sfx_from}/>
        <span>—</span>
        <input inputMode="numeric" placeholder={t.sfx_to} value={F.pmax} onChange={e=>setF({ ...F, pmax:e.target.value.replace(/\D/g,"") })} aria-label={t.sfx_to}/>
      </div>
    </div>
  );
  const optList = (f)=> f.values.map(v=>{ const on = (F.sel[f.attr.id]||[]).includes(v); const n = cnt(f.attr.id, v);
    return <SfxOpt key={v} on={on} disabled={!on && !n} sw={f.attr.swatch? (attrValueHex(f.attr.id,v)||"#ccc") : null} label={sfxLabel(f.attr,v,lang,t)} n={n} onClick={()=>pick(f.attr.id, v)}/>; });
  const popBody = (k)=>{
    if(k==="sort") return sorts.map(([id,l])=><SfxOpt key={id} radio on={F.sort===id} label={l} onClick={()=>{ setF({ ...F, sort:id }); setPop(null); }}/>);
    if(k==="price") return priceBox;
    const f = fs.find(x=>x.attr.id===k); return f? optList(f) : null;
  };
  return (
    <>
      <style>{SFX_CSS}</style>
      <div className="sfx-row" role="toolbar" aria-label={t.sfx_all}>
        <button type="button" className={"sfx-chip"+(F.sort!=="new"?" on":"")} onClick={e=>openPop("sort",e)} aria-haspopup="true">⇅ {sortLab} {caret}</button>
        {ms && <button type="button" className={"sfx-chip"+(msOn?" on":"")} onClick={()=>setF(sfxToggle(F, mySize.aid, mySize.v))}>{fill(t.sfx_mysize,{v:sfxLabel(ms.attr, mySize.v, lang, t)})}</button>}
        {top.map(f=>{ const n = (F.sel[f.attr.id]||[]).length; return (
          <button key={f.attr.id} type="button" className={"sfx-chip"+(n?" on":"")} onClick={e=>openPop(f.attr.id,e)} aria-haspopup="true">
            {f.attr.name[lang]}{n===1? ": "+(f.attr.kind==="bool"? t.sfx_yes : sfxLabel(f.attr, F.sel[f.attr.id][0], lang, t)) : n>1? " · "+n : ""} {caret}</button>); })}
        <button type="button" className={"sfx-chip"+(priceOn?" on":"")} onClick={e=>openPop("price",e)} aria-haspopup="true">{priceOn? sfxPriceLabel(F.pmin,F.pmax,t) : t.sfx_price} {caret}</button>
        {hasRatings && <button type="button" className={"sfx-chip"+(F.rate>=4?" on":"")} aria-pressed={F.rate>=4} onClick={()=>setF({ ...F, rate: F.rate>=4? 0 : 4 })}>★ {t.sfx_r4}</button>}
        <button type="button" className="sfx-chip all" onClick={openSheet}>{SFF_I.sliders({width:16,height:16})} {t.sfx_all}{nAct>0 && <b>{nAct}</b>}</button>
      </div>
      {pop && ReactDOM.createPortal(
        <>
          <div className="sfx-scrim" onClick={()=>setPop(null)}></div>
          <div className="sfx-pop" style={{ top:pop.top, left:pop.left }} role="dialog">
            <div className="sfx-pop-b">{popBody(pop.k)}</div>
            {pop.k!=="sort" && <div className="sfx-pop-f">
              <button type="button" className="sfx-btn" onClick={()=>resetKey(pop.k)}>{t.sfx_reset}</button>
              <button type="button" className="sfx-btn pri" onClick={()=>setPop(null)}>{fill(t.sfx_show,{n:total})}</button>
            </div>}
          </div>
        </>, pop.host)}
      {sheet && ReactDOM.createPortal(
        <>
          <div className="sfx-scrim dim" onClick={()=>setSheet(null)}></div>
          <div className="sfx-sheet" role="dialog" aria-label={t.sfx_all}>
            <div className="sfx-sheet-h"><b>{t.sfx_all}</b><button type="button" className="sfx-x" onClick={()=>setSheet(null)} aria-label={t.g_close}>{I.x({width:18,height:18})}</button></div>
            <div className="sfx-sheet-b">
              <div className="sfx-sec"><div className="sfx-sec-t">{t.sfx_sort}</div><div className="sfx-grid">
                {sorts.map(([id,l])=><button key={id} type="button" className={"sfx-val"+(F.sort===id?" on":"")} onClick={()=>setF({ ...F, sort:id })}>{l}</button>)}</div></div>
              {fs.map(f=>{ const open = more[f.attr.id]; const n = (F.sel[f.attr.id]||[]).length; return (
                <div key={f.attr.id} className="sfx-sec">
                  <div className="sfx-sec-t"><span>{f.attr.name[lang]}{n? " · "+n : ""}</span>{n>0 && <button type="button" className="sfx-lnk" onClick={()=>resetKey(f.attr.id)}>{t.sfx_reset}</button>}</div>
                  <div className="sfx-grid">{(open? f.values : f.values.slice(0,10)).map(v=>{ const on = (F.sel[f.attr.id]||[]).includes(v); const c = cnt(f.attr.id, v);
                    return <button key={v} type="button" className={"sfx-val"+(on?" on":"")} disabled={!on && !c} onClick={()=>pick(f.attr.id, v)}>
                      {f.attr.swatch && <em className="sw" style={{background:attrValueHex(f.attr.id,v)||"#ccc"}}></em>}{sfxLabel(f.attr,v,lang,t)} <i>{c}</i></button>; })}</div>
                  {f.values.length>10 && <button type="button" className="sfx-lnk" style={{marginTop:10}} onClick={()=>setMore(m=>({ ...m, [f.attr.id]:!open }))}>{open? t.sfx_less : fill(t.sfx_more,{n:f.values.length})}</button>}
                </div>); })}
              <div className="sfx-sec"><div className="sfx-sec-t"><span>{t.sfx_price}</span>{priceOn && <button type="button" className="sfx-lnk" onClick={()=>resetKey("price")}>{t.sfx_reset}</button>}</div>{priceBox}</div>
              {hasRatings && <div className="sfx-sec"><div className="sfx-sec-t">{t.sfx_rating}</div><div className="sfx-grid">
                {[[0,t.sfx_r_any],[4,t.sfx_r4],[3,t.sfx_r3]].map(([r,l])=><button key={r} type="button" className={"sfx-val"+(F.rate===r?" on":"")} onClick={()=>setF({ ...F, rate:r })}>{r? "★ " : ""}{l}{r? <i>{rateCnt(r)}</i> : null}</button>)}</div></div>}
              <div className="sfx-sec"><div className="sfx-grid"><button type="button" className={"sfx-val"+(F.stock?" on":"")} onClick={()=>setF({ ...F, stock:!F.stock })}>{t.sfx_instock} <i>{stockCnt}</i></button></div></div>
            </div>
            <div className="sfx-pop-f">
              <button type="button" className="sfx-btn" onClick={()=>setF({ ...SFX_EMPTY, sort:F.sort })}>{t.sfx_reset_all}</button>
              <button type="button" className="sfx-btn pri" onClick={()=>setSheet(null)}>{fill(t.sfx_show,{n:total})}</button>
            </div>
          </div>
        </>, sheet.host)}
    </>
  );
}

Object.assign(window, { SfCatBar, SfFilterSheet, SfResultBar, SFF_I, SfxBar, SfxOpt, SFX_EMPTY, sfxFacets, sfxVals, sfxMatch, sfxSort, sfxPills, sfxRead, sfxWrite, sfxPrice, sfxLabel });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { SFF_I, SfCatBar, SfFilterSheet, SfResultBar, SFX_EMPTY, sfxKey, SFX_COLOR_SYN, sfxNorm, sfxVals, sfxFacets, sfxLabel, sfxPrice, sfxMatch, sfxSort, sfxNice, sfxPresets, sfxPriceLabel, sfxToggle, sfxActive, sfxPills, SFX_URL_KEYS, sfxRead, sfxWrite, sfxHost, SFX_CSS, SfxOpt, SfxBar });
