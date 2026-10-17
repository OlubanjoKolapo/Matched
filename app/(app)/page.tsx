import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { PageHeader } from '@/components/ui/PageHeader';
import { TodayDate } from '@/components/today/TodayDate';

export default function TodayPage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <Eyebrow>
            <span>Today</span>
            <TodayDate />
          </Eyebrow>
        }
        title={
          <>
            Today&rsquo;s <em>fit</em>
          </>
        }
        lede="One outfit from your wardrobe, every morning, with the reasons it works."
      />
      <EmptyState
        index="No. 01"
        title="Your first fit is three photos away."
        body="Add a top, a bottom and a pair of shoes. Matched will put them together and tell you why they work."
        actions={
          <>
            <ButtonLink href="/add" size="lg">
              Add your first piece
            </ButtonLink>
            <ButtonLink href="/wardrobe" variant="secondary" size="lg">
              See the wardrobe
            </ButtonLink>
          </>
        }
      />
    </>
  );
}
