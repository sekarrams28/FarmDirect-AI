import React from 'react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext.jsx';

export default function LanguageSwitcher() {
  const { lang, changeLang } = useLanguage();

  return (
    <select
      value={lang}
      onChange={(e) => changeLang(e.target.value)}
      aria-label="Select language"
      className="text-xs font-medium border border-ink/15 rounded-full px-3 py-1.5 bg-white text-inkSoft hover:border-ink/30 transition-colors focus:outline-none focus:ring-2 focus:ring-leaf/40"
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
