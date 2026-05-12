/**
 * FacetedField — TS port of the web lab's irregular triangulated mesh.
 *
 * Maintains a regular grid where each vertex is jittered in (x, z) and each
 * cell has a random diagonal direction (BL-TR or BR-TL). Heights are sampled
 * AT the jittered positions so triangle planes match the rendered vertices
 * (no seams). Jitter + diagDir are persistent across height re-samples; only
 * grid resize or jitter-strength change regenerates them.
 */

import { noise, noise2 } from './noise';
import type { FacetedConfig, LabConfig } from './types';

export class FacetedField {
  terrainExtent = 1400;
  terrainDepth = 1100;
  heights: Float32Array | null = null;
  jitterX: Float32Array | null = null;
  jitterZ: Float32Array | null = null;
  /** Per cell: 0 = BL-TR diagonal, 1 = BR-TL. */
  diagDir: Uint8Array | null = null;
  cellsX = 0;
  cellsZ = 0;
  stepX = 0;
  stepZ = 0;
  private _jitterStrength = -1;

  ensureGrid(cfg: FacetedConfig): void {
    const cx = cfg.gridCellsX | 0;
    const cz = cfg.gridCellsZ | 0;
    const j = cfg.meshJitter != null ? cfg.meshJitter : 0;
    const sizeChanged = this.cellsX !== cx || this.cellsZ !== cz;
    const jitterChanged = this._jitterStrength !== j;
    if (!sizeChanged && !jitterChanged) return;
    this.cellsX = cx;
    this.cellsZ = cz;
    this.stepX = (this.terrainExtent * 2) / cx;
    this.stepZ = (this.terrainDepth * 2) / cz;
    const totalV = (cx + 1) * (cz + 1);
    if (sizeChanged) {
      this.heights = new Float32Array(totalV);
      this.diagDir = new Uint8Array(cx * cz);
      for (let d = 0; d < cx * cz; d++) {
        this.diagDir[d] = Math.random() < 0.5 ? 0 : 1;
      }
    }
    this.jitterX = new Float32Array(totalV);
    this.jitterZ = new Float32Array(totalV);
    for (let jj = 0; jj <= cz; jj++) {
      for (let ii = 0; ii <= cx; ii++) {
        const idx = jj * (cx + 1) + ii;
        const isBoundaryX = (ii === 0 || ii === cx);
        const isBoundaryZ = (jj === 0 || jj === cz);
        this.jitterX[idx] = isBoundaryX ? 0 : (Math.random() - 0.5) * j * this.stepX;
        this.jitterZ[idx] = isBoundaryZ ? 0 : (Math.random() - 0.5) * j * this.stepZ;
      }
    }
    this._jitterStrength = j;
  }

  sampleHeights(time: number, terrain: LabConfig['terrain']): void {
    if (!this.heights || !this.jitterX || !this.jitterZ) return;
    const cx = this.cellsX;
    const cz = this.cellsZ;
    const half = this.terrainExtent;
    const depth = this.terrainDepth;
    const scale = terrain.scale;
    const amp = terrain.amplitude;
    const sec = terrain.secondaryNoise;
    const driftZ = time * terrain.drift * 100;
    const h = this.heights;
    const jx = this.jitterX;
    const jz = this.jitterZ;
    let idx = 0;
    for (let j = 0; j <= cz; j++) {
      const zBase = -depth + j * this.stepZ;
      for (let i = 0; i <= cx; i++) {
        const xBase = -half + i * this.stepX;
        const x = xBase + jx[idx];
        const z = zBase + jz[idx];
        const n1 = noise(x * scale, (z + driftZ) * scale);
        const n2 = noise2(x * scale * 2.3, (z + driftZ) * scale * 2.3) * sec;
        h[idx++] = (n1 + n2 * 0.5) * amp;
      }
    }
  }

  vx(i: number, j: number): number {
    return -this.terrainExtent + i * this.stepX + this.jitterX![j * (this.cellsX + 1) + i];
  }
  vz(i: number, j: number): number {
    return -this.terrainDepth + j * this.stepZ + this.jitterZ![j * (this.cellsX + 1) + i];
  }
}
