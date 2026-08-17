/* Drumul spre Romana — navigation tab state.
 *
 * Extracted verbatim from index.html. Which navigation tab counts as active for a given route.
 *
 * Takes the route page as an argument rather than reading the hash itself, so
 * it stays a pure function of its two inputs. Both renderTopbar and mobileNav
 * call it, which is why it lives here rather than in icons.js: it is a
 * navigation rule, not a piece of iconography.
 *
 * The two alias groups are load-bearing. Lesson-shaped routes keep Learn lit,
 * and reading/writing keep Practice lit, so a learner never sees the whole nav
 * bar go dark mid-task. An unknown route deliberately matches nothing.
 *
 * The "use strict" directive is not new — it is the mode these functions
 * already ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

function navIsActive(id, routePage){
  if(id===routePage) return true;
  if(id==="home") return ["home","lesson","unit","lessondone","exam"].indexOf(routePage)>-1;
  if(id==="practice") return ["reading","writing"].indexOf(routePage)>-1;
  return false;
}
