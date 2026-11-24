// ===== Create shop v2: Telegram + bot → shop (live preview) → first product → done =====
const O2_KEY = "rasta.wizard2";
const O2_TRIAL_M = 3;
const O2_RESERVED = ["admin","login","logout","signup","explore","api","app","bozor","rasta","dashboard","settings","help","support","shop","shops","store","cart","checkout","orders","order","profile","search","about","terms","privacy","pricing","blog","www","mail","bot","telegram","new","test"];
const O2_CITY = { Tashkent:["Ташкент","Toshkent"], Samarkand:["Самарканд","Samarqand"], Bukhara:["Бухара","Buxoro"], Andijan:["Андижан","Andijon"], Namangan:["Наманган","Namangan"], Fergana:["Фергана","Farg\u02bbona"], Nukus:["Нукус","Nukus"], Qarshi:["Карши","Qarshi"] };
function cityName(c, lang){ const r = O2_CITY[c]; return !r || lang==="en" ? c : lang==="ru" ? r[0] : r[1]; }
// One handle rule, checked by the server (GET /handles/check: reserved words, taken, old handles of other shops).
// Screens call this synchronously while typing: the local checks answer at once, the server's answer is cached
// and the screen re-renders when it arrives ("rasta-handle" event).
const HANDLE_CACHE = {};
function handleCheck(store, h, exceptShopId){
  if(!h) return "empty"; if(h.length<3) return "short"; if(O2_RESERVED.includes(h)) return "reserved";
  if(!/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(h)) return "invalid";
  if(SHOP_ORDER.some(id=> id!==exceptShopId && ((store.settings(id)||{}).handle===h))) return "taken";
  const key = h + "|" + (exceptShopId||"");
  const c = HANDLE_CACHE[key];
  if(c && c !== "pending") return c.status;
  if(!c){
    HANDLE_CACHE[key] = "pending";
    Api.get("/handles/check?h=" + encodeURIComponent(h) + (exceptShopId ? "&except=" + encodeURIComponent(exceptShopId) : ""))
      .then(r => { HANDLE_CACHE[key] = r; dispatchEvent(new CustomEvent("rasta-handle")); })
      .catch(() => { delete HANDLE_CACHE[key]; });
  }
  return "ok";
}
function useHandleChecks(){ const [,f] = React.useState(0); React.useEffect(()=>{ const k=()=>f(x=>x+1); addEventListener("rasta-handle",k); return ()=>removeEventListener("rasta-handle",k); },[]); }
function handleSuggest(store, h){
  if(!h) return [];
  const srv = HANDLE_CACHE[h + "|"];
  if(srv && srv.suggest && srv.suggest.length) return srv.suggest.slice(0,3);
  return [h+"uz", h+"shop", h+"store", h+"tash", "the"+h].map(x=>x.slice(0,22)).filter(x=>handleCheck(store,x)==="ok").slice(0,3);
}

