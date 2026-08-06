import React from 'react';
import type { UrgencyLevel } from '../types';
import { getUrgencyClasses } from '../urgencyStyles';
import { urgencyLabel } from '../orgLabels';

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  className?: string;
}

export default function UrgencyBadge({ urgency, className = '' }: UrgencyBadgeProps) {
  const { bg, text } = getUrgencyClasses(urgency);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${bg} ${text} ${className}`}>
      {urgencyLabel(urgency)}
    </span>
  );
}
