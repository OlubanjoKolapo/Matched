import { describe, expect, it } from 'vitest';
import { bottom, dress, outer, piece, shoes, top } from '@/lib/rules/test-fixtures';
import { SAMPLE_WARDROBE } from '@/lib/sample/wardrobe';
import { BUILDS, FITS, FRAMES, SHOE_PROFILES, type ItemTags } from '@/lib/types';
import { bodyPaths } from './body';
import {
  avatarSupports,
  dressFigure,
  dressPaths,
  dressSpec,
  outerPaths,
  outerSpec,
  shoePaths,
  shoeSpec,
  skirtPaths,
  skirtSpec,
  topPaths,
  topSpec,
  trouserPaths,
  trouserSpec,
} from './garments';
import { buildFigure, heightScale, mirrorD, pathSignature } from './geometry';
import { hairPaths, HAIR_STYLE_IDS } from './hair';
import { HAIR_STYLES } from './palette';

const figure = buildFigure({ frame: 'menswear', build: 'average' });

/** All strings in an object of paths share one signature per key. */
function expectMorphable(variants: Record<string, string | undefined>[]) {
  const keys = Object.keys(variants[0]!);
  for (const key of keys) {
    const signatures = new Set(variants.map((v) => v[key]).filter(Boolean).map((d) => pathSignature(d!)));
    expect(signatures.size, `${key} changes structure`).toBeLessThanOrEqual(1);
  }
}

function expectFinite(...paths: (string | undefined)[]) {
  for (const d of paths) if (d) expect(d).not.toMatch(/NaN|Infinity/);
}

describe('figure', () => {
  it('stands on the floor at every height', () => {
    for (const heightCm of [150, 176, 200]) {
      const f = buildFigure({ frame: 'menswear', build: 'average', heightCm });
      expect(f.floor).toBe(500);
      expect(f.top).toBeLessThan(f.chin);
      expect(f.crotchY).toBeLessThan(f.kneeY);
      expect(f.kneeY).toBeLessThan(f.ankleY);
    }
  });

  it('grows with height, within limits', () => {
    const short = buildFigure({ frame: 'menswear', build: 'average', heightCm: 158 });
    const tall = buildFigure({ frame: 'menswear', build: 'average', heightCm: 194 });
    expect(tall.top).toBeLessThan(short.top);
    expect(tall.legLen / (tall.floor - tall.top)).toBeGreaterThan(short.legLen / (short.floor - short.top));
    expect(heightScale('menswear', 260)).toBe(1.12);
    expect(heightScale('menswear')).toBe(1);
  });

  it('widens the shoulders for a broad build', () => {
    const slim = buildFigure({ frame: 'menswear', build: 'slim' });
    const broad = buildFigure({ frame: 'menswear', build: 'broad' });
    expect(broad.w.shoulder).toBeGreaterThan(slim.w.shoulder);
    expect(broad.w.waist).toBeGreaterThan(slim.w.waist);
  });

  it('keeps body paths morphable across height, build and cut', () => {
    const variants = FRAMES.flatMap((frame) =>
      BUILDS.flatMap((build) => [150, 176, 200].map((heightCm) => ({ ...bodyPaths(buildFigure({ frame, build, heightCm })) }))),
    );
    expectMorphable(variants);
    for (const v of variants) expectFinite(...Object.values(v));
  });
});

describe('garment templates morph between fits', () => {
  it('tops: every fit and sleeve length', () => {
    const subtypes = ['t-shirt', 'hoodie', 'oxford shirt', 'tank top', 'v-neck sweater'];
    const variants = FITS.flatMap((fit) => subtypes.map((s) => topPaths(figure, topSpec(top(s, { fit })))));
    expectMorphable(variants);
    for (const v of variants) expectFinite(...Object.values(v));
  });

  it('trousers: every fit, rise and length', () => {
    const variants = FITS.flatMap((fit) =>
      (['low', 'mid', 'high'] as const).flatMap((rise) =>
        ['jeans', 'shorts', 'pleated trousers'].map((s) => trouserPaths(figure, trouserSpec(bottom(s, { fit, rise })))),
      ),
    );
    expectMorphable(variants);
    for (const v of variants) expectFinite(...Object.values(v));
  });

  it('skirts and dresses: every hem', () => {
    const hems = ['mini', 'midi', 'maxi', 'pencil', 'pleated'];
    expectMorphable(hems.map((h) => skirtPaths(figure, skirtSpec(bottom(`${h} skirt`)))));
    expectMorphable(hems.map((h) => dressPaths(figure, dressSpec(dress(`${h} dress`)))));
  });

  it('outerwear: every length', () => {
    const variants = ['overshirt', 'blazer', 'trench coat', 'bomber jacket', 'gilet'].map((s) =>
      outerPaths(figure, outerSpec(outer(s, { fit: 'relaxed' }))),
    );
    expectMorphable(variants);
  });

  it('shoes: every profile', () => {
    const variants = SHOE_PROFILES.map((shoeProfile) => shoePaths(figure, shoeSpec(shoes('shoe', { shoeProfile }))));
    expectMorphable(variants);
  });
});

describe('fit changes the shape', () => {
  const width = (d: string) => {
    const xs = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number).filter((_, i) => i % 2 === 0);
    return Math.max(...xs) - Math.min(...xs);
  };

  it('baggy trousers are wider than skinny ones', () => {
    const skinny = trouserPaths(figure, trouserSpec(bottom('jeans', { fit: 'skinny' }))).body;
    const baggy = trouserPaths(figure, trouserSpec(bottom('jeans', { fit: 'baggy' }))).body;
    expect(width(baggy)).toBeGreaterThan(width(skinny) + 10);
  });

  it('oversized tops are wider than fitted ones', () => {
    const fitted = topPaths(figure, topSpec(top('t-shirt', { fit: 'fitted' }))).body;
    const oversized = topPaths(figure, topSpec(top('t-shirt', { fit: 'oversized' }))).body;
    expect(width(oversized)).toBeGreaterThan(width(fitted));
  });
});

describe('dressFigure', () => {
  it('draws every sample piece', () => {
    expect(avatarSupports(SAMPLE_WARDROBE)).toBe(true);
  });

  it('sorts items into slots and skips accessories', () => {
    const items: ItemTags[] = [top('tee'), bottom('mini skirt'), shoes('boot', { shoeProfile: 'boot' }), piece('accessory', 'tote bag')];
    const d = dressFigure(items);
    expect(d.top?.item.subtype).toBe('tee');
    expect(d.bottom?.spec.template).toBe('skirt');
    expect(d.shoes?.spec.profile).toBe('boot');
    expect(d.unsupported).toHaveLength(0);
  });

  it('falls back to flat-lay for shapes it cannot draw', () => {
    expect(avatarSupports([dress('jumpsuit')])).toBe(false);
    expect(avatarSupports([dress('wrap dress')])).toBe(true);
  });
});

describe('hair', () => {
  it('offers 12 styles, all drawable at every height', () => {
    expect(HAIR_STYLES).toHaveLength(12);
    expect(HAIR_STYLE_IDS.sort()).toEqual(HAIR_STYLES.map((s) => s.id).sort());
    for (const style of HAIR_STYLE_IDS) {
      for (const heightCm of [150, 200]) {
        const h = hairPaths(style, buildFigure({ frame: 'womenswear', build: 'average', heightCm }));
        expectFinite(h.front, h.back);
      }
    }
  });
});

describe('mirrorD', () => {
  it('flips x coordinates and keeps structure', () => {
    expect(mirrorD('M100 10 L110 20 Z')).toBe('M140.0 10.0 L130.0 20.0 Z');
  });
});
