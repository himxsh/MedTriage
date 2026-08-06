export type Screen =
  | 'landing'
  | 'docs'
  | 'login'
  | 'register'
  | 'queue'
  | 'cases'
  | 'intake'
  | 'audit'
  | 'metrics'
  | 'admin'
  | 'account';

export type AppScreen = 'queue' | 'cases' | 'audit' | 'metrics' | 'admin' | 'account';

export type UrgencyLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type UserRole = 'intake' | 'nurse' | 'physician' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole | string;
  org_id: string;
}

export interface PatientCase {
  id: string;
  patient_name: string | null;
  mrn: string | null;
  input_type: string;
  raw_text: string;
  transcription: string | null;
  chief_complaint: string | null;
  key_symptoms: string[];
  risk_flags: string[];
  urgency_level: UrgencyLevel;
  confidence_score: number;
  evidence: string | null;
  entities: EntityData[];
  relationships: RelationshipData[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface EntityData {
  text: string;
  label: string;
  start: number;
  end: number;
  mappings: Array<{ cui: string; name: string; score: number }>;
}

export interface RelationshipData {
  source: string;
  type: string;
  evidence: string;
  indicators: string[];
}

export interface AuditEntry {
  id: number;
  case_id: string;
  clinician_id: string;
  action: string;
  previous_level: string | null;
  new_level: string;
  reason: string | null;
  timestamp: string;
}

export interface PilotMetrics {
  org_id: string;
  from_ts: string;
  to_ts: string;
  cases_ingested: number;
  cases_processed: number;
  cases_failed: number;
  latency_median_sec: number | null;
  latency_p95_sec: number | null;
  latency_sample_n: number;
  reviews_total: number;
  confirms: number;
  overrides: number;
  confirm_rate: number | null;
  override_rate: number | null;
  down_triage_overrides: number;
  down_triage_reason_pct: number | null;
  urgency_distribution: Record<string, number>;
  active_clinicians: number;
  open_sessions: number;
  notes: string[];
}

export interface OrgInfo {
  id: string;
  name: string;
  site_name: string | null;
  timezone: string;
  seat_cap: number;
  seats_used: number;
  seats_active: number;
}

export interface OrgUser {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}
