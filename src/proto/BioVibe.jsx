// ===== Link in bio — bold "vivid" templates: own layouts, decoration, motion =====
Object.assign(I18N.en, { st_bio_classic:"Classic", st_bio_vivid:"Bold & vivid", vb_new:"New", vb_scroll:"Popular now" });
Object.assign(I18N.ru, { st_bio_classic:"Классические", st_bio_vivid:"Яркие", vb_new:"Новое", vb_scroll:"Популярное" });
Object.assign(I18N.uz, { st_bio_classic:"Klassik", st_bio_vivid:"Yorqin", vb_new:"Yangi", vb_scroll:"Ommabop" });

const VIBE_LAYOUTS = ["bento","sticker","marquee","aurora","ikat","scrap","os","receipt","chat","ticket","player","cover"];
const vArrow = (s)=> I.arrow({width:s||18,height:s||18});

function VImg({ d, shopId, p, i, w, h }){
  return <ImageSlot id={pslot(shopId,p,0)} src={photoURL(p.tone, pslot(shopId,p,0), w||300, h||375, d.kw, i)} placeholder={textFB(p.name,"en").toLowerCase()} style={FILL}/>;
}
function VSquareAvatar({ d, shopId }){
  return <ImageSlot id={"avatar-"+shopId} src={photoURL(getPalette(d.cfgTheme).swatch, "avatar-"+shopId, 240,240, d.kw, 3)} placeholder={d.meta.initials} style={FILL}/>;
}

