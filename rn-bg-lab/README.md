# Noon Background Lab — React Native port

React Native (Expo + Skia) port of `../noon-bg-lab.html`. Same engine math,
same presets, same brand tokens. Renders to a Skia canvas full-screen with a
preset switcher overlay; eventually grows the full designer console.

## Run

```bash
cd rn-bg-lab
npm install
npm start
```

Then press `i` for iOS simulator, `a` for Android emulator, or `w` for web.

> First-time iOS: needs Xcode + iOS simulator. Android: needs Android Studio
> emulator. Web build runs in the browser directly via Metro.

## Layout

```
rn-bg-lab/
├── App.tsx              entry — mounts <Lab/>
├── app.json             Expo config
├── package.json
├── tsconfig.json
├── babel.config.js
└── src/
    ├── tokens.ts        copy of design-system/rn/tokens.ts
    └── lab/
        ├── types.ts     LabConfig / Preset etc.
        ├── charsets.ts  CHAR_GROUPS, PALETTES, FACET_HIGHLIGHTS, …
        ├── noise.ts     Perlin noise (same seeds as web)
        ├── projection.ts  3D → 2D project()
        ├── presets.ts   6 factory presets
        └── Lab.tsx      root component (Skia <Canvas> + preset bar)
```

## Porting roadmap

The web lab is ~2,500 lines. Porting in phases so each step is testable:

| Step | Scope | Status |
|---|---|---|
| 0 | Scaffold, tokens, types, noise, projection, presets, basic Lab.tsx | ✅ done |
| 1 | `ParticleField` + particles render | ✅ done (Circle stand-in; <Text/> pending font asset bundle) |
| 1.5 | Bundle a ttf + `useFont` → swap Circle back to <Text/> | ⏳ |
| 2 | RAF animation + `GoldenLine` trail + Skia render + particle gold tint | ✅ done |
| 3 | `MorningStar` Skia overlay (halo + rays + core, twinkle) | ✅ done |
| 4 | `ContourField` (marching squares) + smoothed strokes | ✅ done (labels still pending font) |
| 5 | `FacetedField` (jittered mesh + edge particles) | ✅ done |
| 6 | Designer console UI (sliders, segmented pills, palette/style) | ✅ done |
| 7 | AsyncStorage persistence (Save / Reset) | ⏳ |
| 8 | Polish + perf passes (Skia atlas for glyphs, batched paths) | ⏳ |

After step 1 you should see the particle starry-sky preset look essentially
identical to the web version. Each subsequent step unlocks another style or
control surface.

## Brand tokens

`src/tokens.ts` is a verbatim copy of
`~/Desktop/noon-academy-design-system-main/rn/tokens.ts`. If upstream tokens
change, re-copy. Lab-specific palettes (PALETTES, FACET_HIGHLIGHTS,
PARTICLE_COLORS, EDGE_PARTICLE_PALETTES) live in `src/lab/charsets.ts` so
the design-system file stays untouched.
