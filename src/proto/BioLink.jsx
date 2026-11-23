// ===== Link in bio — templates (layouts), customisation, share sheet =====
Object.assign(I18N.en, {
  sh_title:"Share your shop", sh_sub:"Two links — pick what fits where you're posting",
  sh_shop:"Full shop", sh_shop_d:"Catalog, product pages, ordering — the whole storefront.",
  sh_bio:"Link in bio", sh_bio_d:"One compact page: your links + top products. Made for Instagram and Telegram bios.",
  sh_hint:"Change its look in Settings → Link in bio",
  bio_open_shop:"Open the shop", bio_call:"Call", bio_featured:"Popular now", bio_made:"made with",
  st_bio:"Link in bio", st_bio_d:"A compact page for your Instagram / Telegram bio. Pick a template, then fine-tune it.",
  st_bio_view:"Preview page", st_bio_tpl:"Template", st_bio_custom:"Customise",
  st_bio_bg:"Background", st_bio_btn:"Buttons", st_bio_corners:"Corners", st_bio_font:"Font", st_bio_reset:"Reset to template",
  bs_soft:"Soft", bs_fill:"Filled", bs_outline:"Outline", bs_hard:"Bold", bs_glass:"Glass",
  rd_square:"Square", rd_round:"Rounded", rd_pill:"Pill",
});
Object.assign(I18N.ru, {
  sh_title:"Поделиться магазином", sh_sub:"Две ссылки — выберите, что подходит",
  sh_shop:"Весь магазин", sh_shop_d:"Каталог, страницы товаров, заказы — полная витрина.",
  sh_bio:"Ссылка для био", sh_bio_d:"Одна компактная страница: ваши ссылки и топ-товары. Для био Instagram и Telegram.",
  sh_hint:"Дизайн меняется в Настройках → Ссылка для био",
  bio_open_shop:"Открыть магазин", bio_call:"Позвонить", bio_featured:"Популярное", bio_made:"сделано на",
  st_bio:"Ссылка для био", st_bio_d:"Компактная страница для био Instagram / Telegram. Выберите шаблон и настройте его.",
  st_bio_view:"Посмотреть страницу", st_bio_tpl:"Шаблон", st_bio_custom:"Настроить",
  st_bio_bg:"Фон", st_bio_btn:"Кнопки", st_bio_corners:"Углы", st_bio_font:"Шрифт", st_bio_reset:"Сбросить к шаблону",
  bs_soft:"Мягкие", bs_fill:"Залитые", bs_outline:"Контур", bs_hard:"Жирные", bs_glass:"Стекло",
  rd_square:"Прямые", rd_round:"Скруглённые", rd_pill:"Пилюля",
});
Object.assign(I18N.uz, {
  sh_title:"Do\u02bckonni ulashish", sh_sub:"Ikki havola — qayerga joylashingizga qarab tanlang",
  sh_shop:"To\u02bcliq do\u02bckon", sh_shop_d:"Katalog, mahsulot sahifalari, buyurtmalar — to\u02bcliq vitrina.",
  sh_bio:"Bio uchun havola", sh_bio_d:"Bitta ixcham sahifa: havolalaringiz va top mahsulotlar. Instagram va Telegram bio uchun.",
  sh_hint:"Ko\u02bcrinishi Sozlamalar → Bio havolada o\u02bczgartiriladi",
  bio_open_shop:"Do\u02bckonni ochish", bio_call:"Qo\u02bcng\u02bciroq", bio_featured:"Ommabop", bio_made:"yaratilgan:",
  st_bio:"Bio uchun havola", st_bio_d:"Instagram / Telegram bio uchun ixcham sahifa. Shablon tanlang va sozlang.",
  st_bio_view:"Sahifani ko\u02bcrish", st_bio_tpl:"Shablon", st_bio_custom:"Sozlash",
  st_bio_bg:"Fon", st_bio_btn:"Tugmalar", st_bio_corners:"Burchaklar", st_bio_font:"Shrift", st_bio_reset:"Shablonga qaytarish",
  bs_soft:"Yumshoq", bs_fill:"To\u02bcldirilgan", bs_outline:"Kontur", bs_hard:"Qalin", bs_glass:"Shisha",
  rd_square:"To\u02bcg\u02bcri", rd_round:"Yumaloq", rd_pill:"Pilyulya",
});

