/**
 * Noon Academy — React Native Design Tokens
 * Copied verbatim from noon-academy-design-system-main/rn/tokens.ts on
 * 2026-05-12. If upstream tokens change, re-sync this file.
 */

export const color = {
  void: { 50: '#232c43', 100: '#1a2236', 200: '#10172a', 300: '#0a0f1a', 400: '#060913' },
  chalk: { 100: '#f5f1e8', 200: '#e8e4dc', 300: '#c9c4b8', 400: '#8e8a80' },
  paper: { 100: '#fbf8ef', 200: '#f2ece0', 300: '#e8e1d2' },
  noon: { 100: '#c8f4e2', 200: '#9EEACB', 300: '#7FE3BE', 400: '#64D8AE', 500: '#3FAE87', 600: '#2A8A6A', 700: '#194d3b', 800: '#0a3326' },
  gold: { 200: '#f0cf5a', 300: '#e0b83a', 400: '#c9a227', 500: '#8e7019', 600: '#5a4610' },
  iris: { 300: '#C7A8FF', 400: '#B08AF9', 500: '#8E63E0' },
  blue: { 300: '#96BCFF', 400: '#6BA3FF', 500: '#4881E0' },
  danger: { 300: '#e58a7f', 400: '#c55a4e', 500: '#9a4339' },
  warn: { 400: '#d9a74a' },
  ok: { 300: '#a9bc91', 400: '#7a8e64', 500: '#566648' },
} as const;

export const voidTheme = {
  bg: color.void[300],
  bgSunken: color.void[400],
  bgRaised: color.void[200],
  bgOverlay: color.void[100],
  fg: 'rgba(232,228,220,1)',
  fgMuted: 'rgba(232,228,220,0.70)',
  fgSubtle: 'rgba(232,228,220,0.55)',
  fgFaint: 'rgba(232,228,220,0.35)',
  fgDisabled: 'rgba(232,228,220,0.45)',
  fgInverse: color.void[300],
  border: 'rgba(232,228,220,0.10)',
  borderStrong: 'rgba(232,228,220,0.22)',
  divider: 'rgba(232,228,220,0.06)',
  hoverOverlay: 'rgba(232,228,220,0.04)',
  activeOverlay: 'rgba(232,228,220,0.08)',
  selectedOverlay: 'rgba(232,228,220,0.06)',
  inputBg: 'rgba(232,228,220,0.03)',
  accent: color.noon[400],
  accentHover: color.noon[300],
  accentActive: color.noon[500],
  accentFg: color.noon[800],
  accentSoft: 'rgba(100,216,174,0.14)',
  accentBorder: 'rgba(100,216,174,0.35)',
  accentGlow: 'rgba(100,216,174,0.15)',
  signal: color.gold[400],
  signalBright: color.gold[300],
  signalSoft: 'rgba(201,162,39,0.12)',
  signalBorder: 'rgba(201,162,39,0.35)',
  danger: color.danger[400],
  dangerSoft: 'rgba(197,90,78,0.10)',
  dangerBorder: 'rgba(197,90,78,0.40)',
} as const;

export const paperTheme = {
  bg: color.paper[200],
  bgSunken: color.paper[300],
  bgRaised: color.paper[100],
  bgOverlay: color.paper[100],
  fg: color.void[300],
  fgMuted: 'rgba(10,15,26,0.72)',
  fgSubtle: 'rgba(10,15,26,0.55)',
  fgFaint: 'rgba(10,15,26,0.38)',
  fgDisabled: 'rgba(10,15,26,0.45)',
  fgInverse: color.chalk[100],
  border: 'rgba(10,15,26,0.10)',
  borderStrong: 'rgba(10,15,26,0.22)',
  divider: 'rgba(10,15,26,0.06)',
  hoverOverlay: 'rgba(10,15,26,0.04)',
  activeOverlay: 'rgba(10,15,26,0.08)',
  selectedOverlay: 'rgba(10,15,26,0.06)',
  inputBg: 'rgba(10,15,26,0.02)',
  accent: '#2A8A6A',
  accentHover: '#238060',
  accentActive: '#1a6048',
  accentFg: color.paper[100],
  accentSoft: 'rgba(25,110,82,0.10)',
  accentBorder: 'rgba(25,110,82,0.30)',
  accentGlow: 'rgba(25,110,82,0.12)',
  signal: '#7a6014',
  signalBright: '#9a7b18',
  signalSoft: 'rgba(122,96,20,0.10)',
  signalBorder: 'rgba(122,96,20,0.30)',
  danger: '#9a4339',
  dangerSoft: 'rgba(154,67,57,0.10)',
  dangerBorder: 'rgba(154,67,57,0.30)',
} as const;

export type Theme = typeof voidTheme;

export const sp = {
  0: 0, 0.5: 2, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40, 9: 48, 10: 64, 11: 80, 12: 96,
} as const;

export const icon = {
  xs: 6, sm: 10, md: 14, lg: 18, xl: 20, tab: 22, '2xl': 28,
} as const;

export const r = {
  0: 0, 1: 2, 2: 4, 3: 6, 4: 8, pill: 999,
} as const;

export const h = {
  xs: 24, sm: 32, md: 40, lg: 48, xl: 56,
} as const;

export const fs = {
  9: 9, 10: 10, 11: 11, 12: 12, 13: 13, 14: 14, 15: 15, 16: 16,
  18: 18, 20: 20, 22: 22, 24: 24, 28: 28, 32: 32, 40: 40, 48: 48,
} as const;

export const fw = {
  300: '300' as const, 400: '400' as const, 500: '500' as const, 600: '600' as const, 700: '700' as const,
};

export const lh = {
  tight: 1.05, snug: 1.2, normal: 1.5, loose: 1.7,
} as const;

export const font = {
  serif: 'CrimsonPro',
  sans: 'Vazirmatn',
  mono: 'JetBrainsMono',
  arabic: 'NotoNaskhArabic',
} as const;

export const dur = {
  1: 120, 2: 200, 3: 320,
} as const;
