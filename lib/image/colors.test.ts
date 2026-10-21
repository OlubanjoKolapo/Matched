import { describe, expect, it } from 'vitest';
import { dominantColors } from './colors';

const fill = (rgb: [number, number, number], n: number) => Array.from({ length: n }, () => [...rgb] as [number, number, number]);

describe('dominantColors', () => {
  it('finds a single solid color', () => {
    const colors = dominantColors(fill([31, 42, 68], 400));
    expect(colors).toHaveLength(1);
    expect(colors[0]).toMatchObject({ family: 'navy', share: 1 });
  });

  it('ranks two colors by share and ignores tiny specks', () => {
    const pixels = [...fill([240, 240, 238], 700), ...fill([28, 28, 28], 280), ...fill([200, 30, 30], 20)];
    const colors = dominantColors(pixels);
    expect(colors.map((c) => c.family)).toEqual(['white', 'black']);
    expect(colors[0]!.share).toBeCloseTo(0.7, 1);
  });

  it('merges shades of one family', () => {
    const pixels = [...fill([31, 42, 68], 300), ...fill([36, 48, 77], 300)];
    expect(dominantColors(pixels).map((c) => c.family)).toEqual(['navy']);
  });

  it('is empty for no pixels', () => {
    expect(dominantColors([])).toEqual([]);
  });
});
