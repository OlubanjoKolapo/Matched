import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata: Metadata = { title: 'Wardrobe' };

export default function WardrobePage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <Eyebrow>
            <span>Your wardrobe</span>
            <span>0 pieces</span>
          </Eyebrow>
        }
        title={
          <>
            The <em>rail</em>
          </>
        }
        lede="Everything you own, on one rail. Pick a piece to see what goes with it."
      />
      <EmptyState
        index="No. 02"
        title="An empty rail, for now."
        body="Photograph each piece on a plain background. Matched cuts it out and hangs it here."
        actions={
          <ButtonLink href="/add" size="lg">
            Add a piece
          </ButtonLink>
        }
      />
    </>
  );
}
