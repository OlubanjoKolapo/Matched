'use client';

import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react';
import { useId, useMemo, type ReactNode } from 'react';
import { bodyPaths } from '@/lib/avatar/body';
import { luminance, outline, shade } from '@/lib/avatar/color';
import {
  dressFigure,
  dressPaths,
  lookOf,
  outerPaths,
  shoePaths,
  skirtPaths,
  topPaths,
  trouserPaths,
  type GarmentLook,
  type TopSpec,
  type TrouserSpec,
} from '@/lib/avatar/garments';
import { buildFigure, VIEW } from '@/lib/avatar/geometry';
import { hairPaths } from '@/lib/avatar/hair';
import { BASICS, hairHex, skinHex } from '@/lib/avatar/palette';
import { itemLabel } from '@/lib/rules/garment';
import { cx } from '@/lib/cx';
import { spring } from '@/lib/motion';
import type { AvatarConfig, ItemTags } from '@/lib/types';
import { AvatarDefs } from './AvatarDefs';

export interface AvatarProps {
  config: AvatarConfig;
  heightCm?: number;
  /** Items to wear. Empty slots show neutral basics. */
  outfit?: ItemTags[];
  /** Gentle breathing and weight shift. Off for reduced motion. */
  idle?: boolean;
  /** Animate garments dropping on when the avatar first appears. */
  dropIn?: boolean;
  className?: string;
  /** Overrides the generated accessible description. */
  label?: string;
}

const BASIC_TOP: TopSpec = { template: 'top', ease: 2.5, hem: 'hip', sleeve: 0.33, drop: 0, neckline: 'crew', placket: false, pocket: 'none' };
const BASIC_BOTTOM: TrouserSpec = {
  template: 'trousers',
  thigh: 3.5,
  knee: 4.5,
  hem: 7,
  crotchDrop: 0.05,
  rise: 'mid',
  length: 'full',
  creased: false,
  denim: false,
};
const basicLook = (color: string): GarmentLook => ({ color, pattern: 'solid', texture: 'none' });

/** Morphs `d` and cross-fades color; both respect reduced motion. */
function useMorph(): Transition {
  const reduce = useReducedMotion();
  return reduce
    ? { duration: 0 }
    : { d: { type: 'spring', stiffness: 170, damping: 24 }, fill: { duration: 0.45 }, stroke: { duration: 0.45 } };
}

interface ShapeProps {
  d: string;
  color?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  dashed?: boolean;
  transition: Transition;
}

function Shape({ d, color, fill, stroke, strokeWidth, opacity, dashed, transition }: ShapeProps) {
  return (
    <motion.path
      initial={false}
      animate={{ d, ...(color ? { fill: color } : {}), ...(stroke ? { stroke } : {}) }}
      transition={transition}
      fill={color ? undefined : (fill ?? 'none')}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dashed ? '2 1.6' : undefined}
      opacity={opacity}
    />
  );
}

/**
 * A garment surface: color, form shading, fabric texture and print.
 * The outline is drawn beneath the fill, so only the silhouette edge shows,
 * never the internal overlaps of sleeves and body.
 */
function Surface({
  d,
  look,
  uid,
  transition,
  outlined = true,
}: {
  d: string;
  look: GarmentLook;
  uid: string;
  transition: Transition;
  outlined?: boolean;
}) {
  const ink = luminance(look.color) > 0.18 ? 'dark' : 'light';
  const print = look.pattern === 'stripe' ? 'stripe' : look.pattern === 'check' ? 'check' : look.pattern === 'print' || look.pattern === 'graphic' ? 'print' : null;
  return (
    <>
      {outlined ? <Shape d={d} color={outline(look.color)} stroke={outline(look.color)} strokeWidth={1.2} transition={transition} /> : null}
      <Shape d={d} color={look.color} transition={transition} />
      {print ? <Shape d={d} fill={`url(#${uid}-pat-${print}-${ink})`} transition={transition} /> : null}
      {look.texture !== 'none' ? <Shape d={d} fill={`url(#${uid}-tex-${look.texture})`} transition={transition} /> : null}
      <Shape d={d} fill={`url(#${uid}-drape)`} transition={transition} />
      <Shape d={d} fill={`url(#${uid}-shade)`} transition={transition} />
    </>
  );
}

