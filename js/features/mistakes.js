/* Drumul spre Romana — mistake notebook.
 *
 * Extracted verbatim from index.html. Records a wrong answer so the learner can
 * revisit it later.
 *
 * Depends on uid() and todayStr() from utils.js, and `state` and persist() from
 * state.js.
 *
 * Two details worth keeping: entries go in with unshift so the newest is first,
 * and the list is capped at 300 by truncating length rather than popping, which
 * discards the oldest entries in one step. The cap exists because the whole
 * state object is serialised into localStorage on every save, and an unbounded
 * mistake log would grow that payload without limit.
 *
 * rehydrateMistakes(), which repairs imported entries, is part of the progress
 * import path and stays in index.html.
 *
 * The "use strict" directive is not new — it is the mode this function already
 * ran in inside the application IIFE, repeated here because a separate classic
 * script would otherwise default to sloppy mode.
 */
"use strict";

/* ===================== MISTAKE NOTEBOOK ===================== */
function saveMistake(m){
  m.id = uid("mk"); m.date = todayStr();
  state.mistakes.unshift(m);
  if(state.mistakes.length>300) state.mistakes.length=300;
  persist();
}
