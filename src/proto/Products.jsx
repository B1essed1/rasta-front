// ===== Products — catalog management =====
function phHint(t, k){ return (t.ph_hints_csv||"").split(",")[Math.min(k,5)] || ""; }
function growCount(filled, max=6, min=4){
  let top = -1;
  for(let i=0;i<max;i++) if(filled[i]) top = i;
  return Math.min(max, Math.max(min, top+2));
}
// One colour = one shoot: header (swatch · name · n/6), its own photo slots, then that colour's size rows
function ColorPhotoGroup({ shop, pid, cid, sw, lang, t, seeded, children }){
  const ids = React.useMemo(()=>Array.from({length:6}).map((_,k)=>"pc-"+shop.id+"-"+pid+"-"+cid+"-"+k), [shop.id, pid, cid]);
  const filled = useSlotsFilled(ids);
  const [extra, setExtra] = React.useState(0);
  const [hidden, setHidden] = React.useState({});
  const n = Math.min(6, growCount(filled) + extra);
  const nFilled = ids.filter((_,k)=>filled[k] && !hidden[k]).length;
  return (
    <div className="pg-card">
      <div className="pg-head">
        <i style={{background:attrValueHex(sw.id,cid)||"#ccc"}}></i>
        <b>{attrValueName(sw.id,cid,lang)}</b>
        <span className={nFilled<2? "req" : ""}>{fill(t.ph_count,{n:nFilled})}{nFilled<2? " · "+fill(t.ph_min_short,{n:2}) : ""}</span>
      </div>
      <div className="pg-slots">
        {Array.from({length:n}).map((_,k)=>{
          if(hidden[k]) return null;
          const src = seeded && k<PRODUCT_IMAGES? photoURL("#cdbfa8", ids[k], 200,250, IMG_KW[shop.type], (_hash(String(cid))%5)+k*2) : undefined;
          return (
            <div key={k} className={"img-cell"+(k===0?" main":"")}>
              <ImageSlot id={ids[k]} src={src} placeholder={k===0? t.db_cover : t.db_drop} style={FILL}/>
              {!filled[k] && k>0 && <span className="img-slot-hint">{phHint(t,k)}</span>}
              {k===0 && <span className="img-tag">{t.db_cover}</span>}
              {k>0 && <button className="img-del" title={t.ph_remove} onClick={()=>setHidden(s=>({...s,[k]:true}))}>{I.x({width:13,height:13})}</button>}
            </div>
          );
        })}
        {n<6 && (
          <button className="img-add" onClick={()=>setExtra(x=>x+1)}>
            {I.plus({width:18,height:18})}<span>{t.ph_add}</span>
          </button>
        )}
      </div>
      <div className="pg-rows">{children}</div>
    </div>
  );
}

