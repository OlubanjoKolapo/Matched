import type { SVGProps } from 'react';
import { cx } from '@/lib/cx';

/**
 * Hand-drawn line icons on a 24px grid, 1.5 stroke, currentColor.
 * Add new glyphs here rather than pulling in an icon library.
 */
const glyphs = {
  today: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="1" />
      <path d="M4 9.5h16M8.5 3v4M15.5 3v4" />
      <circle cx="12" cy="14.5" r="1.25" fill="currentColor" stroke="none" />
    </>
  ),
  wardrobe: (
    <>
      <path d="M10 5.25a2 2 0 1 1 2.75 1.85c-.45.2-.75.65-.75 1.15V9.5" />
      <path d="M12 9.5 3.4 15.4a1 1 0 0 0 .57 1.85h16.06a1 1 0 0 0 .57-1.85L12 9.5Z" />
    </>
  ),
  match: (
    <>
      <circle cx="9" cy="12" r="5.5" />
      <circle cx="15" cy="12" r="5.5" />
    </>
  ),
  learn: (
    <>
      <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z" />
      <path d="M12 6.5v13" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  settings: (
    <>
      <path d="M4 7h9M18 7h2M4 17h3M12 17h8" />
      <circle cx="15.5" cy="7" r="2" />
      <circle cx="9.5" cy="17" r="2" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.75" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
    </>
  ),
  moon: <path d="M19.5 14.25A7.5 7.5 0 0 1 9.75 4.5a7.5 7.5 0 1 0 9.75 9.75Z" />,
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
  'arrow-left': <path d="M19 12H5M11 6l-6 6 6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  upload: <path d="M12 15.5V4.5M7.5 9 12 4.5 16.5 9M4.5 15v3.5a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V15" />,
  trash: <path d="M5 7h14M10 7V5h4v2M7 7l.8 11.2a1 1 0 0 0 1 .8h6.4a1 1 0 0 0 1-.8L17 7M10.5 10.5v5M13.5 10.5v5" />,
  alert: (
    <>
      <path d="M12 7.5v6" />
      <circle cx="12" cy="16.75" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  dice: (
    <>
      <rect x="4.5" y="4.5" width="15" height="15" rx="3" />
      <circle cx="9" cy="9" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  shuffle: <path d="M3 7h3.5c1.9 0 3 .9 4 2.5l3 5c1 1.6 2.1 2.5 4 2.5H21M3 17h3.5c1 0 1.7-.25 2.3-.75M15.2 7.75c.6-.5 1.3-.75 2.3-.75H21M18 4l3 3-3 3M18 14l3 3-3 3" />,
  camera: (
    <>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2.5h6L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9Z" />
      <circle cx="12" cy="12.75" r="3.25" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="0.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="0.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="0.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="0.5" />
    </>
  ),
  rail: (
    <>
      <path d="M3 5h18" />
      <path d="M7 5v2.5l-2.5 3V19h5v-8.5L7 7.5M17 5v2.5l-2.5 3V19h5v-8.5L17 7.5" />
    </>
  ),
} as const;

export type IconName = keyof typeof glyphs;

export const ICON_NAMES = Object.keys(glyphs) as IconName[];

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** Accessible name. Omit for decorative icons next to visible text. */
  title?: string;
}

export function Icon({ name, title, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx('size-5 shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {glyphs[name]}
    </svg>
  );
}
