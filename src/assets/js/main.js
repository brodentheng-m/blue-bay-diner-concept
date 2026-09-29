/* Blue Bay Diner concept — scroll-scrubbed scene sequence.
   Element contract (asserted by the mobile-interaction QA harness):
     #concept-banner / #concept-banner-close  -> banner uses the `hidden` PROPERTY
     #nav-toggle / #nav-menu                  -> nav uses the `hidden` CLASS

   HOW IT WORKS
   ------------
   #runway is a tall spacer (700vh). Scrolling it drives a single 0..1 progress
   value. That value is split into per-scene segments; during each segment the
   NEXT scene's background is revealed by a `clip-path: circle()` whose radius
   grows from a dot to beyond the viewport corner — so the new scene appears to
   pour out of a point and swallow the old one. Copy blocks cross-fade on the
   same progress, and the scene rail marks the active scene.

   Everything is written on a requestAnimationFrame loop (not CSS scroll-timeline)
   so it works in every engine. */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reduceMotion = false;
  try { reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  catch (err) { reduceMotion = false; }

  /* ---------- disclosure banner: dismisses AND persists across reload ---------- */
  var BANNER_KEY = "bbd-concept-banner-dismissed";
  var banner = document.getElementById("concept-banner");
  var closeBtn = document.getElementById("concept-banner-close");

  function dismissed() {
    try { return window.sessionStorage.getItem(BANNER_KEY) === "1"; }
    catch (err) { return false; }
  }
  if (banner) banner.hidden = dismissed();
  if (closeBtn && banner) {
    closeBtn.addEventListener("click", function () {
      banner.hidden = true;
      try { window.sessionStorage.setItem(BANNER_KEY, "1"); } catch (err) { /* noop */ }
    });
  }

  /* ---------- mobile nav ---------- */
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("nav-menu");

  function setNav(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("hidden", !open);
  }
  if (toggle && nav) {
    setNav(false);
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.querySelectorAll("a").forEach(function (l) {
      l.addEventListener("click", function () { setNav(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNav(false);
    });
  }

  /* ---------- the scene sequence ---------- */
  var runway = document.getElementById("runway");
  var stage = document.getElementById("stage");
  var bgs = Array.prototype.slice.call(document.querySelectorAll(".scene-bg"));
  var copies = Array.prototype.slice.call(document.querySelectorAll(".scene-copy"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".rail-dot"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link[data-scene]"));
  var chip = document.getElementById("credit-chip");
  var dotEl = document.getElementById("wipe-dot");

  var N = bgs.length;              // number of scenes
  var PAUSE = 0.18;                // fraction of each segment spent holding a settled scene
                                   // (lower = the wipe occupies more of the scroll)
  var root = document.documentElement;

  if (!runway || !stage || N < 2) return;

  // Which scenes carry a photo (so we can hide the credit chip on solid scenes).
  var hasPhoto = bgs.map(function (b) { return !b.classList.contains("solid"); });

  // Per-scene wipe origins, as viewport percentages — a slightly different entry
  // point each time so the motion doesn't feel mechanical.
  var ORIGINS = [
    [50, 55], // 0 -> 1  from centre
    [78, 34], // 1 -> 2  upper right
    [24, 62], // 2 -> 3  lower left
    [62, 30], // 3 -> 4  upper centre-right
    [36, 68], // 4 -> 5  lower centre-left
    [50, 42]  // 5 -> 6  centre
  ];

  function easedRadius(t) {
    // Gentler curve: spends more time in the middle of the growth so the wipe
    // reads as a slow expansion rather than a snap. Cubic ease-in-out with a
    // softened centre.
    var e = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
    // bias toward the middle: blend the eased value with a straight ramp
    e = e * 0.55 + t * 0.45;
    return (e * 152).toFixed(2) + "%"; // 152% clears the furthest viewport corner
  }

  var lastScene = -1;
  var ticking = false;
  var runwayTop = null;   // cached absolute offset of #runway

  function paint() {
    ticking = false;

    // Absolute document offset where the runway's top edge sits.
    if (runwayTop === null) {
      runwayTop = runway.getBoundingClientRect().top + (window.pageYOffset || 0);
    }
    // The real ceiling is the DOCUMENT's max scroll, not the runway's height:
    // the sticky stage sits above the runway, so the reachable travel is short
    // by that lead-in. Using runwayH - innerH caps progress below 1 and the last
    // scene never completes.
    var maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    var total = maxScroll - runwayTop;
    if (total <= 0) total = 1;
    var p = ((window.pageYOffset || 0) - runwayTop) / total;
    if (p < 0) p = 0;
    if (p > 1) p = 1;

    root.style.setProperty("--p", p.toFixed(4));

    // Map progress onto (scene index, within-scene progress)
    var seg = 1 / (N - 1);                   // width of one transition segment
    var t = p / seg;                          // 0 .. N-1
    var idx = Math.floor(t);
    if (idx > N - 2) idx = N - 2;
    var within = t - idx;                     // 0..1 inside this transition

    // Hold at the start, wipe, hold at the end.
    var wipe = (within - PAUSE) / (1 - PAUSE);
    if (wipe < 0) wipe = 0;
    if (wipe > 1) wipe = 1;

    // Backgrounds: scene i is fully shown once its wipe completes.
    for (var i = 0; i < N; i++) {
      var bg = bgs[i];
      if (i === 0) { bg.style.setProperty("--reveal", "150%"); continue; }
      var prevIdx = i - 1;
      var r;
      if (i - 1 < idx) r = "150%";            // already revealed
      else if (i - 1 > idx) r = "0%";         // not yet
      else r = easedRadius(wipe);             // wiping in right now
      bg.style.setProperty("--reveal", r);

      var o = ORIGINS[prevIdx] || [50, 50];
      bg.style.setProperty("--ox", o[0] + "%");
      bg.style.setProperty("--oy", o[1] + "%");
    }

    // The visible dot: only while a wipe is actually in flight.
    var o = ORIGINS[idx] || [50, 50];
    if (dotEl) {
      dotEl.style.setProperty("--ox", o[0] + "%");
      dotEl.style.setProperty("--oy", o[1] + "%");
      var dotOp = (wipe > 0.01 && wipe < 0.72) ? (0.72 - wipe) / 0.71 : 0;
      dotEl.style.setProperty("--dot-op", dotOp.toFixed(3));
    }

    // Copy blocks: cross-fade ONLY. A block that has finished arriving is frozen
    // (no residual translate), because a slowly drifting line of text reads as
    // jumpy while you're trying to read it.
    var handover = 0.22;   // text swaps early; the CIRCLE keeps growing slowly after
    var IN_SPAN = 0.26;    // how much of the wipe the incoming block takes to arrive
    for (var j = 0; j < copies.length; j++) {
      var c = copies[j];
      var op, y;
      if (j < idx) { op = 0; y = 0; }                       // already gone: parked, hidden
      else if (j > idx + 1) { op = 0; y = 0; }              // not started: parked, hidden
      else if (j === idx) {
        // outgoing: fade out, drifting a little, then park at 0
        if (wipe <= handover) { op = 1 - (wipe / handover); y = -(wipe / handover) * 10; }
        else { op = 0; y = 0; }
      } else {
        // incoming: rise a short distance to exactly 0, then FREEZE there
        var inT = Math.max(0, Math.min(1, (wipe - handover) / IN_SPAN));
        op = inT;
        y = (1 - inT) * 12;
      }
      if (op < 0) op = 0;
      if (op > 1) op = 1;
      if (Math.abs(y) < 0.05) y = 0;
      c.style.setProperty("--copy-op", op.toFixed(3));
      c.style.setProperty("--copy-y", y.toFixed(2) + "px");
      // Only the most-visible block should be reachable / announced.
      if (op > 0.5) { c.removeAttribute("aria-hidden"); c.style.pointerEvents = "auto"; }
      else { c.setAttribute("aria-hidden", "true"); c.style.pointerEvents = "none"; }
    }

    // Active scene = whichever copy is dominant at this progress.
    var active = (wipe > handover * 0.6) ? idx + 1 : idx;
    if (active !== lastScene) {
      lastScene = active;
      dots.forEach(function (d, k) { d.classList.toggle("is-on", k === active); });
      var label = copies[active] && copies[active].querySelector(".eyebrow");
      navLinks.forEach(function (a) {
        var target = Number(a.dataset.scene);
        a.setAttribute("aria-current", String(target === active));
      });
      if (chip) {
        chip.style.opacity = hasPhoto[active] ? "1" : "0";
      }
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(paint); }
  }

  /* ---------- nav links jump to the scene's scroll offset ---------- */
  navLinks.forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var target = Number(a.dataset.scene);
      if (isNaN(target)) return;
      var top = runway.getBoundingClientRect().top + window.pageYOffset;
      var maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      var span = maxScroll - top;
      var seg = 1 / (N - 1);
      // land just after that scene's wipe has completed
      var frac = target === 0 ? 0 : (target - 1) * seg + seg * 0.92;
      var dest = Math.min(maxScroll, top + span * frac);
      window.scrollTo({ top: dest, behavior: reduceMotion ? "auto" : "smooth" });
      setNav(false);
    });
  });

  if (reduceMotion) {
    // Static: mark the current scene only, no scrubbing.
    dots.forEach(function (d, k) { d.classList.toggle("is-on", k === 0); });
    copies.forEach(function (c, k) {
      c.classList.toggle("is-current", k === 0);
      c.style.setProperty("--copy-op", k === 0 ? "1" : "0");
    });
    bgs.forEach(function (b, k) { b.classList.toggle("is-current", k === 0); });
    return;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { runwayTop = null; onScroll(); }, { passive: true });
  paint();
})();