function BioVibe({ layout, d, shopId, lang, onOpenShop, tagline, cls, style }){
  const name = d.st.name, meta = d.st.city+" · "+TYPES[d.st.type][lang];
  const shop = d.links.find(l=>l.big), rest = d.links.filter(l=>!l.big);
  const nm = (p)=> textFB(p.name, lang);
  const page = (kids, extra)=> <div className={cls+" bio-v-"+layout+(extra||"")} style={style}>{kids}</div>;

  if(layout==="bento") return page(
    <div className="bio-card">
      <div className="vb-grid">
        <div className="vb-tile vb-id">
          <BioAvatar d={d} shopId={shopId} size={68}/>
          <div className="vb-id-tx"><h1 className="bio-name">{name}</h1>{tagline && <p>{tagline}</p>}<span>{LOC_I.pin({width:13,height:13})} {meta}</span></div>
        </div>
        {shop && (
          <button className="vb-tile vb-shop" onClick={shop.go}>
            <span className="vb-shop-img">{d.prods[0]? <VImg d={d} shopId={shopId} p={d.prods[0]} i={0} w={600} h={420}/> : <BioCover d={d} shopId={shopId} cls="vb-fill"/>}</span>
            <span className="vb-shop-tx"><i>rastashops.com/{d.st.handle}</i><b>{shop.lab}</b></span>
            <span className="vb-go">{vArrow(22)}</span>
          </button>
        )}
        {rest.map((l,i)=>(
          <button key={l.key} className={"vb-tile vb-link vb-c"+(i%3+1)+(rest.length%2 && i===rest.length-1? " wide":"")} onClick={l.go}>
            <span className="vb-ic">{l.ic({width:22,height:22})}</span>
            <span className="vb-lt"><b>{l.lab}</b><small>{l.sub}</small></span>
            <span className="vb-arr">↗</span>
          </button>
        ))}
        {d.prods.map((p,i)=>(
          <button key={p.id} className="vb-tile vb-prod" onClick={onOpenShop}>
            <span className="vb-pimg"><VImg d={d} shopId={shopId} p={p} i={i}/><em>{d.priceStr(p.price)}</em></span>
            <span className="vb-pn">{nm(p)}</span>
          </button>
        ))}
      </div>
      <BioFoot d={d}/>
    </div>
  );

  if(layout==="sticker") return page(
    <div className="bio-card">
      <div className="vs-head">
        <div className="vs-av"><BioAvatar d={d} shopId={shopId} size={112}/><span className="vs-star"><b>{d.st.city}</b></span></div>
        <h1 className="vs-name">{name}</h1>
        {tagline && <p className="vs-tag">{tagline}</p>}
      </div>
      <div className="vs-links">
        {shop && <button className="vs-btn vs-shop" onClick={shop.go}><span className="vs-ic">{shop.ic({width:24,height:24})}</span><span className="vs-lt"><b>{shop.lab}</b><small>{shop.sub}</small></span><span className="vs-go">{vArrow(22)}</span></button>}
        {rest.map((l,i)=>(
          <button key={l.key} className={"vs-btn vs-c"+(i%3+1)} style={{"--rot":(i%2? 1.3 : -1.5)+"deg"}} onClick={l.go}>
            <span className="vs-ic">{l.ic({width:21,height:21})}</span><span className="vs-lt"><b>{l.lab}</b><small>{l.sub}</small></span>
          </button>
        ))}
      </div>
      {d.prods.length>0 && <div className="vs-h">{d.t.vb_scroll} ↓</div>}
      <div className="vs-prods">
        {d.prods.map((p,i)=>(
          <button key={p.id} className="vs-prod" style={{"--rot":[-3,2.4,2,-2.6][i%4]+"deg"}} onClick={onOpenShop}>
            <span className="vs-pimg"><VImg d={d} shopId={shopId} p={p} i={i}/></span>
            <span className="vs-pn">{nm(p)}</span>
            <span className="vs-price">{d.priceStr(p.price)}</span>
          </button>
        ))}
      </div>
      <BioFoot d={d}/>
    </div>
  );

  if(layout==="marquee"){
    const txt = (name+" ★ "+d.st.city+" ★ "+d.t.bio_open_shop+" ★ ").toUpperCase();
    const Marq = ({b})=> <div className={"vm-marq"+(b?" b":"")}><div className="vm-track">{[0,1,2,3,4,5].map(i=><span key={i}>{txt}</span>)}</div></div>;
    return page(<React.Fragment>
      <Marq/>
      <div className="bio-card">
        <div className="vm-top"><BioAvatar d={d} shopId={shopId} size={54}/><span>{meta}</span></div>
        <h1 className="vm-name">{name}</h1>
        {tagline && <p className="vm-tag">{tagline}</p>}
        <div className="vm-rows">
          {d.links.map((l,i)=>(
            <button key={l.key} className={"vm-row"+(l.big?" big":"")} onClick={l.go}>
              <span className="vm-n">{String(i+1).padStart(2,"0")}</span>
              <span className="vm-lab"><b>{l.lab}</b><small>{l.sub}</small></span>
              <span className="vm-go">{vArrow(28)}</span>
            </button>
          ))}
        </div>
        {d.prods.length>0 && (
          <div className="vm-prods">
            {d.prods.map((p,i)=>(
              <button key={p.id} className="vm-prod" onClick={onOpenShop}>
                <span className="vm-pimg"><VImg d={d} shopId={shopId} p={p} i={i}/></span>
                <span className="vm-price">{d.priceStr(p.price)}</span>
                <b>{nm(p)}</b>
              </button>
            ))}
          </div>
        )}
        <BioFoot d={d}/>
      </div>
      <Marq b/>
    </React.Fragment>);
  }

  if(layout==="aurora") return page(<React.Fragment>
    <span className="va-blob a"></span><span className="va-blob b"></span><span className="va-blob c"></span>
    <div className="bio-card va-glass">
      <div className="va-head">
        <span className="va-ring"><BioAvatar d={d} shopId={shopId} size={92}/></span>
        <h1 className="va-name">{name}</h1>
        {tagline && <p className="va-tag">{tagline}</p>}
        <span className="va-meta">{meta}</span>
      </div>
      <div className="va-links">
        {shop && <button className="va-btn va-shop" onClick={shop.go}><span className="va-ic">{shop.ic({width:22,height:22})}</span><span className="va-lt"><b>{shop.lab}</b><small>{shop.sub}</small></span>{vArrow(20)}</button>}
        {rest.map(l=>(
          <button key={l.key} className="va-btn" onClick={l.go}><span className="va-ic">{l.ic({width:19,height:19})}</span><span className="va-lt"><b>{l.lab}</b><small>{l.sub}</small></span>{vArrow(16)}</button>
        ))}
      </div>
      {d.prods.length>0 && (
        <div className="va-prods">
          {d.prods.map((p,i)=>(
            <button key={p.id} className="va-prod" onClick={onOpenShop}>
              <span className="va-pimg"><VImg d={d} shopId={shopId} p={p} i={i}/></span>
              <span className="va-pn">{nm(p)}</span><span className="va-pp">{d.priceStr(p.price)}</span>
            </button>
          ))}
        </div>
      )}
      <BioFoot d={d}/>
    </div>
  </React.Fragment>);

  if(layout==="ikat") return page(<React.Fragment>
    <div className="vi-band"></div>
    <div className="bio-card">
      <div className="vi-head">
        <BioCover d={d} shopId={shopId} cls="vi-arch"/>
        <div className="vi-orn"><i></i><i className="m"></i><i></i></div>
        <h1 className="vi-name">{name}</h1>
        {tagline && <p className="vi-tag">{tagline}</p>}
        <span className="vi-meta">{meta}</span>
      </div>
      <div className="vi-links">
        {d.links.map(l=>(
          <button key={l.key} className={"vi-btn"+(l.big?" vi-shop":"")} onClick={l.go}>
            <span className="vi-ic">{l.ic({width:20,height:20})}</span><span className="vi-lt"><b>{l.lab}</b><small>{l.sub}</small></span>{vArrow(16)}
          </button>
        ))}
      </div>
      {d.prods.length>0 && (
        <React.Fragment>
          <div className="vi-h"><i></i>{d.t.bio_featured}<i></i></div>
          <div className="vi-prods">
            {d.prods.map((p,i)=>(
              <button key={p.id} className="vi-prod" onClick={onOpenShop}>
                <span className="vi-pimg"><VImg d={d} shopId={shopId} p={p} i={i}/></span>
                <span className="vi-pn">{nm(p)}</span><span className="vi-pp">{d.priceStr(p.price)}</span>
              </button>
            ))}
          </div>
        </React.Fragment>
      )}
      <BioFoot d={d}/>
    </div>
    <div className="vi-band"></div>
  </React.Fragment>);

  if(layout==="scrap") return page(
    <div className="bio-card">
      <div className="vp-head">
        <span className="vp-pol"><span className="vp-tape"></span><span className="vp-ph"><VSquareAvatar d={d} shopId={shopId}/></span><span className="vp-cap">{d.st.city}</span></span>
        <h1 className="vp-name"><span>{name}</span></h1>
        {tagline && <p className="vp-tag">{tagline}</p>}
      </div>
      <div className="vp-links">
        {shop && <button className="vp-note vp-shop" style={{"--rot":"-1.2deg"}} onClick={shop.go}><span className="vp-ic">{shop.ic({width:24,height:24})}</span><span className="vp-lt"><b>{shop.lab}</b><small>{shop.sub}</small></span>{vArrow(22)}</button>}
        {rest.map((l,i)=>(
          <button key={l.key} className="vp-note" style={{"--rot":(i%2? -.9 : 1.1)+"deg"}} onClick={l.go}><span className="vp-ic">{l.ic({width:20,height:20})}</span><span className="vp-lt"><b>{l.lab}</b><small>{l.sub}</small></span></button>
        ))}
      </div>
      {d.prods.length>0 && <div className="vp-h">{d.t.vb_scroll} ↓</div>}
      <div className="vp-wall">
        {d.prods.map((p,i)=>(
          <button key={p.id} className="vp-pp" style={{"--rot":[-3.5,2.5,2,-2.5][i%4]+"deg"}} onClick={onOpenShop}>
            <span className="vp-tape sm"></span>
            <span className="vp-pimg"><VImg d={d} shopId={shopId} p={p} i={i}/></span>
            <span className="vp-pn">{nm(p)}</span><span className="vp-price">{d.priceStr(p.price)}</span>
          </button>
        ))}
      </div>
      <BioFoot d={d}/>
    </div>
  );
  return <BioConcept layout={layout} d={d} shopId={shopId} lang={lang} onOpenShop={onOpenShop} tagline={tagline} page={page}/>;
}

