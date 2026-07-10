#!/usr/bin/env node
// ponytail: minimal smoke check — fails if API shape breaks
const BASE = process.env.VITE_API_URL || 'http://localhost:8000';

async function main() {
  // 1. Root health check
  const root = await (await fetch(`${BASE}/`)).json();
  if (root.status !== 'running') throw new Error(`Root check: ${JSON.stringify(root)}`);
  console.log('✓ / returns running');

  // 2. Cases list — must be an array
  const cases = await (await fetch(`${BASE}/api/v1/cases`)).json();
  if (!Array.isArray(cases)) throw new Error(`Cases not array: ${typeof cases}`);
  console.log(`✓ /api/v1/cases returns ${cases.length} cases`);

  // 3. Shape check — if any case exists, verify mapped fields
  if (cases.length > 0) {
    const c = cases[0];
    const required = ['id', 'patient_name', 'input_type', 'raw_text', 'chief_complaint',
      'key_symptoms', 'risk_flags', 'urgency_level', 'confidence_score',
      'evidence', 'entities', 'relationships', 'status', 'created_at', 'updated_at'];
    for (const field of required) {
      if (!(field in c)) throw new Error(`Case missing field: ${field}`);
    }
    const valid = ['Critical', 'High', 'Medium', 'Low'];
    if (!valid.includes(c.urgency_level)) throw new Error(`Bad urgency: ${c.urgency_level}`);
    console.log(`✓ Case shape valid (urgency=${c.urgency_level}, confidence=${c.confidence_score})`);
  }

  // 4. Audit endpoint
  const audit = await (await fetch(`${BASE}/api/v1/audit`)).json();
  if (!Array.isArray(audit)) throw new Error(`Audit not array: ${typeof audit}`);
  console.log(`✓ /api/v1/audit returns ${audit.length} entries`);

  console.log('\n✓ All smoke checks passed');
  process.exit(0);
}

main().catch(err => {
  console.error('✗ SMOKE TEST FAILED:', err.message);
  process.exit(1);
});