addI18N({
  o2_s0:["Telegram","Telegram","Telegram"], o2_s1:["Your shop","Магазин","Do\u02bbkon"], o2_s2:["First product","Первый товар","Birinchi mahsulot"],
  o2_tg_t:["Start with Telegram","Начните с Telegram","Telegram bilan boshlang"],
  o2_tg_d:["Your name and phone come from Telegram — nothing to type.","Имя и телефон возьмём из Telegram — ничего вводить не нужно.","Ism va telefon Telegramdan olinadi — hech narsa yozish shart emas."],
  o2_bot_t:["Get orders in Telegram","Заказы в Telegram","Buyurtmalar Telegramda"],
  o2_bot_d:["The rasta bot messages you each new order. Confirm or cancel right in the chat.","Бот rasta присылает каждый заказ. Подтверждайте или отменяйте прямо в чате.","rasta boti har bir buyurtmani yuboradi. Chatning o\u02bbzida tasdiqlang yoki bekor qiling."],
  o2_bot_on:["Send new orders to @{u}","Присылать заказы в @{u}","Buyurtmalarni @{u} ga yuborish"],
  o2_bot_off:["Without this you'll only see orders in the dashboard.","Без этого заказы будут видны только в кабинете.","Busiz buyurtmalar faqat kabinetda ko\u02bbrinadi."],
  o2_msg:["New order #0001","Новый заказ #0001","Yangi buyurtma #0001"],
  o2_msg_d:["1 item · pickup · Malika, +998 90 ··· 12","1 товар · самовывоз · Малика, +998 90 ··· 12","1 ta · olib ketish · Malika, +998 90 ··· 12"],
  o2_confirm:["Confirm","Подтвердить","Tasdiqlash"], o2_cancel:["Cancel","Отменить","Bekor qilish"],
  o2_shop_t:["Set up your shop","Настройте магазин","Do\u02bbkonni sozlang"],
  o2_shop_d:["The preview updates as you type. Everything can be changed later.","Превью меняется по ходу. Всё можно изменить позже.","Ko\u02bbrinish yozgan sari yangilanadi. Hammasini keyin o\u02bbzgartirsa bo\u02bbladi."],
  o2_link_hint:["a–z and 0–9 · 3 to 22 characters","a–z и 0–9 · от 3 до 22 символов","a–z va 0–9 · 3 dan 22 gacha belgi"],
  o2_short:["At least 3 characters","Минимум 3 символа","Kamida 3 ta belgi"], o2_reserved:["This word is reserved","Это слово зарезервировано","Bu so\u02bbz band qilingan"],
  o2_taken:["Taken","Занято","Band"], o2_free:["Available","Свободно","Bo\u02bbsh"], o2_try:["Try:","Попробуйте:","Sinab ko\u02bbring:"],
  o2_cats:["Main category","Основная категория","Asosiy toifa"], o2_cats_d:["Decides product fields and where you appear in rasta bozor.","Определяет поля товара и раздел в rasta bozor.","Mahsulot maydonlari va rasta bozordagi bo\u02bblimni belgilaydi."], o2_why_cat:["Choose a category","Выберите категорию","Toifani tanlang"],
  o2_tag:["Tagline","Слоган","Shior"], o2_tag_d:["Empty languages show the one you filled.","Пустые языки покажут заполненный.","Bo\u02bbsh tillarda to\u02bbldirilgani ko\u02bbrinadi."],
  o2_look:["Look & colour","Стиль и цвет","Ko\u02bbrinish va rang"], o2_photos:["Cover & logo","Обложка и логотип","Muqova va logo"],
  o2_up_cover:["Upload cover","Загрузить обложку","Muqova yuklash"], o2_up_logo:["Logo","Логотип","Logo"], o2_change:["Change","Заменить","Almashtirish"],
  o2_photos_d:["Optional. Until then we show your initials and colour.","Необязательно. Пока покажем инициалы и цвет.","Ixtiyoriy. Hozircha bosh harflar va rang ko\u02bbrinadi."],
  o2_ship:["How buyers get orders","Как покупатели получают заказ","Xaridor buyurtmani qanday oladi"],
  o2_ship_city:["Delivery in city","Доставка по городу","Shahar bo\u02bbylab yetkazish"], o2_ship_uz:["Across Uzbekistan","По Узбекистану","O\u02bbzbekiston bo\u02bbylab"], o2_ship_pickup:["Pickup","Самовывоз","Olib ketish"],
  o2_pick_ph:["Pickup address, e.g. Chorsu bazaar, row 4","Адрес самовывоза, напр. Чорсу, ряд 4","Olib ketish manzili, mas. Chorsu, 4-qator"],
  o2_pay:["Payment you accept","Какую оплату принимаете","Qaysi to\u02bblovni qabul qilasiz"],
  o2_prod_t:["Add your first product","Добавьте первый товар","Birinchi mahsulotni qo\u02bbshing"],
  o2_prod_d:["Your shop goes live with its first product. Takes a minute.","Магазин открывается с первым товаром. Это минута.","Do\u02bbkon birinchi mahsulot bilan ochiladi. Bir daqiqa."],
  o2_photo:["Add photo","Добавить фото","Rasm qo\u02bbshish"], o2_pname:["Product name","Название","Nomi"], o2_pname_ph:["e.g. Linen summer dress","напр. Льняное летнее платье","mas. Zig\u02bbir yozgi ko\u02bbylak"],
  o2_price:["Price, so\u02bbm","Цена, сум","Narxi, so\u02bbm"], o2_qty:["In stock","В наличии","Omborda"], o2_qty_each:["each size","на размер","har o\u02bblcham"], o2_sizes:["Options","Варианты","Variantlar"], o2_qty_opt:["each option","на вариант","har variant"],
  o2_import:["Import from Instagram","Импорт из Instagram","Instagramdan import"], o2_import_d:["Pull your latest posts as products","Последние посты станут товарами","So\u02bbnggi postlar mahsulotga aylanadi"],
  o2_importing:["Reading your posts…","Читаем посты…","Postlar o\u02bbqilmoqda…"], o2_imported:["{n} posts found — untick what you don't sell","Найдено {n} — снимите лишнее","{n} ta topildi — keraksizini olib tashlang"],
  o2_or:["or add one by hand","или добавьте вручную","yoki qo\u02bblda qo\u02bbshing"], o2_skip:["Skip — shop stays hidden until it has a product","Пропустить — магазин скрыт, пока нет товара","O\u02bbtkazish — mahsulot bo\u02bblmaguncha do\u02bbkon yashirin"],
  o2_why_tg:["Log in with Telegram to continue","Войдите через Telegram","Davom etish uchun Telegram orqali kiring"], o2_why_name:["Add a shop name (2+ letters)","Укажите название (от 2 букв)","Do\u02bbkon nomini kiriting (2+ harf)"],
  o2_why_link:["Pick a free link","Выберите свободную ссылку","Bo\u02bbsh havola tanlang"], o2_why_ship:["Choose at least one way to get orders","Выберите хотя бы один способ получения","Kamida bitta usulni tanlang"],
  o2_why_pick:["Add your pickup address","Укажите адрес самовывоза","Olib ketish manzilini kiriting"], o2_why_pay:["Choose at least one payment","Выберите хотя бы одну оплату","Kamida bitta to\u02bblov tanlang"],
  o2_why_prod:["Add a name and price — or skip","Укажите название и цену — или пропустите","Nom va narx kiriting — yoki o\u02bbtkazing"],
  o2_go_live:["Open my shop","Открыть магазин","Do\u02bbkonni ochish"], o2_save_hidden:["Create hidden shop","Создать скрытый магазин","Yashirin do\u02bbkon yaratish"],
  o2_resume_t:["Continue where you left off?","Продолжить с того же места?","To\u02bbxtagan joydan davom etasizmi?"], o2_resume_go:["Continue","Продолжить","Davom etish"], o2_resume_new:["Start over","Начать заново","Qaytadan boshlash"],
  o2_live_t:["You're live!","Магазин открыт!","Do\u02bbkon ochildi!"], o2_hidden_t:["Shop created","Магазин создан","Do\u02bbkon yaratildi"],
  o2_live_d:["Share your link — orders will arrive in Telegram.","Делитесь ссылкой — заказы придут в Telegram.","Havolani ulashing — buyurtmalar Telegramga keladi."],
  o2_hidden_d:["It's hidden until you add a product.","Он скрыт, пока нет товара.","Mahsulot qo\u02bbshilmaguncha yashirin."],
  o2_copy:["Copy","Копировать","Nusxa"], o2_copied:["Link copied","Ссылка скопирована","Havola nusxalandi"], o2_share_tg:["Share in Telegram","Поделиться в Telegram","Telegramda ulashish"], o2_open:["View shop","Открыть","Ko\u02bbrish"],
  o2_todo:["Finish setting up","Завершите настройку","Sozlashni yakunlang"], o2_td_prod:["Add a product","Добавить товар","Mahsulot qo\u02bbshish"], o2_td_bot:["Order alerts in Telegram","Заказы в Telegram","Telegramda buyurtmalar"],
  o2_td_ship:["Delivery & payment","Доставка и оплата","Yetkazish va to\u02bblov"], o2_td_pick:["Add pickup address","Добавить адрес самовывоза","Olib ketish manzilini qo\u02bbshish"], o2_td_share:["Share your link","Поделиться ссылкой","Havolani ulashish"], o2_td_bozor:["Listed in rasta bozor after a quick check","В rasta bozor после быстрой проверки","Tezkor tekshiruvdan so\u02bbng rasta bozorda"],
  o2_test_t:["We sent a test order to your Telegram","Мы отправили тестовый заказ в Telegram","Telegramingizga sinov buyurtmasi yubordik"], o2_test_ok:["That's it — real orders work the same way.","Вот и всё — настоящие заказы работают так же.","Shu — haqiqiy buyurtmalar ham shunday."],
  o2_dash:["Go to dashboard","В кабинет","Kabinetga"],
  o2_trial:["Free for {m} months — until {d}","Бесплатно {m} месяца — до {d}","{m} oy bepul — {d} gacha"],
  o2_trial_d:["Choose a plan before it ends; we'll remind you in Telegram 7 days before. If you don't, the shop pauses — nothing is deleted. Empty shops are released after 30 days.","Выберите тариф до окончания — напомним в Telegram за 7 дней. Иначе магазин приостановится, ничего не удалится. Пустые магазины освобождаются через 30 дней.","Tugashidan oldin tarif tanlang — 7 kun oldin Telegramda eslatamiz. Aks holda do\u02bbkon to\u02bbxtaydi, hech narsa o\u02bbchirilmaydi. Bo\u02bbsh do\u02bbkonlar 30 kundan so\u02bbng bo\u02bbshatiladi."],
});

