/**
 * Constellation — colour palettes + procedural subject shapes.
 * Direct port of CONSTELLATION_PALETTES / SUBJECTS / samplers from
 * noon-bg-lab.html.
 *
 * Each subject is a list of true-3D primitives in a normalised [-1, 1]
 * cube. A weighted sampler picks a primitive (by `w` ≈ volume) then a
 * point [x, y, z] inside it.
 */

/** Multi-colour palettes built from the Noon brand primitives. */
export const CONSTELLATION_PALETTES: Record<string, string[]> = {
  'Aurora':         ['#C7A8FF', '#B08AF9', '#96BCFF', '#6BA3FF', '#7FE3BE', '#64D8AE'],
  'Brand Spectrum': ['#C7A8FF', '#B08AF9', '#6BA3FF', '#7FE3BE', '#e0b83a', '#e58a7f'],
  'Iris':           ['#C7A8FF', '#B08AF9', '#8E63E0'],
  'Noon':           ['#9EEACB', '#7FE3BE', '#64D8AE', '#3FAE87'],
  'Ember':          ['#f0cf5a', '#e0b83a', '#d9a74a', '#e58a7f', '#c55a4e'],
  'Chalk':          ['#f5f1e8', '#e8e4dc', '#c9c4b8'],
};

export type PrimitiveKind = 'sphere' | 'torus' | 'bar3d' | 'box' | 'quad3d' | 'paraboloid';

export interface Primitive {
  kind: PrimitiveKind;
  w: number;
  // sphere / torus / box / paraboloid centre
  cx?: number; cy?: number; cz?: number;
  // sphere
  r?: number; shell?: boolean; thick?: number; scale?: [number, number, number];
  // torus
  tube?: number; rotX?: number; rotY?: number; rotZ?: number;
  // bar3d endpoints
  x1?: number; y1?: number; z1?: number; x2?: number; y2?: number; z2?: number;
  // box half-extents
  sx?: number; sy?: number; sz?: number;
  // quad3d corners
  pts?: number[][];
  // paraboloid curvature
  k?: number;
}

export interface Subject {
  name: string;
  primitives: Primitive[];
}

