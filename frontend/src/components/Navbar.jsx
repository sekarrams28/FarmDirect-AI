import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import NotificationBell from './NotificationBell.jsx';

// Anchor links scroll to sections on the homepage (see the ids in components/home/*).
// Plain <a> tags (not <Link>) are used for these so the hash reliably scrolls even
// when navigating in from a different page.
const ANCHOR_LINKS = [
  { href: '/#ai-features', labelKey: 'nav.aiInsights' },
  { href: '/#how-it-works', labelKey: 'nav.howItWorks' },
  { href: '/#about', labelKey: 'nav.about' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  const dashboardPath = user
    ? {
        farmer: '/dashboard/farmer',
        buyer: '/dashboard/buyer',
        fpo: '/dashboard/fpo',
        admin: '/dashboard/admin',
      }[user.role] || '/'
    : '/login';

  const isHome = location.pathname === '/';
  const isMarketplace = location.pathname.startsWith('/marketplace');

  const linkClass = (active) =>
    `relative py-1 transition-colors hover:text-ink ${active ? 'text-ink' : ''} after:absolute after:left-0 after:-bottom-[13px] after:h-0.5 after:bg-leaf after:transition-all after:duration-200 ${
      active ? 'after:w-full' : 'after:w-0'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-paper/85 backdrop-blur border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-ink shrink-0">
          <span aria-hidden="true">🌾</span>
          Farm<span className="text-leaf">Direct</span> AI
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-inkSoft">
          <Link to="/" className={linkClass(isHome)}>{t('nav.home')}</Link>
          <Link to="/marketplace" className={linkClass(isMarketplace)}>{t('nav.marketplace')}</Link>
          {ANCHOR_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={linkClass(false)}>
              {t(link.labelKey)}
            </a>
          ))}
          {user && (
            <Link to={dashboardPath} className={linkClass(location.pathname.startsWith('/dashboard'))}>
              {t('nav.dashboard')}
            </Link>
          )}
        </nav>

        {/* Language + auth controls: only shown inline from md up. Below that they
            live inside the mobile menu so this cluster can never force horizontal
            overflow on narrow phones. */}
        <div className="hidden lg:flex items-center gap-3">
          <LanguageSwitcher />

          {user ? (
            <>
              <NotificationBell />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-ink/10 bg-white hover:shadow-soft transition-shadow"
                >
                  <span className="w-7 h-7 rounded-full bg-leafLight text-leaf flex items-center justify-center">
                    <User size={15} />
                  </span>
                  <span className="text-xs font-medium text-ink inline capitalize">{user.name || user.role}</span>
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white border border-ink/10 rounded-xl shadow-softHover py-1.5 text-sm"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <Link
                      to={dashboardPath}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-ink hover:bg-paperDeep"
                    >
                      <LayoutDashboard size={15} /> {t('nav.dashboard')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-danger hover:bg-dangerSoft text-left"
                    >
                      <LogOut size={15} /> {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-inkSoft hover:text-ink transition-colors">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn-primary !py-2 !px-4 text-xs">
                {t('nav.getStarted')}
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-1.5 rounded-lg text-ink hover:bg-paperDeep transition-colors"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="lg:hidden flex flex-col gap-3 px-6 pb-4 text-sm font-medium text-inkSoft border-t border-ink/10 pt-3">
          <Link to="/" onClick={() => setOpen(false)} className={isHome ? 'text-ink' : ''}>{t('nav.home')}</Link>
          <Link to="/marketplace" onClick={() => setOpen(false)} className={isMarketplace ? 'text-ink' : ''}>
            {t('nav.marketplace')}
          </Link>
          {ANCHOR_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {t(link.labelKey)}
            </a>
          ))}

          {user ? (
            <>
              <Link to={dashboardPath} onClick={() => setOpen(false)} className="flex items-center gap-2">
                <LayoutDashboard size={15} /> {t('nav.dashboard')}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-danger text-left"
              >
                <LogOut size={15} /> {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>{t('nav.login')}</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="text-leaf font-semibold">
                {t('nav.getStarted')}
              </Link>
            </>
          )}

          <div className="pt-2 border-t border-ink/10">
            <LanguageSwitcher />
          </div>
        </nav>
      )}
    </header>
  );
}
