'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Swatch } from '@/components/ui/Swatch';
import { BUILD_OPTIONS, HAIR_COLORS, HAIR_STYLES, hairHex, SKIN_TONES, skinHex } from '@/lib/avatar/palette';
import { cx } from '@/lib/cx';
import { haptic } from '@/lib/haptics';
import { useOnboarding } from '@/lib/store/onboarding';
import type { Frame } from '@/lib/types';
import { HairSwatch } from '../HairSwatch';
import { StepFrame } from '../StepFrame';

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="caps mb-3 text-ink-muted">{title}</legend>
      {children}
    </fieldset>
  );
}

export function AvatarStep({ label, onDone, doneLabel }: { label: string; onDone: () => void; doneLabel: string }) {
  const { draft, setAvatar, randomise } = useOnboarding();
  const { avatar } = draft;

  return (
    <StepFrame
      label={label}
      title={
        <>
          Build your <em>figure.</em>
        </>
      }
      lede="It shows proportion and color, not a likeness. Defaults are fine."
      footer={
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              haptic();
              randomise();
            }}
          >
            <Icon name="dice" />
            Randomise
          </Button>
          <Button size="lg" block onClick={onDone}>
            {doneLabel}
            <Icon name="arrow-right" />
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-8">
        <Group title="Skin tone">
          <div role="radiogroup" aria-label="Skin tone" className="flex flex-wrap gap-2">
            {SKIN_TONES.map((tone, i) => {
              const selected = avatar.skinTone === tone.id;
              return (
                <button
                  key={tone.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`Skin tone ${i + 1} of ${SKIN_TONES.length}`}
                  onClick={() => setAvatar({ skinTone: tone.id })}
                  className={cx(
                    'size-10 rounded-pill border border-rule-strong transition-[outline-color] duration-(--duration-fast)',
                    'outline-2 outline-offset-2',
                    selected ? 'outline-ink' : 'outline-transparent',
                  )}
                  style={{ backgroundColor: tone.hex }}
                />
              );
            })}
          </div>
        </Group>

        <Group title="Hair">
          <div role="radiogroup" aria-label="Hairstyle" className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {HAIR_STYLES.map((style) => {
              const selected = avatar.hair === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setAvatar({ hair: style.id })}
                  className={cx(
                    'flex flex-col items-center gap-1 rounded-sm border p-1.5 pb-2 transition-[border-color,background-color] duration-(--duration-fast)',
                    selected ? 'border-ink bg-paper-raised' : 'border-rule hover:border-ink-muted',
                  )}
                >
                  <span className="block aspect-square w-full overflow-hidden rounded-xs bg-paper-sunken">
                    <HairSwatch style={style.id} skin={skinHex(avatar.skinTone)} hair={hairHex(avatar.hairColor)} frame={avatar.frame} />
                  </span>
                  <span className="text-micro font-medium text-ink">{style.label}</span>
                </button>
              );
            })}
          </div>
        </Group>

        <Group title="Hair color">
          <div className="flex flex-wrap gap-2">
            {HAIR_COLORS.map((color) => (
              <Chip
                key={color.id}
                selected={avatar.hairColor === color.id}
                onClick={() => setAvatar({ hairColor: color.id })}
                leading={<Swatch hex={color.hex} name={color.label} />}
              >
                {color.label}
              </Chip>
            ))}
          </div>
        </Group>

        <div className="flex flex-wrap gap-8">
          <Group title="Build">
            <SegmentedControl label="Build" value={avatar.build} onChange={(build) => setAvatar({ build })} options={BUILD_OPTIONS} />
          </Group>
          {draft.track === 'both' ? (
            <Group title="Cut">
              <SegmentedControl<Frame>
                label="Figure cut"
                value={avatar.frame}
                onChange={(frame) => setAvatar({ frame })}
                options={[
                  { value: 'menswear', label: 'Menswear' },
                  { value: 'womenswear', label: 'Womenswear' },
                ]}
              />
            </Group>
          ) : null}
        </div>
      </div>
    </StepFrame>
  );
}
