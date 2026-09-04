import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import LangPill from '../components/ui/LangPill';
import Stepper from '../components/ui/Stepper';
import { t, onLangChange } from '../i18n';
import { useAuthStore } from '../store/authStore';
import { useShopStore } from '../store/shopStore';
import { themes } from '../data/themes';
import { palettes } from '../data/palettes';
import { shopTypes, cities } from '../data/types';
import '../styles/onboarding.css';

const validPrefixes = ['90', '91', '93', '94', '95', '97', '98', '99', '33', '88', '77', '71'];

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
}

function AuthStep({ onNext }) {
  const [, setTick] = useState(0);
  const [phase, setPhase] = useState('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const inputsRef = useRef([]);
  const { sendOtp, verifyOtp, loading, token } = useAuthStore();

  useEffect(() => { return onLangChange(() => setTick((t) => t + 1)); }, []);
  useEffect(() => { if (token) onNext(); }, [token]);
  useEffect(() => {
    if (phase === 'otp' && timer > 0) {
      const id = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [timer, phase]);

  const digits = phone.replace(/\D/g, '');
  const isValid = digits.length === 9 && validPrefixes.includes(digits.slice(0, 2));

  async function handleSend(e) {
    e.preventDefault();
    if (!isValid) return;
    setError('');
    try {
      await sendOtp(`+998${digits}`);
      setPhase('otp');
      setTimer(60);
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
  }

  function handleOtpChange(i, value) {
    const d = value.replace(/\D/g, '');
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const nc = [...code];
      pasted.forEach((ch, j) => { if (i + j < 6) nc[i + j] = ch; });
      setCode(nc);
      inputsRef.current[Math.min(i + pasted.length, 5)]?.focus();
      if (nc.every((c) => c !== '')) submitOtp(nc.join(''));
      return;
    }
    const nc = [...code];
    nc[i] = d;
    setCode(nc);
    if (d && i < 5) inputsRef.current[i + 1]?.focus();
    if (nc.every((c) => c !== '')) submitOtp(nc.join(''));
  }

  function handleOtpKey(i, e) {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputsRef.current[i - 1]?.focus();
  }

  async function submitOtp(fullCode) {
    setError('');
    try {
      await verifyOtp(`+998${digits}`, fullCode);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code');
      setCode(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    }
  }

  if (phase === 'phone') {
    return (
      <form className="ob-step" onSubmit={handleSend}>
        <h2>{t('ob_auth_t')}</h2>
        <p>{t('au_sub')}</p>
        <label className="form-label">{t('au_phone_lbl')}</label>
        <div className="phone-input">
          <span className="phone-input__prefix">+998</span>
          <input
            type="tel"
            className="phone-input__field"
            placeholder="90 123 45 67"
            value={formatPhone(phone)}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
            autoFocus
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn--primary btn--block" type="submit" disabled={!isValid || loading}>
          {loading ? t('loading') : t('au_continue')}
        </button>
      </form>
    );
  }

  return (
    <div className="ob-step">
      <h2>{t('au_code_t')}</h2>
      <p>{t('au_code_sub')} <strong>+998{digits}</strong></p>
      <div className="otp-inputs">
        {code.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={6}
            className="otp-input"
            value={d}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleOtpKey(i, e)}
          />
        ))}
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="ob-step__row">
        <button className="btn btn--ghost btn--sm" onClick={() => setPhase('phone')} type="button">
          {t('au_wrong')}
        </button>
        <button
          className="btn btn--ghost btn--sm"
          onClick={async () => { await sendOtp(`+998${digits}`); setTimer(60); }}
          disabled={timer > 0}
          type="button"
        >
          {timer > 0 ? `${t('au_resend_in')} ${timer}s` : t('au_resend')}
        </button>
      </div>
    </div>
  );
}

function ShopStep({ data, onChange }) {
  const [, setTick] = useState(0);
  useEffect(() => { return onLangChange(() => setTick((t) => t + 1)); }, []);

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
            <option key={st.id} value={st.id}>{st.icon} {t(st.labelKey)}</option>
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
      const url = await uploadImage(file);
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
          <span className="ob-review__value">rasta.uz/{data.handle || '—'}</span>
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
          <p>rasta.uz/{data.handle}</p>
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
