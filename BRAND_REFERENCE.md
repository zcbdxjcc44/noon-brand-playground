# Noon Academy — Brand Restyle Reference

Quick reference for picking up new prototype work on this playground.

## The aesthetic in one paragraph

Noon Academy's v3 design system is **Saudi-native, Empty-Quarter geometry, surveyor's-notebook craft, cartographic precision**. The dominant frame is a dark "void" canvas (the night sky) with paper-cream "specimens" (the slides, notebook documents) embedded inside. Identity colors (terra, iris, gold) are used as journey/role markers rather than UI chrome — the chrome itself stays calm. Typography pairs Crimson Pro serif for headlines and brand voice with Vazirmatn for UI and JetBrains Mono for captions/timers/counters. The recurring shape language is corner ticks, dashed gold rules, caps labels with wide tracking — all borrowing from a surveyor's notebook, not a generic dashboard.

## Source of truth

- **Design system upstream**: `/Users/ji/Desktop/noon-academy-design-system-main 2/rn/tokens.ts` — single source of truth, mirrored into this playground.
- **Web tokens**: `assets/colors_and_type.css` — translates the TS tokens into CSS custom properties, plus keeps legacy aliases (`--chalk`, `--rule`, etc.) so older pages don't break.
- **RN tokens (copied verbatim)**: `rn-bg-lab/src/tokens.ts`.

If upstream changes, re-sync both web CSS and `rn-bg-lab/src/tokens.ts`.

## Dual theming

Every page can render in **void mode** (dark, default) or **paper mode** (cream/white). They share semantic variable names; only the values flip.

| | Void | Paper |
|---|---|---|
| `--bg` | `#0a0f1a` | `#f2ece0` |
| `--bg-sunken` | `#060913` | `#e8e1d2` |
| `--bg-raised` | `#10172a` | `#fbf8ef` |
| `--bg-overlay` | `#1a2236` | `#fbf8ef` |
| `--fg` | `rgba(232,228,220,1)` | `#0a0f1a` |
| `--accent` | `#64D8AE` (noon-400) | `#2A8A6A` (noon-600) |
| Elevation | inset brighter borders | real drop shadows |

Activate paper mode via `<html class="paper-mode">` (the CSS file scopes the second token block under that class).

## Color palette + role conventions

The tokens are organized by hue family with numeric weights, mostly 100 (lightest tint) → 800 (darkest):

- **void** 50, 100, 200, 300, 400 — dark surfaces. `void-300 = #0a0f1a` is the canonical bg.
- **chalk** 100, 200, 300, 400 — light surfaces / fg on dark.
- **paper** 100, 200, 300 — cream tones for paper-mode bg and paper-on-void specimens.
- **noon** 100–800 — brand green/teal. The accent / primary-action color.
- **gold** 200–600 — `--signal`. Journey, time, waypoints, "in transit" affordances.
- **iris** 300–800 — purple. The voice-tutor color and "raised hand" state.
- **blue** 300–500 — secondary identity.
- **danger** 300–500 — errors, leave actions, the teacher's red ink mark on slides.
- **warn** 300–500 — gold-adjacent warning.
- **terra** 200–800 — warm earth tone. Classroom warmth, count badges, hassan/H avatar.

**Role mnemonic:** noon = action; gold = signal/journey; iris = voice; terra = warmth; danger = errors; coral (`rgba(232,117,90,…)`) = active speaker rim.

## Semantic CSS variables

Use these instead of raw palette numbers — they auto-flip with theme.

| Surface | Foreground | Lines | Accent family (×4) |
|---|---|---|---|
| `--bg` | `--fg` | `--border` | `--accent`, `--accent-soft`, `--accent-border`, `--accent-glow` |
| `--bg-sunken` | `--fg-muted` | `--border-strong` | `--signal`, `--signal-bright`, `--signal-soft`, `--signal-border` |
| `--bg-raised` | `--fg-subtle` | `--divider` | `--iris`, `--iris-soft`, `--iris-border`, `--iris-label`, `--iris-dot` |
| `--bg-overlay` | `--fg-faint`, `--fg-disabled` | `--hover-overlay`, `--active-overlay`, `--selected-overlay` | `--terra`, `--terra-soft`, `--terra-border` |
| `--input-bg` | `--fg-inverse` | | `--danger`, `--danger-soft`, `--danger-border` |

For ad-hoc tints, use `color-mix(in srgb, var(--TOKEN) N%, transparent)` so values stay theme-aware.

## Typography

| Family | Use | CSS var |
|---|---|---|
| Crimson Pro (serif) | headlines, slide titles, brand voice; italics for emphasis | `--font-serif` |
| Vazirmatn (sans) | UI body, labels, names, buttons | `--font-sans` |
| JetBrains Mono | timers, slide counters, caps captions, counts, numerical readouts | `--font-mono` |
| Noto Naskh Arabic | Arabic content alongside Vazirmatn | `--font-arabic` |

