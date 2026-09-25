import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import LangPill from '../components/ui/LangPill';
import { t, onLangChange, fmtPrice, getLang } from '../i18n';
import { useShopStore } from '../store/shopStore';
import api from '../api/client';
import '../styles/bio.css';

// Bio backgrounds config
const BIO_BGS = {
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

const BIO_FONTS = {
  soft:   { body:'"Hanken Grotesk",sans-serif', disp:'"Bricolage Grotesque",sans-serif' },
  grotesk:{ body:'"Space Grotesk",sans-serif', disp:'"Space Grotesk",sans-serif' },
  serif:  { body:'"Newsreader",serif', disp:'"Instrument Serif",serif' },
  outfit: { body:'"Outfit",sans-serif', disp:'"Outfit",sans-serif' },
};

const BIO_RADII = { square:"6px", round:"18px", pill:"999px" };

const BIO_TPLS = [
  { id:"clean", bg:"cream", btn:"soft", radius:"round", font:"soft" },
  { id:"sunset", bg:"blush", btn:"glass", radius:"pill", font:"outfit" },
  { id:"hero", bg:"white", btn:"soft", radius:"round", font:"soft" },
  { id:"garden", bg:"sage", btn:"outline", radius:"round", font:"serif" },
  { id:"poster", bg:"ink", btn:"glass", radius:"pill", font:"soft" },
  { id:"editorial", bg:"white", btn:"outline", radius:"square", font:"serif" },
  { id:"bazaar", bg:"saffron", btn:"hard", radius:"square", font:"grotesk" },
  { id:"neon", bg:"plum", btn:"fill", radius:"round", font:"grotesk" },
];

function getBioConfig(bioJson) {
  let raw = {};
  if (bioJson) {
    try { raw = typeof bioJson === 'string' ? JSON.parse(bioJson) : bioJson; } catch {}
  }
  const tpl = BIO_TPLS.find(x => x.id === raw.tpl) || BIO_TPLS[0];
  return {
    bg: BIO_BGS[raw.bg] ? raw.bg : tpl.bg,
    btn: raw.btn || tpl.btn,
    radius: BIO_RADII[raw.radius] ? raw.radius : tpl.radius,
    font: BIO_FONTS[raw.font] ? raw.font : tpl.font,
  };
}

function bioVars(c) {
  const bg = BIO_BGS[c.bg], f = BIO_FONTS[c.font];
  return {
    '--b-bg': bg.base, '--b-ink': bg.ink, '--b-sub': bg.sub,
    '--b-card': bg.card, '--b-bd': bg.bd, '--b-prim': bg.prim,
    '--b-prim-ink': bg.primInk, '--b-r': BIO_RADII[c.radius],
    '--b-font': f.body, '--b-disp': f.disp,
  };
}

function getProductName(product) {
  return product.nameEn || product.nameUz || product.nameRu || '';
}

export default function BioLinkPage() {
  const { handle } = useParams();
  const [, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [bioConfig, setBioConfig] = useState(null);
  const fetchShopByHandle = useShopStore((s) => s.fetchShopByHandle);
  const fetchProducts = useShopStore((s) => s.fetchProducts);

  useEffect(() => onLangChange(() => setTick(t => t + 1)), []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const shopData = await fetchShopByHandle(handle);
        setShop(shopData);
        if (shopData?.id) {
          await fetchProducts(shopData.id);
          const storeProducts = useShopStore.getState().products;
          setProducts(storeProducts.filter(p => p.visible !== false).slice(0, 4));
          try {
            const configRes = await api.get(`/shops/${shopData.id}/config`);
            setBioConfig(configRes.data?.bioJson);
          } catch {}
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [handle, fetchShopByHandle, fetchProducts]);

  if (loading) {
    return <div className="bio-page" style={{ alignItems: 'center' }}><span>{t('loading')}</span></div>;
  }

  if (!shop) {
    return (
      <div className="bio-page" style={{ alignItems: 'center', flexDirection: 'column', gap: 12 }}>
        <h2>{t('nf_shop_t')}</h2>
        <Link to="/" style={{ color: '#6366f1' }}>{t('nf_go_home')}</Link>
      </div>
    );
  }

  const cfg = getBioConfig(bioConfig);
  const bg = BIO_BGS[cfg.bg];
  const vars = bioVars(cfg);
  const isDark = bg.dark;

  const links = [];
  links.push({
    key: 'shop', primary: true,
    label: t('bio_open_shop'),
    sub: `rastashops.com/${handle}`,
    href: `/${handle}`,
    icon: '🛍️',
  });
  if (shop.instagram) links.push({
    key: 'ig', label: 'Instagram',
    sub: `@${shop.instagram.replace('@', '')}`,
    href: `https://instagram.com/${shop.instagram.replace('@', '')}`,
    icon: '📷',
  });
  if (shop.telegram) links.push({
    key: 'tg', label: 'Telegram',
    sub: `@${shop.telegram.replace('@', '')}`,
    href: `https://t.me/${shop.telegram.replace('@', '')}`,
    icon: '✈️',
  });
  if (shop.phone) links.push({
    key: 'ph', label: t('bio_call'),
    sub: shop.phone,
    href: `tel:${shop.phone}`,
    icon: '📞',
  });

  return (
    <div className={`bio-page bio-style-${cfg.btn}${isDark ? ' bio-dark' : ''}`} style={vars}>
      {bg.base.includes('gradient') && (
        <div className="bio-page-bg" style={{ background: bg.base }} />
      )}
      <div className="bio-card">
        <div className="bio-head">
          {shop.logoUrl ? (
            <div className="bio-avatar">
              <img src={shop.logoUrl} alt={shop.name} />
            </div>
          ) : (
            <div className="bio-avatar bio-avatar--placeholder" style={{ background: bg.prim }}>
              {shop.name?.charAt(0)}
            </div>
          )}
          <h1 className="bio-name">{shop.name}</h1>
          {shop.tagline && <p className="bio-tag">{shop.tagline}</p>}
          <div className="bio-meta">
            {shop.location && <span>{shop.location}</span>}
          </div>
        </div>

        <div className="bio-links">
          {links.map((l) => {
            const isExternal = l.href.startsWith('http') || l.href.startsWith('tel:');
            const Tag = isExternal ? 'a' : Link;
            const props = isExternal ? { href: l.href, target: '_blank', rel: 'noopener noreferrer' } : { to: l.href };
            return (
              <Tag key={l.key} className={`bio-btn${l.primary ? ' primary bio-shoplink' : ''}`} {...props}>
                {l.primary && <span className="bio-sl-shine" />}
                <span className="bio-btn-ic">{l.icon}</span>
                <span className="bio-btn-tx">
                  <b>{l.label}</b>
                  <i>{l.sub}</i>
                </span>
                {l.primary && products.length > 0 && (
                  <span className="bio-sl-badge">{t('bio_featured')}</span>
                )}
                <span className="bio-btn-go">{'→'}</span>
              </Tag>
            );
          })}
        </div>

        {products.length > 0 && (
          <div className="bio-shelf">
            <div className="bio-shelf-t">{t('bio_featured')}</div>
            <div className="bio-grid">
              {products.map((p) => (
                <Link key={p.id} to={`/${handle}/p/${p.id}`} className="bio-prod">
                  <span className="bio-pimg">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt={getProductName(p)} loading="lazy" />
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: p.tone || bg.prim, color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>
                        {getProductName(p).charAt(0)}
                      </span>
                    )}
                  </span>
                  <span className="bio-pname">{getProductName(p)}</span>
                  <span className="bio-pprice">{fmtPrice(p.price)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bio-foot">
          {t('bio_made')} <a href="https://rastashops.com"><b>rastashops.com</b></a>
        </div>
      </div>
    </div>
  );
}
