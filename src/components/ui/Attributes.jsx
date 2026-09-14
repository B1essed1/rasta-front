// ===== Category cascade, spec fields, variant chooser — all driven by the taxonomy =====
// Ported from design-src/Attributes.jsx. Markup and class names are the design's;
// the design's `t` object is replaced by the app's t('key') helper.
import React from 'react';
import { I } from './Icons';
import { t, fill } from '../../i18n';
import {
  catPathIds,
  catRoots,
  catGroups,
  catLeaves,
  catBreadcrumb,
  specAttrs,
  variantAttrs,
} from '../../data/taxonomy';

export function CategoryCascade({ value, onChange, lang }) {
  const path = catPathIds(value);
  const [root, setRoot] = React.useState(path[0] || catRoots()[0].id);
  const [group, setGroup] = React.useState(
    path[1] || (catGroups(path[0] || catRoots()[0].id)[0] || {}).id
  );
  React.useEffect(() => {
    const p = catPathIds(value);
    if (p[0]) setRoot(p[0]);
    if (p[1]) setGroup(p[1]);
  }, [value]);
  const groups = catGroups(root);
  const leaves = catLeaves(group);
  return (
    <div className="field">
      <label>{t('cat_platform')}</label>
      <div className="cascade">
        <select
          value={root}
          onChange={(e) => {
            const r = e.target.value;
            const g = (catGroups(r)[0] || {}).id;
            const l = (catLeaves(g)[0] || {}).id;
            setRoot(r);
            setGroup(g);
            if (l) onChange(l);
          }}
        >
          {catRoots().map((c) => (
            <option key={c.id} value={c.id}>{c.name[lang]}</option>
          ))}
        </select>
        <span className="cascade-sep">{I.arrow({ width: 14, height: 14 })}</span>
        <select
          value={group}
          onChange={(e) => {
            const g = e.target.value;
            const l = (catLeaves(g)[0] || {}).id;
            setGroup(g);
            if (l) onChange(l);
          }}
        >
          {groups.map((c) => (
            <option key={c.id} value={c.id}>{c.name[lang]}</option>
          ))}
        </select>
        <span className="cascade-sep">{I.arrow({ width: 14, height: 14 })}</span>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {leaves.map((c) => (
            <option key={c.id} value={c.id}>{c.name[lang]}</option>
          ))}
        </select>
      </div>
      <div className="hint">{t('cat_platform_d')}</div>
      <div className="cascade-crumb">{catBreadcrumb(value, lang)}</div>
    </div>
  );
}

export function SpecFields({ catId, specs, setSpecs, lang }) {
  const attrs = specAttrs(catId);
  if (!attrs.length) return null;
  const set = (id, v) => setSpecs((s) => ({ ...s, [id]: v }));
  return (
    <div className="field">
      <label>{t('at_specs')}</label>
      <div className="hint" style={{ marginTop: -2, marginBottom: 10 }}>{t('at_specs_d')}</div>
      <div className="spec-fields">
        {attrs.map((a) => {
          const v = specs[a.id];
          if (a.kind === 'bool') {
            return (
              <label key={a.id} className="switch-row spec-bool">
                <input type="checkbox" checked={!!v} onChange={(e) => set(a.id, e.target.checked)} />
                <span className="switch"><i></i></span>{a.name[lang]}
              </label>
            );
          }
          if (a.kind === 'text') {
            return (
              <div key={a.id} className="spec-field">
                <span>{a.name[lang]}</span>
                <input value={v || ''} onChange={(e) => set(a.id, e.target.value)} placeholder={a.name[lang]} />
              </div>
            );
          }
          if (a.kind === 'number') {
            return (
              <div key={a.id} className="spec-field">
                <span>{a.name[lang]}</span>
                <div className="spec-num">
                  <input
                    value={v != null ? v : ''}
                    inputMode="numeric"
                    onChange={(e) => set(a.id, e.target.value.replace(/[^\d.]/g, ''))}
                    placeholder="0"
                  />
                  {a.unit && <i>{a.unit[lang]}</i>}
                </div>
              </div>
            );
          }
          if (a.kind === 'multi') {
            const list = Array.isArray(v) ? v : [];
            return (
              <div key={a.id} className="spec-field wide">
                <span>{a.name[lang]}</span>
                <div className="chip-row">
                  {(a.values || []).map((val) => {
                    const on = list.includes(val.id);
                    return (
                      <button
                        key={val.id}
                        className={'pick-chip' + (on ? ' on' : '')}
                        onClick={() => set(a.id, on ? list.filter((x) => x !== val.id) : [...list, val.id])}
                      >
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
              <select value={v || ''} onChange={(e) => set(a.id, e.target.value)}>
                <option value="">{t('at_pick')}</option>
                {(a.values || []).map((val) => (
                  <option key={val.id} value={val.id}>{val.name[lang]}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Which values does this product come in? The cross product becomes the stock rows.
export function VariantChooser({ catId, chosen, setChosen, combos, lang }) {
  const attrs = variantAttrs(catId);
  if (!attrs.length) {
    return (
      <div className="field">
        <label>{t('pr_variants')}</label>
        <div className="hint" style={{ marginTop: 0 }}>{t('at_no_variants')}</div>
      </div>
    );
  }
  const toggle = (aid, vid) =>
    setChosen((s) => {
      const cur = s[aid] || [];
      return { ...s, [aid]: cur.includes(vid) ? cur.filter((x) => x !== vid) : [...cur, vid] };
    });
  const all = (aid, values) =>
    setChosen((s) => ({
      ...s,
      [aid]: (s[aid] || []).length === values.length ? [] : values.map((v) => v.id),
    }));
  return (
    <div className="field">
      <label>{t('pr_variants')}</label>
      <div className="hint" style={{ marginTop: -2, marginBottom: 10 }}>{t('at_variants_d')}</div>
      {attrs.map((a) => {
        const sel = chosen[a.id] || [];
        return (
          <div key={a.id} className="vc-group">
            <div className="vc-head">
              <b>{a.name[lang]}</b>
              <button className="lnk" onClick={() => all(a.id, a.values || [])}>
                {sel.length === (a.values || []).length ? t('g_none') : t('g_all')}
              </button>
            </div>
            <div className="vc-vals">
              {(a.values || []).map((val) => {
                const on = sel.includes(val.id);
                if (a.swatch) {
                  return (
                    <button
                      key={val.id}
                      className={'vc-sw' + (on ? ' on' : '')}
                      title={val.name[lang]}
                      onClick={() => toggle(a.id, val.id)}
                    >
                      <i style={{ background: val.hex || '#ccc' }}></i>
                      <span>{val.name[lang]}</span>
                    </button>
                  );
                }
                return (
                  <button
                    key={val.id}
                    className={'vc-chip' + (on ? ' on' : '')}
                    onClick={() => toggle(a.id, val.id)}
                  >
                    {val.name[lang]}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="vc-count">
        {I.layers({ width: 14, height: 14 })} {fill(t('at_combos'), { n: (combos || []).length })}
      </div>
    </div>
  );
}
