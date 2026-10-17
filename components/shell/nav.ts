import type { IconName } from '@/components/ui/Icon';

export interface NavItem {
  href: '/' | '/wardrobe' | '/match' | '/learn';
  label: string;
  icon: IconName;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Today', icon: 'today' },
  { href: '/wardrobe', label: 'Wardrobe', icon: 'wardrobe' },
  { href: '/match', label: 'Match', icon: 'match' },
  { href: '/learn', label: 'Learn', icon: 'learn' },
];

export function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}
