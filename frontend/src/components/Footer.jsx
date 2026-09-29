import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-soil text-[#C9D0C4] mt-24">
      <div className="max-w-6xl mx-auto px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display font-semibold text-white text-lg flex items-center gap-2">
            <span aria-hidden="true">🌾</span> FarmDirect AI
          </p>
          <p className="text-sm mt-3 text-[#AEB6A2] max-w-xs">{t('footer.tagline')}</p>
        </div>

        <div className="text-sm">
          <p className="font-semibold text-white mb-3 text-xs tracking-wide uppercase">{t('footer.platform')}</p>
          <ul className="space-y-2 text-[#AEB6A2]">
            <li><Link to="/marketplace" className="hover:text-white transition-colors">{t('nav.marketplace')}</Link></li>
            <li><Link to="/dashboard/farmer/list" className="hover:text-white transition-colors">{t('footer.listProduce')}</Link></li>
            <li><Link to="/marketplace" className="hover:text-white transition-colors">{t('footer.buyerMatching')}</Link></li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-semibold text-white mb-3 text-xs tracking-wide uppercase">{t('footer.aiFeatures')}</p>
          <ul className="space-y-2 text-[#AEB6A2]">
            <li><a href="/#ai-features" className="hover:text-white transition-colors">{t('footer.priceIntelligence')}</a></li>
            <li><a href="/#ai-features" className="hover:text-white transition-colors">{t('footer.demandForecasting')}</a></li>
            <li><a href="/#ai-features" className="hover:text-white transition-colors">{t('footer.smartMatching')}</a></li>
            <li><a href="/#ai-features" className="hover:text-white transition-colors">{t('footer.logistics')}</a></li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-semibold text-white mb-3 text-xs tracking-wide uppercase">{t('footer.company')}</p>
          <ul className="space-y-2 text-[#AEB6A2]">
            <li><a href="/#about" className="hover:text-white transition-colors">{t('nav.about')}</a></li>
            <li><a href="/#how-it-works" className="hover:text-white transition-colors">{t('nav.howItWorks')}</a></li>
            <li><a href="mailto:hello@farmdirectai.app" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#8B9481]">
          <span>{t('footer.copyright')}</span>
          <span>SIH 26033 · MERN + Python AI</span>
        </div>
      </div>
    </footer>
  );
}
