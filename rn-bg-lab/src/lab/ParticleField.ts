/**
 * ParticleField — TS port of the web lab's ParticleField. Builds a grid of
 * jittered particles, each carrying stable seeds so character assignment
 * (driven by CharsetWeights) is deterministic across re-renders.
 */

import { CHAR_GROUPS } from './charsets';
import type { CharsetWeights } from './types';

export interface Particle {
  baseX: number;
  baseZ: number;
  x: number;
  z: number;
  vx: number;
  vz: number;
  char: string;
  charSeed1: number;        // 0..1, selects char group
  charSeed2: number;        // 0..1, selects char within group
  sizeT: number;            // 0..1, lerps between sizeMin and sizeMax
  phase: number;            // 0..2π, twinkle phase offset
  baseAlphaJitter: number;  // 0.7..1.0, per-particle alpha jitter
}

const TERRAIN_EXTENT = 1400;
const TERRAIN_DEPTH = 1100;
const GRID_SPACING = 32;

function pickChar(p: Particle, weights: CharsetWeights): string {
  const keys = Object.keys(CHAR_GROUPS) as (keyof typeof CHAR_GROUPS)[];
  let total = 0;
  for (const k of keys) total += Math.max(0, weights[k] || 0);
  if (total <= 0) return '·';
  const target = p.charSeed1 * total;
  let cum = 0;
  for (const k of keys) {
    cum += Math.max(0, weights[k] || 0);
    if (target <= cum) {
      const group = CHAR_GROUPS[k];
      return group[Math.floor(p.charSeed2 * group.length) % group.length];
    }
  }
  const lastK = keys[keys.length - 1];
  const group = CHAR_GROUPS[lastK];
  return group[Math.floor(p.charSeed2 * group.length) % group.length];
}

export function buildParticleField(density: number, weights: CharsetWeights): Particle[] {
  const particles: Particle[] = [];
  const spacing = GRID_SPACING / Math.max(0.05, density);
  const half = TERRAIN_EXTENT;
  const depth = TERRAIN_DEPTH;
  for (let z = -depth; z <= depth; z += spacing) {
    for (let x = -half; x <= half; x += spacing) {
      const jx = (Math.random() - 0.5) * spacing * 0.7;
      const jz = (Math.random() - 0.5) * spacing * 0.7;
      const px = x + jx;
      const pz = z + jz;
      const p: Particle = {
        baseX: px, baseZ: pz,
        x: px, z: pz,
        vx: 0, vz: 0,
        char: '·',
        charSeed1: Math.random(),
        charSeed2: Math.random(),
        sizeT: Math.random(),
        phase: Math.random() * Math.PI * 2,
        baseAlphaJitter: 0.7 + Math.random() * 0.3,
      };
      p.char = pickChar(p, weights);
      particles.push(p);
    }
  }
  return particles;
}

/** Re-pick chars in-place when charset weights change without rebuilding seeds. */
export function reassignChars(particles: Particle[], weights: CharsetWeights): void {
  for (const p of particles) p.char = pickChar(p, weights);
}
