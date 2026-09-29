/* Blue Bay Diner concept site — nav + disclosure banner behaviour.
   Element contract matches the mobile-interaction QA harness:
     #concept-banner / #concept-banner-close  -> banner uses the `hidden` PROPERTY
     #nav-toggle / #nav-menu                  -> nav uses the `hidden` CLASS
   Dependency-free so the page also works from file://. */
(function () {
  "use strict";

  /* ---------- disclosure banner: dismisses AND persists across reload ---------- */
  var BANNER_KEY = "bbd-concept-banner-dismissed";
  var banner = document.getElementById("concept-banner");
  var closeBtn = document.getElementById("concept-banner-close");

  function dismissed() {
    try { return window.sessionStorage.getItem(BANNER_KEY) === "1"; }
    catch (err) { return false; } // storage blocked -> just show it
  }

  if (banner) {
    if (dismissed()) { banner.hidden = true; } else { banner.hidden = false; }
  }
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
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setNav(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNav(false);
    });
  }
})();
