/**
 * <Lab/> — bg-lab root with full designer console.
 *
 * Holds a `liveConfig` state that starts as a deep copy of the active
 * preset and mutates as the user drags sliders / flips toggles. Renderers
 * read from liveConfig; preset switches replace it; Save commits live
 * back into PRESETS so subsequent switches don't lose changes.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Canvas, Fill } from '@shopify/react-native-skia';

import { PRESETS } from './presets';
import { PALETTES, CHAR_GROUPS } from './charsets';
import type { LabConfig, Style } from './types';
import { GoldenLine } from './GoldenLine';
import Particles from './Particles';
import Contours from './Contours';
import Faceted from './Faceted';
import StarChart from './StarChart';
import GoldenLineSkia from './GoldenLineSkia';
import MorningStar from './MorningStar';
import Panel from './Panel';
import type { GroupKey } from './schema';

function deepCopy<T>(o: T): T {
  return JSON.parse(JSON.stringify(o));
}

export default function Lab() {
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [config, setConfig] = useState<LabConfig>(() => deepCopy(PRESETS[0].config));
  const [time, setTime] = useState(0);
  const [isDirty, setDirty] = useState(false);

  const palette = PALETTES[config.palette];

  const goldenRef = useRef<GoldenLine | null>(null);
  if (!goldenRef.current) goldenRef.current = new GoldenLine();
  const configRef = useRef(config);
  configRef.current = config;

  // RAF tick — drives time, updates GoldenLine.
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

  /* ---- preset / config plumbing ---- */
  const pickPreset = useCallback((i: number) => {
    setActiveIndex(i);
    setConfig(deepCopy(PRESETS[i].config));
    setDirty(false);
    goldenRef.current!.reset();
  }, []);

  const updateField = useCallback((group: GroupKey, key: string, value: number | boolean | string) => {
    setConfig(prev => {
      const next = { ...prev, [group]: { ...(prev as any)[group], [key]: value } };
      return next as LabConfig;
    });
    setDirty(true);
  }, []);

  const updateStyle = useCallback((s: Style) => {
    setConfig(prev => ({ ...prev, style: s }));
    setDirty(true);
  }, []);

  const updatePalette = useCallback((p: 'void' | 'paper') => {
    setConfig(prev => ({ ...prev, palette: p }));
    setDirty(true);
  }, []);

  const updateCharset = useCallback((k: keyof typeof CHAR_GROUPS, v: number) => {
    setConfig(prev => ({ ...prev, charset: { ...prev.charset, [k]: v } }));
    setDirty(true);
  }, []);

  const save = useCallback(() => {
    // Commit live config back into PRESETS (in-memory). AsyncStorage
    // persistence can layer on top later.
    PRESETS[activeIndex] = {
      ...PRESETS[activeIndex],
      config: deepCopy(config),
    };
    setDirty(false);
  }, [activeIndex, config]);

  const reset = useCallback(() => {
    setConfig(deepCopy(PRESETS[activeIndex].config));
    setDirty(false);
    goldenRef.current!.reset();
  }, [activeIndex]);

  const presetMeta = useMemo(
    () => PRESETS.map(p => ({ name: p.name, desc: p.desc })),
    [],
  );

  const trail = goldenRef.current.trail;
  const head = goldenRef.current.getHead();

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Fill color={palette.bg} />
        {config.style === 'particles' && (
          <Particles config={config} width={width} height={height} time={time} goldenHead={head} />
        )}
        {config.style === 'contours' && (
          <Contours config={config} width={width} height={height} time={time} />
        )}
        {config.style === 'faceted' && (
          <Faceted config={config} width={width} height={height} time={time} />
        )}
        {config.style === 'starchart' && (
          <StarChart config={config} width={width} height={height} time={time} />
        )}
        {config.goldenLine.enabled && (
          <GoldenLineSkia trail={trail} config={config} width={width} height={height} time={time} />
        )}
        <MorningStar config={config.morningStar} width={width} height={height} time={time} />
      </Canvas>

      <Panel
        config={config}
        presets={presetMeta}
        activePresetIndex={activeIndex}
        isDirty={isDirty}
        onPickPreset={pickPreset}
        onUpdateField={updateField}
        onUpdateStyle={updateStyle}
        onUpdatePalette={updatePalette}
        onUpdateCharset={updateCharset}
        onSave={save}
        onReset={reset}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
