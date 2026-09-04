import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import LangPill from '../components/ui/LangPill';
import { t, onLangChange } from '../i18n';
import { useAuthStore } from '../store/authStore';
import { useShopStore } from '../store/shopStore';
import '../styles/app.css';

const validPrefixes = ['90', '91', '93', '94', '95', '97', '98', '99', '33', '88', '77', '71'];

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
}

function PhoneStep({ onNext }) {
  const [, setTick] = useState(0);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  const digits = phone.replace(/\D/g, '');
  const isValid = digits.length === 9 && validPrefixes.includes(digits.slice(0, 2));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) {
      setError('Invalid phone number');
      return;
    }
    setError('');
    try {
      await sendOtp(`+998${digits}`);
      onNext(`+998${digits}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1 className="auth-form__title">{t('au_title')}</h1>
      <p className="auth-form__sub">{t('au_sub')}</p>

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

      <button
        className="btn btn--primary btn--block btn--lg"
        type="submit"
        disabled={!isValid || loading}
      >
        {loading ? t('loading') : t('au_continue')}
      </button>

      <p className="auth-form__terms">{t('au_terms')}</p>
    </form>
  );
}

function OtpStep({ phone, onBack, onSuccess }) {
  const [, setTick] = useState(0);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const inputsRef = useRef([]);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const id = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [timer]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  function handleChange(i, value) {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newCode = [...code];
      pasted.forEach((d, j) => {
        if (i + j < 6) newCode[i + j] = d;
      });
      setCode(newCode);
      const nextIdx = Math.min(i + pasted.length, 5);
      inputsRef.current[nextIdx]?.focus();
      if (newCode.every((d) => d !== '')) {
        submitCode(newCode.join(''));
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newCode = [...code];
    newCode[i] = digit;
    setCode(newCode);

    if (digit && i < 5) {
      inputsRef.current[i + 1]?.focus();
    }

    if (newCode.every((d) => d !== '')) {
      submitCode(newCode.join(''));
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newCode = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
      setCode(newCode);
      const nextIdx = Math.min(pasted.length, 5);
      inputsRef.current[nextIdx]?.focus();
      if (newCode.every((d) => d !== '')) {
        submitCode(newCode.join(''));
      }
    }
  }

  async function submitCode(fullCode) {
    setError('');
    try {
      await verifyOtp(phone, fullCode);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code');
      setCode(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    }
  }

  async function handleResend() {
    if (timer > 0) return;
    try {
      await sendOtp(phone);
      setTimer(60);
      setCode(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError('Could not resend code');
    }
  }

  return (
    <div className="auth-form">
      <h1 className="auth-form__title">{t('au_code_t')}</h1>
      <p className="auth-form__sub">
        {t('au_code_sub')} <strong>{phone}</strong>
      </p>

      <div className="otp-inputs" onPaste={handlePaste}>
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={6}
            className="otp-input"
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
          />
        ))}
      </div>
      {error && <p className="form-error">{error}</p>}

      <div className="auth-form__actions">
        <button className="btn btn--ghost btn--sm" onClick={onBack} type="button">
          {t('au_wrong')}
        </button>
        <button
          className="btn btn--ghost btn--sm"
          onClick={handleResend}
          disabled={timer > 0}
          type="button"
        >
          {timer > 0 ? `${t('au_resend_in')} ${timer}s` : t('au_resend')}
        </button>
      </div>

      {loading && <p className="auth-form__loading">{t('loading')}</p>}
    </div>
  );
}

export default function Auth() {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const fetchMyShops = useShopStore((s) => s.fetchMyShops);
  const fetchShop = useShopStore((s) => s.fetchShop);

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

  return (
    <div className="auth-page">
      <div className="auth-page__header">
        <Logo size={36} />
        <LangPill />
      </div>
      <div className="auth-page__card">
        {step === 'phone' ? (
          <PhoneStep
            onNext={(ph) => {
              setPhone(ph);
              setStep('otp');
            }}
          />
        ) : (
          <OtpStep
            phone={phone}
            onBack={() => setStep('phone')}
            onSuccess={() => navigate('/dashboard')}
          />
        )}
      </div>
    </div>
  );
}
