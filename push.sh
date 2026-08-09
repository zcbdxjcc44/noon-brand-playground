#!/usr/bin/env bash
# Push the EQ teacher-classroom work to the noon-brand-playground repo.
# Remote: origin -> github.com/zcbdxjcc44/noon-brand-playground (branch: main)
set -e

cd "$(dirname "$0")"

# Clear any stale git lock (safe if no git process is actually running).
rm -f .git/index.lock

# Confirm we're pushing to the right place.
echo "Pushing to: $(git remote get-url origin)"

git add \
  teacher-classroom-paper-white-eq.html \
  assets/cover-eq-chemistry.svg \
  assets/activity-cover-openresponse.svg \
  assets/activity-cover-squid.svg \
  assets/activity-openresponse.svg \
  assets/activity-squid.svg \
  assets/sine-wave.jpg \
  assets/sine-wave.mp4

git commit -m "Add EQ teacher classroom (paper-white): activity covers + content slides"
git push origin main

echo "Done."
