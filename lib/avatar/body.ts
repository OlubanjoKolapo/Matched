import { armAt, ellipsePath, lerp, mirror, mirrorD, path, type Figure, type Pt } from './geometry';

/** Skin shapes for the figure. All paths keep a fixed structure so height and build changes morph. */
export interface BodyPaths {
  legs: string;
  torso: string;
  neck: string;
  arms: string;
  hands: string;
  head: string;
  ears: string;
  eyes: string;
  brows: string;
  nose: string;
  mouth: string;
  shadow: string;
}

const flip = (p: Pt) => mirror(p);

function headPath(f: Figure): string {
  const { cx, cy, rx, ry } = f.head;
  const k = 0.5523;
  const jaw = rx * 0.86;
  return path()
    .M({ x: cx, y: cy - ry })
    .C({ x: cx + rx * k, y: cy - ry }, { x: cx + rx, y: cy - ry * k }, { x: cx + rx, y: cy })
    .C({ x: cx + rx, y: cy + ry * 0.45 }, { x: cx + jaw * 0.7, y: cy + ry }, { x: cx, y: cy + ry })
    .C({ x: cx - jaw * 0.7, y: cy + ry }, { x: cx - rx, y: cy + ry * 0.45 }, { x: cx - rx, y: cy })
    .C({ x: cx - rx, y: cy - ry * k }, { x: cx - rx * k, y: cy - ry }, { x: cx, y: cy - ry })
    .Z()
    .toString();
}

function torsoPath(f: Figure): string {
  const { cx, w } = f;
  const neckL = { x: cx - w.neck, y: f.neckY - 3 };
  const shoulderL = { x: cx - w.shoulder + 3, y: f.shoulderY + 2 };
  const armpitL = { x: cx - w.chest, y: f.armpitY };
  const waistL = { x: cx - w.waist, y: f.waistY };
  const hipL = { x: cx - w.hip, y: f.hipY };
  const crotch = { x: cx, y: f.crotchY + 2 };

  return path()
    .M(neckL)
    .C({ x: neckL.x - 2, y: f.shoulderY - 1 }, { x: shoulderL.x + 9, y: f.shoulderY - 2 }, shoulderL)
    .C({ x: shoulderL.x - 5, y: shoulderL.y + 6 }, { x: armpitL.x - 2, y: armpitL.y - 10 }, armpitL)
    .C({ x: armpitL.x + 1, y: armpitL.y + 14 }, { x: waistL.x, y: waistL.y - 14 }, waistL)
    .C({ x: waistL.x, y: waistL.y + 10 }, { x: hipL.x, y: hipL.y - 12 }, hipL)
    .C({ x: hipL.x, y: hipL.y + 14 }, { x: cx - 6, y: crotch.y }, crotch)
    .C({ x: cx + 6, y: crotch.y }, flip({ x: hipL.x, y: hipL.y + 14 }), flip(hipL))
    .C(flip({ x: hipL.x, y: hipL.y - 12 }), flip({ x: waistL.x, y: waistL.y + 10 }), flip(waistL))
    .C(flip({ x: waistL.x, y: waistL.y - 14 }), flip({ x: armpitL.x + 1, y: armpitL.y + 14 }), flip(armpitL))
    .C(flip({ x: armpitL.x - 2, y: armpitL.y - 10 }), flip({ x: shoulderL.x - 5, y: shoulderL.y + 6 }), flip(shoulderL))
    .C(flip({ x: shoulderL.x + 9, y: f.shoulderY - 2 }), flip({ x: neckL.x - 2, y: f.shoulderY - 1 }), flip(neckL))
    .Z()
    .toString();
}

