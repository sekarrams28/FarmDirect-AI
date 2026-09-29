import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, ArrowLeft } from 'lucide-react';
import { createProduce } from '../services/api';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useOffline } from '../offline/OfflineContext.jsx';

export default function ListProduce() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isOnline, enqueue } = useOffline();
  const [form, setForm] = useState({ crop: '', quantity: '', unit: 'kg', askingPrice: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [queuedMessage, setQueuedMessage] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setQueuedMessage('');
    setLoading(true);

    const payload = {
      ...form,
      quantity: Number(form.quantity),
      askingPrice: Number(form.askingPrice),
    };

    // Offline-first: if there's no connection, don't fail the submission —
    // queue it locally (IndexedDB) and sync automatically once the device
    // reconnects. The farmer still gets immediate confirmation.
    if (!isOnline) {
      try {
        await enqueue('createProduce', payload);
        setQueuedMessage('You are offline. This listing has been saved and will be published automatically once you are back online.');
        setForm({ crop: '', quantity: '', unit: 'kg', askingPrice: '' });
      } catch (err) {
        setError('Could not save this listing for offline sync. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const data = await createProduce(payload);
      navigate(`/produce/${data.produce._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the listing.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-14">
      <Link to="/dashboard/farmer" className="text-xs font-medium text-inkSoft hover:text-ink inline-flex items-center gap-1 mb-4">
        <ArrowLeft size={13} /> Back to dashboard
      </Link>

      <h1 className="text-2xl font-semibold mb-1 text-ink flex items-center gap-2">
        <Sprout className="text-leaf" size={22} /> {t('produce.list')}
      </h1>
      <p className="text-sm text-inkSoft mb-6">Tell buyers what you're selling and at what price.</p>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-inkSoft mb-3">Produce Details</p>
          <div className="space-y-4">
            <div>
              <label className="label">{t('produce.crop')} <span className="text-danger">*</span></label>
              <input className="input" value={form.crop} onChange={(e) => update('crop', e.target.value)} required placeholder="Tomato" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t('produce.quantity')} <span className="text-danger">*</span></label>
                <input className="input" type="number" value={form.quantity} onChange={(e) => update('quantity', e.target.value)} required min="1" placeholder="500" />
              </div>
              <div>
                <label className="label">Unit</label>
                <select className="input" value={form.unit} onChange={(e) => update('unit', e.target.value)}>
                  <option value="kg">kg</option>
                  <option value="quintal">quintal</option>
                  <option value="tonne">tonne</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-ink/10 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-inkSoft mb-3">Pricing</p>
          <div>
            <label className="label">{t('produce.price')} <span className="text-danger">*</span></label>
            <input className="input" type="number" value={form.askingPrice} onChange={(e) => update('askingPrice', e.target.value)} required min="1" placeholder="40" />
          </div>
        </div>

        {error && <p className="field-error">{error}</p>}
        {queuedMessage && <p className="text-sm text-leaf font-medium">{queuedMessage}</p>}
        {!isOnline && !queuedMessage && (
          <p className="text-xs text-inkSoft">You're offline — this listing will be saved on your device and published automatically when you reconnect.</p>
        )}

        <div className="flex gap-3 pt-1">
          <Link to="/dashboard/farmer" className="btn-secondary flex-1">Back</Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving…' : isOnline ? 'Publish Listing' : 'Save for Sync'}
          </button>
        </div>
      </form>
    </div>
  );
}
