import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui/EmptyState';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata: Metadata = { title: 'Learn' };

export default function LearnPage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <Eyebrow>
            <span>Learn</span>
            <span>Style lessons</span>
          </Eyebrow>
        }
        title={
          <>
            The <em>rules</em>, one at a time
          </>
        }
        lede="Short lessons on proportion, shoes, color and formality, written for your height and goals."
      />
      <EmptyState
        index="No. 04"
        title="Lessons are being written."
        body="Each one ends with a way to try it using clothes you already own."
      />
    </>
  );
}
