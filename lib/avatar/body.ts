import { armAt, ellipsePath, lerp, local, mirrorD, smoothPath, type Figure, type Pt } from './geometry';

/**
 * The figure as a studio mannequin: each limb is its own shape so it can be lit
 * as a rounded form, and the face is sculpted with soft light and shadow rather
 * than drawn features. Every path keeps a fixed structure, so height and build
 * changes morph smoothly.
 */
export interface BodyPaths {
  legs: [string, string];
  arms: [string, string];
  hands: [string, string];
  /** Faint lines between fingers. */
  fingers: string;
  torso: string;
  neck: string;
  head: string;
  ears: string;
  /** Sculpting: soft shapes drawn over the face with blur. */
  face: {
    sockets: string;
    lids: string;
    brows: string;
    noseLight: string;
    noseShade: string;
    nostrils: string;
    lips: string;
    lipLight: string;
    cheekLight: string;
  };
  /** Shadow the jaw casts on the neck. */
  jawShadow: string;
  /** Soft floor shadow and the darker contact shadows under each foot. */
  floor: string;
  contact: string;
}

function torsoPath(f: Figure): string {
  const { cx, w } = f;
  const right: Pt[] = [
    { x: cx + w.neck + 1, y: f.neckY - 3 },
    { x: cx + w.neck + (w.shoulder - w.neck) * 0.55, y: f.shoulderY - 1 }, // trapezius
    { x: cx + w.shoulder - 2, y: f.shoulderY + 3 }, // shoulder point
    { x: cx + w.chest + 1, y: f.armpitY - 2 },
    { x: cx + lerp(w.chest, w.waist, 0.5), y: lerp(f.armpitY, f.waistY, 0.55) }, // ribcage
    { x: cx + w.waist, y: f.waistY },
    { x: cx + w.hip, y: f.hipY },
    { x: cx + w.hip * 0.55, y: f.crotchY - 2 },
  ];
  const left = [...right].reverse().map((p) => ({ x: 2 * cx - p.x, y: p.y }));
  return smoothPath([...right, { x: cx, y: f.crotchY + 2 }, ...left], true, 0.42);
}

/** The right leg (viewer's right), hip to ankle; the torso covers its top. */
function legPath(f: Figure): string {
  const { cx, w, legLen } = f;
  const kneeC = cx + lerp(f.legX, f.footX, 0.5);
  const calfC = cx + lerp(f.legX, f.footX, 0.75);
  const ankleC = cx + f.footX;
  return smoothPath(
    [
      { x: cx + 0.5, y: f.hipY - 10 },
      { x: cx + w.hip - 1, y: f.hipY - 6 },
      { x: cx + w.hip + 0.5, y: f.hipY + legLen * 0.08 }, // outer hip
      { x: kneeC + w.thigh + 2.2, y: f.crotchY + legLen * 0.2 }, // outer thigh
      { x: kneeC + w.knee + 0.4, y: f.kneeY }, // outer knee
      { x: calfC + w.calf + 0.6, y: f.calfY - legLen * 0.06 }, // outer calf, higher
      { x: ankleC + w.ankle + 0.8, y: f.ankleY - legLen * 0.06 },
      { x: ankleC + w.ankle, y: f.ankleY + 5 },
      { x: ankleC - w.ankle, y: f.ankleY + 5 },
      { x: ankleC - w.ankle - 0.4, y: f.ankleY - legLen * 0.08 },
      { x: calfC - w.calf + 1.6, y: f.calfY + legLen * 0.01 }, // inner calf, lower
      { x: kneeC - w.knee - 0.6, y: f.kneeY + 2 }, // inner knee
      { x: kneeC - w.thigh * 0.8, y: f.crotchY + legLen * 0.18 }, // inner thigh
      { x: cx + 1.2, y: f.crotchY + 1 },
    ],
    true,
    0.45,
  );
}

/** The right arm: deltoid, bicep, elbow, forearm, wrist. */
function armPath(f: Figure): string {
  const { arm } = f;
  const upperLen = Math.hypot(arm.elbow.x - arm.shoulder.x, arm.elbow.y - arm.shoulder.y);
  const foreLen = Math.hypot(arm.wrist.x - arm.elbow.x, arm.wrist.y - arm.elbow.y);
  const elbowT = upperLen / (upperLen + foreLen);
  const edge = (t: number, k: number, side: 1 | -1): Pt => {
    const a = armAt(arm, t);
    return { x: a.centre.x + side * a.normal.x * a.half * k, y: a.centre.y + side * a.normal.y * a.half * k };
  };
  const forearmT = elbowT + (1 - elbowT) * 0.22;
  return smoothPath(
    [
      { x: arm.shoulder.x - 3, y: arm.shoulder.y - arm.upper - 0.5 }, // shoulder cap
      edge(0.06, 1.18, 1), // deltoid
      edge(elbowT * 0.5, 1.02, 1), // upper arm
      edge(elbowT, 0.86, 1), // elbow
      edge(forearmT, 1.06, 1), // forearm swell
      edge(1, 1, 1), // wrist
      edge(1, 1, -1),
      edge(forearmT + 0.08, 0.98, -1),
      edge(elbowT, 0.84, -1),
      edge(elbowT * 0.5, 0.96, -1),
      { x: f.cx + f.w.chest - 0.5, y: f.armpitY + 2 }, // armpit
    ],
    true,
    0.45,
  );
}

