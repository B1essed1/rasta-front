import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import LangPill from '../components/ui/LangPill';
import Stepper from '../components/ui/Stepper';
import { t, onLangChange } from '../i18n';
import { useAuthStore } from '../store/authStore';
import { useShopStore } from '../store/shopStore';
import { themes } from '../data/themes';
import { palettes } from '../data/palettes';
import { shopTypes as fallbackShopTypes, cities, fetchShopTypes, getCategoryName } from '../data/types';
import '../styles/onboarding.css';

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

function TelegramMark() {
  return (
    <svg className="tg-mark" viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="22" fill="#2AABEE"/>
      <path d="M31.5 13.5l-3.4 15.6a1 1 0 01-1.56.52l-4.37-3.24-2.45 2.72a1 1 0 01-1.72-.32l-1.73-5.43-4.58-1.47a1 1 0 01-.07-1.87l18.6-7.92a1.01 1.01 0 011.28 1.01z" fill="#fff"/>
    </svg>
  );
}

/* ---- Telegram Sim modal (shared by Auth page and Onboarding) ---- */
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

/* ---- AuthStep for Onboarding (Telegram-based) ---- */
function AuthStep({ onNext }) {
  const [, setTick] = useState(0);
  const [showSim, setShowSim] = useState(false);
  const [opening, setOpening] = useState(false);
  const { token, user } = useAuthStore();

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    if (token) onNext();
  }, [token]);

  const handleTelegramClick = useCallback(() => {
    setOpening(true);
    setTimeout(() => {
      setOpening(false);
      setShowSim(true);
    }, 600);
  }, []);

  /* Already authenticated: show verified state */
  if (token && user) {
    return (
      <div className="ob-step tg-auth">
        <h2>{t('ob_auth_t')}</h2>
        <div className="verified-row">
          <TelegramMark />
          <div>
            <b>{user.name || user.phone || 'User'}</b>
            <small>{user.phone}</small>
          </div>
          <button
            className="btn btn--ghost btn--sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => {
              useAuthStore.getState().logout();
            }}
          >
            {t('tg_back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ob-step tg-auth">
      <h2>{t('tg_title')}</h2>
      <p>{t('tg_sub')}</p>

      <ul className="tg-why">
        <li><CheckIcon /> {t('tg_why1')}</li>
        <li><CheckIcon /> {t('tg_why2')}</li>
        <li><CheckIcon /> {t('tg_why3')}</li>
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

      {showSim && (
        <TelegramSim
          onDone={() => setShowSim(false)}
          onClose={() => setShowSim(false)}
        />
      )}
    </div>
  );
}

