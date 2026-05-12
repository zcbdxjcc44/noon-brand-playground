/**
 * Factory presets — direct port of PRESETS from noon-bg-lab.html.
 * Keep in sync with the web lab.
 */

import type { LabConfig, Preset } from './types';

export const DEFAULT_CONFIG: LabConfig = {
  style: 'particles',
  palette: 'void',
  view:        { pitch: 0.55, yaw: 0.0, distance: 500, fov: 700, cameraHeight: 80 },
  terrain:     { scale: 0.006, amplitude: 80, drift: 0.08, contrast: 0.65, secondaryNoise: 0.3 },
  particles:   { density: 0.7, sizeMin: 9, sizeMax: 15, baseAlpha: 0.55, twinkle: 0.18, color: 'Chalk' },
  charset:     { easternArabic: 0.40, westernArabic: 0.30, math: 0.25, geometry: 0.05, stars: 0 },
  contours:    {
    levelCount: 18, lineWidth: 0.7, peakOpacity: 0.90, baseOpacity: 0.08, falloff: 1.6,
    gridCellsX: 90, gridCellsZ: 70, annotationDensity: 0.4, annotationSize: 10,
  },
  faceted:     {
    gridCellsX: 28, gridCellsZ: 22, meshJitter: 0.35,
    lightPitch: 0.65, lightYaw: -0.5, ambient: 0.18, contrast: 0.92,
    fill: true, highlight: 'Chalk', fillOpacity: 0.55,
    edgeMode: 'particles', edgeColor: 'Spectrum', edgeDensity: 6,
    edgeParticleSize: 1.8, edgeOpacity: 0.85, edgeSpeed: 0.18,
  },
  goldenLine:  {
    enabled: true, pathType: 'noise', speed: 0.18,
    width: 1.6, glowRadius: 70, color: '#c9a227',
    disturbanceRadius: 110, disturbanceStrength: 1.4, springBack: 0.05,
  },
  morningStar: {
    enabled: true, x: 0.78, y: 0.28, size: 55,
    rayLength: 4.0, twinkleSpeed: 0.5, color: '#f5e0a0', opacity: 0.85,
  },
};

