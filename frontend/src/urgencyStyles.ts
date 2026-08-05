import type { UrgencyLevel } from './types';

/** Syncra-style soft status pills (Active/Inactive pattern adapted to urgency). */
const STYLES: Record<UrgencyLevel, { bg: string; text: string; fg: string; border: string; outline: string; hoverBorder: string }> = {
  Critical: {
    bg: 'bg-syncra-down-soft',
    text: 'text-syncra-down',
    fg: 'text-syncra-down',
    border: 'border-syncra-down/20',
    outline: 'border-syncra-down/20',
    hoverBorder: 'hover:border-syncra-down',
  },
  High: {
    bg: 'bg-syncra-high-soft',
    text: 'text-syncra-high',
    fg: 'text-syncra-high',
    border: 'border-syncra-high/20',
    outline: 'border-syncra-high/20',
    hoverBorder: 'hover:border-syncra-high',
  },
  Medium: {
    bg: 'bg-syncra-medium-soft',
    text: 'text-syncra-medium',
    fg: 'text-syncra-medium',
    border: 'border-syncra-medium/20',
    outline: 'border-syncra-medium/20',
    hoverBorder: 'hover:border-syncra-medium',
  },
  Low: {
    bg: 'bg-syncra-up-soft',
    text: 'text-syncra-up',
    fg: 'text-syncra-up',
    border: 'border-syncra-up/20',
    outline: 'border-syncra-up/20',
    hoverBorder: 'hover:border-syncra-up',
  },
};

export const URGENCY_RANK: Record<UrgencyLevel, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export function isDownTriage(current: UrgencyLevel, next: UrgencyLevel): boolean {
  return URGENCY_RANK[next] > URGENCY_RANK[current];
}

export function isUpTriage(current: UrgencyLevel, next: UrgencyLevel): boolean {
  return URGENCY_RANK[next] < URGENCY_RANK[current];
}

export function toUrgencyLevel(s: string): UrgencyLevel {
  return s === 'Critical' || s === 'High' || s === 'Medium' || s === 'Low' ? s : 'Low';
}

export function getUrgencyClasses(level: UrgencyLevel) {
  return STYLES[level];
}

export function getUrgencyButtonClasses(level: UrgencyLevel, selected: boolean): string {
  const s = STYLES[level];
  const base = 'flex-1 py-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors';
  return selected
    ? `${base} ${s.bg} ${s.text} ${s.border}`
    : `${base} bg-white ${s.fg} ${s.outline} ${s.hoverBorder}`;
}
