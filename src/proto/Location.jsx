// ===== Shop location: data helpers, storefront card, settings editor =====
Object.assign(I18N.en, { loc_title:"Location", loc_visit:"Visit us", loc_landmark:"Landmark", loc_online:"Online only — delivery, no walk-in shop", loc_open_y:"Yandex Maps", loc_open_g:"Google Maps", loc_copy:"Copy address", loc_copied:"Address copied",
  loc_set_t:"Shop location", loc_set_d:"Where customers can find you or pick up orders. Shown on your shop and link in bio.",
  loc_has:"I have a shop or pickup point", loc_address:"Address", loc_address_ph:"Street, building", loc_landmark_ph:"e.g. next to Korzinka, opposite the metro", loc_pin:"Map pin", loc_paste:"Paste a Google or Yandex Maps link", loc_here:"Use my location", loc_pin_ok:"Pin updated", loc_pin_bad:"Couldn't read a location from that link", loc_city_pin:"Pin is at the city centre — paste a map link or use your location for the exact spot" });
Object.assign(I18N.ru, { loc_title:"Адрес", loc_visit:"Приходите к нам", loc_landmark:"Ориентир", loc_online:"Только онлайн — доставка, без магазина", loc_open_y:"Яндекс Карты", loc_open_g:"Google Карты", loc_copy:"Скопировать адрес", loc_copied:"Адрес скопирован",
  loc_set_t:"Адрес магазина", loc_set_d:"Где вас найти или забрать заказ. Показывается в магазине и ссылке для био.",
  loc_has:"У меня есть магазин или пункт выдачи", loc_address:"Адрес", loc_address_ph:"Улица, дом", loc_landmark_ph:"напр. рядом с Korzinka, напротив метро", loc_pin:"Точка на карте", loc_paste:"Вставьте ссылку Google или Яндекс Карт", loc_here:"Моё местоположение", loc_pin_ok:"Точка обновлена", loc_pin_bad:"Не удалось найти координаты в ссылке", loc_city_pin:"Точка в центре города — вставьте ссылку на карту или используйте своё местоположение" });
Object.assign(I18N.uz, { loc_title:"Manzil", loc_visit:"Bizga keling", loc_landmark:"Mo\u02bcljal", loc_online:"Faqat onlayn — yetkazib berish, do\u02bckon yo\u02bcq", loc_open_y:"Yandex Xarita", loc_open_g:"Google Xarita", loc_copy:"Manzilni nusxalash", loc_copied:"Manzil nusxalandi",
  loc_set_t:"Do\u02bckon manzili", loc_set_d:"Mijozlar sizni qayerda topishi yoki buyurtmani olib ketishi mumkin. Do\u02bckon va bio havolada ko\u02bcrinadi.",
  loc_has:"Do\u02bckonim yoki olib ketish punktim bor", loc_address:"Manzil", loc_address_ph:"Ko\u02bccha, uy", loc_landmark_ph:"masalan, Korzinka yonida, metro qarshisida", loc_pin:"Xaritadagi nuqta", loc_paste:"Google yoki Yandex xarita havolasini qo\u02bcying", loc_here:"Joylashuvim", loc_pin_ok:"Nuqta yangilandi", loc_pin_bad:"Havoladan joylashuv topilmadi", loc_city_pin:"Nuqta shahar markazida — xarita havolasini qo\u02bcying yoki joylashuvingizdan foydalaning" });

const CITY_GEO = { Tashkent:[41.2995,69.2401], Samarkand:[39.6542,66.9597], Bukhara:[39.7747,64.4286], Andijan:[40.7821,72.3442], Namangan:[40.9983,71.6726], Fergana:[40.3842,71.7843], Nukus:[42.4600,59.6166], Qarshi:[38.8606,65.7890] };
const PLACE_SEED = {
  lola:     { has:true,  address:"Amir Temur ko\u02bbchasi, 107B", landmark:"Minor masjidi yonida", lat:41.3386, lng:69.2855 },
  choyxona: { has:true,  address:"Registon ko\u02bbchasi, 12", landmark:"Registon maydoni yaqinida", lat:39.6548, lng:66.9757 },
  gulnoza:  { has:true,  address:"Shota Rustaveli ko\u02bbchasi, 41", landmark:"Korzinka qarshisida", lat:41.2856, lng:69.2567 },
  silkroad: { has:true,  address:"Toqi Zargaron, savdo gumbazi", landmark:"Poi Kalon yonida", lat:39.7765, lng:64.4150 },
  bahor:    { has:false },
  kicks:    { has:true,  address:"Mustaqillik shoh ko\u02bbchasi, 59", landmark:"Parkent bozori yonida", lat:41.3230, lng:69.3265 },
};
function shopPlace(st, shopId){
  const base = st.place || PLACE_SEED[shopId] || { has:false };
  const c = CITY_GEO[st.city] || CITY_GEO.Tashkent;
  const lat = base.lat!=null? base.lat : c[0], lng = base.lng!=null? base.lng : c[1];
  return { has:!!base.has, address:base.address||"", landmark:base.landmark||"", lat, lng, exact: base.lat!=null };
}
function mapLinks(pl){
  return {
    y:"https://yandex.uz/maps/?pt="+pl.lng+","+pl.lat+"&z=17&l=map",
    g:"https://www.google.com/maps/search/?api=1&query="+pl.lat+","+pl.lng,
    embed:"https://www.openstreetmap.org/export/embed.html?bbox="+(pl.lng-0.006)+","+(pl.lat-0.0035)+","+(pl.lng+0.006)+","+(pl.lat+0.0035)+"&layer=mapnik&marker="+pl.lat+","+pl.lng,
  };
}
function parseMapLink(s){
  s = decodeURIComponent(s||"");
  let m;
  if((m = s.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/))) return [+m[1], +m[2]];
  if((m = s.match(/[?&](?:q|query|ll|center)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/)) && /google/.test(s)) return [+m[1], +m[2]];
  if((m = s.match(/[?&](?:pt|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/))) return [+m[2], +m[1]];
  if((m = s.match(/(-?\d{1,2}\.\d{3,}),\s*(-?\d{1,3}\.\d{3,})/))) return [+m[1], +m[2]];
  return null;
}
const LOC_I = {
  pin:(p)=> <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.7"/></svg>,
  nav:(p)=> <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M20 4 4 10.5l6.5 2.5L13 20l7-16Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
};

