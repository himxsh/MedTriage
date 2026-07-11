import type { UrgencyLevel } from './types';

const STYLES: Record<UrgencyLevel, { bg: string; text: string; fg: string; border: string; outline: string; hoverBorder: string }> = {
  Critical: { bg: 'bg-urgency-critical', text: 'text-white', fg: 'text-urgency-critical', border: 'border-urgency-critical', outline: 'border-urgency-critical/30', hoverBorder: 'hover:border-urgency-critical' },
  High: { bg: 'bg-urgency-high', text: 'text-black', fg: 'text-urgency-high', border: 'border-urgency-high', outline: 'border-urgency-high/30', hoverBorder: 'hover:border-urgency-high' },
  Medium: { bg: 'bg-urgency-medium', text: 'text-black', fg: 'text-urgency-medium', border: 'border-urgency-medium', outline: 'border-urgency-medium/30', hoverBorder: 'hover:border-urgency-medium' },
  Low: { bg: 'bg-urgency-low', text: 'text-black', fg: 'text-urgency-low', border: 'border-urgency-low', outline: 'border-urgency-low/30', hoverBorder: 'hover:border-urgency-low' },
};

export function toUrgencyLevel(s: string): UrgencyLevel {
  return s === 'Critical' || s === 'High' || s === 'Medium' || s === 'Low' ? s : 'Low';
}

export function getUrgencyClasses(level: UrgencyLevel) {
  return STYLES[level];
}

export function getUrgencyButtonClasses(level: UrgencyLevel, selected: boolean): string {
  const s = STYLES[level];
  const base = 'flex-1 py-3 border font-mono text-xs font-bold uppercase cursor-pointer transition-colors';
  return selected
    ? `${base} ${s.bg} ${s.text} ${s.border}`
    : `${base} bg-white ${s.fg} ${s.outline} ${s.hoverBorder}`;
}
