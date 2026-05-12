/**
 * <Particles/> — Skia renderer for the 'particles' style.
 *
 * Static frame (time=0 by default) for step 1. The math mirrors the web
 * lab's drawParticles() — same noise, same projection, same brightness +
 * twinkle formulas. Once the golden-line/animation pass lands we'll feed
 * a moving time value here.
 *
 * Perf: ~1.5k particles render fine on a recent device. For larger
 * counts we should batch via <Atlas>/<Glyphs>; until then individual
 * <Text> per particle keeps the diff vs web minimal.
 */

import React, { useMemo } from 'react';
import { Group, Points, vec } from '@shopify/react-native-skia';

import type { LabConfig } from './types';
import type { GoldenTrailPoint } from './GoldenLine';
import { buildParticleField } from './ParticleField';
import { noise, noise2 } from './noise';
import { project } from './projection';
import { PALETTES, PARTICLE_COLORS } from './charsets';

interface ParticlesProps {
  config: LabConfig;
  width: number;
  height: number;
  /** Clock in seconds. Drives drift, twinkle, and golden-tint distance. */
  time?: number;
  /** Current head of the golden line (world coords) for the local gold tint. */
  goldenHead?: GoldenTrailPoint | null;
}

/* Skia's matchFont on web has no system font registry, so the character-
 * glyph render is temporarily replaced with filled circles. Engine math is
 * unchanged — once we wire a bundled font (useFont(require(...ttf))) we
 * swap back to <Text/>.  See README porting roadmap, step 1.5.
 */
function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export default function Particles({
  config,
  width,
  height,
  time = 0,
  goldenHead = null,
}: ParticlesProps) {
  // Rebuild the particle grid only when density or charset weights change.
  // Stringify charset to give useMemo a stable dependency key.
  const charsetKey = JSON.stringify(config.charset);
  const particles = useMemo(
    () => buildParticleField(config.particles.density, config.charset),
    [config.particles.density, charsetKey],
  );

  // Project + light + cull. Memoised on every config / size / time change.
  const items = useMemo(() => {
    const view = config.view;
    const terrainScale = config.terrain.scale;
    const amp = config.terrain.amplitude;
    const driftZ = time * config.terrain.drift * 100;
    const contrast = config.terrain.contrast;
    const secondaryNoise = config.terrain.secondaryNoise;
    const sizeMin = config.particles.sizeMin;
    const sizeMax = config.particles.sizeMax;
    const baseAlpha = config.particles.baseAlpha;
    const twinkle = config.particles.twinkle;

    const palette = PALETTES[config.palette];
    const colorHex = PARTICLE_COLORS[config.particles.color || 'Chalk'] || palette.fg;
    const [fR, fG, fB] = hexToRgb(colorHex);

    // Local gold-tint pull near the golden line head — mirrors the web lab.
    const goldRgb = hexToRgb(config.goldenLine.color);
    const tintRadius = config.goldenLine.disturbanceRadius * 1.6;
    const tintRadius2 = tintRadius * tintRadius;
    const tintActive = !!(goldenHead && config.goldenLine.enabled && tintRadius > 0);

    const out: Array<{
      sx: number; sy: number; depth: number; size: number; alpha: number;
      r: number; g: number; b: number;
    }> = [];
    for (const p of particles) {
      const n1 = noise(p.x * terrainScale, (p.z + driftZ) * terrainScale);
      const n2 = noise2(p.x * terrainScale * 2.3, (p.z + driftZ) * terrainScale * 2.3) * secondaryNoise;
      const heightFactor = (n1 + 1) * 0.5;
      const hY = (n1 + n2 * 0.5) * amp;

      const pr = project(p.x, hY, p.z, view, width, height);
      if (!pr) continue;
      if (pr.sx < -100 || pr.sx > width + 100 || pr.sy < -100 || pr.sy > height + 200) continue;

      const tw = 1 + Math.sin(time * 2 + p.phase) * twinkle;
      const brightness = (1 - contrast) + contrast * heightFactor;
      const fadeNear = Math.min(1, pr.depth / 80);
      const fadeFar = Math.min(1, 1500 / pr.depth);
      let alpha = baseAlpha * brightness * tw * p.baseAlphaJitter * fadeNear * fadeFar;
      if (alpha < 0.02) continue;

      const size = (sizeMin + (sizeMax - sizeMin) * p.sizeT) * (450 / pr.depth);
      if (size < 1.5) continue;

      // Gold tint near the golden line head — lerp toward gold by proximity.
      let r = fR, g = fG, b = fB;
      if (tintActive) {
        const dx = p.x - goldenHead!.x;
        const dz = p.z - goldenHead!.z;
        const d2 = dx * dx + dz * dz;
        if (d2 < tintRadius2) {
          const tint = (1 - Math.sqrt(d2) / tintRadius) * 0.7;
          r = Math.round(fR + (goldRgb[0] - fR) * tint);
          g = Math.round(fG + (goldRgb[1] - fG) * tint);
          b = Math.round(fB + (goldRgb[2] - fB) * tint);
          alpha = Math.min(1, alpha + tint * 0.15);
        }
      }

      out.push({ sx: pr.sx, sy: pr.sy, depth: pr.depth, size, alpha, r, g, b });
    }
    // Back-to-front so near particles overdraw far ones.
    out.sort((a, b) => b.depth - a.depth);
    return out;
  }, [particles, config, width, height, time, goldenHead]);

  // Perf: render every particle individually as a <Circle> = React reconciles
  // a thousand children per frame and the page falls off 60fps. We batch by
  // quantised (size, alpha, color) into ~30 <Points> calls — each one is a
  // single GPU draw and Skia handles the per-point positions internally.
  const buckets = useMemo(() => {
    const SIZE_BINS = 5;
    const ALPHA_BINS = 10;
    const COLOR_BINS = 4;                  // for gold-tint blends
    const map = new Map<string, {
      r: number; g: number; b: number; alpha: number; size: number;
      pts: ReturnType<typeof vec>[];
    }>();
    for (const it of items) {
      const sBin = Math.min(SIZE_BINS - 1, Math.max(0, Math.round(it.size / 5)));
      const aBin = Math.min(ALPHA_BINS - 1, Math.max(0, Math.round(it.alpha * ALPHA_BINS)));
      // Gold-tint is essentially an interpolation toward gold; quantise the
      // red channel into a few bins to merge tinted particles per ring.
      const rBin = Math.min(COLOR_BINS - 1, Math.max(0, Math.round(it.r / 64)));
      const gBin = Math.min(COLOR_BINS - 1, Math.max(0, Math.round(it.g / 64)));
      const bBin = Math.min(COLOR_BINS - 1, Math.max(0, Math.round(it.b / 64)));
      const key = sBin + ':' + aBin + ':' + rBin + ':' + gBin + ':' + bBin;
      let bucket = map.get(key);
      if (!bucket) {
        bucket = {
          r: rBin * 64 + 32,
          g: gBin * 64 + 32,
          b: bBin * 64 + 32,
          alpha: aBin / ALPHA_BINS,
          size: (sBin + 0.5) * 5,
          pts: [],
        };
        map.set(key, bucket);
      }
      bucket.pts.push(vec(it.sx, it.sy));
    }
    return Array.from(map.values());
  }, [items]);

  return (
    <Group>
      {buckets.map((b, i) => (
        <Points
          key={i}
          points={b.pts}
          mode="points"
          color={`rgba(${b.r},${b.g},${b.b},${b.alpha.toFixed(2)})`}
          style="stroke"
          strokeWidth={b.size * 0.6}
          strokeCap="round"
        />
      ))}
    </Group>
  );
}