function SfLocation({ shop, t, compact }){
  const pl = shop.place;
  if(!pl) return null;
  if(!pl.has) return <div className="sf-info sf-loc-online"><span>{LOC_I.pin({width:16,height:16})} {shop.location} · {t.loc_online}</span></div>;
  const L = mapLinks(pl);
  const full = [pl.address, shop.location].filter(Boolean).join(", ");
  const copy = ()=>{ try{ navigator.clipboard.writeText(full+(pl.landmark? " ("+pl.landmark+")" : "")); }catch(e){} typeof toast==="function" && toast(t.loc_copied); };
  return (
    <div className="sf-loc">
      {!compact && (
        <a className="sf-loc-map" href={L.y} target="_blank" rel="noopener">
          <iframe title="map" src={L.embed} loading="lazy" tabIndex={-1}></iframe>
        </a>
      )}
      <div className="sf-loc-body">
        <div className="sf-sizes-label sf-up">{t.loc_visit}</div>
        <b className="sf-loc-addr">{full}</b>
        {pl.landmark && <span className="sf-loc-lm">{t.loc_landmark}: {pl.landmark}</span>}
        <div className="sf-loc-acts">
          <a className="sf-btn sf-btn-accent" href={L.y} target="_blank" rel="noopener">{LOC_I.nav({width:16,height:16})} {t.loc_open_y}</a>
          <a className="sf-btn sf-btn-line" href={L.g} target="_blank" rel="noopener">{t.loc_open_g}</a>
          <button className="sf-btn sf-btn-line sf-btn-icon" onClick={copy} title={t.loc_copy} aria-label={t.loc_copy}>{I.copy({width:16,height:16})}</button>
        </div>
      </div>
    </div>
  );
}

function LocationSettings({ d, set, shopId, t }){
  const pl = shopPlace(d, shopId);
  const [link, setLink] = React.useState("");
  const put = (p)=> set({ place:{ has:pl.has, address:pl.address, landmark:pl.landmark, lat: pl.exact? pl.lat : undefined, lng: pl.exact? pl.lng : undefined, ...p } });
  function applyLink(v){
    setLink(v);
    if(!v.trim()) return;
    const ll = parseMapLink(v);
    if(ll){ put({ lat:ll[0], lng:ll[1] }); toast(t.loc_pin_ok); setLink(""); }
  }
  function here(){
    if(!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(p=>{ put({ lat:+p.coords.latitude.toFixed(6), lng:+p.coords.longitude.toFixed(6) }); toast(t.loc_pin_ok); }, ()=>{});
  }
  const L = mapLinks(pl);
  return (
    <div className="set-card">
      <div className="set-title">{t.loc_set_t}</div>
      <div className="hint" style={{marginTop:-6}}>{t.loc_set_d}</div>
      <label className="rsm-check" style={{marginTop:4}}><input type="checkbox" checked={pl.has} onChange={e=>put({has:e.target.checked})}/> {t.loc_has}</label>
      {pl.has && (
        <React.Fragment>
          <div className="field-row">
            <div className="field"><label>{t.loc_address}</label><input value={pl.address} placeholder={t.loc_address_ph} onChange={e=>put({address:e.target.value})}/></div>
            <div className="field"><label>{t.loc_landmark}</label><input value={pl.landmark} placeholder={t.loc_landmark_ph} onChange={e=>put({landmark:e.target.value})}/></div>
          </div>
          <div className="field">
            <label>{t.loc_pin}</label>
            <div className="loc-set-map"><iframe title="map" src={L.embed} loading="lazy"></iframe></div>
            {!pl.exact && <div className="hint">{I.warn({width:13,height:13})} {t.loc_city_pin}</div>}
            <div className="loc-set-row">
              <input value={link} placeholder={t.loc_paste} onChange={e=>applyLink(e.target.value)} onBlur={()=>{ if(link.trim() && !parseMapLink(link)) toast(t.loc_pin_bad); }}/>
              <button className="btn btn-soft btn-sm" onClick={here}>{LOC_I.nav({width:15,height:15})} {t.loc_here}</button>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

Object.assign(window, { shopPlace, mapLinks, parseMapLink, SfLocation, LocationSettings, LOC_I, CITY_GEO });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { CITY_GEO, PLACE_SEED, shopPlace, mapLinks, parseMapLink, LOC_I, SfLocation, LocationSettings });
