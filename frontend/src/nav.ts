import { LayoutDashboard, FolderOpen, ScrollText, User, BarChart3, Settings2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AppScreen } from './types';

export interface NavItem {
  id: AppScreen;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'queue', label: 'Queue', icon: LayoutDashboard },
  { id: 'cases', label: 'Cases', icon: FolderOpen },
  { id: 'audit', label: 'Audit', icon: ScrollText },
  { id: 'metrics', label: 'Metrics', icon: BarChart3, adminOnly: true },
  { id: 'admin', label: 'Admin', icon: Settings2, adminOnly: true },
  { id: 'account', label: 'Account', icon: User },
];
