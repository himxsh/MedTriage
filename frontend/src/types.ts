export type Screen =
  | 'landing'
  | 'login'
  | 'register'
  | 'queue'
  | 'cases'
  | 'intake'
  | 'audit'
  | 'account';

export type AppScreen = 'queue' | 'cases' | 'audit' | 'account';

export type UrgencyLevel = 'Critical' | 'High' | 'Medium' | 'Low';

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
