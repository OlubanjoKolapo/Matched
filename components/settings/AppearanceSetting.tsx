'use client';

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useTheme, type ThemePreference } from '@/lib/theme';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Day' },
  { value: 'dark', label: 'Evening' },
  { value: 'system', label: 'System' },
];

export function AppearanceSetting() {
  const preference = useTheme((s) => s.preference);
  const setPreference = useTheme((s) => s.setPreference);

  return <SegmentedControl label="Theme" options={OPTIONS} value={preference} onChange={setPreference} />;
}
