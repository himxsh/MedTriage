import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import { NAV_ITEMS } from '../nav';
import { getClinician } from '../api';
import type { Screen } from '../types';

interface AppShellProps {
  children: React.ReactNode;
  onNavigate: (screen: Screen) => void;
}

const TITLE_SUBTITLES: Record<string, string> = {
  cases: 'FULL CASE INDEX',
  audit: 'DECISION LOG',
  account: 'Clinician Configuration',
};

export default function AppShell({ children, onNavigate }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const clinician = getClinician();
  const currentPath = location.pathname.replace('/', '');

  const currentNav = NAV_ITEMS.find(item => item.id === currentPath);
  const pageTitle = currentNav?.label ?? '';
  const pageSubtitle = TITLE_SUBTITLES[currentPath];

  return (
    <div className="flex h-screen bg-background-linen">
      <aside className="w-[240px] flex-shrink-0 flex flex-col border-r-2 border-black bg-white">
        <div className="p-8 border-b-2 border-black cursor-pointer bg-white" onClick={() => navigate('/')}>
          <h1 className="font-bebas text-4xl tracking-widest text-black leading-none uppercase">MEDTRIAGE</h1>
        </div>
        <nav className="flex-1 py-6 overflow-y-auto">
          <div className="space-y-2 px-4">
            {NAV_ITEMS.map((item) => {
              const isActive = currentPath === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(`/${item.id}`)}
                  className={`w-full flex items-center gap-4 px-6 py-4 border-2 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(201,167,74,1)]'
                      : 'text-black/50 hover:text-black hover:bg-black/5 border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                  <span className={`font-mono text-xs font-bold uppercase tracking-widest ${isActive ? 'text-primary' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
        <div className="p-6 border-t-2 border-black bg-black/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/20 flex items-center justify-center border-2 border-primary">
              <User className="text-primary w-6 h-6" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-mono text-[13px] font-bold text-black uppercase truncate">{clinician.name}</p>
              <button onClick={() => navigate('/')} className="font-mono text-[10px] text-primary-ink font-bold uppercase tracking-widest hover:underline cursor-pointer">LOGOUT</button>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b-2 border-black flex items-center px-10 bg-white shrink-0">
          {pageTitle && pageSubtitle && (
            <div className="flex items-center gap-4">
              <h1 className="font-bebas text-3xl text-black leading-none uppercase tracking-widest">{pageTitle}</h1>
              <span className="font-mono text-[10px] text-black/60 uppercase tracking-widest mt-0.5">// {pageSubtitle}</span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-4">
            <button onClick={() => onNavigate('intake')} className="bg-primary text-black px-8 py-3 border-2 border-black font-mono text-sm font-bold uppercase transition-colors transition-shadow transition-transform hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-[0.96] cursor-pointer">
              + New Intake
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