const BIO_I = {
  ig: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>,
  phone: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 4h4l1.5 4.5-2.2 1.6a13 13 0 0 0 5.6 5.6l1.6-2.2L20 15v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  link: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M10 14a4 4 0 0 0 6 .4l3-3a4 4 0 0 0-5.6-5.6l-1.7 1.7M14 10a4 4 0 0 0-6-.4l-3 3a4 4 0 0 0 5.6 5.6l1.7-1.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
};

// backgrounds: base css + ink/sub/card/border + primary
const BIO_BGS = {
  cream:  { base:"#f4f1ec", ink:"#1b1714", sub:"#6f655a", card:"#ffffff", bd:"rgba(27,23,20,.5)", prim:"#1b1714", primInk:"#ffffff" },
  white:  { base:"#ffffff", ink:"#1b1714", sub:"#776d61", card:"#f5f2ec", bd:"rgba(27,23,20,.5)", prim:"#1b1714", primInk:"#ffffff" },
  sand:   { base:"#ecdfc8", ink:"#3a2c14", sub:"#7d6c4e", card:"#faf4e8", bd:"rgba(58,44,20,.55)", prim:"#3a2c14", primInk:"#f5ecd9" },
  sage:   { base:"#dde3d3", ink:"#28331f", sub:"#5b6850", card:"#f4f3ea", bd:"rgba(40,51,31,.5)", prim:"#31402a", primInk:"#eef0e2" },
  blush:  { base:"linear-gradient(165deg,#fde5cf,#f7b9a4 55%,#e98f8f)", ink:"#4a1f16", sub:"#7c463a", card:"rgba(255,255,255,.92)", bd:"rgba(74,31,22,.5)", prim:"#4a1f16", primInk:"#ffe9d8" },
  sky:    { base:"linear-gradient(180deg,#dcebf7,#c4d9ee)", ink:"#1d3350", sub:"#54718f", card:"rgba(255,255,255,.75)", bd:"rgba(29,51,80,.5)", prim:"#1d3350", primInk:"#eaf3fb" },
  saffron:{ base:"#f2b23e", ink:"#241a08", sub:"#6b5320", card:"#fdf6e9", bd:"#241a08", prim:"#241a08", primInk:"#f2b23e" },
  ink:    { base:"#171412", ink:"#f4efe8", sub:"#a99f92", card:"rgba(255,255,255,.08)", bd:"rgba(244,239,232,.5)", prim:"#f4efe8", primInk:"#171412", dark:true },
  plum:   { base:"#1c1530", ink:"#efeafd", sub:"#9d90c7", card:"#2a2145", bd:"rgba(200,255,80,.45)", prim:"#c8ff50", primInk:"#1c1530", dark:true },
  // vivid palettes (a1–a3 = accent blocks, i1–i3 = text on them)
  mint:   { base:"#c9f3dc", ink:"#0d2a1c", sub:"#3f6553", card:"#ffffff", bd:"rgba(13,42,28,.25)", prim:"#0d2a1c", primInk:"#c9f3dc", a1:"#ff5a36", i1:"#ffffff", a2:"#3d6bff", i2:"#ffffff", a3:"#ffd23f", i3:"#2a2000" },
  lemon:  { base:"#ffe14d", ink:"#16120a", sub:"#4d4318", card:"#ffffff", bd:"#16120a", prim:"#16120a", primInk:"#ffe14d", a1:"#ff4fa3", i1:"#16120a", a2:"#3d7bff", i2:"#ffffff", a3:"#1fc47a", i3:"#16120a" },
  bubble: { base:"#ffd3ea", ink:"#2a0f2e", sub:"#7a4a7e", card:"#ffffff", bd:"#2a0f2e", prim:"#7b2cff", primInk:"#ffffff", a1:"#ff7a1a", i1:"#2a0f2e", a2:"#7b2cff", i2:"#ffffff", a3:"#13c9b3", i3:"#2a0f2e" },
  tomato: { base:"#ff4b2b", ink:"#fff6ea", sub:"#ffe0d2", card:"#1b0d08", bd:"#fff6ea", prim:"#fff6ea", primInk:"#d12c10", a1:"#ffd23f", i1:"#1b0d08", a2:"#1b0d08", i2:"#fff6ea", a3:"#fff6ea", i3:"#1b0d08", dark:true },
  cobalt: { base:"#1f3cff", ink:"#ffffff", sub:"#cdd5ff", card:"#ffffff", bd:"rgba(255,255,255,.4)", prim:"#d4ff3a", primInk:"#101a66", a1:"#d4ff3a", i1:"#101a66", a2:"#ff6bd6", i2:"#2b0726", a3:"#101a66", i3:"#ffffff", dark:true },
  aurora: { base:"#170f2e", ink:"#ffffff", sub:"rgba(255,255,255,.74)", card:"rgba(255,255,255,.1)", bd:"rgba(255,255,255,.28)", prim:"#ffffff", primInk:"#170f2e", a1:"#ff5fb8", i1:"#ffffff", a2:"#6c6bff", i2:"#ffffff", a3:"#1fd8b8", i3:"#062a24", dark:true },
  dusk:   { base:"#0e1a2b", ink:"#ffffff", sub:"rgba(255,255,255,.72)", card:"rgba(255,255,255,.1)", bd:"rgba(255,255,255,.28)", prim:"#ffffff", primInk:"#0e1a2b", a1:"#ff8a3d", i1:"#ffffff", a2:"#e0337a", i2:"#ffffff", a3:"#ffd166", i3:"#2a1800", dark:true },
  ikat:   { base:"#1d1a4a", ink:"#fff5e1", sub:"#c5bce6", card:"#2a2664", bd:"rgba(255,245,225,.28)", prim:"#f2b23e", primInk:"#1d1a4a", a1:"#e2384d", i1:"#ffffff", a2:"#f2b23e", i2:"#1d1a4a", a3:"#2ab3a6", i3:"#0b2b28", dark:true },
  pomegranate:{ base:"#5a0f1f", ink:"#fff1e4", sub:"#e7bfb5", card:"#74182b", bd:"rgba(255,241,228,.28)", prim:"#f6c453", primInk:"#3a0812", a1:"#1e8a7a", i1:"#ffffff", a2:"#f6c453", i2:"#3a0812", a3:"#2b3a8f", i3:"#ffffff", dark:true },
  desktop:{ base:"#008080", ink:"#ffffff", sub:"#d8f3f3", card:"#c0c0c0", bd:"#404040", prim:"#000080", primInk:"#ffffff", a1:"#000080", i1:"#ffffff", a2:"#c0c0c0", i2:"#000000", a3:"#d83a2a", i3:"#ffffff" },
  vapor:  { base:"#ff8fc7", ink:"#2a0640", sub:"#5a2a72", card:"#d9c8f0", bd:"#2a0640", prim:"#7a1fa2", primInk:"#ffffff", a1:"#7a1fa2", i1:"#ffffff", a2:"#d9c8f0", i2:"#2a0640", a3:"#1bc6c6", i3:"#05282a" },
  till:   { base:"#cfc8bc", ink:"#1d1d1d", sub:"#6b6b6b", card:"#fbfaf5", bd:"rgba(29,29,29,.35)", prim:"#1d1d1d", primInk:"#fbfaf5", a1:"#d6392f", i1:"#ffffff", a2:"#1d1d1d", i2:"#fbfaf5", a3:"#d6392f", i3:"#ffffff" },
  chatday:{ base:"#b9d3ea", ink:"#14212e", sub:"#5d7287", card:"#ffffff", bd:"rgba(20,33,46,.15)", prim:"#2f8ae0", primInk:"#ffffff", a1:"#2f8ae0", i1:"#ffffff", a2:"#ffffff", i2:"#14212e", a3:"#dcf8c6", i3:"#14212e" },
  chatnight:{ base:"#0f1722", ink:"#f2f5f8", sub:"#8a9bb0", card:"#1d2733", bd:"rgba(255,255,255,.12)", prim:"#5aa9f0", primInk:"#0f1722", a1:"#5aa9f0", i1:"#0f1722", a2:"#1d2733", i2:"#f2f5f8", a3:"#2b5278", i3:"#f2f5f8", dark:true },
  fest:   { base:"#2b1a66", ink:"#ffffff", sub:"#c9bdf5", card:"#ffe3e0", bd:"rgba(255,255,255,.25)", prim:"#ff5c39", primInk:"#ffffff", a1:"#ff5c39", i1:"#ffffff", a2:"#fff3d1", i2:"#2b1a66", a3:"#ffc53d", i3:"#2b1a66", dark:true },
  vinyl:  { base:"#f1e6d6", ink:"#1b1714", sub:"#7a6c5c", card:"#ffffff", bd:"rgba(27,23,20,.2)", prim:"#ef5a2b", primInk:"#ffffff", a1:"#ef5a2b", i1:"#ffffff", a2:"#1b1714", i2:"#f6efe6", a3:"#f6c453", i3:"#1b1714" },
  glossy: { base:"#f3eee6", ink:"#111111", sub:"#6a645c", card:"#ffffff", bd:"rgba(17,17,17,.2)", prim:"#e5202e", primInk:"#ffffff", a1:"#e5202e", i1:"#ffffff", a2:"#ffe600", i2:"#111111", a3:"#111111", i3:"#ffffff" },
  kraft:  { base:"#e8d9bd", ink:"#2b2218", sub:"#6e5f49", card:"#fffaf0", bd:"rgba(43,34,24,.35)", prim:"#d63a3a", primInk:"#ffffff", a1:"#d63a3a", i1:"#ffffff", a2:"#2f6fd6", i2:"#ffffff", a3:"#f5c542", i3:"#2b2218" },
};
const BIO_FONTS = {
  soft:   { body:'"Hanken Grotesk",sans-serif', disp:'"Bricolage Grotesque",sans-serif' },
  grotesk:{ body:'"Space Grotesk",sans-serif', disp:'"Space Grotesk",sans-serif' },
  serif:  { body:'"Newsreader",serif', disp:'"Instrument Serif",serif' },
  outfit: { body:'"Outfit",sans-serif', disp:'"Outfit",sans-serif' },
  round:  { body:'"Outfit",sans-serif', disp:'"Unbounded",sans-serif' },
  impact: { body:'"Hanken Grotesk",sans-serif', disp:'"Anton",sans-serif' },
  hand:   { body:'"Hanken Grotesk",sans-serif', disp:'"Caveat",cursive' },
  pixel:  { body:'"Space Mono",monospace', disp:'"VT323",monospace' },
  mono:   { body:'"Space Mono",monospace', disp:'"Space Mono",monospace' },
};
const BIO_RT = { square:"6px", round:"22px", pill:"30px" };
const BIO_RADII = { square:"6px", round:"18px", pill:"999px" };

