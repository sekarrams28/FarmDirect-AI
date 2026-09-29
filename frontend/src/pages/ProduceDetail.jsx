import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, MapPin, Package, IndianRupee, ArrowLeft } from 'lucide-react';
import { getProduce, predictDemand, predictPrice, createOffer } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProduceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [produce, setProduce] = useState(null);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [demand, setDemand] = useState(null);
  const [price, setPrice] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerQty, setOfferQty] = useState('');
  const [offerStatus, setOfferStatus] = useState('');

  useEffect(() => {
    getProduce(id)
      .then((d) => setProduce(d.produce))
      .catch((err) => setError(err.response?.data?.message || 'Listing not found'));
  }, [id]);

  async function runAI() {
    if (!produce) return;
    setAiLoading(true);
    try {
      const location = produce.location?.district || produce.location?.village;
      const [d, p] = await Promise.all([
        predictDemand({ crop: produce.crop, location }),
        predictPrice({ produceId: produce._id }),
      ]);
      setDemand(d.prediction);
      setPrice(p.prediction);
    } catch (err) {
      setError(err.response?.data?.message || 'AI service call failed. Is ai-service running on the configured AI_SERVICE_URL?');
    } finally {
      setAiLoading(false);
    }
  }

  async function submitOffer(e) {
    e.preventDefault();
    setOfferStatus('');
    try {
      await createOffer({ produceId: produce._id, offeredPrice: Number(offerPrice), quantity: Number(offerQty) });
      setOfferStatus('Offer sent.');
      setOfferPrice('');
      setOfferQty('');
    } catch (err) {
      setOfferStatus(err.response?.data?.message || 'Could not send offer.');
    }
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="card text-center py-12">
          <p className="text-danger font-medium">{error}</p>
          <Link to="/marketplace" className="btn-secondary mt-5 inline-flex">
            <ArrowLeft size={15} /> Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (!produce) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="skeleton h-8 w-1/2 mb-4" />
        <div className="skeleton h-24 w-full" />
      </div>
    );
  }

  const district = produce.location?.district || produce.location?.village;

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <Link to="/marketplace" className="text-xs font-medium text-inkSoft hover:text-ink inline-flex items-center gap-1 mb-4">
        <ArrowLeft size={13} /> Back to Marketplace
      </Link>

      <h1 className="text-3xl font-semibold text-ink">{produce.crop}</h1>
      <p className="text-inkSoft mt-1 flex items-center gap-1.5">
        <MapPin size={14} /> {produce.farmer?.user?.name} · {district}
      </p>

      <div className="card mt-6 grid sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-inkSoft text-xs mb-1 flex items-center gap-1"><Package size={12} /> Quantity</p>
          <p className="font-semibold text-ink">{produce.quantity} {produce.unit}</p>
        </div>
        <div>
          <p className="text-inkSoft text-xs mb-1 flex items-center gap-1"><IndianRupee size={12} /> Asking price</p>
          <p className="font-semibold text-ink">₹{produce.askingPrice}/kg</p>
        </div>
        <div>
          <p className="text-inkSoft text-xs mb-1">Status</p>
          <span className="badge badge-success capitalize">{produce.status}</span>
        </div>
      </div>

      <div className="mt-8">
        <button onClick={runAI} disabled={aiLoading} className="btn-ai">
          <Sparkles size={16} />
          {aiLoading ? 'Analyzing market data…' : 'Get AI demand & price insight'}
        </button>

        {aiLoading && (
          <div className="ai-card mt-4 space-y-3">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
          </div>
        )}

        {!aiLoading && (demand || price) && (
          <div className="ai-card mt-4 space-y-3">
            <p className="flex items-center gap-2 text-xs font-semibold text-turmericDeep uppercase tracking-wide">
              <Sparkles size={13} /> AI Selling Advisor
            </p>
            {demand && (
              <p className="text-sm text-ink">
                <span className="text-inkSoft">Demand:</span> {demand.predictedDemandKg} kg predicted over {demand.forecastDays} days · trend <strong>{demand.trend}</strong>
              </p>
            )}
            {price && (
              <p className="text-sm text-ink">
                <span className="text-inkSoft">Recommended band:</span> ₹{price.recommendedMin}–{price.recommendedMax}/kg · best offer ≈ ₹{price.bestBuyerPrice}/kg
              </p>
            )}
            <p className="text-[11px] text-inkSoft font-mono border-t border-turmeric/30 pt-2">
              From the ai-service baseline models — replace with trained models before treating these as production figures.
            </p>
          </div>
        )}
      </div>

      {user?.role === 'buyer' && produce.status === 'available' && (
        <form onSubmit={submitOffer} className="card mt-8 space-y-4 max-w-sm">
          <h3 className="font-display text-lg font-semibold text-ink">Make an offer</h3>
          <div>
            <label className="label">Offer price (₹/kg)</label>
            <input className="input" type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} required min="1" />
          </div>
          <div>
            <label className="label">Quantity (kg)</label>
            <input className="input" type="number" value={offerQty} onChange={(e) => setOfferQty(e.target.value)} required min="1" max={produce.quantity} />
          </div>
          <button type="submit" className="btn-primary w-full">Send offer</button>
          {offerStatus && <p className="text-xs text-inkSoft">{offerStatus}</p>}
        </form>
      )}
    </div>
  );
}
