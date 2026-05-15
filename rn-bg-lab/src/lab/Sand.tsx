/**
 * <Sand/> — Skia renderer for the 'sand' style.
 *
 * Reads the live SandField (physics driven from Lab's RAF tick), projects
 * every grain, then buckets by quantised size + colour so the whole field
 * draws as a few dozen <Points/> calls. Each grain's colour blends across
 * the palette by its colorT; near grains lift brighter.
 *
 * Port of drawSand() from noon-bg-lab.html.
 */

import React, { useMemo } from 'react';
import { Group, Points, vec } from '@shopify/react-native-skia';

import type { LabConfig } from './types';
import { SandField } from './SandField';
import { project } from './projection';
import { SAND_PALETTES, hexToRgb } from './charsets';

interface Props {
  config: LabConfig;
  field: SandField;
  width: number;
  height: number;
  time: number;
}

const SIZE_BIN = 1.0;
const COL_BIN = 26;

export default function Sand({ config, field, width, height, time }: Props) {
  const buckets = useMemo(() => {
    const cfg = config.sand;
    if (field.grains.length === 0) field.rebuild(config);

    const view = config.view;
    const pal = SAND_PALETTES[cfg.palette] || SAND_PALETTES.Dune;
    const cShadow = hexToRgb(pal.shadow);
    const cMid = hexToRgb(pal.mid);
    const cLit = hexToRgb(pal.lit);
    const cSpeck = hexToRgb(pal.speckle);
    const S = cfg.worldScale;
    const depthScale = cfg.depthScale != null ? cfg.depthScale : 1;
    const gs = cfg.grainSize;

    interface Bucket { size: number; r: number; g: number; b: number; pts: ReturnType<typeof vec>[] }
    const map = new Map<string, Bucket>();

    for (const grain of field.grains) {
      const pr = project(grain.x * S, grain.y * S, grain.z * S * depthScale, view, width, height);
      if (!pr) continue;
      if (pr.sx < -40 || pr.sx > width + 40 || pr.sy < -40 || pr.sy > height + 40) continue;
      const size = (0.5 + grain.sizeT) * gs * Math.min(2.2, 420 / pr.depth);
      if (size < 0.4) continue;

      // colour blends across the palette tones by colorT
      const ct = grain.colorT;
      let r: number, g: number, b: number;
      if (ct < 0.5) {
        const t = ct / 0.5;
        r = cShadow.r + (cMid.r - cShadow.r) * t;
        g = cShadow.g + (cMid.g - cShadow.g) * t;
        b = cShadow.b + (cMid.b - cShadow.b) * t;
      } else if (ct < 0.85) {
        const t = (ct - 0.5) / 0.35;
        r = cMid.r + (cLit.r - cMid.r) * t;
        g = cMid.g + (cLit.g - cMid.g) * t;
        b = cMid.b + (cLit.b - cMid.b) * t;
      } else {
        const t = (ct - 0.85) / 0.15;
        r = cLit.r + (cSpeck.r - cLit.r) * t;
        g = cLit.g + (cSpeck.g - cLit.g) * t;
        b = cLit.b + (cSpeck.b - cLit.b) * t;
      }
      // near grains lift brighter
      const lift = Math.min(0.35, 60 / pr.depth);
      r = r + (255 - r) * lift;
      g = g + (255 - g) * lift;
      b = b + (255 - b) * lift;

      const sBin = Math.max(1, Math.round(size / SIZE_BIN));
      const rB = Math.round(r / COL_BIN);
      const gB = Math.round(g / COL_BIN);
      const bB = Math.round(b / COL_BIN);
      const key = sBin + ':' + rB + ':' + gB + ':' + bB;
      let bk = map.get(key);
      if (!bk) {
        bk = {
          size: sBin * SIZE_BIN,
          r: Math.min(255, rB * COL_BIN),
          g: Math.min(255, gB * COL_BIN),
          b: Math.min(255, bB * COL_BIN),
          pts: [],
        };
        map.set(key, bk);
      }
      bk.pts.push(vec(pr.sx, pr.sy));
    }
    return Array.from(map.values());
  }, [config, width, height, time, field]);

  return (
    <Group>
      {buckets.map((b, i) => (
        <Points
          key={i}
          points={b.pts}
          mode="points"
          style="stroke"
          strokeCap="round"
          strokeWidth={b.size}
          color={`rgb(${b.r},${b.g},${b.b})`}
        />
      ))}
    </Group>
  );
}
