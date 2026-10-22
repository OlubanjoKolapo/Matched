'use client';

import { useEffect } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

/** Something broke on a screen. The wardrobe itself is safe in IndexedDB; say so. */
export default function ScreenError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <PageHeader
        title={
          <>
            That didn’t fit. <em>Our fault, not yours.</em>
          </>
        }
      />
      <EmptyState
        index="Error"
        title="This screen hit a snag."
        body="Your wardrobe is safe: it’s stored on this device and nothing was lost. Try again, or head back to today’s fit."
        actions={
          <>
            <Button size="lg" onClick={() => retry()}>
              Try again
            </Button>
            <ButtonLink href="/" size="lg" variant="secondary">
              Back to Today
            </ButtonLink>
          </>
        }
      />
    </>
  );
}
