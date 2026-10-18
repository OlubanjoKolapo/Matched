import { bodyPaths } from '@/lib/avatar/body';
import { buildFigure } from '@/lib/avatar/geometry';
import { hairPaths } from '@/lib/avatar/hair';
import type { Frame } from '@/lib/types';

/** A small head-and-shoulders preview of a hairstyle, for the avatar builder. */
export function HairSwatch({ style, skin, hair, frame }: { style: string; skin: string; hair: string; frame: Frame }) {
  const f = buildFigure({ frame, build: 'average' });
  const body = bodyPaths(f);
  const h = hairPaths(style, f);
  const { cx, cy, ry } = f.head;
  const size = ry * 3.6;
  return (
    <svg viewBox={`${cx - size / 2} ${cy - size * 0.42} ${size} ${size}`} aria-hidden className="size-full">
      {h.back ? <path d={h.back} fill={hair} /> : null}
      <path d={body.neck} fill={skin} />
      <path d={body.ears} fill={skin} />
      <path d={body.head} fill={skin} />
      <path d={h.front} fill={hair} />
      {h.strands ? <path d={h.strands} fill={hair} /> : null}
    </svg>
  );
}
