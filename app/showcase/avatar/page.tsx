import type { Metadata } from 'next';
import { AvatarLab } from '@/components/showcase/AvatarLab';
import { ThemeToggle } from '@/components/shell/ThemeToggle';
import { Wordmark } from '@/components/shell/Wordmark';
import { ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Heading';
import { Icon } from '@/components/ui/Icon';

export const metadata: Metadata = { title: 'Avatar lab' };

export default function AvatarLabPage() {
  return (
    <div className="mx-auto w-full max-w-page px-gutter pb-section">
      <header className="flex h-masthead items-center justify-between border-b border-rule">
        <Wordmark />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ButtonLink href="/showcase" variant="ghost" size="sm">
            <Icon name="arrow-left" className="size-4" />
            Design system
          </ButtonLink>
        </div>
      </header>
      <div className="flex flex-col gap-4 py-10">
        <Eyebrow>
          <span>Design system</span>
          <span>Avatar</span>
        </Eyebrow>
        <Heading as="h1" size="headline">
          The <em>figure</em>
        </Heading>
      </div>
      <AvatarLab />
    </div>
  );
}
