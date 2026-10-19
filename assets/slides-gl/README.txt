Image slides for the GUIDING LIGHTS presenter (presenter-opening.html).

This folder is the presenter's own deck. The other two — slides-chemistry
and slides-band — belong to earlier explorations and are kept in the picker
only for comparison; put new Guiding Lights exports here.

01.png is the first slide you will see.

02.png, 03.png, ...        content pages AFTER the first slide
                           (click the RIGHT half of the slide to advance)

cover-01.png, cover-02.png, ...   cover pages BEFORE it
                           (click the LEFT half; cover-01 is reached first)

Gaps in numbering are fine — every number up to the cap is probed in
parallel, so 03.png without 01/02 still loads.
Caps for this deck are set in presenter-opening.html (DECKS): 20 pages,
8 covers. Raise them there if you need more.

Export from Figma as PNG @1x or @2x, 1920x1080 (16:9 — the stage is 16:9
and the images are object-fit:cover, so anything else will crop).

This is the deck that loads by default (data-deck="gl" on <div class="app">
in presenter-opening.html). The picker's other entries — Chem,
Band — are there for comparison.

The deck opens on the FIRST CONTENT PAGE — covers sit to the left of it.
That holds for every deck, and for whatever the lowest page number happens
to be: a folder starting at 03.png opens on 03.png.