// templates: layout + default style
const BIO_TPLS = [
  { id:"clean",     name:"Clean",     layout:"classic",   bg:"cream",   btn:"soft",    radius:"round",  font:"soft" },
  { id:"poster",    name:"Poster",    layout:"poster",    bg:"ink",     btn:"glass",   radius:"pill",   font:"soft" },
  { id:"editorial", name:"Editorial", layout:"editorial", bg:"white",   btn:"outline", radius:"square", font:"serif" },
  { id:"desktop",   name:"Desktop 98",layout:"os",        bg:"desktop", btn:"hard",    radius:"square", font:"pixel",  group:"concept" },
  { id:"receipt",   name:"Receipt",   layout:"receipt",   bg:"till",    btn:"outline", radius:"square", font:"mono",   group:"concept" },
  { id:"chat",      name:"Chat",      layout:"chat",      bg:"chatday", btn:"soft",    radius:"round",  font:"outfit", group:"concept" },
  { id:"chatnight", name:"Night chat",layout:"chat",      bg:"chatnight",btn:"soft",   radius:"round",  font:"outfit", group:"concept" },
  { id:"ticket",    name:"Ticket",    layout:"ticket",    bg:"fest",    btn:"fill",    radius:"round",  font:"impact", group:"concept" },
  { id:"vinyl",     name:"Vinyl",     layout:"player",    bg:"vinyl",   btn:"fill",    radius:"round",  font:"soft",   group:"concept" },
  { id:"cover",     name:"Magazine",  layout:"cover",     bg:"glossy",  btn:"fill",    radius:"square", font:"impact", group:"concept" },
  { id:"bento",     name:"Bento",     layout:"bento",     bg:"mint",    btn:"fill",    radius:"round",  font:"round",  vivid:true },
  { id:"pop",       name:"Pop grid",  layout:"bento",     bg:"cobalt",  btn:"fill",    radius:"pill",   font:"grotesk",vivid:true },
  { id:"sticker",   name:"Sticker",   layout:"sticker",   bg:"lemon",   btn:"hard",    radius:"round",  font:"round",  vivid:true },
  { id:"bubble",    name:"Bubblegum", layout:"sticker",   bg:"bubble",  btn:"hard",    radius:"pill",   font:"round",  vivid:true },
  { id:"loud",      name:"Loud",      layout:"marquee",   bg:"tomato",  btn:"fill",    radius:"square", font:"impact", vivid:true },
  { id:"aurora",    name:"Aurora",    layout:"aurora",    bg:"aurora",  btn:"glass",   radius:"pill",   font:"outfit", vivid:true },
  { id:"sunsetglow",name:"Golden hour",layout:"aurora",   bg:"dusk",    btn:"glass",   radius:"round",  font:"soft",   vivid:true },
  { id:"ikat",      name:"Ikat",      layout:"ikat",      bg:"ikat",    btn:"outline", radius:"round",  font:"serif",  vivid:true },
  { id:"anor",      name:"Anor",      layout:"ikat",      bg:"pomegranate", btn:"outline", radius:"square", font:"serif", vivid:true },
  { id:"scrap",     name:"Scrapbook", layout:"scrap",     bg:"kraft",   btn:"soft",    radius:"square", font:"hand",   vivid:true },
];
const _oldMap = { clean:"clean", sunset:"sunsetglow", sage:"clean", bazaar:"bento", neon:"aurora", sky:"clean", paper:"editorial", ink:"poster" };
const _goneTpl = { sunset:"sunsetglow", hero:"clean", garden:"clean", bazaar:"bento", neon:"aurora" };
function bioCfgOf(st){
  let raw = st.bio || (st.bioDesign? { tpl:_oldMap[st.bioDesign]||"clean" } : {});
  if(_goneTpl[raw.tpl]) raw = { tpl:_goneTpl[raw.tpl] };
  const tpl = BIO_TPLS.find(x=>x.id===raw.tpl) || BIO_TPLS[0];
  return { tpl:tpl.id, layout:tpl.layout,
    bg: BIO_BGS[raw.bg]? raw.bg : tpl.bg,
    btn: raw.btn || tpl.btn,
    radius: BIO_RADII[raw.radius]? raw.radius : tpl.radius,
    font: BIO_FONTS[raw.font]? raw.font : tpl.font };
}
function bioVars(c){
  const bg = BIO_BGS[c.bg], f = BIO_FONTS[c.font];
  return { "--b-bg":bg.base, "--b-ink":bg.ink, "--b-sub":bg.sub, "--b-card":bg.card, "--b-bd":bg.bd,
    "--b-prim":bg.prim, "--b-prim-ink":bg.primInk, "--b-r":BIO_RADII[c.radius], "--b-rt":BIO_RT[c.radius], "--b-font":f.body, "--b-disp":f.disp,
    "--b-a1":bg.a1||bg.prim, "--b-i1":bg.i1||bg.primInk, "--b-a2":bg.a2||bg.ink, "--b-i2":bg.i2||(bg.dark? "#111" : "#fff"), "--b-a3":bg.a3||bg.sub, "--b-i3":bg.i3||"#fff" };
}

