#!/usr/bin/env bash
# Push the Noon brand Playground work to the noon-brand-playground repo.
# Remote: origin -> github.com/zcbdxjcc44/noon-brand-playground (branch: main)
#
# RUN THIS FROM YOUR OWN TERMINAL.
# Cowork can read this folder but cannot write inside .git: the mount refuses
# unlink, so every `git add` leaves half-written tmp objects behind and a
# stale index.lock that nothing in the sandbox can clear. Staging and pushing
# therefore have to happen from a real shell. The first two commands below
# clean up after any sandbox attempt.
set -e
cd "$(dirname "$0")"

rm -f .git/index.lock .git/index.lock.stale-*
find .git/objects -name 'tmp_obj_*' -delete 2>/dev/null || true

echo "Pushing to: $(git remote get-url origin)"

# This pass ships only the style guide and the presenter, plus what they load.
# Backups and other working files stay local (see .gitignore).
git add .gitignore push.sh \
  noon-academy-visual-style.html guide-media \
  presenter-opening.html slide-deck.js \
  assets/slides-chemistry assets/slides-gl assets/slides-band assets/teams

git commit -m "Proven Routes: Precision Futurism style guide and presenter

Style guide (noon-academy-visual-style.html)
- Rewritten for Precision Futurism: one focal point per screen, lines with
  one meaning each, luminous white as the only signal
- Palette: the signal (white ring on Void, ink ring on Fog) as a role;
  green is action and the live dot only
- Type: Readex Pro for display and numerals, Vazirmatn for the interface,
  JetBrains Mono for numbers, Doto for status labels
- Lines & patterns: the line system (terrain, route, signal, structure);
  the khatam holds still behind the countdown ring
- Progression: two waypoint forms, numbered and unnumbered; the destination
  is a gold dot in a soft halo
- Shape vocabulary rewritten; misuse section removed
- Presenter videos (guide-media/) re-rendered frame by frame at 30fps

Presenter (presenter-opening.html)
- Countdown: white ring runs down with the seconds, grains flow into it,
  static hairline khatam, Readex numeral
- Teacher solo, slide view and stage view: one white ring on whoever speaks,
  with a slow pulse; muted rooms are a small clay dot
- Team up: large title, dot-matrix join count, teams as rows on a hairline,
  dashed circles for students still picking
- LIVE dot merged into the timer
- slide-deck.js and slide assets included so the deck loads

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016V8fjcyykyt62deayxi6ns"

git push origin main

echo "Done."
echo "Share links (GitHub Pages, about a minute after the push):"
echo "  https://zcbdxjcc44.github.io/noon-brand-playground/noon-academy-visual-style.html"
echo "  https://zcbdxjcc44.github.io/noon-brand-playground/presenter-opening.html"