function handFrame(f: Figure) {
  const wr = armAt(f.arm, 1);
  const dx = f.arm.wrist.x - f.arm.elbow.x;
  const dy = f.arm.wrist.y - f.arm.elbow.y;
  const len = Math.hypot(dx, dy) || 1;
  const dir = { x: dx / len, y: dy / len };
  return { at: local(wr.centre, dir, wr.normal), L: f.headH * 0.64, half: wr.half, W: f.arm.wristW * 2.15 };
}

/** A relaxed mannequin hand: fingers together, thumb resting forward. */
function handPath(f: Figure): string {
  const { at, L, half, W } = handFrame(f);
  return smoothPath(
    [
      at(0, half),
      at(L * 0.32, W * 0.5),
      at(L * 0.72, W * 0.44),
      at(L * 0.97, W * 0.14),
      at(L * 0.94, -W * 0.18),
      at(L * 0.72, -W * 0.36),
      at(L * 0.56, -W * 0.56), // thumb tip
      at(L * 0.4, -W * 0.6),
      at(L * 0.2, -W * 0.48), // thumb base
      at(0, -half),
    ],
    true,
    0.4,
  );
}

function fingerLines(f: Figure): string {
  const { at, L, W } = handFrame(f);
  return [-0.12, 0.08, 0.27]
    .map((v) =>
      smoothPath([at(L * 0.58, W * v), at(L * 0.78, W * (v + 0.02)), at(L * 0.93, W * (v + 0.01))], false, 0.5),
    )
    .join(' ');
}

function neckPath(f: Figure): string {
  const { cx, w } = f;
  const top = f.chin - 9;
  return smoothPath(
    [
      { x: cx - w.neck * 0.92, y: top },
      { x: cx + w.neck * 0.92, y: top },
      { x: cx + w.neck, y: lerp(top, f.neckY, 0.6) },
      { x: cx + w.neck + 6, y: f.neckY + 4 }, // flares into the trapezius
      { x: cx - w.neck - 6, y: f.neckY + 4 },
      { x: cx - w.neck, y: lerp(top, f.neckY, 0.6) },
    ],
    true,
    0.35,
  );
}

function headPath(f: Figure): string {
  const { cx, cy, rx, ry } = f.head;
  const right: Pt[] = [
    { x: cx + rx * 0.7, y: cy - ry * 0.78 },
    { x: cx + rx * 0.98, y: cy - ry * 0.2 }, // temple
    { x: cx + rx * 0.95, y: cy + ry * 0.14 }, // cheekbone
    { x: cx + rx * 0.82, y: cy + ry * 0.5 }, // jaw
    { x: cx + rx * 0.55, y: cy + ry * 0.82 }, // jaw angle
    { x: cx + rx * 0.24, y: cy + ry * 0.98 },
  ];
  const left = [...right].reverse().map((p) => ({ x: 2 * cx - p.x, y: p.y }));
  return smoothPath([{ x: cx, y: cy - ry }, ...right, { x: cx, y: cy + ry * 1.01 }, ...left], true, 0.5);
}

function earPath(f: Figure): string {
  const { cx, cy, rx, ry } = f.head;
  return smoothPath(
    [
      { x: cx + rx * 0.9, y: cy - ry * 0.06 },
      { x: cx + rx * 1.1, y: cy - ry * 0.04 },
      { x: cx + rx * 1.12, y: cy + ry * 0.18 },
      { x: cx + rx * 1.0, y: cy + ry * 0.34 },
      { x: cx + rx * 0.88, y: cy + ry * 0.3 },
    ],
    true,
    0.5,
  );
}

function almond(c: Pt, w: number, h: number): string {
  return smoothPath(
    [
      { x: c.x - w, y: c.y + h * 0.1 },
      { x: c.x - w * 0.3, y: c.y - h },
      { x: c.x + w * 0.4, y: c.y - h * 0.9 },
      { x: c.x + w, y: c.y },
      { x: c.x + w * 0.2, y: c.y + h * 0.55 },
      { x: c.x - w * 0.5, y: c.y + h * 0.5 },
    ],
    true,
    0.5,
  );
}