function o2Fresh(){ return { draftId:"d"+Date.now().toString(36), handle:"", handleEdited:false, name:"", type:"", city:"Tashkent",
  theme:"minimal", palette:"mist", paletteEdited:false, ship:["city","pickup"], pays:["cash","payme","click"],
  phone:"", tgName:"", tgUser:"", bot:true, prod:{ name:"", price:"", qty:"1", sizes:[] }, imported:null, impSel:[] }; }
function o2Load(){ try{ return JSON.parse(localStorage.getItem(O2_KEY))||null; }catch(e){ return null; } }
function o2Leaf(type){ const m = typeof TYPE_LEAVES!=="undefined" ? TYPE_LEAVES : {}; return (m[type]||[])[0] || null; }
function o2SizeAttr(type){ const c = o2Leaf(type); if(!c || typeof variantAttrs!=="function") return null; return variantAttrs(c).find(a=>a.id!=="color" && a.values && a.values.length) || null; }
const O2_TYPES = ["fashion","footwear","bags","jewellery","wedding","cosmetics","health","food","desserts","home","furniture","electronics","kids","flowers","party","handmade","religious","sport","books","pets","vehicles"];
// first product field set for the newer categories (taxonomy leaves)
if(typeof TYPE_LEAVES!=="undefined") Object.assign(TYPE_LEAVES, {
  kids:["kd-t-toys","kd-t-games","kd-b-care","kd-b-gear"], bags:["ba-b-hand","ba-b-back","ba-a-belts","ba-a-scarves","ba-a-sun"],
  jewellery:["jw-j-rings","jw-j-ear","jw-j-neck","jw-w-watch"], books:["bk-b-books","bk-s-stat"], pets:["pt-f-food","pt-a-acc"] });
if(typeof IMG_KW!=="undefined") Object.assign(IMG_KW, { kids:"gifts", bags:"fashion", jewellery:"beauty", books:"home", pets:"home",
  desserts:"food", wedding:"fashion", furniture:"home", religious:"home", party:"gifts", handmade:"home" });
