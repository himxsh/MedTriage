import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { User, Bell, Monitor, ArrowLeft, Save, Globe, Shield, Cpu, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen } from '../types';

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
}

type Tab = 'profile' | 'notifications' | 'system';

export default function Settings({ onNavigate }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-linen font-mono">
      <Sidebar currentScreen="settings" onNavigate={onNavigate} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b-2 border-black flex items-center justify-between px-10 bg-white sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="font-bebas text-4xl tracking-widest text-black uppercase">Core Configuration</h1>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-3 bg-primary text-white px-8 py-3 border-2 border-black font-bold uppercase transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? 'Synchronizing...' : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </header>

      <div className="flex flex-1">
        {/* Settings Navigation */}
        <aside className="w-[300px] border-r-2 border-black bg-white p-8">
          <nav className="space-y-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-4 px-6 py-5 border-2 transition-all cursor-pointer ${
                activeTab === 'profile' ? 'bg-black text-white border-black' : 'border-transparent text-black/40 hover:text-black hover:bg-black/5'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-bold uppercase text-xs tracking-widest">User Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-4 px-6 py-5 border-2 transition-all cursor-pointer ${
                activeTab === 'notifications' ? 'bg-black text-white border-black' : 'border-transparent text-black/40 hover:text-black hover:bg-black/5'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="font-bold uppercase text-xs tracking-widest">Notifications</span>
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`w-full flex items-center gap-4 px-6 py-5 border-2 transition-all cursor-pointer ${
                activeTab === 'system' ? 'bg-black text-white border-black' : 'border-transparent text-black/40 hover:text-black hover:bg-black/5'
              }`}
            >
              <Monitor className="w-5 h-5" />
              <span className="font-bold uppercase text-xs tracking-widest">System Health</span>
            </button>
          </nav>
          
          <div className="mt-20 border-2 border-dashed border-black/20 p-6 opacity-40 grayscale">
             <p className="text-[10px] font-bold uppercase mb-2">Instance Auth</p>
             <p className="text-[8px] break-all leading-tight">NODE_ID: 8821-HENDERS-42-X-991</p>
             <p className="text-[8px] mt-2">SEC_LEVEL: 04</p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-16 overflow-y-auto">
          <div className="max-w-3xl">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <header>
                    <h2 className="font-bebas text-5xl text-black mb-2 uppercase tracking-wide">Identity Settings</h2>
                    <p className="text-black/40 text-xs uppercase tracking-widest italic">// Modify authorized clinician profile</p>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold text-black/60 uppercase tracking-[0.2em]">Full Name</label>
                        <input type="text" className="w-full bg-white border-2 border-black p-4 font-bold outline-none focus:bg-primary/5" defaultValue="Dr. James Henderson" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold text-black/60 uppercase tracking-[0.2em]">Clinician ID</label>
                        <input type="text" readOnly className="w-full bg-black/5 border-2 border-black p-4 font-bold outline-none opacity-60" defaultValue="MED-D042-X" />
                     </div>
                     <div className="space-y-3 md:col-span-2">
                        <label className="text-[10px] font-bold text-black/60 uppercase tracking-[0.2em]">Email Address</label>
                        <input type="email" className="w-full bg-white border-2 border-black p-4 font-bold outline-none focus:bg-primary/5" defaultValue="j.henderson@clinical-triage.ai" />
                     </div>
                  </div>

                  <div className="border-t-2 border-black/10 pt-10">
                     <button className="flex items-center gap-3 border-2 border-red-500 text-red-500 px-6 py-3 font-bold uppercase text-xs hover:bg-red-500 hover:text-white transition-all cursor-pointer">
                        Reset Security Credentials
                     </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <header>
                    <h2 className="font-bebas text-5xl text-black mb-2 uppercase tracking-wide">Alert Protocols</h2>
                    <p className="text-black/40 text-xs uppercase tracking-widest italic">// Configure real-time system signals</p>
                  </header>

                  <div className="space-y-6">
                    {[
                      { id: 'ws', label: 'WebSocket Live Alerts', description: 'Immediate haptic and visual cues on new critical arrivals' },
                      { id: 'email', label: 'Email Escalation', description: 'Summary logs of high-risk cases sent to encrypted mail' },
                      { id: 'audit', label: 'Audit Log Snapshots', description: 'Daily CSV snapshots of clinician override actions' }
                    ].map((item) => (
                      <div key={item.id} className="bg-white border-2 border-black p-8 flex items-center justify-between">
                         <div className="space-y-1">
                            <h3 className="font-bold uppercase text-sm">{item.label}</h3>
                            <p className="text-[10px] text-black/40 uppercase tracking-widest">{item.description}</p>
                         </div>
                         <div className="relative inline-block w-16 h-8 border-2 border-black cursor-pointer group">
                            <div className="absolute top-1 left-1 bottom-1 w-6 bg-primary group-hover:translate-x-1 transition-transform"></div>
                         </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'system' && (
                <motion.div
                  key="system"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <header>
                    <h2 className="font-bebas text-5xl text-black mb-2 uppercase tracking-wide">System Matrix</h2>
                    <p className="text-black/40 text-xs uppercase tracking-widest italic">// Global infrastructure status</p>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-black text-white p-8 space-y-4">
                        <div className="flex justify-between items-center">
                           <Cpu className="w-8 h-8 text-primary" />
                           <span className="text-green-500 font-bold font-mono text-[10px]">OPERATIONAL</span>
                        </div>
                        <h3 className="font-bebas text-2xl tracking-widest">Model Stack v4.2</h3>
                        <div className="space-y-2 opacity-60 text-[10px] uppercase">
                           <div className="flex justify-between"><span>Whisper-X</span><span>LOADED</span></div>
                           <div className="flex justify-between"><span>ClinicalBERT</span><span>LOADED</span></div>
                           <div className="flex justify-between"><span>SciSpaCy-LG</span><span>LOADED</span></div>
                        </div>
                     </div>

                     <div className="border-2 border-black bg-white p-8 space-y-4">
                        <div className="flex justify-between items-center">
                           <Activity className="w-8 h-8 text-black" />
                           <span className="text-primary font-bold font-mono text-[10px]">LATENCY: 12ms</span>
                        </div>
                        <h3 className="font-bebas text-2xl tracking-widest text-black">Redis Cache</h3>
                        <div className="space-y-2 text-black/40 text-[10px] uppercase">
                           <div className="flex justify-between"><span>Active Keys</span><span>14,291</span></div>
                           <div className="flex justify-between"><span>Hit Rate</span><span>99.2%</span></div>
                           <div className="flex justify-between"><span>Memory</span><span>8.2 GB / 16 GB</span></div>
                        </div>
                     </div>

                     <div className="md:col-span-2 border-2 border-black p-8 flex items-center justify-between bg-primary/5">
                        <div className="flex items-center gap-6">
                           <Shield className="w-10 h-10 text-primary" />
                           <div>
                              <h3 className="font-bold uppercase text-sm">Security Mode: Lockdown</h3>
                              <p className="text-[10px] text-black/40 uppercase tracking-widest">Enhanced PHI protection enabled across all nodes</p>
                           </div>
                        </div>
                        <button className="bg-black text-white px-8 py-3 font-bold uppercase text-xs cursor-pointer border-2 border-black hover:bg-white hover:text-black transition-all">
                           Re-Authenticate
                        </button>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}