function facePaths(f: Figure): BodyPaths['face'] {
  const { cx, cy, rx, ry } = f.head;
  const eyeY = cy + ry * 0.06;
  const eyeX = rx * 0.37;
  const both = (d: string) => `${d} ${mirrorD(d)}`;

  const sockets = both(ellipsePath(cx + eyeX, eyeY - ry * 0.02, rx * 0.25, ry * 0.12));
  // Lowered lids: a serene mannequin gaze rather than painted eyes.
  const lids = both(almond({ x: cx + eyeX, y: eyeY + ry * 0.015 }, rx * 0.19, ry * 0.035));
  const brows = both(
    smoothPath(
      [
        { x: cx + eyeX - rx * 0.22, y: eyeY - ry * 0.15 },
        { x: cx + eyeX + rx * 0.02, y: eyeY - ry * 0.205 },
        { x: cx + eyeX + rx * 0.26, y: eyeY - ry * 0.16 },
        { x: cx + eyeX + rx * 0.02, y: eyeY - ry * 0.18 },
      ],
      true,
      0.5,
    ),
  );

  const noseTop = eyeY - ry * 0.02;
  const tip = cy + ry * 0.42;
  const noseLight = smoothPath(
    [
      { x: cx - rx * 0.03, y: noseTop },
      { x: cx + rx * 0.03, y: noseTop },
      { x: cx + rx * 0.05, y: tip - ry * 0.03 },
      { x: cx, y: tip + ry * 0.01 },
      { x: cx - rx * 0.05, y: tip - ry * 0.03 },
    ],
    true,
    0.5,
  );
  // Shadow on the far side of the nose, away from the key light.
  const noseShade = smoothPath(
    [
      { x: cx + rx * 0.06, y: noseTop + ry * 0.04 },
      { x: cx + rx * 0.13, y: tip - ry * 0.05 },
      { x: cx + rx * 0.16, y: tip + ry * 0.03 },
      { x: cx + rx * 0.08, y: tip + ry * 0.04 },
      { x: cx + rx * 0.06, y: tip - ry * 0.08 },
    ],
    true,
    0.5,
  );
  const nostrils = ellipsePath(cx + rx * 0.01, tip + ry * 0.065, rx * 0.15, ry * 0.028);

  const mouthY = cy + ry * 0.64;
  const lipW = rx * 0.27;
  const lips = smoothPath(
    [
      { x: cx - lipW, y: mouthY },
      { x: cx - lipW * 0.45, y: mouthY - ry * 0.055 },
      { x: cx, y: mouthY - ry * 0.035 }, // cupid's bow
      { x: cx + lipW * 0.45, y: mouthY - ry * 0.055 },
      { x: cx + lipW, y: mouthY },
      { x: cx + lipW * 0.4, y: mouthY + ry * 0.075 },
      { x: cx - lipW * 0.4, y: mouthY + ry * 0.075 },
    ],
    true,
    0.45,
  );
  const lipLight = ellipsePath(cx - lipW * 0.15, mouthY + ry * 0.04, lipW * 0.35, ry * 0.018);
  const cheekLight = ellipsePath(cx - rx * 0.5, cy + ry * 0.26, rx * 0.2, ry * 0.12);

  return { sockets, lids, brows, noseLight, noseShade, nostrils, lips, lipLight, cheekLight };
}

export function bodyPaths(f: Figure): BodyPaths {
  const leg = legPath(f);
  const arm = armPath(f);
  const hand = handPath(f);
  const ear = earPath(f);
  const feet = (offset: number, rx: number, ry: number) =>
    `${ellipsePath(f.cx + f.footX + offset, f.floor, rx, ry)} ${ellipsePath(f.cx - f.footX - offset, f.floor, rx, ry)}`;
  return {
    legs: [mirrorD(leg), leg],
    arms: [mirrorD(arm), arm],
    hands: [mirrorD(handPath(f)), hand],
    fingers: `${fingerLines(f)} ${mirrorD(fingerLines(f))}`,
    torso: torsoPath(f),
    neck: neckPath(f),
    head: headPath(f),
    ears: `${ear} ${mirrorD(ear)}`,
    face: facePaths(f),
    jawShadow: ellipsePath(f.cx, f.chin - 1, f.w.neck * 1.25, 5),
    floor: ellipsePath(f.cx, f.floor + 1, f.w.hip * 2.1, 7),
    contact: feet(2.5, 12, 2.6),
  };
}
