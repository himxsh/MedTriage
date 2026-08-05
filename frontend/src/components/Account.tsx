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
    <div className="p-6 overflow-y-auto">
      <div className="max-w-2xl space-y-5">
        {/* Syncra: Edit Profile form card */}
        <div className="syncra-card p-6 space-y-5">
          <h2 className="text-base font-medium text-syncra-ink">Identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="syncra-label">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="syncra-input" />
            </div>
            <div>
              <label className="syncra-label">Clinician ID</label>
              <input type="text" value={clinicianId} onChange={e => setClinicianId(e.target.value)} className="syncra-input uppercase" />
            </div>
          </div>
          <button onClick={handleSave} className="syncra-btn-primary cursor-pointer active:scale-[0.98]">
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>

        <div className="syncra-card p-6 space-y-5">
          <h2 className="text-base font-medium text-syncra-ink">Connections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="syncra-label">API Base URL</label>
              <input type="text" readOnly className="syncra-input bg-syncra-card-stroke opacity-80" value={getApiBase()} />
            </div>
            <div>
              <label className="syncra-label">WebSocket URL</label>
              <input type="text" readOnly className="syncra-input bg-syncra-card-stroke opacity-80" value={getWsUrl()} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-syncra-secondary">API Status:</span>
            {connStatus === 'checking' ? (
              <span className="text-syncra-muted">Checking...</span>
            ) : connStatus === 'ok' ? (
              <span className="inline-flex px-2.5 py-0.5 rounded-full bg-syncra-up-soft text-syncra-up font-medium">OK</span>
            ) : (
              <span className="inline-flex px-2.5 py-0.5 rounded-full bg-syncra-down-soft text-syncra-down font-medium">Fail</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
