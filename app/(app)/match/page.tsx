import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata: Metadata = { title: 'Match' };

export default function MatchPage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <Eyebrow>
            <span>Match</span>
            <span>Outfit builder</span>
          </Eyebrow>
        }
        title={
          <>
            What goes <em>with</em> what
          </>
        }
        lede="Choose a piece, or let Matched fill the gaps. Every outfit comes with a score and the reasons behind it."
      />
      <EmptyState
        index="No. 03"
        title="Nothing to match yet."
        body="Once your wardrobe has a top, a bottom and shoes, you can build outfits here and swipe through alternatives."
        actions={
          <ButtonLink href="/add" size="lg">
            Add a piece
          </ButtonLink>
        }
      />
    </>
  );
}