const O2_EX = {
  fashion:["Dresses, shirts, jackets","Платья, рубашки, куртки","Ko\u02bbylak, ko\u02bbylak-shim, kurtka"],
  footwear:["Sneakers, boots, shoes","Кроссовки, ботинки, туфли","Krossovka, etik, tufli"],
  cosmetics:["Makeup, skincare, perfume","Макияж, уход, парфюм","Pardoz, parvarish, atir"],
  food:["Nuts, honey, tea, sweets","Орехи, мёд, чай, сладости","Yong\u02bboq, asal, choy, shirinlik"],
  home:["Ceramics, textiles, decor","Посуда, текстиль, декор","Idish, to\u02bbqimachilik, bezak"],
  electronics:["Phones, headphones, laptops","Телефоны, наушники, ноутбуки","Telefon, quloqchin, noutbuk"],
  flowers:["Bouquets, house plants","Букеты, комнатные растения","Guldasta, xona o\u02bbsimliklari"],
  sport:["Dumbbells, mats, gear","Гантели, коврики, инвентарь","Gantel, gilamcha, anjom"],
  health:["Vitamins, protein","Витамины, протеин","Vitamin, protein"],
  gifts:["Gift sets, souvenirs","Подарочные наборы, сувениры","Sovg\u02bba to\u02bbplami, esdalik"],
  vehicles:["Cars, tyres, parts","Авто, шины, запчасти","Avto, shina, ehtiyot qism"],
  desserts:["Custom cakes, bento, cupcakes","Торты на заказ, бенто, капкейки","Buyurtma tort, bento, keks"],
  wedding:["Wedding dresses, sarpo, national wear","Свадебные платья, сарпо","Kelinlik ko‘ylak, sarpo, milliy libos"],
  furniture:["Sofas, beds, tables, wardrobes","Диваны, кровати, столы, шкафы","Divan, karavot, stol, shkaf"],
  religious:["Joynamoz, tasbeh, Quran stands","Намазлики, чётки, подставки","Joynamoz, tasbeh, lavh"],
  party:["Balloons, decor, gift boxes","Шары, декор, подарочные коробки","Shar, bezak, sovg‘a qutilari"],
  handmade:["Soap, candles, knitting, suzani","Мыло, свечи, вязание, сюзане","Sovun, sham, to‘qima, so‘zana"],
  bags:["Handbags, backpacks, belts","Сумки, рюкзаки, ремни","Sumka, ryukzak, kamar"],
  jewellery:["Rings, earrings, watches","Кольца, серьги, часы","Uzuk, sirg‘a, soat"],
  kids:["Toys, games, baby care","Игрушки, игры, для малышей","O‘yinchoq, o‘yin, chaqaloq uchun"],
  books:["Books, notebooks, pens","Книги, блокноты, ручки","Kitob, daftar, ruchka"],
  pets:["Pet food, toys, accessories","Корм, игрушки, аксессуары","Yem, o‘yinchoq, aksessuar"],
};
const O2_LI = { en:0, ru:1, uz:2 };

function O2Upload({ id, round, label, initials, tone }){
  const src = usePhoto(id);
  return (
    <button type="button" className={"o2-up"+(round?" round":"")+(src?" has":"")} style={{"--tone":tone}} onClick={()=>pickPhoto(id, round?400:1400)}>
      {src ? <img src={src} alt=""/> : (round ? <b>{initials}</b> : null)}
      <span className="o2-up-l">{I.plus({width:14,height:14})} {label}</span>
    </button>
  );
}

function O2Preview({ d, lang, t, handle }){
  const th = THEMES[d.theme], pal = PALETTE_MAP[d.palette] || PALETTES[0];
  const cover = usePhoto("o2c-"+d.draftId), logo = usePhoto("o2l-"+d.draftId), pimg = usePhoto("o2p-"+d.draftId);
  const tag = d.type ? TYPES[d.type][lang] : "";
  const prods = d.imported ? d.imported.filter((_,i)=>d.impSel.includes(i)) : (d.prod.name ? [{ name:d.prod.name, price:Number(d.prod.price)||0, img:pimg }] : []);
  const ship = "";   // delivery is not part of rastashops
  return (
    <div className="o2-pv" style={{ ...paletteVars(pal), ...th.vars }}>
      <div className="o2-pv-bar"><i></i><i></i><i></i><span>rastashops.com/<b>{handle||"…"}</b></span></div>
      <div className="o2-pv-cover" style={{ background:pal.swatch }}>{cover ? <img src={cover} alt=""/> : <span className="o2-pv-wm">{d.name||"rasta"}</span>}</div>
      <div className="o2-pv-id">
        <span className="o2-pv-av" style={{ background:pal.accent, color:pal.accentInk }}>{logo ? <img src={logo} alt=""/> : initialsFrom(d.name)}</span>
        <div><b>{d.name || t.ob_name_ph}</b><small>{[tag, cityName(d.city,lang)].filter(Boolean).join(" · ")}</small></div>
      </div>
      {(ship || d.pays.length>0) && <div className="o2-pv-chips">{ship && <span>{ship}</span>}{d.pays.length>0 && <span>{d.pays.map(p=>(PAY_METHODS.find(x=>x.id===p)||{label:{}}).label[lang]||p).join(" · ")}</span>}</div>}
      <div className="o2-pv-grid">
        {prods.slice(0,4).map((p,i)=>(
          <div key={i} className="o2-pv-card"><span className="o2-pv-img">{p.img ? <img src={p.img} alt=""/> : null}</span><b>{p.name}</b><small>{p.price? fmtPrice(p.price,lang) : "—"}</small></div>
        ))}
        {prods.length<2 && [0,1].slice(prods.length).map(i=>(<div key={"e"+i} className="o2-pv-card empty"><span className="o2-pv-img"></span><b>{i===0&&!prods.length? t.o2_s2 : "\u00a0"}</b></div>))}
      </div>
    </div>
  );
}

