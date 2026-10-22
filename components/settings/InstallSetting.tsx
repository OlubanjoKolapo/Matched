'use client';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { promptInstall, useInstallState } from '@/lib/pwa';

/** Add Matched to the home screen: a button where the browser offers one, directions where it doesn't. */
export function InstallSetting() {
  const state = useInstallState();

  if (state === 'unknown') return null;
  if (state === 'installed') {
    return (
      <p className="caps inline-flex items-center gap-2 text-ink-muted">
        <Icon name="check" className="size-4" />
        Installed
      </p>
    );
  }
  if (state === 'available') {
    return (
      <Button variant="secondary" onClick={() => void promptInstall()}>
        <Icon name="download" />
        Install Matched
      </Button>
    );
  }
  return (
    <Text variant="caption" tone="muted" className="max-w-56">
      {state === 'ios'
        ? 'In Safari, tap Share, then Add to Home Screen.'
        : 'Use your browser menu: Install app, or Add to Home screen.'}
    </Text>
  );
}
