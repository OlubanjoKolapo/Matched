import { describe, expect, it } from 'vitest';
import { cmToFeetInches, defaultUnits, feetInchesToCm, formatHeight, snapHeight } from './units';

describe('units', () => {
  it('converts between cm and feet/inches', () => {
    expect(cmToFeetInches(175)).toEqual({ feet: 5, inches: 9 });
    expect(cmToFeetInches(183)).toEqual({ feet: 6, inches: 0 });
    expect(feetInchesToCm(5, 9)).toBe(175.3);
  });

  it('formats for display', () => {
    expect(formatHeight(176.4, 'metric')).toBe('176 cm');
    expect(formatHeight(175, 'imperial')).toBe('5′ 9″');
  });

  it('snaps to whole units', () => {
    expect(snapHeight(176.4, 'metric')).toBe(176);
    expect(snapHeight(176.4, 'imperial')).toBe(175.3);
  });

  it('defaults to imperial only where it is used', () => {
    expect(defaultUnits('en-US')).toBe('imperial');
    expect(defaultUnits('en-GB')).toBe('metric');
    expect(defaultUnits('fr-FR')).toBe('metric');
    expect(defaultUnits()).toBe('metric');
  });
});
