/**
 * <GoldenLineSkia/> — Skia render for the golden trail.
 *
 * For step 2 we draw a single-color stroked path (not the per-segment alpha
 * ramp the web lab does) plus a head bloom. Good enough to read as a route
 * across the terrain; per-segment gradient stroke can be a later polish.
 */

import React, { useMemo } from 'react';
import {
  Circle,
  Group,
  Path,
  RadialGradient,
  Skia,
  vec,
} from '@shopify/react-native-skia';

import type { LabConfig } from './types';
import type { GoldenTrailPoint } from './GoldenLine';
import { project } from './projection';
import { noise } from './noise';

interface Props {
  trail: GoldenTrailPoint[];
  config: LabConfig;
  width: number;
  height: number;
  time: number;
}

function rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function GoldenLineSkia({ trail, config, width, height, time }: Props) {
  const g = config.goldenLine;

  // Project + path + head all in one memo (depends on time so recomputes per frame).
  const data = useMemo(() => {
    if (!g.enabled || trail.length < 2) return null;
    const view = config.view;
    const terrainScale = config.terrain.scale;
    const amp = config.terrain.amplitude;
    const driftZ = time * config.terrain.drift * 100;

    const path = Skia.Path.Make();
    let started = false;
    let lastSx = 0;
    let lastSy = 0;
    for (let i = 0; i < trail.length; i++) {
      const tp = trail[i];
      const n1 = noise(tp.x * terrainScale, (tp.z + driftZ) * terrainScale);
      const hY = n1 * amp + 6;
      const pr = project(tp.x, hY, tp.z, view, width, height);
      if (!pr) {
        started = false;
        continue;
      }
      if (!started) {
        path.moveTo(pr.sx, pr.sy);
        started = true;
      } else {
        path.lineTo(pr.sx, pr.sy);
      }
      lastSx = pr.sx;
      lastSy = pr.sy;
    }
    return { path, headX: lastSx, headY: lastSy, hasHead: started };
  }, [trail, config, width, height, time]);

  if (!data) return null;

  return (
    <Group>
      {/* Soft glow under the trail */}
      {g.glowRadius > 0 && (
        <Path
          path={data.path}
          style="stroke"
          strokeWidth={Math.max(2, g.glowRadius * 0.35)}
          color={rgba(g.color, 0.10)}
          strokeCap="round"
          strokeJoin="round"
        />
      )}
      {/* Main trail stroke */}
      <Path
        path={data.path}
        style="stroke"
        strokeWidth={g.width}
        color={rgba(g.color, 0.85)}
        strokeCap="round"
        strokeJoin="round"
      />
      {/* Head bloom — radial gradient via Circle */}
      {data.hasHead && g.glowRadius > 0 && (
        <Circle cx={data.headX} cy={data.headY} r={g.glowRadius}>
          <RadialGradient
            c={vec(data.headX, data.headY)}
            r={g.glowRadius}
            colors={[rgba(g.color, 0.55), rgba(g.color, 0.16), rgba(g.color, 0)]}
          />
        </Circle>
      )}
      {/* Bright dot at head tip */}
      {data.hasHead && (
        <Circle
          cx={data.headX}
          cy={data.headY}
          r={Math.max(1.5, g.width * 1.4)}
          color={rgba(g.color, 0.95)}
        />
      )}
    </Group>
  );
}