function legsPath(f: Figure): string {
  const { cx, w } = f;
  const kneeC = cx + lerp(f.legX, f.footX, 0.5);
  const ankleC = cx + f.footX;
  const hipR = { x: cx + w.hip - 0.5, y: f.hipY };
  const kneeO = { x: kneeC + w.knee, y: f.kneeY };
  const kneeI = { x: kneeC - w.knee, y: f.kneeY };
  const ankleO = { x: ankleC + w.ankle, y: f.ankleY + 4 };
  const ankleI = { x: ankleC - w.ankle, y: f.ankleY + 4 };
  const crotch = { x: cx, y: f.crotchY };
  const thighDrop = f.legLen * 0.22;
  const calfBulge = w.calf - w.knee;

  return path()
    .M(flip(hipR))
    .C(flip({ x: hipR.x + 1, y: hipR.y + thighDrop }), flip({ x: kneeO.x + 2, y: kneeO.y - thighDrop * 0.7 }), flip(kneeO))
    .C(flip({ x: kneeO.x + calfBulge + 1.5, y: f.calfY - 10 }), flip({ x: ankleO.x + 1, y: ankleO.y - 30 }), flip(ankleO))
    .L(flip(ankleI))
    .C(flip({ x: ankleI.x - 1, y: ankleI.y - 30 }), flip({ x: kneeI.x - calfBulge, y: f.calfY - 14 }), flip(kneeI))
    .C(flip({ x: kneeI.x - 1, y: kneeI.y - thighDrop }), { x: cx - 3, y: crotch.y + 6 }, crotch)
    .C({ x: cx + 3, y: crotch.y + 6 }, { x: kneeI.x - 1, y: kneeI.y - thighDrop }, kneeI)
    .C({ x: kneeI.x - calfBulge, y: f.calfY - 14 }, { x: ankleI.x - 1, y: ankleI.y - 30 }, ankleI)
    .L(ankleO)
    .C({ x: ankleO.x + 1, y: ankleO.y - 30 }, { x: kneeO.x + calfBulge + 1.5, y: f.calfY - 10 }, kneeO)
    .C({ x: kneeO.x + 2, y: kneeO.y - thighDrop * 0.7 }, { x: hipR.x + 1, y: hipR.y + thighDrop }, hipR)
    .Z()
    .toString();
}

/** One arm as a tapered shape from shoulder to wrist (right side). */
function armShape(f: Figure): Pt[] {
  const { arm } = f;
  const s = armAt(arm, 0);
  const e = armAt(arm, 0.5);
  const wr = armAt(arm, 1);
  const out = (a: ReturnType<typeof armAt>, k = 1) => ({
    x: a.centre.x + a.normal.x * a.half * k,
    y: a.centre.y + a.normal.y * a.half * k,
  });
  const inn = (a: ReturnType<typeof armAt>) => ({
    x: a.centre.x - a.normal.x * a.half,
    y: a.centre.y - a.normal.y * a.half,
  });
  return [
    { x: s.centre.x - 2, y: s.centre.y - arm.upper }, // shoulder cap
    out(s, 1.05),
    out(e),
    out(wr),
    inn(wr),
    inn(e),
    { x: f.cx + f.w.chest - 1, y: f.armpitY + 2 }, // armpit
  ];
}

function armPath(points: Pt[]): string {
  const [cap, so, eo, wo, wi, ei, pit] = points as [Pt, Pt, Pt, Pt, Pt, Pt, Pt];
  return path()
    .M(cap)
    .C({ x: cap.x + 6, y: cap.y }, { x: so.x + 1, y: so.y - 4 }, so)
    .C({ x: so.x + 1, y: so.y + 14 }, { x: eo.x + 1, y: eo.y - 14 }, eo)
    .C({ x: eo.x, y: eo.y + 16 }, { x: wo.x + 0.5, y: wo.y - 16 }, wo)
    .L(wi)
    .C({ x: wi.x - 0.5, y: wi.y - 16 }, { x: ei.x, y: ei.y + 16 }, ei)
    .C({ x: ei.x - 1, y: ei.y - 14 }, { x: pit.x + 2, y: pit.y + 6 }, pit)
    .C({ x: pit.x - 2, y: pit.y - 10 }, { x: cap.x - 6, y: cap.y + 2 }, cap)
    .Z()
    .toString();
}

function handPoints(f: Figure): { wo: Pt; wi: Pt; tip: Pt; dir: Pt; normal: Pt; width: number } {
  const wr = armAt(f.arm, 1);
  const dx = f.arm.wrist.x - f.arm.elbow.x;
  const dy = f.arm.wrist.y - f.arm.elbow.y;
  const len = Math.hypot(dx, dy) || 1;
  const dir = { x: dx / len, y: dy / len };
  const handLen = f.headH * 0.58;
  return {
    wo: { x: wr.centre.x + wr.normal.x * wr.half, y: wr.centre.y + wr.normal.y * wr.half },
    wi: { x: wr.centre.x - wr.normal.x * wr.half, y: wr.centre.y - wr.normal.y * wr.half },
    tip: { x: wr.centre.x + dir.x * handLen, y: wr.centre.y + dir.y * handLen },
    dir,
    normal: wr.normal,
    width: f.arm.wristW * 1.55,
  };
}

