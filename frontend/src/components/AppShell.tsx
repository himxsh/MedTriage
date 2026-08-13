import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import { NAV_ITEMS } from '../nav';
import { getClinician, getMe, logout } from '../api';
import type { Screen } from '../types';
import SafetyBanner from './SafetyBanner';
import SidebarNav, { type SidebarNavItem } from './beautiful-ui/SidebarNav';
import { getLocale, setLocale, t, type Locale, type UiKey } from '../i18n';

interface AppShellProps {
  children: React.ReactNode;
  onNavigate: (screen: Screen) => void;
}

const NAV_I18N: Record<string, UiKey> = {
  queue: 'queue',
  cases: 'cases',
  audit: 'audit',
  metrics: 'metrics',
  admin: 'admin',
  account: 'account',
};

const SECTIONS = ['Workspace', 'Admin'];

export default function AppShell({ children, onNavigate }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const clinician = getClinician();
  const me = getMe();
  const currentPath = location.pathname.replace('/', '');
  const [locale, setLoc] = useState<Locale>(getLocale);
  const [navQuery, setNavQuery] = useState('');

  useEffect(() => {
    const onLoc = () => setLoc(getLocale());
    window.addEventListener('mt-locale', onLoc);
    return () => window.removeEventListener('mt-locale', onLoc);
  }, []);

  const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || me?.role === 'admin');
  const currentNav =
    navItems.find((item) => item.id === currentPath) ??
    NAV_ITEMS.find((item) => item.id === currentPath);
  const pageTitle = currentNav ? t(NAV_I18N[currentNav.id] ?? 'queue', locale) : '';

  const items: SidebarNavItem[] = navItems.map((item) => {
    const Icon = item.icon;
    return {
      key: item.id,
      label: t(NAV_I18N[item.id] ?? 'queue', locale),
      section: item.adminOnly ? 'Admin' : 'Workspace',
      icon: <Icon className="h-[13px] w-[13px]" />,
    };
  });

  const switchLocale = (next: Locale) => {
    setLocale(next);
    setLoc(next);
  };

  return (
    <div className="bui-root app-ui flex h-screen">
      <aside className="flex w-[268px] shrink-0 flex-col border-r border-line bg-canvas p-2">
        <div className="min-h-0 flex-1">
          <SidebarNav
            workspace="MedTriage"
            subtitle={clinician.name || 'Clinical workspace'}
            items={items}
            sections={SECTIONS}
            active={currentPath}
            onSelect={(key) => navigate(`/${key}`)}
            onNew={() => onNavigate('intake')}
            newLabel={t('newIntake', locale)}
            searchQuery={navQuery}
            onSearch={setNavQuery}
          />
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-control px-2 py-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-field">
            <User className="h-3.5 w-3.5 text-ink-3" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-ink">{clinician.name}</p>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="text-[11px] text-ink-3 hover:text-ink"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-page">
        <header className="flex h-[64px] shrink-0 items-center gap-3 border-b border-line bg-surface px-5">
          {pageTitle && <h1 className="text-[17px] font-medium leading-none text-ink">{pageTitle}</h1>}
          <div className="ml-auto flex items-center gap-2">
            <div className="flex overflow-hidden rounded-control border border-line text-[11px] font-medium">
              <button
                type="button"
                onClick={() => switchLocale('en')}
                className={`px-2.5 py-1.5 ${locale === 'en' ? 'bg-ink text-canvas' : 'bg-surface text-ink-2'}`}
              >
                {t('localeEn', locale)}
              </button>
              <button
                type="button"
                onClick={() => switchLocale('hi')}
                className={`px-2.5 py-1.5 ${locale === 'hi' ? 'bg-ink text-canvas' : 'bg-surface text-ink-2'}`}
              >
                {t('localeHi', locale)}
              </button>
            </div>
          </div>
        </header>
        <SafetyBanner />
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
