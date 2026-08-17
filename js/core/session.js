/* Drumul spre Romana — transient session state.
 *
 * Extracted verbatim from index.html. This is the counterpart to state.js and
 * the boundary between them is deliberate:
 *
 *   state    persistent learner progress; survives reload; written to
 *            localStorage by state.js
 *   session  transient per-view UI and exercise state; dies with the page;
 *            never persisted
 *
 * Nothing here is serialised. writeState() stringifies `state` alone, and
 * `session` is not a key in defaultState(), so a reload rebuilds this object
 * from the literal below. Keep it that way: adding session data to the saved
 * payload would make half-finished exercises survive a refresh, which the
 * exercise engine does not expect.
 *
 * No helpers live here on purpose — no resetSession(), no accessors. The 87
 * property writes and the one full reassignment all stay with their callers in
 * index.html.
 *
 * The "use strict" directive is not new — it is the mode this declaration
 * already ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

/* Transient per-view state. Never persisted — it dies with the page. */
var session = { answers:{}, feedback:{}, built:{}, matched:{}, revealed:{}, gaps:{}, optOrder:{},
                queue:null, qIndex:0, gloss:null, shadow:null };
