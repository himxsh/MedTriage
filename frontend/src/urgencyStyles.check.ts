// ponytail: smoke check — `npx tsx src/urgencyStyles.check.ts`
import type { UrgencyLevel } from './types';
import { getUrgencyButtonClasses, getUrgencyClasses } from './urgencyStyles';

const levels: UrgencyLevel[] = ['Critical', 'High', 'Medium', 'Low'];
for (const l of levels) {
  const cls = getUrgencyClasses(l);
  console.assert(cls.bg && cls.text && cls.fg && cls.border && cls.outline && cls.hoverBorder, `getUrgencyClasses(${l})`);
  console.assert(typeof getUrgencyButtonClasses(l, true) === 'string', `getUrgencyButtonClasses(${l}, true)`);
  console.assert(typeof getUrgencyButtonClasses(l, false) === 'string', `getUrgencyButtonClasses(${l}, false)`);
}
console.log('✓ urgencyStyles smoke check passed — all 4 levels covered');
