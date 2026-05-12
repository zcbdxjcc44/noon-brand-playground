/**
 * ContourField — TS port of the web lab's marching-squares contour engine.
 *
 * `ensureGrid()` (re)allocates a height grid when cell counts change;
 * `sampleHeights(time)` refreshes vertex elevations from the same noise
 * the particle field uses; `buildContours()` emits per-level world-space
 * line segments via standard MS case lookups (centre-test resolves the
 * two ambiguous cases 5 and 10).
 */

import { noise, noise2 } from './noise';
import type { ContoursConfig, LabConfig } from './types';

export interface ContourLevel {
  /** World-y of this iso-level. */
  elev: number;
  /** Flat [x0,y0,z0, x1,y1,z1, ...] world-space segments. */
  segments: number[][];
}

export class ContourField {
  terrainExtent = 1400;
  terrainDepth = 1100;
  heights: Float32Array | null = null;
  cellsX = 0;
  cellsZ = 0;
  stepX = 0;
  stepZ = 0;

  ensureGrid(cfg: ContoursConfig): void {
    const cx = cfg.gridCellsX | 0;
    const cz = cfg.gridCellsZ | 0;
    if (this.cellsX === cx && this.cellsZ === cz) return;
    this.cellsX = cx;
    this.cellsZ = cz;
    this.stepX = (this.terrainExtent * 2) / cx;
    this.stepZ = (this.terrainDepth * 2) / cz;
    this.heights = new Float32Array((cx + 1) * (cz + 1));
  }

  sampleHeights(time: number, terrain: LabConfig['terrain']): void {
    if (!this.heights) return;
    const cx = this.cellsX;
    const cz = this.cellsZ;
    const half = this.terrainExtent;
    const depth = this.terrainDepth;
    const scale = terrain.scale;
    const amp = terrain.amplitude;
    const sec = terrain.secondaryNoise;
    const driftZ = time * terrain.drift * 100;
    const h = this.heights;
    let idx = 0;
    for (let j = 0; j <= cz; j++) {
      const z = -depth + j * this.stepZ;
      for (let i = 0; i <= cx; i++) {
        const x = -half + i * this.stepX;
        const n1 = noise(x * scale, (z + driftZ) * scale);
        const n2 = noise2(x * scale * 2.3, (z + driftZ) * scale * 2.3) * sec;
        h[idx++] = (n1 + n2 * 0.5) * amp;
      }
    }
  }

  height(i: number, j: number): number {
    return this.heights![j * (this.cellsX + 1) + i];
  }

  buildContours(cfg: ContoursConfig, terrain: LabConfig['terrain']): ContourLevel[] {
    if (!this.heights) return [];
    const cx = this.cellsX;
    const cz = this.cellsZ;
    const stepX = this.stepX;
    const stepZ = this.stepZ;
    const half = this.terrainExtent;
    const depth = this.terrainDepth;
    const N = cfg.levelCount | 0;
    const amp = terrain.amplitude;

    // Evenly distribute N levels across [-amp*1.05, +amp*1.05].
    const levels: ContourLevel[] = [];
    for (let k = 0; k < N; k++) {
      const t = (k + 1) / (N + 1);
      levels.push({ elev: (t * 2 - 1) * amp * 1.05, segments: [] });
    }

    for (let li = 0; li < N; li++) {
      const L = levels[li].elev;
      const segs = levels[li].segments;
      for (let j = 0; j < cz; j++) {
        const z0 = -depth + j * stepZ;
        const z1 = z0 + stepZ;
        for (let i = 0; i < cx; i++) {
          const x0 = -half + i * stepX;
          const x1 = x0 + stepX;
          const h0 = this.height(i, j);
          const h1 = this.height(i + 1, j);
          const h2 = this.height(i + 1, j + 1);
          const h3 = this.height(i, j + 1);
          let c = 0;
          if (h0 > L) c |= 1;
          if (h1 > L) c |= 2;
          if (h2 > L) c |= 4;
          if (h3 > L) c |= 8;
          if (c === 0 || c === 15) continue;

          // Edge interpolation helper.
          const lerpEdge = (edgeId: number): [number, number, number] => {
            let ha: number, hb: number, ax: number, az: number, bx: number, bz: number;
            if (edgeId === 0) { ha = h0; hb = h1; ax = x0; az = z0; bx = x1; bz = z0; }
            else if (edgeId === 1) { ha = h1; hb = h2; ax = x1; az = z0; bx = x1; bz = z1; }
            else if (edgeId === 2) { ha = h2; hb = h3; ax = x1; az = z1; bx = x0; bz = z1; }
            else                    { ha = h3; hb = h0; ax = x0; az = z1; bx = x0; bz = z0; }
            const t = (L - ha) / (hb - ha);
            return [ax + (bx - ax) * t, L, az + (bz - az) * t];
          };
          const addSeg = (eA: number, eB: number) => {
            const a = lerpEdge(eA);
            const b = lerpEdge(eB);
            segs.push([a[0], a[1], a[2], b[0], b[1], b[2]]);
          };

          switch (c) {
            case 1:  addSeg(3, 0); break;
            case 2:  addSeg(0, 1); break;
            case 3:  addSeg(3, 1); break;
            case 4:  addSeg(1, 2); break;
            case 5: {
              const center = (h0 + h1 + h2 + h3) * 0.25;
              if (center > L) { addSeg(3, 2); addSeg(0, 1); }
              else            { addSeg(3, 0); addSeg(1, 2); }
              break;
            }
            case 6:  addSeg(0, 2); break;
            case 7:  addSeg(3, 2); break;
            case 8:  addSeg(2, 3); break;
            case 9:  addSeg(2, 0); break;
            case 10: {
              const center = (h0 + h1 + h2 + h3) * 0.25;
              if (center > L) { addSeg(0, 3); addSeg(1, 2); }
              else            { addSeg(0, 1); addSeg(2, 3); }
              break;
            }
            case 11: addSeg(2, 1); break;
            case 12: addSeg(1, 3); break;
            case 13: addSeg(1, 0); break;
            case 14: addSeg(0, 3); break;
          }
        }
      }
    }
    return levels;
  }
}

