import { describe, expect, it } from 'vitest';
import { COLOR_FAMILIES } from '@/rules/colors';
import { colorInfo, hexToFamily, hexToRgb, lightness } from './color';
import { bottom, top } from './test-fixtures';

describe('hexToFamily', () => {
  it.each([
    ['#000000', 'black'],
    ['#ffffff', 'white'],
    ['#808080', 'grey'],
    ['#3a3d42', 'charcoal'],
    ['#1e2b48', 'navy'],
    ['#f0e7d4', 'cream'],
    ['#d4c4a2', 'beige'],
    ['#c29a6a', 'tan'],
    ['#5c3b2a', 'brown'],
    ['#55603a', 'olive'],
    ['#a84a24', 'rust'],
    ['#c8302a', 'red'],
    ['#702030', 'burgundy'],
    ['#2c6a3c', 'green'],
    ['#adc8e4', 'light-blue'],
    ['#2e60aa', 'blue'],
    ['#efc31a', 'yellow'],
  ])('%s → %s', (hex, family) => {
    expect(hexToFamily(hex)).toBe(family);
  });

  it('maps every anchor back to its own family', () => {
    for (const [id, family] of Object.entries(COLOR_FAMILIES)) {
      for (const anchor of family.anchors) expect(hexToFamily(anchor), anchor).toBe(id);
    }
  });
});

describe('hexToRgb', () => {
  it('accepts short and long hex', () => {
    expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
    expect(hexToRgb('1c1c1c')).toEqual([28, 28, 28]);
  });

  it('rejects junk', () => {
    expect(() => hexToRgb('#zzzzzz')).toThrow();
  });
});

describe('lightness', () => {
  it('orders black < grey < white', () => {
    expect(lightness('#000000')).toBeLessThan(1);
    expect(lightness('#808080')).toBeGreaterThan(50);
    expect(lightness('#ffffff')).toBeGreaterThan(99);
  });
});

describe('colorInfo', () => {
  it('treats blue jeans as denim, a neutral', () => {
    const jeans = bottom('jeans', { wash: 'mid' });
    expect(colorInfo(jeans, true)).toMatchObject({ family: 'denim', group: 'neutral' });
  });

  it('keeps black jeans black', () => {
    const jeans = bottom('jeans', { color: 'black', material: 'denim' });
    expect(colorInfo(jeans, true).family).toBe('black');
  });

  it('falls back to the hex when the tagged family is unknown', () => {
    const tee = { ...top('t-shirt'), colors: [{ hex: '#2c6a3c', family: 'forest green', share: 1 }] };
    expect(colorInfo(tee, false).family).toBe('green');
  });

  it('uses the color with the largest share', () => {
    const tee = {
      ...top('t-shirt'),
      colors: [
        { hex: '#ffffff', family: 'white', share: 0.2 },
        { hex: '#1e2b48', family: 'navy', share: 0.8 },
      ],
    };
    expect(colorInfo(tee, false).family).toBe('navy');
  });
});
