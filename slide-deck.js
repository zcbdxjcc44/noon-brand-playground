/*! slide-deck.js — click-through image decks for HTML prototypes.
 *
 *  Extracted from presenter-opening-empty-quarter.html. No dependencies,
 *  no build step, no framework. Drop the file next to your prototype and:
 *
 *      <div id="myDeck"></div>
 *      <script src="slide-deck.js"></script>
 *      <script>SlideDeck.mount('#myDeck', { dir: 'assets/my-slides/' });</script>
 *
 *  WHAT IT DOES
 *  ------------
 *  • Discovers PNG exports by filename — no manifest to maintain. Drop a
 *    new export in the folder, reload, and it's in the deck.
 *        01.png, 02.png, …          content pages, in order
 *        cover-01.png, cover-02.png  alternate covers, placed BEFORE them
 *  • Discovery is GAP-TOLERANT: every number up to the cap is probed in
 *    parallel, so 03.png without 01/02 still loads. Missing numbers are
 *    skipped, never treated as "stop here".
 *  • Splits the deck area in half: click the right side for the next
 *    slide, the left side for the previous. Clamped at both ends.
 *    ArrowRight / ArrowLeft work too, gated by an optional isActive().
 *  • Slide changes are an INSTANT CUT. A fade would expose whatever sits
 *    beneath the incoming slide for a frame — on a prototype with a
 *    static cover underneath, that reads as a flash back to the cover.
 *  • Supports an "anchor" slide: a native HTML slide you author yourself
 *    that the images sit around (covers to its left, pages to its right).
 *    That's how the band style works — its cover stays real markup.
 *
 *  OPTIONS  SlideDeck.mount(target, options)
 *  ----------------------------------------
 *    dir        'assets/slides/'  folder holding the exports (trailing /)
 *    ext        '.png'            file extension
 *    pages      30                highest content-page number to probe
 *    covers     12                highest cover number to probe
 *    coverPrefix 'cover-'         filename prefix for alternate covers
 *    anchor     null              selector/element of a native slide to
 *                                 keep in the middle of the order; the
 *                                 deck opens on it. null = open on the
 *                                 first content page.
 *    keys       true              enable arrow-key navigation
 *    isActive   () => true        guard — return false to ignore keys
 *                                 (e.g. when another view is showing)
 *    onChange   null              fn(index, total, src) after each change
 *
 *  RETURNS a controller: { next(), prev(), go(i), index(), count(), destroy() }
 *  The promise resolves once discovery finishes.
 */
