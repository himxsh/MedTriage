import type { AuditEntry, PatientCase } from './types';

/** Demo dataset for UI when the MedTriage API is unreachable. */
const NOW = Date.now();
const ago = (mins: number) => new Date(NOW - mins * 60_000).toISOString();

export const SAMPLE_CASES: PatientCase[] = [
  {
    id: 'a1b2c3d4-1111-4aaa-8aaa-000000000001',
    patient_name: 'Maria Santos',
    mrn: 'MRN-48291',
    input_type: 'text',
    raw_text: '62F sudden crushing chest pain radiating to left arm, diaphoretic, BP 88/50, HR 118. Hx CAD, stents 2019.',
    transcription: null,
    chief_complaint: 'Crushing chest pain with hypotension',
    key_symptoms: ['chest_pain', 'diaphoresis', 'radiation_to_arm', 'hypotension'],
    risk_flags: ['hemodynamic_instability', 'known_cad'],
    urgency_level: 'Critical',
    confidence_score: 0.94,
    evidence: 'Acute coronary syndrome presentation with hypotension; immediate ED evaluation indicated.',
    entities: [
      { text: 'chest pain', label: 'SIGN_SYMPTOM', start: 15, end: 25, mappings: [{ cui: 'C0008031', name: 'Chest Pain', score: 0.98 }] },
      { text: 'hypotension', label: 'SIGN_SYMPTOM', start: 58, end: 69, mappings: [{ cui: 'C0020649', name: 'Hypotension', score: 0.95 }] },
    ],
    relationships: [
      { source: 'chest pain', type: 'severity', evidence: 'crushing', indicators: ['crushing'] },
      { source: 'chest pain', type: 'radiation', evidence: 'radiating to left arm', indicators: ['radiating'] },
    ],
    status: 'Pending Review',
    created_at: ago(12),
    updated_at: ago(12),
  },
  {
    id: 'a1b2c3d4-2222-4aaa-8aaa-000000000002',
    patient_name: 'James Okonkwo',
    mrn: 'MRN-10334',
    input_type: 'text',
    raw_text: '45M fever 39.2C, productive cough 4 days, SpO2 91% on room air, RR 28. Crackles RLL.',
    transcription: null,
    chief_complaint: 'Fever and hypoxia with productive cough',
    key_symptoms: ['fever', 'productive_cough', 'hypoxia', 'tachypnea'],
    risk_flags: ['hypoxia'],
    urgency_level: 'High',
    confidence_score: 0.88,
    evidence: 'Community-acquired pneumonia suspected with oxygen desaturation.',
    entities: [
      { text: 'fever', label: 'SIGN_SYMPTOM', start: 4, end: 9, mappings: [{ cui: 'C0015967', name: 'Fever', score: 0.99 }] },
      { text: 'cough', label: 'SIGN_SYMPTOM', start: 32, end: 37, mappings: [{ cui: 'C0010200', name: 'Cough', score: 0.97 }] },
    ],
    relationships: [
      { source: 'cough', type: 'duration', evidence: '4 days', indicators: ['days'] },
    ],
    status: 'Pending Review',
    created_at: ago(28),
    updated_at: ago(28),
  },
  {
    id: 'a1b2c3d4-3333-4aaa-8aaa-000000000003',
    patient_name: 'Elena Petrova',
    mrn: 'MRN-77402',
    input_type: 'audio',
    raw_text: '28F sudden severe headache worst of life, photophobia, neck stiffness. No trauma.',
    transcription: 'Twenty-eight year old female sudden severe headache worst of life, photophobia, neck stiffness.',
    chief_complaint: 'Thunderclap headache with meningismus',
    key_symptoms: ['severe_headache', 'photophobia', 'neck_stiffness'],
    risk_flags: ['possible_sah', 'meningismus'],
    urgency_level: 'Critical',
    confidence_score: 0.91,
    evidence: 'Thunderclap headache with neck stiffness raises concern for SAH or meningitis.',
    entities: [
      { text: 'headache', label: 'SIGN_SYMPTOM', start: 20, end: 28, mappings: [{ cui: 'C0018681', name: 'Headache', score: 0.99 }] },
      { text: 'photophobia', label: 'SIGN_SYMPTOM', start: 45, end: 56, mappings: [{ cui: 'C0085636', name: 'Photophobia', score: 0.96 }] },
    ],
    relationships: [],
    status: 'Pending Review',
    created_at: ago(41),
    updated_at: ago(41),
  },
  {
    id: 'a1b2c3d4-4444-4aaa-8aaa-000000000004',
    patient_name: 'Robert Chen',
    mrn: 'MRN-22918',
    input_type: 'text',
    raw_text: '71M fall at home, right hip pain, unable to bear weight. Alert, BP stable. Anticoagulated on warfarin.',
    transcription: null,
    chief_complaint: 'Fall with suspected hip fracture',
    key_symptoms: ['hip_pain', 'inability_to_bear_weight'],
    risk_flags: ['anticoagulation', 'elderly_fall'],
    urgency_level: 'High',
    confidence_score: 0.86,
    evidence: 'Elderly fall with hip pain and anticoagulation; imaging and INR check warranted.',
    entities: [
      { text: 'hip pain', label: 'SIGN_SYMPTOM', start: 22, end: 30, mappings: [{ cui: 'C0019559', name: 'Hip Pain', score: 0.94 }] },
      { text: 'warfarin', label: 'MEDICATION', start: 88, end: 96, mappings: [{ cui: 'C0043031', name: 'Warfarin', score: 0.99 }] },
    ],
    relationships: [
      { source: 'warfarin', type: 'medication', evidence: 'anticoagulated on warfarin', indicators: ['anticoagulated'] },
    ],
    status: 'Pending Review',
    created_at: ago(55),
    updated_at: ago(55),
  },
  {
    id: 'a1b2c3d4-5555-4aaa-8aaa-000000000005',
    patient_name: 'Aisha Rahman',
    mrn: 'MRN-55120',
    input_type: 'text',
    raw_text: '34F RLQ pain 8/10 for 6 hours, anorexia, nausea. Guarding on exam. Afebrile.',
    transcription: null,
    chief_complaint: 'Right lower quadrant abdominal pain',
    key_symptoms: ['abdominal_pain', 'anorexia', 'nausea', 'guarding'],
    risk_flags: ['possible_appendicitis'],
    urgency_level: 'Medium',
    confidence_score: 0.82,
    evidence: 'Classic appendicitis pattern; surgical evaluation recommended.',
    entities: [
      { text: 'abdominal pain', label: 'SIGN_SYMPTOM', start: 4, end: 12, mappings: [{ cui: 'C0000737', name: 'Abdominal Pain', score: 0.93 }] },
    ],
    relationships: [
      { source: 'abdominal pain', type: 'location', evidence: 'RLQ', indicators: ['RLQ'] },
    ],
    status: 'Pending Review',
    created_at: ago(73),
    updated_at: ago(73),
  },
  {
    id: 'a1b2c3d4-6666-4aaa-8aaa-000000000006',
    patient_name: 'Thomas Nguyen',
    mrn: 'MRN-88041',
    input_type: 'text',
    raw_text: '19M sore throat 2 days, no fever, mild cough. Ambulatory, vitals normal.',
    transcription: null,
    chief_complaint: 'Sore throat',
    key_symptoms: ['sore_throat', 'mild_cough'],
    risk_flags: [],
    urgency_level: 'Low',
    confidence_score: 0.79,
    evidence: 'Uncomplicated viral pharyngitis presentation; outpatient management appropriate.',
    entities: [
      { text: 'sore throat', label: 'SIGN_SYMPTOM', start: 4, end: 15, mappings: [{ cui: 'C0242429', name: 'Sore Throat', score: 0.97 }] },
    ],
    relationships: [],
    status: 'Pending Review',
    created_at: ago(90),
    updated_at: ago(90),
  },
  {
    id: 'a1b2c3d4-7777-4aaa-8aaa-000000000007',
    patient_name: 'Priya Sharma',
    mrn: 'MRN-33667',
    input_type: 'text',
    raw_text: '55F known asthma, wheezing after allergen exposure. Speaks in short sentences, SpO2 94%.',
    transcription: null,
    chief_complaint: 'Asthma exacerbation',
    key_symptoms: ['wheezing', 'dyspnea'],
    risk_flags: ['known_asthma'],
    urgency_level: 'Medium',
    confidence_score: 0.85,
    evidence: 'Moderate asthma exacerbation; bronchodilators and observation indicated.',
    entities: [
      { text: 'asthma', label: 'DISEASE', start: 10, end: 16, mappings: [{ cui: 'C0004096', name: 'Asthma', score: 0.99 }] },
      { text: 'wheezing', label: 'SIGN_SYMPTOM', start: 18, end: 26, mappings: [{ cui: 'C0043144', name: 'Wheezing', score: 0.98 }] },
    ],
    relationships: [],
    status: 'Completed',
    created_at: ago(140),
    updated_at: ago(100),
  },
  {
    id: 'a1b2c3d4-8888-4aaa-8aaa-000000000008',
    patient_name: 'David Morales',
    mrn: 'MRN-91205',
    input_type: 'audio',
    raw_text: '40M laceration to left forearm from kitchen knife. Bleeding controlled. Distal sensation intact.',
    transcription: 'Forty year old male laceration to left forearm from kitchen knife. Bleeding controlled.',
    chief_complaint: 'Forearm laceration',
    key_symptoms: ['laceration', 'bleeding'],
    risk_flags: [],
    urgency_level: 'Low',
    confidence_score: 0.9,
    evidence: 'Controlled bleeding with intact neurovascular exam; wound care and closure.',
    entities: [
      { text: 'laceration', label: 'INJURY', start: 4, end: 14, mappings: [{ cui: 'C0043246', name: 'Laceration', score: 0.96 }] },
    ],
    relationships: [],
    status: 'Completed',
    created_at: ago(200),
    updated_at: ago(160),
  },
];

