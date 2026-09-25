import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import LangPill from '../components/ui/LangPill';
import { t, onLangChange, fmtPrice, getLang } from '../i18n';
import { useShopStore } from '../store/shopStore';
import api from '../api/client';
import { BIO_BGS, getBioConfig, bioVars } from '../data/bio';
import '../styles/bio.css';

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