function handPath(f: Figure): string {
  const h = handPoints(f);
  const len = f.headH * 0.58;
  const mid = { x: h.wo.x + h.dir.x * len * 0.45, y: h.wo.y + h.dir.y * len * 0.45 };
  const outerBulge = { x: mid.x + h.normal.x * h.width * 0.35, y: mid.y + h.normal.y * h.width * 0.35 };
  return path()
    .M(h.wo)
    .C(outerBulge, { x: h.tip.x + h.normal.x * h.width * 0.6, y: h.tip.y }, h.tip)
    .C({ x: h.tip.x - h.normal.x * h.width * 0.7, y: h.tip.y }, { x: h.wi.x - h.normal.x * 1.5, y: h.wi.y + 8 }, h.wi)
    .Z()
    .toString();
}

function neckPath(f: Figure): string {
  const { cx, w } = f;
  const top = f.chin - 8;
  return path()
    .M({ x: cx - w.neck, y: top })
    .L({ x: cx + w.neck, y: top })
    .C({ x: cx + w.neck, y: f.neckY - 2 }, { x: cx + w.neck + 3, y: f.neckY + 1 }, { x: cx + w.neck + 7, y: f.neckY + 4 })
    .L({ x: cx - w.neck - 7, y: f.neckY + 4 })
    .C({ x: cx - w.neck - 3, y: f.neckY + 1 }, { x: cx - w.neck, y: f.neckY - 2 }, { x: cx - w.neck, y: top })
    .Z()
    .toString();
}

function featurePaths(f: Figure) {
  const { cx, cy, rx, ry } = f.head;
  const eyeY = cy + ry * 0.1;
  const eyeX = rx * 0.4;
  const eyes = `${ellipsePath(cx - eyeX, eyeY, 1.7, 1.15)} ${ellipsePath(cx + eyeX, eyeY, 1.7, 1.15)}`;
  const browY = eyeY - ry * 0.2;
  const brow = (sx: number) =>
    path()
      .M({ x: cx + sx * (eyeX - 3.2), y: browY + 0.6 })
      .C({ x: cx + sx * (eyeX - 1.5), y: browY - 0.9 }, { x: cx + sx * (eyeX + 1.5), y: browY - 0.9 }, { x: cx + sx * (eyeX + 3.4), y: browY + 0.4 })
      .toString();
  const nose = path()
    .M({ x: cx + 0.6, y: cy + ry * 0.22 })
    .C({ x: cx + 1.6, y: cy + ry * 0.34 }, { x: cx + 2, y: cy + ry * 0.42 }, { x: cx - 0.8, y: cy + ry * 0.45 })
    .toString();
  const mouthY = cy + ry * 0.64;
  const mouth = path()
    .M({ x: cx - rx * 0.24, y: mouthY })
    .C({ x: cx - rx * 0.08, y: mouthY + 1.6 }, { x: cx + rx * 0.08, y: mouthY + 1.6 }, { x: cx + rx * 0.24, y: mouthY })
    .toString();
  const ears = `${ellipsePath(cx - rx + 0.4, cy + ry * 0.1, 2.6, 4.6)} ${ellipsePath(cx + rx - 0.4, cy + ry * 0.1, 2.6, 4.6)}`;
  return { eyes, brows: `${brow(-1)} ${brow(1)}`, nose, mouth, ears };
}

export function bodyPaths(f: Figure): BodyPaths {
  const arm = armPath(armShape(f));
  const hand = handPath(f);
  const face = featurePaths(f);
  return {
    legs: legsPath(f),
    torso: torsoPath(f),
    neck: neckPath(f),
    arms: `${arm} ${mirrorD(arm)}`,
    hands: `${hand} ${mirrorD(hand)}`,
    head: headPath(f),
    shadow: ellipsePath(f.cx, f.floor + 1, f.w.hip * 1.7, 5),
    ...face,
  };
}
