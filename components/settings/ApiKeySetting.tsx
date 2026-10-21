'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { saveProfile } from '@/lib/db';
import { useProfile } from '@/lib/hooks/data';
import { DEMO_MODE } from '@/lib/tagging/client';

const masked = (key: string) => `${key.slice(0, 10)}…${key.slice(-4)}`;

/**
 * The person's own Anthropic key for photo tagging. Stored only in IndexedDB on
 * this device; photos go straight from the browser to Anthropic.
 */
export function ApiKeySetting() {
  const profile = useProfile();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  if (!profile) return null;

  async function save() {
    const key = draft.trim();
    if (!/^sk-ant-[\w-]{20,}$/.test(key)) {
      setError('That doesn’t look like an Anthropic key. It starts with sk-ant-.');
      return;
    }
    await saveProfile({ apiKey: key });
    setDraft('');
    setError(null);
  }

  return (
    <div className="flex flex-col gap-4 py-6">
      <Text tone="muted" className="max-w-prose">
        With a key, Matched reads each photo and fills in the tags for you, using Claude Haiku. Your key stays on this
        device, and photos go straight from your browser to Anthropic. Never to us.{' '}
        {DEMO_MODE ? 'This demo can tag without one, up to a limit.' : 'Without a key, you tag with a few taps.'}
      </Text>
      {profile.apiKey ? (
        <div className="flex flex-wrap items-center gap-3">
          <code className="rounded-xs bg-paper-sunken px-2 py-1 text-caption">{masked(profile.apiKey)}</code>
          <Button variant="secondary" size="sm" onClick={() => saveProfile({ apiKey: undefined })}>
            Remove key
          </Button>
        </div>
      ) : (
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <TextField
            label="Anthropic API key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="sk-ant-…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            error={error ?? undefined}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={!draft.trim()}>
            Save key
          </Button>
        </form>
      )}
      <a
        href="https://console.anthropic.com/settings/keys"
        target="_blank"
        rel="noreferrer"
        className="caps self-start text-ink-muted underline-offset-4 hover:text-ink hover:underline"
      >
        Get a key from the Anthropic Console
      </a>
    </div>
  );
}
