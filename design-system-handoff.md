# Proven Routes — Design System Handoff

**System:** Noon Academy "Proven Routes" design system
**Audience:** Designers picking up or extending the system
**Version:** 0.1.0 · `@noon/design-system`
**Date:** July 6, 2026

---

## 1. What this is

Proven Routes is a fully tokenised design system for Noon Academy, built for React Native but grounded in a self-contained visual language you can design against directly. It's a Saudi-native brand rooted in three ideas: **Empty Quarter geometry** (diamond markers, dune and terrain patterns), **surveyor's-notebook craft** (grid paper, cartographic contour lines), and **cartographic precision** (measured spacing, precise typography).

Everything ships from a single source of truth (`rn/tokens.ts`). Nothing in the UI should use a raw hex value or arbitrary spacing — it always resolves to a token. When you design a new screen or component, your first question is "which token does this map to?", not "what color/size looks right?".

---

## 2. Themes

Two themes, and every component adapts automatically through semantic tokens.

**Void** — the dark theme, and the default. Deep navy backgrounds (`#0a0f1a`), warm off-white text. Depth is created by *brighter borders*, not shadows.

**Paper** — the light theme. Warm cream backgrounds (`#f2ece0`), dark ink text. Depth is created by *real drop shadows*.

Design in both. A layout that reads well in Void can fall apart in Paper because the depth model is different (borders vs. shadows). Never hardcode a background or text color — reference the semantic role (`bg`, `fg`, `accent`) so it flips correctly between themes.

---

## 3. Color roles

The palette is organised by *role*, not by hue. Use color to mean something.

| Role | Hue | Use for |
|---|---|---|
| **Accent** | Green (`noon`) | Actions, primary CTAs, confirmations |
| **Signal** | Gold | Journey, progress, waypoints |
| **Iris** | Purple | Voice tutor **only** — never reuse elsewhere |
| **Terra** | Terracotta | Warmth, place, classroom |
| **Danger** | Red | Errors, destructive actions |
| **Warn** | Amber | Caution, rare UI warnings |

The most important rule here: **Iris is reserved exclusively for the voice tutor.** Using purple anywhere else breaks the system's color semantics.

Each hue exists as a numeric ramp (e.g. `noon.100`–`800`, `terra.200`–`800`). You almost never reach into the raw ramp when designing UI — you use the semantic tokens (`accent`, `accentHover`, `accentSoft`, `signal`, `danger`, etc.) that already resolve per theme. The raw ramps exist for building new semantic tokens, not for one-off styling.

---

## 4. Typography

Four families, each with a job:

- **Body — Vazirmatn.** Arabic + Latin, the workhorse for UI text.
- **Serif headings — Crimson Pro** (Latin) / **Noto Naskh Arabic** (Arabic). Editorial, for titles and moments of weight.
- **Monospace — JetBrains Mono.** Data, code, measured/technical labels.

This is a bilingual (Arabic + Latin) system. Every text style has an Arabic counterpart and layouts must work right-to-left. When you design a screen, design the Arabic version alongside it — don't treat it as a translation pass.

Type scale (`fs`): 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 40, 48.
Weights (`fw`): 300, 400, 500, 600, 700.
Line heights (`lh`): tight 1.05, snug 1.2, normal 1.5, loose 1.7.

---

## 5. Spacing, radius, sizing

All from a fixed scale — stay on it.

**Spacing (`sp`)** — a 4px base grid: `1`=4, `2`=8, `3`=12, `4`=16, `5`=20, `6`=24, `7`=32, `8`=40, `9`=48, `10`=64, `11`=80, `12`=96. (Plus `0.5`=2 for hairline nudges.)

**Radius (`r`)** — `0`, `2`, `4`, `6`, `8`px, and `pill` (999) for fully rounded. The system is fairly sharp-cornered; most components use `r[2]` (4px).

**Control heights (`h`)** — xs 24, sm 32, md 40, lg 48, xl 56. Buttons and inputs snap to these.

**Icon sizes (`icon`)** — xs 6, sm 10, md 14, lg 18, xl 20, tab 22, 2xl 28.

**Motion (`dur`)** — three durations only: 120ms, 200ms, 320ms. Keep animation restrained.

---

## 6. Component inventory

~55 production components, already built and themed. Design *with* these before drawing anything new — most needs are already covered.

**Inputs & controls:** Button, IconButton, Input, Textarea, Switch, Checkbox, CheckboxGroup, Radio, RadioGroup, Stepper, Segmented

**Display:** Card, Chip, Avatar, Badge, Table, Divider, Skeleton, EmptyState

