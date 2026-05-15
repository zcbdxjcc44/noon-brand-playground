/**
 * Designer-console parameter schema. Drives auto-generated panel rows.
 * Mirrors the web lab's SCHEMA so we can copy values between the two.
 */

import {
  CHAR_GROUPS,
  EDGE_PARTICLE_PALETTES,
  FACET_HIGHLIGHTS,
  PARTICLE_COLORS,
  PALETTES,
  STARCHART_LINE_COLORS,
  STARCHART_STAR_COLORS,
} from './charsets';
import { STARCHART_SUBJECTS } from './starcharts';

export type GroupKey =
  | 'view'
  | 'terrain'
  | 'particles'
  | 'contours'
  | 'faceted'
  | 'starchart'
  | 'goldenLine'
  | 'morningStar';

export type FieldSchema =
  | { kind: 'range';  key: string; label: string; min: number; max: number; step: number }
  | { kind: 'check';  key: string; label: string }
  | { kind: 'select'; key: string; label: string; options: string[] };

export const GROUP_TITLES: Record<GroupKey, string> = {
  view:        'View',
  terrain:     'Terrain',
  particles:   'Particles',
  contours:    'Contours',
  faceted:     'Faceted',
  starchart:   'Star Chart',
  goldenLine:  'Golden Line',
  morningStar: 'Morning Star',
};

