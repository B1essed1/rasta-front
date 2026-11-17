import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { t } from '../../i18n';
import useBuyerStore from '../../store/buyerStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../ui/ToastHost';
import './buyer-parts.css';

// Save-a-shop heart. Guests are sent to log in (and come back here); signed-in
// buyers toggle the favourite. `label` shows the text version used on the shop page.
export default function FavHeart({ shopId, label }) {
  const navigate = useNavigate();
  const loc = useLocation();
  const token = useAuthStore((s) => s.token);
  const on = useBuyerStore((s) => s.favIds.includes(shopId));
  const loaded = useBuyerStore((s) => s.favLoaded);
  const fetchFavourites = useBuyerStore((s) => s.fetchFavourites);
  const toggle = useBuyerStore((s) => s.toggleFavourite);

  useEffect(() => { if (token && !loaded) fetchFavourites(); }, [token, loaded, fetchFavourites]);

  if (!shopId) return null;

  async function click(e) {
    e.stopPropagation();
    e.preventDefault();
    if (!token) {
      navigate('/login?next=' + encodeURIComponent(loc.pathname + loc.search));
      return;
    }
    try {
      const now = await toggle(shopId);
      toast(t(now ? 'fav_added' : 'fav_removed'));
    } catch {
      toast('Error', 'error');
    }
  }

  return (
    <button className={'fav-btn' + (on ? ' on' : '') + (label ? ' lab' : '')} aria-pressed={on}
      aria-label={t(on ? 'fav_remove' : 'fav_add')} onClick={click}>
      <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 20.5s-7.5-4.6-7.5-10.4A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.8c0 5.8-7.5 10.4-7.5 10.4Z" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
      {label && <span>{t(on ? 'fav_saved' : 'fav_save')}</span>}
    </button>
  );
}
