import React, { useState, useEffect } from 'react';
import { listCases, getClinician, saveClinician, getApiBase, getWsUrl } from '../api';

export default function Account() {
  const clinician = getClinician();
  const [name, setName] = useState(clinician.name);
  const [clinicianId, setClinicianId] = useState(clinician.id);
  const [saved, setSaved] = useState(false);
  const [connStatus, setConnStatus] = useState<'checking' | 'ok' | 'fail'>('checking');

  useEffect(() => {
    // ponytail: simple connection check via listCases, no dedicated health endpoint
    listCases().then(() => setConnStatus('ok')).catch(() => setConnStatus('fail'));
  }, []);

  const handleSave = () => {
    saveClinician(name, clinicianId);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-12 overflow-y-auto">
      <div className="max-w-3xl">
        <h1 className="font-bebas text-7xl text-black mb-2">ACCOUNT</h1>
        <p className="font-mono text-[10px] text-black/40 uppercase tracking-widest mb-8">// Clinician Configuration</p>
        <div className="h-1.5 w-full bg-black mb-10"></div>

        <div className="space-y-10">
          <div className="bg-white border-2 border-black p-8 space-y-6">
            <h2 className="font-bebas text-3xl text-black uppercase tracking-wide">Identity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-black/60 uppercase tracking-widest">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white border-2 border-black p-4 font-bold outline-none focus:bg-primary/5" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-black/60 uppercase tracking-widest">Clinician ID</label>
                <input type="text" value={clinicianId} onChange={e => setClinicianId(e.target.value)} className="w-full bg-white border-2 border-black p-4 font-bold outline-none focus:bg-primary/5 uppercase" />
              </div>
            </div>
            <button onClick={handleSave} className="bg-black text-white px-8 py-4 border-2 border-black font-mono text-xs font-bold uppercase hover:bg-primary hover:border-primary transition-colors active:scale-[0.96] cursor-pointer">
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>

          <div className="bg-white border-2 border-black p-8 space-y-6">
            <h2 className="font-bebas text-3xl text-black uppercase tracking-wide">Connections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-black/60 uppercase tracking-widest">API Base URL</label>
                <input type="text" readOnly className="w-full bg-black/5 border-2 border-black p-4 font-bold outline-none opacity-60" value={getApiBase()} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-black/60 uppercase tracking-widest">WebSocket URL</label>
                <input type="text" readOnly className="w-full bg-black/5 border-2 border-black p-4 font-bold outline-none opacity-60" value={getWsUrl()} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] font-bold uppercase">API Status:</span>
              {connStatus === 'checking' ? (
                <span className="font-mono text-[10px] text-black/40">CHECKING...</span>
              ) : connStatus === 'ok' ? (
                <span className="font-mono text-[10px] text-green-600 font-bold">OK</span>
              ) : (
                <span className="font-mono text-[10px] text-red-500 font-bold">FAIL</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
