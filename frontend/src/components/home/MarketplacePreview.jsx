import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, MapPin, ArrowRight } from 'lucide-react';
import { browseMarketplace } from '../../services/api.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import ProduceCard from '../ProduceCard.jsx';
import Reveal from '../Reveal.jsx';

function ExampleProduceCard({ crop, askingPrice, t }) {
  return (
    <div className="card !p-0 overflow-hidden">
      <div className="relative h-32 bg-leafLight flex items-center justify-center">
        <Sprout className="text-leaf/40" size={40} strokeWidth={1.5} />
        <span className="badge badge-neutral absolute top-3 right-3">{t('marketplace.example')}</span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-ink">{crop}</h3>
          <span className="badge badge-ai whitespace-nowrap">{t('marketplace.aiFairPrice')}</span>
        </div>
        <p className="text-xs text-inkSoft mt-1.5 flex items-center gap-1">
          <MapPin size={12} className="shrink-0" /> {t('marketplace.exampleListing')}
        </p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="font-semibold text-ink">₹{askingPrice}/kg</span>
          <Link to="/marketplace" className="flex items-center gap-1 text-leaf font-medium text-xs hover:gap-1.5 transition-all">
            {t('marketplace.viewDetails')} <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePreview() {
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    browseMarketplace({})
      .then((data) => {
        if (!cancelled) setListings((data.listings || []).slice(0, 3));
      })
      .catch(() => {
        // Backend not reachable or no listings yet — the example cards below cover this.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const showExamples = !loading && listings.length === 0;

  // Shown only if the marketplace API has no listings yet (fresh install / empty DB),
  // so the homepage never looks broken. Clearly labeled as an example, and the
  // "View Details" button sends people to the real marketplace instead of a fake id.
  const exampleProduce = [
    { crop: t('marketplace.tomatoes'), askingPrice: 32 },
    { crop: t('marketplace.rice'), askingPrice: 48 },
    { crop: t('marketplace.potatoes'), askingPrice: 28 },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-14">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink">{t('marketplace.previewHeading')}</h2>
          <p className="text-inkSoft mt-2 max-w-lg">{t('marketplace.previewSub')}</p>
        </div>
        <Link to="/marketplace" className="btn-primary whitespace-nowrap">
          {t('marketplace.viewFull')} <ArrowRight size={16} />
        </Link>
      </Reveal>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card !p-0 overflow-hidden">
              <div className="skeleton h-32 !rounded-none" />
              <div className="p-5 space-y-3">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}

        {!loading &&
          listings.length > 0 &&
          listings.map((p, i) => (
            <Reveal key={p._id} delay={i * 80}>
              <ProduceCard produce={p} />
            </Reveal>
          ))}

        {showExamples &&
          exampleProduce.map((p, i) => (
            <Reveal key={p.crop} delay={i * 80}>
              <ExampleProduceCard {...p} t={t} />
            </Reveal>
          ))}
      </div>
    </section>
  );
}