export const PRESETS: Preset[] = [
  {
    name: 'Starry Sky',
    desc: 'Sparse stars · Venus prominent',
    config: {
      ...DEFAULT_CONFIG,
      style: 'particles', palette: 'void',
      view:       { pitch: 0.55, yaw: 0.0, distance: 550, fov: 800, cameraHeight: 180 },
      terrain:    { scale: 0.005, amplitude: 8, drift: 0.02, contrast: 0.30, secondaryNoise: 0.20 },
      particles:  { density: 0.65, sizeMin: 4, sizeMax: 13, baseAlpha: 0.55, twinkle: 0.42, color: 'Chalk' },
      charset:    { easternArabic: 0, westernArabic: 0, math: 0, geometry: 0, stars: 1.0 },
      goldenLine: { ...DEFAULT_CONFIG.goldenLine, enabled: false, speed: 0.10, width: 1.0, glowRadius: 60, color: '#d9a84a', disturbanceRadius: 100, disturbanceStrength: 1.0 },
      morningStar:{ ...DEFAULT_CONFIG.morningStar, x: 0.71, y: 0.20, size: 41, rayLength: 2.2, twinkleSpeed: 0.55, color: '#f5e0a0', opacity: 0.46 },
    },
  },
  {
    name: 'Winding Desert',
    desc: 'Compressed dunes · visible ridges',
    config: {
      ...DEFAULT_CONFIG,
      style: 'particles', palette: 'void',
      view:       { pitch: 0.66, yaw: 0.39, distance: 950, fov: 260, cameraHeight: 265 },
      terrain:    { scale: 0.002, amplitude: 123, drift: 0.33, contrast: 1.02, secondaryNoise: 0.30 },
      particles:  { density: 1.5, sizeMin: 4, sizeMax: 6, baseAlpha: 0.76, twinkle: 0, color: 'Chalk' },
      charset:    { easternArabic: 0.66, westernArabic: 0, math: 0.44, geometry: 0, stars: 0.26 },
      goldenLine: { ...DEFAULT_CONFIG.goldenLine, pathType: 'noise', speed: 0.18, width: 1.8, glowRadius: 80, color: '#d9a84a', disturbanceRadius: 120, disturbanceStrength: 1.6 },
      morningStar:{ ...DEFAULT_CONFIG.morningStar, enabled: false, x: 0.82, y: 0.20, size: 48, rayLength: 4.0, twinkleSpeed: 0.40, color: '#f0d080', opacity: 0.80 },
    },
  },
  {
    name: 'Flat Desert',
    desc: 'Wide horizon · low relief',
    config: {
      ...DEFAULT_CONFIG,
      style: 'particles', palette: 'void',
      view:       { pitch: 0.50, yaw: 0.0, distance: 620, fov: 560, cameraHeight: 180 },
      terrain:    { scale: 0.0045, amplitude: 26, drift: 0, contrast: 0.32, secondaryNoise: 0 },
      particles:  { density: 1.5, sizeMin: 4, sizeMax: 8, baseAlpha: 0.55, twinkle: 0.15, color: 'Chalk' },
      charset:    { easternArabic: 0.87, westernArabic: 0, math: 0, geometry: 0, stars: 0.05 },
      goldenLine: { ...DEFAULT_CONFIG.goldenLine, pathType: 'curve', speed: 0.14, width: 1.4, glowRadius: 70, color: '#d9a84a', disturbanceRadius: 95, disturbanceStrength: 1.1 },
      morningStar:{ ...DEFAULT_CONFIG.morningStar, enabled: false, x: 0.78, y: 0.25, size: 52, rayLength: 4.5, twinkleSpeed: 0.30, color: '#f0d080', opacity: 0.85 },
    },
  },
  {
    name: 'Topographic · Void',
    desc: 'Dark map · faint contour grid',
    config: {
      ...DEFAULT_CONFIG,
      style: 'contours', palette: 'void',
      view:       { pitch: 0.31, yaw: 0.12, distance: 690, fov: 480, cameraHeight: 240 },
      terrain:    { scale: 0.003, amplitude: 23, drift: 0.04, contrast: 0.65, secondaryNoise: 0.35 },
      contours:   { levelCount: 14, lineWidth: 0.8, peakOpacity: 0.46, baseOpacity: 0.06, falloff: 1.5, gridCellsX: 110, gridCellsZ: 80, annotationDensity: 0.14, annotationSize: 9 },
      goldenLine: { ...DEFAULT_CONFIG.goldenLine, pathType: 'noise', speed: 0.16, width: 1.4, glowRadius: 70, color: '#c9a227', disturbanceRadius: 0, disturbanceStrength: 0 },
      morningStar:{ ...DEFAULT_CONFIG.morningStar, x: 0.80, y: 0.20, size: 42, rayLength: 3.0, twinkleSpeed: 0.30, color: '#f5e0a0', opacity: 0.55 },
    },
  },
  {
    name: 'Caravan Lights',
    desc: 'Gold dots flowing along dim plates',
    config: {
      ...DEFAULT_CONFIG,
      style: 'faceted', palette: 'void',
      view:       { pitch: 0.18, yaw: -1.4, distance: 620, fov: 620, cameraHeight: 245 },
      terrain:    { scale: 0.0015, amplitude: 53, drift: 0.025, contrast: 0.42, secondaryNoise: 0.06 },
      faceted:    { gridCellsX: 30, gridCellsZ: 28, meshJitter: 0.33, lightPitch: 0.32, lightYaw: -1.7, ambient: 0.16, contrast: 0.92, fill: true, highlight: 'Void Step', fillOpacity: 0.55, edgeMode: 'particles', edgeColor: 'Gold Crest', edgeDensity: 5, edgeParticleSize: 0.9, edgeOpacity: 1, edgeSpeed: 0.16 },
      goldenLine: { ...DEFAULT_CONFIG.goldenLine, pathType: 'noise', speed: 0.16, width: 1.8, glowRadius: 85, color: '#c9a227', disturbanceRadius: 0, disturbanceStrength: 0 },
      morningStar:{ ...DEFAULT_CONFIG.morningStar, x: 0.78, y: 0.20, size: 52, rayLength: 3.6, twinkleSpeed: 0.30, color: '#f5e0a0', opacity: 0.70 },
    },
  },
  {
    name: 'Tectonic Drift',
    desc: 'Coarse plates · slow geology',
    config: {
      ...DEFAULT_CONFIG,
      style: 'faceted', palette: 'void',
      view:       { pitch: 0.18, yaw: -1.4, distance: 620, fov: 620, cameraHeight: 245 },
      terrain:    { scale: 0.0015, amplitude: 53, drift: 0.025, contrast: 0.42, secondaryNoise: 0.06 },
      faceted:    { gridCellsX: 13, gridCellsZ: 14, meshJitter: 0.19, lightPitch: 0.32, lightYaw: -1.2, ambient: 0.16, contrast: 0.92, fill: true, highlight: 'Void Step', fillOpacity: 0.69, edgeMode: 'lines', edgeColor: 'Void Step', edgeDensity: 5, edgeParticleSize: 0.5, edgeOpacity: 1, edgeSpeed: 0.16 },
      goldenLine: { ...DEFAULT_CONFIG.goldenLine, pathType: 'noise', speed: 0.16, width: 1.8, glowRadius: 85, color: '#c9a227', disturbanceRadius: 0, disturbanceStrength: 0 },
      morningStar:{ ...DEFAULT_CONFIG.morningStar, x: 0.78, y: 0.20, size: 52, rayLength: 3.6, twinkleSpeed: 0.30, color: '#f5e0a0', opacity: 0.70 },
    },
  },
];
