import type { ReactNode } from 'react';
import { AddButton } from './AddButton';
import { Masthead } from './Masthead';
import { NavBar } from './NavBar';
import { OfflineNotice } from './OfflineNotice';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="caps sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-(--z-toast) focus:rounded-pill focus:bg-ink focus:px-4 focus:py-2 focus:text-on-ink"
      >
        Skip to content
      </a>
      <Masthead />
      <NavBar />
      <main
        id="main"
        className="overflow-x-clip pb-[calc(var(--spacing-tabbar)+var(--spacing-fab)+var(--spacing-gutter)*2+env(safe-area-inset-bottom))] lg:pb-section lg:pl-rail"
      >
        <div className="mx-auto w-full max-w-page px-gutter">{children}</div>
      </main>
      <aside aria-label="Quick add">
        <AddButton />
      </aside>
      <OfflineNotice />
    </>
  );
}
