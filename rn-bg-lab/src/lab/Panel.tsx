/**
 * <Panel/> — designer console.
 *
 * Slide-in from the right with a toggle button. Auto-generates rows for
 * every parameter group from `schema.ts`. Style/Palette segmented at top,
 * preset list, then sections per group (only the active style's group
 * shows), then Character Set (particles only), then Save/Reset actions.
 */

import React, { useCallback, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RNSlider from '@react-native-community/slider';

/**
 * Cross-platform slider — RN Community Slider has a long-standing
 * react-native-web measurement bug (click goes straight to max, drag
 * doesn't track). On web we fall through to the browser's native
 * <input type="range"> which is rock solid; on native we keep RNSlider.
 */
const HtmlInput = 'input' as unknown as React.ComponentType<any>;
function PlatformSlider({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  if (Platform.OS === 'web') {
    return (
      <HtmlInput
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e: any) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          height: 22,
          background: 'transparent',
          accentColor: '#e0b83a',
        }}
      />
    );
  }
  return (
    <RNSlider
      style={{ height: 24 }}
      minimumValue={min}
      maximumValue={max}
      step={step}
      value={value}
      onValueChange={onChange}
      minimumTrackTintColor="#e0b83a"
      maximumTrackTintColor="rgba(232,228,220,0.18)"
      thumbTintColor="#e0b83a"
    />
  );
}

import type { LabConfig, Style } from './types';
import { voidTheme } from '../tokens';
import {
  CHARSET_KEYS,
  GROUP_TITLES,
  PALETTE_KEYS,
  SCHEMA,
  type FieldSchema,
  type GroupKey,
} from './schema';
import { CHAR_LABELS } from './charsets';

interface PanelProps {
  config: LabConfig;
  presets: { name: string; desc: string }[];
  activePresetIndex: number;
  isDirty: boolean;
  onPickPreset: (i: number) => void;
  onUpdateField: (group: GroupKey, key: string, value: number | boolean | string) => void;
  onUpdateStyle: (s: Style) => void;
  onUpdatePalette: (p: 'void' | 'paper') => void;
  onUpdateCharset: (k: keyof typeof CHAR_LABELS, v: number) => void;
  onSave: () => void;
  onReset: () => void;
}

