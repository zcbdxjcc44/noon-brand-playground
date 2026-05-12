/**
 * <Contours/> — Skia rendering for the 'contours' style.
 *
 * Per frame: sample heights, run marching squares, chain segments into
 * polylines, project, draw each chain as a quadratic-midpoint spline
 * (Skia Path.quadTo) — same smoothing trick as the web lab so cells
 * boundaries don't show as kinks.
 *
 * Annotation labels are deferred until we have a bundled font; the
 * rank-based alpha gradient + peak-thicker line still works without text.
 */

import React, { useMemo, useRef } from 'react';
import { Group, Path, Skia } from '@shopify/react-native-skia';
import type { SkPath } from '@shopify/react-native-skia';

import type { LabConfig } from './types';
import { ContourField, chainSegments } from './ContourField';
import { project } from './projection';
import { PALETTES } from './charsets';

interface Props {
  config: LabConfig;
  width: number;
  height: number;
  time: number;
}

export default function Contours({ config, width, height, time }: Props) {
  // ContourField is mutable and owned by this component — useRef survives
  // re-renders.
  const fieldRef = useRef<ContourField | null>(null);
  if (!fieldRef.current) fieldRef.current = new ContourField();
  const field = fieldRef.current;

  const { paths, fg } = useMemo(() => {
    const cfg = config.contours;
    field.ensureGrid(cfg);
    field.sampleHeights(time, config.terrain);
    const levels = field.buildContours(cfg, config.terrain);

    const view = config.view;
    const palette = PALETTES[config.palette];
    const N = levels.length;
    const peakOp = cfg.peakOpacity;
    const baseOp = cfg.baseOpacity;
    const falloff = Math.max(0.1, cfg.falloff);

    const out: Array<{
      path: SkPath;
      alpha: number;
      strokeWidth: number;
    }> = [];

    for (let li = 0; li < N; li++) {
      const level = levels[li];
      const rank = N > 1 ? li / (N - 1) : 1;
      const curved = Math.pow(rank, falloff);
      const alpha = baseOp + (peakOp - baseOp) * curved;
      if (alpha < 0.01) continue;

      const chains = chainSegments(level.segments);
      if (chains.length === 0) continue;

      const yL = level.elev;
      const path = Skia.Path.Make();
      let appended = false;

      for (let ci = 0; ci < chains.length; ci++) {
        const chain = chains[ci];
        const pcount = chain.length >> 1;
        if (pcount < 2) continue;

        // Project all points first; null projection breaks the subpath.
        const pts: Array<{ sx: number; sy: number } | null> = new Array(pcount);
        let minSx = Infinity;
        let maxSx = -Infinity;
        let minSy = Infinity;
        let maxSy = -Infinity;
        for (let p = 0; p < pcount; p++) {
          const wx = chain[p * 2];
          const wz = chain[p * 2 + 1];
          const pr = project(wx, yL, wz, view, width, height);
          pts[p] = pr ? { sx: pr.sx, sy: pr.sy } : null;
          if (pr) {
            if (pr.sx < minSx) minSx = pr.sx;
            if (pr.sx > maxSx) maxSx = pr.sx;
            if (pr.sy < minSy) minSy = pr.sy;
            if (pr.sy > maxSy) maxSy = pr.sy;
          }
        }
        if (maxSx < -200 || minSx > width + 200 || maxSy < -200 || minSy > height + 200) continue;

        // Smooth quadratic spline through midpoints (web lab's strokeSmoothChainPath).
        let started = false;
        for (let p = 0; p < pcount; p++) {
          const cur = pts[p];
          if (!cur) { started = false; continue; }
          if (!started) {
            path.moveTo(cur.sx, cur.sy);
            started = true;
            continue;
          }
          const next = p + 1 < pcount ? pts[p + 1] : null;
          if (next) {
            const mx = (cur.sx + next.sx) * 0.5;
            const my = (cur.sy + next.sy) * 0.5;
            path.quadTo(cur.sx, cur.sy, mx, my);
          } else {
            path.lineTo(cur.sx, cur.sy);
          }
        }
        appended = true;
      }

      if (appended) {
        out.push({
          path,
          alpha,
          strokeWidth: cfg.lineWidth * (0.75 + curved * 0.7),
        });
      }
    }
    return { paths: out, fg: palette.fgRGB };
  }, [config, width, height, time, field]);

  return (
    <Group>
      {paths.map((p, i) => (
        <Path
          key={i}
          path={p.path}
          style="stroke"
          strokeWidth={p.strokeWidth}
          color={`rgba(${fg[0]},${fg[1]},${fg[2]},${p.alpha.toFixed(3)})`}
          strokeCap="round"
          strokeJoin="round"
        />
      ))}
    </Group>
  );
}
