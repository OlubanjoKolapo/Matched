import { describe, expect, it } from 'vitest';
import { despeckle } from './process';

/** An RGBA buffer where `opaque(x, y)` decides which pixels are solid. */
function mask(width: number, height: number, opaque: (x: number, y: number) => boolean) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) data[(y * width + x) * 4 + 3] = opaque(x, y) ? 255 : 0;
  return data;
}

const alphaAt = (data: Uint8ClampedArray, width: number, x: number, y: number) => data[(y * width + x) * 4 + 3];

describe('despeckle', () => {
  it('clears small specks around a garment', () => {
    const w = 40;
    const data = mask(w, 40, (x, y) => (x >= 10 && x < 30 && y >= 5 && y < 35) || (x === 2 && y === 2) || (x === 37 && y === 20));
    despeckle(data, w, 40);
    expect(alphaAt(data, w, 2, 2)).toBe(0);
    expect(alphaAt(data, w, 37, 20)).toBe(0);
    expect(alphaAt(data, w, 20, 20)).toBe(255);
  });

  it('keeps both shoes of a pair', () => {
    const w = 60;
    const data = mask(w, 20, (x, y) => y >= 5 && y < 15 && ((x >= 5 && x < 25) || (x >= 35 && x < 52)));
    despeckle(data, w, 20);
    expect(alphaAt(data, w, 10, 10)).toBe(255);
    expect(alphaAt(data, w, 40, 10)).toBe(255);
  });
});
