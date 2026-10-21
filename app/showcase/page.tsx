import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChipDemo, ProgressDemo, ScoreDemo, SegmentedDemo } from '@/components/showcase/Demos';
import { ThemeToggle } from '@/components/shell/ThemeToggle';
import { Wordmark } from '@/components/shell/Wordmark';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Hairline } from '@/components/ui/Hairline';
import { HangTag } from '@/components/ui/HangTag';
import { Heading } from '@/components/ui/Heading';
import { Icon, ICON_NAMES } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Swatch } from '@/components/ui/Swatch';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';

export const metadata: Metadata = { title: 'Design system' };

const COLOR_TOKENS = [
  ['--color-paper', 'Page'],
  ['--color-paper-raised', 'Cards, tiles'],
  ['--color-paper-sunken', 'Wells, tracks'],
  ['--color-ink', 'Text, primary'],
  ['--color-ink-muted', 'Secondary text'],
  ['--color-ink-subtle', 'Tertiary text'],
  ['--color-accent', "Tailor's chalk"],
  ['--color-accent-soft', 'Accent tint'],
  ['--color-rethink', 'Warnings'],
  ['--color-metal', 'Rail rod'],
] as const;

const RADIUS_TOKENS = ['--radius-xs', '--radius-sm', '--radius-md', '--radius-lg', '--radius-pill'] as const;
const SHADOW_TOKENS = ['--shadow-lift', '--shadow-float', '--shadow-inset'] as const;

function Section({ index, title, note, children }: { index: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 py-section lg:grid-cols-12">
      <div className="flex flex-col gap-2 lg:col-span-3">
        <p className="caps numerals text-accent">{index}</p>
        <Heading as="h2" size="title">
          {title}
        </Heading>
        {note ? (
          <Text variant="caption" tone="muted">
            {note}
          </Text>
        ) : null}
      </div>
      <div className="lg:col-span-9">{children}</div>
    </section>
  );
}

