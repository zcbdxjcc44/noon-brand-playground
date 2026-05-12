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
import {
  Group,
  Path,
  Skia,
  Text as SkiaText,
  useFont,
} from '@shopify/react-native-skia';
import type { SkPath } from '@shopify/react-native-skia';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';

import type { LabConfig } from './types';
import { ContourField, chainSegments } from './ContourField';
import { project } from './projection';
import { noise, noise2 } from './noise';
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

  // Label font — one fixed size; we approximate centering via offsets.
  const labelFont = useFont(JetBrainsMono_400Regular, 10);

  const { paths, fg, annotation } = useMemo(() => {
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
    return { paths: out, fg: palette.fgRGB, annotation: palette.annotation };
  }, [config, width, height, time, field]);

  // Elevation labels — anchored to fixed world points, quantised so the
  // displayed number doesn't tick every frame, screen-space-spacing filter
  // so the horizon band doesn't crowd up with labels.
  const labels = useMemo(() => {
    if (!labelFont) return [];
    const cfg = config.contours;
    const density = cfg.annotationDensity;
    if (density < 0.005) return [];

    const view = config.view;
    const amp = config.terrain.amplitude;
    const scale = config.terrain.scale;
    const secondaryNoise = config.terrain.secondaryNoise;
    const driftZ = time * config.terrain.drift * 100;
    const binSize = Math.max(5, Math.round(amp * 0.1));
    const annotSize = cfg.annotationSize;
    const minSpacing = annotSize * 5.5;
    const minSpacing2 = minSpacing * minSpacing;

    const slots = field.annotSlots;
    const maxLabels = Math.ceil(slots.length * density);
    const placed: Array<{ sx: number; sy: number; text: string }> = [];

    for (let i = 0; i < slots.length; i++) {
      if (placed.length >= maxLabels) break;
      const slot = slots[i];
      const n1 = noise(slot.worldX * scale, (slot.worldZ + driftZ) * scale);
      const n2 = noise2(slot.worldX * scale * 2.3, (slot.worldZ + driftZ) * scale * 2.3) * secondaryNoise;
      const hY = (n1 + n2 * 0.5) * amp;
      const pr = project(slot.worldX, hY, slot.worldZ, view, width, height);
      if (!pr) continue;
      if (pr.sx < 0 || pr.sx > width || pr.sy < 0 || pr.sy > height) continue;

      // Reject if too close to a label already placed.
      let tooClose = false;
      for (let k = 0; k < placed.length; k++) {
        const dx = pr.sx - placed[k].sx;
        const dy = pr.sy - placed[k].sy;
        if (dx * dx + dy * dy < minSpacing2) { tooClose = true; break; }
      }
      if (tooClose) continue;

      const elev = Math.round(hY / binSize) * binSize;
      const text = (elev >= 0 ? '+' : '') + elev;
      placed.push({ sx: pr.sx, sy: pr.sy, text });
    }
    return placed;
  }, [config, width, height, time, field, labelFont]);

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
      {labelFont && labels.map((l, i) => (
        <SkiaText
          key={'l' + i}
          x={l.sx - l.text.length * 2.8}
          y={l.sy + 3}
          text={l.text}
          font={labelFont}
          color={annotation}
        />
      ))}
    </Group>
  );
}
