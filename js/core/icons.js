/* Drumul spre Romana — inline SVG icons.
 *
 * Extracted verbatim from index.html. Nine helpers that each return one inline SVG string. No arguments, no state,
 * no DOM access, no `this` — the markup is returned, never inserted, and the
 * caller decides where it lands.
 *
 * Kept as six separate functions on purpose. A generic icon(name) factory
 * would read better and make every call site indirect for no gain: the set is
 * fixed, the strings are literals, and the current shape is what the callers
 * already expect.
 *
 * The "use strict" directive is not new — it is the mode these functions
 * already ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

function iconMenu(){ return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'; }
function iconFlame(){ return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2s-6 6-6 11a6 6 0 0012 0c0-2-1-3-1-3s-1 2-3 2c-2 0-2-2-1-4 0 0-1 0-1-6z"/></svg>'; }
function iconPlay(){ return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'; }
/* A square, not pause bars: Speech.stop() resets playback rather than holding
   its position, and offering a pause glyph would promise a resume that does
   not exist. */
function iconStop(){ return '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>'; }
function iconCheck(){ return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>'; }
function iconLock(){ return '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>'; }
function iconMoon(){ return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>'; }
function iconSun(){ return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'; }
function iconFeedback(){ return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16a1 1 0 011 1v9a1 1 0 01-1 1H10l-5 4v-4H4a1 1 0 01-1-1V6a1 1 0 011-1z"/></svg>'; }
