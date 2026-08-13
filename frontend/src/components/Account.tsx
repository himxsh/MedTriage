import React, { useState, useEffect } from 'react';
import {
  listCases,
  getMe,
  fetchMe,
  logout,
  changePassword,
  getApiBase,
  getWsUrl,
} from '../api';
import type { AuthUser } from '../types';

export default function Account() {
  const [user, setUser] = useState<AuthUser | null>(getMe());
  const [connStatus, setConnStatus] = useState<'checking' | 'ok' | 'fail'>('checking');
  const [loggingOut, setLoggingOut] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    fetchMe().then(setUser);
    listCases().then(() => setConnStatus('ok')).catch(() => setConnStatus('fail'));
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    window.location.href = '/login';
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPw.length < 8) {
      setPwMsg({ kind: 'err', text: 'New password must be at least 8 characters' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ kind: 'err', text: 'New passwords do not match' });
      return;
    }
    setPwBusy(true);
    try {
      await changePassword(currentPw, newPw);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setPwMsg({ kind: 'ok', text: 'Password updated. Other sessions were signed out.' });
    } catch (err) {
      setPwMsg({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Could not change password',
      });
    }
    setPwBusy(false);
  };

  return (
    <div className="p-6 overflow-y-auto">
      <div className="max-w-2xl space-y-5">
        <div className="rounded-card bg-surface shadow-card p-6 space-y-5">
          <h2 className="text-base font-medium text-syncra-ink">Your account</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="syncra-label">Full Name</label>
              <input type="text" readOnly className="syncra-input bg-field opacity-80" value={user?.name || ''} />
            </div>
            <div>
              <label className="syncra-label">Email</label>
              <input type="text" readOnly className="syncra-input bg-field opacity-80" value={user?.email || ''} />
            </div>
            <div>
              <label className="syncra-label">Role</label>
              <input type="text" readOnly className="syncra-input bg-field opacity-80" value={user?.role || ''} />
            </div>
            <div>
              <label className="syncra-label">Org ID</label>
              <input type="text" readOnly className="syncra-input bg-field opacity-80" value={user?.org_id || ''} />
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="syncra-btn-ghost cursor-pointer active:scale-[0.98]"
          >
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>

        <div className="rounded-card bg-surface shadow-card p-6 space-y-5">
          <h2 className="text-base font-medium text-syncra-ink">Change password</h2>
          <form onSubmit={handlePassword} className="space-y-4 max-w-md">
            <div>
              <label className="syncra-label">Current password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="syncra-input"
              />
            </div>
            <div>
              <label className="syncra-label">New password</label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="syncra-input"
              />
            </div>
            <div>
              <label className="syncra-label">Confirm new password</label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="syncra-input"
              />
            </div>
            {pwMsg && (
              <p
                className={`text-xs ${
                  pwMsg.kind === 'ok' ? 'text-syncra-up' : 'text-syncra-down'
                }`}
              >
                {pwMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={pwBusy}
              className="syncra-btn-primary cursor-pointer active:scale-[0.98]"
            >
              {pwBusy ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>

        <div className="rounded-card bg-surface shadow-card p-6 space-y-5">
          <h2 className="text-base font-medium text-syncra-ink">Connections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="syncra-label">API Base URL</label>
              <input type="text" readOnly className="syncra-input bg-field opacity-80" value={getApiBase()} />
            </div>
            <div>
              <label className="syncra-label">WebSocket URL</label>
              <input type="text" readOnly className="syncra-input bg-field opacity-80" value={getWsUrl()} />
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
