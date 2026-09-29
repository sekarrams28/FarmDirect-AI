import React from 'react';
import { Truck } from 'lucide-react';

export default function FPODashboard() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <h1 className="text-3xl font-semibold mb-8 text-ink">FPO dashboard</h1>
      <div className="card flex gap-4 items-start">
        <span className="w-10 h-10 rounded-full bg-leafLight text-leaf flex items-center justify-center shrink-0">
          <Truck size={18} />
        </span>
        <p className="text-sm text-inkSoft">
          This dashboard aggregates member-farmer listings into bulk lots and schedules shared
          pickups. Wire it up to <code className="text-ink">GET /api/produce</code> filtered by <code className="text-ink">fpo</code>, plus
          the <code className="text-ink">/api/ai/logistics</code> route-optimisation endpoint, once FPO membership
          management is built on the backend.
        </p>
      </div>
    </div>
  );
}
