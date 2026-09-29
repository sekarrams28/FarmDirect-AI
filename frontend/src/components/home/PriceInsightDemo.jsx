import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Reveal from '../Reveal.jsx';

// Illustrative numbers only — the real prediction comes from POST /api/ai/price,
// which needs a logged-in farmer's actual listing details (crop, quantity, location).
// That's exercised from the "List Produce" flow, not from an anonymous homepage visit.
const DEMO = { marketPrice: 28, rangeLow: 30, rangeHigh: 34 };

export default function PriceInsightDemo() {
  const { t } = useLanguage();
  const { marketPrice, rangeLow, rangeHigh } = DEMO;
  // Position the range and market-price markers along a 0–50 scale for the visual bar.
  const scaleMax = 50;
  const lowPct = (rangeLow / scaleMax) * 100;
  const highPct = (rangeHigh / scaleMax) * 100;
  const marketPct = (marketPrice / scaleMax) * 100;

  return (
    <section className="max-w-6xl mx-auto px-6 py-14">
      <Reveal className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <span className="badge badge-ai mb-4">{t('features.aiPowered')}</span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink">{t('price.heading')}</h2>
          <p className="text-inkSoft mt-3 max-w-md">{t('price.body')}</p>
        </div>

        <div className="ai-card">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-turmericDeep">
              <Sparkles size={13} /> {t('price.dashboardLabel')}
            </span>
            <span className="text-[11px] text-inkSoft/70">{t('price.demoExample')}</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-inkSoft">{t('price.produceLabel')}</p>
              <p className="font-display text-lg font-semibold text-ink mt-0.5">{t('price.tomato')}</p>
            </div>
            <div>
              <p className="text-xs text-inkSoft">{t('price.currentMarketPrice')}</p>
              <p className="font-display text-lg font-semibold text-ink mt-0.5">₹{marketPrice}/kg</p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs text-inkSoft">{t('price.recommendedRange')}</p>
            <p className="font-display text-xl font-semibold text-leafDeep mt-0.5">
              ₹{rangeLow} – ₹{rangeHigh}/kg
            </p>

            {/* Visual price-range indicator */}
            <div className="relative mt-4 h-2.5 rounded-full bg-white border border-ink/10">
              <div
                className="absolute inset-y-0 rounded-full bg-leaf/70"
                style={{ left: `${lowPct}%`, width: `${Math.max(highPct - lowPct, 4)}%` }}
              />
              <div
                className="absolute -top-1.5 w-1 h-5 rounded-full bg-ink/60"
                style={{ left: `${marketPct}%` }}
                title={t('price.currentMarketPrice')}
              />
            </div>
            <div className="flex justify-between text-[11px] text-inkSoft/70 mt-1.5">
              <span>₹0</span>
              <span>₹{scaleMax}/kg</span>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-leafDeep font-medium">
            <ShieldCheck size={16} /> {t('price.confidence')}: {t('price.confidenceHigh')}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
