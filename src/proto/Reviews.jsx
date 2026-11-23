// ===== Reviews — the seller's view of ratings and comments =====
function ReviewsView({ store, shop, t, lang }){
  const reviews = store.reviews(shop.id);
  const products = store.products(shop.id);
  const stats = ratingStats(reviews);
  const byProduct = {};
  reviews.forEach(r=>{ (byProduct[r.productId] = byProduct[r.productId] || []).push(r); });
  const rows = Object.keys(byProduct).map(pid=>{
    const p = products.find(x=>x.id===pid);
    return p? { p, stats: ratingStats(byProduct[pid]) } : null;
  }).filter(Boolean).sort((a,b)=>b.stats.n-a.stats.n);
  const nameOf = (pid)=>{ const p = products.find(x=>x.id===pid); return p? textFB(p.name,lang) : "—"; };

  if(!reviews.length){
    return <EmptyState icon={I.chat} title={t.rv_title} body={t.rv_no_yet}/>;
  }
  return (
    <div>
      <div className="db-sec-head">
        <div><h2>{t.rv_title}</h2><div className="sub">{t.rv_sub}</div></div>
      </div>

      <div className="rv-sum">
        <div className="mini-stat">
          <div className="ms-val">{stats.avg} <span className="rv-star">{"\u2605"}</span></div>
          <div className="ms-lab">{t.rv_avg}</div>
        </div>
        <div className="mini-stat">
          <div className="ms-val">{fmtNum(stats.n)}</div>
          <div className="ms-lab">{t.rv_total}</div>
        </div>
        <div className="rv-dist">
          {[5,4,3,2,1].map(k=>{
            const n = stats.dist[k-1];
            const w = stats.n? Math.round(n/stats.n*100) : 0;
            return (
              <div key={k} className="rv-dist-r" title={fill(t.rv_stars_n,{n:k})}>
                <span>{k} {"\u2605"}</span>
                <div className="rv-bar"><i style={{width:w+"%"}}></i></div>
                <b>{n}</b>
              </div>
            );
          })}
        </div>
      </div>

      <div className="home-sec-t">{t.rv_by_product}</div>
      <div className="rv-prods">
        {rows.map(({p, stats:st})=>(
          <div key={p.id} className="rv-prod">
            <div className="stk-photo"><ImageSlot id={pslot(shop.id,p,0)} src={photoURL(p.tone, pslot(shop.id,p,0), 90,90, IMG_KW[shop.type], products.findIndex(x=>x.id===p.id))} placeholder="" style={FILL}/></div>
            <div className="rv-prod-m">
              <b>{textFB(p.name,lang)}</b>
              <span><Stars value={Math.round(st.avg)}/> {st.avg} · {fill(t.rv_count,{n:st.n})}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="home-sec-t">{t.rv_recent}</div>
      <div className="mv-list card">
        {reviews.slice(0,12).map(r=>(
          <div key={r.id} className="rv-row">
            <div className="rv-row-m">
              <div className="rv-row-t">
                <b>{r.name || t.rv_anon}</b>
                <Stars value={r.rating}/>
                <span className="rv-on">{nameOf(r.productId)}</span>
              </div>
              {r.text && <p>{r.text}</p>}
            </div>
            <span className="mv-at">{fmtDate(r.at,lang)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ReviewsView });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { ReviewsView });