/**
 * Chain raw segments (each `[x0,y0,z0,x1,y1,z1]`) into polylines by merging
 * shared endpoints. Returns each chain as a flat `[x,z, x,z, ...]` array
 * (y is constant per level, so we drop it for hashing). Mirrors the web
 * lab's chainSegments() — used so Skia can draw each contour as one
 * continuous quadratic spline.
 */
const keyOf = (x: number, z: number) =>
  Math.round(x * 100) + ',' + Math.round(z * 100);

export function chainSegments(segments: number[][]): number[][] {
  if (segments.length === 0) return [];
  const N = segments.length;
  const endpoints = new Map<string, number[]>();
  for (let i = 0; i < N; i++) {
    const s = segments[i];
    const k0 = keyOf(s[0], s[2]);
    const k1 = keyOf(s[3], s[5]);
    let list = endpoints.get(k0);
    if (!list) { list = []; endpoints.set(k0, list); }
    list.push(i << 1);
    list = endpoints.get(k1);
    if (!list) { list = []; endpoints.set(k1, list); }
    list.push((i << 1) | 1);
  }
  const visited = new Uint8Array(N);
  const chains: number[][] = [];
  for (let i = 0; i < N; i++) {
    if (visited[i]) continue;
    visited[i] = 1;
    const s = segments[i];
    const forward: number[] = [s[0], s[2], s[3], s[5]];

    let cx = s[3];
    let cz = s[5];
    while (true) {
      const cands = endpoints.get(keyOf(cx, cz));
      if (!cands) break;
      let nextSi = -1;
      let nextEnd = 0;
      for (let c = 0; c < cands.length; c++) {
        const si = cands[c] >> 1;
        if (visited[si]) continue;
        nextSi = si;
        nextEnd = cands[c] & 1;
        break;
      }
      if (nextSi < 0) break;
      visited[nextSi] = 1;
      const ns = segments[nextSi];
      if (nextEnd === 0) {
        forward.push(ns[3], ns[5]);
        cx = ns[3];
        cz = ns[5];
      } else {
        forward.push(ns[0], ns[2]);
        cx = ns[0];
        cz = ns[2];
      }
    }

    const back: number[] = [];
    let bx = s[0];
    let bz = s[2];
    while (true) {
      const cands = endpoints.get(keyOf(bx, bz));
      if (!cands) break;
      let nextSi = -1;
      let nextEnd = 0;
      for (let c = 0; c < cands.length; c++) {
        const si = cands[c] >> 1;
        if (visited[si]) continue;
        nextSi = si;
        nextEnd = cands[c] & 1;
        break;
      }
      if (nextSi < 0) break;
      visited[nextSi] = 1;
      const ns = segments[nextSi];
      if (nextEnd === 0) {
        back.push(ns[3], ns[5]);
        bx = ns[3];
        bz = ns[5];
      } else {
        back.push(ns[0], ns[2]);
        bx = ns[0];
        bz = ns[2];
      }
    }

    if (back.length === 0) {
      chains.push(forward);
    } else {
      const combined: number[] = [];
      for (let bi = back.length - 2; bi >= 0; bi -= 2) {
        combined.push(back[bi], back[bi + 1]);
      }
      for (let fi = 0; fi < forward.length; fi++) combined.push(forward[fi]);
      chains.push(combined);
    }
  }
  return chains;
}