function useBioData(store, shopId, lang, onOpenShop){
  const t = I18N[lang];
  const st = store.settings(shopId);
  const meta = store.shopMeta(shopId);
  const cfgTheme = store.cfg(shopId);
  const c = st.contacts || {};
  const kw = IMG_KW[st.type];
  const prods = publicProducts(store, shopId).filter(p=>p.stock!=="sold").slice(0,4);
  const priceStr = (v)=> (typeof fmtPrice==="function"? fmtPrice(v,lang) : fmtNum(v)+" "+CURRENCY[lang]);
  const links = [
    { key:"shop", ic:I.store, big:true, lab:t.bio_open_shop, sub:"rastashops.com/"+st.handle, go:onOpenShop },
    c.instagram && { key:"ig", ic:BIO_I.ig, lab:"Instagram", sub:"@"+c.instagram, go:()=>toast("instagram.com/"+c.instagram) },
    c.telegram && { key:"tg", ic:I.tg, lab:"Telegram", sub:"@"+c.telegram, go:()=>toast("t.me/"+c.telegram) },
    c.phone && { key:"ph", ic:BIO_I.phone, lab:t.bio_call, sub:c.phone, go:()=>toast(c.phone) },
    (()=>{ const pl = shopPlace(st, shopId); return pl.has && { key:"loc", ic:LOC_I.pin, lab:t.loc_title, sub:[pl.address, st.city].filter(Boolean).join(", "), go:()=>window.open(mapLinks(pl).y, "_blank") }; })(),
  ].filter(Boolean);
  return { t, st, meta, cfgTheme, kw, prods, priceStr, links };
}

