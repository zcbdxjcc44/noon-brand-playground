/**
 * <Lab/> — the RN bg-lab root.
 *
 * Status: step 2 (animation + golden line). RAF advances a `time` state,
 * which re-renders Particles and GoldenLine each frame. Suitable while
 * particles are dots; once we re-introduce <Text/> we may need to switch
 * to a SharedValue/worklet approach for perf.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Canvas, Fill } from '@shopify/react-native-skia';
import { PRESETS } from './presets';
import { PALETTES } from './charsets';
import { voidTheme } from '../tokens';
import Particles from './Particles';
import Contours from './Contours';
import Faceted from './Faceted';
import { GoldenLine } from './GoldenLine';
import GoldenLineSkia from './GoldenLineSkia';
import MorningStar from './MorningStar';

export default function Lab() {
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [time, setTime] = useState(0);
  const config = useMemo(() => PRESETS[activeIndex].config, [activeIndex]);
  const palette = PALETTES[config.palette];

  // Mutable, stable across renders. Reset on preset change so the trail
  // doesn't carry from one config into the next.
  const goldenRef = useRef<GoldenLine | null>(null);
  if (!goldenRef.current) goldenRef.current = new GoldenLine();

  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    goldenRef.current!.reset();
  }, [activeIndex]);

  // RAF tick — advances time, updates the GoldenLine, kicks a re-render.
  useEffect(() => {
    let raf: number;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setTime(t => {
        const nt = t + dt;
        goldenRef.current!.update(dt, nt, configRef.current.goldenLine);
        return nt;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const trail = goldenRef.current.trail;
  const head = goldenRef.current.getHead();

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Fill color={palette.bg} />
        {config.style === 'particles' && (
          <Particles
            config={config}
            width={width}
            height={height}
            time={time}
            goldenHead={head}
          />
        )}
        {config.style === 'contours' && (
          <Contours
            config={config}
            width={width}
            height={height}
            time={time}
          />
        )}
        {config.style === 'faceted' && (
          <Faceted
            config={config}
            width={width}
            height={height}
            time={time}
          />
        )}
        {config.goldenLine.enabled && (
          <GoldenLineSkia
            trail={trail}
            config={config}
            width={width}
            height={height}
            time={time}
          />
        )}
        <MorningStar
          config={config.morningStar}
          width={width}
          height={height}
          time={time}
        />
      </Canvas>

      {/* preset switcher (temporary, replaces full designer console) */}
      <View style={styles.presetBar} pointerEvents="box-none">
        <Text style={styles.presetHeading}>PRESETS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetList}
        >
          {PRESETS.map((p, i) => (
            <Pressable
              key={p.name}
              onPress={() => setActiveIndex(i)}
              style={[styles.presetChip, i === activeIndex && styles.presetChipActive]}
            >
              <Text style={[styles.presetName, i === activeIndex && styles.presetNameActive]}>
                {p.name}
              </Text>
              <Text style={styles.presetDesc}>{p.desc}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.status}>
          style: {config.style} · palette: {config.palette} · t: {time.toFixed(1)}s
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  presetBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(12,12,16,0.78)',
    borderWidth: 1,
    borderColor: voidTheme.border,
  },
  presetHeading: {
    fontSize: 10,
    letterSpacing: 1.6,
    color: voidTheme.fgFaint,
    marginBottom: 8,
  },
  presetList: { gap: 8, paddingRight: 8 },
  presetChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(232,228,220,0.04)',
    borderWidth: 1,
    borderColor: voidTheme.border,
    minWidth: 130,
  },
  presetChipActive: {
    borderColor: voidTheme.signalBorder,
    backgroundColor: 'rgba(201,162,39,0.08)',
  },
  presetName: { fontSize: 12, fontWeight: '600', color: voidTheme.fgMuted },
  presetNameActive: { color: voidTheme.signalBright },
  presetDesc: { fontSize: 10, color: voidTheme.fgFaint, marginTop: 2 },
  status: {
    marginTop: 10,
    fontSize: 10,
    fontFamily: 'monospace',
    color: voidTheme.fgFaint,
  },
});
