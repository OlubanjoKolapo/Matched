import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { PageHeader } from '@/components/ui/PageHeader';
import { AppShell } from '@/components/shell/AppShell';

export const metadata: Metadata = { title: 'Not found' };

export default function NotFound() {
  return (
    <AppShell>
      <PageHeader
        eyebrow={
          <Eyebrow>
            <span>404</span>
          </Eyebrow>
        }
        title={
          <>
            Nothing on this hanger. <em>Wrong rail, maybe.</em>
          </>
        }
      />
      <EmptyState
        title="This page doesn’t exist."
        body="The link may be old, or mistyped. Your wardrobe and today’s fit are one tap away."
        actions={
          <>
            <ButtonLink href="/" size="lg">
              Back to Today
            </ButtonLink>
            <ButtonLink href="/wardrobe" size="lg" variant="secondary">
              Open the wardrobe
            </ButtonLink>
          </>
        }
      />
    </AppShell>
  );
}
