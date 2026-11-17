import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { t, onLangChange } from '../../i18n';
import { I } from '../ui/Icons';
import useBuyerStore from '../../store/buyerStore';
import useBasketStore from '../../store/basketStore';
import { useAuthStore } from '../../store/authStore';
import { EZ_I, buyerInitials } from './BuyerKit';

// Header buyer controls: saved shops heart, basket (opens the basket drawer via
// the 'rasta-open-basket' window event) and the avatar / log in button.
export default function BuyerButton({ compact }) {
  const [, setTick] = useState(0);
  const navigate = useNavigate();
  const loc = useLocation();
  const token = useAuthStore((s) => s.token);
  const profile = useBuyerStore((s) => s.profile);
  const favCount = useBuyerStore((s) => s.favIds.length);
  const favLoaded = useBuyerStore((s) => s.favLoaded);
  const fetchProfile = useBuyerStore((s) => s.fetchProfile);
  const fetchFavourites = useBuyerStore((s) => s.fetchFavourites);
  const bn = useBasketStore((s) => Object.values(s.baskets).flat().reduce((n, l) => n + l.qty, 0));

  useEffect(() => onLangChange(() => setTick((n) => n + 1)), []);
  useEffect(() => {
    if (!token) return;
    if (!profile) fetchProfile();
    if (!favLoaded) fetchFavourites();
  }, [token, profile, favLoaded, fetchProfile, fetchFavourites]);

  const login = () => navigate('/login?next=' + encodeURIComponent(loc.pathname + loc.search));
  const heart = (
    <button className="by-hbag" onClick={() => (token ? navigate('/profile?tab=fav') : login())} aria-label={t('bp_t_fav')} title={t('bp_t_fav')}>
      {EZ_I.heart({ width: 20, height: 20 })}{token && favCount > 0 && <i>{favCount}</i>}
    </button>
  );
  const bag = (
    <button className="by-hbag" onClick={() => window.dispatchEvent(new CustomEvent('rasta-open-basket'))} aria-label={t('by_basket')}>
      {I.bag({ width: 20, height: 20 })}{bn > 0 && <i>{bn}</i>}
    </button>
  );

  if (!token) {
    return (
      <>{heart}{bag}
        <button className={'bp-btn guest' + (compact ? ' compact' : '')} onClick={login} aria-label={t('bp_login')}>
          {I.tg({ width: 16, height: 16 })}<span>{t('bp_login')}</span>
        </button>
      </>
    );
  }
  return (
    <>{heart}{bag}
      <button className={'bp-btn' + (compact ? ' compact' : '')} onClick={() => navigate('/profile')} aria-label={t('bp_profile')}>
        <span className="bp-av sm">{buyerInitials(profile?.name)}</span>
        <span className="bp-btn-n">{(profile?.name || '').split(' ')[0] || t('bp_profile')}</span>
      </button>
    </>
  );
}