export const SCHEMA: Record<GroupKey, FieldSchema[]> = {
  view: [
    { kind: 'range', key: 'pitch',        label: 'Pitch',       min: 0.1,   max: 1.4,  step: 0.01 },
    { kind: 'range', key: 'yaw',          label: 'Yaw',         min: -1.5,  max: 1.5,  step: 0.01 },
    { kind: 'range', key: 'distance',     label: 'Distance',    min: 100,   max: 1500, step: 10 },
    { kind: 'range', key: 'fov',          label: 'Focal',       min: 200,   max: 1500, step: 10 },
    { kind: 'range', key: 'cameraHeight', label: 'Cam Height',  min: 0,     max: 400,  step: 5 },
  ],
  terrain: [
    { kind: 'range', key: 'scale',          label: 'Noise Scale', min: 0.001, max: 0.02, step: 0.0005 },
    { kind: 'range', key: 'amplitude',      label: 'Amplitude',   min: 0,     max: 250,  step: 1 },
    { kind: 'range', key: 'drift',          label: 'Drift Speed', min: 0,     max: 0.5,  step: 0.005 },
    { kind: 'range', key: 'contrast',       label: 'Brightness',  min: 0,     max: 1.2,  step: 0.02 },
    { kind: 'range', key: 'secondaryNoise', label: '2nd Octave',  min: 0,     max: 1,    step: 0.02 },
  ],
  particles: [
    { kind: 'range',  key: 'density',   label: 'Density',    min: 0.15, max: 1.5, step: 0.05 },
    { kind: 'range',  key: 'sizeMin',   label: 'Size Min',   min: 4,    max: 22,  step: 1 },
    { kind: 'range',  key: 'sizeMax',   label: 'Size Max',   min: 6,    max: 30,  step: 1 },
    { kind: 'select', key: 'color',     label: 'Color',      options: Object.keys(PARTICLE_COLORS) },
    { kind: 'range',  key: 'baseAlpha', label: 'Base Alpha', min: 0.1,  max: 1,   step: 0.02 },
    { kind: 'range',  key: 'twinkle',   label: 'Twinkle',    min: 0,    max: 0.5, step: 0.01 },
  ],
  contours: [
    { kind: 'range', key: 'levelCount',        label: 'Levels',      min: 4,    max: 40,  step: 1 },
    { kind: 'range', key: 'lineWidth',         label: 'Line Width',  min: 0.3,  max: 2.5, step: 0.1 },
    { kind: 'range', key: 'peakOpacity',       label: 'Peak Alpha',  min: 0.1,  max: 1,   step: 0.02 },
    { kind: 'range', key: 'baseOpacity',       label: 'Base Alpha',  min: 0,    max: 1,   step: 0.02 },
    { kind: 'range', key: 'falloff',           label: 'Falloff',     min: 0.3,  max: 4,   step: 0.1 },
    { kind: 'range', key: 'gridCellsX',        label: 'Grid X',      min: 30,   max: 180, step: 5 },
    { kind: 'range', key: 'gridCellsZ',        label: 'Grid Z',      min: 30,   max: 180, step: 5 },
    { kind: 'range', key: 'annotationDensity', label: 'Labels',      min: 0,    max: 1,   step: 0.02 },
    { kind: 'range', key: 'annotationSize',    label: 'Label Size',  min: 7,    max: 18,  step: 1 },
  ],
  faceted: [
    { kind: 'range',  key: 'gridCellsX',       label: 'Mesh X',      min: 10,   max: 80,   step: 1 },
    { kind: 'range',  key: 'gridCellsZ',       label: 'Mesh Z',      min: 10,   max: 80,   step: 1 },
    { kind: 'range',  key: 'meshJitter',       label: 'Mesh Jitter', min: 0,    max: 0.48, step: 0.01 },
    { kind: 'range',  key: 'lightPitch',       label: 'Light Pitch', min: 0,    max: 1.55, step: 0.02 },
    { kind: 'range',  key: 'lightYaw',         label: 'Light Yaw',   min: -3.14,max: 3.14, step: 0.02 },
    { kind: 'check',  key: 'fill',             label: 'Fill' },
    { kind: 'select', key: 'highlight',        label: 'Fill Color',  options: Object.keys(FACET_HIGHLIGHTS) },
    { kind: 'range',  key: 'fillOpacity',      label: 'Fill Alpha',  min: 0.05, max: 1,    step: 0.02 },
    { kind: 'range',  key: 'ambient',          label: 'Ambient',     min: 0,    max: 0.6,  step: 0.02 },
    { kind: 'range',  key: 'contrast',         label: 'Contrast',    min: 0.2,  max: 1.5,  step: 0.02 },
    { kind: 'select', key: 'edgeMode',         label: 'Edge Mode',   options: ['off', 'lines', 'particles'] },
    { kind: 'select', key: 'edgeColor',        label: 'Edge Color',  options: Object.keys(EDGE_PARTICLE_PALETTES) },
    { kind: 'range',  key: 'edgeDensity',      label: 'Dots/Edge',   min: 1,    max: 20,   step: 1 },
    { kind: 'range',  key: 'edgeParticleSize', label: 'Dot Size',    min: 0.5,  max: 5,    step: 0.1 },
    { kind: 'range',  key: 'edgeOpacity',      label: 'Edge Alpha',  min: 0,    max: 1,    step: 0.02 },
    { kind: 'range',  key: 'edgeSpeed',        label: 'Flow Speed',  min: 0,    max: 1.5,  step: 0.02 },
  ],
  starchart: [
    { kind: 'select', key: 'subject',    label: 'Subject',     options: STARCHART_SUBJECTS },
    { kind: 'select', key: 'lineColor',  label: 'Line Color',  options: Object.keys(STARCHART_LINE_COLORS) },
    { kind: 'select', key: 'starColor',  label: 'Star Color',  options: Object.keys(STARCHART_STAR_COLORS) },
    { kind: 'range',  key: 'brightness', label: 'Brightness',  min: 0.2,  max: 1.2,  step: 0.02 },
    { kind: 'range',  key: 'breathing',  label: 'Breathing',   min: 0,    max: 1,    step: 0.02 },
    { kind: 'range',  key: 'brokenness', label: 'Brokenness',  min: 0,    max: 1,    step: 0.02 },
    { kind: 'range',  key: 'lineWidth',  label: 'Line Width',  min: 0.3,  max: 1.6,  step: 0.05 },
    { kind: 'range',  key: 'lineGlow',   label: 'Line Glow',   min: 0,    max: 0.6,  step: 0.02 },
    { kind: 'range',  key: 'anchorSize', label: 'Anchor Size', min: 1.5,  max: 6,    step: 0.1 },
    { kind: 'range',  key: 'starSize',   label: 'Star Size',   min: 0.6,  max: 4,    step: 0.1 },
    { kind: 'range',  key: 'twinkle',    label: 'Twinkle',     min: 0,    max: 1,    step: 0.02 },
    { kind: 'range',  key: 'driftSpeed', label: 'Drift Speed', min: 0,    max: 0.4,  step: 0.005 },
    { kind: 'range',  key: 'worldScale', label: 'Scale',       min: 200,  max: 1100, step: 10 },
    { kind: 'range',  key: 'depthScale', label: 'Depth',       min: 0.2,  max: 2.0,  step: 0.05 },
  ],
  goldenLine: [
    { kind: 'check',  key: 'enabled',              label: 'Enabled' },
    { kind: 'select', key: 'pathType',             label: 'Path Type',   options: ['noise', 'sine', 'straight', 'curve'] },
    { kind: 'range',  key: 'speed',                label: 'Speed',       min: 0.02, max: 1.0, step: 0.01 },
    { kind: 'range',  key: 'width',                label: 'Width',       min: 0.5,  max: 5,   step: 0.1 },
    { kind: 'range',  key: 'glowRadius',           label: 'Glow',        min: 0,    max: 180, step: 1 },
    { kind: 'range',  key: 'disturbanceRadius',    label: 'Push Radius', min: 0,    max: 300, step: 1 },
    { kind: 'range',  key: 'disturbanceStrength',  label: 'Push Force',  min: 0,    max: 5,   step: 0.05 },
    { kind: 'range',  key: 'springBack',           label: 'Spring Back', min: 0.005,max: 0.2, step: 0.005 },
  ],
  morningStar: [
    { kind: 'check', key: 'enabled',      label: 'Enabled' },
    { kind: 'range', key: 'x',            label: 'Position X', min: 0.05, max: 0.95, step: 0.01 },
    { kind: 'range', key: 'y',            label: 'Position Y', min: 0.05, max: 0.95, step: 0.01 },
    { kind: 'range', key: 'size',         label: 'Size',       min: 15,   max: 200,  step: 1 },
    { kind: 'range', key: 'rayLength',    label: 'Ray Length', min: 1,    max: 10,   step: 0.1 },
    { kind: 'range', key: 'twinkleSpeed', label: 'Twinkle',    min: 0,    max: 3,    step: 0.05 },
    { kind: 'range', key: 'opacity',      label: 'Opacity',    min: 0.1,  max: 1,    step: 0.02 },
  ],
};

/** Ordered list of charset group keys for the Character Set section. */
export const CHARSET_KEYS = Object.keys(CHAR_GROUPS) as Array<keyof typeof CHAR_GROUPS>;

/** Palette options for the Palette segmented selector. */
export const PALETTE_KEYS = Object.keys(PALETTES) as Array<keyof typeof PALETTES>;