(function (global) {
  'use strict';

  var STYLE_ID = 'slide-deck-css';
  var CSS = [
    /* the host keeps its own box — we only guarantee a positioning
       context so the slides can pin to it. Forcing position:absolute
       here would rip the host out of the page layout. */
    '.sd-deck{overflow:hidden}',
    '.sd-slide{position:absolute;inset:0;display:none}',
    /* instant cut — never fade, or the layer beneath shows through */
    '.sd-slide.is-active{display:block}',
    '.sd-slide img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}',
    '.sd-nav{position:absolute;inset:0;display:flex;direction:ltr;z-index:5}',
    /* zones are spatial, not reading-order: left is always "previous",
       even when the slide content itself is RTL */
    '.sd-nav button{flex:1;border:0;background:transparent;padding:0;margin:0;cursor:pointer}',
    '.sd-nav button:focus{outline:none}'
  ].join('');

  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;
    var el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  /* Probe numbered files in parallel and resolve with the numbers that
     exist, ascending. Parallel + collect-all is what makes gaps safe:
     a sequential "stop at first miss" loop silently drops everything
     after a hole in the numbering. */
  function probe(dir, prefix, ext, cap) {
    return new Promise(function (resolve) {
      if (cap < 1) { resolve([]); return; }
      var found = [], pending = cap;
      for (var n = 1; n <= cap; n++) {
        (function (k) {
          var im = new Image();
          im.onload = function () { found.push(k); if (--pending === 0) resolve(found.sort(function (a, b) { return a - b; })); };
          im.onerror = function () { if (--pending === 0) resolve(found.sort(function (a, b) { return a - b; })); };
          im.src = dir + prefix + pad(k) + ext;
        })(n);
      }
    });
  }

  function mount(target, opts) {
    injectCSS();
    opts = opts || {};
    var dir = opts.dir || 'assets/slides/';
    var ext = opts.ext || '.png';
    var capPages = opts.pages == null ? 30 : opts.pages;
    var capCovers = opts.covers == null ? 12 : opts.covers;
    var coverPrefix = opts.coverPrefix || 'cover-';
    var useKeys = opts.keys !== false;
    var isActive = opts.isActive || function () { return true; };
    var onChange = opts.onChange || null;

    var root = typeof target === 'string' ? document.querySelector(target) : target;
    if (!root) return Promise.reject(new Error('SlideDeck: target not found'));
    root.classList.add('sd-deck');
    // slides pin to the host, so it must establish a positioning context
    if (getComputedStyle(root).position === 'static') root.style.position = 'relative';

    var anchor = opts.anchor
      ? (typeof opts.anchor === 'string' ? document.querySelector(opts.anchor) : opts.anchor)
      : null;

    // click zones — appended last so they sit above the slides
    var nav = document.createElement('div');
    nav.className = 'sd-nav';
    var prevBtn = document.createElement('button');
    prevBtn.setAttribute('aria-label', 'Previous slide');
    var nextBtn = document.createElement('button');
    nextBtn.setAttribute('aria-label', 'Next slide');
    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    root.appendChild(nav);

    var slides = [];    // entries: DOM element, or null for the anchor
    var srcs = [];      // parallel array of sources ('' for the anchor)
    var cur = 0;
    var keyHandler = null;

    function makeSlide(src) {
      var sec = document.createElement('div');
      sec.className = 'sd-slide';
      var im = document.createElement('img');
      im.decoding = 'sync';   // avoid a blink on first reveal
      im.alt = '';
      im.src = src;
      sec.appendChild(im);
      root.insertBefore(sec, nav);
      return sec;
    }

    function show(i) {
      cur = Math.max(0, Math.min(slides.length - 1, i));
      for (var k = 0; k < slides.length; k++) {
        if (slides[k]) slides[k].classList.toggle('is-active', k === cur);
      }
      // the anchor is plain markup underneath; hide it unless it's current
      if (anchor) anchor.style.visibility = (srcs[cur] === '') ? '' : 'hidden';
      if (onChange) onChange(cur, slides.length, srcs[cur]);
    }

    var api = {
      next: function () { show(cur + 1); return api; },
      prev: function () { show(cur - 1); return api; },
      go: function (i) { show(i); return api; },
      index: function () { return cur; },
      count: function () { return slides.length; },
      destroy: function () {
        if (keyHandler) document.removeEventListener('keydown', keyHandler);
        slides.forEach(function (s) { if (s) s.remove(); });
        nav.remove();
        if (anchor) anchor.style.visibility = '';
      }
    };

    return Promise.all([
      probe(dir, coverPrefix, ext, capCovers),
      probe(dir, '', ext, capPages)
    ]).then(function (res) {
      var covers = res[0], pages = res[1];

      // order: [highest cover … cover-01] [anchor] [pages ascending]
      // covers descend leftward so cover-01 is the first one you reach
      covers.slice().reverse().forEach(function (k) {
        var src = dir + coverPrefix + pad(k) + ext;
        slides.push(makeSlide(src)); srcs.push(src);
      });
      if (anchor) { slides.push(null); srcs.push(''); }
      pages.forEach(function (j) {
        var src = dir + pad(j) + ext;
        slides.push(makeSlide(src)); srcs.push(src);
      });

      if (!slides.length) { nav.remove(); return api; }

      nextBtn.addEventListener('click', api.next);
      prevBtn.addEventListener('click', api.prev);
      if (useKeys) {
        keyHandler = function (e) {
          if (!isActive()) return;
          if (e.key === 'ArrowRight') api.next();
          if (e.key === 'ArrowLeft') api.prev();
        };
        document.addEventListener('keydown', keyHandler);
      }

      // open on the anchor when there is one, else the first slide
      show(anchor ? covers.length : 0);
      return api;
    });
  }

  global.SlideDeck = { mount: mount, probe: probe };
})(window);