export const SAMPLE_AUDIT: AuditEntry[] = [
  {
    id: 1,
    case_id: 'a1b2c3d4-7777-4aaa-8aaa-000000000007',
    clinician_id: 'MED-D042-X',
    action: 'Confirm',
    previous_level: 'Medium',
    new_level: 'Medium',
    reason: null,
    timestamp: ago(100),
  },
  {
    id: 2,
    case_id: 'a1b2c3d4-8888-4aaa-8aaa-000000000008',
    clinician_id: 'MED-D042-X',
    action: 'Confirm',
    previous_level: 'Low',
    new_level: 'Low',
    reason: null,
    timestamp: ago(160),
  },
  {
    id: 3,
    case_id: 'a1b2c3d4-8888-4aaa-8aaa-000000000008',
    clinician_id: 'NURSE-118',
    action: 'Override',
    previous_level: 'Medium',
    new_level: 'Low',
    reason: 'Bleeding controlled; distal NV intact; tetanus up to date.',
    timestamp: ago(165),
  },
];

// Mutable copies so Confirm / Override work in demo mode
let demoCases = SAMPLE_CASES.map(c => ({ ...c, key_symptoms: [...c.key_symptoms], risk_flags: [...c.risk_flags], entities: [...c.entities], relationships: [...c.relationships] }));
let demoAudit = [...SAMPLE_AUDIT];
let nextAuditId = 4;

