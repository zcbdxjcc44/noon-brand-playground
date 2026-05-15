/**
 * Character sets, palettes and color tables — direct port of the web lab.
 */

export const CHAR_GROUPS = {
  easternArabic: ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'],
  westernArabic: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  math:          ['+', '−', '×', '÷', '=', '∑', '∫', 'π', '√', '∞', '≈', 'θ', 'Δ', 'Ω', 'λ', 'μ', 'φ', '∂'],
  geometry:      ['△', '▽', '○', '□', '◇', '⬡', '⬢', '◆'],
  // JetBrains Mono lacks ∙ ⋅ ◦ ⋆ glyphs and Noto Naskh Arabic doesn't cover
  // them either → they'd tofu. Stick to chars both fonts (or the system)
  // reliably have: middle dot, bullet, asterisk.
  stars:         ['·', '·', '·', '·', '·', '·', '·', '·', '•', '*', '*'],
} as const;

export type CharsetKey = keyof typeof CHAR_GROUPS;

export const CHAR_LABELS: Record<CharsetKey, { name: string; preview: string }> = {
  easternArabic: { name: 'Eastern Arabic', preview: '٠١٢٣٤٥٦٧٨٩' },
  westernArabic: { name: 'Western Arabic', preview: '0123456789' },
  math:          { name: 'Math',           preview: '∑∫π√∞≈θΔ' },
  geometry:      { name: 'Geometry',       preview: '△○□◇⬡' },
  stars:         { name: 'Stars',          preview: '·∙•⋅⋆◦' },
};

/**
 * Background-layer palettes (full theme). Brand: Void = pre-dawn desert,
 * Paper = specimen.
 */
export interface BackgroundPalette {
  name: string;
  bg: string;
  fg: string;
  fgRGB: [number, number, number];
  fgFaint: string;
  annotation: string;
  accent: string;
  accentSoft: string;
  accentDeep: string;
  morningStar: string;
}

export const PALETTES: Record<'void' | 'paper', BackgroundPalette> = {
  void: {
    name: 'Void',
    bg:          '#0a0f1a',
    fg:          '#e8e4dc',
    fgRGB:       [232, 228, 220],
    fgFaint:     'rgba(232,228,220,0.45)',
    annotation:  'rgba(232,228,220,0.55)',
    accent:      '#c9a227',
    accentSoft:  '#e0b83a',
    accentDeep:  '#8e7019',
    morningStar: '#f5e0a0',
  },
  paper: {
    name: 'Paper',
    bg:          '#f2ece0',
    fg:          '#0a0f1a',
    fgRGB:       [10, 15, 26],
    fgFaint:     'rgba(10,15,26,0.40)',
    annotation:  'rgba(10,15,26,0.55)',
    accent:      '#8e7019',
    accentSoft:  '#c9a227',
    accentDeep:  '#5a4710',
    morningStar: '#8e7019',
  },
};

/** Brand-curated highlight colors for Faceted style fills / line edges. */
export const FACET_HIGHLIGHTS: Record<string, string> = {
  'Chalk':      '#e8e4dc',
  'Void Step':  '#232c43',
  'Gold Crest': '#e0b83a',
  'Noon Wave':  '#64D8AE',
  'Iris':       '#B08AF9',
};

/** Particle-glyph colors. Adds Paper/Ink for the Paper background. */
export const PARTICLE_COLORS: Record<string, string> = {
  'Chalk':      '#e8e4dc',
  'Paper':      '#f2ece0',
  'Ink':        '#0a0f1a',
  'Gold Crest': '#e0b83a',
  'Noon Wave':  '#64D8AE',
  'Iris':       '#B08AF9',
};

/** Faceted edge-particle palettes — 'Spectrum' is the multi-color stream. */
export const EDGE_PARTICLE_PALETTES: Record<string, string[]> = {
  'Spectrum':   ['#ff4d6d', '#ffa040', '#ffdf6e', '#7cd7a0', '#5cc7ff', '#9b8aff', '#ff7ad9'],
  'Chalk':      ['#e8e4dc'],
  'Gold Crest': ['#e0b83a'],
  'Noon Wave':  ['#64D8AE'],
  'Iris':       ['#B08AF9'],
  'Cool':       ['#5cc7ff', '#9b8aff', '#7cd7a0'],
  'Warm':       ['#ff4d6d', '#ffa040', '#ffdf6e'],
};

/**
 * Star Chart — hairline connector colors (soft white / warm silver) and
 * star-point colors. Kept deliberately quiet: restrained, editorial.
 */
export const STARCHART_LINE_COLORS: Record<string, string> = {
  'Silver': '#c3c7cf',
  'Warm':   '#ddd5c4',
  'White':  '#e9ebef',
};
export const STARCHART_STAR_COLORS: Record<string, string> = {
  'Warm White': '#f1ebdd',
  'Cool White': '#eaedf2',
  'Silver':     '#cdd1d8',
};

/**
 * Sand-style palettes — warm desert tones. lit (top) / mid (body) /
 * shadow (bottom) / speckle (grain highlight).
 */
export const SAND_PALETTES: Record<string, { lit: string; mid: string; shadow: string; speckle: string }> = {
  'Dune':  { lit: '#e8cf9a', mid: '#cfa86a', shadow: '#7d5f37', speckle: '#fbe7c0' },
  'Ember': { lit: '#e0a878', mid: '#c1714a', shadow: '#6e3526', speckle: '#f4cda0' },
  'Ash':   { lit: '#cdd0d6', mid: '#9aa0aa', shadow: '#4c5159', speckle: '#eef0f3' },
  'Pearl': { lit: '#f2ece0', mid: '#d9d2c3', shadow: '#9c9482', speckle: '#ffffff' },
};

/** Hex `#rrggbb` → {r,g,b} 0–255. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