export const SUBJECTS: Record<string, Subject> = {
  math: {
    name: 'Mathematics',
    primitives: [
      { kind: 'paraboloid', w: 4.0, cx: 0, cy: 0, cz: 0, r: 0.82, k: 1.5, thick: 0.06 },
      { kind: 'bar3d', w: 1.0, x1: -0.95, y1: -0.45, z1: 0,     x2: 0.95, y2: -0.45, z2: 0,    thick: 0.045 },
      { kind: 'bar3d', w: 1.0, x1: 0,     y1: -0.85, z1: 0,     x2: 0,    y2: 0.70,  z2: 0,    thick: 0.045 },
      { kind: 'bar3d', w: 1.0, x1: 0,     y1: -0.45, z1: -0.95, x2: 0,    y2: -0.45, z2: 0.95, thick: 0.045 },
    ],
  },
  physics: {
    name: 'Physics',
    primitives: [
      { kind: 'sphere', w: 1.4, cx: 0, cy: 0, cz: 0, r: 0.19 },
      { kind: 'torus',  w: 2.0, cx: 0, cy: 0, cz: 0, r: 0.80, tube: 0.04, rotX: 0 },
      { kind: 'torus',  w: 2.0, cx: 0, cy: 0, cz: 0, r: 0.80, tube: 0.04, rotX: 1.5708 },
      { kind: 'torus',  w: 2.0, cx: 0, cy: 0, cz: 0, r: 0.80, tube: 0.04, rotY: 1.5708 },
    ],
  },
  chemistry: {
    name: 'Chemistry',
    primitives: [
      { kind: 'sphere', w: 2.6, cx: 0,     cy: 0,     cz: 0,     r: 0.32 },
      { kind: 'sphere', w: 1.3, cx: -0.62, cy: 0.30,  cz: 0.18,  r: 0.20 },
      { kind: 'sphere', w: 1.3, cx: 0.58,  cy: -0.32, cz: -0.20, r: 0.20 },
      { kind: 'sphere', w: 1.0, cx: 0.30,  cy: 0.55,  cz: -0.28, r: 0.17 },
      { kind: 'sphere', w: 0.9, cx: -0.20, cy: -0.55, cz: 0.32,  r: 0.15 },
      { kind: 'bar3d', w: 0.45, x1: 0, y1: 0, z1: 0, x2: -0.62, y2: 0.30,  z2: 0.18,  thick: 0.045 },
      { kind: 'bar3d', w: 0.45, x1: 0, y1: 0, z1: 0, x2: 0.58,  y2: -0.32, z2: -0.20, thick: 0.045 },
      { kind: 'bar3d', w: 0.4,  x1: 0, y1: 0, z1: 0, x2: 0.30,  y2: 0.55,  z2: -0.28, thick: 0.045 },
      { kind: 'bar3d', w: 0.4,  x1: 0, y1: 0, z1: 0, x2: -0.20, y2: -0.55, z2: 0.32,  thick: 0.045 },
    ],
  },
  biology: {
    name: 'Biology',
    primitives: [
      { kind: 'sphere', w: 5.0,  cx: 0,     cy: 0,     cz: 0,     r: 0.78, shell: true, thick: 0.13 },
      { kind: 'sphere', w: 1.4,  cx: -0.14, cy: 0.10,  cz: 0.06,  r: 0.22 },
      { kind: 'sphere', w: 0.5,  cx: 0.30,  cy: -0.20, cz: -0.10, r: 0.11 },
      { kind: 'sphere', w: 0.45, cx: 0.22,  cy: 0.30,  cz: 0.18,  r: 0.10 },
      { kind: 'sphere', w: 0.4,  cx: -0.30, cy: -0.28, cz: 0.20,  r: 0.09 },
    ],
  },
  geography: {
    name: 'Geography',
    primitives: [
      { kind: 'sphere', w: 4.6, cx: 0, cy: 0, cz: 0, r: 0.50 },
      { kind: 'torus',  w: 2.6, cx: 0, cy: 0, cz: 0, r: 0.86, tube: 0.07, rotX: 1.27, rotZ: 0.3 },
      { kind: 'torus',  w: 1.1, cx: 0, cy: 0, cz: 0, r: 1.00, tube: 0.03, rotX: 1.27, rotZ: 0.3 },
    ],
  },
  quant: {
    name: 'Qudrat Quant',
    primitives: [
      { kind: 'box', w: 1.0, cx: -0.6, cy: -0.40,  cz: 0, sx: 0.24, sy: 0.50, sz: 0.24 },
      { kind: 'box', w: 1.6, cx: -0.2, cy: -0.175, cz: 0, sx: 0.24, sy: 0.95, sz: 0.24 },
      { kind: 'box', w: 2.0, cx: 0.2,  cy: -0.025, cz: 0, sx: 0.24, sy: 1.25, sz: 0.24 },
      { kind: 'box', w: 1.2, cx: 0.6,  cy: -0.30,  cz: 0, sx: 0.24, sy: 0.70, sz: 0.24 },
      { kind: 'box', w: 0.6, cx: 0,    cy: -0.68,  cz: 0, sx: 1.70, sy: 0.05, sz: 0.45 },
    ],
  },
  verbal: {
    name: 'Qudrat Verbal',
    primitives: [
      { kind: 'sphere', w: 6.0, cx: 0, cy: 0.06, cz: 0, r: 0.62, scale: [1.05, 0.96, 0.92] },
      { kind: 'bar3d',  w: 0.7, x1: -0.30, y1: -0.34, z1: 0, x2: -0.48, y2: -0.72, z2: 0, thick: 0.07 },
    ],
  },
  esl: {
    name: 'ESL',
    primitives: [
      // capital letter 'A' — two diagonal legs + a crossbar
      { kind: 'bar3d', w: 2.4, x1: 0, y1: 0.85, z1: 0, x2: -0.62, y2: -0.82, z2: 0, thick: 0.10 },
      { kind: 'bar3d', w: 2.4, x1: 0, y1: 0.85, z1: 0, x2:  0.62, y2: -0.82, z2: 0, thick: 0.10 },
      { kind: 'bar3d', w: 1.0, x1: -0.31, y1: 0.0, z1: 0, x2: 0.31, y2: 0.0, z2: 0, thick: 0.09 },
    ],
  },
};

export const CONSTELLATION_SUBJECTS = Object.keys(SUBJECTS);

type Vec3 = [number, number, number];

/** Euler rotation (X then Y then Z) of a point. */
function rot3(x: number, y: number, z: number, ax: number, ay: number, az: number): Vec3 {
  let c: number, s: number;
  if (ax) { c = Math.cos(ax); s = Math.sin(ax); const y1 = y * c - z * s; z = y * s + z * c; y = y1; }
  if (ay) { c = Math.cos(ay); s = Math.sin(ay); const x1 = x * c + z * s; z = -x * s + z * c; x = x1; }
  if (az) { c = Math.cos(az); s = Math.sin(az); const x1 = x * c - y * s; y = x * s + y * c; x = x1; }
  return [x, y, z];
}

/** Random unit-ball offset (rejection-sampled), scaled by r. */
function ballOffset(r: number): Vec3 {
  let x: number, y: number, z: number, d2: number;
  do {
    x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1;
    d2 = x * x + y * y + z * z;
  } while (d2 > 1);
  return [x * r, y * r, z * r];
}