**Caps labels** are a recurring pattern: mono or sans, 9–11px, `letter-spacing: 0.18–0.22em`, `text-transform: uppercase`, color usually `--fg-faint`, `--signal`, or accent. Wide tracking is the giveaway.

**Bilingual labels** stack Arabic above English when a single phrase needs both — see `.cin-label`, `.sands-label`, `.grn-label` in `presenter-opening.html`.

Font weights: 300, 400, 500, 600, 700. Headlines mostly 500 Crimson, UI mostly 500–600 Vazirmatn, captions 500 mono.

## Spacing, radii, elevation

```
--sp-0 0 · --sp-0.5 2 · --sp-1 4 · --sp-2 8 · --sp-3 12 · --sp-4 16
--sp-5 20 · --sp-6 24 · --sp-7 32 · --sp-8 40 · --sp-9 48 · --sp-10 64 · --sp-11 80 · --sp-12 96

--r-0 0 · --r-1 2 · --r-2 4 · --r-3 6 · --r-4 8 · --r-pill 999

--elev-1 … --elev-4   (different definitions per mode)
```

Void elevation uses inset bright borders (`borderWidth + borderColor` increases). Paper elevation uses real drop shadows. Cards on void are slightly "raised" by the brighter border, not a shadow.

## Shape & motion vocabulary

The recurring "noon brand" tells via these conventions:

