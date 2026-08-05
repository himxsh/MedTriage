import type { PatientCase, AuditEntry } from './types';
import { getDemoAudit, getDemoCase, getDemoCases, reviewDemoCase } from './sampleData';

// Default to same host as the page so LAN clients don't hit their own localhost.
const BASE =
  (import.meta.env.VITE_API_URL as string) ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

// ponytail: Cascade (or nothing) may own :8000 — fall back to sample dataset for UI
let useDemo = false;

export function getApiBase(): string {
  return useDemo ? 'demo://sample' : BASE;
}

export function getWsUrl(): string {
  return (import.meta.env.VITE_WS_URL as string) || `${BASE.replace(/^http/, 'ws')}/ws/queue`;
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return res.json();
}

export async function intakeText(text: string, patientName?: string, mrn?: string) {
  if (useDemo) throw new Error('Demo mode — start MedTriage API to submit intake');
  const fd = new FormData();
  fd.append('input_type', 'text');
  fd.append('text_content', text);
  if (patientName) fd.append('patient_name', patientName);
  if (mrn) fd.append('mrn', mrn);
  const res = await fetch(`${BASE}/api/v1/intake`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`intake ${res.status}`);
  return res.json() as Promise<{ id: string; status: string; message: string }>;
}

export async function intakeAudio(file: File, patientName?: string, mrn?: string) {
  if (useDemo) throw new Error('Demo mode — start MedTriage API to submit intake');
  const fd = new FormData();
  fd.append('input_type', 'audio');
  fd.append('audio_file', file);
  if (patientName) fd.append('patient_name', patientName);
  if (mrn) fd.append('mrn', mrn);
  const res = await fetch(`${BASE}/api/v1/intake`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`intake ${res.status}`);
  return res.json() as Promise<{ id: string; status: string; message: string }>;
}

export async function listCases() {
  try {
    const cases = await apiGet<PatientCase[]>('/api/v1/cases');
    useDemo = false;
    return cases;
  } catch {
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

export async function reviewCase(caseId: string, clinicianId: string, action: string, newLevel: string, reason?: string) {
  if (useDemo) return reviewDemoCase(caseId, clinicianId, action, newLevel, reason);
  const params = new URLSearchParams({ clinician_id: clinicianId, action, new_level: newLevel });
  if (reason) params.set('reason', reason);
  const res = await fetch(`${BASE}/api/v1/cases/${caseId}/review?${params}`, { method: 'POST' });
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

export function getClinician(): { name: string; id: string } {
  return {
    name: localStorage.getItem('clinician_name') || 'Dr. Unknown',
    id: localStorage.getItem('clinician_id') || 'unknown',
  };
}

export function saveClinician(name: string, id: string) {
  localStorage.setItem('clinician_name', name);
  localStorage.setItem('clinician_id', id);
}

export function pct(v: number): number {
  return Math.round(v * 100);
}
