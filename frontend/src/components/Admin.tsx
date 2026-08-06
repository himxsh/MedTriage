import React, { useEffect, useState } from 'react';
import {
  fetchOrg,
  patchOrg,
  listOrgUsers,
  inviteUser,
  setUserActive,
  softDeleteCase,
  getApiBase,
  getWsUrl,
  listCases,
} from '../api';
import type { OrgInfo, OrgUser } from '../types';

const ROLES = ['intake', 'nurse', 'physician', 'admin'] as const;
const TZ_PRESETS = ['Asia/Kolkata', 'Asia/Dubai', 'UTC'];

export default function Admin() {
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [connStatus, setConnStatus] = useState<'checking' | 'ok' | 'fail'>('checking');

  const [name, setName] = useState('');
  const [site, setSite] = useState('');
  const [tz, setTz] = useState('Asia/Kolkata');
  const [cap, setCap] = useState(5);

  const [invEmail, setInvEmail] = useState('');
  const [invName, setInvName] = useState('');
  const [invRole, setInvRole] = useState<string>('nurse');
  const [invPw, setInvPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleteCaseId, setDeleteCaseId] = useState('');

  const reload = async () => {
    setError('');
    const [o, u] = await Promise.all([fetchOrg(), listOrgUsers()]);
    setOrg(o);
    setUsers(u);
    setName(o.name);
    setSite(o.site_name || '');
    setTz(o.timezone);
    setCap(o.seat_cap);
  };

  useEffect(() => {
    reload()
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load admin'))
      .finally(() => setLoading(false));
    listCases()
      .then(() => setConnStatus('ok'))
      .catch(() => setConnStatus('fail'));
  }, []);

  const saveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    setError('');
    try {
      const o = await patchOrg({
        name: name.trim(),
        site_name: site.trim(),
        timezone: tz.trim(),
        seat_cap: cap,
      });
      setOrg(o);
      setMsg('Organization saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
    setBusy(false);
  };

  const onInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    setError('');
    try {
      await inviteUser({
        email: invEmail.trim(),
        password: invPw,
        name: invName.trim(),
        role: invRole,
      });
      setInvEmail('');
      setInvName('');
      setInvPw('');
      setMsg(`Invited ${invEmail.trim()}.`);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invite failed');
    }
    setBusy(false);
  };

  const toggleActive = async (u: OrgUser) => {
    setError('');
    try {
      await setUserActive(u.id, !u.is_active);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  if (loading) {
    return <div className="p-6 text-xs text-syncra-muted">Loading admin…</div>;
  }

  return (
    <div className="p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <h2 className="text-base font-medium text-syncra-ink">Organization admin</h2>
          <p className="text-xs text-syncra-muted mt-1">
            Site settings, seats, and clinician invites. Admin only.
          </p>
        </div>

        {error && <p className="text-xs text-syncra-down">{error}</p>}
        {msg && <p className="text-xs text-syncra-up">{msg}</p>}

        <div className="syncra-card p-5 space-y-4">
          <div className="flex flex-wrap justify-between gap-2 items-center">
            <h3 className="text-sm font-medium text-syncra-ink">Seats</h3>
            {org && (
              <span className="text-xs text-syncra-secondary">
                {org.seats_active} active / {org.seats_used} total · cap {org.seat_cap}
                {org.seats_active >= org.seat_cap ? ' · at capacity' : ''}
              </span>
            )}
          </div>
          <div className="h-2 rounded-full bg-syncra-card-stroke overflow-hidden">
            <div
              className="h-full bg-syncra-ink/70"
              style={{
                width: org
                  ? `${Math.min(100, (org.seats_active / Math.max(1, org.seat_cap)) * 100)}%`
                  : '0%',
              }}
            />
          </div>
        </div>

        <form onSubmit={saveOrg} className="syncra-card p-5 space-y-4">
          <h3 className="text-sm font-medium text-syncra-ink">Site</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="syncra-label">Organization name</label>
              <input className="syncra-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="syncra-label">Site name</label>
              <input className="syncra-input" value={site} onChange={(e) => setSite(e.target.value)} placeholder="ED Desk 1" />
            </div>
            <div>
              <label className="syncra-label">Timezone</label>
              <input
                className="syncra-input"
                list="tz-presets"
                value={tz}
                onChange={(e) => setTz(e.target.value)}
                required
              />
              <datalist id="tz-presets">
                {TZ_PRESETS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="syncra-label">Seat cap (soft)</label>
              <input
                type="number"
                min={1}
                max={500}
                className="syncra-input"
                value={cap}
                onChange={(e) => setCap(Number(e.target.value))}
              />
            </div>
          </div>
          <button type="submit" disabled={busy} className="syncra-btn-primary cursor-pointer">
            Save site
          </button>
        </form>

        <form onSubmit={onInvite} className="syncra-card p-5 space-y-4">
          <h3 className="text-sm font-medium text-syncra-ink">Invite clinician</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="syncra-label">Name</label>
              <input className="syncra-input" value={invName} onChange={(e) => setInvName(e.target.value)} required />
            </div>
            <div>
              <label className="syncra-label">Email</label>
              <input type="email" className="syncra-input" value={invEmail} onChange={(e) => setInvEmail(e.target.value)} required />
            </div>
            <div>
              <label className="syncra-label">Role</label>
              <select className="syncra-input" value={invRole} onChange={(e) => setInvRole(e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="syncra-label">Temporary password</label>
              <input
                type="password"
                minLength={8}
                className="syncra-input"
                value={invPw}
                onChange={(e) => setInvPw(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" disabled={busy} className="syncra-btn-primary cursor-pointer">
            Send invite
          </button>
        </form>

        <div className="syncra-card syncra-table-wrap overflow-hidden">
          <div className="px-5 py-3 border-b border-syncra-border">
            <h3 className="text-sm font-medium text-syncra-ink">Clinicians</h3>
          </div>
          <table className="syncra-table text-left text-xs">
            <thead className="bg-syncra-card-stroke border-b border-syncra-border text-syncra-secondary">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-syncra-border">
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.is_active ? 'Active' : 'Inactive'}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => toggleActive(u)}
                      className="syncra-btn-ghost cursor-pointer text-[11px]"
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="syncra-card p-5 space-y-4">
          <h3 className="text-sm font-medium text-syncra-ink">Erase case (DPDP request)</h3>
          <p className="text-[11px] text-syncra-muted">
            Soft-deletes a case in this org after a hospital erasure ticket. See docs/compliance/deletion-runbook.md.
          </p>
          <form
            className="flex flex-wrap gap-2 items-end"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError('');
              setMsg('');
              try {
                await softDeleteCase(deleteCaseId.trim());
                setMsg(`Soft-deleted case ${deleteCaseId.trim()}.`);
                setDeleteCaseId('');
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Delete failed');
              }
              setBusy(false);
            }}
          >
            <div className="flex-1 min-w-[200px]">
              <label className="syncra-label">Case UUID</label>
              <input
                className="syncra-input font-mono text-xs"
                value={deleteCaseId}
                onChange={(e) => setDeleteCaseId(e.target.value)}
                required
                placeholder="00000000-0000-0000-0000-000000000000"
              />
            </div>
            <button type="submit" disabled={busy} className="syncra-btn-ghost cursor-pointer text-syncra-down">
              Soft-delete
            </button>
          </form>
        </div>

        <div className="syncra-card p-5 space-y-3">
          <h3 className="text-sm font-medium text-syncra-ink">IT connection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="syncra-label">API base</label>
              <input readOnly className="syncra-input bg-syncra-card-stroke opacity-80" value={getApiBase()} />
            </div>
            <div>
              <label className="syncra-label">WebSocket</label>
              <input readOnly className="syncra-input bg-syncra-card-stroke opacity-80" value={getWsUrl()} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-syncra-secondary">API status:</span>
            {connStatus === 'checking' ? (
              <span className="text-syncra-muted">Checking…</span>
            ) : connStatus === 'ok' ? (
              <span className="text-syncra-up">OK</span>
            ) : (
              <span className="text-syncra-down">Fail</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
