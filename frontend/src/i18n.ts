/** Minimal EN / Hindi UI strings for B0.3. Urgency enums stay English. */
export type Locale = 'en' | 'hi';

const KEY = 'mt_locale';

export function getLocale(): Locale {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'hi' || v === 'en') return v;
  } catch {
    /* ignore */
  }
  return 'en';
}

export function setLocale(locale: Locale): void {
  try {
    localStorage.setItem(KEY, locale);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('mt-locale', { detail: locale }));
}

const STRINGS = {
  en: {
    safetyBanner:
      'AI decision support — clinician must Confirm or Override before acting. Not a diagnosis. Urgency is advisory until reviewed.',
    safetyBannerLead: 'AI decision support',
    newIntake: 'New Intake',
    queue: 'Queue',
    cases: 'Cases',
    audit: 'Audit',
    metrics: 'Metrics',
    admin: 'Admin',
    account: 'Account',
    intakeTitle: 'New Intake',
    patientName: 'Patient Name',
    mrn: 'MRN',
    clinicalNotes: 'Clinical notes',
    notesPlaceholder: 'English or Hinglish notes accepted…',
    clinicalNotesRequired: 'Clinical notes required',
    audioRequired: 'Audio file required',
    submitIntake: 'Submit Intake',
    textMode: 'Text',
    audioMode: 'Audio',
    hinglishHint: 'Text may be English, Hindi, or Hinglish. Urgency labels stay in English.',
    localeEn: 'EN',
    localeHi: 'हिं',
  },
  hi: {
    safetyBanner:
      'एआई निर्णय सहायता — कार्रवाई से पहले चिकित्सक को Confirm या Override करना आवश्यक है। यह निदान नहीं है। समीक्षा तक urgency सलाहकार है।',
    safetyBannerLead: 'एआई निर्णय सहायता',
    newIntake: 'नया इनटेक',
    queue: 'कतार',
    cases: 'केस',
    audit: 'ऑडिट',
    metrics: 'मेट्रिक्स',
    admin: 'एडमिन',
    account: 'खाता',
    intakeTitle: 'नया इनटेक',
    patientName: 'रोगी का नाम',
    mrn: 'MRN',
    clinicalNotes: 'क्लिनिकल नोट्स',
    notesPlaceholder: 'अंग्रेज़ी या हिंग्लिश नोट्स स्वीकार…',
    clinicalNotesRequired: 'क्लिनिकल नोट्स आवश्यक',
    audioRequired: 'ऑडियो फ़ाइल आवश्यक',
    submitIntake: 'इनटेक जमा करें',
    textMode: 'टेक्स्ट',
    audioMode: 'ऑडियो',
    hinglishHint: 'टेक्स्ट अंग्रेज़ी, हिंदी या हिंग्लिश हो सकता है। Urgency लेबल अंग्रेज़ी में रहेंगे।',
    localeEn: 'EN',
    localeHi: 'हिं',
  },
} as const;

export type UiKey = keyof typeof STRINGS.en;

export function t(key: UiKey, locale: Locale = getLocale()): string {
  return STRINGS[locale][key] ?? STRINGS.en[key];
}
