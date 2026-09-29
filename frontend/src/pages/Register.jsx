import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const DASHBOARD_BY_ROLE = {
  farmer: '/dashboard/farmer',
  buyer: '/dashboard/buyer',
  fpo: '/dashboard/fpo',
  admin: '/dashboard/admin',
};

export default function Register() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: 'farmer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      navigate(DASHBOARD_BY_ROLE[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-2xl font-semibold mb-6 text-ink flex items-center gap-2">
        <UserPlus className="text-leaf" size={20} /> {t('nav.register')}
      </h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label" htmlFor="name">{t('auth.name')}</label>
          <input id="name" className="input" value={form.name} onChange={(e) => update('name', e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="phone">{t('auth.phone')}</label>
          <input id="phone" className="input" value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="password">{t('auth.password')}</label>
          <input id="password" type="password" className="input" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={6} />
        </div>
        <div>
          <label className="label" htmlFor="role">{t('auth.role')}</label>
          <select id="role" className="input" value={form.role} onChange={(e) => update('role', e.target.value)}>
            <option value="farmer">Farmer</option>
            <option value="buyer">Buyer</option>
            <option value="fpo">FPO</option>
          </select>
        </div>
        {error && <p className="field-error">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account…' : t('auth.registerBtn')}
        </button>
        <p className="text-xs text-inkSoft text-center">
          Already have an account? <Link to="/login" className="text-leaf font-medium hover:text-leafDeep">{t('nav.login')}</Link>
        </p>
      </form>
    </div>
  );
}
