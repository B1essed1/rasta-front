export const BIO_BGS = {
  cream:  { base:"#f4f1ec", ink:"#1b1714", sub:"#6f655a", card:"#ffffff", bd:"rgba(27,23,20,.5)", prim:"#1b1714", primInk:"#ffffff" },
  white:  { base:"#ffffff", ink:"#1b1714", sub:"#776d61", card:"#f5f2ec", bd:"rgba(27,23,20,.5)", prim:"#1b1714", primInk:"#ffffff" },
  sand:   { base:"#ecdfc8", ink:"#3a2c14", sub:"#7d6c4e", card:"#faf4e8", bd:"rgba(58,44,20,.55)", prim:"#3a2c14", primInk:"#f5ecd9" },
  sage:   { base:"#dde3d3", ink:"#28331f", sub:"#5b6850", card:"#f4f3ea", bd:"rgba(40,51,31,.5)", prim:"#31402a", primInk:"#eef0e2" },
  blush:  { base:"linear-gradient(165deg,#fde5cf,#f7b9a4 55%,#e98f8f)", ink:"#4a1f16", sub:"#7c463a", card:"rgba(255,255,255,.92)", bd:"rgba(74,31,22,.5)", prim:"#4a1f16", primInk:"#ffe9d8" },
  sky:    { base:"linear-gradient(180deg,#dcebf7,#c4d9ee)", ink:"#1d3350", sub:"#54718f", card:"rgba(255,255,255,.75)", bd:"rgba(29,51,80,.5)", prim:"#1d3350", primInk:"#eaf3fb" },
  saffron:{ base:"#f2b23e", ink:"#241a08", sub:"#6b5320", card:"#fdf6e9", bd:"#241a08", prim:"#241a08", primInk:"#f2b23e" },
  ink:    { base:"#171412", ink:"#f4efe8", sub:"#a99f92", card:"rgba(255,255,255,.08)", bd:"rgba(244,239,232,.5)", prim:"#f4efe8", primInk:"#171412", dark:true },
  plum:   { base:"#1c1530", ink:"#efeafd", sub:"#9d90c7", card:"#2a2145", bd:"rgba(200,255,80,.45)", prim:"#c8ff50", primInk:"#1c1530", dark:true },
};

export const BIO_FONTS = {
  soft:   { body:'"Hanken Grotesk",sans-serif', disp:'"Bricolage Grotesque",sans-serif' },
  grotesk:{ body:'"Space Grotesk",sans-serif', disp:'"Space Grotesk",sans-serif' },
  serif:  { body:'"Newsreader",serif', disp:'"Instrument Serif",serif' },
  outfit: { body:'"Outfit",sans-serif', disp:'"Outfit",sans-serif' },
};

export const BIO_RADII = { square:"6px", round:"18px", pill:"999px" };

export const BIO_TPLS = [
  { id:"clean", name:"Clean", bg:"cream", btn:"soft", radius:"round", font:"soft" },
  { id:"sunset", name:"Sunset", bg:"blush", btn:"glass", radius:"pill", font:"outfit" },
  { id:"hero", name:"Hero", bg:"white", btn:"soft", radius:"round", font:"soft" },
  { id:"garden", name:"Garden", bg:"sage", btn:"outline", radius:"round", font:"serif" },
  { id:"poster", name:"Poster", bg:"ink", btn:"glass", radius:"pill", font:"soft" },
  { id:"editorial", name:"Editorial", bg:"white", btn:"outline", radius:"square", font:"serif" },
  { id:"bazaar", name:"Bazaar", bg:"saffron", btn:"hard", radius:"square", font:"grotesk" },
  { id:"neon", name:"Neon", bg:"plum", btn:"fill", radius:"round", font:"grotesk" },
];

export function getBioConfig(bioJson) {
  let raw = {};
  if (bioJson) {
    try { raw = typeof bioJson === 'string' ? JSON.parse(bioJson) : bioJson; } catch {}
  }
  const tpl = BIO_TPLS.find(x => x.id === raw.tpl) || BIO_TPLS[0];
  return {
    tpl: tpl.id,
    bg: BIO_BGS[raw.bg] ? raw.bg : tpl.bg,
    btn: raw.btn || tpl.btn,
    radius: BIO_RADII[raw.radius] ? raw.radius : tpl.radius,
    font: BIO_FONTS[raw.font] ? raw.font : tpl.font,
  };
}

export function bioVars(c) {
  const bg = BIO_BGS[c.bg], f = BIO_FONTS[c.font];
  return {
    '--b-bg': bg.base, '--b-ink': bg.ink, '--b-sub': bg.sub,
    '--b-card': bg.card, '--b-bd': bg.bd, '--b-prim': bg.prim,
    '--b-prim-ink': bg.primInk, '--b-r': BIO_RADII[c.radius],
    '--b-font': f.body, '--b-disp': f.disp,
  };
}
