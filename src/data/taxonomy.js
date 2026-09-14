// ===== Taxonomy — 3-level category tree + per-category attribute schema =====
// Ported verbatim from design-src/Taxonomy.jsx (tree data + helpers) plus
// catSlug / leavesForShop from design-src/data2.jsx.
// The category decides which attributes exist. Attributes come in two roles:
//   variant → produces sellable rows, each with its own qty / barcode / cost
//   spec    → describes the whole product; what buyers filter by
// Gender is a branch of the tree, not an attribute.
import {
  L, COLORS, vals, SIZE_CHARTS, ATTRS, attrDef, attrValueName, attrValueHex,
} from './attributes';

// ---- the tree: root › group › leaf. Leaves carry v (variant attrs) and s (spec attrs)
const CAT_TREE = [
  { id:"clothing", name:L("Clothing","Одежда","Kiyim"), children:[
    { id:"cl-women", name:L("Women","Женщинам","Ayollar"), children:[
      { id:"cl-w-dresses", name:L("Dresses","Платья","Ko‘ylaklar"), v:["color","size_w"], s:["material","season","fit","brand"] },
      { id:"cl-w-tops", name:L("Tops & blouses","Топы и блузы","Toplar va bluzalar"), v:["color","size_w"], s:["material","season","fit","brand"] },
      { id:"cl-w-trousers", name:L("Trousers","Брюки","Shimlar"), v:["color","size_w"], s:["material","season","fit","brand"] },
      { id:"cl-w-outer", name:L("Outerwear","Верхняя одежда","Ustki kiyim"), v:["color","size_w"], s:["material","season","fit","brand"] },
      { id:"cl-w-skirts", name:L("Skirts","Юбки","Yubkalar"), v:["color","size_w"], s:["material","season","fit"] },
    ]},
    { id:"cl-men", name:L("Men","Мужчинам","Erkaklar"), children:[
      { id:"cl-m-shirts", name:L("Shirts","Рубашки","Ko‘ylaklar"), v:["color","size_m"], s:["material","season","fit","brand"] },
      { id:"cl-m-tshirts", name:L("T-shirts","Футболки","Futbolkalar"), v:["color","size_m"], s:["material","fit","brand"] },
      { id:"cl-m-trousers", name:L("Trousers","Брюки","Shimlar"), v:["color","size_m"], s:["material","season","fit"] },
      { id:"cl-m-outer", name:L("Outerwear","Верхняя одежда","Ustki kiyim"), v:["color","size_m"], s:["material","season","brand"] },
    ]},
    { id:"cl-kids", name:L("Kids","Детям","Bolalar"), children:[
      { id:"cl-k-sets", name:L("Sets","Комплекты","To‘plamlar"), v:["color","size_kids"], s:["material","season"] },
      { id:"cl-k-outer", name:L("Outerwear","Верхняя одежда","Ustki kiyim"), v:["color","size_kids"], s:["material","season"] },
    ]},
  ]},
  { id:"footwear", name:L("Footwear","Обувь","Poyabzal"), children:[
    { id:"fw-women", name:L("Women","Женщинам","Ayollar"), children:[
      { id:"fw-w-sneakers", name:L("Sneakers","Кроссовки","Krossovkalar"), v:["color","size_shoe"], s:["brand","material","shoe_type","season"] },
      { id:"fw-w-boots", name:L("Boots","Сапоги и ботинки","Etiklar"), v:["color","size_shoe"], s:["brand","material","season"] },
      { id:"fw-w-sandals", name:L("Sandals","Сандалии","Sandallar"), v:["color","size_shoe"], s:["brand","material"] },
    ]},
    { id:"fw-men", name:L("Men","Мужчинам","Erkaklar"), children:[
      { id:"fw-m-sneakers", name:L("Sneakers","Кроссовки","Krossovkalar"), v:["color","size_shoe"], s:["brand","material","shoe_type","season"] },
      { id:"fw-m-shoes", name:L("Dress shoes","Туфли","Tuflilar"), v:["color","size_shoe"], s:["brand","material"] },
      { id:"fw-m-boots", name:L("Boots","Ботинки","Botinkalar"), v:["color","size_shoe"], s:["brand","material","season"] },
    ]},
    { id:"fw-kids", name:L("Kids","Детям","Bolalar"), children:[
      { id:"fw-k-sneakers", name:L("Sneakers","Кроссовки","Krossovkalar"), v:["color","size_shoe"], s:["brand","material","shoe_type"] },
    ]},
  ]},
  { id:"vehicles", name:L("Vehicles","Транспорт","Transport"), children:[
    { id:"vh-cars", name:L("Cars","Автомобили","Avtomobillar"), children:[
      { id:"vh-c-sedan", name:L("Sedans","Седаны","Sedanlar"), v:[], s:["make","model","year","mileage","fuel","gearbox","engine","color","condition"] },
      { id:"vh-c-suv", name:L("SUVs & crossovers","Внедорожники и кроссоверы","Krossoverlar"), v:[], s:["make","model","year","mileage","fuel","gearbox","engine","color","condition"] },
      { id:"vh-c-hatch", name:L("Hatchbacks","Хэтчбеки","Xetchbeklar"), v:[], s:["make","model","year","mileage","fuel","gearbox","engine","color","condition"] },
    ]},
    { id:"vh-parts", name:L("Parts & tyres","Запчасти и шины","Ehtiyot qismlar"), children:[
      { id:"vh-p-tyres", name:L("Tyres","Шины","Shinalar"), v:["tyre_size"], s:["brand","season"] },
      { id:"vh-p-acc", name:L("Accessories","Аксессуары","Aksessuarlar"), v:["color"], s:["brand","make"] },
    ]},
  ]},
  { id:"flowers", name:L("Flowers & plants","Цветы и растения","Gullar va o‘simliklar"), children:[
    { id:"fl-bouquets", name:L("Bouquets","Букеты","Guldastalar"), children:[
      { id:"fl-b-mixed", name:L("Mixed bouquets","Сборные букеты","Aralash guldastalar"), v:["bouquet_size"], s:["flower_type","occasion"] },
      { id:"fl-b-roses", name:L("Roses","Розы","Atirgullar"), v:["bouquet_size","color"], s:["occasion"] },
      { id:"fl-b-dried", name:L("Dried flowers","Сухоцветы","Quruq gullar"), v:["bouquet_size"], s:["flower_type"] },
    ]},
    { id:"fl-plants", name:L("Potted plants","Растения в горшках","Tuvakdagi o‘simliklar"), children:[
      { id:"fl-p-indoor", name:L("Indoor plants","Домашние растения","Uy o‘simliklari"), v:["bouquet_size"], s:["potted"] },
    ]},
  ]},
  { id:"supplements", name:L("Supplements","Витамины и добавки","Vitamin va qo‘shimchalar"), children:[
    { id:"sp-vitamins", name:L("Vitamins","Витамины","Vitaminlar"), children:[
      { id:"sp-v-multi", name:L("Multivitamins","Мультивитамины","Multivitaminlar"), v:["pack","supp_form"], s:["vegan","origin","brand"] },
      { id:"sp-v-single", name:L("Single vitamins","Отдельные витамины","Alohida vitaminlar"), v:["dosage","pack"], s:["supp_form","vegan","brand"] },
    ]},
    { id:"sp-sport", name:L("Sports nutrition","Спортивное питание","Sport ovqatlanish"), children:[
      { id:"sp-s-protein", name:L("Protein","Протеин","Protein"), v:["flavour","weight_g"], s:["supp_form","vegan","brand"] },
      { id:"sp-s-amino", name:L("Amino acids","Аминокислоты","Aminokislotalar"), v:["flavour","pack"], s:["supp_form","brand"] },
    ]},
  ]},
  { id:"gym", name:L("Gym equipment","Товары для спорта","Sport anjomlari"), children:[
    { id:"gy-weights", name:L("Weights","Отягощения","Og‘irliklar"), children:[
      { id:"gy-w-dumbbell", name:L("Dumbbells","Гантели","Gantellar"), v:["weight_kg","color"], s:["grip","brand"] },
      { id:"gy-w-kettle", name:L("Kettlebells","Гири","Girlar"), v:["weight_kg"], s:["grip","brand"] },
    ]},
    { id:"gy-acc", name:L("Accessories","Аксессуары","Aksessuarlar"), children:[
      { id:"gy-a-mats", name:L("Mats","Коврики","Gilamchalar"), v:["color","thickness"], s:["gym_mat","brand"] },
      { id:"gy-a-bands", name:L("Resistance bands","Резинки","Rezinkalar"), v:["color"], s:["brand"] },
    ]},
  ]},
  { id:"electronics", name:L("Electronics","Электроника","Elektronika"), children:[
    { id:"el-phones", name:L("Phones","Телефоны","Telefonlar"), children:[
      { id:"el-p-smart", name:L("Smartphones","Смартфоны","Smartfonlar"), v:["color","storage"], s:["brand","model","ram","screen"] },
    ]},
    { id:"el-audio", name:L("Audio","Аудио","Audio"), children:[
      { id:"el-a-head", name:L("Headphones","Наушники","Naushniklar"), v:["color"], s:["brand","model","wireless","anc"] },
      { id:"el-a-speak", name:L("Speakers","Колонки","Kolonkalar"), v:["color"], s:["brand","model","wireless"] },
    ]},
    { id:"el-comp", name:L("Computers","Компьютеры","Kompyuterlar"), children:[
      { id:"el-c-laptop", name:L("Laptops","Ноутбуки","Noutbuklar"), v:["storage","ram"], s:["brand","model","screen","color"] },
    ]},
  ]},
  { id:"home", name:L("Home & kitchen","Дом и кухня","Uy va oshxona"), children:[
    { id:"hm-kitchen", name:L("Kitchen","Кухня","Oshxona"), children:[
      { id:"hm-k-cook", name:L("Cookware","Посуда для готовки","Pishirish idishlari"), v:["capacity","color"], s:["home_mat","dishwasher","brand"] },
      { id:"hm-k-table", name:L("Tableware","Столовая посуда","Dasturxon idishlari"), v:["color"], s:["home_mat","dishwasher"] },
    ]},
    { id:"hm-textile", name:L("Textiles","Текстиль","Tekstil"), children:[
      { id:"hm-t-bedding", name:L("Bedding","Постельное бельё","Choyshablar"), v:["bed_size","color"], s:["home_mat"] },
      { id:"hm-t-towels", name:L("Towels","Полотенца","Sochiqlar"), v:["color"], s:["home_mat"] },
    ]},
    { id:"hm-decor", name:L("Decor","Декор","Dekor"), children:[
      { id:"hm-d-ceramics", name:L("Ceramics","Керамика","Sopol buyumlar"), v:["color"], s:["home_mat","origin"] },
      { id:"hm-d-textile", name:L("Suzani & rugs","Сюзане и ковры","So‘zana va gilamlar"), v:["color"], s:["home_mat","origin"] },
    ]},
  ]},
  { id:"cosmetics", name:L("Cosmetics","Косметика","Kosmetika"), children:[
    { id:"cs-face", name:L("Face","Лицо","Yuz"), children:[
      { id:"cs-f-found", name:L("Foundation","Тональные средства","Tonal kremlar"), v:["shade","volume_ml"], s:["finish","skin_type","brand"] },
      { id:"cs-f-powder", name:L("Powder & blush","Пудра и румяна","Upa va rumyana"), v:["shade"], s:["finish","brand"] },
    ]},
    { id:"cs-lips", name:L("Lips","Губы","Lablar"), children:[
      { id:"cs-l-stick", name:L("Lipstick","Помада","Pomada"), v:["shade"], s:["finish","brand"] },
    ]},
    { id:"cs-skin", name:L("Skincare","Уход за кожей","Teri parvarishi"), children:[
      { id:"cs-s-serum", name:L("Serums","Сыворотки","Sarumlar"), v:["volume_ml"], s:["skin_type","vegan","brand"] },
      { id:"cs-s-cream", name:L("Creams","Кремы","Kremlar"), v:["volume_ml"], s:["skin_type","vegan","brand"] },
    ]},
  ]},
  { id:"food", name:L("Food","Продукты","Oziq-ovqat"), children:[
    { id:"fd-pantry", name:L("Pantry","Продукты","Mahsulotlar"), children:[
      { id:"fd-p-nuts", name:L("Nuts & dried fruit","Орехи и сухофрукты","Yong‘oq va quruq mevalar"), v:["weight_g"], s:["dietary","origin"] },
      { id:"fd-p-honey", name:L("Honey & preserves","Мёд и варенье","Asal va murabbo"), v:["weight_g"], s:["dietary","origin"] },
      { id:"fd-p-bread", name:L("Bread & bakery","Хлеб и выпечка","Non va pishiriqlar"), v:["weight_g"], s:["dietary"] },
    ]},
    { id:"fd-sweets", name:L("Sweets","Сладости","Shirinliklar"), children:[
      { id:"fd-s-choc", name:L("Chocolate & halva","Шоколад и халва","Shokolad va holva"), v:["weight_g","flavour"], s:["dietary","origin"] },
    ]},
    { id:"fd-drinks", name:L("Drinks","Напитки","Ichimliklar"), children:[
      { id:"fd-d-tea", name:L("Tea","Чай","Choy"), v:["weight_g"], s:["tea_type","dietary","origin"] },
      { id:"fd-d-coffee", name:L("Coffee","Кофе","Kofe"), v:["weight_g"], s:["origin","dietary"] },
    ]},
  ]},
];

