/**
 * <StarChart/> — Skia rendering for the 'starchart' style.
 *
 * The current subject's hand-authored star graph, drawn as a quiet
 * navigation diagram: hairline connectors (some incomplete, dissolving
 * into the dark), restrained star points, a few brighter anchor stars.
 * Edges breathe; anchors twinkle. The whole graph drifts very slowly
 * around the vertical axis. Stateless per-frame — drift comes from time.
 *
 * Port of drawStarChart() from noon-bg-lab.html.
 */

import React, { useMemo, useRef } from 'react';
import {
  Circle,
  Group,
  Line,
  LinearGradient,
  RadialGradient,
  vec,
} from '@shopify/react-native-skia';

import type { LabConfig, ScreenPoint } from './types';
import { StarChartField } from './StarChartField';
import { project } from './projection';
import { STARCHART_LINE_COLORS, STARCHART_STAR_COLORS, hexToRgb } from './charsets';

interface Props {
  config: LabConfig;
  width: number;
  height: number;
  time: number;
}

interface EdgeOut {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  alpha: number;
  broken: boolean;
}

interface StarOut {
  sx: number;
  sy: number;
  size: number;
  alpha: number;
  anchor: boolean;
}

export default function StarChart({ config, width, height, time }: Props) {
  // Field is mutable and owned by this component — useRef survives re-renders.
  const fieldRef = useRef<StarChartField | null>(null);
  if (!fieldRef.current) fieldRef.current = new StarChartField();
  const field = fieldRef.current;

  const scene = useMemo(() => {
    const cfg = config.starchart;
    field.sync(config);

    const view = config.view;
    const S = cfg.worldScale;
    const depthScale = cfg.depthScale != null ? cfg.depthScale : 1;
    const drift = time * cfg.driftSpeed * 0.5;
    const cd = Math.cos(drift);
    const sd = Math.sin(drift);
    // a barely-there vertical bob so the chart never feels frozen
    const bob = Math.sin(time * 0.18) * 0.015;
    const master = cfg.brightness;

    const lineRgb = hexToRgb(STARCHART_LINE_COLORS[cfg.lineColor] || STARCHART_LINE_COLORS.Silver);
    const starRgb = hexToRgb(STARCHART_STAR_COLORS[cfg.starColor] || STARCHART_STAR_COLORS['Warm White']);

    // project every star once
    const P: (ScreenPoint | null)[] = field.stars.map(s => {
      const rx = s.x * cd + s.z * sd;
      const rz = -s.x * sd + s.z * cd;
      return project(rx * S, (s.y + bob) * S, rz * S * depthScale, view, width, height);
    });

    // edges (hairlines)
    const edges: EdgeOut[] = [];
    for (const e of field.edges) {
      const a = P[e.a];
      const b = P[e.b];
      if (!a || !b) continue;

      // breathing — a slow sine, never fully off so the structure persists
      const breathe = 0.5 + 0.5 * Math.sin(time * e.brRate * 0.6 + e.brPhase);
      const edgeAlpha = master * (0.14 + breathe * (0.10 + cfg.breathing * 0.5));
      if (edgeAlpha < 0.004) continue;

      // a broken edge stops partway and dissolves
      let ex = b.sx;
      let ey = b.sy;
      if (e.broken) {
        const cut = Math.max(0.18, e.cut - cfg.brokenness * 0.34);
        ex = a.sx + (b.sx - a.sx) * cut;
        ey = a.sy + (b.sy - a.sy) * cut;
      }
      edges.push({ ax: a.sx, ay: a.sy, bx: ex, by: ey, alpha: edgeAlpha, broken: e.broken });
    }

    // stars
    const stars: StarOut[] = [];
    for (let i = 0; i < field.stars.length; i++) {
      const p = P[i];
      if (!p) continue;
      if (p.sx < -40 || p.sx > width + 40 || p.sy < -40 || p.sy > height + 40) continue;
      const s = field.stars[i];
      const dscale = 420 / p.depth;
      let size = (s.anchor ? cfg.anchorSize : cfg.starSize) * dscale;

      // twinkle — subtle, slow; anchors twinkle more than plain stars
      const tw = Math.sin(time * s.twRate * 0.5 + s.twPhase);
      const twAmt = s.anchor ? cfg.twinkle : cfg.twinkle * 0.35;
      const twMul = 1 + tw * twAmt * 0.5;
      size *= twMul;
      if (size < 0.25) continue;

      const aBase = s.anchor ? 0.95 : 0.52;
      const alpha = Math.min(1, master * aBase * (0.82 + 0.18 * twMul));
      stars.push({ sx: p.sx, sy: p.sy, size, alpha, anchor: s.anchor });
    }

    return {
      edges,
      stars,
      lineRgb,
      starRgb,
      lineWidth: cfg.lineWidth,
      lineGlow: cfg.lineGlow,
    };
  }, [config, width, height, time, field]);

  const { edges, stars, lineRgb, starRgb, lineWidth, lineGlow } = scene;
  const lc = (al: number) =>
    `rgba(${lineRgb.r},${lineRgb.g},${lineRgb.b},${Math.max(0, al).toFixed(3)})`;
  const sc = (al: number) =>
    `rgba(${starRgb.r},${starRgb.g},${starRgb.b},${Math.max(0, al).toFixed(3)})`;

  return (
    <Group>
      {/* edges — drawn first, beneath the stars */}
      {edges.map((e, i) => (
        <Group key={'e' + i}>
          {lineGlow > 0.01 && (
            <Line
              p1={vec(e.ax, e.ay)}
              p2={vec(e.bx, e.by)}
              strokeWidth={lineWidth * 3.0}
              style="stroke"
              strokeCap="round"
              color={lc(e.alpha * lineGlow * 0.7)}
            />
          )}
          <Line
            p1={vec(e.ax, e.ay)}
            p2={vec(e.bx, e.by)}
            strokeWidth={lineWidth}
            style="stroke"
            strokeCap="round"
          >
            <LinearGradient
              start={vec(e.ax, e.ay)}
              end={vec(e.bx, e.by)}
              colors={[
                lc(e.alpha * 0.32),
                lc(e.alpha),
                lc(e.alpha * (e.broken ? 0.5 : 0.92)),
                lc(e.broken ? 0 : e.alpha * 0.42),
              ]}
              positions={[0, 0.2, 0.74, 1]}
            />
          </Line>
        </Group>
      ))}

      {/* stars */}
      {stars.map((s, i) => (
        <Group key={'s' + i}>
          {s.anchor && (
            <Circle cx={s.sx} cy={s.sy} r={s.size * 3.6}>
              <RadialGradient
                c={vec(s.sx, s.sy)}
                r={s.size * 3.6}
                colors={[sc(s.alpha * 0.26), sc(s.alpha * 0.09), sc(0)]}
                positions={[0, 0.5, 1]}
              />
            </Circle>
          )}
          <Circle cx={s.sx} cy={s.sy} r={s.size} color={sc(s.alpha)} />
          {s.anchor && (
            <Circle
              cx={s.sx}
              cy={s.sy}
              r={s.size * 0.42}
              color={`rgba(255,255,255,${Math.min(0.9, s.alpha * 0.8).toFixed(3)})`}
            />
          )}
        </Group>
      ))}
    </Group>
  );
}
