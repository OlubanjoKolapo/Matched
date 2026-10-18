export type Units = 'metric' | 'imperial';

export const CM_PER_INCH = 2.54;
export const HEIGHT_RANGE_CM = { min: 140, max: 210 } as const;

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / CM_PER_INCH);
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * CM_PER_INCH * 10) / 10;
}

/** "176 cm" or "5′ 9″". */
export function formatHeight(cm: number, units: Units): string {
  if (units === 'metric') return `${Math.round(cm)} cm`;
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet}′ ${inches}″`;
}

/** Spoken form for screen readers: "5 feet 9 inches". */
export function speakHeight(cm: number, units: Units): string {
  if (units === 'metric') return `${Math.round(cm)} centimetres`;
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet} feet ${inches} inches`;
}

/** One step of the height control: a centimetre, or an inch. */
export function heightStep(units: Units): number {
  return units === 'metric' ? 1 : CM_PER_INCH;
}

/** Snap a height to the nearest whole cm or inch. */
export function snapHeight(cm: number, units: Units): number {
  if (units === 'metric') return Math.round(cm);
  return Math.round(Math.round(cm / CM_PER_INCH) * CM_PER_INCH * 10) / 10;
}

/** Imperial for the few places that use it; metric everywhere else. */
export function defaultUnits(locale?: string): Units {
  return /^en-(US|LR)|^my\b/i.test(locale ?? '') ? 'imperial' : 'metric';
}
