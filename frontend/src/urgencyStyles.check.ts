// ponytail: smoke check — `npx tsx src/urgencyStyles.check.ts`
import type { UrgencyLevel } from './types';
import { getUrgencyButtonClasses, getUrgencyClasses, isDownTriage, isUpTriage, URGENCY_RANK } from './urgencyStyles';

const levels: UrgencyLevel[] = ['Critical', 'High', 'Medium', 'Low'];
for (const l of levels) {
  const cls = getUrgencyClasses(l);
  console.assert(cls.bg && cls.text && cls.fg && cls.border && cls.outline && cls.hoverBorder, `getUrgencyClasses(${l})`);
  console.assert(typeof getUrgencyButtonClasses(l, true) === 'string', `getUrgencyButtonClasses(${l}, true)`);
  console.assert(typeof getUrgencyButtonClasses(l, false) === 'string', `getUrgencyButtonClasses(${l}, false)`);
}

// rank helpers
console.assert(URGENCY_RANK.Critical === 0 && URGENCY_RANK.Low === 3, 'URGENCY_RANK values');
console.assert(isDownTriage('Critical', 'Medium'), 'Critical→Medium is down-triage');
console.assert(!isDownTriage('Medium', 'Critical'), 'Medium→Critical is not down-triage');
console.assert(isUpTriage('Low', 'High'), 'Low→High is up-triage');
console.assert(!isUpTriage('High', 'Low'), 'High→Low is not up-triage');
console.assert(!isDownTriage('High', 'High') && !isUpTriage('High', 'High'), 'same level is neither');

console.log('✓ urgencyStyles smoke check passed — all 4 levels + rank helpers');
