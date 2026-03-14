export type Screen = 'landing' | 'login' | 'register' | 'dashboard' | 'history' | 'intake' | 'review' | 'audit' | 'settings';

export interface PatientCase {
  id: string;
  patient: string;
  complaint: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MODERATE';
  confidence: number;
  time: string;
  age: number;
  sex: 'M' | 'F';
  arrival: string;
  vitals: {
    bp: string;
    hr: number;
    spo2: string;
    temp: string;
  };
}

export interface AuditEntry {
  timestamp: string;
  clinicianId: string;
  caseRef: string;
  action: string;
  prevLevel: string;
  newLevel: string;
  status: 'upgrade' | 'downgrade' | 'initial' | 'discharge' | 'record' | 'error' | 'vital' | 'dispense';
}