function OnboardingV2({ store, lang, setLang, onCancel, goDashboard, goStore }){
  const t = I18N[lang];
  const saved = React.useMemo(o2Load, []);
  const [ask, setAsk] = React.useState(!!(saved && saved.d && saved.d.phone && !saved.fromClaim));
  const [step, setStep] = React.useState(saved && saved.d && saved.d.phone && !ask ? Math.min(saved.step||0, 1) : 0);
  const [d, setD] = React.useState(()=>{ const x = { ...o2Fresh(), ...((saved && saved.d) || {}) }; if(!x.type && x.types) x.type = x.types[0];
    // the Telegram step is the session: logged in → already done; logged out → it has to be done again
    const a = Api.me && Api.me.account;
    if(a){ x.phone = a.phone; x.tgName = x.tgName || a.name || ""; x.tgUser = x.tgUser || (a.tg||"").replace("@",""); } else { x.phone = ""; }
    return x; });
  const [done, setDone] = React.useState(null);
  const [creating, setCreating] = React.useState(false);
  useHandleChecks();
  const set = (p)=> setD(s=>({ ...s, ...p }));
  React.useEffect(()=>{ if(!done && !ask && (d.phone || d.handle)) try{ localStorage.setItem(O2_KEY, JSON.stringify({ step, d })); }catch(e){} }, [step, d, done, ask]);

  const handle = d.handleEdited ? d.handle : slugify(d.name);
  const hs = handleCheck(store, handle);
  const sizeAttr = o2SizeAttr(d.type);
  const prodOk = d.imported ? d.impSel.length>0 : (d.prod.name.trim().length>=2 && Number(d.prod.price)>0);
  const why = [
    !d.phone ? t.o2_why_tg : null,
    d.name.trim().length<2 ? t.o2_why_name : hs!=="ok" ? t.o2_why_link : !d.type ? t.o2_why_cat : !d.pays.length ? t.o2_why_pay : null,
    prodOk ? null : t.o2_why_prod,
  ][step];

  // "Create my shop": the server makes the shop (id, owner, default branch); photos and the first product follow
  async function publish(withProduct){
    if(creating) return;
    setCreating(true);
    try{ await publishNow(withProduct); }
    catch(e){ toast(Api.errorText(e, lang), "err"); }
    finally{ setCreating(false); }
  }
  async function publishNow(withProduct){
    const pal = PALETTE_MAP[d.palette] || PALETTES[0];
    const shop = { id:handle, handle, name:d.name.trim(), tagline:{ uz:"", ru:"", en:"" }, location:d.city, type:d.type, types:[d.type],
      cover:pal.swatch, rating:5.0, theme:d.theme, palette:d.palette, layout:THEMES[d.theme].layout, font:FONT_FOR[d.theme], initials:initialsFrom(d.name),
      moderation:"pending", cats:{ en:["New"], ru:["Новое"], uz:["Yangi"] }, catIds:[], products:[] };
    const shipTxt = (l)=> d.ship.map(s=>I18N[l]["o2_ship_"+s]).join(" · ");
    const settings = { ...defaultSettings(shop), plan:"starter", planChosen:false, phone:d.phone, trialDays:O2_TRIAL_M*30,
      contacts:{ instagram:"", telegram:d.tgUser||"", phone:d.phone }, botAlerts:d.bot, pickup:"", shipping:d.ship,
      delivery:{ en:shipTxt("en"), ru:shipTxt("ru"), uz:shipTxt("uz") }, payments:d.pays, status: withProduct ? "live" : "draft" };
    const sid = await store.addShop(shop, settings);
    [["o2c-","cover-"],["o2l-","avatar-"]].forEach(([a,b])=>{ const u = PhotoStore.get(a+d.draftId); if(u) PhotoStore.set(b+sid, u); });
    if(withProduct){
      const catId = o2Leaf(d.type);
      const list = d.imported ? d.imported.filter((_,i)=>d.impSel.includes(i)) : [{ ...d.prod, img:PhotoStore.get("o2p-"+d.draftId) }];
      list.forEach((p,i)=>{
        const pid = "p"+Date.now().toString(36)+i, qty = Math.max(0, Number(p.qty)||0);
        const variants = (!d.imported && sizeAttr && p.sizes.length)
          ? p.sizes.map(s=>({ id:pid+"-"+s, options:{ [sizeAttr.id]:s }, barcode:null, qty, avgCost:null }))
          : [{ id:pid+"-default", options:{}, barcode:null, qty: qty||1, avgCost:null }];
        const nm = String(p.name).trim();
        store.saveProduct(sid, { id:pid, catId, specs:{}, name:{ en:nm, ru:nm, uz:nm }, desc:{ en:"", ru:"", uz:"" }, price:Number(p.price)||0,
          tone:pal.swatch, visible:true, photos:4, ai:[], gen:[], sort:i, created:Date.now(), variants })
          .then(()=>{ if(p.img) PhotoStore.set("pi-"+sid+"-"+pid+"-0", p.img); });
      });
    }
    store.login();
    try{ localStorage.removeItem(O2_KEY); localStorage.removeItem(WIZ_KEY); }catch(e){}
    setDone({ live:withProduct });
  }

  if(ask) return (
    <ObShell lang={lang} setLang={setLang} onCancel={onCancel} hideProg>
      <div className="ob-done">
        <h2>{t.o2_resume_t}</h2>
        <div className="ob-url">{I.store({width:16,height:16})} <span>{saved.d.name || ("rastashops.com/"+(saved.d.handle||""))}</span></div>
        <div className="ob-done-cta">
          <button className="btn btn-accent btn-lg" onClick={()=>{ setAsk(false); setStep(Math.min(saved.step||0, 1)); }}>{t.o2_resume_go} {I.arrow({width:17,height:17})}</button>
          <button className="btn btn-ghost btn-lg" onClick={()=>{ try{ localStorage.removeItem(O2_KEY); }catch(e){} setD(o2Fresh()); setStep(0); setAsk(false); }}>{t.o2_resume_new}</button>
        </div>
      </div>
    </ObShell>
  );
  if(done) return <O2Done t={t} lang={lang} setLang={setLang} d={d} handle={handle} live={done.live} goDashboard={goDashboard} goStore={goStore}/>;

  const wide = step>0;
  return (
    <div className="ob o2">
      <div className="ob-top"><div className="brand" style={{cursor:"pointer"}} onClick={onCancel}><Logo/> <BrandName/></div><LangPill lang={lang} setLang={setLang}/></div>
      <div className="ob-card-wrap">
        <div className={"o2-layout"+(wide?" wide":"")}>
          <div className="ob-card">
            <ObProgress steps={[t.o2_s0, t.o2_s1]} cur={step}/>
            <div className="ob-step">
              {step===0 && <O2Telegram t={t} d={d} set={set} onDone={()=>setStep(1)}/>}
              {step===1 && <O2Shop t={t} d={d} set={set} lang={lang} store={store} handle={handle} hs={hs}/>}
              {step===2 && <O2Product t={t} d={d} set={set} lang={lang} sizeAttr={sizeAttr}/>}
            </div>
            {(step>0 || d.phone) && (
              <div className="ob-foot o2-foot">
                {step>0 ? <button className="btn btn-ghost" onClick={()=>setStep(step-1)}>{I.back({width:17,height:17})} {t.ob_back}</button>
                        : <button className="btn btn-ghost" onClick={onCancel}>{t.ob_cancel}</button>}
                <div className="o2-next">
                  {why && <span className="o2-why">{why}</span>}
                  {step<1
                    ? <button className="btn btn-accent" disabled={!!why} onClick={()=>setStep(step+1)}>{t.ob_continue} {I.arrow({width:17,height:17})}</button>
                    : <button className="btn btn-accent" disabled={!!why} onClick={()=>publish(false)}>{I.check({width:17,height:17})} {t.ob_create_shop}</button>}
                </div>
              </div>
            )}
          </div>
          {wide && <aside className="o2-side"><O2Preview d={d} lang={lang} t={t} handle={handle}/></aside>}
        </div>
      </div>
    </div>
  );
}

