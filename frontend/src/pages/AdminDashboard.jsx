import React, { useEffect, useState } from 'react';
import { getAdminDashboard, getAdminAnalytics } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [totals, setTotals] = useState(null);
  const [supplyByCrop, setSupplyByCrop] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getAdminDashboard(), getAdminAnalytics()])
      .then(([d, a]) => {
        setTotals(d.totals);
        setSupplyByCrop(a.supplyByCrop.map((c) => ({ crop: c._id, kg: c.totalQuantity })));
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load admin data.'));
  }, []);

  if (error) return <div className="max-w-6xl mx-auto px-6 py-16 text-danger">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <h1 className="text-3xl font-semibold mb-8 text-ink">Admin dashboard</h1>

      {totals && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {Object.entries(totals).map(([key, value]) => (
            <div key={key} className="card">
              <p className="font-display text-2xl font-semibold text-ink">{value}</p>
              <p className="text-xs text-inkSoft capitalize mt-1">{key.replace(/([A-Z])/g, ' $1')}</p>
            </div>
          ))}
        </div>
      )}

      {supplyByCrop.length > 0 && (
        <div className="card">
          <h3 className="font-display text-lg font-semibold mb-4 text-ink">Crop supply, available listings</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={supplyByCrop}>
              <XAxis dataKey="crop" stroke="#5B6355" fontSize={12} />
              <YAxis stroke="#5B6355" fontSize={12} />
              <Tooltip />
              <Bar dataKey="kg" fill="#2F6B3C" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
