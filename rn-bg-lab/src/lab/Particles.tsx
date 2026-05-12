/**
 * <Particles/> — Skia renderer for the 'particles' style.
 *
 * Glyph rendering: we hold N useFont hooks (one per quantised particle
 * size). Each particle picks the closest bucket. Bucketed by (size, alpha,
 * color) so the whole field is drawn as ~30-80 <Glyphs/> calls per frame
 * regardless of particle count. While the font is still loading, fall back
 * to the fast circle-dot bucketing so the canvas is never blank.
 */

import React, { useMemo } from 'react';
import {
  Glyphs,
  Group,
  Points,
  useFont,
  vec,
} from '@shopify/react-native-skia';
import type { SkFont } from '@shopify/react-native-skia';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { NotoNaskhArabic_400Regular } from '@expo-google-fonts/noto-naskh-arabic';

import type { LabConfig } from './types';
import type { GoldenTrailPoint } from './GoldenLine';
import { buildParticleField } from './ParticleField';
import { noise, noise2 } from './noise';
import { project } from './projection';
import { PALETTES, PARTICLE_COLORS } from './charsets';

/* Discrete sizes we load fonts at. Each particle maps to the closest one;
 * the visual size step is small enough that quantisation isn't noticeable.
 */
const SIZE_BUCKETS = [5, 8, 11, 14, 18, 22, 28] as const;

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

interface ParticlesProps {
  config: LabConfig;
  width: number;
  height: number;
  /** Clock in seconds — drives drift, twinkle, golden-tint distance. */
  time?: number;
  /** Current head of the golden line (world coords) for local gold tint. */
  goldenHead?: GoldenTrailPoint | null;
}

