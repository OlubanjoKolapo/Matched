import { IconLink } from '@/components/ui/IconButton';
import { ThemeToggle } from './ThemeToggle';
import { Wordmark } from './Wordmark';

/** Mobile-only top bar. On desktop the nav rail carries the wordmark and settings. */
export function Masthead() {
  return (
    <header className="sticky top-0 z-(--z-nav) border-b border-rule bg-paper pt-safe lg:hidden">
      <div className="flex h-masthead items-center justify-between pl-gutter pr-2">
        <Wordmark />
        <div className="flex items-center">
          <ThemeToggle />
          <IconLink href="/settings" icon="settings" label="Settings" />
        </div>
      </div>
    </header>
  );
}
