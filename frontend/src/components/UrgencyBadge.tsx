import React from 'react';
import type { UrgencyLevel } from '../types';
import { getUrgencyClasses } from '../urgencyStyles';

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  className?: string;
}

export default function UrgencyBadge({ urgency, className = '' }: UrgencyBadgeProps) {
  const { bg, text } = getUrgencyClasses(urgency);

  return (
    <span className={`px-3 py-1 font-bold uppercase text-[10px] ${bg} ${text} border border-black ${className}`}>
      {urgency}
    </span>
  );
}