// structural mini previews
function VibeThumb({ L, c }){
  const base = "bio-thumb vt vt-"+L;
  const st = bioVars(c);
  if(L==="bento") return <span className={base} style={st}><span className="vtb"><i className="id"></i><i className="sh"></i><i className="c1"></i><i className="c2"></i><i className="c3"></i><i className="p"></i></span></span>;
  if(L==="sticker") return <span className={base} style={st}><span className="vts-av"></span><span className="vts-nm"></span><i className="vts-b sh"></i><i className="vts-b c1"></i><i className="vts-b c2"></i><i className="vts-b c3"></i></span>;
  if(L==="marquee") return <span className={base} style={st}><span className="vtm-m"></span><span className="vtm-nm"></span><span className="vtm-nm s"></span><i className="vtm-r big"></i><i className="vtm-r"></i><i className="vtm-r"></i><span className="vtm-m b"></span></span>;
  if(L==="aurora") return <span className={base} style={st}><i className="vta-b a"></i><i className="vta-b b"></i><i className="vta-b c"></i><span className="vta-g"><span className="vta-av"></span><span className="vta-nm"></span><i className="vta-btn sh"></i><i className="vta-btn"></i><i className="vta-btn"></i></span></span>;
  if(L==="ikat") return <span className={base} style={st}><span className="vti-band"></span><span className="vti-arch"></span><span className="vti-nm"></span><i className="vti-btn sh"></i><i className="vti-btn"></i><span className="vti-band bt"></span></span>;
  if(L==="scrap") return <span className={base} style={st}><span className="vtp-pol"></span><span className="vtp-nm"></span><i className="vtp-n sh"></i><i className="vtp-n"></i><i className="vtp-n r"></i></span>;
  return <ConceptThumb L={L} c={c}/>;
}

Object.assign(window, { BioVibe, VibeThumb, VIBE_LAYOUTS, VImg, VSquareAvatar });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { VIBE_LAYOUTS, vArrow, VImg, VSquareAvatar, BioVibe, VibeThumb });
