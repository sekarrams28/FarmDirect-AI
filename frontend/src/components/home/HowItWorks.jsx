import React from 'react';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Reveal from '../Reveal.jsx';

export default function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    { n: '01', title: t('how.step1Title'), body: t('how.step1Body') },
    { n: '02', title: t('how.step2Title'), body: t('how.step2Body') },
    { n: '03', title: t('how.step3Title'), body: t('how.step3Body') },
    { n: '04', title: t('how.step4Title'), body: t('how.step4Body') },
  ];

  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-14 scroll-mt-20">
      <Reveal className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold text-ink">{t('how.heading')}</h2>
        <p className="text-inkSoft mt-3">{t('how.sub')}</p>
      </Reveal>

      <div className="mt-12 flex flex-col lg:flex-row lg:items-stretch gap-6 lg:gap-4">
        {steps.map((s, i) => (
          <React.Fragment key={s.n}>
            <Reveal delay={i * 100} className="flex-1">
              <div className="card h-full">
                <span className="font-display text-3xl font-semibold text-turmericDeep">{s.n}</span>
                <h3 className="font-display text-lg font-semibold mt-2 text-ink">{s.title}</h3>
                <p className="text-sm text-inkSoft mt-2">{s.body}</p>
              </div>
            </Reveal>

            {i < steps.length - 1 && (
              <div className="flex items-center justify-center text-leaf/50 lg:py-0 py-1">
                <ArrowDown size={20} className="lg:hidden" />
                <ArrowRight size={20} className="hidden lg:block" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
