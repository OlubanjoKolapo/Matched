import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { AppearanceSetting } from '@/components/settings/AppearanceSetting';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Hairline } from '@/components/ui/Hairline';
import { Heading } from '@/components/ui/Heading';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { Text } from '@/components/ui/Text';

export const metadata: Metadata = { title: 'Settings' };

function SettingRow({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <Heading as="h3" size="title">
          {title}
        </Heading>
        <Text tone="muted">{description}</Text>
      </div>
      <div className="shrink-0 self-start sm:self-auto">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <Eyebrow>
            <span>Settings</span>
            <span>Stored on this device</span>
          </Eyebrow>
        }
        title={<em>Settings</em>}
      />
      <section aria-labelledby="appearance" className="max-w-page">
        <p id="appearance" className="caps pb-2 text-ink-muted">
          Appearance
        </p>
        <Hairline />
        <SettingRow title="Edition" description="Day is paper and ink. Evening flips to ink and cream.">
          <AppearanceSetting />
        </SettingRow>
        <Hairline />
        <SettingRow title="Design system" description="Every token and primitive Matched is built from.">
          <Link
            href="/showcase"
            className="caps inline-flex items-center gap-2 text-ink underline-offset-4 hover:underline"
          >
            Open showcase
            <Icon name="arrow-right" className="size-4" />
          </Link>
        </SettingRow>
        <Hairline />
      </section>
    </>
  );
}
