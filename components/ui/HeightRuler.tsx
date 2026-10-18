'use client';

import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { cx } from '@/lib/cx';
import { haptic } from '@/lib/haptics';
import { CM_PER_INCH, HEIGHT_RANGE_CM, heightStep, snapHeight, speakHeight, type Units } from '@/lib/units';

interface Tick {
  cm: number;
  kind: 'minor' | 'mid' | 'major';
  label?: string;
}

function ticksFor(units: Units, min: number, max: number): Tick[] {
  if (units === 'metric') {
    const ticks: Tick[] = [];
    for (let cm = Math.ceil(min); cm <= max; cm++) {
      ticks.push({ cm, kind: cm % 10 === 0 ? 'major' : cm % 5 === 0 ? 'mid' : 'minor', label: cm % 10 === 0 ? String(cm) : undefined });
    }
    return ticks;
  }
  const ticks: Tick[] = [];
  for (let inch = Math.ceil(min / CM_PER_INCH); inch * CM_PER_INCH <= max; inch++) {
    const atFoot = inch % 12 === 0;
    ticks.push({ cm: inch * CM_PER_INCH, kind: atFoot ? 'major' : inch % 6 === 0 ? 'mid' : 'minor', label: atFoot ? `${inch / 12}′` : undefined });
  }
  return ticks;
}

const TICK_WIDTH: Record<Tick['kind'], string> = { minor: 'w-2', mid: 'w-4', major: 'w-6' };

/**
 * Vertical ruler slider for height. Drag anywhere on the ruler, or use the
 * arrow keys (one cm or inch), Page Up/Down (five) and Home/End.
 */
export function HeightRuler({
  value,
  onChange,
  units,
  label = 'Height',
  min = HEIGHT_RANGE_CM.min,
  max = HEIGHT_RANGE_CM.max,
  className,
}: {
  value: number;
  onChange: (cm: number) => void;
  units: Units;
  label?: string;
  min?: number;
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const clamp = (cm: number) => Math.min(max, Math.max(min, cm));
  const pct = (cm: number) => ((max - cm) / (max - min)) * 100;

  function commit(cm: number) {
    const next = snapHeight(clamp(cm), units);
    if (next === value) return;
    // A light tick at every 5 cm or 2 in, so dragging feels like a real ruler.
    const unit = units === 'metric' ? 5 : CM_PER_INCH * 2;
    if (Math.floor(next / unit) !== Math.floor(value / unit)) haptic();
    onChange(next);
  }

  function fromPointer(event: PointerEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    commit(max - ratio * (max - min));
  }

  function onKeyDown(event: KeyboardEvent) {
    const step = heightStep(units);
    const moves: Record<string, number> = {
      ArrowUp: step,
      ArrowRight: step,
      ArrowDown: -step,
      ArrowLeft: -step,
      PageUp: step * 5,
      PageDown: -step * 5,
    };
    if (event.key in moves) commit(value + moves[event.key]!);
    else if (event.key === 'Home') commit(min);
    else if (event.key === 'End') commit(max);
    else return;
    event.preventDefault();
  }

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-orientation="vertical"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-valuetext={speakHeight(value, units)}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        fromPointer(e);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e);
      }}
      className={cx('relative h-ruler w-24 cursor-ns-resize touch-none select-none rounded-xs', className)}
    >
      <span aria-hidden className="absolute inset-y-0 right-0 w-px bg-rule-strong" />
      {ticksFor(units, min, max).map((tick) => (
        <span key={tick.cm} aria-hidden className="absolute right-0 flex -translate-y-1/2 items-center gap-2" style={{ top: `${pct(tick.cm)}%` }}>
          {tick.label ? <span className="caps numerals text-ink-subtle">{tick.label}</span> : null}
          <span className={cx('block h-px', TICK_WIDTH[tick.kind], tick.kind === 'minor' ? 'bg-rule-strong' : 'bg-ink-muted')} />
        </span>
      ))}
      <span aria-hidden className="absolute right-0 flex -translate-y-1/2 items-center" style={{ top: `${pct(value)}%` }}>
        <span className="block h-0.5 w-24 bg-accent" />
        <span className="-mr-1.5 block size-3 rounded-pill bg-accent shadow-lift" />
      </span>
    </div>
  );
}