function BioAvatar({ d, shopId, size }){
  return (
    <div className="bio-avatar" style={{width:size,height:size,"--ph-tone":getPalette(d.cfgTheme).swatch}}>
      <ImageSlot id={"avatar-"+shopId} shape="circle" src={photoURL(getPalette(d.cfgTheme).swatch, "avatar-"+shopId, 200,200, d.kw, 3)} placeholder={d.meta.initials} style={FILL}/>
    </div>
  );
}
function BioCover({ d, shopId, cls }){
  return (
    <div className={cls}>
      <ImageSlot id={"cover-"+shopId} src={photoURL(d.st.cover||getPalette(d.cfgTheme).swatch, "cover-"+shopId, 1200,720, d.kw)} placeholder={d.st.name} style={FILL}/>
    </div>
  );
}
function BioButtons({ d }){
  const shop = d.links.find(l=>l.big), rest = d.links.filter(l=>!l.big);
  return (
    <div className="bio-links">
      {shop && (
        <button className="bio-btn primary bio-shoplink" onClick={shop.go}>
          <span className="bio-sl-shine"></span>
          <span className="bio-btn-ic">{shop.ic({width:22,height:22})}</span>
          <span className="bio-btn-tx"><b>{shop.lab}</b><i>{shop.sub}</i></span>
          <span className="bio-sl-badge">{I.bag({width:12,height:12})} {d.prods.length>0? d.t.bio_featured : ""}</span>
          <span className="bio-btn-go">{I.arrow({width:17,height:17})}</span>
        </button>
      )}
      {rest.map(l=>(
        <button key={l.key} className="bio-btn" onClick={l.go}>
          <span className="bio-btn-ic">{l.ic({width:19,height:19})}</span>
          <span className="bio-btn-tx"><b>{l.lab}</b><i>{l.sub}</i></span>
          <span className="bio-btn-go">{I.arrow({width:15,height:15})}</span>
        </button>
      ))}
    </div>
  );
}
function BioProdCard({ d, shopId, p, i, onOpenShop }){
  return (
    <button className="bio-prod" onClick={onOpenShop}>
      <span className="bio-pimg"><ImageSlot id={pslot(shopId,p,0)} src={photoURL(p.tone, pslot(shopId,p,0), 240,300, d.kw, i)} placeholder={textFB(p.name,"en").toLowerCase()} style={FILL}/></span>
      <span className="bio-pname">{textFB(p.name, window.__lang||"en")}</span>
      <span className="bio-pprice">{d.priceStr(typeof pMin==="function"? pMin(p) : p.price)}</span>
    </button>
  );
}
function BioShelf({ d, shopId, onOpenShop, cls }){
  if(!d.prods.length) return null;
  return (
    <div className="bio-shelf">
      <div className="bio-shelf-t">{d.t.bio_featured}</div>
      <div className={cls||"bio-grid"}>
        {d.prods.map((p,i)=><BioProdCard key={p.id} d={d} shopId={shopId} p={p} i={i} onOpenShop={onOpenShop}/>)}
      </div>
    </div>
  );
}
const BioFoot = ({d}) => <div className="bio-foot">{d.t.bio_made} <b>rastashops.com</b></div>;

