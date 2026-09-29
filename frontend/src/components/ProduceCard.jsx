import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, MapPin, Package, ArrowRight } from 'lucide-react';

const STATUS_BADGE = {
  available: 'badge-success',
  reserved: 'badge-warning',
  sold: 'badge-neutral',
  expired: 'badge-danger',
};

export default function ProduceCard({ produce }) {
  const farmerName = produce.farmer?.user?.name || 'Farmer';
  const district = produce.location?.district || produce.location?.village || '—';
  const statusClass = STATUS_BADGE[produce.status] || 'badge-neutral';

  return (
    <Link
      to={`/produce/${produce._id}`}
      className="card card-hover block overflow-hidden !p-0 group"
    >
      <div className="relative h-32 bg-leafLight flex items-center justify-center">
        <Sprout className="text-leaf/40" size={40} strokeWidth={1.5} />
        <span className={`badge ${statusClass} absolute top-3 right-3 capitalize`}>
          {produce.status}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-ink">{produce.crop}</h3>
          <span className="badge badge-warning whitespace-nowrap">
            ₹{produce.askingPrice}/kg
          </span>
        </div>

        <p className="text-xs text-inkSoft mt-1.5 flex items-center gap-1">
          <MapPin size={12} className="shrink-0" /> {farmerName} · {district}
        </p>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-inkSoft">
            <Package size={14} /> {produce.quantity} {produce.unit}
          </span>
          <span className="flex items-center gap-1 text-leaf font-medium text-xs group-hover:gap-1.5 transition-all">
            View Details <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