/** Sample a single 3D point [x, y, z] from a primitive. */
export function samplePrimitive(p: Primitive): Vec3 {
  const cx = p.cx || 0, cy = p.cy || 0, cz = p.cz || 0;
  if (p.kind === 'sphere') {
    const R = p.r || 0.5;
    let x: number, y: number, z: number, d2: number;
    do {
      x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1;
      d2 = x * x + y * y + z * z;
    } while (d2 > 1 || d2 < 1e-6);
    const d = Math.sqrt(d2);
    let rr: number;
    if (p.shell) {
      rr = R * (1 + (Math.random() - 0.5) * (p.thick || 0.1));
    } else {
      rr = Math.cbrt(Math.random()) * R;
    }
    let px = (x / d) * rr, py = (y / d) * rr, pz = (z / d) * rr;
    if (p.scale) { px *= p.scale[0]; py *= p.scale[1]; pz *= p.scale[2]; }
    return [cx + px, cy + py, cz + pz];
  }
  if (p.kind === 'torus') {
    const R = p.r || 0.8;
    const a = Math.random() * Math.PI * 2;
    const b = Math.random() * Math.PI * 2;
    const tr = (p.tube || 0.05) * Math.sqrt(Math.random());
    const ringR = R + tr * Math.cos(b);
    const lx = ringR * Math.cos(a);
    const ly = ringR * Math.sin(a);
    const lz = tr * Math.sin(b);
    const r = rot3(lx, ly, lz, p.rotX || 0, p.rotY || 0, p.rotZ || 0);
    return [cx + r[0], cy + r[1], cz + r[2]];
  }
  if (p.kind === 'bar3d') {
    const t = Math.random();
    const px = (p.x1 || 0) + ((p.x2 || 0) - (p.x1 || 0)) * t;
    const py = (p.y1 || 0) + ((p.y2 || 0) - (p.y1 || 0)) * t;
    const pz = (p.z1 || 0) + ((p.z2 || 0) - (p.z1 || 0)) * t;
    const o = ballOffset(p.thick || 0.05);
    return [px + o[0], py + o[1], pz + o[2]];
  }
  if (p.kind === 'box') {
    return [
      cx + (Math.random() - 0.5) * (p.sx || 0),
      cy + (Math.random() - 0.5) * (p.sy || 0),
      cz + (Math.random() - 0.5) * (p.sz || 0),
    ];
  }
  if (p.kind === 'quad3d' && p.pts) {
    const u = Math.random(), v = Math.random();
    const P = p.pts;
    const ax = P[0][0] + (P[1][0] - P[0][0]) * u;
    const ay = P[0][1] + (P[1][1] - P[0][1]) * u;
    const az = P[0][2] + (P[1][2] - P[0][2]) * u;
    const bx = P[3][0] + (P[2][0] - P[3][0]) * u;
    const by = P[3][1] + (P[2][1] - P[3][1]) * u;
    const bz = P[3][2] + (P[2][2] - P[3][2]) * u;
    const x = ax + (bx - ax) * v;
    const y = ay + (by - ay) * v;
    const z = az + (bz - az) * v;
    const e1x = P[1][0] - P[0][0], e1y = P[1][1] - P[0][1], e1z = P[1][2] - P[0][2];
    const e2x = P[3][0] - P[0][0], e2y = P[3][1] - P[0][1], e2z = P[3][2] - P[0][2];
    const nx = e1y * e2z - e1z * e2y;
    const ny = e1z * e2x - e1x * e2z;
    const nz = e1x * e2y - e1y * e2x;
    const nl = Math.hypot(nx, ny, nz) || 1;
    const off = (Math.random() - 0.5) * (p.thick || 0.04);
    return [x + (nx / nl) * off, y + (ny / nl) * off, z + (nz / nl) * off];
  }
  if (p.kind === 'paraboloid') {
    const R = p.r || 0.8;
    const k = p.k || 1.5;
    const a = Math.random() * Math.PI * 2;
    const rr = Math.sqrt(Math.random()) * R;
    const lx = Math.cos(a) * rr;
    const lz = Math.sin(a) * rr;
    const ly = rr * rr * k - R * R * k * 0.5;
    const off = (Math.random() - 0.5) * (p.thick || 0.05);
    return [cx + lx, cy + ly + off, cz + lz];
  }
  return [0, 0, 0];
}

/** Pre-generate a target point cloud of `count` 3D points for a subject. */
export function buildSubjectCloud(subjectKey: string, count: number): Vec3[] {
  const subj = SUBJECTS[subjectKey] || SUBJECTS.math;
  const prims = subj.primitives;
  let totalW = 0;
  for (let i = 0; i < prims.length; i++) totalW += prims[i].w;
  const cloud: Vec3[] = [];
  for (let i = 0; i < count; i++) {
    let r = Math.random() * totalW;
    let prim = prims[0];
    for (let k = 0; k < prims.length; k++) {
      r -= prims[k].w;
      if (r <= 0) { prim = prims[k]; break; }
    }
    cloud.push(samplePrimitive(prim));
  }
  return cloud;
}
