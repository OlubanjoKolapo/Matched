'use client';

import { MotionConfig } from 'motion/react';
import { useState } from 'react';
import { Avatar } from '@/components/avatar/Avatar';
import { spotFor } from '@/components/avatar/FlatLay';
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type { ScoreResult } from '@/lib/rules';
import { renderShareCard, shareOrDownload, type CardPiece } from '@/lib/share/card';
import type { AvatarConfig, ItemTags } from '@/lib/types';

/** Renders the mannequin off screen, still, and returns it as standalone SVG markup. */
async function avatarMarkup(config: AvatarConfig, heightCm: number | undefined, outfit: ItemTags[]): Promise<string> {
  const { createRoot } = await import('react-dom/client');
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:fixed;left:-9999px;top:0;width:480px;height:1064px;pointer-events:none;';
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    root.render(
      <MotionConfig reducedMotion="always">
        <Avatar config={config} heightCm={heightCm} outfit={outfit} idle={false} />
      </MotionConfig>,
    );
    // Two frames: one to commit, one for Motion to write its attributes.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const svg = host.querySelector('svg');
    if (!svg) throw new Error('The figure did not render');
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', '960');
    clone.setAttribute('height', '2128');
    clone.removeAttribute('class');
    return new XMLSerializer().serializeToString(clone);
  } finally {
    root.unmount();
    host.remove();
  }
}

type Status = 'idle' | 'working' | 'done' | 'error';

/**
 * Exports the outfit as a 1080×1350 share card: the figure (or flat-lay),
 * the score, the reasons and a small "Made with Matched" mark.
 */
export function ShareButton({
  outfit,
  result,
  mode,
  avatar,
  heightCm,
  imageFor,
  variant = 'ghost',
  size = 'lg',
}: {
  outfit: ItemTags[];
  result: ScoreResult;
  mode: 'avatar' | 'flatlay';
  avatar: AvatarConfig;
  heightCm?: number;
  /** Cutout URL for each piece, for the flat-lay card. */
  imageFor: (item: ItemTags) => string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  const [status, setStatus] = useState<Status>('idle');

  async function share() {
    setStatus('working');
    try {
      const hasOuter = outfit.some((i) => i.category === 'outerwear');
      const pieces: CardPiece[] | undefined =
        mode === 'flatlay' ? outfit.map((item) => ({ src: imageFor(item), spot: spotFor(item.category, hasOuter) })) : undefined;
      const avatarSvg = mode === 'avatar' ? await avatarMarkup(avatar, heightCm, outfit) : undefined;
      const blob = await renderShareCard({ score: result.score, verdict: result.verdict, reasons: result.reasons, avatarSvg, pieces });
      const outcome = await shareOrDownload(blob, `matched-${result.score}.png`);
      setStatus(outcome === 'cancelled' ? 'idle' : 'done');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  }

  const label = { idle: 'Share', working: 'Making your card…', done: 'Card ready', error: 'Try sharing again' }[status];
  return (
    // relative: keeps the sr-only status inside the row so it can't widen the page.
    <span className="relative inline-flex">
      <Button variant={variant} size={size} onClick={share} disabled={status === 'working'}>
        <Icon name={status === 'done' ? 'check' : 'share'} />
        {label}
      </Button>
      <span className="sr-only" role="status">
        {status === 'done' ? 'Share card created.' : status === 'error' ? 'The share card could not be created.' : ''}
      </span>
    </span>
  );
}
