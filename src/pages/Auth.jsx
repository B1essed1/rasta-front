import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import LangPill from '../components/ui/LangPill';
import { t, onLangChange } from '../i18n';
import { useAuthStore } from '../store/authStore';
import { useShopStore } from '../store/shopStore';
import '../styles/app.css';

/* ---- demo accounts ---- */
const DEMO_ACCOUNTS = [
  { name: 'Dilnoza Karimova', username: '@dilnoza_k', phone: '901234567' },
  { name: 'Jasur Alimov', username: '@jasur_dev', phone: '935556677' },
  { name: 'Malika Rashidova', username: '@malika_r', phone: '977788899' },
];

function pickDemo() {
  return DEMO_ACCOUNTS[Math.floor(Math.random() * DEMO_ACCOUNTS.length)];
}

/* ---- SVG icons ---- */
function TelegramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.05 2.56a1.01 1.01 0 00-1.04-.15L2.4 10.33a1 1 0 00.07 1.87l4.58 1.47 1.73 5.43a1 1 0 001.72.32l2.45-2.72 4.37 3.24a1 1 0 001.56-.52l3.37-15.5a1.01 1.01 0 00-.2-.86zM9.67 14.26l-.91 2.76-.99-3.11 9.32-7.2-7.42 7.55z" fill="currentColor"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.36 1.6.68 2.35a2 2 0 01-.45 2.11L8.09 9.43a16 16 0 006.49 6.49l1.25-1.25a2 2 0 012.11-.45c.75.32 1.54.55 2.35.68A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ---- Telegram Sim modal ---- */
function TelegramSim({ onDone, onClose }) {
  const [, setTick] = useState(0);
  const [demo] = useState(pickDemo);
  const [phone, setPhone] = useState(demo.phone);
  const [showConfirm, setShowConfirm] = useState(false);
  const [shared, setShared] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const telegramLogin = useAuthStore((s) => s.telegramLogin);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  const botMsg = (t('tg_bot_hi') || '').replace('{name}', demo.name.split(' ')[0]);

  async function handleConfirmShare() {
    setBusy(true);
    setError('');
    try {
      const fullPhone = `+998${phone.replace(/\D/g, '')}`;
      await telegramLogin(fullPhone, { name: demo.name, username: demo.username });
      setShared(true);
      setBusy(false);
      setTimeout(() => onDone(), 800);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error');
      setBusy(false);
      setShowConfirm(false);
    }
  }

  return (
    <div className="tg-scrim" onClick={onClose}>
      <div className="tg-app" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        {/* Header */}
        <div className="tg-head">
          <button className="tg-x" onClick={onClose}><CloseIcon /></button>
          <div className="tg-bav">R</div>
          <div className="tg-who">
            <b>{t('tg_bot')}</b>
            <small>bot</small>
          </div>
        </div>

        {/* Chat feed */}
        <div className="tg-feed">
          <div className="tg-msg in">
            {botMsg}
            <time>{timeStr}</time>
          </div>

          {shared && (
            <div className="tg-msg out contact">
              <PhoneIcon />
              <div>
                <b>{demo.name}</b>
                <small>+998 {phone}</small>
              </div>
              <time>{timeStr}</time>
            </div>
          )}

          {shared && (
            <div className="tg-msg in">
              {t('tg_done')}
              <time>{timeStr}</time>
            </div>
          )}

          {error && (
            <div className="tg-msg in" style={{ color: '#ff6b6b' }}>
              {error}
              <time>{timeStr}</time>
            </div>
          )}
        </div>

        {/* Demo panel */}
        <div className="tg-demo">
          <b>{t('tg_demo')} (simulation)</b>
          <div>{demo.name} &middot; {demo.username}</div>
          <label>
            {t('tg_demo_ph')}:
            <span className="tg-ph">
              <i>+998</i>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
              />
            </span>
          </label>
        </div>

        {/* Keyboard button */}
        <div className="tg-kb">
          <button
            className="tg-key"
            disabled={shared || busy || phone.replace(/\D/g, '').length < 9}
            onClick={() => setShowConfirm(true)}
          >
            {busy ? <span className="tg-spin" /> : <PhoneIcon />}
            {t('tg_share')}
          </button>
        </div>

        {/* Confirm dialog */}
        {showConfirm && !shared && (
          <div className="tg-dlg-wrap">
            <div className="tg-dlg">
              <b>{t('tg_confirm_t')}</b>
              <p>{t('tg_confirm_d')}</p>
              <div className="tg-dlg-acts">
                <button onClick={() => setShowConfirm(false)}>{t('tg_cancel')}</button>
                <button className="ok" onClick={handleConfirmShare} disabled={busy}>
                  {busy ? <span className="tg-spin" /> : t('tg_ok')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Main Auth page ---- */
export default function Auth() {
  const [, setTick] = useState(0);
  const [showSim, setShowSim] = useState(false);
  const [opening, setOpening] = useState(false);
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const fetchMyShops = useShopStore((s) => s.fetchMyShops);
  const fetchShop = useShopStore((s) => s.fetchShop);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    if (token) {
      fetchMyShops().then((shops) => {
        if (shops.length > 0) {
          fetchShop(shops[0].id).then(() =>
            navigate('/dashboard', { replace: true })
          );
        } else {
          navigate('/onboarding', { replace: true });
        }
      });
    }
  }, [token, navigate, fetchMyShops, fetchShop]);

  const handleTelegramClick = useCallback(() => {
    setOpening(true);
    setTimeout(() => {
      setOpening(false);
      setShowSim(true);
    }, 600);
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-page__header">
        <Logo size={36} />
        <LangPill />
      </div>
      <div className="auth-page__card tg-auth">
        <div className="ob-head" style={{ textAlign: 'center', marginBottom: 8 }}>
          <h2 className="auth-form__title">{t('tg_title')}</h2>
          <p className="auth-form__sub">{t('tg_sub')}</p>
        </div>

        <ul className="tg-why">
          <li>
            <CheckIcon /> {t('tg_why1')}
          </li>
          <li>
            <CheckIcon /> {t('tg_why2')}
          </li>
          <li>
            <CheckIcon /> {t('tg_why3')}
          </li>
        </ul>

        <button
          className="tg-btn"
          onClick={handleTelegramClick}
          disabled={opening}
        >
          {opening ? (
            <>
              <span className="tg-spin" />
              {t('tg_open')}
            </>
          ) : (
            <>
              <TelegramIcon />
              {t('tg_btn')}
            </>
          )}
        </button>

        <p className="auth-consent">{t('tg_consent')}</p>
      </div>

      {showSim && (
        <TelegramSim
          onDone={() => {
            setShowSim(false);
          }}
          onClose={() => setShowSim(false)}
        />
      )}
    </div>
  );
}
