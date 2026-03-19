import React from 'react';
import { PatientCase } from '../types';

interface UrgencyBadgeProps {
  urgency: PatientCase['urgency'];
  className?: string;
}

export default function UrgencyBadge({ urgency, className = '' }: UrgencyBadgeProps) {
  const getStyles = () => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-urgency-critical text-black border border-black';
      case 'HIGH':
        return 'bg-urgency-high text-black border border-black';
      case 'MODERATE':
        return 'bg-urgency-moderate text-black border border-black';
      default:
        return 'bg-black/10 text-black';
    }
  };

  return (
    <span className={`px-3 py-1 font-bold uppercase text-[10px] ${getStyles()} ${className}`}>
      {urgency}
    </span>
  );
}
