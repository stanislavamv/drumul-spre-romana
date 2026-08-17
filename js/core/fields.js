/* Drumul spre Romana — focused-field preservation across a redraw.
 *
 * Extracted verbatim from index.html. Two helpers, called once each by
 * renderApp(): one snapshots the focused editable control before #root is
 * replaced, the other puts value, caret and focus back afterwards.
 *
 * They depend on nothing but the DOM — no application state, no session, no
 * rendering code — which is why they can load this early. renderApp() stays in
 * index.html and reaches these as globals.
 *
 * Behaviour worth not breaking, since it is load-bearing rather than incidental:
 *   · captureField returns null unless the active element matches
 *     "input,textarea", so a focused button produces no snapshot.
 *   · restoreField falls back to [data-autofocus] when there is no snapshot key,
 *     which is how fresh pages get their initial focus.
 *   · setSelectionRange is wrapped in try/catch because it throws on input
 *     types that do not support selection.
 *   · restoreField returns early and silently when the field no longer exists
 *     after the redraw — the normal case when navigating away.
 *
 * The "use strict" directive is not new — it is the mode these functions
 * already ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

/* The app redraws by replacing root.innerHTML wholesale. That is simple enough
   to be worth keeping at this size, but it would otherwise discard whatever the
   learner had half-typed. Capture the focused field by its stable data-field id
   and restore value + caret across the swap. Every exercise input must carry a
   data-field attribute for this to work. */
function captureField(){
  var el = document.activeElement;
  if(!el || !el.matches || !el.matches("input,textarea")) return null;
  return {
    key: el.getAttribute("data-field"),
    value: el.value,
    start: el.selectionStart,
    end: el.selectionEnd
  };
}
function restoreField(snapshot){
  var el = snapshot && snapshot.key
    ? document.querySelector('[data-field="'+snapshot.key+'"]')
    : document.querySelector("[data-autofocus]");
  if(!el) return;
  if(snapshot && snapshot.key && el.matches("input,textarea")){
    el.value = snapshot.value;
    try{ el.setSelectionRange(snapshot.start, snapshot.end); }catch(e){}
  }
  el.focus();
}
