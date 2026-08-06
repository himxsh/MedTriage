import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { getLocale, t, type Locale } from '../i18n';

/** Persistent CDS disclaimer — B0.4 safety chrome */
export default function SafetyBanner() {
  const [locale, setLoc] = useState<Locale>(getLocale);

  useEffect(() => {
    const onLoc = () => setLoc(getLocale());
    window.addEventListener('mt-locale', onLoc);
    return () => window.removeEventListener('mt-locale', onLoc);
  }, []);

  return (
    <div
      role="status"
      className="shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200/80 text-[11px] text-amber-950"
    >
      <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-800" aria-hidden />
      <p className="leading-snug">
        <span className="font-medium">{t('safetyBannerLead', locale)}</span>
        {' — '}
        {t('safetyBanner', locale).replace(/^[^—]+—\s*/, '')}
      </p>
    </div>
  );
}