function BioPage({ store, shopId, lang, onOpenShop, override }){
  const st = store.settings(shopId);
  const cfg = { ...bioCfgOf(st), ...(override||{}) };
  const d = useBioData(store, shopId, lang, onOpenShop);
  const cls = "bio-page bio-l-"+cfg.layout+" bio-btn-"+cfg.btn+(BIO_BGS[cfg.bg].dark?" bio-dark":"");
  const tagline = textFB(d.st.tagline, lang) || "";
  if(VIBE_LAYOUTS.includes(cfg.layout)) return <BioVibe layout={cfg.layout} d={d} shopId={shopId} lang={lang} onOpenShop={onOpenShop} tagline={tagline} cls={cls} style={bioVars(cfg)}/>;
  return (
    <div className={cls} style={bioVars(cfg)}>
      {cfg.layout==="poster" && <BioCover d={d} shopId={shopId} cls="bio-poster-bg"/>}
      <div className="bio-card">
        {cfg.layout==="hero" && <BioCover d={d} shopId={shopId} cls="bio-hero-cover"/>}

        {cfg.layout==="editorial" ? (
          <div className="bio-ed-head">
            <BioAvatar d={d} shopId={shopId} size={64}/>
            <h1 className="bio-name">{d.st.name}</h1>
            {tagline && <p className="bio-tag">{tagline}</p>}
            <div className="bio-meta">{d.st.city} · {TYPES[d.st.type][lang]}</div>
          </div>
        ) : (
          <div className="bio-head">
            {cfg.layout!=="poster" && <BioAvatar d={d} shopId={shopId} size={cfg.layout==="hero"? 84 : 96}/>}
            {cfg.layout==="poster" && <BioAvatar d={d} shopId={shopId} size={56}/>}
            <h1 className="bio-name">{d.st.name}</h1>
            {tagline && <p className="bio-tag">{tagline}</p>}
            <div className="bio-meta">{d.st.city} · {TYPES[d.st.type][lang]}</div>
          </div>
        )}

        {cfg.layout==="editorial" ? (
          <div className="bio-ed-links">
            {d.links.map((l,i)=>(
              <button key={l.key} className="bio-ed-row" onClick={l.go}>
                <span className="bio-ed-n">{String(i+1).padStart(2,"0")}</span>
                <span className="bio-ed-lab"><b>{l.lab}</b><i>{l.sub}</i></span>
                <span className="bio-btn-go">{I.arrow({width:16,height:16})}</span>
              </button>
            ))}
          </div>
        ) : cfg.layout==="tiles" ? (
          <div className="bio-tiles">
            {d.links.map(l=>(
              <button key={l.key} className={"bio-tile bio-btn"+(l.big?" primary wide":"")} onClick={l.go}>
                {l.ic({width:22,height:22})}
                <span className="bio-tile-tx"><b>{l.lab}</b><i>{l.sub}</i></span>
              </button>
            ))}
          </div>
        ) : (
          <BioButtons d={d}/>
        )}

        {cfg.layout==="editorial"
          ? (d.prods.length>0 && (
              <div className="bio-shelf">
                <div className="bio-shelf-t">{d.t.bio_featured}</div>
                <div className="bio-ed-prods">
                  {d.prods.map((p,i)=>(
                    <button key={p.id} className="bio-ed-prod" onClick={onOpenShop}>
                      <span className="bio-pimg sm"><ImageSlot id={pslot(shopId,p,0)} src={photoURL(p.tone, pslot(shopId,p,0), 120,150, d.kw, i)} placeholder={textFB(p.name,"en").toLowerCase()} style={FILL}/></span>
                      <span className="bio-ed-lab"><b>{textFB(p.name,lang)}</b><i>{d.priceStr(p.price)}</i></span>
                      <span className="bio-btn-go">{I.arrow({width:15,height:15})}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          : <BioShelf d={d} shopId={shopId} onOpenShop={onOpenShop} cls={(cfg.layout==="shelf"||cfg.layout==="poster")? "bio-scroll" : "bio-grid"}/>}
        <BioFoot d={d}/>
      </div>
    </div>
  );
}

function ShareSheet({ store, shopId, t, onClose, onOpenShop, onOpenBio, onSettings }){
  const st = store.settings(shopId);
  function copy(url){ try{ navigator.clipboard && navigator.clipboard.writeText(url); }catch(e){} toast(t.db_copied); }
  const opts = [
    { ic:I.store, tone:"", lab:t.sh_shop, d:t.sh_shop_d, url:"rastashops.com/"+st.handle, open:onOpenShop },
    { ic:BIO_I.link, tone:" bio", lab:t.sh_bio, d:t.sh_bio_d, url:"rastashops.com/"+st.handle+"/link", open:onOpenBio, hint:true },
  ];
  return (
    <Modal title={t.sh_title} sub={t.sh_sub} onClose={onClose}>
      <div className="share-opts">
        {opts.map((o,i)=>(
          <div key={i} className={"share-opt"+o.tone}>
            <div className="share-ic">{o.ic({width:20,height:20})}</div>
            <div className="share-main">
              <b>{o.lab}</b>
              <span className="share-url">{o.url}</span>
              <p>{o.d}</p>
              {o.hint && <button className="lnk share-hint" onClick={onSettings}>{I.gear({width:13,height:13})} {t.sh_hint}</button>}
            </div>
            <div className="share-acts">
              <button className="btn btn-soft btn-sm" onClick={()=>copy(o.url)}>{I.copy({width:15,height:15})} {t.db_copy}</button>
              <button className="btn btn-accent btn-sm" onClick={o.open}>{I.eye({width:15,height:15})}</button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// structural mini-preview per template
function BioThumb({ tpl, over }){
  const def = BIO_TPLS.find(x=>x.id===tpl) || BIO_TPLS[0];
  const c = { tpl:def.id, layout:def.layout, bg:def.bg, btn:def.btn, radius:def.radius, font:def.font, ...(over||{}) };
  const L = c.layout;
  if(VIBE_LAYOUTS.includes(L)) return <VibeThumb L={L} c={c}/>;
  return (
    <span className={"bio-thumb bio-btn-"+c.btn+" th-"+L} style={bioVars(c)}>
      {L==="hero" && <span className="bt-cover"></span>}
      {L==="poster" && <span className="bt-poster"></span>}
      {L!=="editorial" && <span className="bt-av" style={L==="poster"?{marginTop:"auto"}:null}></span>}
      {L==="editorial" && <span className="bt-av left"></span>}
      <span className={"bt-nm"+(L==="editorial"?" left":"")}></span>
      {L==="tiles"
        ? <span className="bt-tiles"><i className="primary"></i><i></i><i></i></span>
        : L==="editorial"
        ? <span className="bt-rows"><i></i><i></i><i></i></span>
        : <React.Fragment><span className="bt-btn primary"></span><span className="bt-btn"></span><span className="bt-btn"></span></React.Fragment>}
      {L==="shelf" && <span className="bt-shelf"><i></i><i></i><i></i></span>}
    </span>
  );
}

function BioStudio({ value, onChange, t, onPreview }){
  const raw = value || {};
  const cfg = bioCfgOf({ bio: raw });
  const pick = (p)=> onChange({ ...raw, tpl:cfg.tpl, ...p });
  return (
    <div className="bio-studio">
      <div className="bio-sub-t">{t.st_bio_tpl}</div>
      {[["concept",t.st_bio_concept],["vivid",t.st_bio_vivid],["classic",t.st_bio_classic]].map(([g,lab])=>(
        <div key={g} className="bio-tpl-group">
          <div className="bio-tpl-gt">{lab}{g==="concept" && <em>{t.vb_new}</em>}</div>
          <div className="bio-picker">
            {BIO_TPLS.filter(x=>(x.group||(x.vivid?"vivid":"classic"))===g).map(x=>(
              <button key={x.id} className={"bio-pick"+(cfg.tpl===x.id?" on":"")} onClick={()=>onChange({ tpl:x.id })}>
                <BioThumb tpl={x.id}/>
                <span className="bio-pick-nm">{cfg.tpl===x.id && I.check({width:13,height:13})} {x.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="bio-sub-t">{t.st_bio_custom}</div>
      <div className="field"><label>{t.st_bio_bg}</label>
        <div className="bio-swatches">
          {Object.keys(BIO_BGS).map(id=>(
            <button key={id} className={"bio-sw"+(cfg.bg===id?" on":"")} style={{background:BIO_BGS[id].base}} onClick={()=>pick({bg:id})}>
              {cfg.bg===id && <span style={{color:BIO_BGS[id].ink}}>{I.check({width:14,height:14})}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="field-row">
        {!VIBE_LAYOUTS.includes(cfg.layout) && <div className="field"><label>{t.st_bio_btn}</label>
          <select value={cfg.btn} onChange={e=>pick({btn:e.target.value})}>
            {[["soft",t.bs_soft],["fill",t.bs_fill],["outline",t.bs_outline],["hard",t.bs_hard],["glass",t.bs_glass]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </div>}
        <div className="field"><label>{t.st_bio_corners}</label>
          <select value={cfg.radius} onChange={e=>pick({radius:e.target.value})}>
            {[["square",t.rd_square],["round",t.rd_round],["pill",t.rd_pill]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="field"><label>{t.st_bio_font}</label>
          <select value={cfg.font} onChange={e=>pick({font:e.target.value})}>
            {[["soft","Bricolage"],["grotesk","Space Grotesk"],["serif","Serif"],["outfit","Outfit"],["round","Unbounded"],["impact","Anton"],["hand","Caveat (handwritten)"],["pixel","VT323 (pixel)"],["mono","Space Mono"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:"flex", gap:14, alignItems:"center"}}>
        <button className="lnk" onClick={()=>onChange({ tpl:cfg.tpl })}>{I.x({width:13,height:13})} {t.st_bio_reset}</button>
        {onPreview && <button className="lnk" onClick={onPreview}>{I.eye({width:14,height:14})} {t.st_bio_view}</button>}
      </div>
    </div>
  );
}

Object.assign(window, { BioPage, ShareSheet, BioStudio, BioThumb, BIO_TPLS, bioCfgOf, BioAvatar, BioCover, BioFoot, BIO_BGS, bioVars, BIO_I });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { BIO_I, BIO_BGS, BIO_FONTS, BIO_RT, BIO_RADII, BIO_TPLS, _oldMap, _goneTpl, bioCfgOf, bioVars, useBioData, BioAvatar, BioCover, BioButtons, BioProdCard, BioShelf, BioFoot, BioPage, ShareSheet, BioThumb, BioStudio });
