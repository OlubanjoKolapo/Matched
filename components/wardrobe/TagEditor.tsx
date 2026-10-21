'use client';

import { useState, type ReactNode } from 'react';
import { Chip } from '@/components/ui/Chip';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Swatch } from '@/components/ui/Swatch';
import { TextField } from '@/components/ui/TextField';
import { COLOR_FAMILIES, type ColorFamilyId } from '@/rules/colors';
import { cx } from '@/lib/cx';
import { haptic } from '@/lib/haptics';
import { FITS_FOR, MATERIALS, SUBTYPES, suggestName, type DraftField, type DraftTags } from '@/lib/tagging/draft';
import { CATEGORIES, PATTERNS, SHOE_PROFILES, type Category, type Formality } from '@/lib/types';

const CATEGORY_LABEL: Record<Category, string> = {
  top: 'Top',
  bottom: 'Bottom',
  shoes: 'Shoes',
  outerwear: 'Outerwear',
  onepiece: 'Dress or one-piece',
  accessory: 'Accessory',
};

const FORMALITY_OPTIONS: { value: `${Formality}`; label: string }[] = [
  { value: '1', label: 'Gym' },
  { value: '2', label: 'Casual' },
  { value: '3', label: 'Smart' },
  { value: '4', label: 'Business' },
  { value: '5', label: 'Formal' },
];

