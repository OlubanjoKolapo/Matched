'use client';

import { Button } from '@/components/ui/Button';
import { HeightRuler } from '@/components/ui/HeightRuler';
import { Icon } from '@/components/ui/Icon';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Text } from '@/components/ui/Text';
import { PRIVACY_LINE } from '@/lib/onboarding/content';
import { useOnboarding } from '@/lib/store/onboarding';
import { cmToFeetInches, type Units } from '@/lib/units';
import { AVERAGE_HEIGHT_CM } from '@/rules/tuning';
import { StepFrame } from '../StepFrame';

/** Large serif readout: "176 cm" or "5′ 9″". */
function Readout({ cm, units }: { cm: number; units: Units }) {
  if (units === 'metric') {
    return (
      <p className="flex items-baseline gap-2" aria-hidden>
        <span className="font-display text-numeral numerals tracking-display">{Math.round(cm)}</span>
        <span className="caps text-ink-muted">cm</span>
      </p>
    );
  }
  const { feet, inches } = cmToFeetInches(cm);
  return (
    <p className="flex items-baseline gap-1" aria-hidden>
      <span className="font-display text-numeral numerals tracking-display">{feet}</span>
      <span className="caps mr-3 text-ink-muted">ft</span>
      <span className="font-display text-numeral numerals tracking-display">{inches}</span>
      <span className="caps text-ink-muted">in</span>
    </p>
  );
}

export function HeightStep({ label }: { label: string }) {
  const { draft, setHeight, setUnits, next } = useOnboarding();
  const shown = draft.heightCm ?? AVERAGE_HEIGHT_CM[draft.track];

  return (
    <StepFrame
      label={label}
      title={
        <>
          How <em>tall</em> are you?
        </>
      }
      lede="Optional. Used only to tailor proportion tips."
      footer={
        <Button
          size="lg"
          block
          onClick={() => {
            setHeight(shown);
            next();
          }}
        >
          Continue
          <Icon name="arrow-right" />
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <SegmentedControl<Units>
          label="Units"
          size="sm"
          value={draft.units}
          onChange={setUnits}
          options={[
            { value: 'metric', label: 'cm' },
            { value: 'imperial', label: 'ft / in' },
          ]}
          className="self-start"
        />
        <div className="flex items-center gap-8">
          <HeightRuler value={shown} onChange={setHeight} units={draft.units} label="Your height" />
          <div className="flex flex-col gap-2">
            <Readout cm={shown} units={draft.units} />
            <Text variant="caption" tone="muted">
              Drag the ruler, or use the arrow keys.
            </Text>
          </div>
        </div>
        <p className="caps flex items-center gap-2 text-ink-muted">
          <span aria-hidden className="size-1.5 rounded-pill bg-accent" />
          {PRIVACY_LINE}
        </p>
      </div>
    </StepFrame>
  );
}
