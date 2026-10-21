import type { Reason, Verdict } from '@/lib/types';
import { VERDICT_LABEL } from '@/lib/verdict';

/**
 * Share card: a 1080×1350 (4:5) PNG of an outfit, its score and the reasons.
 * Drawn on a canvas so it works offline and never leaves the device unless
 * the person shares it. Colors are the light "paper" edition on purpose, so
 * cards look the same whichever theme they were made in.
 */
export const CARD = { width: 1080, height: 1350, margin: 60 } as const;

const PAPER = {
  page: '#f4efe6',
  studioLight: '#fbf8f2',
  studioEdge: '#e4dccd',
  floor: '#d9cfbe',
  ink: '#16130f',
  muted: '#5e574d',
  subtle: '#8c8476',
  rule: 'rgba(22,19,15,0.14)',
  accent: '#a8352a',
  rethink: '#8a5a12',
} as const;

const VERDICT_COLOR: Record<Verdict, string> = { matched: PAPER.accent, works: PAPER.ink, rethink: PAPER.rethink };

export interface CardPiece {
  src: string;
  /** Position in percent of the figure panel, from the flat-lay layout. */
  spot: { left: number; top: number; width: number; rotate: number; z: number };
}

export interface CardContent {
  score: number;
  verdict: Verdict;
  reasons: Reason[];
  /** Serialized avatar SVG, for the figure view. */
  avatarSvg?: string;
  /** Cutout images, for the flat-lay view. */
  pieces?: CardPiece[];
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src.slice(0, 60)}`));
    img.src = src;
  });
}

/** The app's loaded font stacks, read off the page so next/font's hashed names resolve. */
function fontStack(className: string): string {
  const probe = document.createElement('span');
  probe.className = className;
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily;
  probe.remove();
  return family || 'system-ui, sans-serif';
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Greedy word wrap. Returns at most `maxLines`, ellipsising the last. */
export function wrapText(measure: (s: string) => number, text: string, width: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (measure(next) <= width || !line) {
      line = next;
      continue;
    }
    lines.push(line);
    line = word;
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && line) lines.push(line);
  const used = lines.join(' ').split(/\s+/).length;
  if (used < words.length && lines.length) {
    let last = lines[lines.length - 1]!;
    while (last && measure(`${last}…`) > width) last = last.replace(/\s*\S+$/, '');
    lines[lines.length - 1] = `${last}…`;
  }
  return lines;
}

function setTracking(ctx: CanvasRenderingContext2D, px: number) {
  // letterSpacing is newer than the rest of canvas text; skip where missing.
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${px}px`;
}

