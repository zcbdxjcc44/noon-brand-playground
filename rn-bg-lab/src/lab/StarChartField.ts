/**
 * StarChartField — holds the working set for the current subject's
 * hand-authored star graph: per-star twinkle phases and per-edge breathing
 * phases (assigned once, stable across frames). Rebuilds only when the
 * subject changes; drift is derived from time in the renderer.
 *
 * TS port of the web lab's StarChartField.
 */

import { STAR_CHARTS } from './starcharts';
import type { LabConfig } from './types';

export interface FieldStar {
  x: number;
  y: number;
  z: number;
  anchor: boolean;
  twPhase: number;   // twinkle phase
  twRate: number;    // per-star twinkle rate
}

export interface FieldEdge {
  a: number;
  b: number;
  broken: boolean;
  brPhase: number;   // breathing phase
  brRate: number;    // breathing rate
  cut: number;       // how far a broken edge survives (0..1)
}

export class StarChartField {
  stars: FieldStar[] = [];
  edges: FieldEdge[] = [];
  subject: string | null = null;

  rebuild(config: LabConfig): void {
    const cfg = config.starchart;
    const chart = STAR_CHARTS[cfg.subject] || STAR_CHARTS.physics;

    this.stars = chart.stars.map(s => ({
      x: s.x, y: s.y, z: s.z,
      anchor: !!s.anchor,
      twPhase: Math.random() * Math.PI * 2,
      twRate: 0.45 + Math.random() * 0.65,
    }));

    this.edges = chart.edges.map(e => ({
      a: e.a, b: e.b,
      broken: !!e.broken,
      brPhase: Math.random() * Math.PI * 2,
      brRate: 0.55 + Math.random() * 0.5,
      cut: 0.42 + Math.random() * 0.36,
    }));

    this.subject = cfg.subject;
  }

  /** Cheap self-sync — rebuild when the subject changes. */
  sync(config: LabConfig): void {
    if (this.subject !== config.starchart.subject) this.rebuild(config);
  }
}
