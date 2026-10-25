'use client';

import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react';
import { useId, useMemo, type ReactNode } from 'react';
import { bodyPaths } from '@/lib/avatar/body';
import { luminance, mix, outline, shade } from '@/lib/avatar/color';
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
  /** 'lite' skips folds, sculpting and soft shadows: for small thumbnails. */
  detail?: 'full' | 'lite';
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
  filter?: string;
  transform?: string;
  transition: Transition;
}

function Shape({ d, color, fill, stroke, strokeWidth, opacity, dashed, filter, transform, transition }: ShapeProps) {
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
      filter={filter}
      transform={transform}
    />
  );
}

interface Ctx {
  uid: string;
  transition: Transition;
  full: boolean;
}

/**
 * A surface: fill, print, fabric texture and vertical falloff. `lit` adds
 * rounded-form shading over the same shape; pass `regions` instead to light
 * several parts (legs, sleeves) separately. The outline sits beneath the fill
 * so only the silhouette edge shows.
 */
function Surface({
  d,
  look,
  ctx,
  lit = 'cloth',
  regions,
  outlined = true,
}: {
  d: string;
  look: GarmentLook;
  ctx: Ctx;
  lit?: 'cloth' | 'skin' | 'none';
  regions?: string[];
  outlined?: boolean;
}) {
  const { uid, transition } = ctx;
  const ink = luminance(look.color) > 0.18 ? 'dark' : 'light';
  const print =
    look.pattern === 'stripe' ? 'stripe' : look.pattern === 'check' ? 'check' : look.pattern === 'print' || look.pattern === 'graphic' ? 'print' : null;
  const gradient = lit === 'skin' ? `url(#${uid}-cyl-skin)` : `url(#${uid}-cyl-cloth)`;
  return (
    <>
      {outlined ? <Shape d={d} color={outline(look.color)} stroke={outline(look.color)} strokeWidth={0.9} transition={transition} /> : null}
      <Shape d={d} color={look.color} transition={transition} />
      {print ? <Shape d={d} fill={`url(#${uid}-pat-${print}-${ink})`} transition={transition} /> : null}
      {look.texture !== 'none' ? <Shape d={d} fill={`url(#${uid}-tex-${look.texture})`} transition={transition} /> : null}
      {/* Subtle cotton grain on all cloth garments for fabric feel. */}
      {lit === 'cloth' && look.texture === 'none' && ctx.full ? (
        <Shape d={d} fill={`url(#${uid}-tex-cotton)`} transition={transition} />
      ) : null}
      <Shape d={d} fill={`url(#${uid}-drape)`} transition={transition} />
      {lit !== 'none'
        ? (regions ?? [d]).map((region, i) => <Shape key={i} d={region} fill={gradient} transition={transition} />)
        : null}
      {/* Edge rim light on garments for 3D pop. */}
      {lit === 'cloth' && outlined && ctx.full ? (
        <Shape d={d} fill={`url(#${uid}-edge-light)`} transition={transition} />
      ) : null}
    </>
  );
}

/**
 * Fabric folds: layered shadow troughs with highlight ridges. Multiple passes
 * at different blur radii give the impression of real cloth draping.
 */
function Folds({ d, look, ctx }: { d?: string; look: GarmentLook; ctx: Ctx }) {
  if (!d || !ctx.full) return null;
  const dark = luminance(look.color) < 0.03;
  return (
    <>
      {/* Broad, soft shadow pass — reads as the main drape. */}
      <Shape d={d} stroke={dark ? '#fff' : '#000'} strokeWidth={3.5} opacity={dark ? 0.06 : 0.12} filter={`url(#${ctx.uid}-blur-m)`} transition={ctx.transition} />
      {/* Tighter crease shadow for sharper detail. */}
      <Shape d={d} stroke={dark ? '#fff' : '#000'} strokeWidth={1.4} opacity={dark ? 0.04 : 0.08} filter={`url(#${ctx.uid}-blur-s)`} transition={ctx.transition} />
      {/* Highlight ridge on the upper lip of each fold. */}
      <Shape d={d} stroke="#fff" strokeWidth={1.2} opacity={0.12} transform="translate(-0.5 -1.4)" filter={`url(#${ctx.uid}-blur-s)`} transition={ctx.transition} />
    </>
  );
}