const SOLE_LABEL: Record<string, string> = { low: 'Low & sleek', standard: 'Standard', chunky: 'Chunky', boot: 'Boot', heel: 'Heel' };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Field({ title, uncertain, children }: { title: string; uncertain?: boolean; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="caps mb-3 flex items-center gap-2 text-ink-muted">
        {title}
        {uncertain ? <span className="text-rethink normal-case tracking-normal">· please confirm</span> : null}
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

/**
 * Every tag as an editable chip. Fields the AI wasn't sure about are dashed
 * until the person touches them. The AI is a helper, never the source of truth.
 */
export function TagEditor({
  value,
  onChange,
  uncertain = [],
  onConfirm,
}: {
  value: DraftTags;
  onChange: (next: DraftTags) => void;
  uncertain?: DraftField[];
  onConfirm?: (field: DraftField) => void;
}) {
  const [customType, setCustomType] = useState(!SUBTYPES[value.category].includes(value.subtype) && !!value.subtype);
  const [showPalette, setShowPalette] = useState(false);

  const isUncertain = (field: DraftField) => uncertain.includes(field);
  function set<K extends DraftField>(field: K, v: DraftTags[K]) {
    haptic();
    onConfirm?.(field);
    onChange({ ...value, [field]: v });
  }

  const fits = FITS_FOR[value.category];
  const families = value.colors.map((c) => c.family);

  function toggleFamily(id: ColorFamilyId) {
    onConfirm?.('colors');
    if (families.includes(id)) {
      if (value.colors.length === 1) return; // a piece always has a color
      onChange({ ...value, colors: value.colors.filter((c) => c.family !== id) });
    } else if (value.colors.length < 3) {
      const share = Math.round((1 / (value.colors.length + 1)) * 100) / 100;
      onChange({ ...value, colors: [...value.colors, { hex: COLOR_FAMILIES[id].anchors[0] ?? '#8c8c8c', family: id, share }] });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <TextField
        label="Name"
        value={value.name}
        placeholder={suggestName(value) || 'e.g. Navy Chinos'}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        hint="Leave blank and we’ll name it from its color and type."
      />

      <Field title="What is it" uncertain={isUncertain('category')}>
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            selected={value.category === c}
            uncertain={value.category === c && isUncertain('category')}
            onClick={() => {
              set('category', c);
              setCustomType(false);
            }}
          >
            {CATEGORY_LABEL[c]}
          </Chip>
        ))}
      </Field>

      <Field title="Type" uncertain={isUncertain('subtype')}>
        {SUBTYPES[value.category].map((s) => (
          <Chip
            key={s}
            selected={!customType && value.subtype === s}
            uncertain={!customType && value.subtype === s && isUncertain('subtype')}
            onClick={() => {
              setCustomType(false);
              set('subtype', s);
            }}
          >
            {cap(s)}
          </Chip>
        ))}
        <Chip selected={customType} onClick={() => setCustomType(true)}>
          Something else
        </Chip>
        {customType ? (
          <TextField
            label="Type"
            className="w-full"
            value={value.subtype}
            placeholder="e.g. rugby shirt"
            onChange={(e) => set('subtype', e.target.value)}
            autoFocus
          />
        ) : null}
      </Field>

      {fits ? (
        <Field title="Fit" uncertain={isUncertain('fit')}>
          {fits.map((f) => (
            <Chip key={f} selected={value.fit === f} uncertain={value.fit === f && isUncertain('fit')} onClick={() => set('fit', f)}>
              {cap(f)}
            </Chip>
          ))}
        </Field>
      ) : null}

      {value.category === 'shoes' ? (
        <Field title="Sole">
          {SHOE_PROFILES.map((p) => (
            <Chip key={p} selected={value.shoeProfile === p} onClick={() => set('shoeProfile', p)}>
              {SOLE_LABEL[p]}
            </Chip>
          ))}
        </Field>
      ) : null}

      {value.category === 'bottom' ? (
        <Field title="Rise">
          {(['low', 'mid', 'high'] as const).map((r) => (
            <Chip key={r} selected={value.rise === r} onClick={() => set('rise', value.rise === r ? undefined : r)}>
              {cap(r)}
            </Chip>
          ))}
        </Field>
      ) : null}

      <Field title="Colors" uncertain={isUncertain('colors')}>
        {value.colors.map((c) => (
          <Chip
            key={c.family}
            selected
            leading={<Swatch hex={c.hex} name={COLOR_FAMILIES[c.family as ColorFamilyId]?.label ?? c.family} />}
            uncertain={isUncertain('colors')}
            onClick={() => toggleFamily(c.family as ColorFamilyId)}
            aria-label={`${COLOR_FAMILIES[c.family as ColorFamilyId]?.label ?? c.family}, tap to remove`}
          >
            {cap(COLOR_FAMILIES[c.family as ColorFamilyId]?.label ?? c.family)}
          </Chip>
        ))}
        {value.colors.length < 3 ? (
          <Chip onClick={() => setShowPalette((s) => !s)} aria-expanded={showPalette}>
            {showPalette ? 'Done' : 'Add or change'}
          </Chip>
        ) : null}
        {showPalette ? (
          <div className="grid w-full grid-cols-6 gap-2 pt-2 sm:grid-cols-8" role="group" aria-label="Color families">
            {(Object.keys(COLOR_FAMILIES) as ColorFamilyId[])
              .filter((id) => COLOR_FAMILIES[id].anchors.length || id === 'denim')
              .map((id) => {
                const on = families.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleFamily(id)}
                    className={cx(
                      'flex flex-col items-center gap-1 rounded-sm p-1 text-micro transition-colors',
                      on ? 'bg-paper-raised text-ink outline-1 outline-ink' : 'text-ink-muted hover:text-ink',
                    )}
                  >
                    <span
                      aria-hidden
                      className="size-7 rounded-pill border border-rule-strong"
                      style={{ background: COLOR_FAMILIES[id].anchors[0] ?? '#4a6a8f' }}
                    />
                    {COLOR_FAMILIES[id].label}
                  </button>
                );
              })}
          </div>
        ) : null}
      </Field>

      <Field title="Pattern" uncertain={isUncertain('pattern')}>
        {PATTERNS.map((p) => (
          <Chip
            key={p}
            selected={value.pattern === p}
            uncertain={value.pattern === p && isUncertain('pattern')}
            onClick={() => set('pattern', p)}
          >
            {cap(p)}
          </Chip>
        ))}
      </Field>

      <Field title="Material">
        {MATERIALS.map((m) => (
          <Chip key={m} selected={value.material === m} onClick={() => set('material', value.material === m ? undefined : m)}>
            {cap(m)}
          </Chip>
        ))}
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className="caps mb-3 text-ink-muted">
          How dressy {isUncertain('formality') ? <span className="text-rethink normal-case tracking-normal">· please confirm</span> : null}
        </legend>
        <SegmentedControl
          label="How dressy"
          size="sm"
          value={`${value.formality}` as `${Formality}`}
          onChange={(v) => set('formality', Number(v) as Formality)}
          options={FORMALITY_OPTIONS}
          className={cx('self-start', isUncertain('formality') && 'border-dashed border-rethink')}
        />
      </fieldset>
    </div>
  );
}
