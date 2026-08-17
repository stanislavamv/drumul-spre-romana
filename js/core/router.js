/* Drumul spre Romana — hash parsing.
 *
 * Extracted verbatim from index.html. Turns location.hash into {page, params}.
 * Depends on nothing but browser globals (location, decodeURIComponent,
 * Boolean), so it can load at any point before the application script.
 *
 * navigate() is deliberately NOT here. Its body calls render(), which is
 * declared inside the application IIFE and is never assigned to window. Scope
 * resolution is lexical, so a copy of navigate() defined in this file would
 * resolve render against global scope and throw ReferenceError on the
 * location.hash === p branch — the branch taken whenever the learner navigates
 * to the route they are already on. That is reachable in ordinary use, so
 * navigate() and the hashchange listener stay inside the IIFE until render
 * itself is extracted.
 *
 * The "use strict" directive is not new — it is the mode this function already
 * ran in inside that IIFE, repeated here because a separate classic script
 * would otherwise default to sloppy mode.
 */
"use strict";

function parseHash(){
  var h = location.hash.replace(/^#\/?/,"");
  var parts = h.split("/").filter(Boolean).map(decodeURIComponent);
  return {page: parts[0]||"home", params: parts.slice(1)};
}