function O2Telegram({ t, d, set, onDone }){
  if(!d.phone) return <AuthFlow t={t} title={t.o2_tg_t} sub={t.o2_tg_d} onDone={(phone, tg)=>{ set({ phone, tgName:(tg&&tg.name)||"", tgUser:(tg&&tg.username)||"" }); }}/>;
  return (
    <div>
      <div className="ob-head"><h2>{t.o2_bot_t}</h2><p>{t.o2_bot_d}</p></div>
      <div className="verified-row">
        <span className="tg-mark">{TG_I.logo({width:30,height:30})}</span>
        <b>{d.tgName? d.tgName+" · " : ""}{d.phone}{d.tgUser && <small className="o2-sub">@{d.tgUser}</small>}</b>
        <button className="lnk" onClick={()=>set({ phone:"", tgName:"", tgUser:"" })}>{t.au_edit}</button>
      </div>
      <label className="o2-toggle">
        <input type="checkbox" checked={d.bot} onChange={e=>set({ bot:e.target.checked })}/>
        <span className="o2-sw"></span>
        <span><b>{fill(t.o2_bot_on,{ u:d.tgUser||"telegram" })}</b>{!d.bot && <small>{t.o2_bot_off}</small>}</span>
      </label>
      <div className={"o2-tgmsg"+(d.bot?"":" off")}>
        <span className="tg-bav">r</span>
        <div className="o2-tgmsg-b"><b>{t.o2_msg}</b><span>{t.o2_msg_d}</span>
          <div className="o2-tgmsg-acts"><span>{t.o2_confirm}</span><span>{t.o2_cancel}</span></div></div>
      </div>
    </div>
  );
}

function O2Chips({ items, on, onToggle, multi=true }){
  return <div className="ob-cats">{items.map(([id,lab])=>(<button key={id} type="button" className={"ob-cat"+(on.includes(id)?" on":"")} aria-pressed={on.includes(id)} onClick={()=>onToggle(id)}>{lab}</button>))}</div>;
}
const o2Tog = (arr, id, max)=> arr.includes(id) ? arr.filter(x=>x!==id) : (max && arr.length>=max ? arr : [...arr, id]);

