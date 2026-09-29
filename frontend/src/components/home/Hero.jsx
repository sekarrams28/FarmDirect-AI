import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, TrendingUp, Brain, Users2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Hero() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const indicators = [
    { icon: TrendingUp, label: t('hero.betterPrices') },
    { icon: Brain, label: t('nav.aiInsights') },
    { icon: Users2, label: t('hero.directBuyers') },
  ];

  return (
    <section className="px-0 sm:px-4 pt-0 sm:pt-6">
      <div
        className="
          relative overflow-hidden isolate
          min-h-[600px] sm:min-h-[620px] lg:min-h-[680px]
          flex items-center
          sm:rounded-3xl
        "
      >
        {/* Background photo — farm scene only, no text/UI baked into the image */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-[25%_30%] md:bg-[55%_28%]"
          style={{ backgroundImage: "url('/farmer-hero.png')" }}
        />

        {/* Dark green/black gradient overlay for text readability, kept subtle so the farmer stays visible */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-soil/90 via-soil/55 to-soil/20"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-soil/70 via-transparent to-transparent"
        />

        <div className="relative max-w-6xl mx-auto px-6 py-20 w-full">
          <div className="max-w-xl fade-in">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wide bg-turmericSoft text-turmericDeep border border-turmeric/40 rounded-full px-3 py-1.5 mb-6">
              <Sparkles size={12} /> {t('hero.badge')}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold leading-tight text-white">
              {t('hero.title')}
            </h1>

            <p className="mt-5 text-white/85 text-lg max-w-lg">{t('hero.sub')}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/marketplace" className="btn-primary">
                {t('hero.exploreBtn')} <ArrowRight size={16} />
              </Link>
              {(!user || user.role === 'farmer') && (
                <Link
                  to={user ? '/dashboard/farmer/list' : '/register'}
                  className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl bg-white/10 text-white border border-white/40 backdrop-blur-sm transition-all duration-200 ease-smooth hover:bg-white/20 hover:-translate-y-0.5"
                >
                  {t('hero.listBtn')}
                </Link>
              )}
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              {indicators.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-white/90 text-sm font-medium">
                  <span className="w-7 h-7 rounded-full bg-white/15 border border-white/30 flex items-center justify-center">
                    <Icon size={14} />
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
