import React from 'react';
import { ShieldAlert } from 'lucide-react';

/** Persistent CDS disclaimer — B0.4 safety chrome */
export default function SafetyBanner() {
  return (
    <div
      role="status"
      className="shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200/80 text-[11px] text-amber-950"
    >
      <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-800" aria-hidden />
      <p className="leading-snug">
        <span className="font-medium">AI decision support</span>
        {' — '}
        clinician must Confirm or Override before acting. Not a diagnosis. Urgency is advisory until reviewed.
      </p>
    </div>
  );
}