export default function Particles({
  config,
  width,
  height,
  time = 0,
  goldenHead = null,
}: ParticlesProps) {
  // Two font families × seven sizes. JBM covers Latin/math/Greek; Noto
  // Naskh Arabic covers Eastern Arabic digits (and Arabic script generally).
  // For each char we route to whichever family has a glyph, falling back to
  // JBM's notdef when neither does.
  const jbm0 = useFont(JetBrainsMono_400Regular, SIZE_BUCKETS[0]);
  const jbm1 = useFont(JetBrainsMono_400Regular, SIZE_BUCKETS[1]);
  const jbm2 = useFont(JetBrainsMono_400Regular, SIZE_BUCKETS[2]);
  const jbm3 = useFont(JetBrainsMono_400Regular, SIZE_BUCKETS[3]);
  const jbm4 = useFont(JetBrainsMono_400Regular, SIZE_BUCKETS[4]);
  const jbm5 = useFont(JetBrainsMono_400Regular, SIZE_BUCKETS[5]);
  const jbm6 = useFont(JetBrainsMono_400Regular, SIZE_BUCKETS[6]);
  const noto0 = useFont(NotoNaskhArabic_400Regular, SIZE_BUCKETS[0]);
  const noto1 = useFont(NotoNaskhArabic_400Regular, SIZE_BUCKETS[1]);
  const noto2 = useFont(NotoNaskhArabic_400Regular, SIZE_BUCKETS[2]);
  const noto3 = useFont(NotoNaskhArabic_400Regular, SIZE_BUCKETS[3]);
  const noto4 = useFont(NotoNaskhArabic_400Regular, SIZE_BUCKETS[4]);
  const noto5 = useFont(NotoNaskhArabic_400Regular, SIZE_BUCKETS[5]);
  const noto6 = useFont(NotoNaskhArabic_400Regular, SIZE_BUCKETS[6]);
  // fontFamilies[fontIdx][sizeIdx] → SkFont | null
  const fontFamilies: (SkFont | null)[][] = [
    [jbm0, jbm1, jbm2, jbm3, jbm4, jbm5, jbm6],
    [noto0, noto1, noto2, noto3, noto4, noto5, noto6],
  ];
  const fontReady = fontFamilies.every(family => family.every(f => !!f));

  function sizeBin(size: number): number {
    // Map a continuous size to the nearest bucket index.
    let best = 0;
    let bestDist = Math.abs(size - SIZE_BUCKETS[0]);
    for (let i = 1; i < SIZE_BUCKETS.length; i++) {
      const d = Math.abs(size - SIZE_BUCKETS[i]);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  }

  // Rebuild particle grid only when density / charset weights change.
  const charsetKey = JSON.stringify(config.charset);
  const particles = useMemo(
    () => buildParticleField(config.particles.density, config.charset),
    [config.particles.density, charsetKey],
  );

  // Project + light + cull. Re-runs every frame (time / size changes).
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

    const goldRgb = hexToRgb(config.goldenLine.color);
    const tintRadius = config.goldenLine.disturbanceRadius * 1.6;
    const tintRadius2 = tintRadius * tintRadius;
    const tintActive = !!(goldenHead && config.goldenLine.enabled && tintRadius > 0);

    const out: Array<{
      sx: number; sy: number; depth: number; size: number; alpha: number;
      r: number; g: number; b: number; char: string;
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

      out.push({
        sx: pr.sx, sy: pr.sy, depth: pr.depth, size, alpha,
        r, g, b, char: p.char,
      });
    }
    out.sort((a, b) => b.depth - a.depth);
    return out;
  }, [particles, config, width, height, time, goldenHead]);

  // Bucket into <Glyphs/> draw lists when fonts are ready. Each char is
  // first routed to the family whose typeface actually has a glyph for it;
  // the choice is cached so we only probe getGlyphIDs once per unique char.
  const glyphBuckets = useMemo(() => {
    if (!fontReady) return null;
    const ALPHA_BINS = 8;
    const COLOR_BINS = 4;

    const charFontIdx = new Map<string, number>();
    const charGlyphIdJbm = new Map<string, number>();
    const charGlyphIdNoto = new Map<string, number>();

    function pickFamilyAndId(char: string): { familyIdx: number; id: number } {
      let famIdx = charFontIdx.get(char);
      if (famIdx === undefined) {
        const jbmIds = fontFamilies[0][0]!.getGlyphIDs(char);
        const jbmFirst = jbmIds && jbmIds.length > 0 ? jbmIds[0] : 0;
        if (jbmFirst !== 0) {
          famIdx = 0;
          charGlyphIdJbm.set(char, jbmFirst);
        } else {
          const notoIds = fontFamilies[1][0]!.getGlyphIDs(char);
          const notoFirst = notoIds && notoIds.length > 0 ? notoIds[0] : 0;
          if (notoFirst !== 0) {
            famIdx = 1;
            charGlyphIdNoto.set(char, notoFirst);
          } else {
            famIdx = 0;
            charGlyphIdJbm.set(char, jbmFirst);
          }
        }
        charFontIdx.set(char, famIdx);
      }
      const id = famIdx === 0
        ? charGlyphIdJbm.get(char)!
        : charGlyphIdNoto.get(char)!;
      return { familyIdx: famIdx, id };
    }

    type Bucket = {
      familyIdx: number;
      sizeIdx: number;
      r: number; g: number; b: number; alpha: number;
      glyphs: { id: number; pos: ReturnType<typeof vec> }[];
    };
    const map = new Map<string, Bucket>();
    for (const it of items) {
      const { familyIdx, id } = pickFamilyAndId(it.char);
      const sIdx = sizeBin(it.size);
      const aBin = Math.min(ALPHA_BINS - 1, Math.max(0, Math.round(it.alpha * ALPHA_BINS)));
      const rBin = Math.min(COLOR_BINS - 1, Math.max(0, Math.round(it.r / 64)));
      const gBin = Math.min(COLOR_BINS - 1, Math.max(0, Math.round(it.g / 64)));
      const bBin = Math.min(COLOR_BINS - 1, Math.max(0, Math.round(it.b / 64)));
      const key = familyIdx + ':' + sIdx + ':' + aBin + ':' + rBin + ':' + gBin + ':' + bBin;
      let bucket = map.get(key);
      if (!bucket) {
        bucket = {
          familyIdx,
          sizeIdx: sIdx,
          r: rBin * 64 + 32,
          g: gBin * 64 + 32,
          b: bBin * 64 + 32,
          alpha: aBin / ALPHA_BINS,
          glyphs: [],
        };
        map.set(key, bucket);
      }
      const size = SIZE_BUCKETS[sIdx];
      // <Glyphs/> origin is glyph baseline-left. Offset to approximate centring.
      bucket.glyphs.push({
        id,
        pos: vec(it.sx - size * 0.32, it.sy + size * 0.35),
      });
    }
    return Array.from(map.values());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, fontReady]);

  // Fallback circle bucketing while font still loading.
  const circleBuckets = useMemo(() => {
    if (fontReady) return null;
    const SIZE_BINS = 5;
    const ALPHA_BINS = 10;
    const COLOR_BINS = 4;
    type Bucket = {
      r: number; g: number; b: number; alpha: number; size: number;
      pts: ReturnType<typeof vec>[];
    };
    const map = new Map<string, Bucket>();
    for (const it of items) {
      const sBin = Math.min(SIZE_BINS - 1, Math.max(0, Math.round(it.size / 5)));
      const aBin = Math.min(ALPHA_BINS - 1, Math.max(0, Math.round(it.alpha * ALPHA_BINS)));
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
  }, [items, fontReady]);

  if (!fontReady || !glyphBuckets) {
    return (
      <Group>
        {circleBuckets?.map((b, i) => (
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

  return (
    <Group>
      {glyphBuckets.map((b, i) => {
        const font = fontFamilies[b.familyIdx][b.sizeIdx];
        if (!font || b.glyphs.length === 0) return null;
        return (
          <Glyphs
            key={i}
            glyphs={b.glyphs}
            font={font}
            color={`rgba(${b.r},${b.g},${b.b},${b.alpha.toFixed(2)})`}
          />
        );
      })}
    </Group>
  );
}