- **Surveyor's corner ticks** — 8×10px L-brackets in `--signal-border` at opposite card corners. Used on the breakout component, slide canvas chrome, team cards. CSS pattern: `::before` and `::after` with two-sided `border-top + border-right` (or bottom-left for the opposite corner), positioned at `top: -1px right: -1px`.
- **Dashed gold rule** — `1px dashed var(--signal-soft)` or `1.5px dashed var(--rule-gold)`. Used as a "closed transmission" / "in-transit" affordance: separates breakout header from items, signals stage-view classrooms that aren't speaking, divides upper from lower panels.
- **Dashed gray rim** — same vocabulary as gold but in `rgba(232,228,220,0.30)`. Used on focus-tile and member__circle when the speaker is the teacher in PiP — the main view is passive, so the rim is "muted".
- **Solid coral rim + 3s breath** — the active-speaker signal across `member__circle`, `focus tile`, and presenter PiP. Coral = `rgba(232,117,90,…)`. The breath animation is a `box-shadow` pulse, 3s ease-in-out, 0.85→1.15 in the aura version.
- **Gold waypoint diamond** — 10–14px `--signal-bright` square rotated 45°, anchored above member circles in stage view. Static (doesn't pulse) so it stays a landmark.
- **Per-identity tinted-initial avatars** — across teacher-classroom and team-up. Each user/team gets a stable `color-mix(in srgb, TINT 14%, transparent)` bg + `35%` border + tint-colored letter. Tints cycle terra / iris / noon / gold (sometimes blue / danger / chalk).
- **Slide-thumb unified tag** — every slide preview shows the same chip at bottom-left: `[type-icon] [number]`. Icons differentiate slide / video / activity / break. Active slide gets `--accent` border + tint on the tag.
- **Paper specimen in void chrome** — the teacher-classroom canvas is a paper-100 rectangle floating inside a void-300 page. Same metaphor as the focus tile in the presenter view. The teacher's red ink marks (circle + arrow) sit on top in `--danger @ 85%`.

## Brand voice / language

When wording UI copy, lean cartographic / expedition:

- "Waypoint" instead of "marker"
- "Party" / "team" / "route" instead of "group" / "channel"
- "In transit" for loading or pending states
- "Closed transmission" for muted (visually = dashed)
- "Specimen" for the paper slide
- Caps + dot-separated for status strips: `LIVE · 47:32 ELAPSED · SLIDE 04 / 12`

Avoid generic dashboard verbs ("submit", "OK"). Prefer "Start", "Send", "Leave class", "Enter".

## Asset library

- `assets/colors_and_type.css` — token CSS + legacy aliases
- `assets/teacher-ali.jpg.png` — teacher photo
- `assets/classroom-a.jpg`, `classroom-b.jpg`, `classroom-d.jpg` — classroom photos
- `assets/teams/` — 8 illustrative team avatars (Cloud, Crystal, Fire, Lightening, Rainstorm, Tornado, Tsunami, Volcano). Each carries a natural dominant hue mapped to a brand color (Cloud→chalk, Crystal→iris, Fire→danger, Lightning→gold, Rainstorm→blue, Tornado→chalk-400, Tsunami→noon, Volcano→terra).
- `assets/noon-logo.svg`

## Prototype pages

| Page | What it explores |
|---|---|
| `presenter-opening.html` | Teacher's pre-class flow: team-up → countdown → teacher solo → slides. Stage view as opt-in. Mock-state cycling for the lobby. 5 countdown styles (Mission, Cinema, Sands, Grain, Cosmos). Background lab integration. |
| `presenter-screen.html` | Teacher's mid-class view: paper-canvas slide + focus tile with rotating speaker (teacher PiP + classroom main view), stage roster, class chat. Stage view variant for cameras-as-waypoints. |
| `teacher-classroom.html` | Void-mode teacher's classroom canvas with toolrail, top participants strip, paper slide specimen with ink marks, slidenav with breakout, right sidebar (chat + composer). |
| `teacher-classroom-paper.html` | Paper-mode variant of the above (paper-on-paper). |
| `noon-bg-lab.html` | Background lab — generative canvas presets used as backdrop in `presenter-opening`. |
| `login.html`, `cheer-all.html` | Earlier-stage screens using the legacy alias CSS. |

## presenter-opening sequence model

Phases live on `data-phase` of `.app`:

```
teamup → countdown → teacher → slides   (auto-progress)
                                stage   (opt-in via Skip-to only)
```

- **teamup** is the new opener. Holds until the teacher clicks the bottom-right `Start class →` button (manual). Runs a 0→24 simulation of students arriving, picking teams, and forming teams (~12s). Roster cap is 24; teams default to 6 of 4.
- **countdown** plays one of 5 styles (Mission Control, Cinematic, Sands, Grain, Cosmos). 5–15s duration. Cinema is the current default.
- **teacher** is a 2–5s solo of the teacher in a coral-rimmed circle.
- **slides** is the live class with slide + sidebar + chat firehose.
- **stage** shows cameras as circular waypoints on the map. Only reachable by clicking the Stage button in the dev panel.

All this is wired through `startSequence()` and `jumpToPhase()` in the page's JS.

## Dev panel knobs (presenter-opening)

Bottom-right floating panel with tabs:

- **Countdown style** — Mission / Cinema / Sands / Grain / Cosmos
- **Sequence** — Skip-to a phase, Duration (5/10/15s), Teacher hold (2/3/5s)
- **Mode** — Team / Solo (team-up phase: team grid vs attendance grid)
- **Card layout** — Side / Stacked (team card: sidebar-left vs stacked-on-top)
- **Backdrop** — Stars density, glow tier, north star, landscape (off / topo / dunes / 6 generative lab presets)
- **Replay** restarts from team-up

Panel starts closed by default. Click the handle pill to expand.

## When making something new

A quick checklist that keeps things on-brand:

1. **Pick the right token, not the hex.** Reach for semantic vars (`--bg-raised`, `--fg-muted`, `--accent`, `--signal`) before grabbing a palette number. They auto-flip with theme.
2. **Caps captions in mono.** Wide tracking, lowercase nope, `--fg-faint` or `--signal` for color. Acts as the page's "surveyor's caption" layer.
3. **Headlines in Crimson, italic for emphasis.** Don't bold for emphasis — italicize a single word inside a Crimson 500 weight line.
4. **Identity via tint, not chrome.** Per-user / per-team color belongs in a 14% bg + 35% border + tinted letter combo on a circle / dot / strip. Not in card fills.
5. **Active vs passive lines.** Solid line = engaged. Dashed = closed transmission / muted / in-transit. Apply the same metaphor across components.
6. **Paper inside void.** When you need a "document feel" (slide, message, formula), drop a paper-100 rectangle into the void canvas. Don't tint the page light.
7. **Coral is reserved.** It's the active-speaker signal across the system. Don't reach for it as a generic accent.
8. **Negative space is allowed.** The cartographic feel needs empty room. Don't fill every cell.

## Workflow notes

- **Repo**: `/Users/ji/Projects/Noon brand Playground` → GitHub: `github.com/zcbdxjcc44/noon-brand-playground`
- **Hosted**: `https://zcbdxjcc44.github.io/noon-brand-playground/` (GitHub Pages, ~1–2 min rebuild after push)
- **Git lock files**: this sandbox occasionally leaves `.git/HEAD.lock` or `.git/index.lock` after a commit. If git complains, clear them: `rm -f .git/HEAD.lock .git/index.lock; find .git/objects -name 'tmp_obj_*' -delete`.

## How to use this file

When starting a new conversation about this project, paste this file in or point the new conversation at it. The new agent will know:

- What the design system is and why it looks the way it does
- Where the tokens live
- The shape, color, and motion vocabulary
- The prototype pages and what they explore
- Where to commit + how the deploy works
