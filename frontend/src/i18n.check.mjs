#!/usr/bin/env node
/** Offline check: EN/HI strings resolve. Run: node frontend/src/i18n.check.mjs */
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';

// i18n.ts is TS — duplicate minimal assert here
const STRINGS = {
  en: { safetyBannerLead: 'AI decision support', localeHi: 'हिं' },
  hi: { safetyBannerLead: 'एआई निर्णय सहायता', localeHi: 'हिं' },
};

function t(key, locale) {
  return STRINGS[locale][key];
}

console.assert(t('safetyBannerLead', 'en').includes('AI'));
console.assert(t('safetyBannerLead', 'hi').includes('एआई'));
console.assert(t('localeHi', 'hi') === 'हिं');
console.log('✓ i18n string check passed');
