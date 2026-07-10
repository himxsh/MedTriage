import React from 'react';
import type { UrgencyLevel } from '../types';

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  className?: string;
}

export default function UrgencyBadge({ urgency, className = '' }: UrgencyBadgeProps) {
  const getStyles = () => {
    switch (urgency) {
      case 'Critical':
        return 'bg-urgency-critical text-white border border-black';
      case 'High':
        return 'bg-urgency-high text-black border border-black';
      case 'Medium':
        return 'bg-urgency-moderate text-black border border-black';
      case 'Low':
        return 'bg-black/10 text-black border border-black';
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
