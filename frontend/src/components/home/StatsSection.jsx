import React from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Reveal from '../Reveal.jsx';

export default function StatsSection() {
  const { t } = useLanguage();

  const stats = [
    { value: '500+', label: t('stats.farmers') },
    { value: '1,200+', label: t('stats.listings') },
    { value: '50+', label: t('stats.buyers') },
    { value: 'AI', label: t('stats.smartInsights') },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-14">
      <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-display text-3xl sm:text-4xl font-semibold text-leafDeep">{s.value}</p>
            <p className="text-sm text-inkSoft mt-1">{s.label}</p>
          </div>
        ))}
      </Reveal>
      <p className="text-center text-xs text-inkSoft/70 mt-6">{t('stats.disclaimer')}</p>
    </section>
  );
}
