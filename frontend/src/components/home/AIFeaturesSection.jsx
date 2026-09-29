import React from 'react';
import { Sparkles, TrendingUp, Users, Truck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Reveal from '../Reveal.jsx';

export default function AIFeaturesSection() {
  const { t } = useLanguage();

  const features = [
    { icon: Sparkles, title: t('features.priceTitle'), body: t('features.priceBody') },
    { icon: TrendingUp, title: t('features.demandTitle'), body: t('features.demandBody') },
    { icon: Users, title: t('features.matchingTitle'), body: t('features.matchingBody') },
    { icon: Truck, title: t('features.logisticsTitle'), body: t('features.logisticsBody') },
  ];

  return (
    <section id="ai-features" className="max-w-6xl mx-auto px-6 py-14 scroll-mt-20">
      <Reveal as="div" className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold text-ink">{t('features.heading')}</h2>
        <p className="text-inkSoft mt-3">{t('features.sub')}</p>
      </Reveal>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map(({ icon: Icon, title, body }, i) => (
          <Reveal key={title} delay={i * 80}>
            <div className="card card-hover h-full bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-full bg-leafLight text-leaf flex items-center justify-center">
                  <Icon size={18} />
                </span>
                <span className="badge badge-ai">{t('features.aiPowered')}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
              <p className="text-sm text-inkSoft mt-2">{body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
