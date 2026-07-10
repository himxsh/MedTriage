import { LayoutDashboard, FolderOpen, ScrollText, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AppScreen } from './types';

export interface NavItem {
  id: AppScreen;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'queue', label: 'Queue', icon: LayoutDashboard },
  { id: 'cases', label: 'Cases', icon: FolderOpen },
  { id: 'audit', label: 'Audit', icon: ScrollText },
  { id: 'account', label: 'Account', icon: User },
];
