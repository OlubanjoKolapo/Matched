'use client';

import { IconButton } from '@/components/ui/IconButton';
import { useTheme } from '@/lib/theme';

export function ThemeToggle({ className }: { className?: string }) {
  const resolved = useTheme((s) => s.resolved);
  const toggle = useTheme((s) => s.toggle);
  const isDark = resolved === 'dark';

  return (
    <IconButton
      icon={isDark ? 'sun' : 'moon'}
      label={isDark ? 'Switch to day edition' : 'Switch to evening edition'}
      onClick={toggle}
      className={className}
    />
  );
}
