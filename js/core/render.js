/* Drumul spre Romana — the render loop and the router entry point.
 *
 * Extracted verbatim from index.html. Five declarations that together are the
 * beating heart of the app: the page registry, the frame-coalescing flag, the
 * function that paints, the function that schedules a paint, and the function
 * that changes route.
 *
 * PAGES is declared here EMPTY on purpose. The 21 page implementations are
 * still assigned inline in index.html as `PAGES.home = function(){...}`, and
 * they populate this very object — nothing anywhere reassigns, freezes, seals,
 * deletes from or aliases it, so there is exactly one PAGES for the whole
 * application. This file must therefore load BEFORE the inline script, which
 * both assigns those pages and calls render()/navigate().
 *
 * render() coalesces bursts of state changes into a single repaint through
 * frameQueued. The hidden-document branch is not defensive padding:
 * requestAnimationFrame never fires in a background tab, so without the
 * setTimeout fallback a course opened in a background tab — or restored on
 * session restart — would sit blank until it was focused.
 *
 * navigate()'s same-route branch calls render() directly, because assigning an
 * unchanged location.hash fires no hashchange event and the page would
 * otherwise never repaint. That single line is why navigate could not leave the
 * IIFE until render became a global; it is preserved exactly.
 *
 * The hashchange listener itself deliberately stays inline in index.html.
 *
 * The "use strict" directive is not new — it is the mode these declarations
 * already ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

var PAGES = {};

var frameQueued = false;

function renderApp(){
  document.body.className = state.settings.reduceMotion? "reduce-motion":"";
  var snapshot = captureField();
  var route = parseHash();
  /* hasOwnProperty, not a truthiness test: "#/__proto__" reaches
     Object.prototype, which is truthy but not callable, so the || fallback
     never fires and renderApp throws instead of showing home. */
  var page = Object.prototype.hasOwnProperty.call(PAGES, route.page)
    ? PAGES[route.page] : PAGES.home;
  document.getElementById("root").innerHTML = renderTopbar() + page(route.params||[]);
  restoreField(snapshot);
  updateScrollTop();
}

function render(){
  if(frameQueued) return;          // collapse bursts of state changes into one paint
  frameQueued = true;
  /* requestAnimationFrame never fires in a hidden tab, so a course opened in a
     background tab — or restored on session restart — would sit blank until it
     was focused. Fall back to a timer whenever the document is hidden. */
  var run = function(){ frameQueued = false; renderApp(); };
  if(document.hidden) setTimeout(run, 0);
  else requestAnimationFrame(run);
}

function navigate(page, params){
  var p = "#/"+page+(params&&params.length? "/"+params.map(encodeURIComponent).join("/") : "");
  if(location.hash===p){ render(); } else { location.hash=p; }
  window.scrollTo(0,0);
}
