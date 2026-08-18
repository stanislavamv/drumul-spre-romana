/* Drumul spre Romana — the session runner.
 *
 * Extracted verbatim from index.html. One function, shared by the four pages
 * that present a queue of exercises one at a time: review, practice, listening
 * and the conjugation drill.
 *
 * Orchestration and presentation only. It decides nothing about correctness —
 * it reads verdicts that js/features/grading.js already recorded into
 * session.feedback, and delegates every pixel of the exercise itself to
 * renderExercise in js/features/exercise-render.js.
 *
 * It also owns no session lifecycle. startQueue() builds the queue and clears
 * per-attempt state; Actions.continueExercise advances session.qIndex and sets
 * session.sessionDone. runSession only READS session.qIndex, session.feedback
 * and session.sessionDone, and writes nothing at all — including qIndex, which
 * it clamps into range for display without storing the clamped value back.
 *
 * Contract worth keeping in view: `scorable` excludes items whose verdict is
 * "submitted". That is the ungradeable free-writing verdict, and leaving it in
 * the denominator would score a learner down for work the app deliberately
 * declines to grade — the same rule finishLesson applies.
 *
 * An empty queue returns the .empty-state message rather than a question. The
 * four callers all guard on session.queue being set, but [] is truthy, so this
 * branch is genuinely reachable.
 *
 * The "use strict" directive is not new — it is the mode this function already
 * ran in inside the application IIFE, repeated here because a separate classic
 * script would otherwise default to sloppy mode.
 */
"use strict";

function runSession(title, subtitle, exercises, opts){
  opts = opts||{};
  if(!exercises.length) return '<div class="empty-state">'+escapeHtml(opts.emptyMsg||"Nothing to practice right now.")+'</div>';
  var i = clamp(session.qIndex,0,exercises.length-1);
  var ex = exercises[i];
  var answered = exercises.filter(function(e){ return session.feedback[e.id]; }).length;
  var correct = exercises.filter(function(e){ var f=session.feedback[e.id]; return f&&f.verdict==="correct"; }).length;
  /* Ungradeable free writing is excluded from the denominator — see finishLesson. */
  var scorable = exercises.filter(function(e){
    var f = session.feedback[e.id]; return !f || f.verdict!=="submitted";
  }).length;

  if(session.sessionDone){
    var scorePct = pct(correct, scorable);
    return '<div class="card" style="padding:28px">'+
      '<div class="section-eyebrow">Session complete</div>'+
      '<h2 style="font-size:26px;margin-bottom:10px">'+correct+' of '+scorable+' correct · '+scorePct+'%</h2>'+
      bySkillBreakdown(exercises)+
      whatYouGotWrong(exercises, {retryAction:"retryWrongOnly"})+
      '<div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">'+
        '<button class="btn" data-action="go" data-page="home">Back to Learn</button>'+
        '<button class="btn secondary" data-action="restartSession">Run another set</button></div></div>';
  }
  return '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
      '<div><div class="section-eyebrow">'+escapeHtml(title)+'</div>'+
      '<p style="color:var(--text-2);font-size:13.5px">'+escapeHtml(subtitle)+'</p></div>'+
      '<span class="tabular" style="font-size:12.5px;color:var(--text-3)">'+answered+' / '+exercises.length+'</span></div>'+
    '<div class="progressbar" style="margin-bottom:20px"><span style="width:'+pct(answered,exercises.length)+'%"></span></div>'+
    renderExercise(ex, {counter:"Question "+(i+1)+" of "+exercises.length});
}
