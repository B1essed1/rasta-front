// ===== Category cascade, spec fields, variant chooser — all driven by the taxonomy =====

function CategoryCascade({ value, onChange, t, lang }){
  const path = catPathIds(value);
  const [root, setRoot] = React.useState(path[0] || catRoots()[0].id);
  const [group, setGroup] = React.useState(path[1] || (catGroups(path[0] || catRoots()[0].id)[0]||{}).id);
  React.useEffect(()=>{
    const p = catPathIds(value);
    if(p[0]) setRoot(p[0]);
    if(p[1]) setGroup(p[1]);
  },[value]);
  const groups = catGroups(root);
  const leaves = catLeaves(group);
  return (
    <div className="field">
      <label>{t.cat_platform}</label>
      <div className="cascade">
        <select value={root} onChange={e=>{
          const r = e.target.value;
          const g = (catGroups(r)[0]||{}).id;
          const l = (catLeaves(g)[0]||{}).id;
          setRoot(r); setGroup(g); if(l) onChange(l);
        }}>
          {catRoots().map(c=>(<option key={c.id} value={c.id}>{c.name[lang]}</option>))}
        </select>
        <span className="cascade-sep">{I.arrow({width:14,height:14})}</span>
        <select value={group} onChange={e=>{
          const g = e.target.value;
          const l = (catLeaves(g)[0]||{}).id;
          setGroup(g); if(l) onChange(l);
        }}>
          {groups.map(c=>(<option key={c.id} value={c.id}>{c.name[lang]}</option>))}
        </select>
        <span className="cascade-sep">{I.arrow({width:14,height:14})}</span>
        <select value={value} onChange={e=>onChange(e.target.value)}>
          {leaves.map(c=>(<option key={c.id} value={c.id}>{c.name[lang]}</option>))}
        </select>
      </div>
      <div className="hint">{t.cat_platform_d}</div>
      <div className="cascade-crumb">{catBreadcrumb(value, lang)}</div>
    </div>
  );
}

