import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata: Metadata = { title: 'Add a piece' };

export default function AddPage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <Eyebrow>
            <span>Add</span>
            <span>New piece</span>
          </Eyebrow>
        }
        title={
          <>
            Add a <em>piece</em>
          </>
        }
        lede="Lay it flat or hang it up, on a plain background, in good light."
      />
      <EmptyState
        title="Camera and upload open here."
        body="Matched removes the background on your device, then suggests tags you can confirm or change."
        actions={
          <Button size="lg" disabled>
            <Icon name="camera" />
            Take a photo
          </Button>
        }
      />
    </>
  );
}