/** Draws the card and returns it as a PNG blob. */
export async function renderShareCard(content: CardContent): Promise<Blob> {
  await document.fonts?.ready;
  const display = fontStack('font-display');
  const sans = fontStack('font-sans');

  const canvas = document.createElement('canvas');
  canvas.width = CARD.width;
  canvas.height = CARD.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');

  const { margin } = CARD;
  const panel = { x: margin, y: margin, w: CARD.width - margin * 2, h: 790 };

  // Page
  ctx.fillStyle = PAPER.page;
  ctx.fillRect(0, 0, CARD.width, CARD.height);

  // Studio panel: soft spotlight and a floor.
  ctx.save();
  roundRect(ctx, panel.x, panel.y, panel.w, panel.h, 16);
  ctx.clip();
  const spot = ctx.createRadialGradient(panel.x + panel.w / 2, panel.y + panel.h * 0.38, 40, panel.x + panel.w / 2, panel.y + panel.h * 0.45, panel.h * 0.85);
  spot.addColorStop(0, PAPER.studioLight);
  spot.addColorStop(1, PAPER.studioEdge);
  ctx.fillStyle = spot;
  ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
  const floor = ctx.createLinearGradient(0, panel.y + panel.h * 0.82, 0, panel.y + panel.h);
  floor.addColorStop(0, 'rgba(217,207,190,0)');
  floor.addColorStop(1, PAPER.floor);
  ctx.fillStyle = floor;
  ctx.fillRect(panel.x, panel.y + panel.h * 0.82, panel.w, panel.h * 0.18);

  if (content.avatarSvg) {
    const url = URL.createObjectURL(new Blob([content.avatarSvg], { type: 'image/svg+xml' }));
    try {
      const img = await loadImage(url);
      const h = panel.h - 50;
      const w = h * (img.naturalWidth / img.naturalHeight || 240 / 532);
      ctx.drawImage(img, panel.x + (panel.w - w) / 2, panel.y + panel.h - h - 18, w, h);
    } finally {
      URL.revokeObjectURL(url);
    }
  } else if (content.pieces?.length) {
    // Same composition as the in-app flat-lay, inside a 4:5 frame centred in the panel.
    const frameH = panel.h - 60;
    const frameW = frameH * 0.8;
    const fx = panel.x + (panel.w - frameW) / 2;
    const fy = panel.y + 30;
    const images = await Promise.all(content.pieces.map(async (p) => ({ p, img: await loadImage(p.src).catch(() => null) })));
    for (const { p, img } of images.sort((a, b) => a.p.spot.z - b.p.spot.z)) {
      if (!img) continue;
      const w = (p.spot.width / 100) * frameW;
      const h = w * (img.naturalHeight / img.naturalWidth || 1);
      const x = fx + (p.spot.left / 100) * frameW;
      const y = fy + (p.spot.top / 100) * frameH;
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((p.spot.rotate * Math.PI) / 180);
      ctx.shadowColor = 'rgba(40,24,10,0.22)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 10;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
  }
  ctx.restore();

  // Score ring, top right of the panel.
  const ring = { x: panel.x + panel.w - 100, y: panel.y + 100, r: 66 };
  ctx.fillStyle = PAPER.page;
  ctx.beginPath();
  ctx.arc(ring.x, ring.y, ring.r + 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = PAPER.rule;
  ctx.beginPath();
  ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = VERDICT_COLOR[content.verdict];
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(ring.x, ring.y, ring.r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * content.score) / 100);
  ctx.stroke();
  ctx.fillStyle = PAPER.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  setTracking(ctx, -2);
  ctx.font = `600 58px ${display}`;
  ctx.fillText(String(content.score), ring.x, ring.y + 3);

  // Verdict eyebrow
  let y = panel.y + panel.h + 70;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  setTracking(ctx, 3.5);
  ctx.font = `600 24px ${sans}`;
  ctx.fillStyle = VERDICT_COLOR[content.verdict];
  const eyebrow = `${VERDICT_LABEL[content.verdict].toUpperCase()}   ·   SCORE ${content.score}`;
  ctx.fillText(eyebrow, margin, y);

  // Reasons: as many as fit above the footer, three lines each at most.
  setTracking(ctx, -0.3);
  ctx.font = `500 32px ${sans}`;
  const lineH = 42;
  const textX = margin + 48;
  const textW = CARD.width - textX - margin;
  const footerTop = CARD.height - margin - 30;
  y += 34;
  for (const reason of content.reasons) {
    const lines = wrapText((s) => ctx.measureText(s).width, reason.text, textW, 3);
    const blockH = lines.length * lineH + 22;
    if (y + blockH > footerTop) break;
    // Marker: check for a strength, bar for a warning.
    const cy = y + lineH / 2 + 4;
    ctx.fillStyle = reason.positive ? 'rgba(168,53,42,0.12)' : 'rgba(138,90,18,0.12)';
    ctx.beginPath();
    ctx.arc(margin + 16, cy, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = reason.positive ? PAPER.accent : PAPER.rethink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (reason.positive) {
      ctx.moveTo(margin + 9, cy);
      ctx.lineTo(margin + 14, cy + 5);
      ctx.lineTo(margin + 23, cy - 5);
    } else {
      ctx.moveTo(margin + 16, cy - 7);
      ctx.lineTo(margin + 16, cy + 2);
    }
    ctx.stroke();
    ctx.fillStyle = PAPER.ink;
    lines.forEach((line, i) => ctx.fillText(line, textX, y + lineH * (i + 1) - 8));
    y += blockH;
  }

  // Footer: hairline and the mark.
  ctx.fillStyle = PAPER.rule;
  ctx.fillRect(margin, footerTop, CARD.width - margin * 2, 2);
  const baseline = CARD.height - margin + 6;
  setTracking(ctx, -0.8);
  ctx.font = `600 30px ${display}`;
  ctx.fillStyle = PAPER.ink;
  ctx.fillText('Matched', margin, baseline);
  // The wordmark's full stop, in accent.
  const markW = ctx.measureText('Matched').width;
  ctx.fillStyle = PAPER.accent;
  ctx.fillText('.', margin + markW + 1, baseline);
  setTracking(ctx, 2.5);
  ctx.font = `600 18px ${sans}`;
  ctx.fillStyle = PAPER.subtle;
  ctx.textAlign = 'right';
  ctx.fillText('MADE WITH MATCHED', CARD.width - margin, baseline - 4);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not export the card'))), 'image/png'),
  );
}

/** Opens the share sheet with the image where supported, otherwise downloads it. */
export async function shareOrDownload(blob: Blob, filename: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'My fit, Matched' });
      return 'shared';
    } catch (error) {
      if ((error as Error).name === 'AbortError') return 'cancelled';
      // Fall through to a download when sharing fails for any other reason.
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'downloaded';
}