function SpecFields({ catId, specs, setSpecs, t, lang }){
  const attrs = specAttrs(catId);
  if(!attrs.length) return null;
  const set = (id, v)=> setSpecs(s=>({ ...s, [id]:v }));
  return (
    <div className="field">
      <label>{t.at_specs}</label>
      <div className="hint" style={{marginTop:-2, marginBottom:10}}>{t.at_specs_d}</div>
      <div className="spec-fields">
        {attrs.map(a=>{
          const v = specs[a.id];
          if(a.kind==="bool"){
            return (
              <label key={a.id} className="switch-row spec-bool">
                <input type="checkbox" checked={!!v} onChange={e=>set(a.id, e.target.checked)}/>
                <span className="switch"><i></i></span>{a.name[lang]}
              </label>
            );
          }
          if(a.kind==="text"){
            return (
              <div key={a.id} className="spec-field">
                <span>{a.name[lang]}</span>
                <input value={v||""} onChange={e=>set(a.id, e.target.value)} placeholder={a.name[lang]}/>
              </div>
            );
          }
          if(a.kind==="number"){
            return (
              <div key={a.id} className="spec-field">
                <span>{a.name[lang]}</span>
                <div className="spec-num">
                  <input value={v!=null? v : ""} inputMode="numeric"
                    onChange={e=>set(a.id, e.target.value.replace(/[^\d.]/g,""))} placeholder="0"/>
                  {a.unit && <i>{a.unit[lang]}</i>}
                </div>
              </div>
            );
          }
          if(a.kind==="multi"){
            const list = Array.isArray(v)? v : [];
            return (
              <div key={a.id} className="spec-field wide">
                <span>{a.name[lang]}</span>
                <div className="chip-row">
                  {(a.values||[]).map(val=>{
                    const on = list.includes(val.id);
                    return (
                      <button key={val.id} className={"pick-chip"+(on?" on":"")}
                        onClick={()=>set(a.id, on? list.filter(x=>x!==val.id) : [...list, val.id])}>
                        {val.name[lang]}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }
          return (
            <div key={a.id} className="spec-field">
              <span>{a.name[lang]}</span>
              <select value={v||""} onChange={e=>set(a.id, e.target.value)}>
                <option value="">{t.at_pick}</option>
                {(a.values||[]).map(val=>(<option key={val.id} value={val.id}>{val.name[lang]}</option>))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// small "add your own value" field under each option
function OwnValue({ t, onAdd }){
  const [v, setV] = React.useState("");
  const add = ()=>{ const x = v.trim().slice(0,30); if(x){ onAdd("c:"+x); setV(""); } };
  return (
    <span className="vc-own" style={{display:"inline-flex", gap:6, alignItems:"center"}}>
      <input value={v} onChange={e=>setV(e.target.value)} placeholder={t.pa_add_value} aria-label={t.pa_add_value}
        onKeyDown={e=>{ if(e.key==="Enter"){ e.preventDefault(); add(); } }} style={{width:150, height:34}}/>
      <button type="button" className="vc-chip" onClick={add} aria-label={t.pa_add_value}>{I.plus({width:14,height:14})}</button>
    </span>
  );
}

// Which values does this product come in? The cross product becomes the stock rows.
function VariantChooser({ catId, chosen, setChosen, combos, t, lang, optName, setOptName }){
  const attrs = variantAttrs(catId);
  if(!attrs.length){
    return <div className="field"><label>{t.pr_variants}</label><div className="hint" style={{marginTop:0}}>{t.at_no_variants}</div></div>;
  }
  const toggle = (aid, vid)=> setChosen(s=>{
    const cur = s[aid]||[];
    return { ...s, [aid]: cur.includes(vid)? cur.filter(x=>x!==vid) : [...cur, vid] };
  });
  const all = (aid, values)=> setChosen(s=>({ ...s, [aid]: (s[aid]||[]).length===values.length? [] : values.map(v=>v.id) }));
  return (
    <div className="field">
      <label>{t.pr_variants}</label>
      <div className="hint" style={{marginTop:-2, marginBottom:10}}>{t.at_variants_d}</div>
      {attrs.map(a=>{
        const sel = chosen[a.id]||[];
        const known = a.values||[];
        // suggested values first, then the seller's own ("c:…")
        const vals = known.concat(sel.filter(x=>!known.some(v=>v.id===x)).map(x=>{
          const n = attrValueName(a.id, x, lang); return { id:x, name:{ en:n, ru:n, uz:n } };
        }));
        return (
          <div key={a.id} className="vc-group">
            <div className="vc-head">
              {a.id==="option" && setOptName
                ? <input className="vc-optname" value={optName||""} onChange={e=>setOptName(e.target.value.slice(0,24))}
                    placeholder={t.pa_optname_ph} aria-label={t.pa_optname} style={{height:34, maxWidth:240}}/>
                : <b>{a.name[lang]}</b>}
              {known.length>0 && <button className="lnk" onClick={()=>all(a.id, known)}>
                {sel.length===known.length? t.g_none : t.g_all}
              </button>}
            </div>
            <div className="vc-vals">
              {vals.map(val=>{
                const on = sel.includes(val.id);
                if(a.swatch){
                  return (
                    <button key={val.id} className={"vc-sw"+(on?" on":"")} title={val.name[lang]}
                      onClick={()=>toggle(a.id, val.id)}>
                      <i style={{background:val.hex||"#ccc"}}></i>
                      <span>{val.name[lang]}</span>
                    </button>
                  );
                }
                return (
                  <button key={val.id} className={"vc-chip"+(on?" on":"")} onClick={()=>toggle(a.id, val.id)}>
                    {val.name[lang]}
                  </button>
                );
              })}
              <OwnValue t={t} onAdd={(id)=>setChosen(s=>{ const cur = s[a.id]||[]; return cur.includes(id)? s : { ...s, [a.id]:[...cur, id] }; })}/>
            </div>
          </div>
        );
      })}
      <div className="vc-count">{I.layers({width:14,height:14})} {fill(t.at_combos,{n:combos.length})}</div>
    </div>
  );
}

Object.assign(window, { CategoryCascade, SpecFields, VariantChooser });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { CategoryCascade, SpecFields, OwnValue, VariantChooser });
