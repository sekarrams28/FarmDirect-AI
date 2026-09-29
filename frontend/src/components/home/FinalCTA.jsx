import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Reveal from '../Reveal.jsx';

export default function FinalCTA() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <section className="max-w-6xl mx-auto px-6 py-20 text-center">
      <Reveal>
        <h2 className="text-2xl sm:text-3xl font-semibold text-ink">{t('cta.heading')}</h2>
        <p className="text-inkSoft mt-3">{t('cta.sub')}</p>
        <div className="mt-6">
          <Link to={user ? '/dashboard/farmer/list' : '/register'} className="btn-primary">
            {t('cta.button')} <ArrowRight size={16} />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
