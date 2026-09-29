import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sparkles, Package, IndianRupee, ListChecks } from 'lucide-react';
import { listMyProduce, farmAdvisor, listOrders, updateOrderStatus } from '../services/api';
import ProduceCard from '../components/ProduceCard.jsx';
import OrderTimeline, { SmsStatusBadge } from '../components/OrderTimeline.jsx';
import SmsPreferenceToggle from '../components/SmsPreferenceToggle.jsx';

const NEXT_STATUS = { placed: 'confirmed', confirmed: 'collecting', collecting: 'in_transit', in_transit: 'delivered' };
const NEXT_LABEL = {
  confirmed: 'Confirm order',
  collecting: 'Start collecting',
  in_transit: 'Mark in transit',
  delivered: 'Mark delivered',
};

export default function FarmerDashboard() {
  const [produce, setProduce] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceFor, setAdviceFor] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    listMyProduce()
      .then((d) => setProduce(d.produce))
      .finally(() => setLoading(false));
  }, []);

  function loadOrders() {
    return listOrders()
      .then((d) => setOrders(d.orders))
      .finally(() => setOrdersLoading(false));
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function advanceStatus(order) {
    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) return;
    setUpdatingId(order._id);
    try {
      await updateOrderStatus(order._id, { status: nextStatus });
      await loadOrders();
    } catch {
      // best effort — order list just won't reflect it until next refresh
    } finally {
      setUpdatingId(null);
    }
  }

  async function cancelOrder(order) {
    setUpdatingId(order._id);
    try {
      await updateOrderStatus(order._id, { status: 'cancelled' });
      await loadOrders();
    } catch {
      // best effort
    } finally {
      setUpdatingId(null);
    }
  }

  async function getAdvice(item) {
    setAdviceLoading(true);
    setAdvice(null);
    setAdviceFor(item);
    try {
      const location = item.location?.district || item.location?.village;
      const data = await farmAdvisor({ crop: item.crop, quantity: item.quantity, location });
      setAdvice(data.advice);
    } catch {
      setAdvice({ recommendation: 'AI service is unavailable right now.' });
    } finally {
      setAdviceLoading(false);
    }
  }

  const stats = useMemo(() => {
    const active = produce.filter((p) => p.status === 'available').length;
    const sold = produce.filter((p) => p.status === 'sold');
    const sales = sold.reduce((sum, p) => sum + (p.askingPrice || 0) * (p.quantity || 0), 0);
    return { total: produce.length, active, sales };
  }, [produce]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <h1 className="text-3xl font-semibold text-ink">Farmer dashboard</h1>
        <Link to="/dashboard/farmer/list" className="btn-primary">
          <Plus size={16} /> List produce
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mb-10">
        <div className="card">
          <span className="w-9 h-9 rounded-full bg-leafLight text-leaf flex items-center justify-center mb-3"><ListChecks size={16} /></span>
          <p className="font-display text-2xl font-semibold text-ink">{stats.total}</p>
          <p className="text-xs text-inkSoft mt-1">Total Listings</p>
        </div>
        <div className="card">
          <span className="w-9 h-9 rounded-full bg-leafLight text-leaf flex items-center justify-center mb-3"><Package size={16} /></span>
          <p className="font-display text-2xl font-semibold text-ink">{stats.active}</p>
          <p className="text-xs text-inkSoft mt-1">Active Listings</p>
        </div>
        <div className="card">
          <span className="w-9 h-9 rounded-full bg-turmericSoft text-turmericDeep flex items-center justify-center mb-3"><IndianRupee size={16} /></span>
          <p className="font-display text-2xl font-semibold text-ink">₹{stats.sales.toLocaleString('en-IN')}</p>
          <p className="text-xs text-inkSoft mt-1">Sales (from sold listings)</p>
        </div>
      </div>

      <div className="mb-8">
        <SmsPreferenceToggle />
      </div>

      <h2 className="font-display text-xl font-semibold text-ink mb-4">Orders to Fulfil</h2>

      {ordersLoading && (
        <div className="space-y-3 mb-10">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}
        </div>
      )}

      {!ordersLoading && orders.length === 0 && (
        <div className="card text-center py-10 mb-10">
          <p className="text-sm text-inkSoft">No orders yet — they'll show up here as buyers order your produce.</p>
        </div>
      )}

      {!ordersLoading && orders.length > 0 && (
        <div className="space-y-3 mb-10">
          {orders.map((o) => (
            <div key={o._id} className="card text-sm space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-ink">{o.produce?.crop}</p>
                  <p className="text-inkSoft text-xs mt-1">{o.quantity} kg · ₹{o.agreedPrice}/kg</p>
                </div>
                <div className="flex items-center gap-2">
                  <SmsStatusBadge status={o.smsStatus} />
                  {NEXT_STATUS[o.status] && (
                    <button
                      onClick={() => advanceStatus(o)}
                      disabled={updatingId === o._id}
                      className="btn-primary !py-1.5 !px-3 text-xs disabled:opacity-50"
                    >
                      {updatingId === o._id ? 'Updating…' : NEXT_LABEL[NEXT_STATUS[o.status]]}
                    </button>
                  )}
                  {!['delivered', 'cancelled'].includes(o.status) && (
                    <button
                      onClick={() => cancelOrder(o)}
                      disabled={updatingId === o._id}
                      className="text-xs font-medium text-danger hover:underline disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
              <OrderTimeline order={o} />
            </div>
          ))}
        </div>
      )}

      <h2 className="font-display text-xl font-semibold text-ink mb-4">My Listings</h2>

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card !p-0 overflow-hidden">
              <div className="skeleton h-32 !rounded-none" />
              <div className="p-5 space-y-3">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && produce.length === 0 && (
        <div className="card text-center py-14">
          <p className="text-2xl" aria-hidden="true">🌱</p>
          <p className="font-display text-lg font-semibold text-ink mt-3">No produce yet</p>
          <p className="text-sm text-inkSoft mt-1">Start selling your farm produce directly to buyers.</p>
          <Link to="/dashboard/farmer/list" className="btn-primary mt-5 inline-flex">
            <Plus size={16} /> List Produce
          </Link>
        </div>
      )}

      {!loading && produce.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {produce.map((p) => (
            <div key={p._id}>
              <ProduceCard produce={p} />
              <button
                onClick={() => getAdvice(p)}
                className="mt-2 text-xs font-medium text-leaf hover:text-leafDeep inline-flex items-center gap-1"
              >
                <Sparkles size={12} /> Get sell/wait advice
              </button>
            </div>
          ))}
        </div>
      )}

      {(adviceLoading || advice) && (
        <div className="ai-card mt-8 max-w-xl">
          <p className="flex items-center gap-2 text-xs font-semibold text-turmericDeep uppercase tracking-wide mb-2">
            <Sparkles size={13} /> AI Selling Advisor
          </p>
          {adviceFor && (
            <p className="text-xs text-inkSoft mb-2">{adviceFor.crop} · {adviceFor.quantity} {adviceFor.unit}</p>
          )}
          {adviceLoading ? (
            <div className="skeleton h-4 w-3/4" />
          ) : (
            <p className="text-sm text-ink">{advice.recommendation}</p>
          )}
        </div>
      )}
    </div>
  );
}