addI18N({
  pa_details_more:["More details (optional)","Подробнее (необязательно)","Batafsil (ixtiyoriy)"],
  pa_adv:["Barcodes & cost","Штрихкоды и себестоимость","Shtrix-kod va tannarx"],
  pa_adv_d:["Optional — for shops that scan at a counter or track profit.","Необязательно — для тех, кто сканирует товар или считает прибыль.","Ixtiyoriy — skanerlash yoki foydani hisoblash uchun."],
  pa_add_value:["Add your own","Добавить своё","O‘zingiznikini qo‘shing"],
  pa_vprice:["Price","Цена","Narx"],
  pa_vprice_d:["Each version can have its own price. Leave a price empty to use the main price.","У каждого варианта может быть своя цена. Пустое поле — основная цена.","Har bir variantning o‘z narxi bo‘lishi mumkin. Bo‘sh qoldirsangiz asosiy narx olinadi."],
  pa_suggest:["Suggested category","Подходящая категория","Mos toifa"],
  pa_use:["Use","Выбрать","Tanlash"],
  pa_opts_add:["Add sizes, colours or options","Добавить размеры, цвета или варианты","O‘lcham, rang yoki variant qo‘shish"],
  pa_optname:["Your own option","Свой вариант","O‘z variantingiz"],
  pa_optname_ph:["Own option name, e.g. Pattern","Своё название, напр. Узор","O‘z nomi, mas. Naqsh"],
  pa_opts_d:["Only if this product comes in more than one version.","Только если у товара несколько вариантов.","Faqat mahsulotning bir nechta varianti bo‘lsa."],
});
// guess a leaf category from the product name (any language)
const NAME_HINTS = {
  "iphone":"el-p-smart","samsung":"el-p-smart","redmi":"el-p-smart","xiaomi":"el-p-smart","telefon":"el-p-smart","телефон":"el-p-smart","phone":"el-p-smart",
  "airpods":"el-a-head","naushnik":"el-a-head","наушник":"el-a-head","macbook":"el-c-laptop","noutbuk":"el-c-laptop","ноутбук":"el-c-laptop",
  "dress":"cl-w-dresses","плать":"cl-w-dresses","ko‘ylak":"cl-w-dresses","ko'ylak":"cl-w-dresses","futbolka":"cl-m-tshirts","футболк":"cl-m-tshirts","t-shirt":"cl-m-tshirts",
  "sneaker":"fw-w-sneakers","krossovka":"fw-w-sneakers","кроссовк":"fw-w-sneakers","tufli":"fw-m-shoes","туфл":"fw-m-shoes",
  "sumka":"ba-b-hand","сумк":"ba-b-hand","bag":"ba-b-hand","ryukzak":"ba-b-back","рюкзак":"ba-b-back",
  "uzuk":"jw-j-rings","кольц":"jw-j-rings","ring":"jw-j-rings","soat":"jw-w-watch","часы":"jw-w-watch","watch":"jw-w-watch",
  "pomada":"cs-l-stick","помад":"cs-l-stick","lipstick":"cs-l-stick","krem":"cs-s-cream","крем":"cs-s-cream","cream":"cs-s-cream","serum":"cs-s-serum","сыворот":"cs-s-serum",
  "piyola":"hm-k-table","сервиз":"hm-k-table","тарелк":"hm-k-table","plate":"hm-k-table","lagan":"hm-k-table","qozon":"hm-k-cook","казан":"hm-k-cook","кастрюл":"hm-k-cook",
  "choyshab":"hm-t-bedding","постель":"hm-t-bedding","sochiq":"hm-t-towels","полотенц":"hm-t-towels","gilam":"hm-d-textile","ковер":"hm-d-textile",
  "asal":"fd-p-honey","мёд":"fd-p-honey","honey":"fd-p-honey","choy":"fd-d-tea","чай":"fd-d-tea","tea":"fd-d-tea","non":"fd-p-bread","хлеб":"fd-p-bread",
  "protein":"sp-s-protein","протеин":"sp-s-protein","vitamin":"sp-v-single","витамин":"sp-v-single","gantel":"gy-w-dumbbell","гантел":"gy-w-dumbbell",
  "guldasta":"fl-b-mixed","букет":"fl-b-mixed","bouquet":"fl-b-mixed","atirgul":"fl-b-roses","роз":"fl-b-roses",
  "kitob":"bk-b-books","книг":"bk-b-books","book":"bk-b-books","daftar":"bk-s-stat","тетрад":"bk-s-stat","o‘yinchoq":"kd-t-toys","игрушк":"kd-t-toys","toy":"kd-t-toys",
  "tort":"fd-cake","торт":"fd-cake","cake":"fd-cake","bento":"fd-bento","бенто":"fd-bento","cupcake":"fd-cupcake","капкейк":"fd-cupcake","chak-chak":"fd-natsweet","чак-чак":"fd-natsweet","ziravor":"fd-spice","специ":"fd-spice",
  "hijob":"ap-hijab","хиджаб":"ap-hijab","hijab":"ap-hijab","abaya":"cl-abaya","абая":"cl-abaya","kelinlik":"wd-dress","свадеб":"wd-dress","wedding":"wd-dress","sarpo":"wd-sarpo","сарпо":"wd-sarpo",
  "joynamoz":"rl-mat","намазлик":"rl-mat","tasbeh":"rl-tasbeh","чётк":"rl-tasbeh","четк":"rl-tasbeh","qur'on":"rl-quran","коран":"rl-quran",
  "havo shar":"pt-balloon","шары":"pt-balloon","balloon":"pt-balloon","sovun":"hd-soap","мыло":"hd-soap","soap":"hd-soap","свеч":"hm-d-candle","candle":"hm-d-candle",
  "parda":"hm-t-curtain","штор":"hm-t-curtain","curtain":"hm-t-curtain","dasturxon":"hm-t-table","скатерт":"hm-t-table","ko‘rpacha":"hm-t-kurpacha","курпач":"hm-t-kurpacha",
  "gel lak":"cs-nail","гель-лак":"cs-nail","парфюм":"cs-perf","духи":"cs-perf","perfume":"cs-perf","smart watch":"el-w-watch","смарт-час":"el-w-watch",
  "futbol":"sp-football","футбол":"sp-football","football":"sp-football","butsi":"fw-sport","бутс":"fw-sport","boks":"sp-combat","бокс":"sp-combat","kimono":"sp-combat","кимоно":"sp-combat",
  "velosiped":"sp-bike","велосипед":"sp-bike","samokat":"sp-bike","самокат":"sp-bike","бегов":"gy-cardio","treadmill":"gy-cardio","chodir":"sp-camp","палатк":"sp-camp",
  "divan":"fu-sofa","диван":"fu-sofa","shkaf":"fu-cab","шкаф":"fu-cab","televizor":"el-v-tv","телевизор":"el-v-tv","planshet":"el-c-tablet","планшет":"el-c-tablet","chexol":"el-p-acc","чехол":"el-p-acc",
  "shina":"vh-p-tyres","шин":"vh-p-tyres","tyre":"vh-p-tyres","yem":"pt-f-food","корм":"pt-f-food",
};
function suggestLeaf(text){
  const s = String(text||"").toLowerCase();
  if(s.trim().length<3) return null;
  for(const k in NAME_HINTS){ if(s.includes(k) && typeof isLeafCat==="function" && isLeafCat(NAME_HINTS[k])) return NAME_HINTS[k]; }
  return null;
}

