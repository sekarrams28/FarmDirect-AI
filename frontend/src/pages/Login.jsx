import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const DASHBOARD_BY_ROLE = {
  farmer: '/dashboard/farmer',
  buyer: '/dashboard/buyer',
  fpo: '/dashboard/fpo',
  admin: '/dashboard/admin',
};

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(phone, password);
      navigate(DASHBOARD_BY_ROLE[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your phone number and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-2xl font-semibold mb-6 text-ink flex items-center gap-2">
        <LogIn className="text-leaf" size={20} /> {t('nav.login')}
      </h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label" htmlFor="phone">{t('auth.phone')}</label>
          <input id="phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="9000000001" />
        </div>
        <div>
          <label className="label" htmlFor="password">{t('auth.password')}</label>
          <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="field-error">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Logging in…' : t('auth.loginBtn')}
        </button>
        <p className="text-xs text-inkSoft text-center">
          No account? <Link to="/register" className="text-leaf font-medium hover:text-leafDeep">{t('nav.register')}</Link>
        </p>
        <p className="text-[11px] text-inkSoft text-center border-t border-ink/10 pt-3">
          Demo logins (after <code>npm run seed</code> in backend/): farmer 9000000001, buyer 9000000011, admin 9999999999 — password <code>password123</code> (<code>admin12345</code> for admin).
        </p>
      </form>
    </div>
  );
}
