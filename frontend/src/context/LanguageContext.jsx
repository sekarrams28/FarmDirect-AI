import React, { createContext, useContext, useState, useMemo } from 'react';
import en from '../i18n/en.json';
import ta from '../i18n/ta.json';
import hi from '../i18n/hi.json';
import te from '../i18n/te.json';
import kn from '../i18n/kn.json';
import mr from '../i18n/mr.json';
import bn from '../i18n/bn.json';

const DICTS = { en, hi, ta, te, kn, mr, bn };

// English is first and is the fallback (see t() below), matching the default
// lang state further down. The rest are ordered by number of speakers.
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('fd_lang') || 'en');

  function changeLang(code) {
    setLang(code);
    localStorage.setItem('fd_lang', code);
  }

  const t = useMemo(() => {
    const dict = DICTS[lang] || DICTS.en;
    return (key) => dict[key] ?? DICTS.en[key] ?? key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
