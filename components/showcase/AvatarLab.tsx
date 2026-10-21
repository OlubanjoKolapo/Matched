'use client';

import { useMemo, useState } from 'react';
import { Avatar } from '@/components/avatar/Avatar';
import { OutfitView } from '@/components/avatar/OutfitView';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Text } from '@/components/ui/Text';
import { HAIR_COLORS, HAIR_STYLES, randomAvatar, SKIN_TONES } from '@/lib/avatar/palette';
import { SAMPLE_WARDROBE } from '@/lib/sample/wardrobe';
import type { AvatarConfig, Fit, Frame, ItemTags, ShoeProfile } from '@/lib/types';

const byId = (id: string) => SAMPLE_WARDROBE.find((i) => i.id === id)!;

const LOOKS: { label: string; ids: string[] }[] = [
  { label: 'Knit & black jeans', ids: ['sample-knit', 'sample-black-jeans', 'sample-chelsea'] },
  { label: 'Boxy tee & wide jeans', ids: ['sample-boxy-tee', 'sample-wide-jeans', 'sample-chunky-sneakers'] },
  { label: 'Hoodie & overshirt', ids: ['sample-green-hoodie', 'sample-overshirt', 'sample-chinos', 'sample-white-sneakers'] },
  { label: 'Oxford & pleats', ids: ['sample-oxford', 'sample-trousers', 'sample-loafers'] },
];

const BOTTOM_FITS: Fit[] = ['skinny', 'slim', 'straight', 'relaxed', 'wide', 'baggy'];
const TOP_FITS: Fit[] = ['fitted', 'regular', 'oversized', 'boxy'];
const SHOES: ShoeProfile[] = ['low', 'standard', 'chunky', 'boot'];

/** Development lab: dress the avatar and push every parameter. */
export function AvatarLab() {
  const [config, setConfig] = useState<AvatarConfig>({ skinTone: 'tone-6', hair: 'textured', hairColor: 'black', build: 'average', frame: 'menswear' });
  const [heightCm, setHeightCm] = useState(176);
  const [look, setLook] = useState(0);
  const [bottomFit, setBottomFit] = useState<Fit | null>(null);
  const [topFit, setTopFit] = useState<Fit | null>(null);
  const [shoe, setShoe] = useState<ShoeProfile | null>(null);

  const outfit = useMemo(() => {
    return LOOKS[look]!.ids.map((id): ItemTags => {
      const item = byId(id);
      if (item.category === 'bottom' && bottomFit) return { ...item, fit: bottomFit };
      if (item.category === 'top' && topFit) return { ...item, fit: topFit, length: undefined };
      if (item.category === 'shoes' && shoe) return { ...item, shoeProfile: shoe };
      return item;
    });
  }, [look, bottomFit, topFit, shoe]);

  const pieces = LOOKS[look]!.ids.map((id) => ({ item: byId(id), src: byId(id).image }));

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="flex flex-col gap-4">
        <div data-avatar-stage className="aspect-[4/5] w-full rounded-sm bg-studio p-4">
          <Avatar config={config} heightCm={heightCm} outfit={outfit} />
        </div>
        <Text variant="caption" tone="muted">
          Change fits to watch garments morph. Height grows the figure and lengthens the legs.
        </Text>
      </div>

      <div className="flex flex-col gap-6">
        <Control label="Look">
          {LOOKS.map((l, i) => (
            <Chip key={l.label} selected={look === i} onClick={() => setLook(i)}>
              {l.label}
            </Chip>
          ))}
        </Control>
        <Control label="Bottom fit">
          {BOTTOM_FITS.map((fit) => (
            <Chip key={fit} selected={bottomFit === fit} onClick={() => setBottomFit(fit)}>
              {fit}
            </Chip>
          ))}
        </Control>
        <Control label="Top fit">
          {TOP_FITS.map((fit) => (
            <Chip key={fit} selected={topFit === fit} onClick={() => setTopFit(fit)}>
              {fit}
            </Chip>
          ))}
        </Control>
        <Control label="Shoes">
          {SHOES.map((p) => (
            <Chip key={p} selected={shoe === p} onClick={() => setShoe(p)}>
              {p}
            </Chip>
          ))}
        </Control>
        <Control label={`Height · ${heightCm} cm`}>
          <input
            type="range"
            min={150}
            max={200}
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full accent-[var(--color-ink)]"
            aria-label="Height in centimetres"
          />
        </Control>
        <div className="flex flex-wrap gap-4">
          <SegmentedControl<Frame>
            label="Cut"
            size="sm"
            value={config.frame}
            onChange={(frame) => setConfig((c) => ({ ...c, frame }))}
            options={[
              { value: 'menswear', label: 'Menswear' },
              { value: 'womenswear', label: 'Womenswear' },
            ]}
          />
          <SegmentedControl
            label="Build"
            size="sm"
            value={config.build}
            onChange={(build) => setConfig((c) => ({ ...c, build }))}
            options={[
              { value: 'slim', label: 'Slim' },
              { value: 'average', label: 'Average' },
              { value: 'broad', label: 'Broad' },
            ]}
          />
        </div>
        <Control label="Skin">
          {SKIN_TONES.map((t, i) => (
            <button
              key={t.id}
              type="button"
              aria-label={`Skin tone ${i + 1}`}
              aria-pressed={config.skinTone === t.id}
              onClick={() => setConfig((c) => ({ ...c, skinTone: t.id }))}
              className="size-8 rounded-pill border border-rule-strong aria-pressed:outline-2 aria-pressed:outline-offset-2 aria-pressed:outline-ink"
              style={{ background: t.hex }}
            />
          ))}
        </Control>
        <Control label="Hair">
          {HAIR_STYLES.map((s) => (
            <Chip key={s.id} selected={config.hair === s.id} onClick={() => setConfig((c) => ({ ...c, hair: s.id }))}>
              {s.label}
            </Chip>
          ))}
        </Control>
        <Control label="Hair color">
          {HAIR_COLORS.map((h) => (
            <Chip key={h.id} selected={config.hairColor === h.id} onClick={() => setConfig((c) => ({ ...c, hairColor: h.id }))}>
              {h.label}
            </Chip>
          ))}
        </Control>
        <div>
          <Button variant="secondary" size="sm" onClick={() => setConfig(randomAvatar(config.frame))}>
            Randomise
          </Button>
        </div>
        <div className="max-w-sm">
          <OutfitView pieces={pieces} avatar={config} heightCm={heightCm} />
        </div>
      </div>
    </div>
  );
}

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="caps text-ink-muted">{label}</p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
