import React from 'react';
import { Handshake, Brain, IndianRupee, Users } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Reveal from '../Reveal.jsx';

export default function FarmerBenefits() {
  const { t } = useLanguage();

  const benefits = [
    { icon: Handshake, title: t('benefits.sellTitle'), body: t('benefits.sellBody') },
    { icon: Brain, title: t('benefits.decisionsTitle'), body: t('benefits.decisionsBody') },
    { icon: IndianRupee, title: t('benefits.pricesTitle'), body: t('benefits.pricesBody') },
    { icon: Users, title: t('benefits.reachTitle'), body: t('benefits.reachBody') },
  ];

  return (
    <section id="about" className="max-w-6xl mx-auto px-6 py-14 scroll-mt-20">
      <Reveal className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold text-ink">{t('benefits.heading')}</h2>
        <p className="text-inkSoft mt-3">{t('benefits.sub')}</p>
      </Reveal>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {benefits.map(({ icon: Icon, title, body }, i) => (
          <Reveal key={title} delay={i * 80}>
            <div className="text-center sm:text-left">
              <span className="w-12 h-12 rounded-2xl bg-leafLight text-leaf flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <Icon size={20} />
              </span>
              <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
              <p className="text-sm text-inkSoft mt-2">{body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