function O2Shop({ t, d, set, lang, store, handle, hs }){
  const pal = PALETTE_MAP[d.palette] || PALETTES[0];
  const sugg = hs==="taken"||hs==="reserved" ? handleSuggest(store, handle) : [];
  return (
    <div>
      <div className="ob-head"><h2>{t.o2_shop_t}</h2><p>{t.o2_shop_d}</p></div>
      <div className="field"><label htmlFor="o2-name">{t.st_shop_name}</label><input id="o2-name" value={d.name} onChange={e=>set({ name:e.target.value })} placeholder={t.ob_name_ph} autoFocus/></div>
      <div className="field"><label htmlFor="o2-h">{t.ob_handle}</label>
        <div className={"ob-handle"+(hs==="taken"||hs==="reserved"?" bad":"")}>
          <span className="ob-handle-pre">rastashops.com/</span>
          <input id="o2-h" value={handle} onChange={e=>set({ handle:slugify(e.target.value), handleEdited:true })} placeholder="myshop"/>
          {hs!=="empty" && <span className={"ob-avail"+(hs==="ok"?"":" no")}>{hs==="ok"? I.check({width:14,height:14}) : I.x({width:14,height:14})} {hs==="ok"? t.o2_free : hs==="taken"? t.o2_taken : hs==="reserved"? t.o2_reserved : t.o2_short}</span>}
        </div>
        {sugg.length>0 ? <div className="o2-sugg">{t.o2_try} {sugg.map(s=><button key={s} type="button" onClick={()=>set({ handle:s, handleEdited:true })}>{s}</button>)}</div>
          : <div className="hint">{t.o2_link_hint}</div>}
      </div>
      <div className="field"><label>{t.o2_cats}</label><div className="hint o2-hint-top">{t.o2_cats_d}</div>
        <div className="o2-types" role="radiogroup" aria-label={t.o2_cats}>
          {O2_TYPES.map(k=>(
            <button key={k} type="button" role="radio" aria-checked={d.type===k} className={"o2-type"+(d.type===k?" on":"")} onClick={()=>set({ type:k, prod:{ ...d.prod, sizes:[] } })}>
              <b>{TYPES[k][lang]}</b><small>{O2_EX[k][O2_LI[lang]]}</small>
              {d.type===k && <span className="o2-type-ck">{I.check({width:12,height:12})}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="field"><label htmlFor="o2-city">{t.ob_city}</label>
        <select id="o2-city" value={d.city} onChange={e=>set({ city:e.target.value })}>{UZ_CITIES.map(c=><option key={c} value={c}>{cityName(c,lang)}</option>)}</select></div>
      <div className="field"><label>{t.o2_look}</label>
        <div className="ob-looks">
          {Object.keys(THEMES).map(id=>{ const th=THEMES[id], p=PALETTE_MAP[d.paletteEdited? d.palette : th.defaultPalette];
            return <button key={id} type="button" className={"ob-look"+(d.theme===id?" on":"")} onClick={()=>set({ theme:id, palette:d.paletteEdited? d.palette : th.defaultPalette })}>
              <span className="ob-look-pv" style={{ background:p.bg, color:p.ink, fontFamily:th.vars["--s-font-display"] }}>Aa</span><span>{th.name[lang]}</span></button>; })}
        </div>
        <div className="ob-sws o2-sws">{PALETTES.map(p=>(<button key={p.id} type="button" className={"ob-sw"+(d.palette===p.id?" on":"")} title={p.name[lang]} aria-label={p.name[lang]} style={{ background:p.accent }} onClick={()=>set({ palette:p.id, paletteEdited:true })}></button>))}</div>
      </div>
      <div className="field"><label>{t.o2_photos}</label>
        <div className="o2-ups">
          <O2Upload id={"o2c-"+d.draftId} label={t.o2_up_cover} tone={pal.swatch}/>
          <O2Upload id={"o2l-"+d.draftId} round label={t.o2_up_logo} initials={initialsFrom(d.name)} tone={pal.accent}/>
        </div>
        <div className="hint">{t.o2_photos_d}</div>
      </div>
      <div className="field"><label>{t.o2_pay}</label>
        <O2Chips items={PAY_METHODS.map(p=>[p.id, p.label[lang]])} on={d.pays} onToggle={k=>set({ pays:o2Tog(d.pays,k) })}/>
      </div>
    </div>
  );
}

function O2Product({ t, d, set, lang, sizeAttr }){
  const [busy, setBusy] = React.useState(false);
  const p = d.prod, sp = (x)=> set({ prod:{ ...p, ...x } });
  function doImport(){
    setBusy(true);
    setTimeout(()=>{
      const st = window.__shopStore;
      const prods = (id)=> st? st.products(id) : ((SHOPS[id]||{}).products||[]);
      const src = SHOP_ORDER.find(id=>SHOPS[id] && SHOPS[id].type===d.type && prods(id).length) || SHOP_ORDER[0];
      const list = (src? prods(src) : []).slice(0,4).map(x=>({ name:textFB(x.name,lang), price:x.price, qty:1 }));
      set({ imported:list, impSel:list.map((_,i)=>i) }); setBusy(false);
    }, 1000);
  }
  return (
    <div>
      <div className="ob-head"><h2>{t.o2_prod_t}</h2><p>{t.o2_prod_d}</p></div>
      {!d.imported && (
        <button type="button" className="o2-import" onClick={doImport} disabled={busy}>
          <span className="o2-import-ic">{busy? <span className="tg-spin"></span> : I.spark({width:18,height:18})}</span>
          <span><b>{busy? t.o2_importing : t.o2_import}</b><small>{t.o2_import_d}</small></span>{I.arrow({width:16,height:16})}
        </button>
      )}
      {d.imported ? (
        <div className="o2-imp">
          <div className="o2-imp-h"><span>{fill(t.o2_imported,{ n:d.imported.length })}</span><button type="button" className="lnk" onClick={()=>set({ imported:null, impSel:[] })}>{t.o2_or}</button></div>
          {d.imported.map((x,i)=>(
            <label key={i} className="o2-imp-row"><input type="checkbox" checked={d.impSel.includes(i)} onChange={()=>set({ impSel:o2Tog(d.impSel,i) })}/>
              <b>{x.name}</b><span>{fmtPrice(x.price,lang)}</span></label>
          ))}
        </div>
      ) : (
        <>
          <div className="ob-divider">{t.o2_or}</div>
          <div className="o2-prod">
            <O2Upload id={"o2p-"+d.draftId} label={t.o2_photo}/>
            <div className="o2-prod-f">
              <div className="field"><label htmlFor="o2-pn">{t.o2_pname}</label><input id="o2-pn" value={p.name} onChange={e=>sp({ name:e.target.value })} placeholder={t.o2_pname_ph}/></div>
              <div className="field-row">
                <div className="field"><label htmlFor="o2-pp">{t.o2_price}</label><input id="o2-pp" inputMode="numeric" value={p.price? fmtNum(Number(p.price)) : ""} onChange={e=>sp({ price:e.target.value.replace(/\D/g,"").slice(0,10) })} placeholder="250 000"/></div>
                <div className="field"><label htmlFor="o2-pq">{t.o2_qty}{sizeAttr && p.sizes.length? " · "+(/size/.test(sizeAttr.id)? t.o2_qty_each : t.o2_qty_opt) : ""}</label><input id="o2-pq" inputMode="numeric" value={p.qty} onChange={e=>sp({ qty:e.target.value.replace(/\D/g,"").slice(0,4) })}/></div>
              </div>
            </div>
          </div>
          {sizeAttr && (
            <div className="field"><label>{sizeAttr.name? sizeAttr.name[lang] : t.o2_sizes}</label>
              <O2Chips items={sizeAttr.values.map(v=>[v.id, attrValueName(sizeAttr.id, v.id, lang)])} on={p.sizes} onToggle={k=>sp({ sizes:o2Tog(p.sizes,k) })}/>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function O2Done({ t, lang, setLang, d, handle, live, goDashboard, goStore }){
  const [tapped, setTapped] = React.useState(null);
  const url = "rastashops.com/"+handle;
  const end = (()=>{ const x=new Date(); x.setMonth(x.getMonth()+O2_TRIAL_M); return x.toLocaleDateString(lang==="ru"?"ru-RU":lang==="uz"?"uz-UZ":"en-GB",{ day:"numeric", month:"long", year:"numeric" }); })();
  const copy = ()=>{ try{ navigator.clipboard.writeText("https://"+url); }catch(e){} typeof toast==="function" && toast(t.o2_copied); };
  const todo = [[t.o2_td_prod, live], [t.o2_td_bot, d.bot], [t.o2_td_bozor, false]];
  return (
    <ObShell lang={lang} setLang={setLang} onCancel={null} hideProg>
      <div className="ob-done o2-done">
        <div className="ob-done-ic">{I.check({width:38,height:38})}</div>
        <h2>{live? t.o2_live_t : t.o2_hidden_t}</h2>
        <p>{live? t.o2_live_d : t.o2_hidden_d}</p>
        <div className="o2-link"><span>{url}</span><button type="button" className="btn btn-soft btn-sm" onClick={copy}>{t.o2_copy}</button></div>
        <div className="ob-done-cta">
          {live
            ? <a className="btn btn-accent btn-lg" href={"https://t.me/share/url?url="+encodeURIComponent("https://"+url)+"&text="+encodeURIComponent(d.name)} target="_blank" rel="noopener">{TG_I.plane({width:18,height:18})} {t.o2_share_tg}</a>
            : <button className="btn btn-accent btn-lg" onClick={goDashboard}>{I.plus({width:18,height:18})} {t.o2_td_prod}</button>}
          <button className="btn btn-ghost btn-lg" onClick={live? goStore : goDashboard}>{live? <>{I.eye({width:17,height:17})} {t.o2_open}</> : t.o2_dash}</button>
        </div>
        {d.bot && (
          <div className="o2-test">
            <div className="o2-test-h">{TG_I.logo({width:18,height:18})} {t.o2_test_t}</div>
            <div className="o2-tgmsg"><span className="tg-bav">r</span>
              <div className="o2-tgmsg-b"><b>{t.o2_msg}</b><span>{t.o2_msg_d}</span>
                {tapped ? <div className="o2-tgmsg-ok">{I.check({width:14,height:14})} {t.o2_test_ok}</div>
                  : <div className="o2-tgmsg-acts"><button type="button" onClick={()=>setTapped("c")}>{t.o2_confirm}</button><button type="button" onClick={()=>setTapped("x")}>{t.o2_cancel}</button></div>}
              </div></div>
          </div>
        )}
        <div className="o2-todo">
          <b>{t.o2_todo}</b>
          {todo.map(([lab,ok],i)=>(<div key={i} className={"o2-todo-r"+(ok?" ok":"")}><span>{ok? I.check({width:13,height:13}) : null}</span>{lab}</div>))}
        </div>
        <div className="o2-trial"><b>{fill(t.o2_trial,{ m:O2_TRIAL_M, d:end })}</b><span>{t.o2_trial_d}</span></div>
        {live && <button className="lnk o2-dashlnk" onClick={goDashboard}>{t.o2_dash} {I.arrow({width:14,height:14})}</button>}
      </div>
    </ObShell>
  );
}

Object.assign(window, { OnboardingV2, handleCheck, handleSuggest, O2_KEY, O2_TRIAL_M, cityName });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { O2_KEY, O2_TRIAL_M, O2_RESERVED, O2_CITY, cityName, handleCheck, handleSuggest, o2Fresh, o2Load, o2Leaf, o2SizeAttr, O2_TYPES, O2_EX, O2_LI, O2Upload, O2Preview, OnboardingV2, O2Telegram, O2Chips, o2Tog, O2Shop, O2Product, O2Done });