**Navigation:** Calendar (week/month, assessment-aware), Tabs, BottomNav, TitleBar, FilterBar

**Feedback:** Alert, Toast (+ ToastProvider), Dialog, BottomSheet, FullSheet, Tooltip

**Progress:** SessionBar, LinearProgress, CircularProgress

**Education patterns:** SessionCard, HomeworkCard, QuizOption, Interstitial, VideoCard, BreakdownCard, ActivityCard, ResourceList, SlidesCard, WorkedExampleCard

**Voice / chat:** VoiceTutor, ChatMessage

**Brand graphics:** GridPaper, Waypoints (+ WaypointMarker), WaterVessel, TerrainPattern, DunePattern

**Composition:** Identity, Menu, CardGrid, Leaderboard

**Icons:** a custom 21-icon SVG set (`chevron-*`, `arrow-*`, `close`, `plus`, `minus`, `check`, `search`, `menu`, `more`, `play`, `pause`, `expand`, `collapse`, `document`, `link`, `info`, `warning`, `error`). If you need an icon outside this set, it needs to be drawn to match — don't drop in a third-party icon.

### Example of the component contract — Button

Reading one component's API tells you how the system thinks about variants and states. Button has:

- **Variants:** primary, secondary, ghost, danger, danger-solid, signal
- **Sizes:** sm (32px), md (40px, default), lg (48px)
- **States:** default, disabled (greyed, opacity ~0.4), loading, fullWidth
- Icon-only? Use **IconButton** instead.

When you extend a component, honor the same shape: a small set of named variants, three sizes mapped to the height scale, and the standard state set (default / hover / active / disabled / loading). Don't invent a fourth size or a bespoke disabled treatment.

---

## 7. Signature patterns

These are what make it look like Noon, not a generic app. Reach for them deliberately:

- **Diamond markers** (Waypoints) — journey progress and important milestones.
- **Grid paper texture** (GridPaper) — brand surfaces, the surveyor's-notebook feel.
- **Terrain contour lines** (TerrainPattern) — abstract cartographic backgrounds.
- **Dune pattern** (DunePattern) — Empty Quarter geometry as texture.
- **Voice tutor iris aura** — state-based animated glow, iris-purple, voice-tutor only.

---

## 8. How to work in this system

**When designing a new screen:**
1. Pick the theme(s) — design Void and Paper, remembering their depth models differ.
2. Compose from existing components before creating anything new.
3. Map every value to a token — spacing to `sp`, size to `h`/`icon`, type to `fs`/`fw`, color to a semantic role.
4. Design the Arabic/RTL version alongside the Latin one.
5. Use color semantically — accent = action, signal = progress, iris = voice tutor only.

**When extending the system:**
- New color? Add it as a semantic token in both `voidTheme` and `paperTheme`, built from an existing (or new) hue ramp — don't paint components with raw hex.
- New component? Follow the existing variant/size/state contract (see Button).
- New spacing/size need? Check the scale first; add a step to the scale rather than a one-off value.

**Red flags that mean you've stepped outside the system:**
- A hex value or px number that isn't in the token scale.
- Purple used for anything but the voice tutor.
- A layout that only works in one theme.
- A Latin-only design with no Arabic/RTL consideration.

---

## 9. Where things live

- `rn/tokens.ts` — the single source of truth. Colors, spacing, type, sizing, elevation, motion, and both theme maps. Read this first.
- `rn/ThemeContext.tsx` — the Void/Paper provider.
- `rn/*.tsx` — the ~55 components, each with a doc comment at the top describing its variants, sizes, and states.
- `preview/` — an interactive Expo explorer to browse every component, token, and doc page live (`cd preview && npx expo start`, then press `w` for web).
- `reference/` — the design reference imagery (classroom palette, contour/terrain textures, vessel, source screenshots).
- `README.md` — the developer quick-start.

**Best first step for a new designer:** run the explorer (`preview/`) to see everything rendered in both themes, then read `rn/tokens.ts` to internalise the scales. Between those two, you'll have the whole system.

---

## 10. Open items to confirm on handoff

- **Figma parity** — confirm whether a Figma library mirrors these tokens/components, and if it's the source of truth or downstream of the code. (No Figma file is referenced in the repo.)
- **Icon set coverage** — 21 icons today; agree on the process for requesting/drawing new ones.
- **Arabic type specifics** — confirm Naskh sizing/line-height adjustments relative to the Latin scale.
- **License** — repo is marked `UNLICENSED` / private; confirm usage terms before sharing outside the team.
