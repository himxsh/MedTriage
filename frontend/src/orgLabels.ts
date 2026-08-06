import type { UrgencyLevel } from './types';
import { getMe } from './api';

/** Site display name for an urgency enum (falls back to enum). */
export function urgencyLabel(level: UrgencyLevel): string {
  return getMe()?.urgency_labels?.[level] || level;
}
