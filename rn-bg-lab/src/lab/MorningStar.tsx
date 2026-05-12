/**
 * <MorningStar/> — Skia overlay for the 启明星 / Venus mark.
 *
 * Layered Skia primitives mirror the web lab's drawMorningStar():
 *   - outer halo (radial gradient circle)
 *   - 4 long cardinal rays + 4 short diagonal rays (linear-gradient lines)
 *   - inner glow disc
 *   - bright white-hot core (radial gradient)
 *
 * `time` drives a subtle twinkle pulse that modulates ray/halo alpha.
 */

import React, { useMemo } from 'react';
import {
  Circle,
  Group,
  LinearGradient,
  Line,
  RadialGradient,
  vec,
} from '@shopify/react-native-skia';

import type { MorningStarConfig } from './types';

interface Props {
  config: MorningStarConfig;
  width: number;
  height: number;
  time: number;
}

function rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
}

export default function MorningStar({ config: c, width, height, time }: Props) {
  if (!c.enabled) return null;

  const cx = c.x * width;
  const cy = c.y * height;
  const r = c.size;
  const op = c.opacity;
  const color = c.color;

  // Twinkle — same dual-frequency pulse as the web version.
  const pulse = c.twinkleSpeed > 0
    ? 0.78
      + Math.sin(time * c.twinkleSpeed * 5.0) * 0.22
      + Math.sin(time * c.twinkleSpeed * 13.0) * 0.06
    : 1.0;
  const opT = op * pulse;

  // 4 cardinal rays + 4 diagonals. Pre-compute endpoints.
  const rayLen = r * c.rayLength;
  const cardinal = useMemo(() => {
    const out = [];
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      out.push({ ex: cx + Math.cos(a) * rayLen, ey: cy + Math.sin(a) * rayLen });
    }
    return out;
  }, [cx, cy, rayLen]);

  const diagonal = useMemo(() => {
    const out = [];
    const len = rayLen * 0.42;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      out.push({ ex: cx + Math.cos(a) * len, ey: cy + Math.sin(a) * len });
    }
    return out;
  }, [cx, cy, rayLen]);

  const haloR = r * 2.6;
  const innerR = r * 0.45;
  const coreR = Math.max(2, r * 0.12);

  return (
    <Group>
      {/* Outer halo */}
      <Circle cx={cx} cy={cy} r={haloR}>
        <RadialGradient
          c={vec(cx, cy)}
          r={haloR}
          colors={[
            rgba(color, opT * 0.50),
            rgba(color, opT * 0.22),
            rgba(color, opT * 0.05),
            rgba(color, 0),
          ]}
          positions={[0, 0.18, 0.55, 1]}
        />
      </Circle>

      {/* Cardinal long rays */}
      {cardinal.map((p, i) => (
        <Line
          key={'c' + i}
          p1={vec(cx, cy)}
          p2={vec(p.ex, p.ey)}
          strokeWidth={1.4}
          style="stroke"
          strokeCap="round"
        >
          <LinearGradient
            start={vec(cx, cy)}
            end={vec(p.ex, p.ey)}
            colors={[
              rgba(color, opT * 0.95),
              rgba(color, opT * 0.55),
              rgba(color, opT * 0.12),
              rgba(color, 0),
            ]}
            positions={[0, 0.25, 0.7, 1]}
          />
        </Line>
      ))}

      {/* Diagonal short rays */}
      {diagonal.map((p, i) => (
        <Line
          key={'d' + i}
          p1={vec(cx, cy)}
          p2={vec(p.ex, p.ey)}
          strokeWidth={0.9}
          style="stroke"
          strokeCap="round"
        >
          <LinearGradient
            start={vec(cx, cy)}
            end={vec(p.ex, p.ey)}
            colors={[
              rgba(color, opT * 0.65),
              rgba(color, opT * 0.18),
              rgba(color, 0),
            ]}
            positions={[0, 0.5, 1]}
          />
        </Line>
      ))}

      {/* Inner warm glow */}
      <Circle cx={cx} cy={cy} r={innerR}>
        <RadialGradient
          c={vec(cx, cy)}
          r={innerR}
          colors={[rgba(color, op * 0.95), rgba(color, op * 0.45), rgba(color, 0)]}
          positions={[0, 0.5, 1]}
        />
      </Circle>

      {/* White-hot core */}
      <Circle cx={cx} cy={cy} r={coreR}>
        <RadialGradient
          c={vec(cx, cy)}
          r={coreR}
          colors={[
            `rgba(255,255,255,${Math.min(1, op).toFixed(3)})`,
            rgba(color, op * 0.95),
            rgba(color, 0),
          ]}
          positions={[0, 0.5, 1]}
        />
      </Circle>
    </Group>
  );
}
