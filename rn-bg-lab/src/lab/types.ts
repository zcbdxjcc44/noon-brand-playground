/**
 * Lab configuration shape — mirrors the web bg-lab's runtime config so
 * presets and saved data round-trip cleanly between the two.
 */

export type Style = 'particles' | 'contours' | 'faceted' | 'constellation' | 'starchart' | 'sand';
export type Palette = 'void' | 'paper';

export interface ViewConfig {
  pitch: number;
  yaw: number;
  distance: number;
  fov: number;
  cameraHeight: number;
}

export interface TerrainConfig {
  scale: number;
  amplitude: number;
  drift: number;
  contrast: number;
  secondaryNoise: number;
}

export interface ParticlesConfig {
  density: number;
  sizeMin: number;
  sizeMax: number;
  baseAlpha: number;
  twinkle: number;
  color?: string;          // one of PARTICLE_COLORS keys, e.g. "Chalk"
}

export interface CharsetWeights {
  easternArabic: number;
  westernArabic: number;
  math: number;
  geometry: number;
  stars: number;
}

export interface ContoursConfig {
  levelCount: number;
  lineWidth: number;
  peakOpacity: number;
  baseOpacity: number;
  falloff: number;
  gridCellsX: number;
  gridCellsZ: number;
  annotationDensity: number;
  annotationSize: number;
}

export interface FacetedConfig {
  gridCellsX: number;
  gridCellsZ: number;
  meshJitter: number;
  lightPitch: number;
  lightYaw: number;
  ambient: number;
  contrast: number;
  fill: boolean;
  highlight: string;       // FACET_HIGHLIGHTS key
  fillOpacity: number;
  edgeMode: 'off' | 'lines' | 'particles';
  edgeColor: string;       // FACET_HIGHLIGHTS or EDGE_PARTICLE_PALETTES key
  edgeDensity: number;
  edgeParticleSize: number;
  edgeOpacity: number;
  edgeSpeed: number;
}

export interface ConstellationConfig {
  subject: string;         // SUBJECTS key
  count: number;
  worldScale: number;
  depthScale: number;
  tightness: number;
  drift: number;
  swirlSpeed: number;
  sizeMin: number;
  sizeMax: number;
  glow: number;
  palette: string;         // CONSTELLATION_PALETTES key
}

export interface SandConfig {
  subject: string;         // SUBJECTS key
  palette: string;         // SAND_PALETTES key
  grainCount: number;
  worldScale: number;
  depthScale: number;
  grainSize: number;
  flowSpeed: number;
  spread: number;
}

export interface StarChartConfig {
  subject: string;         // STAR_CHARTS key
  worldScale: number;
  depthScale: number;
  driftSpeed: number;
  lineColor: string;       // STARCHART_LINE_COLORS key
  starColor: string;       // STARCHART_STAR_COLORS key
  lineWidth: number;
  lineGlow: number;
  breathing: number;
  brokenness: number;
  anchorSize: number;
  starSize: number;
  twinkle: number;
  brightness: number;
}

export interface GoldenLineConfig {
  enabled: boolean;
  pathType: 'noise' | 'sine' | 'straight' | 'curve';
  speed: number;
  width: number;
  glowRadius: number;
  color: string;
  disturbanceRadius: number;
  disturbanceStrength: number;
  springBack: number;
}

export interface MorningStarConfig {
  enabled: boolean;
  x: number;
  y: number;
  size: number;
  rayLength: number;
  twinkleSpeed: number;
  color: string;
  opacity: number;
}

export interface LabConfig {
  style: Style;
  palette: Palette;
  view: ViewConfig;
  terrain: TerrainConfig;
  particles: ParticlesConfig;
  charset: CharsetWeights;
  contours: ContoursConfig;
  faceted: FacetedConfig;
  constellation: ConstellationConfig;
  starchart: StarChartConfig;
  sand: SandConfig;
  goldenLine: GoldenLineConfig;
  morningStar: MorningStarConfig;
}

export interface Preset {
  name: string;
  desc: string;
  config: LabConfig;
}

/** 2D point in screen space after projection. */
export interface ScreenPoint {
  sx: number;
  sy: number;
  depth: number;
}
