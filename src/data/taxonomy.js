// ===== Taxonomy — 3-level category tree + per-category attribute schema =====
// Helpers ported from design-src/Taxonomy.jsx; the tree data is served by the backend.
// The category decides which attributes exist. Attributes come in two roles:
//   variant → produces sellable rows, each with its own qty / barcode / cost
//   spec    → describes the whole product; what buyers filter by
// Gender is a branch of the tree, not an attribute.
import api from '../api/client';
import {
  L, COLORS, vals, SIZE_CHARTS, ATTRS, attrDef, attrValueName, attrValueHex,
} from './attributes';

// ---- the tree: root › group › leaf
// The tree itself lives in the backend (categories table, kind PRODUCT_CATEGORY).
// loadTaxonomy() fills CAT_TREE / CAT_INDEX in place, so every importer sees the
// live data. Node ids are the backend UUIDs — that is what products store as catId.
// Leaves carry v (variant attrs) and s (spec attrs) as attribute keys from ./attributes.
const CAT_TREE = [];

// ---- lookups -----------------------------------------------------------
const CAT_INDEX = {};
const CAT_BY_SLUG = {};

function buildTree(rows){
  const byId = {};
  rows.forEach(r=>{
    byId[r.id] = {
      id:r.id, slug:r.slug, level:r.level,
      name:L(r.nameEn, r.nameRu || r.nameEn, r.nameUz || r.nameEn),
      v:r.variantAttrs||[], s:r.specAttrs||[], children:[],
    };
  });
  const roots = [];
  rows.forEach(r=>{
    const n = byId[r.id];
    const parent = r.parentId && byId[r.parentId];
    (parent ? parent.children : roots).push(n);
  });
  return roots;
}

function reindex(){
  Object.keys(CAT_INDEX).forEach(k=>delete CAT_INDEX[k]);
  Object.keys(CAT_BY_SLUG).forEach(k=>delete CAT_BY_SLUG[k]);
  CAT_TREE.forEach(root=>{
    CAT_INDEX[root.id] = { node:root, level:0, path:[root.id] };
    CAT_BY_SLUG[root.slug] = root.id;
    (root.children||[]).forEach(group=>{
      CAT_INDEX[group.id] = { node:group, level:1, path:[root.id, group.id], parent:root.id };
      CAT_BY_SLUG[group.slug] = group.id;
      (group.children||[]).forEach(leaf=>{
        CAT_INDEX[leaf.id] = { node:leaf, level:2, path:[root.id, group.id, leaf.id], parent:group.id, leaf:true };
        CAT_BY_SLUG[leaf.slug] = leaf.id;
      });
    });
  });
}

let taxonomyPromise = null;
// Fetch the catalog once. Resolves with the tree; callers can await it before render.
function loadTaxonomy(){
  if(!taxonomyPromise){
    taxonomyPromise = api.get('/categories', { params:{ kind:'PRODUCT_CATEGORY' } })
      .then(res=>{
        CAT_TREE.length = 0;
        CAT_TREE.push(...buildTree(res.data));
        reindex();
        return CAT_TREE;
      })
      .catch(e=>{ taxonomyPromise = null; throw e; });
  }
  return taxonomyPromise;
}
function catIdBySlug(slug){ return CAT_BY_SLUG[slug] || null; }

function catNode(id){ const e = CAT_INDEX[id]; return e? e.node : null; }
function catEntry(id){ return CAT_INDEX[id] || null; }
function isLeafCat(id){ const e = CAT_INDEX[id]; return !!(e && e.leaf); }
function catPathIds(id){ const e = CAT_INDEX[id]; return e? e.path : []; }
function catLabel(id, lang){ const n = catNode(id); return n? n.name[lang] : "—"; }
function catBreadcrumb(id, lang, sep){
  return catPathIds(id).map(x=>catLabel(x,lang)).join(sep || " › ");
}
function catRoots(){ return CAT_TREE; }
function catGroups(rootId){ const n = catNode(rootId); return (n && n.children) || []; }
function catLeaves(groupId){ const n = catNode(groupId); return (n && n.children) || []; }
function allLeafCats(){
  return Object.keys(CAT_INDEX).filter(isLeafCat).map(id=>({ id, node:catNode(id) }));
}

// attrDef is imported from ./attributes.js (same definition) — do not redeclare.
function variantAttrs(catId){
  const n = catNode(catId);
  return ((n && n.v) || []).map(attrDef).filter(Boolean);
}
function specAttrs(catId){
  const n = catNode(catId);
  return ((n && n.s) || []).map(attrDef).filter(Boolean);
}
function sizeChartFor(catId){
  const va = variantAttrs(catId).find(a=>a.chart);
  return va? { attr:va, chart:SIZE_CHARTS[va.chart] } : null;
}

