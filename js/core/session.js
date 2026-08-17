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
 * The only helper here is defaultSession(), which exists because the shape had
 * to stop being duplicated (see below). There is deliberately no resetSession()
 * and there are no accessors: the 87 property writes and the one full
 * reassignment all stay with their callers in index.html.
 *
 * The "use strict" directive is not new — it is the mode this declaration
 * already ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

/* Transient per-view state. Never persisted — it dies with the page.
 *
 * The shape lives in one place because it used to live in two. resetProgress
 * carried its own copy of this literal and had drifted to seven of the eleven
 * fields, dropping gaps, optOrder, gloss and shadow. gaps and optOrder are
 * indexed without guards, so the first gap-fill or shuffled-option exercise
 * after a reset threw a TypeError; a reload cleared it, which is why it stayed
 * hidden. Both call sites now build from here.
 *
 * This mirrors defaultState() in state.js deliberately — same pattern, same
 * reason — but the two must not be merged: state is persisted, session is not.
 */
function defaultSession(){
  return { answers:{}, feedback:{}, built:{}, matched:{}, revealed:{}, gaps:{}, optOrder:{},
           queue:null, qIndex:0, gloss:null, shadow:null };
}
var session = defaultSession();
