// ===== Studio photo — mocked AI enhancement flow (swap the mock for a real image model later) =====
const AI_CREDITS = { starter: 3, pro: 50 };

function StudioModal({ store, shop, slotId, src, t, lang, applied, onClose, onApply, onRevert }){
  const st = store.settings(shop.id);
  const used = (st.aiUsed || 0);
  const quota = AI_CREDITS[st.plan] || 0;
  const left = Math.max(0, quota - used);
  const [phase, setPhase] = React.useState(applied? "result" : (left>0? "intro" : "empty"));
  const [pos, setPos] = React.useState(50);
  const [seed, setSeed] = React.useState(0);
  useEscape(onClose);

  function run(){
    setPhase("working");
    setSeed(s=>s+1);
    setTimeout(()=>{ setPhase("result"); setPos(50); }, 1700);
  }

  const afterStyle = { filter:"brightness(1.1) contrast(1.12) saturate(1.06)" };

  return (
    <Modal wide title={t.ai_title} sub={t.ai_sub} onClose={onClose}
      foot={<>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>{t.g_close}</button>
        <div className="mf-right">
          {phase==="result" && <button className="btn btn-soft btn-sm" onClick={run} disabled={left<=0}>{I.undo({width:15,height:15})} {t.ai_retry}</button>}
          {phase==="result" && (applied
            ? <button className="btn btn-soft btn-sm" onClick={()=>{ onRevert(); onClose(); }}>{t.ai_revert}</button>
            : <button className="btn btn-accent btn-sm" onClick={()=>{ onApply(); store.setSettings(shop.id,{ aiUsed: used+1 }); onClose(); }}>{I.check({width:15,height:15})} {t.ai_use}</button>)}
          {phase==="intro" && <button className="btn btn-accent btn-sm" onClick={run}>{I.spark({width:15,height:15})} {t.ai_make}</button>}
        </div>
      </>}>

      {phase==="empty" && (
        <div className="ai-lock">
          <div className="ai-lock-ic">{I.spark({width:24,height:24})}</div>
          <b>{st.plan==="pro"? t.ai_credits_none : t.ai_pro}</b>
          <p>{t.ai_pro_d}</p>
          {st.plan!=="pro" && <button className="btn btn-accent btn-sm" onClick={()=>{ store.setSettings(shop.id,{plan:"pro"}); toast(t.st_upgrade); setPhase("intro"); }}>{t.st_upgrade}</button>}
        </div>
      )}

      {phase==="intro" && (
        <>
          <div className="ai-single"><div className="ai-img" style={{backgroundImage:`url(${src})`}}></div></div>
          <div className="ai-meta">
            <span className="ai-credit">{I.spark({width:13,height:13})} {fill(t.ai_credits,{n:left})}</span>
            <span className="hint" style={{margin:0}}>{t.ai_kept}</span>
          </div>
        </>
      )}

      {phase==="working" && (
        <div className="ai-working">
          <div className="ai-img blur" style={{backgroundImage:`url(${src})`}}></div>
          <div className="ai-working-ov">
            <div className="ob-spinner"></div>
            <b>{t.ai_working}</b>
            <span>{t.ai_working_d}</span>
          </div>
        </div>
      )}

      {phase==="result" && (
        <>
          <div className="ai-compare">
            <div className="ai-img" style={{backgroundImage:`url(${src})`}}></div>
            <div className="ai-studio-bg" style={{clipPath:`inset(0 0 0 ${pos}%)`}}></div>
            <div className="ai-img after" style={{...afterStyle, backgroundImage:`url(${src})`, clipPath:`inset(0 0 0 ${pos}%)`}}></div>
            <span className="ai-tag left">{t.ai_before}</span>
            <span className="ai-tag right">{t.ai_after}</span>
            <div className="ai-handle" style={{left:pos+"%"}}><i></i></div>
            <input className="ai-range" type="range" min="0" max="100" value={pos} aria-label={t.ai_drag}
              onChange={e=>setPos(Number(e.target.value))}/>
          </div>
          <div className="ai-meta">
            <span className="ai-credit">{I.spark({width:13,height:13})} {fill(t.ai_credits,{n:Math.max(0,left-(applied?0:1))})}</span>
            <span className="hint" style={{margin:0}}>{t.ai_note}</span>
          </div>
        </>
      )}
    </Modal>
  );
}

