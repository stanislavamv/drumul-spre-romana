/* Drumul spre Romana — back-to-top control.
 *
 * Extracted verbatim from index.html: the button, its lazy creation, the
 * visibility update, and the three listeners that belong to it.
 *
 * Only application dependency is state.settings.reduceMotion, which state.js
 * already provides as a global. Everything else is DOM.
 *
 * Why the listeners live here rather than staying behind: the window scroll
 * listener registers updateScrollTop by bare reference, so it captures the
 * function value at registration time. Splitting the registration from the
 * declaration would either capture undefined or silently bind a stale value.
 * The capture-phase document listener is an inline function and would survive a
 * split, but it belongs to the same behaviour and is kept with it.
 *
 * These are the only two scroll listeners in the application, so moving them
 * preserves their order relative to each other and there is no other scroll
 * handler for them to be reordered against. They now register before the
 * delegated click/input/change/keydown listeners in index.html instead of
 * after — unobservable, since those are different event types.
 *
 * renderApp() still calls updateScrollTop() after every redraw; it reaches it
 * as a global from here.
 *
 * The "use strict" directive is not new — it is the mode this code already ran
 * in inside the application IIFE, repeated here because a separate classic
 * script would otherwise default to sloppy mode.
 */
"use strict";

/* ---------- BACK TO TOP ----------
   Course pages, the grammar reference and the verb list all run to several
   screens, and the navigation lives at the very top. The button is created
   once and lives outside the render root, so a redraw does not destroy it
   mid-scroll. */
var scrollTopBtn = null;
function ensureScrollTop(){
  if(scrollTopBtn) return scrollTopBtn;
  scrollTopBtn = document.createElement("button");
  scrollTopBtn.className = "to-top";
  scrollTopBtn.type = "button";
  scrollTopBtn.setAttribute("aria-label", "Back to top");
  scrollTopBtn.title = "Back to top";
  scrollTopBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  scrollTopBtn.addEventListener("click", function(){
    /* Honour the reduce-motion setting rather than always smooth-scrolling. */
    var behavior = state.settings.reduceMotion ? "auto" : "smooth";
    window.scrollTo({top:0, behavior:behavior});
    var main = document.querySelector(".main");
    if(main && main.scrollTop) main.scrollTo({top:0, behavior:behavior});
  });
  document.body.appendChild(scrollTopBtn);
  return scrollTopBtn;
}
function updateScrollTop(){
  var btn = ensureScrollTop();
  var y = window.scrollY || document.documentElement.scrollTop || 0;
  var main = document.querySelector(".main");
  var innerY = main ? main.scrollTop : 0;
  btn.classList.toggle("show", (y + innerY) > 420);
}
window.addEventListener("scroll", updateScrollTop, {passive:true});
document.addEventListener("scroll", function(e){
  /* The scrolling element is sometimes the main column rather than the window,
     depending on viewport width — listen in the capture phase for both. */
  if(e.target && e.target.classList && e.target.classList.contains("main")) updateScrollTop();
}, true);
