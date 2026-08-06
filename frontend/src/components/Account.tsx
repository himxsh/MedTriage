import React, { useState, useEffect } from 'react';
import { listCases, getMe, fetchMe, logout, getApiBase, getWsUrl } from '../api';
import type { AuthUser } from '../types';

export default function Account() {
  const [user, setUser] = useState<AuthUser | null>(getMe());
  const [connStatus, setConnStatus] = useState<'checking' | 'ok' | 'fail'>('checking');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetchMe().then(setUser);
    listCases().then(() => setConnStatus('ok')).catch(() => setConnStatus('fail'));
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="p-6 overflow-y-auto">
      <div className="max-w-2xl space-y-5">
        <div className="syncra-card p-6 space-y-5">
          <h2 className="text-base font-medium text-syncra-ink">Identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="syncra-label">Full Name</label>
              <input type="text" readOnly className="syncra-input bg-syncra-card-stroke opacity-80" value={user?.name || ''} />
            </div>
            <div>
              <label className="syncra-label">Email</label>
              <input type="text" readOnly className="syncra-input bg-syncra-card-stroke opacity-80" value={user?.email || ''} />
            </div>
            <div>
              <label className="syncra-label">Role</label>
              <input type="text" readOnly className="syncra-input bg-syncra-card-stroke opacity-80" value={user?.role || ''} />
            </div>
            <div>
              <label className="syncra-label">Org ID</label>
              <input type="text" readOnly className="syncra-input bg-syncra-card-stroke opacity-80" value={user?.org_id || ''} />
            </div>
          </div>
          <p className="text-xs text-syncra-muted">
            Identity comes from your server session. Admins invite users — you cannot forge a clinician ID in the browser.
          </p>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="syncra-btn-ghost cursor-pointer active:scale-[0.98]"
          >
            {loggingOut ? 'Signing out…' : 'Sign out'}
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