// ---- lookups -----------------------------------------------------------
const CAT_INDEX = {};
(function index(){
  CAT_TREE.forEach(root=>{
    CAT_INDEX[root.id] = { node:root, level:0, path:[root.id] };
    (root.children||[]).forEach(group=>{
      CAT_INDEX[group.id] = { node:group, level:1, path:[root.id, group.id], parent:root.id };
      (group.children||[]).forEach(leaf=>{
        CAT_INDEX[leaf.id] = { node:leaf, level:2, path:[root.id, group.id, leaf.id], parent:group.id, leaf:true };
      });
    });
  });
})();

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
function leavesForShop(sid, type){ return SHOP_LEAVES[sid] || TYPE_LEAVES[type] || ["hm-d-ceramics"]; }
function catSlug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

// ---- public surface ----------------------------------------------------
// TAXONOMY is the contract name for the tree; CAT_TREE stays as an alias.
const TAXONOMY = CAT_TREE;

export {
  TAXONOMY, CAT_TREE, CAT_INDEX, SHOP_LEAVES, TYPE_LEAVES,
  L, COLORS, vals, SIZE_CHARTS, ATTRS,
  catNode, catEntry, isLeafCat, catPathIds, catLabel, catBreadcrumb,
  catRoots, catGroups, catLeaves, allLeafCats, catSlug, leavesForShop,
  attrDef, variantAttrs, specAttrs, attrValueName, attrValueHex, sizeChartFor,
  variantLabel, combineOptions, optionsKey, offeredOptions, variantFor, optionReachable, cartesian,
};
export default TAXONOMY;