export default function ShowcasePage() {
  return (
    <div className="mx-auto w-full max-w-page px-gutter pb-section">
      <header className="flex h-masthead items-center justify-between border-b border-rule">
        <Wordmark />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ButtonLink href="/showcase/avatar" variant="ghost" size="sm">
            Avatar lab
          </ButtonLink>
          <ButtonLink href="/" variant="ghost" size="sm">
            <Icon name="arrow-left" className="size-4" />
            Back to app
          </ButtonLink>
        </div>
      </header>

      <div className="flex flex-col gap-6 py-section">
        <Eyebrow>
          <span>Matched</span>
          <span>Design system</span>
          <span>v0.1</span>
        </Eyebrow>
        <Heading as="h1" size="display">
          The <em>lookbook</em>
          <br />
          of parts.
        </Heading>
        <Text variant="lead" tone="muted" className="max-w-prose">
          Every value lives in <code className="font-sans text-ink">styles/tokens.css</code>. Toggle the edition to see
          the evening palette.
        </Text>
      </div>

      <Hairline />
      <Section index="01" title="Typography" note="Inter Tight for display and numerals. Inter for interface text.">
        <div className="flex flex-col gap-8">
          <div>
            <p className="caps mb-2 text-ink-subtle">Display</p>
            <Heading as="p" size="display">
              Your clothes, <em>matched.</em>
            </Heading>
          </div>
          <div>
            <p className="caps mb-2 text-ink-subtle">Headline</p>
            <Heading as="p" size="headline">
              Wide-leg jeans need a <em>chunky</em> sneaker.
            </Heading>
          </div>
          <div>
            <p className="caps mb-2 text-ink-subtle">Subhead</p>
            <Heading as="p" size="subhead">
              <em>A slim shoe gets swallowed by the extra fabric.</em>
            </Heading>
          </div>
          <div>
            <p className="caps mb-2 text-ink-subtle">Title</p>
            <Heading as="p" size="title">
              Forest Green Hoodie
            </Heading>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="caps mb-2 text-ink-subtle">Lead</p>
              <Text variant="lead">Short sentences. No jargon. Never judgemental about bodies.</Text>
            </div>
            <div>
              <p className="caps mb-2 text-ink-subtle">Body</p>
              <Text>An oversized top balances a slim or straight bottom, so the outfit reads as deliberate.</Text>
            </div>
            <div>
              <p className="caps mb-2 text-ink-subtle">Caption</p>
              <Text variant="caption" tone="muted">
                Used only to tailor proportion tips.
              </Text>
            </div>
          </div>
          <Eyebrow>
            <span>Your wardrobe</span>
            <span>24 pieces</span>
          </Eyebrow>
        </div>
      </Section>

      <Hairline />
      <Section index="02" title="Color" note="The UI stays quiet. Clothing supplies the color.">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
          {COLOR_TOKENS.map(([token, use]) => (
            <li key={token} className="flex flex-col gap-2">
              <span
                aria-hidden
                className="block aspect-[4/5] rounded-sm border border-rule"
                style={{ background: `var(${token})` }}
              />
              <code className="text-caption text-ink">{token.replace('--color-', '')}</code>
              <span className="text-caption text-ink-muted">{use}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Hairline />
      <Section index="03" title="Buttons" note="Pill-shaped. Ink for primary, chalk red reserved for the Matched moment.">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Get started</Button>
            <Button variant="accent">Find matches</Button>
            <Button variant="secondary">Shuffle</Button>
            <Button variant="ghost">Skip</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">
              Large
              <Icon name="arrow-right" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <IconButton icon="shuffle" label="Shuffle" />
            <IconButton icon="camera" label="Take a photo" variant="outline" />
            <IconButton icon="plus" label="Add a piece" variant="solid" />
            <IconButton icon="close" label="Close" size="sm" variant="outline" />
          </div>
        </div>
      </Section>

      <Hairline />
      <Section index="04" title="Chips" note="Tap to select. Selected chips pop with a short spring.">
        <ChipDemo />
      </Section>

      <Hairline />
      <Section index="05" title="Hang tags" note="Status labels that hang from garments on the rail.">
        <div className="flex flex-wrap items-center gap-4">
          <HangTag tone="matched">Matched</HangTag>
          <HangTag>New</HangTag>
          <HangTag>Most versatile</HangTag>
          <HangTag tone="ink">Not worn in 30 days</HangTag>
        </div>
      </Section>

      <Hairline />
      <Section index="06" title="Score ring" note="The match score fills from zero. Matched ≥ 75, Works 55–74, Rethink < 55.">
        <ScoreDemo />
      </Section>

      <Hairline />
      <Section index="07" title="Controls">
        <div className="flex flex-col gap-10">
          <SegmentedDemo />
          <ProgressDemo />
          <div className="grid max-w-prose gap-8">
            <TextField label="Anthropic API key" placeholder="sk-ant-…" hint="Stored only on this device." />
            <TextField label="Item name" defaultValue="Forest Green Hoodie" error="That name is already on the rail." />
          </div>
        </div>
      </Section>

      <Hairline />
      <Section index="08" title="Surfaces" note="Cards, swatches and rules.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <Eyebrow>
              <span>Lesson</span>
              <span>Proportion</span>
            </Eyebrow>
            <Heading as="h3" size="title" className="mt-4">
              Match shoes to trousers to <em>extend</em> the leg.
            </Heading>
          </Card>
          <Card tone="sunken" interactive>
            <Eyebrow>
              <span>Gap finder</span>
            </Eyebrow>
            <Heading as="h3" size="title" className="mt-4">
              White low-profile sneakers would unlock <em>9</em> new outfits.
            </Heading>
          </Card>
          <Card tone="ink">
            <p className="caps text-on-ink">Evening card</p>
            <Heading as="h3" size="title" className="mt-4 text-on-ink">
              Ink surface, cream type.
            </Heading>
          </Card>
        </div>
        <div className="mt-8 flex flex-wrap gap-6">
          <Swatch hex="#1f2a44" name="navy" showName />
          <Swatch hex="#3d4a2f" name="olive" showName />
          <Swatch hex="#f2ead9" name="cream" showName />
          <Swatch hex="#7a4b2a" name="brown" showName />
          <Swatch hex="#111111" name="black" showName />
        </div>
      </Section>

      <Hairline />
      <Section index="09" title="Radius & shadow">
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap gap-4">
            {RADIUS_TOKENS.map((token) => (
              <div key={token} className="flex flex-col items-center gap-2">
                <span
                  aria-hidden
                  className="block size-16 border border-rule-strong bg-paper-raised"
                  style={{ borderRadius: `var(${token})` }}
                />
                <code className="text-caption text-ink-muted">{token.replace('--radius-', '')}</code>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-6">
            {SHADOW_TOKENS.map((token) => (
              <div key={token} className="flex flex-col items-center gap-3">
                <span
                  aria-hidden
                  className="block size-24 rounded-sm bg-paper-raised"
                  style={{ boxShadow: `var(${token})` }}
                />
                <code className="text-caption text-ink-muted">{token.replace('--shadow-', '')}</code>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Hairline />
      <Section index="10" title="Icons" note="Hand-drawn, 24px grid, 1.5 stroke.">
        <ul className="grid grid-cols-4 gap-4 sm:grid-cols-8">
          {ICON_NAMES.map((name) => (
            <li key={name} className="flex flex-col items-center gap-2 rounded-sm border border-rule py-4">
              <Icon name={name} className="size-6" />
              <code className="text-micro text-ink-muted">{name}</code>
            </li>
          ))}
        </ul>
      </Section>

      <Hairline />
      <footer className="flex items-center justify-between pt-8">
        <Text variant="caption" tone="muted">
          Matched · Your clothes, matched.
        </Text>
        <Link href="/settings" className="caps text-ink-muted hover:text-ink">
          Settings
        </Link>
      </footer>
    </div>
  );
}
