/**
 * SandField — sand grains belong to "regions" (the subject's primitives).
 * Every grain glides at a steady slow pace toward a waypoint inside its
 * region; on arrival it picks the NEAREST of a few region samples so each
 * hop is short and hugs the region's surface (keeps thin features crisp).
 * No momentum → no jumps, no orbital swirl — a calm continuous flow.
 *
 * Subject switch: grains keep their position but reassign to a region of
 * the new subject and aim at a loose central blob (gather), then on-arrival
 * resampling sends them out to re-form the new shape (disperse). The whole
 * transition runs at a fixed brisk pace and completes within ~1.5s.
 *
 * Has per-frame physics, so the owning component (Lab) drives `update()`
 * from the RAF tick — same pattern as ConstellationField. TS port of the
 * web lab's SandField.
 */

import { SUBJECTS, samplePrimitive } from './subjects';
import type { Primitive } from './subjects';
import type { LabConfig } from './types';

interface SandRegion {
  prim: Primitive;
  cx: number;
  cy: number;
  cz: number;
  w: number;
}

interface SandGrain {
  x: number; y: number; z: number;
  tx: number; ty: number; tz: number;
  region: number;
  speed: number;
  sizeT: number;
  colorT: number;
}

export class SandField {
  grains: SandGrain[] = [];
  regions: SandRegion[] = [];
  subject: string | null = null;
  gatherUntil = 0;   // during a subject switch: gather-phase end time

  // Region = one of the subject's primitives, with its centroid.
  buildRegions(subjectKey: string): SandRegion[] {
    const subj = SUBJECTS[subjectKey] || SUBJECTS.math;
    return subj.primitives.map(p => {
      let cx: number, cy: number, cz: number;
      if (p.kind === 'bar3d') {
        cx = ((p.x1 || 0) + (p.x2 || 0)) * 0.5;
        cy = ((p.y1 || 0) + (p.y2 || 0)) * 0.5;
        cz = ((p.z1 || 0) + (p.z2 || 0)) * 0.5;
      } else if (p.kind === 'quad3d' && p.pts) {
        cx = (p.pts[0][0] + p.pts[1][0] + p.pts[2][0] + p.pts[3][0]) * 0.25;
        cy = (p.pts[0][1] + p.pts[1][1] + p.pts[2][1] + p.pts[3][1]) * 0.25;
        cz = (p.pts[0][2] + p.pts[1][2] + p.pts[2][2] + p.pts[3][2]) * 0.25;
      } else {
        cx = p.cx || 0; cy = p.cy || 0; cz = p.cz || 0;
      }
      return { prim: p, cx, cy, cz, w: p.w };
    });
  }

  private pickRegion(regions: SandRegion[], totalW: number): number {
    let rr = Math.random() * totalW;
    for (let k = 0; k < regions.length; k++) {
      rr -= regions[k].w;
      if (rr <= 0) return k;
    }
    return 0;
  }

  rebuild(config: LabConfig): void {
    const cfg = config.sand;
    const count = Math.max(200, cfg.grainCount | 0);
    this.regions = this.buildRegions(cfg.subject);
    const regions = this.regions;
    let totalW = 0;
    for (const r of regions) totalW += r.w;

    const grains: SandGrain[] = new Array(count);
    for (let i = 0; i < count; i++) {
      const ri = this.pickRegion(regions, totalW);
      const p0 = samplePrimitive(regions[ri].prim);
      grains[i] = {
        x: p0[0], y: p0[1], z: p0[2],
        tx: p0[0], ty: p0[1], tz: p0[2],
        region: ri,
        speed: 0.7 + Math.random() * 0.6,
        sizeT: Math.random(),
        colorT: Math.random(),
      };
    }
    this.grains = grains;
    this.subject = cfg.subject;
    this.gatherUntil = 0;
  }

  retarget(config: LabConfig, time: number): void {
    const cfg = config.sand;
    this.regions = this.buildRegions(cfg.subject);
    const regions = this.regions;
    let totalW = 0;
    for (const r of regions) totalW += r.w;
    for (const g of this.grains) {
      g.region = this.pickRegion(regions, totalW);
      g.tx = (Math.random() - 0.5) * 0.7;
      g.ty = (Math.random() - 0.5) * 0.7;
      g.tz = (Math.random() - 0.5) * 0.7;
    }
    this.subject = cfg.subject;
    this.gatherUntil = time + 0.6;   // gather phase length
  }

  update(dt: number, time: number, config: LabConfig): void {
    const cfg = config.sand;
    if (this.grains.length !== Math.max(200, cfg.grainCount | 0)) {
      this.rebuild(config);
    } else if (this.subject !== cfg.subject) {
      this.retarget(config, time);
    }
    const regions = this.regions;
    const spread = cfg.spread;
    const flow = cfg.flowSpeed;
    const gathering = time < this.gatherUntil;
    // gather + disperse transition completes within ~1.5s of the switch,
    // at a fixed brisk pace (independent of Flow Speed)
    const transitioning = time < this.gatherUntil + 0.9;

    for (const g of this.grains) {
      let dx = g.tx - g.x, dy = g.ty - g.y, dz = g.tz - g.z;
      let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 0.04) {
        if (gathering) {
          g.tx = (Math.random() - 0.5) * 0.7;
          g.ty = (Math.random() - 0.5) * 0.7;
          g.tz = (Math.random() - 0.5) * 0.7;
        } else {
          // nearest of a few region samples → short region-hugging hops
          const r = regions[g.region];
          let bx = 0, by = 0, bz = 0, bd = Infinity;
          for (let s = 0; s < 5; s++) {
            const p = samplePrimitive(r.prim);
            const cxp = r.cx + (p[0] - r.cx) * spread;
            const cyp = r.cy + (p[1] - r.cy) * spread;
            const czp = r.cz + (p[2] - r.cz) * spread;
            const ddx = cxp - g.x, ddy = cyp - g.y, ddz = czp - g.z;
            const d2 = ddx * ddx + ddy * ddy + ddz * ddz;
            if (d2 < bd) { bd = d2; bx = cxp; by = cyp; bz = czp; }
          }
          g.tx = bx; g.ty = by; g.tz = bz;
        }
        dx = g.tx - g.x; dy = g.ty - g.y; dz = g.tz - g.z;
        dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      }
      if (dist > 1e-5) {
        const stepRate = transitioning ? (2.0 * g.speed) : (flow * g.speed * 0.5);
        const step = Math.min(dist, stepRate * dt);
        const f = step / dist;
        g.x += dx * f; g.y += dy * f; g.z += dz * f;
      }
    }
  }
}
