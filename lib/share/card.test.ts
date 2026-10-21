import { describe, expect, it } from 'vitest';
import { wrapText } from './card';

// One unit per character keeps the arithmetic obvious.
const measure = (s: string) => s.length;

describe('share card text wrap', () => {
  it('keeps short text on one line', () => {
    expect(wrapText(measure, 'Tonal outfit', 20, 2)).toEqual(['Tonal outfit']);
  });

  it('wraps on word boundaries', () => {
    expect(wrapText(measure, 'One color head to toe draws a line', 14, 3)).toEqual(['One color head', 'to toe draws a', 'line']);
  });

  it('ellipsises when it runs out of lines', () => {
    const lines = wrapText(measure, 'One color head to toe draws a long line', 14, 2);
    expect(lines).toHaveLength(2);
    expect(lines[1]!.endsWith('…')).toBe(true);
    expect(lines.every((l) => l.length <= 14)).toBe(true);
  });
});
