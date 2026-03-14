import React from 'react';
import { LayoutDashboard, History, BarChart3, Settings, User, ShieldAlert, Plus } from 'lucide-react';
import { Screen } from '../types';

interface SidebarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export default function Sidebar({ currentScreen, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Queue', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: History },
    { id: 'review', label: 'Review', icon: ShieldAlert },
    { id: 'audit', label: 'Audit Logs', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-[240px] flex-shrink-0 flex flex-col border-r-2 border-black bg-white h-screen sticky top-0">
      <div className="p-8 border-b-2 border-black cursor-pointer bg-white" onClick={() => onNavigate('landing')}>
        <h1 className="font-bebas text-4xl tracking-widest text-black leading-none uppercase">MEDTRIAGE</h1>
      </div>

      <nav className="flex-1 py-6 bg-white overflow-y-auto">
        <div className="space-y-2 px-4">
          {menuItems.map((item) => {
            const isActive = currentScreen === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as Screen)}
                className={`w-full flex items-center gap-4 px-6 py-4 transition-all cursor-pointer border-2 ${isActive
                  ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(201,167,74,1)]'
                  : 'text-black/40 hover:text-black hover:bg-black/5 border-transparent'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'group-hover:translate-x-1 transition-transform'}`} />
                <span className={`font-mono text-xs font-bold uppercase tracking-widest ${isActive ? 'text-primary' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-6 border-t-2 border-black bg-black/5 mt-auto">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/20 flex items-center justify-center border-2 border-primary overflow-hidden">
            <User className="text-primary w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="font-mono text-[13px] font-bold text-black uppercase truncate">Dr. Henderson</p>
            <button
              onClick={() => onNavigate('landing')}
              className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest hover:underline cursor-pointer"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
