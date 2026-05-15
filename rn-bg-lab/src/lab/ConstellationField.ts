/**
 * ConstellationField — particle swarm that aggregates into a subject's
 * 3D point cloud. Each particle springs toward a (Y-swirled) target with
 * gentle 3D wander. Self-syncs: rebuilds on count change, retargets on
 * subject change. TS port of the web lab's ConstellationField.
 *
 * Has per-frame physics, so the owning component (Lab) drives `update()`
 * from the RAF tick — same pattern as GoldenLine.
 */

import { buildSubjectCloud } from './subjects';
import type { LabConfig } from './types';

export interface ConstellationParticle {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  tx: number; ty: number; tz: number;
  colorT: number;
  sizeT: number;
  driftPhase: number;
  driftPhase2: number;
  driftPhase3: number;
}

export class ConstellationField {
  particles: ConstellationParticle[] = [];
  subject: string | null = null;
  transitionT = 1;

  rebuild(config: LabConfig): void {
    const cfg = config.constellation;
    const count = Math.max(50, cfg.count | 0);
    const cloud = buildSubjectCloud(cfg.subject, count);
    const particles: ConstellationParticle[] = new Array(count);
    for (let i = 0; i < count; i++) {
      const tgt = cloud[i];
      particles[i] = {
        x: (Math.random() - 0.5) * 2.4,
        y: (Math.random() - 0.5) * 2.4,
        z: (Math.random() - 0.5) * 2.4,
        vx: 0, vy: 0, vz: 0,
        tx: tgt[0], ty: tgt[1], tz: tgt[2],
        colorT: Math.random(),
        sizeT: Math.random(),
        driftPhase: Math.random() * Math.PI * 2,
        driftPhase2: Math.random() * Math.PI * 2,
        driftPhase3: Math.random() * Math.PI * 2,
      };
    }
    this.particles = particles;
    this.subject = cfg.subject;
    this.transitionT = 0;
  }

  retarget(config: LabConfig): void {
    const cfg = config.constellation;
    const count = this.particles.length;
    const cloud = buildSubjectCloud(cfg.subject, count);
    for (let i = 0; i < count; i++) {
      const tgt = cloud[i % cloud.length];
      this.particles[i].tx = tgt[0];
      this.particles[i].ty = tgt[1];
      this.particles[i].tz = tgt[2];
    }
    this.subject = cfg.subject;
    this.transitionT = 0;
  }

  update(dt: number, time: number, config: LabConfig): void {
    const cfg = config.constellation;
    // Self-sync: rebuild on count change, retarget on subject change.
    if (this.particles.length !== (cfg.count | 0)) {
      this.rebuild(config);
    } else if (this.subject !== cfg.subject) {
      this.retarget(config);
    }

    this.transitionT = Math.min(1, this.transitionT + dt * 0.7);
    const tight = cfg.tightness;
    const driftAmt = cfg.drift;
    // Swirl spins the target cloud around the vertical (Y) axis.
    const swirlAngle = time * cfg.swirlSpeed * 0.5;
    const cs = Math.cos(swirlAngle);
    const sn = Math.sin(swirlAngle);
    const damping = 0.86;
    // Looser spring during transition so particles re-aggregate gracefully.
    const k = tight * (0.35 + 0.65 * this.transitionT);

    for (const p of this.particles) {
      const rtx = p.tx * cs + p.tz * sn;
      const rtz = -p.tx * sn + p.tz * cs;
      const rty = p.ty;
      p.vx += (rtx - p.x) * k;
      p.vy += (rty - p.y) * k;
      p.vz += (rtz - p.z) * k;
      p.vx += Math.sin(time * 1.30 + p.driftPhase) * driftAmt * 0.0016;
      p.vy += Math.cos(time * 1.07 + p.driftPhase2) * driftAmt * 0.0016;
      p.vz += Math.sin(time * 1.19 + p.driftPhase3) * driftAmt * 0.0016;
      p.vx *= damping;
      p.vy *= damping;
      p.vz *= damping;
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
    }
  }
}