function ProductModal({ store, shop, init, t, lang, onClose }){
  const isEdit = !!init;
  const langs = ["uz","ru","en"];
  const [pid] = React.useState(()=> init? init.id : "p"+Math.random().toString(36).slice(2,8));
  const [al, setAl] = React.useState(lang);
  const [names, setNames] = React.useState(init? {...init.name} : {en:"",ru:"",uz:""});
  const [descs, setDescs] = React.useState(init? {...init.desc} : {en:"",ru:"",uz:""});
  const [price, setPrice] = React.useState(init? String(init.price) : "");
  const [cost, setCost] = React.useState("");
  const [costs, setCosts] = React.useState(()=>{
    const o = {};
    (init? init.variants : []).forEach(v=>{ o[optionsKey(v.options||{})||"default"] = v.avgCost!=null? String(v.avgCost) : ""; });
    return o;
  });
  const firstLeaf = leavesForShop(shop.id, shop.type)[0] || "hm-d-ceramics";
  const [catId, setCatId] = React.useState(init? init.catId : firstLeaf);
  const [specs, setSpecs] = React.useState(init? { ...(init.specs||{}) } : {});
  // which values of each variant attribute this product is offered in
  const [chosen, setChosen] = React.useState(()=>{
    if(!init) return {};
    const o = {};
    variantAttrs(init.catId).forEach(a=>{
      const seen = [];
      (init.variants||[]).forEach(v=>{ const x=(v.options||{})[a.id]; if(x && !seen.includes(x)) seen.push(x); });
      if(seen.length) o[a.id] = seen;
    });
    return o;
  });

  const [qty, setQty] = React.useState(()=>{
    const o = {};
    (init? init.variants : []).forEach(v=>{ o[optionsKey(v.options||{})||"default"]=v.qty; });
    return o;
  });
  const [codes, setCodes] = React.useState(()=>{
    const o = {};
    (init? init.variants : []).forEach(v=>{ o[optionsKey(v.options||{})||"default"] = v.barcode || ""; });
    return o;
  });
  // per-variant price: empty = use the main price
  const [prices, setPrices] = React.useState(()=>{
    const o = {};
    (init? init.variants : []).forEach(v=>{ if(v.price!=null) o[optionsKey(v.options||{})||"default"] = String(v.price); });
    return o;
  });
  const [showOpts, setShowOpts] = React.useState(()=> !!(init && (init.variants||[]).some(v=>Object.keys(v.options||{}).length)));
  const [adv, setAdv] = React.useState(()=> !!(init && (init.variants||[]).some(v=>v.barcode || v.avgCost!=null)));
  const [more, setMore] = React.useState(false);
  const [optName, setOptName] = React.useState(init && init.optName? init.optName : "");
  const [catTouched, setCatTouched] = React.useState(!!init);
  const sugg = React.useMemo(()=>suggestLeaf(Object.values(names).join(" ")), [names]);
  const [visible, setVisible] = React.useState(init? init.visible!==false : true);
  const [fx, setFx] = React.useState(init && init.fx? init.fx : "none");
  const [ai, setAi] = React.useState(init && init.ai? { ...init.ai } : {});
  const [studio, setStudio] = React.useState(null);
  const [gen, setGen] = React.useState(init && init.gen? { ...init.gen } : {});
  const [genOff, setGenOff] = React.useState(false);
  const anyName = langs.some(l=>(names[l]||"").trim());
  const vAttrs = variantAttrs(catId);
  const combos = React.useMemo(()=>combineOptions(catId, chosen), [catId, chosen]);
  const comboKeys = combos.map(o=>optionsKey(o)||"default");
  const hasVars = vAttrs.length>0 && combos.length>1;
  const costVals = comboKeys.map(k=>costs[k]||"");
  const mixedCost = costVals.some(v=>v!==costVals[0]);
  const costed = costVals.filter(v=>Number(v)>0).map(Number);
  const repCost = costed.length? Math.round(costed.reduce((a,b)=>a+b,0)/costed.length) : 0;
  const slotIds = React.useMemo(()=>Array.from({length:6}).map((_,i)=>"pi-"+shop.id+"-"+pid+"-"+i), [shop.id, pid]);
  const filled = useSlotsFilled(slotIds);
  const [topExtra, setTopExtra] = React.useState(0);
  const [topHidden, setTopHidden] = React.useState({});
  const topGalN = Math.min(6, growCount(filled) + topExtra);
  const sw = vAttrs.find(a=>a.swatch);
  const colorVals = sw? (chosen[sw.id]||[]) : [];
  const seededP = !!(SHOPS[shop.id] && (SHOPS[shop.id].products||[]).some(x=>x.id===pid));
  const topFilledN = slotIds.filter((_,k)=>filled[k] && !topHidden[k]).length;
  // flat hook over every colour slot id: index ci*6+k
  const colorIds = colorVals.map(cid=>Array.from({length:6}).map((_,k)=>"pc-"+shop.id+"-"+pid+"-"+cid+"-"+k));
  const colorFilled = useSlotsFilled([].concat(...colorIds));
  const photosOk = seededP? true
    : colorVals.length>0
      ? colorVals.every((cid,ci)=>colorIds[ci].filter((id,k)=>colorFilled[ci*6+k]).length>=2)
      : topFilledN>=2;
  const ready = anyName && Number(price)>0 && photosOk;
  const coverURL = photoURL(init? init.tone : "#cdbfa8", slotIds[0], 320,400, IMG_KW[shop.type], store.products(shop.id).findIndex(x=>x.id===pid));
  const coverReady = !!filled[0];
  // a generated angle is replaced by the drop event itself — data-filled is already set on
  // seeded slots, so it cannot tell a fresh drop apart from the photo that was there before
  const clearGen = (i)=> setGen(s=>{ if(!s[i]) return s; const o={...s}; delete o[i]; return o; });

  const renderRow = (options)=>{
            const label = optionsKey(options)||"default";
            const grouped = sw && colorVals.length>0;
            const rest = { ...options }; if(grouped && sw) delete rest[sw.id];
            const shown = variantLabel(catId, rest, lang) || t.inv_qty;
            const code = codes[label]||"";
            const digits = code.replace(/\D/g,"");
            const eanish = digits.length>=12 && digits.length===code.length;
            const bad = eanish && !eanValid(digits);
            const auto = /^RS-/.test(code);
            return (
              <div key={label} className="vq-row">
                <div className="vq-top">
                  <b>{shown}</b>
                  {hasVars && <input className="vq-cost" value={prices[label]||""} inputMode="numeric" aria-label={t.pa_vprice}
                    placeholder={price? fmtNum(Number(price)) : t.pa_vprice}
                    onChange={e=>setPrices(s=>({...s,[label]:e.target.value.replace(/\D/g,"")}))}/>}
                  {adv && <input className="vq-cost" value={costs[label]||""} inputMode="numeric" placeholder={t.pr_cost_buy} aria-label={t.pr_cost_buy}
                    onChange={e=>setCosts(s=>({...s,[label]:e.target.value.replace(/\D/g,"")}))}/>}
                  {isEdit
                    ? <span className="vq-roqty" title={t.pr_qty_where}>{Number(qty[label])||0} {t.inv_qty.toLowerCase()} · {t.pr_in_inv}</span>
                    : <Stepper value={Number(qty[label])||0} min={0} onChange={n=>setQty(s=>({...s,[label]:n}))}/>}
                </div>
                {adv && <div className="vq-bc-row">
                  <span className="vq-bc-ic">{I.barcode({width:15,height:15})}</span>
                  <input className="vq-bc-in" value={code} placeholder={t.bc_scan_in}
                    onChange={e=>setCodes(s=>({...s,[label]:e.target.value.toUpperCase()}))}/>
                  {code
                    ? <button className="vq-bc-act" onClick={()=>setCodes(s=>({...s,[label]:""}))}>{I.x({width:14,height:14})}</button>
                    : <button className="vq-bc-act gen" onClick={()=>setCodes(s=>({...s,[label]:nextBarcode(shop.id)}))}>{I.spark({width:13,height:13})} {t.bc_generate}</button>}
                </div>}
                {adv && code && (
                  <div className={"vq-bc-st"+(bad?" bad":"")}>
                    {bad
                      ? <>{I.warn({width:13,height:13})} {t.inv_bc_bad}</>
                      : auto
                        ? <>{I.check({width:13,height:13})} {t.bc_generated}</>
                        : <>{I.check({width:13,height:13})} {eanish? t.inv_bc_ok : t.bc_factory}</>}
                  </div>
                )}
                {adv && !code && <div className="vq-bc-st muted">{t.bc_free}</div>}
              </div>
            );
  };

  function save(){
    if(!ready) return;
    const fb = (names[al]||names.en||names.ru||names.uz||"").trim();
    const nm = { en:(names.en||"").trim()||fb, ru:(names.ru||"").trim()||fb, uz:(names.uz||"").trim()||fb };
    const ds = { en:(descs.en||"").trim(), ru:(descs.ru||"").trim(), uz:(descs.uz||"").trim() };
    const variants = combos.map(options=>{
      const key = optionsKey(options)||"default";
      const old = init && init.variants.find(v=>(optionsKey(v.options||{})||"default")===key);
      const raw = costs[key];
      const c = (raw==="" || raw==null) ? null : Number(raw);
      const code = (codes[key]||"").trim();
      return { id: old? old.id : pid+"-"+(catSlug(key)||"default"), options, barcode: code || null,
        qty: Number(qty[key])||0, avgCost: c,
        price: (hasVars && prices[key] && Number(prices[key])!==Number(price))? Number(prices[key]) : null, threshold: old? old.threshold : undefined };
    });
    store.saveProduct(shop.id, { id:pid, catId, specs, optName: optName.trim() || null, name:nm, desc:ds, price:Number(price)||0, tone: init? init.tone : "#cdbfa8",
      visible, photos:4, fx, ai, gen, sort: init? init.sort : -1, created: init? init.created : Date.now(), variants });
    toast(t.pr_saved);
    onClose();
  }

  return (
    <Modal wide title={isEdit? t.db_edit : t.db_add} onClose={onClose}
      foot={<>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>{t.g_cancel}</button>
        <div className="mf-right">
          <button className="btn btn-accent btn-sm" disabled={!ready} onClick={save}>{I.check({width:16,height:16})} {t.g_save}</button>
        </div>
      </>}>
      {colorVals.length===0 && (
      <div className="field">
        <label>{t.db_photos}</label>
        <div className="img-uploader">
          {Array.from({length:topGalN}).map((_,i)=>{
            if(topHidden[i]) return null;
            const sid = "pi-"+shop.id+"-"+pid+"-"+i;
            const url = photoURL(init? init.tone : "#cdbfa8", sid, i===0?320:200, 200, IMG_KW[shop.type], store.products(shop.id).findIndex(x=>x.id===pid)+i*2);
            if(gen[i]){
              return (
                <div key={i} className="img-cell is-gen" title={t.gen_replace}
                  onDropCapture={()=>setTimeout(()=>clearGen(i), 120)}
                  onChangeCapture={()=>setTimeout(()=>clearGen(i), 120)}
                  onPasteCapture={()=>setTimeout(()=>clearGen(i), 120)}>
                  <div className="gen-layer" style={genStyle(i, coverURL)}></div>
                  <ImageSlot id={sid} placeholder="" style={FILL}/>
                  <span className="img-ai-tag">{I.spark({width:11,height:11})} {genTag(i,t)}</span>
                  <button className="img-ai-btn" title={t.gen_undo} onClick={()=>clearGen(i)}>{I.x({width:14,height:14})}</button>
                </div>
              );
            }
            return (
              <div key={i} className={"img-cell"+(i===0?" main":"")+(ai[i]?" is-ai":"")} style={fxStyle(fx)}>
                <ImageSlot id={sid} src={init && i<PRODUCT_IMAGES? url : undefined} placeholder={i===0? t.db_cover : t.db_drop} style={FILL} editable max={1200}/>
                {i===0 && <span className="img-tag">{t.db_cover}</span>}
                {!filled[i] && i>0 && <span className="img-slot-hint">{phHint(t,i)}</span>}
                {ai[i] && <span className="img-ai-tag">{I.spark({width:11,height:11})} {t.ai_badge}</span>}
                {filled[i] && <button className="img-ai-btn" title={t.ai_make} onClick={()=>setStudio({ i, sid, url })}>{I.spark({width:14,height:14})}</button>}
                {i>0 && <button className="img-del" title={t.ph_remove} onClick={()=>setTopHidden(s=>({...s,[i]:true}))}>{I.x({width:13,height:13})}</button>}
              </div>
            );
          })}
          {topGalN<6 && (
            <button className="img-add" onClick={()=>setTopExtra(x=>x+1)}>
              {I.plus({width:18,height:18})}<span>{t.ph_add}</span>
            </button>
          )}
        </div>
        <div className={"hint"+(photosOk?"":" req")}>{photosOk? t.db_photos_hint : fill(t.ph_min,{n:2})}</div>
        {!coverReady
          ? null
          : genOff
            ? <div className="ai-strip">{I.grid({width:15,height:15})}<span><b>{t.gen_manual_t}</b> — {t.gen_manual_d}</span></div>
            : <GenerateSetStrip store={store} shop={shop} t={t} lang={lang} src={coverURL} gen={gen} ready={coverReady}
                onGenerate={()=>{ setGen({1:true,2:true,3:true}); toast(t.gen_done); }}
                onClear={()=>setGen({})}
                onDismiss={()=>setGenOff(true)}/>}
        {coverReady && (
          <div className="ai-strip">
            {I.spark({width:15,height:15})}
            <span><b>{t.ai_make}</b> — {t.ai_sub}</span>
            <span className="ai-credit">{fill(t.ai_credits,{n:Math.max(0,(AI_CREDITS[store.settings(shop.id).plan]||0)-(store.settings(shop.id).aiUsed||0))})}</span>
          </div>
        )}
      </div>
      )}

      <div className="field">
        <label>{t.db_details}</label>
        <div className="lang-tabs">
          {langs.map(l=>(
            <button key={l} className={"lang-tab"+(al===l?" on":"")} onClick={()=>setAl(l)}>
              {I18N[l]._label}
              <span className={"lt-st"+((names[l]||"").trim()?" ok":"")}>{(names[l]||"").trim()? I.check({width:11,height:11}) : null}</span>
            </button>
          ))}
        </div>
        <input value={names[al]||""} onChange={e=>setNames(s=>({...s,[al]:e.target.value}))} placeholder={al==="uz"?"Sahar zig‘ir ko‘ylagi":al==="ru"?"Льняное платье":"Sahar linen dress"} autoFocus/>
        <textarea style={{marginTop:10}} value={descs[al]||""} onChange={e=>setDescs(s=>({...s,[al]:e.target.value}))} placeholder={t.db_desc_lbl}></textarea>
      </div>

      <div className="field-row">
        <div className="field">
          <label>{t.pr_price_sell}</label>
          <input value={price} onChange={e=>setPrice(e.target.value.replace(/\D/g,""))} placeholder="590000" inputMode="numeric"/>
          <div className="hint">{t.pr_price_sell_d}</div>
        </div>
        {adv && <div className="field">
          <label>{hasVars? t.rs_same_cost : t.pr_cost_buy}</label>
          <input value={mixedCost? "" : (costs[comboKeys[0]]||"")} placeholder={mixedCost? "—" : "340000"} inputMode="numeric"
            onChange={e=>{ const v=e.target.value.replace(/\D/g,""); const o={}; comboKeys.forEach(k=>o[k]=v); setCosts(s=>({...s,...o})); }}/>
          <div className="hint">{hasVars? t.rs_per_size : t.pr_cost_buy_d}</div>
        </div>}
      </div>

      {adv && (Number(price)>0) && (
        <div className={"margin-strip"+(repCost>0? "" : " empty")}>
          {repCost>0 ? (
            <>
              <div className="ms-block"><span>{t.pr_margin_now}{mixedCost? " · "+t.rs_costed_only : ""}</span><b>{pct(margin(Number(price),repCost))}%</b></div>
              <div className="ms-sep"></div>
              <div className="ms-block wide"><span>{fmtPrice(Number(price),lang)} − {fmtPrice(repCost,lang)}</span>
                <b>{fill(t.pr_profit_each,{v:fmtPrice(Number(price)-repCost,lang)})}</b></div>
            </>
          ) : (
            <div className="ms-block wide"><b>{t.pr_cost_note}</b></div>
          )}
        </div>
      )}

      {sugg && sugg!==catId && !catTouched && (
        <div className="ai-strip">{I.spark({width:15,height:15})}
          <span><b>{t.pa_suggest}:</b> {catBreadcrumb(sugg, lang)}</span>
          <button type="button" className="btn btn-soft btn-xs" onClick={()=>{ setCatId(sugg); setChosen({}); setSpecs({}); setCatTouched(true); }}>{t.pa_use}</button>
        </div>
      )}
      <CategoryCascade value={catId} onChange={(id)=>{ setCatId(id); setChosen({}); setSpecs({}); setCatTouched(true); }} t={t} lang={lang}/>

      {showOpts
        ? <>
            <div className="hint" style={{marginTop:-4, marginBottom:8}}>{t.pa_opts_d}</div>
            <VariantChooser catId={catId} chosen={chosen} setChosen={setChosen} combos={combos} t={t} lang={lang} optName={optName} setOptName={setOptName}/>
            {hasVars && <div className="hint" style={{marginTop:-6, marginBottom:12}}>{t.pa_vprice_d}</div>}
          </>
        : (vAttrs.length>0 && <div className="field"><button type="button" className="btn btn-soft btn-sm" onClick={()=>setShowOpts(true)}>{I.plus({width:15,height:15})} {t.pa_opts_add}</button></div>)}

      {specAttrs(catId).length>0 && (
        <div className="field">
          <button type="button" className="lnk" aria-expanded={more} onClick={()=>setMore(m=>!m)}>{more? I.minus({width:14,height:14}) : I.plus({width:14,height:14})} {t.pa_details_more}</button>
        </div>
      )}
      {more && <SpecFields catId={catId} specs={specs} setSpecs={setSpecs} t={t} lang={lang}/>}

      <div className="field">
        <label className="switch-row">
          <input type="checkbox" checked={adv} onChange={e=>setAdv(e.target.checked)}/>
          <span className="switch"><i></i></span>
          <span>{t.pa_adv}<small style={{display:"block", color:"var(--soft)", fontWeight:400}}>{t.pa_adv_d}</small></span>
        </label>
      </div>

      <div className="field">
        <label>{isEdit? t.pr_stock_head : t.pr_initial}</label>
        {(isEdit || adv) && <div className="hint" style={{marginTop:-2, marginBottom:9}}>{isEdit? t.pr_qty_where : t.pr_cost_note}</div>}
        <div className="var-qty">
          {combos.length===0 && <div className="hint">{t.pr_values}</div>}
          {sw && colorVals.length>0
            ? colorVals.map(cid=>(
                <ColorPhotoGroup key={cid} shop={shop} pid={pid} cid={cid} sw={sw} lang={lang} t={t} seeded={seededP}>
                  {combos.filter(o=>o[sw.id]===cid).map(o=>renderRow(o))}
                </ColorPhotoGroup>
              ))
            : combos.map(o=>renderRow(o))}
        </div>
      </div>

      <div className="field">
        <label className="switch-row">
          <input type="checkbox" checked={visible} onChange={e=>setVisible(e.target.checked)}/>
          <span className="switch"><i></i></span>
          {t.pr_visible}
        </label>
      </div>
      {studio && (
        <StudioModal store={store} shop={shop} slotId={studio.sid} src={studio.url} t={t} lang={lang} applied={!!ai[studio.i]}
          onClose={()=>setStudio(null)}
          onApply={()=>{ setAi(s=>({...s,[studio.i]:true})); toast(t.ai_applied); }}
          onRevert={()=>{ setAi(s=>{ const o={...s}; delete o[studio.i]; return o; }); toast(t.ai_reverted); }}/>
      )}
    </Modal>
  );
}