/** Soft shadow a layer casts on the one beneath it. */
function CastShadow({ d, ctx, opacity = 0.28, offset = '1.5 3' }: { d?: string; ctx: Ctx; opacity?: number; offset?: string }) {
  if (!d || !ctx.full) return null;
  return <Shape d={d} fill="#1a0f08" opacity={opacity} filter={`url(#${ctx.uid}-blur-m)`} transform={`translate(${offset})`} transition={ctx.transition} />;
}

function Detail({ d, look, ctx, fill, solid = false }: { d?: string; look: GarmentLook; ctx: Ctx; fill?: string; solid?: boolean }) {
  if (!d) return null;
  return (
    <Shape
      d={d}
      fill={fill}
      stroke={outline(look.color)}
      strokeWidth={0.7}
      opacity={solid ? 0.45 : 0.6}
      dashed={!fill && !solid}
      transition={ctx.transition}
    />
  );
}

/** Visible construction seam: a fine topstitch line. */
function Seam({ d, look, ctx }: { d?: string; look: GarmentLook; ctx: Ctx }) {
  if (!d || !ctx.full) return null;
  return (
    <>
      <Shape d={d} stroke={outline(look.color)} strokeWidth={0.5} opacity={0.3} dashed transition={ctx.transition} />
      <Shape d={d} stroke="#fff" strokeWidth={0.3} opacity={0.08} transform="translate(-0.3 -0.3)" transition={ctx.transition} />
    </>
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
  if (!outfit.length) return 'Mannequin in neutral basics';
  const names = outfit.filter((i) => i.category !== 'accessory').map(itemLabel);
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
  return `Mannequin wearing ${list}`;
}

export function Avatar({ config, heightCm, outfit = [], idle = true, dropIn = false, detail = 'full', className, label }: AvatarProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const transition = useMorph();
  const reduce = useReducedMotion();
  const ctx: Ctx = { uid, transition, full: detail === 'full' };

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
  const lipColor = mix(shade(skin, -0.12), '#9c4a42', 0.32);

  // Resolve each slot to a spec + look, falling back to neutral basics.
  const top = dressed.dress ? undefined : (dressed.top ?? { item: undefined, spec: BASIC_TOP });
  const bottom = dressed.dress ? undefined : (dressed.bottom ?? { item: undefined, spec: BASIC_BOTTOM });
  const shoes = dressed.shoes ?? { item: undefined, spec: { template: 'shoes' as const, profile: 'low' as const } };

  const topLook = top?.item ? lookOf(top.item) : basicLook(BASICS.top);
  const bottomLook = bottom?.item ? lookOf(bottom.item) : basicLook(BASICS.bottom);
  const shoeLook = shoes.item ? lookOf(shoes.item) : basicLook(BASICS.shoes);
  const outerLook = dressed.outer ? lookOf(dressed.outer.item) : undefined;
  const dressLook = dressed.dress ? lookOf(dressed.dress.item) : undefined;

  const topD = top ? topPaths(figure, top.spec) : undefined;
  const bottomD = bottom
    ? bottom.spec.template === 'skirt'
      ? { kind: 'skirt' as const, ...skirtPaths(figure, bottom.spec) }
      : { kind: 'trousers' as const, ...trouserPaths(figure, bottom.spec) }
    : undefined;
  const dressD = dressed.dress ? dressPaths(figure, dressed.dress.spec) : undefined;
  const outerD = dressed.outer ? outerPaths(figure, dressed.outer.spec) : undefined;
  const shoeD = shoePaths(figure, shoes.spec);

  const LONG_SLEEVE = 0.8;
  const coveredArms = (top?.spec.sleeve ?? 0) > LONG_SLEEVE || (dressed.outer?.spec.sleeve ?? 0) > LONG_SLEEVE;

  const idleAnimation = idle && !reduce;
  const blurS = `url(#${uid}-blur-s)`;
  const blurM = `url(#${uid}-blur-m)`;
  const face = body.face;

  return (
    <svg
      viewBox={`0 -12 ${VIEW.width} ${VIEW.height + 12}`}
      preserveAspectRatio="xMidYMax meet"
      role="img"
      aria-label={label ?? describe(outfit)}
      // The idle sway is a CSS animation on the <svg> itself: the browser composites it on the
      // GPU instead of repainting every path, filter and gradient on each frame.
      className={cx(
        'block h-full w-full origin-bottom overflow-visible',
        idleAnimation && 'animate-sway will-change-transform motion-reduce:animate-none',
        className,
      )}
    >
      <AvatarDefs uid={uid} />
      <clipPath id={`${uid}-neck-clip`}>
        <path d={body.neck} />
      </clipPath>

      {/* Floor: a wide soft shadow and darker contact under each foot. */}
      <Shape d={body.floor} fill="#1a0f08" opacity={0.16} filter={ctx.full ? `url(#${uid}-blur-floor)` : undefined} transition={transition} />
      {ctx.full ? <Shape d={body.contact} fill="#1a0f08" opacity={0.4} filter={blurM} transition={transition} /> : null}

      <g>
        <g>
          {hair.back ? (
            <g key={`hair-back-${config.hair}`}>
              <Surface d={hair.back} look={hairLook} ctx={ctx} lit="none" outlined={false} />
              <Shape d={hair.back} fill={`url(#${uid}-sphere)`} transition={transition} />
              {ctx.full ? <Shape d={hair.back} fill={`url(#${uid}-hair-strands)`} transition={transition} /> : null}
            </g>
          ) : null}

          {/* Body */}
          {body.legs.map((d, i) => (
            <Surface key={`leg-${i}`} d={d} look={skinLook} ctx={ctx} lit="skin" outlined={false} />
          ))}
          {/* Arms are fully covered by long sleeves; skipping them stops slivers of skin peeking through. */}
          {coveredArms
            ? null
            : body.arms.map((d, i) => <Surface key={`arm-${i}`} d={d} look={skinLook} ctx={ctx} lit="skin" outlined={false} />)}
          <Surface d={body.torso} look={skinLook} ctx={ctx} lit="skin" outlined={false} />
          <Surface d={body.neck} look={skinLook} ctx={ctx} lit="skin" outlined={false} />
          {ctx.full ? (
            <g clipPath={`url(#${uid}-neck-clip)`}>
              <Shape d={body.jawShadow} fill="#2a1206" opacity={0.38} filter={blurM} transition={transition} />
            </g>
          ) : null}

          <AnimatePresence initial={dropIn}>
            <Layer key={`shoes-${shoes.item ? 'item' : 'basic'}`}>
              <Surface d={shoeD.upper} look={shoeLook} ctx={ctx} regions={shoeD.uppers} lit="skin" />
              <Shape d={shoeD.sole} color={shade(shoeLook.color, shoes.spec.profile === 'chunky' ? 0.75 : -0.4)} transition={transition} />
              {ctx.full ? (
                <>
                  <Shape d={shoeD.toeLight} fill="#fff" opacity={0.28} filter={blurS} transition={transition} />
                  <Shape d={shoeD.toeCap} stroke={outline(shoeLook.color)} strokeWidth={0.6} opacity={0.4} transition={transition} />
                  <Shape d={shoeD.tongue} fill={shade(shoeLook.color, 0.08)} stroke={outline(shoeLook.color)} strokeWidth={0.4} opacity={0.5} transition={transition} />
                  <Shape d={shoeD.heelCounter} stroke={outline(shoeLook.color)} strokeWidth={0.5} opacity={0.3} transition={transition} />
                  <Shape d={shoeD.pullTab} stroke={outline(shoeLook.color)} strokeWidth={0.5} opacity={0.35} transition={transition} />
                  <Shape d={shoeD.soleEdge} stroke="#fff" strokeWidth={0.6} opacity={0.15} transition={transition} />
                </>
              ) : null}
            </Layer>

            {bottomD ? (
              <Layer key={`bottom-${bottomD.kind}-${bottom?.item ? 'item' : 'basic'}`}>
                {bottomD.kind === 'trousers' ? (
                  <>
                    <Surface d={bottomD.body} look={bottomLook} ctx={ctx} regions={bottomD.legShapes} />
                    <Folds d={bottomD.folds} look={bottomLook} ctx={ctx} />
                    <Detail d={bottomD.waistband} look={bottomLook} ctx={ctx} />
                    <Detail d={bottomD.fly} look={bottomLook} ctx={ctx} />
                    <Detail d={bottomD.pockets} look={bottomLook} ctx={ctx} />
                    <Detail d={bottomD.creases} look={bottomLook} ctx={ctx} solid />
                    <Detail d={bottomD.hemline} look={bottomLook} ctx={ctx} />
                    {ctx.full ? (
                      <>
                        <Seam d={bottomD.inseam} look={bottomLook} ctx={ctx} />
                        <Detail d={bottomD.beltLoops} look={bottomLook} ctx={ctx} fill={outline(bottomLook.color)} solid />
                        {bottomD.rivets ? (
                          <Shape d={bottomD.rivets} fill={shade(bottomLook.color, 0.5)} stroke={outline(bottomLook.color)} strokeWidth={0.3} opacity={0.5} transition={transition} />
                        ) : null}
                      </>
                    ) : null}
                  </>
                ) : (
                  <>
                    <Surface d={bottomD.body} look={bottomLook} ctx={ctx} />
                    <Detail d={bottomD.waistband} look={bottomLook} ctx={ctx} />
                  </>
                )}
              </Layer>
            ) : null}

            {dressD && dressLook ? (
              <Layer key="dress">
                <Surface d={dressD.body} look={dressLook} ctx={ctx} />
                <Detail d={dressD.seam} look={dressLook} ctx={ctx} solid />
              </Layer>
            ) : null}

            {topD ? (
              <Layer key={`top-${top?.item ? 'item' : 'basic'}`}>
                {bottomD ? <CastShadow d={topD.hemShadow} ctx={ctx} opacity={0.3} offset="0 0" /> : null}
                <Surface d={topD.body} look={topLook} ctx={ctx} regions={[topD.body, ...topD.sleeveShapes]} />
                <Folds d={topD.folds} look={topLook} ctx={ctx} />
                <Detail d={topD.trim} look={topLook} ctx={ctx} />
                <Detail d={topD.sleeves} look={topLook} ctx={ctx} solid />
                <Detail d={topD.pocket} look={topLook} ctx={ctx} fill="rgba(0,0,0,0.07)" />
                <Detail d={topD.placket} look={topLook} ctx={ctx} />
                {ctx.full ? (
                  <>
                    <Seam d={topD.shoulderSeam} look={topLook} ctx={ctx} />
                    <Seam d={topD.sideSeam} look={topLook} ctx={ctx} />
                    <Seam d={topD.cuffLine} look={topLook} ctx={ctx} />
                    {topD.buttons ? (
                      <Shape d={topD.buttons} fill={shade(topLook.color, 0.35)} stroke={outline(topLook.color)} strokeWidth={0.3} opacity={0.55} transition={transition} />
                    ) : null}
                  </>
                ) : null}
                {topD.collar ? (
                  <Shape d={topD.collar} color={shade(topLook.color, 0.06)} stroke={outline(topLook.color)} strokeWidth={0.7} transition={transition} />
                ) : null}
                {topD.hood ? (
                  <Surface d={topD.hood} look={{ ...topLook, color: shade(topLook.color, -0.14) }} ctx={ctx} />
                ) : null}
                {topD.drawstrings ? <Shape d={topD.drawstrings} stroke={shade(topLook.color, 0.7)} strokeWidth={1.2} transition={transition} /> : null}
              </Layer>
            ) : null}

            {outerD && outerLook ? (
              <Layer key="outer">
                <CastShadow d={outerD.body} ctx={ctx} opacity={0.22} />
                <Surface d={outerD.body} look={outerLook} ctx={ctx} regions={[...outerD.panels, ...outerD.sleeveShapes]} />
                <Folds d={outerD.folds} look={outerLook} ctx={ctx} />
                <Detail d={outerD.sleeves} look={outerLook} ctx={ctx} solid />
                {outerD.lapels ? (
                  <Shape d={outerD.lapels} color={shade(outerLook.color, -0.1)} stroke={outline(outerLook.color)} strokeWidth={0.7} transition={transition} />
                ) : null}
                <Detail d={outerD.pockets} look={outerLook} ctx={ctx} fill="rgba(0,0,0,0.1)" />
              </Layer>
            ) : null}
          </AnimatePresence>

          {/* Head: a sculpted mannequin face, lit like the body. */}
          <Surface d={body.ears} look={skinLook} ctx={ctx} lit="skin" outlined={false} />
          <Surface d={body.head} look={skinLook} ctx={ctx} lit="skin" outlined={false} />
          <Shape d={body.head} fill={`url(#${uid}-sphere)`} transition={transition} />
          {ctx.full ? (
            <>
              <Shape d={face.sockets} fill={shade(skin, -0.35)} opacity={0.32} filter={blurM} transition={transition} />
              <Shape d={face.cheekLight} fill="#fff" opacity={0.16} filter={blurM} transition={transition} />
              <Shape d={face.noseShade} fill={shade(skin, -0.4)} opacity={0.4} filter={blurS} transition={transition} />
              <Shape d={face.noseLight} fill="#fff" opacity={0.22} filter={blurS} transition={transition} />
              <Shape d={face.nostrils} fill={shade(skin, -0.5)} opacity={0.5} filter={blurS} transition={transition} />
            </>
          ) : null}
          <Shape d={face.lids} color={shade(skin, -0.5)} opacity={0.85} transition={transition} />
          <Shape d={face.brows} color={shade(hairColor, -0.1)} opacity={0.75} transition={transition} />
          <Shape d={face.lips} color={lipColor} transition={transition} />
          {ctx.full ? <Shape d={face.lipLight} fill="#fff" opacity={0.25} filter={blurS} transition={transition} /> : null}

          {/* Hair: sculpted, with strand texture and sheen; it shadows the forehead. */}
          <g key={`hair-front-${config.hair}`}>
            <CastShadow d={hair.front} ctx={ctx} opacity={0.3} offset="0.6 1.6" />
            <Surface d={hair.front} look={hairLook} ctx={ctx} lit="none" outlined={false} />
            <Shape d={hair.front} fill={`url(#${uid}-sphere)`} transition={transition} />
            {ctx.full ? (
              <>
                <Shape d={hair.front} fill={`url(#${uid}-hair-strands)`} transition={transition} />
                <Shape d={hair.front} fill={`url(#${uid}-hair-sheen)`} transition={transition} />
              </>
            ) : null}
          </g>
          {hair.strands ? (
            <g key={`hair-strands-${config.hair}`}>
              <CastShadow d={hair.strands} ctx={ctx} opacity={0.25} offset="1 1.5" />
              <Surface d={hair.strands} look={hairLook} ctx={ctx} lit="cloth" outlined={false} />
            </g>
          ) : null}

          {body.hands.map((d, i) => (
            <Surface key={`hand-${i}`} d={d} look={skinLook} ctx={ctx} lit="skin" outlined={false} />
          ))}
          {ctx.full ? <Shape d={body.fingers} stroke={shade(skin, -0.4)} strokeWidth={0.5} opacity={0.5} transition={transition} /> : null}
        </g>
      </g>
    </svg>
  );
}
