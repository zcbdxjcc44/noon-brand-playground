/**
 * <Constellation/> — Skia renderer for the 'constellation' style.
 *
 * Reads the live ConstellationField (physics driven from Lab's RAF tick),
 * projects every particle, then buckets by palette-colour + quantised size
 * so the whole swarm draws as a few dozen <Points/> calls. Glow mode adds
 * an additive (blendMode="plus") halo + core pass to bloom dense regions.
 *
 * Port of drawConstellation() from noon-bg-lab.html.
 */

import React, { useMemo } from 'react';
import { Group, Points, vec } from '@shopify/react-native-skia';

import type { LabConfig } from './types';
import { ConstellationField } from './ConstellationField';
import { project } from './projection';
import { CONSTELLATION_PALETTES } from './subjects';
import { hexToRgb } from './charsets';

interface Props {
  config: LabConfig;
  field: ConstellationField;
  width: number;
  height: number;
  time: number;
}

const SIZE_BIN = 1.5;

export default function Constellation({ config, field, width, height, time }: Props) {
  const scene = useMemo(() => {
    const cfg = config.constellation;
    if (field.particles.length === 0) field.rebuild(config);

    const view = config.view;
    const palette = CONSTELLATION_PALETTES[cfg.palette] || CONSTELLATION_PALETTES.Aurora;
    const palRgb = palette.map(hexToRgb);
    const S = cfg.worldScale;
    const depthScale = cfg.depthScale != null ? cfg.depthScale : 1;
    const sizeMin = cfg.sizeMin;
    const sizeMax = cfg.sizeMax;

    // bucket by colour index + quantised size → a handful of <Points/> calls
    interface Bucket { ci: number; size: number; pts: ReturnType<typeof vec>[] }
    const map = new Map<string, Bucket>();
    for (const p of field.particles) {
      const pr = project(p.x * S, p.y * S, p.z * S * depthScale, view, width, height);
      if (!pr) continue;
      if (pr.sx < -60 || pr.sx > width + 60 || pr.sy < -60 || pr.sy > height + 60) continue;
      const size = (sizeMin + (sizeMax - sizeMin) * p.sizeT) * (450 / pr.depth);
      if (size < 0.6) continue;
      let ci = (p.colorT * palRgb.length) | 0;
      if (ci >= palRgb.length) ci = 0;
      const sBin = Math.max(1, Math.round(size / SIZE_BIN));
      const key = ci + ':' + sBin;
      let b = map.get(key);
      if (!b) {
        b = { ci, size: sBin * SIZE_BIN, pts: [] };
        map.set(key, b);
      }
      b.pts.push(vec(pr.sx, pr.sy));
    }

    return { buckets: Array.from(map.values()), palRgb, glow: cfg.glow };
  }, [config, width, height, time, field]);

  const { buckets, palRgb, glow } = scene;

  if (glow > 0.005) {
    // Additive bloom — a wide soft halo pass + a tighter bright core pass.
    const groupOpacity = 0.35 + glow * 0.55;
    return (
      <Group blendMode="plus" opacity={groupOpacity}>
        {buckets.map((b, i) => {
          const c = palRgb[b.ci];
          return (
            <Points
              key={'h' + i}
              points={b.pts}
              mode="points"
              style="stroke"
              strokeCap="round"
              strokeWidth={b.size * (1.0 + glow * 1.8)}
              color={`rgba(${c.r},${c.g},${c.b},0.40)`}
            />
          );
        })}
        {buckets.map((b, i) => {
          const c = palRgb[b.ci];
          return (
            <Points
              key={'c' + i}
              points={b.pts}
              mode="points"
              style="stroke"
              strokeCap="round"
              strokeWidth={b.size * 0.85}
              color={`rgba(${c.r},${c.g},${c.b},0.95)`}
            />
          );
        })}
      </Group>
    );
  }

  // Flat crisp dots.
  return (
    <Group>
      {buckets.map((b, i) => {
        const c = palRgb[b.ci];
        return (
          <Points
            key={i}
            points={b.pts}
            mode="points"
            style="stroke"
            strokeCap="round"
            strokeWidth={b.size}
            color={`rgb(${c.r},${c.g},${c.b})`}
          />
        );
      })}
    </Group>
  );
}