function ProductRow({ store, shop, p, i, t, lang, onEdit, drag }){
  const [menu, setMenu] = React.useState(false);
  const st = store.settings(shop.id);
  const state = stockState(p, st.threshold);
  const vars = p.variants.filter(v=>Object.keys(v.options||{}).length);
  const incomplete = !(p.desc && (p.desc.en||p.desc.ru||p.desc.uz));
  return (
    <div className={"prow"+(p.visible===false?" hidden":"")} draggable onDragStart={e=>drag.start(e,p.id)} onDragOver={e=>drag.over(e,p.id)} onDrop={e=>drag.drop(e,p.id)} onDragEnd={drag.end}>
      <span className="prow-drag" title={t.pr_reorder}>{I.drag({width:16,height:16})}</span>
      <div className="prow-photo"><ImageSlot id={pslot(shop.id,p,0)} src={photoURL(p.tone, pslot(shop.id,p,0), 120,120, IMG_KW[shop.type], i)} placeholder="" style={FILL}/></div>
      <div className="prow-main">
        <div className="prow-name">{textFB(p.name,lang)}{incomplete && <span className="prow-warn">{I.warn({width:12,height:12})} {t.pr_missing}</span>}</div>
        <div className="prow-meta">{[catLabel(p.catId,lang)]
          .concat(variantAttrs(p.catId).map(a=>{
            const vals = (offeredOptions(p)[a.id]||[]);
            return vals.length? vals.map(v=>attrValueName(a.id,v,lang)).join(", ") : null;
          }).filter(Boolean))
          .concat([totalQty(p)+" "+t.inv_qty.toLowerCase()]).join(" · ")}</div>
      </div>
      <div className="prow-price">{fmtPrice(p.price,lang)}</div>
      <div className="prow-badge"><StatusPill state={state==="in"?"ok":state==="low"?"low":"out"} t={t}/></div>
      <button className={"prow-vis"+(p.visible===false?"":" on")} title={t.pr_vis_tip} onClick={()=>store.toggleVisible(shop.id,p.id)}>
        {I.eye({width:15,height:15})}<span>{p.visible===false? t.pr_vis_off : t.pr_vis_on}</span>
      </button>
      <button className="btn btn-ghost btn-xs" onClick={()=>onEdit(p)}>{I.edit({width:14,height:14})} {t.db_edit}</button>
      <div className="prow-more">
        <button className="icon-btn" onClick={()=>setMenu(m=>!m)} aria-label={t.db_more}>{I.more({width:18,height:18})}</button>
        {menu && (
          <div className="pcard2-menu" onMouseLeave={()=>setMenu(false)}>
            <button onClick={()=>{ store.duplicateProduct(shop.id,p.id); setMenu(false); toast(t.pr_duplicate); }}>{I.copy({width:16,height:16})} {t.pr_duplicate}</button>
            <button className="danger" onClick={()=>{ setMenu(false); onEdit(null,{del:p}); }}>{I.trash({width:16,height:16})} {t.g_delete}</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductsView({ store, shop, t, lang, onAdd, onEdit }){
  const products = store.products(shop.id);
  const st = store.settings(shop.id);
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [del, setDel] = React.useState(null);
  const dragId = React.useRef(null);

  const drag = {
    start:(e,id)=>{ dragId.current=id; e.dataTransfer.effectAllowed="move"; },
    over:(e)=>{ e.preventDefault(); },
    drop:(e,id)=>{ e.preventDefault(); if(dragId.current && dragId.current!==id) store.moveProduct(shop.id, dragId.current, id); dragId.current=null; },
    end:()=>{ dragId.current=null; },
  };

  const list = products.filter(p=>{
    const state = stockState(p, st.threshold);
    if(cat!=="all" && p.catId!==cat) return false;
    if(status==="visible" && p.visible===false) return false;
    if(status==="hidden" && p.visible!==false) return false;
    if(status==="in" && state!=="in") return false;
    if(status==="low" && state!=="low") return false;
    if(status==="sold" && state!=="sold") return false;
    if(q && !(textFB(p.name,lang)+" "+textFB(p.name,"en")).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  if(products.length===0){
    return (
      <EmptyState icon={I.bag} title={t.db_empty_t} body={t.db_empty_d}
        cta={<button className="btn btn-accent" onClick={onAdd}>{I.plus({width:18,height:18})} {t.db_add}</button>}/>
    );
  }
  return (
    <div>
      <div className="db-sec-head">
        <div><h2>{t.db_products}</h2><div className="sub">{products.length} {t.sf_products} · {t.pr_reorder}</div></div>
        <div className="head-acts">
          <button className="btn btn-accent" onClick={onAdd}>{I.plus({width:18,height:18})} {t.db_add}</button>
        </div>
      </div>
      <div className="inv-bar">
        <div className="inline-search grow">{I.search({width:17,height:17})}<input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.sf_search}/></div>
        <select className="mini-select" value={cat} onChange={e=>setCat(e.target.value)}>
          <option value="all">{t.cat_platform}: {t.g_all}</option>
          {[...new Set(products.map(x=>x.catId))].map(id=>(<option key={id} value={id}>{catLabel(id,lang)}</option>))}
        </select>
        <select className="mini-select" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="all">{t.pr_status}: {t.g_all}</option>
          <option value="visible">{t.pr_visible}</option>
          <option value="hidden">{t.pr_hidden}</option>
          <option value="in">{t.sf_in_stock}</option>
          <option value="low">{t.sf_low}</option>
          <option value="sold">{t.sf_sold}</option>
        </select>
      </div>
      <div className="prow-list">
        {list.map(p=>(
          <ProductRow key={p.id} store={store} shop={shop} p={p} i={products.findIndex(x=>x.id===p.id)} t={t} lang={lang} drag={drag}
            onEdit={(prod,opt)=>{ if(opt&&opt.del) setDel(opt.del); else onEdit(prod); }}/>
        ))}
        {list.length===0 && <div className="stk-empty">{t.inv_no_match}</div>}
      </div>
      {del && (
        <Confirm danger title={t.pr_confirm_del_t} body={t.pr_confirm_del_d} cta={t.g_delete}
          onConfirm={()=>{ store.deleteProduct(shop.id, del.id); toast(t.g_delete+" · "+textFB(del.name,lang)); }}
          onClose={()=>setDel(null)}/>
      )}
    </div>
  );
}

Object.assign(window, { ProductsView, ProductModal });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { phHint, growCount, ColorPhotoGroup, NAME_HINTS, suggestLeaf, ProductModal, ProductRow, ProductsView });
