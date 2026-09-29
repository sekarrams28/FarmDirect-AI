import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package } from 'lucide-react';
import { listOrders, updateOrderStatus } from '../services/api';
import OrderTimeline, { SmsStatusBadge } from '../components/OrderTimeline.jsx';
import SmsPreferenceToggle from '../components/SmsPreferenceToggle.jsx';

export default function BuyerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  function load() {
    return listOrders()
      .then((d) => setOrders(d.orders))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCancel(order) {
    setCancellingId(order._id);
    try {
      await updateOrderStatus(order._id, { status: 'cancelled' });
      await load();
    } catch {
      // best effort — the badge just won't update this time
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <h1 className="text-3xl font-semibold text-ink">Buyer dashboard</h1>
        <Link to="/marketplace" className="btn-primary">
          <ShoppingBag size={16} /> Browse marketplace
        </Link>
      </div>

      <div className="mb-8">
        <SmsPreferenceToggle />
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="card text-center py-14">
          <Package className="mx-auto text-leaf/40" size={36} strokeWidth={1.5} />
          <p className="font-display text-lg font-semibold text-ink mt-4">No orders yet</p>
          <p className="text-sm text-inkSoft mt-1">Browse the marketplace to make your first offer.</p>
          <Link to="/marketplace" className="btn-primary mt-5 inline-flex">Browse marketplace</Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o._id} className="card text-sm space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-ink">{o.produce?.crop}</p>
                  <p className="text-inkSoft text-xs mt-1">{o.quantity} kg · ₹{o.agreedPrice}/kg</p>
                </div>
                <div className="flex items-center gap-2">
                  <SmsStatusBadge status={o.smsStatus} />
                  {['placed', 'confirmed'].includes(o.status) && (
                    <button
                      onClick={() => handleCancel(o)}
                      disabled={cancellingId === o._id}
                      className="text-xs font-medium text-danger hover:underline disabled:opacity-50"
                    >
                      {cancellingId === o._id ? 'Cancelling…' : 'Cancel order'}
                    </button>
                  )}
                </div>
              </div>
              <OrderTimeline order={o} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
