import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { t, onLangChange, fmtPrice, getLang } from '../i18n';
import { useShopStore } from '../store/shopStore';
import api from '../api/client';
import { I } from '../components/ui/Icons';
import { BIO_BGS, VIBE_LAYOUTS, getBioConfig, bioVars } from '../data/bio';
import '../styles/bio.css';

/* ───────── SVG icon sets ───────── */
const BIO_I = {
  ig: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>,
  phone: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 4h4l1.5 4.5-2.2 1.6a13 13 0 0 0 5.6 5.6l1.6-2.2L20 15v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  link: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M10 14a4 4 0 0 0 6 .4l3-3a4 4 0 0 0-5.6-5.6l-1.7 1.7M14 10a4 4 0 0 0-6-.4l-3 3a4 4 0 0 0 5.6 5.6l1.7-1.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  pin: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.7"/></svg>,
};

const CC_I = {
  play: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor"/></svg>,
  prev: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M7 6v12M18 6v12l-9-6 9-6Z" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  next: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M17 6v12M6 6v12l9-6-9-6Z" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  heart: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  send: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 12 20 4l-6 16-2.5-6.5L4 12Z" fill="currentColor"/></svg>,
  back: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M14.5 6 8.5 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  dots: (p) => <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="5.5" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="18.5" r="1.8" fill="currentColor"/></svg>,
};

const FILL = { width: '100%', height: '100%', objectFit: 'cover' };
const vArrow = (s) => I.arrow({ width: s || 18, height: s || 18 });

/* ───────── Helpers ───────── */
function nm(p, lang) {
  const k = 'name' + lang.charAt(0).toUpperCase() + lang.slice(1);
  return p[k] || p.nameEn || p.nameUz || p.nameRu || '';
}

function taglineStr(shop, lang) {
  if (!shop.tagline) return '';
  if (typeof shop.tagline === 'object') return shop.tagline[lang] || shop.tagline.en || shop.tagline.uz || shop.tagline.ru || '';
  return shop.tagline;
}

/* ───────── Shared primitives ───────── */
function BioAvatar({ shop, size }) {
  return (
    <div className="bio-avatar" style={{ width: size, height: size }}>
      {shop.logoUrl ? (
        <img src={shop.logoUrl} alt={shop.name} />
      ) : (
        <div className="bio-avatar--placeholder" style={{ background: shop.coverColor || '#1b1714', width: '100%', height: '100%' }}>
          {shop.initials || shop.name?.charAt(0)}
        </div>
      )}
    </div>
  );
}

function BioCover({ shop, cls }) {
  return (
    <div className={cls}>
      {shop.coverUrl ? (
        <img src={shop.coverUrl} alt={shop.name} style={FILL} />
      ) : (
        <div style={{ width: '100%', height: '100%', background: shop.coverColor || '#1b1714' }} />
      )}
    </div>
  );
}