function ShopStep({ data, onChange }) {
  const [, setTick] = useState(0);
  const [shopTypes, setShopTypes] = useState(fallbackShopTypes);
  useEffect(() => { return onLangChange(() => setTick((t) => t + 1)); }, []);
  useEffect(() => { fetchShopTypes().then(setShopTypes); }, []);

  function handleChange(field, value) {
    onChange({ ...data, [field]: value });
  }

  function handleNameChange(value) {
    const handle = value
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 30);
    onChange({ ...data, name: value, handle });
  }

  return (
    <div className="ob-step">
      <h2>{t('ob_shop_t')}</h2>
      <div className="form-group">
        <label className="form-label">{t('ob_shop_name')}</label>
        <input
          type="text"
          className="form-input"
          value={data.name || ''}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="My Awesome Shop"
        />
      </div>
      <div className="form-group">
        <label className="form-label">{t('ob_handle')}</label>
        <div className="handle-input">
          <span className="handle-input__prefix">{t('ob_handle_hint')}</span>
          <input
            type="text"
            className="handle-input__field"
            value={data.handle || ''}
            onChange={(e) => handleChange('handle', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30))}
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">{t('ob_category')}</label>
        <select
          className="form-select"
          value={data.type || ''}
          onChange={(e) => handleChange('type', e.target.value)}
        >
          <option value="">{t('ob_category')}</option>
          {shopTypes.map((st) => (
            <option key={st.id} value={st.id}>{getCategoryName(st)}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">{t('ob_city')}</label>
        <select
          className="form-select"
          value={data.city || ''}
          onChange={(e) => handleChange('city', e.target.value)}
        >
          <option value="">{t('ob_city')}</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">{t('ob_telegram')}</label>
        <input
          type="text"
          className="form-input"
          placeholder="@username"
          value={data.telegram || ''}
          onChange={(e) => handleChange('telegram', e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="form-label">{t('ob_instagram')}</label>
        <input
          type="text"
          className="form-input"
          placeholder="@username"
          value={data.instagram || ''}
          onChange={(e) => handleChange('instagram', e.target.value)}
        />
      </div>
    </div>
  );
}

function BrandStep({ data, onChange }) {
  const [, setTick] = useState(0);
  const uploadImage = useShopStore((s) => s.uploadImage);
  useEffect(() => { return onLangChange(() => setTick((t) => t + 1)); }, []);

  async function handleFileUpload(field, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadImage(file);
      onChange({ ...data, [field]: url });
    } catch {
      const reader = new FileReader();
      reader.onload = () => onChange({ ...data, [field]: reader.result });
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="ob-step">
      <h2>{t('ob_brand_t')}</h2>
      <div className="form-group">
        <label className="form-label">{t('ob_cover')}</label>
        <div className="upload-area">
          {data.coverUrl ? (
            <img src={data.coverUrl} alt="Cover" className="upload-area__preview" />
          ) : (
            <div className="upload-area__placeholder">{t('ob_upload')}</div>
          )}
          <input type="file" accept="image/*" onChange={(e) => handleFileUpload('coverUrl', e)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">{t('ob_logo')}</label>
        <div className="upload-area upload-area--small">
          {data.logoUrl ? (
            <img src={data.logoUrl} alt="Logo" className="upload-area__preview--round" />
          ) : (
            <div className="upload-area__placeholder">{t('ob_upload')}</div>
          )}
          <input type="file" accept="image/*" onChange={(e) => handleFileUpload('logoUrl', e)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">{t('db_theme')}</label>
        <div className="theme-picker">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`theme-picker__btn ${data.themeId === theme.id ? 'theme-picker__btn--active' : ''}`}
              style={{ fontFamily: theme.family, borderRadius: theme.radius, backgroundColor: theme.preview.surface }}
              onClick={() => onChange({ ...data, themeId: theme.id })}
            >
              {t(theme.nameKey)}
            </button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">{t('db_accent')}</label>
        <div className="palette-picker">
          {palettes.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`palette-picker__btn ${data.paletteId === p.id ? 'palette-picker__btn--active' : ''}`}
              style={{ backgroundColor: p.accent }}
              title={p.name}
              onClick={() => onChange({ ...data, paletteId: p.id })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanStep({ data, onChange }) {
  const [, setTick] = useState(0);
  const [billing, setBilling] = useState('monthly');
  useEffect(() => { return onLangChange(() => setTick((t) => t + 1)); }, []);

  const plans = [
    {
      id: 'starter',
      name: t('price_starter'),
      price: billing === 'monthly' ? 99000 : 79200,
      features: [t('price_starter_f1'), t('price_starter_f2'), t('price_starter_f3'), t('price_starter_f4')],
    },
    {
      id: 'pro',
      name: t('price_pro'),
      price: billing === 'monthly' ? 199000 : 159200,
      features: [t('price_pro_f1'), t('price_pro_f2'), t('price_pro_f3'), t('price_pro_f4')],
      featured: true,
    },
  ];

  return (
    <div className="ob-step">
      <h2>{t('ob_plan_t')}</h2>
      <div className="billing-toggle">
        <button
          type="button"
          className={`billing-toggle__btn ${billing === 'monthly' ? 'billing-toggle__btn--active' : ''}`}
          onClick={() => setBilling('monthly')}
        >
          {t('monthly')}
        </button>
        <button
          type="button"
          className={`billing-toggle__btn ${billing === 'yearly' ? 'billing-toggle__btn--active' : ''}`}
          onClick={() => setBilling('yearly')}
        >
          {t('yearly')} (-20%)
        </button>
      </div>
      <div className="ob-plans">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`ob-plan-card ${data.plan === plan.id ? 'ob-plan-card--selected' : ''} ${plan.featured ? 'ob-plan-card--featured' : ''}`}
            onClick={() => onChange({ ...data, plan: plan.id, billing })}
          >
            <div className="ob-plan-card__badge">{t('price_free_trial')}</div>
            <h3>{plan.name}</h3>
            <div className="ob-plan-card__price">
              {plan.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} {t('som')}{billing === 'monthly' ? t('price_mo') : '/yr'}
            </div>
            <ul>
              {plan.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewStep({ data }) {
  const [, setTick] = useState(0);
  useEffect(() => { return onLangChange(() => setTick((t) => t + 1)); }, []);

  return (
    <div className="ob-step">
      <h2>{t('ob_review_t')}</h2>
      <div className="ob-review">
        <div className="ob-review__item">
          <span className="ob-review__label">{t('ob_shop_name')}</span>
          <span className="ob-review__value">{data.name || '—'}</span>
        </div>
        <div className="ob-review__item">
          <span className="ob-review__label">{t('ob_handle')}</span>
          <span className="ob-review__value">labaratory.rastashops.com/{data.handle || '—'}</span>
        </div>
        <div className="ob-review__item">
          <span className="ob-review__label">{t('ob_category')}</span>
          <span className="ob-review__value">{data.type || '—'}</span>
        </div>
        <div className="ob-review__item">
          <span className="ob-review__label">{t('ob_city')}</span>
          <span className="ob-review__value">{data.city || '—'}</span>
        </div>
        <div className="ob-review__item">
          <span className="ob-review__label">{t('db_theme')}</span>
          <span className="ob-review__value">{data.themeId || 'minimal'}</span>
        </div>
        <div className="ob-review__item">
          <span className="ob-review__label">{t('ob_plan_t')}</span>
          <span className="ob-review__value">{data.plan || 'starter'}</span>
        </div>
        {data.coverUrl && (
          <div className="ob-review__cover">
            <img src={data.coverUrl} alt="Cover" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Onboarding() {
  const [, setTick] = useState(0);
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '',
    handle: '',
    type: '',
    city: '',
    telegram: '',
    instagram: '',
    coverUrl: '',
    logoUrl: '',
    themeId: 'minimal',
    paletteId: 'ivory',
    plan: 'starter',
    billing: 'monthly',
  });
  const [published, setPublished] = useState(false);
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const createShop = useShopStore((s) => s.createShop);
  const loading = useShopStore((s) => s.loading);

  useEffect(() => { return onLangChange(() => setTick((t) => t + 1)); }, []);

  const stepLabels = [t('ob_auth_t'), t('ob_shop_t'), t('ob_brand_t'), t('ob_plan_t'), t('ob_review_t')];

  function canProceed() {
    if (step === 0) return !!token;
    if (step === 1) return data.name && data.handle;
    return true;
  }

  async function handlePublish() {
    try {
      await createShop(data);
      setPublished(true);
    } catch (err) {
      console.error(err);
    }
  }

  if (published) {
    return (
      <div className="ob-page">
        <div className="ob-page__header">
          <Logo size={36} />
          <LangPill />
        </div>
        <div className="ob-page__card ob-congrats">
          <div className="ob-congrats__icon">&#127881;</div>
          <h2>{t('ob_congrats')}</h2>
          <p>labaratory.rastashops.com/{data.handle}</p>
          <div className="ob-congrats__actions">
            <button className="btn btn--primary" onClick={() => navigate('/dashboard')}>
              {t('ob_go_dashboard')}
            </button>
            <button className="btn btn--outline" onClick={() => navigate(`/${data.handle}`)}>
              {t('ob_go_shop')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ob-page">
      <div className="ob-page__header">
        <Logo size={36} />
        <LangPill />
      </div>
      <div className="ob-page__stepper">
        <Stepper steps={stepLabels} current={step} onStepClick={(i) => setStep(i)} />
      </div>
      <div className="ob-page__card">
        {step === 0 && <AuthStep onNext={() => setStep(1)} />}
        {step === 1 && <ShopStep data={data} onChange={setData} />}
        {step === 2 && <BrandStep data={data} onChange={setData} />}
        {step === 3 && <PlanStep data={data} onChange={setData} />}
        {step === 4 && <ReviewStep data={data} />}

        {step > 0 && (
          <div className="ob-step__footer">
            <button className="btn btn--ghost" onClick={() => setStep(step - 1)} type="button">
              {t('ob_back')}
            </button>
            {step < 4 ? (
              <button
                className="btn btn--primary"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                type="button"
              >
                {t('ob_next')}
              </button>
            ) : (
              <button
                className="btn btn--primary"
                onClick={handlePublish}
                disabled={loading}
                type="button"
              >
                {loading ? t('loading') : t('ob_publish')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
