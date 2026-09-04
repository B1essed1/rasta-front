import React, { useState, useEffect } from 'react';
import { getLang, setLang, onLangChange } from '../../i18n';

const languages = [
  { code: 'uz', label: 'UZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

export default function LangPill({ className = '' }) {
  const [current, setCurrent] = useState(getLang());

  useEffect(() => {
    return onLangChange((lang) => setCurrent(lang));
  }, []);

  function handleClick(code) {
    setLang(code);
    setCurrent(code);
  }

  return (
    <div className={`lang ${className}`}>
      {languages.map((l) => (
        <button
          key={l.code}
          className={current === l.code ? 'active' : ''}
          onClick={() => handleClick(l.code)}
          type="button"
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
