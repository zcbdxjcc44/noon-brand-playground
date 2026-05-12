/**
 * <Faceted/> — Skia renderer for the 'faceted' style.
 *
 * Triangulated mesh from FacetedField with per-triangle Lambert shading.
 * All triangles go into ONE Skia <Vertices> call (each triangle has 3
 * non-shared vertices that carry the same flat color → no gradient
 * interpolation across the face).
 *
 * Edges:
 *   - 'off'       — no edges
 *   - 'lines'     — single <Path> joining every unique edge
 *   - 'particles' — flowing dots along edges, bucketed into one <Points>
 *                   call per palette colour (Spectrum / single-color)
 */

import React, { useMemo, useRef } from 'react';
import {
  Group,
  Path,
  Points,
  Skia,
  Vertices,
  vec,
} from '@shopify/react-native-skia';

import type { LabConfig } from './types';
import { FacetedField } from './FacetedField';
import { project } from './projection';
import {
  EDGE_PARTICLE_PALETTES,
  FACET_HIGHLIGHTS,
  PALETTES,
} from './charsets';

interface Props {
  config: LabConfig;
  width: number;
  height: number;
  time: number;
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export default function Faceted({ config, width, height, time }: Props) {
  const fieldRef = useRef<FacetedField | null>(null);
  if (!fieldRef.current) fieldRef.current = new FacetedField();
  const field = fieldRef.current;

  const meshData = useMemo(() => {
    const cfg = config.faceted;
    field.ensureGrid(cfg);
    field.sampleHeights(time, config.terrain);

    const view = config.view;
    const palette = PALETTES.void;     // faceted locked to Void per design
    const bg = hexToRgb(palette.bg);
    const hi = hexToRgb(FACET_HIGHLIGHTS[cfg.highlight] || FACET_HIGHLIGHTS['Chalk']);

    // Light direction (world space)
    const lp = cfg.lightPitch;
    const ly = cfg.lightYaw;
    const lcp = Math.cos(lp);
    const lsp = Math.sin(lp);
    let Lx = Math.sin(ly) * lcp;
    let Ly = lsp;
    let Lz = Math.cos(ly) * lcp;
    const Llen = Math.sqrt(Lx * Lx + Ly * Ly + Lz * Lz) || 1;
    Lx /= Llen; Ly /= Llen; Lz /= Llen;

    const ambient = cfg.ambient;
    const contrast = cfg.contrast;
    const fillAlpha = cfg.fillOpacity != null ? cfg.fillOpacity : 1;

    const cx = field.cellsX;
    const cz = field.cellsZ;

    // Project every vertex once.
    const totalV = (cx + 1) * (cz + 1);
    const projX = new Float32Array(totalV);
    const projY = new Float32Array(totalV);
    const projOk = new Uint8Array(totalV);
    let v = 0;
    for (let j = 0; j <= cz; j++) {
      for (let i = 0; i <= cx; i++) {
        const pr = project(
          field.vx(i, j),
          field.heights![v],
          field.vz(i, j),
          view,
          width,
          height,
        );
        if (pr) {
          projX[v] = pr.sx;
          projY[v] = pr.sy;
          projOk[v] = 1;
        }
        v++;
      }
    }

    const stepXc = cx + 1;
    const vIdx = (i: number, j: number) => j * stepXc + i;

    const vertices: ReturnType<typeof vec>[] = [];
    const colors: string[] = [];
    // Map<"min,max", [sx0, sy0, sx1, sy1]>  — deduped projected edges
    const edges = new Map<string, [number, number, number, number]>();

    const addEdge = (a: number, b: number) => {
      const lo = a < b ? a : b;
      const hi2 = a < b ? b : a;
      const key = lo + ',' + hi2;
      if (!edges.has(key)) {
        edges.set(key, [projX[lo], projY[lo], projX[hi2], projY[hi2]]);
      }
    };

    const addTri = (ia: number, ib: number, ic: number): void => {
      if (!projOk[ia] || !projOk[ib] || !projOk[ic]) return;
      // World normal
      const aix = ia % stepXc, aiz = (ia / stepXc) | 0;
      const bix = ib % stepXc, biz = (ib / stepXc) | 0;
      const cix = ic % stepXc, ciz = (ic / stepXc) | 0;
      const wax = field.vx(aix, aiz), waz = field.vz(aix, aiz), way = field.heights![ia];
      const wbx = field.vx(bix, biz), wbz = field.vz(bix, biz), wby = field.heights![ib];
      const wcx = field.vx(cix, ciz), wcz = field.vz(cix, ciz), wcy = field.heights![ic];
      const ux = wbx - wax, uy = wby - way, uz = wbz - waz;
      const vvx = wcx - wax, vvy = wcy - way, vvz = wcz - waz;
      let nx = uy * vvz - uz * vvy;
      let ny = uz * vvx - ux * vvz;
      let nz = ux * vvy - uy * vvx;
      if (ny < 0) { nx = -nx; ny = -ny; nz = -nz; }
      const nlen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      nx /= nlen; ny /= nlen; nz /= nlen;
      const dot = Math.max(0, nx * Lx + ny * Ly + nz * Lz);
      let bright = ambient + (1 - ambient) * dot * contrast;
      if (bright > 1) bright = 1;
      const r = (bg[0] + (hi[0] - bg[0]) * bright) | 0;
      const g = (bg[1] + (hi[1] - bg[1]) * bright) | 0;
      const b = (bg[2] + (hi[2] - bg[2]) * bright) | 0;
      const color = `rgba(${r},${g},${b},${fillAlpha.toFixed(3)})`;

      vertices.push(vec(projX[ia], projY[ia]));
      vertices.push(vec(projX[ib], projY[ib]));
      vertices.push(vec(projX[ic], projY[ic]));
      colors.push(color, color, color);

      addEdge(ia, ib);
      addEdge(ib, ic);
      addEdge(ic, ia);
    };

    for (let j = 0; j < cz; j++) {
      for (let i = 0; i < cx; i++) {
        const i00 = vIdx(i, j);
        const i10 = vIdx(i + 1, j);
        const i11 = vIdx(i + 1, j + 1);
        const i01 = vIdx(i, j + 1);
        const dir = field.diagDir![j * cx + i];
        if (dir === 0) {
          addTri(i00, i10, i11);
          addTri(i00, i11, i01);
        } else {
          addTri(i00, i10, i01);
          addTri(i10, i11, i01);
        }
      }
    }

    return { vertices, colors, edges, useFill: cfg.fill !== false };
  }, [config, width, height, time, field]);

  const cfg = config.faceted;
  const edgeMode = cfg.edgeMode || 'off';
  const edgeAlpha = cfg.edgeOpacity;

  // 'lines' edge: build a single Path with every unique edge.
  const linesPath = useMemo(() => {
    if (edgeMode !== 'lines' || edgeAlpha < 0.005) return null;
    const path = Skia.Path.Make();
    meshData.edges.forEach(e => {
      path.moveTo(e[0], e[1]);
      path.lineTo(e[2], e[3]);
    });
    return path;
  }, [meshData.edges, edgeMode, edgeAlpha]);

  // 'particles' edge: flowing dots along edges, bucketed by color.
  const dots = useMemo(() => {
    if (edgeMode !== 'particles' || edgeAlpha < 0.005) return null;
    const palette = EDGE_PARTICLE_PALETTES[cfg.edgeColor] || EDGE_PARTICLE_PALETTES['Spectrum'];
    const palLen = palette.length;
    const palRgb = palette.map(hexToRgb);
    const dotsPerEdge = Math.max(1, cfg.edgeDensity | 0);
    const speed = cfg.edgeSpeed || 0;
    const flow = (time * speed) % 1;
    const batches: ReturnType<typeof vec>[][] = palRgb.map(() => []);
    meshData.edges.forEach((e, key) => {
      const ax = e[0], ay = e[1], bx = e[2], by = e[3];
      if ((ax < -10 && bx < -10) || (ax > width + 10 && bx > width + 10)) return;
      if ((ay < -10 && by < -10) || (ay > height + 10 && by > height + 10)) return;
      // FNV-1a-ish hash for deterministic colors/offsets per edge.
      let hash = 2166136261;
      for (let k = 0; k < key.length; k++) {
        hash = (hash ^ key.charCodeAt(k)) * 16777619 >>> 0;
      }
      for (let p = 0; p < dotsPerEdge; p++) {
        const slotRand = ((hash + p * 2654435761) >>> 0) / 4294967295;
        const tRaw = (slotRand + flow + p / dotsPerEdge) % 1;
        // Bias toward endpoints (cluster at vertices)
        const biased = (tRaw < 0.5)
          ? (tRaw * tRaw * 2)
          : (1 - (1 - tRaw) * (1 - tRaw) * 2);
        const px = ax + (bx - ax) * biased;
        const py = ay + (by - ay) * biased;
        const colorIdx = ((((hash >>> (p % 16)) ^ p) >>> 0) % palLen) | 0;
        batches[colorIdx].push(vec(px, py));
      }
    });
    return { batches, palRgb };
  }, [meshData.edges, edgeMode, edgeAlpha, cfg.edgeColor, cfg.edgeDensity, cfg.edgeSpeed, time, width, height]);

  return (
    <Group>
      {meshData.useFill && meshData.vertices.length > 0 && (
        <Vertices vertices={meshData.vertices} colors={meshData.colors} />
      )}

      {linesPath && (() => {
        const e = hexToRgb(FACET_HIGHLIGHTS[cfg.edgeColor] || FACET_HIGHLIGHTS['Chalk']);
        return (
          <Path
            path={linesPath}
            style="stroke"
            strokeWidth={0.5}
            color={`rgba(${e[0]},${e[1]},${e[2]},${edgeAlpha.toFixed(3)})`}
          />
        );
      })()}

      {dots && (
        <Group opacity={edgeAlpha}>
          {dots.batches.map((points, ci) => {
            if (points.length === 0) return null;
            const c = dots.palRgb[ci];
            return (
              <Points
                key={ci}
                points={points}
                mode="points"
                color={`rgb(${c[0]},${c[1]},${c[2]})`}
                style="stroke"
                strokeWidth={cfg.edgeParticleSize}
                strokeCap="round"
              />
            );
          })}
        </Group>
      )}
    </Group>
  );
}