function Detail({ d, look, transition, fill, solid = false }: { d?: string; look: GarmentLook; transition: Transition; fill?: string; solid?: boolean }) {
  if (!d) return null;
  return (
    <Shape
      d={d}
      fill={fill}
      stroke={outline(look.color)}
      strokeWidth={0.7}
      opacity={solid ? 0.5 : 0.75}
      dashed={!fill && !solid}
      transition={transition}
    />
  );
}

/** Garments drop onto the figure with a small bounce. */
function Layer({ children }: { children: ReactNode }) {
  return (
    <motion.g
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={spring.drop}
    >
      {children}
    </motion.g>
  );
}

function describe(outfit: ItemTags[]): string {
  if (!outfit.length) return 'Illustrated figure in neutral basics';
  const names = outfit.filter((i) => i.category !== 'accessory').map(itemLabel);
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
  return `Illustrated figure wearing ${list}`;
}

export function Avatar({ config, heightCm, outfit = [], idle = true, dropIn = false, className, label }: AvatarProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const transition = useMorph();
  const reduce = useReducedMotion();

  const figure = useMemo(
    () => buildFigure({ frame: config.frame, build: config.build, heightCm }),
    [config.frame, config.build, heightCm],
  );
  const body = useMemo(() => bodyPaths(figure), [figure]);
  const hair = useMemo(() => hairPaths(config.hair, figure), [config.hair, figure]);
  const dressed = useMemo(() => dressFigure(outfit), [outfit]);

  const skin = skinHex(config.skinTone);
  const skinLook = basicLook(skin);
  const hairColor = hairHex(config.hairColor);
  const hairLook = basicLook(hairColor);

  // Resolve each slot to a spec + look, falling back to neutral basics.
  const top = dressed.dress ? undefined : (dressed.top ?? { item: undefined, spec: BASIC_TOP });
  const bottom = dressed.dress ? undefined : (dressed.bottom ?? { item: undefined, spec: BASIC_BOTTOM });
  const shoes = dressed.shoes ?? { item: undefined, spec: { template: 'shoes' as const, profile: 'low' as const } };

  const topLook = top?.item ? lookOf(top.item) : basicLook(BASICS.top);
  const bottomLook = bottom?.item ? lookOf(bottom.item) : basicLook(BASICS.bottom);
  const shoeLook = shoes.item ? lookOf(shoes.item) : basicLook(BASICS.shoes);

  const topD = top ? topPaths(figure, top.spec) : undefined;
  const bottomD = bottom
    ? bottom.spec.template === 'skirt'
      ? { kind: 'skirt' as const, ...skirtPaths(figure, bottom.spec) }
      : { kind: 'trousers' as const, ...trouserPaths(figure, bottom.spec) }
    : undefined;
  const dressD = dressed.dress ? dressPaths(figure, dressed.dress.spec) : undefined;
  const outerD = dressed.outer ? outerPaths(figure, dressed.outer.spec) : undefined;
  const shoeD = shoePaths(figure, shoes.spec);

  const idleAnimation = idle && !reduce;

  return (
    <svg
      viewBox={`0 -12 ${VIEW.width} ${VIEW.height + 12}`}
      preserveAspectRatio="xMidYMax meet"
      role="img"
      aria-label={label ?? describe(outfit)}
      className={cx('block h-full w-full overflow-visible', className)}
    >
      <AvatarDefs uid={uid} />

      <Shape d={body.shadow} fill="#000" opacity={0.1} transition={transition} />

      <motion.g
        style={{ originX: 0.5, originY: 1 }}
        animate={idleAnimation ? { rotate: [0, 0.7, 0, -0.5, 0] } : { rotate: 0 }}
        transition={idleAnimation ? { duration: 11, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
      >
        <motion.g
          style={{ originX: 0.5, originY: 1 }}
          animate={idleAnimation ? { scaleY: [1, 1.006, 1] } : { scaleY: 1 }}
          transition={idleAnimation ? { duration: 4.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
        >
          {hair.back ? <Surface d={hair.back} look={hairLook} uid={uid} transition={transition} outlined={false} /> : null}

          {/* Body */}
          <Surface d={body.legs} look={skinLook} uid={uid} transition={transition} />
          <Surface d={body.arms} look={skinLook} uid={uid} transition={transition} />
          <Surface d={body.torso} look={skinLook} uid={uid} transition={transition} />
          <Surface d={body.neck} look={skinLook} uid={uid} transition={transition} />

          <AnimatePresence initial={dropIn}>
            <Layer key={`shoes-${shoes.item ? 'item' : 'basic'}`}>
              <Surface d={shoeD.upper} look={shoeLook} uid={uid} transition={transition} />
              <Shape d={shoeD.sole} color={shade(shoeLook.color, shoes.spec.profile === 'chunky' ? 0.75 : -0.35)} transition={transition} />
            </Layer>

            {bottomD ? (
              <Layer key={`bottom-${bottomD.kind}-${bottom?.item ? 'item' : 'basic'}`}>
                <Surface d={bottomD.body} look={bottomLook} uid={uid} transition={transition} />
                <Detail d={bottomD.waistband} look={bottomLook} transition={transition} />
                {bottomD.kind === 'trousers' ? (
                  <>
                    <Detail d={bottomD.fly} look={bottomLook} transition={transition} />
                    <Detail d={bottomD.pockets} look={bottomLook} transition={transition} />
                    <Detail d={bottomD.creases} look={bottomLook} transition={transition} />
                    <Detail d={bottomD.hemline} look={bottomLook} transition={transition} />
                  </>
                ) : null}
              </Layer>
            ) : null}

            {dressD && dressed.dress ? (
              <Layer key="dress">
                <Surface d={dressD.body} look={lookOf(dressed.dress.item)} uid={uid} transition={transition} />
                <Detail d={dressD.seam} look={lookOf(dressed.dress.item)} transition={transition} />
              </Layer>
            ) : null}

            {topD ? (
              <Layer key={`top-${top?.item ? 'item' : 'basic'}`}>
                <Surface d={topD.body} look={topLook} uid={uid} transition={transition} />
                <Detail d={topD.trim} look={topLook} transition={transition} />
                <Detail d={topD.sleeves} look={topLook} transition={transition} solid />
                <Detail d={topD.pocket} look={topLook} fill="rgba(0,0,0,0.08)" transition={transition} />
                <Detail d={topD.placket} look={topLook} transition={transition} />
                {topD.collar ? <Shape d={topD.collar} color={shade(topLook.color, 0.08)} stroke={outline(topLook.color)} strokeWidth={0.7} transition={transition} /> : null}
                {topD.hood ? <Surface d={topD.hood} look={{ ...topLook, color: shade(topLook.color, -0.12) }} uid={uid} transition={transition} /> : null}
                {topD.drawstrings ? <Shape d={topD.drawstrings} stroke={shade(topLook.color, 0.7)} strokeWidth={1.2} transition={transition} /> : null}
              </Layer>
            ) : null}

            {outerD && dressed.outer ? (
              <Layer key="outer">
                <Surface d={outerD.body} look={lookOf(dressed.outer.item)} uid={uid} transition={transition} />
                <Detail d={outerD.sleeves} look={lookOf(dressed.outer.item)} transition={transition} solid />
                {outerD.lapels ? (
                  <Shape d={outerD.lapels} color={shade(lookOf(dressed.outer.item).color, -0.1)} stroke={outline(lookOf(dressed.outer.item).color)} strokeWidth={0.7} transition={transition} />
                ) : null}
                <Detail d={outerD.pockets} look={lookOf(dressed.outer.item)} fill="rgba(0,0,0,0.1)" transition={transition} />
              </Layer>
            ) : null}
          </AnimatePresence>

          {/* Head */}
          <Surface d={body.ears} look={skinLook} uid={uid} transition={transition} />
          <Surface d={body.head} look={skinLook} uid={uid} transition={transition} />
          <Shape d={body.eyes} color="#2a201b" transition={transition} />
          <Shape d={body.brows} stroke={shade(hairColor, -0.2)} strokeWidth={1.1} transition={transition} />
          <Shape d={body.nose} stroke={shade(skin, -0.3)} strokeWidth={0.9} transition={transition} />
          <Shape d={body.mouth} stroke={shade(skin, -0.38)} strokeWidth={1.1} transition={transition} />
          <Surface d={hair.front} look={hairLook} uid={uid} transition={transition} outlined={false} />
          {hair.strands ? <Surface d={hair.strands} look={hairLook} uid={uid} transition={transition} outlined={false} /> : null}

          <Surface d={body.hands} look={skinLook} uid={uid} transition={transition} />
        </motion.g>
      </motion.g>
    </svg>
  );
}

