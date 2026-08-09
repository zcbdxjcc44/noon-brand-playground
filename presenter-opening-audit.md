# Design Critique: Presenter Opening vs. Empty Quarter (latest brand system)

Audited: `presenter-opening-empty-quarter.html` · Reference: `empty-quarter-visual-style_4-LATEST.html` (vercel export, replaces V2.2) · July 2026

> **Status — fixes applied.** Heavy display numerals (800, cropped tight); sands route recolored to water with a green arrival diamond; crest names moved onto a plain family-color band; bilingual pairs added (count chips, picking label, mission unit, teacher sub, chat title); students-here dot → green, teams dot → water; me-avatar neutralized; chips → 4px radius; mute/pressed states moved from danger to Heat; pinboard no longer layer-faded during countdown; labels normalized to 11px mono; functional icon strokes normalized to 2px; Arabic labels one weight step heavier; teacher name → Title register.
> **Still open (flagged, not changed):** spacing tokens 12/20 vs the 8-base scale (conflicts with the guide's own 20px gutter — needs a brand-team call); round icon buttons (platform convention); team icons as full-color pictorial art (long-term redraw opportunity).

### Overall Impression

The prototype already speaks the system's language where it matters most — ink instrument surface, patterns used as landscape and ceremony, water-blue progression on the mission ring, green rationed to live states and arrival, terracotta always carried by pattern on the slide covers. The biggest gap is typographic: the new guide made display type **heavy** (700–800, "painted-on-the-wall, cropped tight"), while the countdown numerals still follow the retired V2.2 rule of Hanken *Light*. Second biggest: the route grammar is now **water-only**, but the sands waypoint marks still fill terracotta.

---

### 1 · Typography — the retired "light numerals" rule is still live

| Finding | Severity | Recommendation |
|---|---|---|
| Cinema + mission countdown digits are Hanken **300 (Light)**. New guide: display type is 800, cropped tight; there is no "light display numerals" register anymore. | 🔴 | Set countdown digits to 700–800, tracking ≈ −.03em. The sands numeral (weight 600 artwork) can stay stouter since it's a drawn object. |
| Arabic pairing: guide says Plex Arabic sits **one step heavier** (700 vs 800). Countdown Arabic label الحصة تبدأ is 500; slide band name is 700 ✓. | 🟡 | Bump paired Arabic labels one weight step (500→600/700). |
| Micro-labels at 9–10px (mc readouts, chat time, cos-style captions). Guide Label register is **11 / 500 / mono / caps**. | 🟡 | Normalize mono labels to 11px minimum. |
| Teacher name 28/400; guide Title register is 30/500, Subtitle 23/600. | 🟢 | 30/500 for the teacher name, keep the mono sub. |

### 2 · Progression — route is water-only now

| Finding | Severity | Recommendation |
|---|---|---|
| Sands waypoint marks fill **terracotta** when cleared. New guide: "always drawn in water blue and only water blue… green appears exactly once, at arrival." | 🔴 | Cleared diamonds fill `#7C99B4` (water on ink); make the **final** diamond fill green at zero — arrival. |
| Mission ring, lit ticks: water ✓. Morph brightens to green at arrival ✓. | — | Already compliant; the sands fix makes the two variants consistent. |

### 3 · Pattern rules

| Finding | Severity | Recommendation |
|---|---|---|
| Team-card crest sets the **team name directly on the facet lattice** — explicit misuse: "Don't set text directly on the lattice — use a gradient or plain band." | 🔴 | Add a plain band (flat, same family color) or a bottom gradient on the crest where the name sits. |
| Countdown dims the pin field via **layer opacity** (0.5). Guide: "Don't fade pinboard dots — full-strength or absent." Layer-dim ≠ per-dot fade, but it's against the spirit. | 🟡 | Thin the field instead (drop pins by parity, like the facade dissolve) or leave the field at full strength and rely on the vignette. |
| Two pattern languages visible on one screen during countdown (Khatam ceremony + pinboard landscape). Guide scopes the rule to "one surface," and these are separate layers — but the combination is dense. | 🟢 | Acceptable; consider auto-selecting the quiet-line terrain during countdown so the Khatam is the only ornament. |
| Slide title sits over the Khatam texture. The misuse rule targets the *lattice*; the Figma source designs do exactly this. | 🟢 | Keep (matches Figma); watch legibility at projector scale. |

### 4 · Color roles

| Finding | Severity | Recommendation |
|---|---|---|
| Team-up "N / 24 here" count chip uses a **danger-red dot** for arrived students. Red reads as error; these students have *arrived*. | 🟡 | Green dot (live) — or water if green should stay unique to arrival moments. |
| "JI" me-avatar is a **green-filled circle** — green must never be decoration; it's the button/live color only. | 🟡 | Neutral ink-3 fill with cream initials (or a decorative family fill). |
| Mute pip uses danger red. V2.2 assigned *mute* to Heat; new guide keeps danger undefined and says "Heat is not danger." | 🟢 | Consider ember for mute; keep danger for destructive actions only. |
| Ember usage is otherwise rationed correctly ✓ (no ember fields, no ember buttons). | — | — |

### 5 · Grid, spacing, radius

| Finding | Severity | Recommendation |
|---|---|---|
| Spacing tokens include 12 and 20 (`--sp-3`, `--sp-5`) — off the 8-base scale (4 · 8 · 16 · 24 · 36 · 56 · 96). | 🟡 | Token pass: 12→8 or 16, 20→16 or 24. (Note: the guide's own layout gutter is 20 — worth resolving with the brand team.) |
| Radius: `--r-3: 6px` is off the scale (3–4 chips · 8 cards · 12 modals); count chips and icon buttons use **pill 999**. | 🟡 | Chips → 4px. Round icon buttons are a device convention — flag, don't necessarily change. |
| Cards use 8px radius ✓, base unit 8 mostly holds elsewhere ✓. | — | — |

### 6 · Voice & bilingual

| Finding | Severity | Recommendation |
|---|---|---|
| "Bilingual as equals" — only the countdown label is bilingual. Mission readouts, count chips, "still picking," "Class chat," "Teacher · Live" are English-only. | 🔴 (systemic) | Add Arabic pairs using the established one-line-two-directions label pattern, starting with the labels a classroom actually reads: count chips, picking label, teacher sub, chat title. |
| Tone: calm, specific, no exclamation ✓. | — | — |

### 7 · Iconography

| Finding | Severity | Recommendation |
|---|---|---|
| Functional icons mix stroke weights (1.5 / 2 / 2.5). New construction: one 2px stroke, round caps/joins. | 🟢 | Normalize to 2px. |
| Team icons are full-color pictorial SVGs — outside the "drawn like a plan" single-line language. They're inherited product assets. | 🟢 (opportunity) | Longer-term: redraw the eight team marks as line-construction objects in their decorative family colors. |

### Accessibility spot-checks

- Cream on ink 12.4:1 ✓ · water on ink 5.0:1 ✓ · ember on ink 4.5:1 = AA-Large only (no small ember text remains ✓).
- Cream 55% labels on ink ≈ 5.5:1 — passes AA, but at 9–10px sizes readability is marginal → same fix as the 11px label rule.
- Slide cover: cream on terracotta 3.8:1 — display-scale only, which is how it's used ✓.

### What Works Well

- Ink as the instrument surface, patterns as *place* (terrain, ceremony, map) rather than decoration — the three landscape directions all read as canonical constructions.
- Semantic rationing: one green moment (arrival morph), water for progression, heat only for genuine urgency, decorative families stable per team.
- Motion register: ticks settle, the Khatam turns glacially, one thing glows.
- Terracotta never bare: both slide covers carry the Khatam texture; the logo sits over pattern.
- The sands → teacher handoff through the persistent Khatam is exactly the "ceremony means something" behavior the guide asks for.

### Priority Recommendations

1. **Make the countdown numerals heavy (700–800, cropped tight)** — the single most visible divergence from the new type system.
2. **Water-only route grammar in sands** — cleared diamonds fill water, the last one green: arrival.
3. **Plain band behind the crest team name** — clears an explicit pattern-misuse rule.
4. **Bilingual label pass** — the guide's "equals" principle is currently only honored at the countdown.
5. **Color-role cleanup** — green student dot instead of red, neutral me-avatar, chip radius 4, then the 8-base spacing token pass.