function ProdImg({ p, name: label }) {
  const url = p.images?.[0]?.thumbnailUrl || p.images?.[0]?.url;
  if (url) return <img src={url} alt={label} style={FILL} />;
  return <div style={{ width: '100%', height: '100%', background: p.tone || '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{label.charAt(0)}</div>;
}

function BioFoot() {
  return <div className="bio-foot">{t('bio_made')} <a href="https://labaratory.rastashops.com"><b>labaratory.rastashops.com</b></a></div>;
}

/* ───────── Link builder ───────── */
function buildLinks(shop, handle) {
  const links = [];
  links.push({
    key: 'shop', primary: true,
    label: t('bio_open_shop'),
    sub: `labaratory.rastashops.com/${handle}`,
    href: `/${handle}`,
    icon: I.store({ width: 22, height: 22 }),
    iconFn: I.store,
  });
  if (shop.instagram) links.push({
    key: 'ig', label: 'Instagram',
    sub: '@' + shop.instagram.replace('@', ''),
    href: `https://instagram.com/${shop.instagram.replace('@', '')}`,
    icon: BIO_I.ig({ width: 19, height: 19 }),
    iconFn: BIO_I.ig,
  });
  if (shop.telegram) links.push({
    key: 'tg', label: 'Telegram',
    sub: '@' + shop.telegram.replace('@', ''),
    href: `https://t.me/${shop.telegram.replace('@', '')}`,
    icon: I.tg({ width: 19, height: 19 }),
    iconFn: I.tg,
  });
  if (shop.phone) links.push({
    key: 'ph', label: t('bio_call'),
    sub: shop.phone,
    href: `tel:${shop.phone}`,
    icon: BIO_I.phone({ width: 19, height: 19 }),
    iconFn: BIO_I.phone,
  });
  if (shop.location || shop.address) {
    const addr = [shop.address, shop.location].filter(Boolean).join(', ');
    links.push({
      key: 'loc', label: t('loc_title'),
      sub: addr,
      href: shop.mapLat && shop.mapLng
        ? `https://yandex.uz/maps/?pt=${shop.mapLng},${shop.mapLat}&z=16&l=map`
        : `https://yandex.uz/maps/?text=${encodeURIComponent(addr)}`,
      icon: BIO_I.pin({ width: 19, height: 19 }),
      iconFn: BIO_I.pin,
    });
  }
  return links;
}

function isExternal(href) {
  return href.startsWith('http') || href.startsWith('tel:');
}

function BioLink({ href, className, children, ...rest }) {
  if (isExternal(href)) return <a href={href} className={className} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
  return <Link to={href} className={className} {...rest}>{children}</Link>;
}

/* ────────────────────────────────────────────────
   CLASSIC / POSTER / EDITORIAL layouts
   ──────────────────────────────────────────────── */
function BioClassicPage({ layout, shop, handle, links, products, tagline, meta, bg, cls, vars, lang }) {
  const shopLink = links.find(l => l.primary);
  const rest = links.filter(l => !l.primary);

  return (
    <div className={cls} style={vars}>
      {layout === 'poster' && <BioCover shop={shop} cls="bio-poster-bg" />}
      {bg.base.includes('gradient') && <div className="bio-page-bg" style={{ background: bg.base }} />}
      <div className="bio-card">
        {/* HEAD */}
        {layout === 'editorial' ? (
          <div className="bio-ed-head">
            <BioAvatar shop={shop} size={64} />
            <h1 className="bio-name">{shop.name}</h1>
            {tagline && <p className="bio-tag">{tagline}</p>}
            <div className="bio-meta">{meta}</div>
          </div>
        ) : (
          <div className="bio-head">
            <BioAvatar shop={shop} size={layout === 'poster' ? 56 : 96} />
            <h1 className="bio-name">{shop.name}</h1>
            {tagline && <p className="bio-tag">{tagline}</p>}
            <div className="bio-meta">{meta}</div>
          </div>
        )}

        {/* LINKS */}
        {layout === 'editorial' ? (
          <div className="bio-ed-links">
            {links.map((l, i) => (
              <BioLink key={l.key} href={l.href} className="bio-ed-row">
                <span className="bio-ed-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="bio-ed-lab"><b>{l.label}</b><i>{l.sub}</i></span>
                <span className="bio-btn-go">{I.arrow({ width: 16, height: 16 })}</span>
              </BioLink>
            ))}
          </div>
        ) : (
          <div className="bio-links">
            {shopLink && (
              <BioLink href={shopLink.href} className="bio-btn primary bio-shoplink">
                <span className="bio-sl-shine" />
                <span className="bio-btn-ic">{shopLink.icon}</span>
                <span className="bio-btn-tx"><b>{shopLink.label}</b><i>{shopLink.sub}</i></span>
                {products.length > 0 && <span className="bio-sl-badge">{I.bag({ width: 12, height: 12 })} {t('bio_featured')}</span>}
                <span className="bio-btn-go">{I.arrow({ width: 17, height: 17 })}</span>
              </BioLink>
            )}
            {rest.map(l => (
              <BioLink key={l.key} href={l.href} className="bio-btn">
                <span className="bio-btn-ic">{l.icon}</span>
                <span className="bio-btn-tx"><b>{l.label}</b><i>{l.sub}</i></span>
                <span className="bio-btn-go">{I.arrow({ width: 15, height: 15 })}</span>
              </BioLink>
            ))}
          </div>
        )}

        {/* PRODUCTS */}
        {layout === 'editorial'
          ? (products.length > 0 && (
            <div className="bio-shelf">
              <div className="bio-shelf-t">{t('bio_featured')}</div>
              <div className="bio-ed-prods">
                {products.map((p) => {
                  const n = nm(p, lang);
                  return (
                    <Link key={p.id} to={`/${handle}/p/${p.id}`} className="bio-ed-prod">
                      <span className="bio-pimg sm"><ProdImg p={p} name={n} /></span>
                      <span className="bio-ed-lab"><b>{n}</b><i>{fmtPrice(p.price)}</i></span>
                      <span className="bio-btn-go">{I.arrow({ width: 15, height: 15 })}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
          : (products.length > 0 && (
            <div className="bio-shelf">
              <div className="bio-shelf-t">{t('bio_featured')}</div>
              <div className={layout === 'poster' ? 'bio-scroll' : 'bio-grid'}>
                {products.map((p) => {
                  const n = nm(p, lang);
                  return (
                    <Link key={p.id} to={`/${handle}/p/${p.id}`} className="bio-prod">
                      <div className="bio-prod__img">
                        {p.images?.[0]?.url ? (
                          <img src={p.images[0].thumbnailUrl || p.images[0].url} alt={n} loading="lazy" />
                        ) : (
                          <div className="bio-prod__placeholder" style={{ background: p.tone || bg.prim }}>{n.charAt(0)}</div>
                        )}
                      </div>
                      <div className="bio-prod__info">
                        <span className="bio-prod__name">{n}</span>
                        <span className="bio-prod__price">{fmtPrice(p.price)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

        <BioFoot />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   CONCEPT: OS / Desktop 98
   ──────────────────────────────────────────────── */
function BioOS({ shop, handle, links, products, tagline, meta, cls, vars, lang }) {
  const shopLink = links.find(l => l.primary);
  const rest = links.filter(l => !l.primary);
  const now = new Date();
  return (
    <div className={cls} style={vars}>
      <div className="bio-card vo-desk">
        <div className="vo-win">
          <div className="vo-bar"><span>{handle}.exe</span><span className="vo-ctl"><i>_</i><i>&square;</i><i>&times;</i></span></div>
          <div className="vo-body">
            <div className="vo-prof">
              <span className="vo-av"><BioAvatar shop={shop} size={64} /></span>
              <div><h1 className="vo-name">{shop.name}</h1>{tagline && <p>{tagline}</p>}<small>{meta}</small></div>
            </div>
            {shopLink && <BioLink href={shopLink.href} className="vo-cta">{CC_I.play({ width: 14, height: 14 })} {shopLink.label}</BioLink>}
          </div>
        </div>
        <div className="vo-icons">
          {rest.map(l => (
            <BioLink key={l.key} href={l.href} className="vo-icon"><span className="vo-ib">{l.iconFn({ width: 24, height: 24 })}</span><b>{l.label}</b></BioLink>
          ))}
        </div>
        {products.length > 0 && (
          <div className="vo-win">
            <div className="vo-bar"><span>{t('cc_albums')}</span><span className="vo-ctl"><i>_</i><i>&square;</i><i>&times;</i></span></div>
            <div className="vo-files">
              {products.map((p) => {
                const n = nm(p, lang);
                return (
                  <Link key={p.id} to={`/${handle}/p/${p.id}`} className="vo-file">
                    <span className="vo-thumb"><ProdImg p={p} name={n} /></span>
                    <b>{n}</b><small>{fmtPrice(p.price)}</small>
                  </Link>
                );
              })}
            </div>
            <div className="vo-status"><span>{products.length} {t('cc_objects')}</span><span>rasta.uz</span></div>
          </div>
        )}
        <div className="vo-task">
          <BioLink href={`/${handle}`} className="vo-start"><i></i>{t('cc_start')}</BioLink>
          <span className="vo-clock">{shop.location} {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   CONCEPT: Receipt
   ──────────────────────────────────────────────── */
function BioReceipt({ shop, handle, links, products, tagline, meta, cls, vars, lang }) {
  const shopLink = links.find(l => l.primary);
  const rest = links.filter(l => !l.primary);
  const now = new Date();
  return (
    <div className={cls} style={vars}>
      <div className="bio-card">
        <div className="vr-paper">
          <div className="vr-edge top"></div>
          <div className="vr-in">
            <span className="vr-stamp">{t('cc_open')}<br />{shop.location}</span>
            <div className="vr-logo"><BioAvatar shop={shop} size={64} /></div>
            <h1 className="vr-name">{shop.name}</h1>
            {tagline && <div className="vr-c">{tagline}</div>}
            <div className="vr-c">{meta}</div>
            <div className="vr-c vr-sm">{now.toLocaleDateString('en-GB')} &middot; #{handle.toUpperCase()}</div>
            <div className="vr-hr"></div>
            {rest.map(l => (
              <BioLink key={l.key} href={l.href} className="vr-row"><span>{l.label}</span><i></i><b>{l.sub}</b></BioLink>
            ))}
            {products.length > 0 && <div className="vr-hr"></div>}
            {products.map((p) => {
              const n = nm(p, lang);
              return (
                <Link key={p.id} to={`/${handle}/p/${p.id}`} className="vr-item">
                  <span className="vr-pimg"><ProdImg p={p} name={n} /></span>
                  <span className="vr-q">1&times;</span><span className="vr-pn">{n}</span><i></i><b>{fmtPrice(p.price)}</b>
                </Link>
              );
            })}
            <div className="vr-hr dbl"></div>
            {shopLink && <BioLink href={shopLink.href} className="vr-total"><span>{t('cc_total')}</span><b>{shopLink.label} &rarr;</b></BioLink>}
            <div className="vr-barcode"></div>
            <div className="vr-c vr-sm">rasta.uz/{handle}</div>
            <div className="vr-c vr-sm">{t('cc_thanks')}</div>
          </div>
          <div className="vr-edge bot"></div>
        </div>
        <BioFoot />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   CONCEPT: Chat
   ──────────────────────────────────────────────── */
function BioChat({ shop, handle, links, products, tagline, meta, cls, vars, lang }) {
  const shopLink = links.find(l => l.primary);
  const rest = links.filter(l => !l.primary);
  return (
    <div className={cls} style={vars}>
      <div className="bio-card vc-app">
        <div className="vc-head">
          <span className="vc-back">{CC_I.back({ width: 20, height: 20 })}</span>
          <BioAvatar shop={shop} size={40} />
          <div className="vc-who"><b>{shop.name}</b><small>{t('cc_online')} &middot; {shop.location}</small></div>
          <span className="vc-back">{CC_I.dots({ width: 18, height: 18 })}</span>
        </div>
        <div className="vc-feed">
          <div className="vc-day"><span>{t('cc_today')}</span></div>
          <div className="vc-msg in"><p>{t('cc_hi')} <b>{shop.name}</b>!{tagline ? ' ' + tagline : ''}</p><time>10:24</time></div>
          {products.length > 0 && (
            <div className="vc-msg in album">
              <div className={'vc-grid n' + Math.min(products.length, 4)}>
                {products.slice(0, 4).map((p) => {
                  const n = nm(p, lang);
                  return (
                    <Link key={p.id} to={`/${handle}/p/${p.id}`} className="vc-ph"><ProdImg p={p} name={n} /><em>{fmtPrice(p.price)}</em></Link>
                  );
                })}
              </div>
              <p>{t('cc_albums')}</p><time>10:24</time>
            </div>
          )}
          <div className="vc-msg out"><p>{t('cc_ask')}</p><time>10:25 &#10003;&#10003;</time></div>
          <div className="vc-msg in"><p>{t('cc_ans')}</p><time>10:25</time></div>
          <div className="vc-kb">
            {shopLink && <BioLink href={shopLink.href} className="vc-key big">{shopLink.iconFn({ width: 18, height: 18 })} {shopLink.label}</BioLink>}
            {rest.map(l => <BioLink key={l.key} href={l.href} className="vc-key">{l.iconFn({ width: 16, height: 16 })} {l.label}</BioLink>)}
          </div>
          <div className="vc-typing"><i></i><i></i><i></i></div>
        </div>
        <div className="vc-input"><span>{t('cc_msg')}</span><BioLink href={`/${handle}`} aria-label="send">{CC_I.send({ width: 18, height: 18 })}</BioLink></div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   CONCEPT: Ticket
   ──────────────────────────────────────────────── */
function BioTicket({ shop, handle, links, products, tagline, meta, cls, vars, lang }) {
  const shopLink = links.find(l => l.primary);
  const rest = links.filter(l => !l.primary);
  const now = new Date();
  return (
    <div className={cls} style={vars}>
      <div className="bio-card">
        <div className="tk-head">
          <span className="tk-admit">&star; {t('cc_admit')} &star;</span>
          <BioAvatar shop={shop} size={78} />
          <h1 className="tk-name">{shop.name}</h1>
          {tagline && <p className="tk-tag">{tagline}</p>}
          <span className="tk-meta">{meta}</span>
        </div>
        <div className="tk-list">
          {shopLink && (
            <BioLink href={shopLink.href} className="tk tk-big">
              <span className="tk-main"><small>{t('cc_entry')} &middot; rasta.uz</small><b>{shopLink.label}</b><span className="tk-row"><i>{shop.location}</i><i>{now.toLocaleDateString('en-GB')}</i></span></span>
              <span className="tk-stub"><span className="tk-bc"></span><em>&numero; 001</em></span>
            </BioLink>
          )}
          {rest.map((l, i) => (
            <BioLink key={l.key} href={l.href} className={'tk tk-c' + (i % 3 + 1)}>
              <span className="tk-main"><small>{l.label}</small><b>{l.sub}</b></span>
              <span className="tk-stub">{l.iconFn({ width: 22, height: 22 })}<em>&numero; 00{i + 2}</em></span>
            </BioLink>
          ))}
        </div>
        {products.length > 0 && (
          <div className="tk-prods">
            {products.map((p) => {
              const n = nm(p, lang);
              return (
                <Link key={p.id} to={`/${handle}/p/${p.id}`} className="tk-pc">
                  <span className="tk-pimg"><ProdImg p={p} name={n} /></span>
                  <span className="tk-pb"><b>{n}</b><em>{fmtPrice(p.price)}</em></span>
                </Link>
              );
            })}
          </div>
        )}
        <BioFoot />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   CONCEPT: Player / Vinyl
   ──────────────────────────────────────────────── */
function BioPlayer({ shop, handle, links, products, tagline, meta, cls, vars, lang }) {
  const shopLink = links.find(l => l.primary);
  const rest = links.filter(l => !l.primary);
  return (
    <div className={cls} style={vars}>
      <div className="bio-card">
        <div className="vy-card">
          <div className="vy-top">
            <span>{CC_I.back({ width: 18, height: 18, style: { transform: 'rotate(-90deg)' } })}</span>
            <small>{t('cc_from')}<b>rasta.uz/{handle}</b></small>
            <span>{CC_I.dots({ width: 18, height: 18 })}</span>
          </div>
          <div className="vy-art">
            <span className="vy-rec"><span className="vy-label"><BioAvatar shop={shop} size={64} /></span></span>
            <span className="vy-sleeve"><BioCover shop={shop} cls="vy-fill" /></span>
          </div>
          <div className="vy-meta">
            <div><h1 className="vy-name">{shop.name}</h1><p>{tagline || meta}</p></div>
            <span className="vy-heart">{CC_I.heart({ width: 24, height: 24 })}</span>
          </div>
          <div className="vy-prog"><i></i></div>
          <div className="vy-times"><span>1:24</span><span>{shop.location}</span></div>
          <div className="vy-ctrl">
            <span>{CC_I.prev({ width: 24, height: 24 })}</span>
            <BioLink href={shopLink ? shopLink.href : `/${handle}`} className="vy-play" aria-label={t('bio_open_shop')}>{CC_I.play({ width: 30, height: 30 })}</BioLink>
            <span>{CC_I.next({ width: 24, height: 24 })}</span>
          </div>
          {shopLink && <BioLink href={shopLink.href} className="vy-shop">{shopLink.label}</BioLink>}
        </div>
        <div className="vy-list">
          <div className="vy-lt">{t('cc_upnext')}</div>
          {rest.map((l, i) => (
            <BioLink key={l.key} href={l.href} className="vy-tr">
              <span className="vy-n">{i + 1}</span>
              <span className="vy-ic">{l.iconFn({ width: 18, height: 18 })}</span>
              <span className="vy-tx"><b>{l.label}</b><small>{l.sub}</small></span>
              {i === 0 ? <span className="vy-eq"><i></i><i></i><i></i></span> : <span className="vy-dur">{'3:' + String(12 + i * 9).padStart(2, '0')}</span>}
            </BioLink>
          ))}
        </div>
        {products.length > 0 && (
          <div className="vy-albums">
            <div className="vy-lt">{t('cc_albums')}</div>
            <div className="vy-row">
              {products.map((p) => {
                const n = nm(p, lang);
                return (
                  <Link key={p.id} to={`/${handle}/p/${p.id}`} className="vy-alb">
                    <span className="vy-aimg"><ProdImg p={p} name={n} /></span>
                    <b>{n}</b><small>{fmtPrice(p.price)}</small>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        <BioFoot />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   CONCEPT: Cover / Magazine
   ──────────────────────────────────────────────── */
function BioCoverLayout({ shop, handle, links, products, tagline, meta, cls, vars, lang }) {
  const shopLink = links.find(l => l.primary);
  const rest = links.filter(l => !l.primary);
  const now = new Date();
  return (
    <div className={cls} style={vars}>
      <div className="bio-card">
        <div className="vz-cover">
          <BioCover shop={shop} cls="vz-photo" />
          <div className="vz-top">
            <div className="vz-mast">{shop.name}</div>
            <div className="vz-issue">{t('cc_issue')} {now.getDate()} &middot; {shop.location} &middot; {now.getFullYear()}</div>
            {tagline && <div className="vz-dek">{tagline}</div>}
          </div>
          <div className="vz-lines">
            {rest.map(l => (
              <BioLink key={l.key} href={l.href} className="vz-line"><small>{l.label}</small><b>{l.sub}</b></BioLink>
            ))}
          </div>
          {shopLink && <BioLink href={shopLink.href} className="vz-burst"><span>{shopLink.label}</span></BioLink>}
          <div className="vz-bc"></div>
        </div>
        {products.length > 0 && (
          <div className="vz-inside">
            <div className="vz-ih"><b>{t('cc_inside')}</b><span>rasta.uz/{handle}</span></div>
            {products.map((p, i) => {
              const n = nm(p, lang);
              return (
                <Link key={p.id} to={`/${handle}/p/${p.id}`} className="vz-it">
                  <span className="vz-pg">{String(12 + i * 8)}</span>
                  <span className="vz-tx"><b>{n}</b><small>{fmtPrice(p.price)}</small></span>
                  <span className="vz-pimg"><ProdImg p={p} name={n} /></span>
                </Link>
              );
            })}
          </div>
        )}
        <BioFoot />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   VIVID: Bento
   ──────────────────────────────────────────────── */
function BioBento({ shop, handle, links, products, tagline, meta, cls, vars, lang }) {
  const shopLink = links.find(l => l.primary);
  const rest = links.filter(l => !l.primary);
  return (
    <div className={cls} style={vars}>
      <div className="bio-card">
        <div className="vb-grid">
          <div className="vb-tile vb-id">
            <BioAvatar shop={shop} size={68} />
            <div className="vb-id-tx"><h1 className="bio-name">{shop.name}</h1>{tagline && <p>{tagline}</p>}<span>{BIO_I.pin({ width: 13, height: 13 })} {meta}</span></div>
          </div>
          {shopLink && (
            <BioLink href={shopLink.href} className="vb-tile vb-shop">
              <span className="vb-shop-img">
                {products[0]
                  ? <ProdImg p={products[0]} name={nm(products[0], lang)} />
                  : <BioCover shop={shop} cls="vb-fill" />}
              </span>
              <span className="vb-shop-tx"><i>rasta.uz/{handle}</i><b>{shopLink.label}</b></span>
              <span className="vb-go">{vArrow(22)}</span>
            </BioLink>
          )}
          {rest.map((l, i) => (
            <BioLink key={l.key} href={l.href} className={'vb-tile vb-link vb-c' + (i % 3 + 1) + (rest.length % 2 && i === rest.length - 1 ? ' wide' : '')}>
              <span className="vb-ic">{l.iconFn({ width: 22, height: 22 })}</span>
              <span className="vb-lt"><b>{l.label}</b><small>{l.sub}</small></span>
              <span className="vb-arr">&nearr;</span>
            </BioLink>
          ))}
          {products.map((p) => {
            const n = nm(p, lang);
            return (
              <Link key={p.id} to={`/${handle}/p/${p.id}`} className="vb-tile vb-prod">
                <span className="vb-pimg"><ProdImg p={p} name={n} /><em>{fmtPrice(p.price)}</em></span>
                <span className="vb-pn">{n}</span>
              </Link>
            );
          })}
        </div>
        <BioFoot />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   VIVID: Sticker
   ──────────────────────────────────────────────── */
function BioSticker({ shop, handle, links, products, tagline, meta, cls, vars, lang }) {
  const shopLink = links.find(l => l.primary);
  const rest = links.filter(l => !l.primary);
  return (
    <div className={cls} style={vars}>
      <div className="bio-card">
        <div className="vs-head">
          <div className="vs-av"><BioAvatar shop={shop} size={112} /><span className="vs-star"><b>{shop.location}</b></span></div>
          <h1 className="vs-name">{shop.name}</h1>
          {tagline && <p className="vs-tag">{tagline}</p>}
        </div>
        <div className="vs-links">
          {shopLink && (
            <BioLink href={shopLink.href} className="vs-btn vs-shop">
              <span className="vs-ic">{shopLink.iconFn({ width: 24, height: 24 })}</span>
              <span className="vs-lt"><b>{shopLink.label}</b><small>{shopLink.sub}</small></span>
              <span className="vs-go">{vArrow(22)}</span>
            </BioLink>
          )}
          {rest.map((l, i) => (
            <BioLink key={l.key} href={l.href} className={'vs-btn vs-c' + (i % 3 + 1)} style={{ '--rot': (i % 2 ? 1.3 : -1.5) + 'deg' }}>
              <span className="vs-ic">{l.iconFn({ width: 21, height: 21 })}</span>
              <span className="vs-lt"><b>{l.label}</b><small>{l.sub}</small></span>
            </BioLink>
          ))}
        </div>
        {products.length > 0 && <div className="vs-h">{t('vb_scroll')} &darr;</div>}
        <div className="vs-prods">
          {products.map((p, i) => {
            const n = nm(p, lang);
            return (
              <Link key={p.id} to={`/${handle}/p/${p.id}`} className="vs-prod" style={{ '--rot': [-3, 2.4, 2, -2.6][i % 4] + 'deg' }}>
                <span className="vs-pimg"><ProdImg p={p} name={n} /></span>
                <span className="vs-pn">{n}</span>
                <span className="vs-price">{fmtPrice(p.price)}</span>
              </Link>
            );
          })}
        </div>
        <BioFoot />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   VIVID: Marquee
   ──────────────────────────────────────────────── */
function BioMarquee({ shop, handle, links, products, tagline, meta, cls, vars, lang }) {
  const txt = (shop.name + ' ★ ' + (shop.location || '') + ' ★ ' + t('bio_open_shop') + ' ★ ').toUpperCase();
  const Marq = ({ b }) => (
    <div className={'vm-marq' + (b ? ' b' : '')}>
      <div className="vm-track">{[0, 1, 2, 3, 4, 5].map(i => <span key={i}>{txt}</span>)}</div>
    </div>
  );
  return (
    <div className={cls} style={vars}>
      <Marq />
      <div className="bio-card">
        <div className="vm-top"><BioAvatar shop={shop} size={54} /><span>{meta}</span></div>
        <h1 className="vm-name">{shop.name}</h1>
        {tagline && <p className="vm-tag">{tagline}</p>}
        <div className="vm-rows">
          {links.map((l, i) => (
            <BioLink key={l.key} href={l.href} className={'vm-row' + (l.primary ? ' big' : '')}>
              <span className="vm-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="vm-lab"><b>{l.label}</b><small>{l.sub}</small></span>
              <span className="vm-go">{vArrow(28)}</span>
            </BioLink>
          ))}
        </div>
        {products.length > 0 && (
          <div className="vm-prods">
            {products.map((p) => {
              const n = nm(p, lang);
              return (
                <Link key={p.id} to={`/${handle}/p/${p.id}`} className="vm-prod">
                  <span className="vm-pimg"><ProdImg p={p} name={n} /></span>
                  <span className="vm-price">{fmtPrice(p.price)}</span>
                  <b>{n}</b>
                </Link>
              );
            })}
          </div>
        )}
        <BioFoot />
      </div>
      <Marq b />
    </div>
  );
}

/* ────────────────────────────────────────────────
   VIVID: Aurora
   ──────────────────────────────────────────────── */
function BioAurora({ shop, handle, links, products, tagline, meta, cls, vars, lang }) {
  const shopLink = links.find(l => l.primary);
  const rest = links.filter(l => !l.primary);
  return (
    <div className={cls} style={vars}>
      <span className="va-blob a"></span><span className="va-blob b"></span><span className="va-blob c"></span>
      <div className="bio-card va-glass">
        <div className="va-head">
          <span className="va-ring"><BioAvatar shop={shop} size={92} /></span>
          <h1 className="va-name">{shop.name}</h1>
          {tagline && <p className="va-tag">{tagline}</p>}
          <span className="va-meta">{meta}</span>
        </div>
        <div className="va-links">
          {shopLink && (
            <BioLink href={shopLink.href} className="va-btn va-shop">
              <span className="va-ic">{shopLink.iconFn({ width: 22, height: 22 })}</span>
              <span className="va-lt"><b>{shopLink.label}</b><small>{shopLink.sub}</small></span>
              {vArrow(20)}
            </BioLink>
          )}
          {rest.map(l => (
            <BioLink key={l.key} href={l.href} className="va-btn">
              <span className="va-ic">{l.iconFn({ width: 19, height: 19 })}</span>
              <span className="va-lt"><b>{l.label}</b><small>{l.sub}</small></span>
              {vArrow(16)}
            </BioLink>
          ))}
        </div>
        {products.length > 0 && (
          <div className="va-prods">
            {products.map((p) => {
              const n = nm(p, lang);
              return (
                <Link key={p.id} to={`/${handle}/p/${p.id}`} className="va-prod">
                  <span className="va-pimg"><ProdImg p={p} name={n} /></span>
                  <span className="va-pn">{n}</span><span className="va-pp">{fmtPrice(p.price)}</span>
                </Link>
              );
            })}
          </div>
        )}
        <BioFoot />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   VIVID: Ikat
   ──────────────────────────────────────────────── */
function BioIkat({ shop, handle, links, products, tagline, meta, cls, vars, lang }) {
  return (
    <div className={cls} style={vars}>
      <div className="vi-band"></div>
      <div className="bio-card">
        <div className="vi-head">
          <BioCover shop={shop} cls="vi-arch" />
          <div className="vi-orn"><i></i><i className="m"></i><i></i></div>
          <h1 className="vi-name">{shop.name}</h1>
          {tagline && <p className="vi-tag">{tagline}</p>}
          <span className="vi-meta">{meta}</span>
        </div>
        <div className="vi-links">
          {links.map(l => (
            <BioLink key={l.key} href={l.href} className={'vi-btn' + (l.primary ? ' vi-shop' : '')}>
              <span className="vi-ic">{l.iconFn({ width: 20, height: 20 })}</span>
              <span className="vi-lt"><b>{l.label}</b><small>{l.sub}</small></span>
              {vArrow(16)}
            </BioLink>
          ))}
        </div>
        {products.length > 0 && (
          <React.Fragment>
            <div className="vi-h"><i></i>{t('bio_featured')}<i></i></div>
            <div className="vi-prods">
              {products.map((p) => {
                const n = nm(p, lang);
                return (
                  <Link key={p.id} to={`/${handle}/p/${p.id}`} className="vi-prod">
                    <span className="vi-pimg"><ProdImg p={p} name={n} /></span>
                    <span className="vi-pn">{n}</span><span className="vi-pp">{fmtPrice(p.price)}</span>
                  </Link>
                );
              })}
            </div>
          </React.Fragment>
        )}
        <BioFoot />
      </div>
      <div className="vi-band"></div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   VIVID: Scrapbook
   ──────────────────────────────────────────────── */
function BioScrap({ shop, handle, links, products, tagline, meta, cls, vars, lang }) {
  const shopLink = links.find(l => l.primary);
  const rest = links.filter(l => !l.primary);
  return (
    <div className={cls} style={vars}>
      <div className="bio-card">
        <div className="vp-head">
          <span className="vp-pol">
            <span className="vp-tape"></span>
            <span className="vp-ph"><BioAvatar shop={shop} size={120} /></span>
            <span className="vp-cap">{shop.location}</span>
          </span>
          <h1 className="vp-name"><span>{shop.name}</span></h1>
          {tagline && <p className="vp-tag">{tagline}</p>}
        </div>
        <div className="vp-links">
          {shopLink && (
            <BioLink href={shopLink.href} className="vp-note vp-shop" style={{ '--rot': '-1.2deg' }}>
              <span className="vp-ic">{shopLink.iconFn({ width: 24, height: 24 })}</span>
              <span className="vp-lt"><b>{shopLink.label}</b><small>{shopLink.sub}</small></span>
              {vArrow(22)}
            </BioLink>
          )}
          {rest.map((l, i) => (
            <BioLink key={l.key} href={l.href} className="vp-note" style={{ '--rot': (i % 2 ? -.9 : 1.1) + 'deg' }}>
              <span className="vp-ic">{l.iconFn({ width: 20, height: 20 })}</span>
              <span className="vp-lt"><b>{l.label}</b><small>{l.sub}</small></span>
            </BioLink>
          ))}
        </div>
        {products.length > 0 && <div className="vp-h">{t('vb_scroll')} &darr;</div>}
        <div className="vp-wall">
          {products.map((p, i) => {
            const n = nm(p, lang);
            return (
              <Link key={p.id} to={`/${handle}/p/${p.id}`} className="vp-pp" style={{ '--rot': [-3.5, 2.5, 2, -2.5][i % 4] + 'deg' }}>
                <span className="vp-tape sm"></span>
                <span className="vp-pimg"><ProdImg p={p} name={n} /></span>
                <span className="vp-pn">{n}</span><span className="vp-price">{fmtPrice(p.price)}</span>
              </Link>
            );
          })}
        </div>
        <BioFoot />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN EXPORT — route to the correct layout
   ═══════════════════════════════════════════════ */
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

  const lang = getLang();
  const cfg = getBioConfig(bioConfig);
  const bg = BIO_BGS[cfg.bg];
  const vars = bioVars(cfg);
  const isDark = bg.dark;

  const shopType = shop.type ? t(`type_${shop.type}`) || shop.type : '';
  const tagline = taglineStr(shop, lang);
  const meta = [shop.location, shopType].filter(Boolean).join(' · ');
  const links = buildLinks(shop, handle);

  // Build CSS class
  const isVibe = VIBE_LAYOUTS.includes(cfg.layout);
  const cls = 'bio-page bio-l-' + cfg.layout + ' bio-btn-' + cfg.btn
    + (isVibe ? ' bio-v-' + cfg.layout : '')
    + (isDark ? ' bio-dark' : '');

  // Common props for all layouts
  const common = { shop, handle, links, products, tagline, meta, bg, cls, vars, lang };

  // Route to concept layouts
  switch (cfg.layout) {
    case 'os':       return <BioOS {...common} />;
    case 'receipt':  return <BioReceipt {...common} />;
    case 'chat':     return <BioChat {...common} />;
    case 'ticket':   return <BioTicket {...common} />;
    case 'player':   return <BioPlayer {...common} />;
    case 'cover':    return <BioCoverLayout {...common} />;
    case 'bento':    return <BioBento {...common} />;
    case 'sticker':  return <BioSticker {...common} />;
    case 'marquee':  return <BioMarquee {...common} />;
    case 'aurora':   return <BioAurora {...common} />;
    case 'ikat':     return <BioIkat {...common} />;
    case 'scrap':    return <BioScrap {...common} />;
    default:         return <BioClassicPage layout={cfg.layout} {...common} />;
  }
}
