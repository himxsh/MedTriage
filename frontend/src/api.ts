import type { PatientCase, AuditEntry } from './types';

const BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

export function getApiBase(): string {
  return BASE;
}

export function getWsUrl(): string {
  return (import.meta.env.VITE_WS_URL as string) || `${BASE.replace(/^http/, 'ws')}/ws/queue`;
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return res.json();
}

export async function intakeText(text: string, patientName?: string) {
  const fd = new FormData();
  fd.append('input_type', 'text');
  fd.append('text_content', text);
  if (patientName) fd.append('patient_name', patientName);
  const res = await fetch(`${BASE}/api/v1/intake`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`intake ${res.status}`);
  return res.json() as Promise<{ id: string; status: string; message: string }>;
}

export async function intakeAudio(file: File, patientName?: string) {
  const fd = new FormData();
  fd.append('input_type', 'audio');
  fd.append('audio_file', file);
  if (patientName) fd.append('patient_name', patientName);
  const res = await fetch(`${BASE}/api/v1/intake`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`intake ${res.status}`);
  return res.json() as Promise<{ id: string; status: string; message: string }>;
}

export async function listCases() {
  return apiGet<PatientCase[]>('/api/v1/cases');
}

export async function getCase(id: string) {
  return apiGet<PatientCase>(`/api/v1/cases/${id}`);
}

export async function reviewCase(caseId: string, clinicianId: string, action: string, newLevel: string, reason?: string) {
  const params = new URLSearchParams({ clinician_id: clinicianId, action, new_level: newLevel });
  if (reason) params.set('reason', reason);
  const res = await fetch(`${BASE}/api/v1/cases/${caseId}/review?${params}`, { method: 'POST' });
  if (!res.ok) throw new Error(`review ${res.status}`);
  return res.json() as Promise<{ status: string; case_id: string }>;
}

export async function listAudit() {
  return apiGet<AuditEntry[]>('/api/v1/audit');
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