// mocked "derive the rest of the gallery from one photo": each slot is a different framing
// three viewpoints derived from the cover: turned left, turned right, close detail
const GEN_FRAMES = [
  null,
  { key:"side",   zoom:1.5,  x:30, y:44, fx:"brightness(1.07) contrast(1.1) saturate(1.04)",
    tf:"perspective(760px) rotateY(17deg) scale(1.12)" },
  { key:"back",   zoom:1.35, x:70, y:48, fx:"brightness(1.05) contrast(1.09) saturate(1.02)",
    tf:"perspective(760px) rotateY(-19deg) scaleX(-1) scale(1.12)" },
  { key:"detail", zoom:2.15, x:46, y:34, fx:"brightness(1.09) contrast(1.15) saturate(1.06)",
    tf:"perspective(900px) rotateX(9deg) rotate(-3deg) scale(1.08)" },
];
function genStyle(i, url){
  const f = GEN_FRAMES[i];
  if(!f) return {};
  return { backgroundImage:"url("+url+")", backgroundSize:(f.zoom*100)+"% auto",
    backgroundPosition:f.x+"% "+f.y+"%", filter:f.fx, transform:f.tf };
}
function genTag(i, t){
  const f = GEN_FRAMES[i];
  if(!f) return "";
  return ({ side:t.gen_tag_side, back:t.gen_tag_back, detail:t.gen_tag_detail })[f.key];
}

// which of these slots hold a photo (uploaded or loaded from the server) — read from PhotoStore, not the DOM,
// so a camera upload counts and a stock placeholder does not (bug #1)
function useSlotsFilled(ids){
  const [, f] = React.useState(0);
  React.useEffect(()=> PhotoStore.sub(()=>f(x=>x+1)), []);
  const out = {};
  ids.forEach((id,i)=>{ out[i] = !!PhotoStore.get(id); });
  return out;
}
function useCoverFilled(slotId){ return useSlotsFilled([slotId])[0]; }

function GenerateSetStrip({ store, shop, t, lang, src, gen, ready, onGenerate, onClear, onDismiss }){
  const [busy, setBusy] = React.useState(false);
  const has = Object.keys(gen||{}).length>0;
  if(has){
    return (
      <div className="ai-strip gen">
        {I.spark({width:15,height:15})}
        <span><b>{t.gen_done}</b> — {t.gen_replace}</span>
        <button className="lnk" onClick={onClear}>{t.gen_undo}</button>
      </div>
    );
  }
  return (
    <div className="gen-offer">
      <div className="gen-offer-thumbs">
        {[1,2,3].map(i=>(<span key={i} className="gen-thumb"><i style={genStyle(i, src)}></i></span>))}
      </div>
      <div className="gen-offer-txt">
        <b>{t.gen_offer_t}</b>
        <span>{ready? t.gen_offer_d : t.gen_need_cover}</span>
      </div>
      <div className="gen-offer-acts">
        <button className="btn btn-accent btn-sm" disabled={busy || !ready} title={ready? "" : t.gen_need_cover} onClick={()=>{
          setBusy(true);
          setTimeout(()=>{ setBusy(false); onGenerate(); }, 1500);
        }}>{busy? <><span className="ob-spinner tiny"></span> {t.gen_working}</> : <>{I.spark({width:15,height:15})} {t.gen_do}</>}</button>
        <button className="lnk" onClick={onDismiss}>{t.gen_not_now}</button>
      </div>
    </div>
  );
}

Object.assign(window, { StudioModal, AI_CREDITS, GEN_FRAMES, genStyle, genTag, GenerateSetStrip, useCoverFilled, useSlotsFilled });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { AI_CREDITS, StudioModal, GEN_FRAMES, genStyle, genTag, useSlotsFilled, useCoverFilled, GenerateSetStrip });
