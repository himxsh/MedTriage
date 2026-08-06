import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Plus, Menu } from 'lucide-react';
import { NAV_ITEMS } from '../nav';
import { getClinician, getMe, logout } from '../api';
import type { Screen } from '../types';
import SafetyBanner from './SafetyBanner';
import { getLocale, setLocale, t, type Locale, type UiKey } from '../i18n';

interface AppShellProps {
  children: React.ReactNode;
  onNavigate: (screen: Screen) => void;
}

const TITLE_SUBTITLES: Record<string, string> = {
  cases: 'Full case index',
  audit: 'Decision log',
  metrics: 'Pilot evidence export',
  admin: 'Org settings & seats',
  account: 'Clinician configuration',
};

const NAV_I18N: Record<string, UiKey> = {
  queue: 'queue',
  cases: 'cases',
  audit: 'audit',
  metrics: 'metrics',
  admin: 'admin',
  account: 'account',
};

export default function AppShell({ children, onNavigate }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const clinician = getClinician();
  const me = getMe();
  const currentPath = location.pathname.replace('/', '');
  const [collapsed, setCollapsed] = useState(false);
  const [locale, setLoc] = useState<Locale>(getLocale);

  useEffect(() => {
    const onLoc = () => setLoc(getLocale());
    window.addEventListener('mt-locale', onLoc);
    return () => window.removeEventListener('mt-locale', onLoc);
  }, []);

  const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || me?.role === 'admin');
  const currentNav = navItems.find(item => item.id === currentPath) ?? NAV_ITEMS.find(item => item.id === currentPath);
  const pageTitle = currentNav
    ? t(NAV_I18N[currentNav.id] ?? 'queue', locale)
    : '';
  const pageSubtitle = TITLE_SUBTITLES[currentPath];

  const switchLocale = (next: Locale) => {
    setLocale(next);
    setLoc(next);
  };

  return (
    <div className="app-ui flex h-screen">
      {/* Syncra: Sidebar navigation */}
      <aside
        className={`${collapsed ? 'w-[64px]' : 'w-[260px]'} flex-shrink-0 flex flex-col border-r border-syncra-border bg-white transition-[width] duration-200`}
      >
        <div className={`border-b border-syncra-border flex items-center ${collapsed ? 'justify-center px-2 py-4' : 'px-5 py-5 gap-3'}`}>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="shrink-0 p-1.5 rounded-lg text-syncra-secondary hover:bg-syncra-card-stroke hover:text-syncra-ink cursor-pointer transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="w-4 h-4" />
          </button>
          {!collapsed && (
            <h1
              className="text-[15px] font-semibold tracking-tight text-syncra-ink cursor-pointer"
              onClick={() => navigate('/')}
            >
              MedTriage
            </h1>
          )}
        </div>
        <nav className={`flex-1 py-4 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(`/${item.id}`)}
                  title={collapsed ? item.label : undefined}
                  className={`${collapsed ? 'justify-center px-2' : 'gap-3 px-3'} w-full flex items-center py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-syncra-card-stroke text-syncra-ink'
                      : 'text-syncra-secondary hover:bg-syncra-card-stroke/70 hover:text-syncra-ink'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <span>{t(NAV_I18N[item.id] ?? 'queue', locale)}</span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
        <div className={`border-t border-syncra-border ${collapsed ? 'p-2' : 'p-4'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div
              className="w-9 h-9 rounded-full bg-syncra-card-stroke flex items-center justify-center border border-syncra-border shrink-0"
              title={collapsed ? clinician.name : undefined}
            >
              <User className="text-syncra-tertiary w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-[13px] font-medium text-syncra-ink truncate">{clinician.name}</p>
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/login');
                  }}
                  className="text-[11px] text-syncra-muted hover:text-syncra-ink cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden bg-syncra-surface">
        {/* Syncra: Navigation / Top Bar */}
        <header className="h-[78px] border-b border-syncra-border flex items-center px-6 bg-white shrink-0 gap-4">
          <div className="min-w-0">
            {pageTitle && (
              <div className="flex items-baseline gap-2">
                <h1 className="text-xl font-medium text-syncra-ink leading-none">{pageTitle}</h1>
                {pageSubtitle && (
                  <span className="text-xs text-syncra-muted truncate">{pageSubtitle}</span>
                )}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex rounded-lg border border-syncra-border overflow-hidden text-[11px] font-medium">
              <button
                type="button"
                onClick={() => switchLocale('en')}
                className={`px-2.5 py-1.5 cursor-pointer ${
                  locale === 'en' ? 'bg-syncra-ink text-white' : 'bg-white text-syncra-secondary'
                }`}
              >
                {t('localeEn', locale)}
              </button>
              <button
                type="button"
                onClick={() => switchLocale('hi')}
                className={`px-2.5 py-1.5 cursor-pointer ${
                  locale === 'hi' ? 'bg-syncra-ink text-white' : 'bg-white text-syncra-secondary'
                }`}
              >
                {t('localeHi', locale)}
              </button>
            </div>
            <button
              onClick={() => onNavigate('intake')}
              className="syncra-btn-primary cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              {t('newIntake', locale)}
            </button>
          </div>
        </header>
        <SafetyBanner />
        <main className="flex-1 overflow-auto min-h-0 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
