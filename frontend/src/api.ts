import type { PatientCase, AuditEntry, AuthUser, PilotMetrics, OrgInfo, OrgUser, UrgencyLevel } from './types';
import { getDemoAudit, getDemoCase, getDemoCases, reviewDemoCase } from './sampleData';

// Empty = same-origin via Vite proxy (required so mt_session cookie isn't cross-site dropped).
// Set VITE_API_URL only if you intentionally call the API on another origin.
const rawBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const BASE = rawBase && rawBase.length > 0 ? rawBase : '';

// ponytail: Cascade (or nothing) may own API — fall back to sample dataset for UI
let useDemo = false;
let cachedMe: AuthUser | null = null;

export function getApiBase(): string {
  if (useDemo) return 'demo://sample';
  return BASE || `${window.location.origin} (proxy)`;
}

export function getWsUrl(): string {
  const rawWs = (import.meta.env.VITE_WS_URL as string | undefined)?.trim();
  if (rawWs) return rawWs;
  if (BASE) return `${BASE.replace(/^http/, 'ws')}/ws/queue`;
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/ws/queue`;
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.body && !(init.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...init?.headers,
    },
  });
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return res.json();
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await apiFetch('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error((detail as { detail?: string }).detail || `login ${res.status}`);
  }
  cachedMe = await res.json();
  useDemo = false;
  return cachedMe!;
}

export async function logout(): Promise<void> {
  await apiFetch('/api/v1/auth/logout', { method: 'POST' });
  cachedMe = null;
}

export async function fetchMe(): Promise<AuthUser | null> {
  try {
    const me = await apiGet<AuthUser>('/api/v1/me');
    cachedMe = me;
    useDemo = false;
    return me;
  } catch {
    cachedMe = null;
    return null;
  }
}

export function getMe(): AuthUser | null {
  return cachedMe;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const res = await apiFetch('/api/v1/auth/password', {
    method: 'POST',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error((detail as { detail?: string }).detail || `password ${res.status}`);
  }
}

export async function bootstrapRegister(payload: {
  email: string;
  password: string;
  name: string;
  role?: string;
}): Promise<AuthUser> {
  const res = await apiFetch('/api/v1/auth/bootstrap', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error((detail as { detail?: string }).detail || `register ${res.status}`);
  }
  cachedMe = await res.json();
  return cachedMe!;
}

export async function intakeText(text: string, patientName?: string, mrn?: string) {
  if (useDemo) throw new Error('Demo mode — start MedTriage API to submit intake');
  const fd = new FormData();
  fd.append('input_type', 'text');
  fd.append('text_content', text);
  if (patientName) fd.append('patient_name', patientName);
  if (mrn) fd.append('mrn', mrn);
  const res = await apiFetch('/api/v1/intake', { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`intake ${res.status}`);
  return res.json() as Promise<{ id: string; status: string; message: string }>;
}

export async function intakeAudio(
  file: File,
  patientName?: string,
  mrn?: string,
  language?: string
) {
  if (useDemo) throw new Error('Demo mode — start MedTriage API to submit intake');
  const fd = new FormData();
  fd.append('input_type', 'audio');
  fd.append('audio_file', file);
  if (patientName) fd.append('patient_name', patientName);
  if (mrn) fd.append('mrn', mrn);
  if (language) fd.append('language', language);
  const res = await apiFetch('/api/v1/intake', { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`intake ${res.status}`);
  return res.json() as Promise<{ id: string; status: string; message: string }>;
}

export async function listCases() {
  try {
    const res = await apiFetch('/api/v1/cases');
    if (res.status === 401) throw new Error('unauthorized');
    if (!res.ok) throw new Error(`GET /api/v1/cases ${res.status}`);
    useDemo = false;
    return res.json() as Promise<PatientCase[]>;
  } catch (err) {
    if (err instanceof Error && err.message === 'unauthorized') throw err;
    useDemo = true;
    return getDemoCases();
  }
}

export async function getCase(id: string) {
  if (useDemo) return getDemoCase(id);
  try {
    return await apiGet<PatientCase>(`/api/v1/cases/${id}`);
  } catch {
    useDemo = true;
    return getDemoCase(id);
  }
}

export async function reviewCase(caseId: string, action: string, newLevel: string, reason?: string) {
  if (useDemo) {
    const me = cachedMe;
    return reviewDemoCase(caseId, me?.id || 'demo', action, newLevel, reason);
  }
  const params = new URLSearchParams({ action, new_level: newLevel });
  if (reason) params.set('reason', reason);
  const res = await apiFetch(`/api/v1/cases/${caseId}/review?${params}`, { method: 'POST' });
  if (!res.ok) throw new Error(`review ${res.status}`);
  return res.json() as Promise<{ status: string; case_id: string }>;
}

export async function listAudit() {
  try {
    const logs = await apiGet<AuditEntry[]>('/api/v1/audit');
    useDemo = false;
    return logs;
  } catch {
    useDemo = true;
    return getDemoAudit();
  }
}

export async function fetchMetrics(from: string, to: string): Promise<PilotMetrics> {
  const q = new URLSearchParams({ from, to });
  const res = await apiFetch(`/api/v1/metrics?${q}`);
  if (res.status === 403) throw new Error('Admin role required for metrics');
  if (!res.ok) throw new Error(`metrics ${res.status}`);
  return res.json();
}

export async function downloadMetricsCsv(from: string, to: string): Promise<void> {
  const q = new URLSearchParams({ from, to, format: 'csv' });
  const res = await apiFetch(`/api/v1/metrics?${q}`);
  if (res.status === 403) throw new Error('Admin role required for metrics');
  if (!res.ok) throw new Error(`metrics csv ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `metrics-${from}-${to}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadHandoffCsv(hours = 8): Promise<void> {
  const res = await apiFetch(`/api/v1/metrics/handoff?hours=${hours}`);
  if (res.status === 403) throw new Error('Admin role required');
  if (!res.ok) throw new Error(`handoff ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `handoff-${hours}h.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function fetchOrg(): Promise<OrgInfo> {
  const res = await apiFetch('/api/v1/org');
  if (res.status === 403) throw new Error('Admin role required');
  if (!res.ok) throw new Error(`org ${res.status}`);
  return res.json();
}

export async function patchOrg(body: {
  name?: string;
  site_name?: string;
  timezone?: string;
  seat_cap?: number;
  urgency_labels?: Partial<Record<UrgencyLevel, string>>;
  accept_notice?: boolean;
  notice_version?: string;
  escalation_webhook_url?: string;
  escalation_email?: string;
  escalation_minutes?: number;
}): Promise<OrgInfo> {
  const res = await apiFetch('/api/v1/org', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error((detail as { detail?: string }).detail || `org patch ${res.status}`);
  }
  return res.json();
}

export async function listOrgUsers(): Promise<OrgUser[]> {
  const res = await apiFetch('/api/v1/org/users');
  if (!res.ok) throw new Error(`org users ${res.status}`);
  return res.json();
}

export async function inviteUser(payload: {
  email: string;
  password: string;
  name: string;
  role: string;
}): Promise<{ id: string; email: string; role: string }> {
  const res = await apiFetch('/api/v1/auth/invite', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error((detail as { detail?: string }).detail || `invite ${res.status}`);
  }
  return res.json();
}

export async function setUserActive(userId: string, active: boolean): Promise<void> {
  const action = active ? 'activate' : 'deactivate';
  const res = await apiFetch(`/api/v1/org/users/${userId}/${action}`, { method: 'POST' });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error((detail as { detail?: string }).detail || `${action} ${res.status}`);
  }
}

export async function softDeleteCase(caseId: string): Promise<void> {
  const res = await apiFetch(`/api/v1/org/cases/${caseId}/delete`, { method: 'POST' });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error((detail as { detail?: string }).detail || `delete ${res.status}`);
  }
}

/** @deprecated use getMe — kept for gradual UI migration */
export function getClinician(): { name: string; id: string } {
  if (cachedMe) return { name: cachedMe.name, id: cachedMe.id };
  return { name: 'Not signed in', id: '' };
}

export function pct(v: number): number {
  return Math.round(v * 100);
}
