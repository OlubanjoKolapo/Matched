'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Swatch } from '@/components/ui/Swatch';
import { Text } from '@/components/ui/Text';

const FIT_CHIPS = ['Slim', 'Straight', 'Relaxed', 'Wide', 'Baggy'];

export function ChipDemo() {
  const [selected, setSelected] = useState<string[]>(['Wide']);
  const toggle = (label: string) =>
    setSelected((current) => (current.includes(label) ? current.filter((l) => l !== label) : [...current, label]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {FIT_CHIPS.map((label) => (
          <Chip key={label} selected={selected.includes(label)} onClick={() => toggle(label)}>
            {label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip leading={<Swatch hex="#3d4a2f" name="olive" />}>Olive</Chip>
        <Chip uncertain leading={<Swatch hex="#1f2a44" name="navy" />}>
          Navy
        </Chip>
        <Chip uncertain>Formality 3</Chip>
      </div>
      <Text variant="caption" tone="muted">
        Dashed chips are low-confidence AI tags, highlighted so the user confirms them.
      </Text>
    </div>
  );
}

export function SegmentedDemo() {
  const [view, setView] = useState<'rail' | 'grid'>('rail');
  const [units, setUnits] = useState<'cm' | 'ft'>('cm');
  return (
    <div className="flex flex-wrap items-center gap-4">
      <SegmentedControl
        label="Wardrobe view"
        value={view}
        onChange={setView}
        options={[
          { value: 'rail', label: 'Rail', icon: 'rail' },
          { value: 'grid', label: 'Grid', icon: 'grid' },
        ]}
      />
      <SegmentedControl
        label="Units"
        size="sm"
        value={units}
        onChange={setUnits}
        options={[
          { value: 'cm', label: 'cm' },
          { value: 'ft', label: 'ft / in' },
        ]}
      />
    </div>
  );
}

const SCORES = [92, 68, 41];

export function ScoreDemo() {
  const [index, setIndex] = useState(0);
  const [replay, setReplay] = useState(0);
  const score = SCORES[index] ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div key={replay} className="flex flex-wrap items-end gap-8">
        <ScoreRing score={score} size="lg" />
        <ScoreRing score={score} size="md" />
        <ScoreRing score={score} size="sm" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => setIndex((i) => (i + 1) % SCORES.length)}>
          Next score
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setReplay((r) => r + 1)}>
          Replay fill
        </Button>
      </div>
    </div>
  );
}

export function ProgressDemo() {
  const steps = 7;
  const [step, setStep] = useState(3);
  return (
    <div className="flex max-w-prose flex-col gap-4">
      <ProgressBar value={step / steps} label="Onboarding progress" />
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))}>
          Back
        </Button>
        <Button size="sm" onClick={() => setStep((s) => Math.min(steps, s + 1))}>
          Next
        </Button>
        <Text variant="caption" tone="muted" className="numerals">
          Step {step} of {steps}
        </Text>
      </div>
    </div>
  );
}