// ---- variants from structured options ----------------------------------
// v.options is { color:"ivory", size_w:"m" } — no string parsing anywhere
function variantLabel(catId, options, lang){
  return variantAttrs(catId)
    .map(a=> options[a.id]? attrValueName(a.id, options[a.id], lang) : null)
    .filter(Boolean).join(" · ");
}
function cartesian(lists){
  return lists.reduce((acc, l)=> acc.flatMap(a=> l.map(b=> [...a, b])), [[]]);
}
// chosen: { color:["ivory","black"], size_w:["s","m"] } → one options object per combination
function combineOptions(catId, chosen){
  const attrs = variantAttrs(catId).filter(a=> (chosen[a.id]||[]).length);
  if(!attrs.length) return [{}];
  const combos = cartesian(attrs.map(a=> chosen[a.id]));
  return combos.map(combo=>{
    const o = {};
    attrs.forEach((a,i)=>{ o[a.id] = combo[i]; });
    return o;
  });
}
function optionsKey(options){
  return Object.keys(options).sort().map(k=>k+":"+options[k]).join("|");
}
// which values a product actually offers, per variant attribute
function offeredOptions(p){
  const out = {};
  variantAttrs(p.catId).forEach(a=>{
    const seen = [];
    (p.variants||[]).forEach(v=>{
      const val = (v.options||{})[a.id];
      if(val && !seen.includes(val)) seen.push(val);
    });
    if(seen.length){
      const order = (a.values||[]).map(x=>x.id);
      seen.sort((x,y)=>order.indexOf(x)-order.indexOf(y));
      out[a.id] = seen;
    }
  });
  return out;
}
// the variant matching a full selection
function variantFor(p, sel){
  return (p.variants||[]).find(v=>{
    const o = v.options||{};
    return Object.keys(sel).every(k=> o[k]===sel[k]);
  }) || null;
}
// is any in-stock variant still reachable if this value were picked?
function optionReachable(p, sel, attrId, value){
  const want = { ...sel, [attrId]:value };
  delete want.__none;
  return (p.variants||[]).some(v=>{
    const o = v.options||{};
    return v.qty>0 && Object.keys(want).every(k=> want[k]==null || o[k]===want[k]);
  });
}

// ---- shop → leaf categories (from design-src/data2.jsx) -----------------
const SHOP_LEAVES = {
  lola:     ["cl-w-dresses", "cl-w-tops", "cl-w-trousers", "cl-w-outer", "cl-w-skirts"],
  choyxona: ["fd-p-bread", "fd-p-honey", "fd-d-tea", "fd-s-choc", "fd-p-nuts"],
  gulnoza:  ["cs-f-found", "cs-l-stick", "cs-s-serum", "cs-s-cream", "cs-f-powder"],
  silkroad: ["hm-d-ceramics", "hm-d-textile", "hm-k-table", "hm-t-bedding", "hm-k-cook"],
  bahor:    ["fl-b-mixed", "fl-b-roses", "fl-p-indoor", "fl-b-dried"],
  kicks:    ["fw-m-sneakers", "fw-w-sneakers", "fw-m-boots", "fw-m-shoes"],
};
const TYPE_LEAVES = {
  fashion: ["cl-w-dresses", "cl-w-tops", "cl-m-shirts", "fw-w-sneakers"],
  footwear:["fw-w-sneakers", "fw-m-sneakers", "fw-m-boots"],
  vehicles:["vh-c-sedan", "vh-c-suv", "vh-p-tyres"],
  flowers: ["fl-b-mixed", "fl-b-roses", "fl-p-indoor"],
  health:  ["sp-v-multi", "sp-v-single", "sp-s-protein"],
  sport:   ["gy-w-dumbbell", "gy-w-kettle", "gy-a-mats"],
  electronics:["el-p-smart", "el-a-head", "el-c-laptop"],
  cosmetics:["cs-f-found", "cs-l-stick", "cs-s-serum"],
  food:    ["fd-p-nuts", "fd-p-honey", "fd-d-tea"],
  beauty:  ["cs-f-found", "cs-l-stick", "cs-s-serum"],
  home:    ["hm-d-ceramics", "hm-k-table", "hm-t-bedding"],
  gifts:   ["fl-b-mixed", "fl-b-roses"],
};
function leavesForShop(sid, type){
  const slugs = SHOP_LEAVES[sid] || TYPE_LEAVES[type] || ["hm-d-ceramics"];
  return slugs.map(catIdBySlug).filter(Boolean);
}
function catSlug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

// ---- public surface ----------------------------------------------------
// TAXONOMY is the contract name for the tree; CAT_TREE stays as an alias.
const TAXONOMY = CAT_TREE;

export {
  loadTaxonomy, catIdBySlug,
  TAXONOMY, CAT_TREE, CAT_INDEX, SHOP_LEAVES, TYPE_LEAVES,
  L, COLORS, vals, SIZE_CHARTS, ATTRS,
  catNode, catEntry, isLeafCat, catPathIds, catLabel, catBreadcrumb,
  catRoots, catGroups, catLeaves, allLeafCats, catSlug, leavesForShop,
  attrDef, variantAttrs, specAttrs, attrValueName, attrValueHex, sizeChartFor,
  variantLabel, combineOptions, optionsKey, offeredOptions, variantFor, optionReachable, cartesian,
};
export default TAXONOMY;