export function getDemoCases(): PatientCase[] {
  return demoCases.map(c => ({ ...c }));
}

export function getDemoCase(id: string): PatientCase {
  const found = demoCases.find(c => c.id === id || c.id.startsWith(id));
  if (!found) throw new Error(`demo case ${id} not found`);
  return { ...found };
}

export function getDemoAudit(): AuditEntry[] {
  return demoAudit.map(a => ({ ...a }));
}

export function reviewDemoCase(caseId: string, clinicianId: string, action: string, newLevel: string, reason?: string) {
  const idx = demoCases.findIndex(c => c.id === caseId || c.id.startsWith(caseId));
  if (idx < 0) throw new Error(`demo case ${caseId} not found`);
  const prev = demoCases[idx].urgency_level;
  demoCases[idx] = {
    ...demoCases[idx],
    urgency_level: newLevel as PatientCase['urgency_level'],
    status: 'Completed',
    updated_at: new Date().toISOString(),
  };
  demoAudit = [
    {
      id: nextAuditId++,
      case_id: demoCases[idx].id,
      clinician_id: clinicianId,
      action,
      previous_level: prev,
      new_level: newLevel,
      reason: reason || null,
      timestamp: new Date().toISOString(),
    },
    ...demoAudit,
  ];
  return { status: 'success', case_id: demoCases[idx].id };
}