export default function Panel(props: PanelProps) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <Pressable style={styles.openHandle} onPress={() => setOpen(true)}>
        <Text style={styles.openHandleText}>◀ CONSOLE</Text>
      </Pressable>
    );
  }

  const { config } = props;
  const isParticles = config.style === 'particles';
  const isContours = config.style === 'contours';
  const isFaceted = config.style === 'faceted';
  const isConstellation = config.style === 'constellation';
  const isStarChart = config.style === 'starchart';

  // Constellation & Star Chart live on their own plane — no noise terrain.
  const groupOrder: GroupKey[] =
    isConstellation || isStarChart ? ['view'] : ['view', 'terrain'];
  if (isParticles)     groupOrder.push('particles');
  if (isContours)      groupOrder.push('contours');
  if (isFaceted)       groupOrder.push('faceted');
  if (isConstellation) groupOrder.push('constellation');
  if (isStarChart)     groupOrder.push('starchart');
  groupOrder.push('goldenLine', 'morningStar');

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>Noon Background Lab</Text>
        <Pressable hitSlop={8} onPress={() => setOpen(false)}>
          <Text style={styles.closeBtn}>×</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Presets (top) */}
        <Section title="Presets">
          <View style={styles.presetGrid}>
            {props.presets.map((p, i) => {
              const active = i === props.activePresetIndex;
              return (
                <Pressable
                  key={p.name}
                  onPress={() => props.onPickPreset(i)}
                  style={[styles.presetChip, active && styles.presetChipActive]}
                >
                  <Text style={[styles.presetName, active && styles.presetNameActive]}>
                    {p.name}
                    {active && props.isDirty ? ' •' : ''}
                  </Text>
                  <Text style={styles.presetDesc}>{p.desc}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* Style + Palette */}
        <Section title="Style & Palette">
          <Segmented
            options={['particles', 'contours', 'faceted', 'constellation', 'starchart']}
            value={config.style}
            onChange={v => props.onUpdateStyle(v as Style)}
          />
          {!isFaceted && (
            <View style={{ marginTop: 6 }}>
              <Segmented
                options={PALETTE_KEYS as unknown as string[]}
                value={config.palette}
                onChange={v => props.onUpdatePalette(v as 'void' | 'paper')}
              />
            </View>
          )}
        </Section>

        {/* Parameter groups */}
        {groupOrder.map(g => (
          <Section key={g} title={GROUP_TITLES[g]}>
            {SCHEMA[g].map(field => (
              <FieldRow
                key={field.key}
                field={field}
                value={(config as any)[g][field.key]}
                onChange={v => props.onUpdateField(g, field.key, v)}
              />
            ))}
          </Section>
        ))}

        {/* Character Set (particles only) */}
        {isParticles && (
          <Section title="Character Set">
            {CHARSET_KEYS.map(k => (
              <CharsetRow
                key={k}
                charsetKey={k}
                value={config.charset[k]}
                onChange={v => props.onUpdateCharset(k, v)}
              />
            ))}
          </Section>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, props.isDirty && styles.actionBtnPrimary]}
            onPress={props.onSave}
            disabled={!props.isDirty}
          >
            <Text style={[styles.actionLabel, props.isDirty && styles.actionLabelPrimary]}>
              Save
            </Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={props.onReset}>
            <Text style={styles.actionLabel}>Reset</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------- Helper components ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <View style={styles.section}>
      <Pressable onPress={() => setCollapsed(c => !c)} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionChev}>{collapsed ? '▸' : '▾'}</Text>
      </Pressable>
      {!collapsed && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

function FieldRow({
  field,
  value,
  onChange,
}: {
  field: FieldSchema;
  value: any;
  onChange: (v: number | boolean | string) => void;
}) {
  if (field.kind === 'range') {
    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{field.label}</Text>
        <View style={styles.sliderWrap}>
          <PlatformSlider
            min={field.min}
            max={field.max}
            step={field.step}
            value={typeof value === 'number' ? value : field.min}
            onChange={onChange}
          />
        </View>
        <Text style={styles.rowValue}>{formatValue(value, field.step)}</Text>
      </View>
    );
  }
  if (field.kind === 'check') {
    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{field.label}</Text>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={() => onChange(!value)}
          style={[styles.checkBox, value && styles.checkBoxOn]}
        >
          {value ? <Text style={styles.checkMark}>✓</Text> : null}
        </Pressable>
      </View>
    );
  }
  // select
  return (
    <View style={[styles.row, { flexDirection: 'column', alignItems: 'stretch' }]}>
      <Text style={[styles.rowLabel, { marginBottom: 4 }]}>{field.label}</Text>
      <Segmented
        options={field.options}
        value={value}
        onChange={onChange}
      />
    </View>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map(opt => (
        <Pressable
          key={opt}
          style={[styles.segItem, opt === value && styles.segItemActive]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.segLabel, opt === value && styles.segLabelActive]}>
            {opt}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function CharsetRow({
  charsetKey,
  value,
  onChange,
}: {
  charsetKey: keyof typeof CHAR_LABELS;
  value: number;
  onChange: (v: number) => void;
}) {
  const meta = CHAR_LABELS[charsetKey];
  return (
    <View style={styles.row}>
      <View style={{ flex: 0, minWidth: 92 }}>
        <Text style={styles.rowLabel}>{meta.name}</Text>
        <Text style={styles.charsetPreview}>{meta.preview}</Text>
      </View>
      <View style={styles.sliderWrap}>
        <PlatformSlider
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={onChange}
        />
      </View>
      <Text style={styles.rowValue}>{value.toFixed(2)}</Text>
    </View>
  );
}

function formatValue(v: any, step: number): string {
  if (typeof v !== 'number') return String(v);
  if (step >= 1)    return Math.round(v).toString();
  if (step >= 0.1)  return v.toFixed(1);
  if (step >= 0.01) return v.toFixed(2);
  return v.toFixed(3);
}

const styles = StyleSheet.create({
  openHandle: {
    position: 'absolute',
    top: 16, right: 0,
    backgroundColor: 'rgba(12,12,16,0.86)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: voidTheme.border,
    borderRightWidth: 0,
    zIndex: 20,
  },
  openHandleText: {
    color: voidTheme.fgMuted,
    fontSize: 10,
    letterSpacing: 1.2,
    fontFamily: 'monospace',
  },
  panel: {
    position: 'absolute',
    top: 0, right: 0,
    bottom: 0,
    width: 340,
    backgroundColor: 'rgba(12,12,16,0.86)',
    borderLeftWidth: 1,
    borderLeftColor: voidTheme.border,
    zIndex: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: voidTheme.divider,
  },
  title: { color: voidTheme.fg, fontSize: 13, fontWeight: '600' },
  closeBtn: { color: voidTheme.fgFaint, fontSize: 22, fontWeight: '300' },

  body: { flex: 1 },
  section: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: voidTheme.divider,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    color: voidTheme.fgFaint,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sectionChev: { color: voidTheme.fgFaint, fontSize: 10 },
  sectionBody: {},

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rowLabel: { color: voidTheme.fgMuted, fontSize: 11, width: 92 },
  rowValue: {
    color: voidTheme.fg,
    fontSize: 10,
    fontFamily: 'monospace',
    width: 42,
    textAlign: 'right',
  },
  sliderWrap: { flex: 1, marginHorizontal: 6 },
  slider: { height: 24 },

  checkBox: {
    width: 16, height: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: voidTheme.borderStrong,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxOn: {
    backgroundColor: voidTheme.signalBright,
    borderColor: voidTheme.signalBright,
  },
  checkMark: { color: '#000', fontSize: 11, fontWeight: '700', lineHeight: 14 },

  segmented: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(232,228,220,0.04)',
    borderWidth: 1,
    borderColor: voidTheme.border,
    flex: 1,
  },
  segItem: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  segItemActive: {
    backgroundColor: 'rgba(224,184,58,0.18)',
  },
  segLabel: {
    color: voidTheme.fgFaint,
    fontSize: 10,
    fontFamily: 'monospace',
    textTransform: 'capitalize',
  },
  segLabelActive: { color: voidTheme.signalBright },

  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    width: '48.5%',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(232,228,220,0.04)',
    borderWidth: 1,
    borderColor: voidTheme.border,
  },
  presetChipActive: {
    borderColor: voidTheme.signalBorder,
    backgroundColor: 'rgba(201,162,39,0.08)',
  },
  presetName: { color: voidTheme.fgMuted, fontSize: 11, fontWeight: '600' },
  presetNameActive: { color: voidTheme.signalBright },
  presetDesc: { color: voidTheme.fgFaint, fontSize: 9, marginTop: 2 },

  charsetPreview: {
    color: voidTheme.fgFaint,
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 2,
  },

  actions: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 6,
    backgroundColor: 'rgba(232,228,220,0.05)',
    borderWidth: 1,
    borderColor: voidTheme.border,
    alignItems: 'center',
  },
  actionBtnPrimary: {
    backgroundColor: voidTheme.signalBright,
    borderColor: voidTheme.signalBright,
  },
  actionLabel: { color: voidTheme.fg, fontSize: 11, fontWeight: '600' },
  actionLabelPrimary: { color: '#000' },
});
