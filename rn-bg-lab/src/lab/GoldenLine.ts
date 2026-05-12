/**
 * GoldenLine — TS port of the web lab's GoldenLine. Maintains a trail of
 * recent head positions on a parametric path (t ∈ [0, 1]) and exposes
 * getHead() so renderers and particle tint can look up the current tip.
 *
 * Path types match the web lab exactly: noise / sine / straight / curve.
 */

import { pathNoise } from './noise';
import type { GoldenLineConfig } from './types';

export interface GoldenTrailPoint {
  x: number;
  y: number;
  z: number;
  age: number;
}

export class GoldenLine {
  t = -0.05;
  trail: GoldenTrailPoint[] = [];
  maxTrail = 90;

  reset(): void {
    this.t = -0.05;
    this.trail = [];
  }

  pathPoint(t: number, time: number, type: GoldenLineConfig['pathType']): { x: number; y: number; z: number } {
    const W = 1300;
    const D = 900;
    let x: number;
    let z: number;
    if (type === 'straight') {
      x = (t - 0.5) * 2 * W;
      z = D * 0.2 * Math.sin(time * 0.05);
    } else if (type === 'sine') {
      x = (t - 0.5) * 2 * W;
      z = Math.sin(t * Math.PI * 2 + time * 0.1) * D * 0.6;
    } else if (type === 'curve') {
      x = (t - 0.5) * 2 * W;
      z = Math.sin(t * Math.PI * 1.5) * D * 0.45 + Math.cos(time * 0.08) * 100;
    } else {
      // 'noise'
      x = (t - 0.5) * 2 * W;
      z = pathNoise(t * 2.5, time * 0.05) * D * 0.7;
    }
    return { x, y: 0, z };
  }

  update(dt: number, time: number, config: GoldenLineConfig): void {
    if (!config.enabled) return;
    this.t += dt * config.speed * 0.3;
    if (this.t > 1.05) this.t = -0.05;
    const head = this.pathPoint(this.t, time, config.pathType);
    this.trail.push({ x: head.x, y: head.y, z: head.z, age: 0 });
    if (this.trail.length > this.maxTrail) this.trail.shift();
    for (const p of this.trail) p.age += dt;
  }

  getHead(): GoldenTrailPoint | null {
    if (this.trail.length === 0) return null;
    return this.trail[this.trail.length - 1];
  }
}
