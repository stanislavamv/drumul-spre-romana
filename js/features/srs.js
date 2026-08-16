/* Drumul spre Romana — vocabulary spaced repetition.
 *
 * Extracted verbatim from index.html. Tracks per-word review state and decides
 * when each word comes back.
 *
 * Depends on `state` and persist() from state.js, and todayStr(), clamp(),
 * addDays(), daysUntil() and pct() from utils.js. It uses nothing from
 * activity.js or mastery.js, so its position after those two in the load order
 * is convention, not a requirement.
 *
 * Two details that look like oversights and are load-bearing:
 *
 *   getVocabState() creates a missing entry but does NOT persist. It is called
 *   on render paths that only read, and saving there would write to storage on
 *   every page view. The caller that actually changes something — reviewVocab —
 *   persists instead.
 *
 *   reviewVocab() floors the due date at one day for a correct answer
 *   (Math.max(interval, 1)) but allows zero for a wrong one, so a missed word
 *   can come back the same session while a correct one never does.
 *
 * The "use strict" directive is not new — it is the mode this code already ran
 * in inside the application IIFE, repeated here because a separate classic
 * script would otherwise default to sloppy mode.
 */
"use strict";

/* ===================== SPACED REPETITION (vocab) ===================== */
var SRS_LEVELS = ["New","Learning","Familiar","Strong","Mastered"];
var SRS_INTERVALS = [0,1,3,7,16,35];
function getVocabState(vid){
  if(!state.vocabSrs[vid]) state.vocabSrs[vid] = {status:"New", interval:0, due:todayStr(), correctStreak:0, seen:0, correct:0};
  return state.vocabSrs[vid];
}
function reviewVocab(vid, correct){
  var v = getVocabState(vid);
  v.seen++;
  var levelIdx = SRS_LEVELS.indexOf(v.status);
  if(correct){
    v.correct++; v.correctStreak++;
    levelIdx = clamp(levelIdx+1, 0, SRS_LEVELS.length-1);
  } else {
    v.correctStreak=0;
    levelIdx = clamp(levelIdx-1, 0, SRS_LEVELS.length-1);
  }
  v.status = SRS_LEVELS[levelIdx];
  v.interval = SRS_INTERVALS[levelIdx];
  v.due = addDays(todayStr(), Math.max(v.interval,correct?1:0));
  persist();
}
function dueVocabIds(){
  return Object.keys(state.vocabSrs).filter(function(id){ return daysUntil(state.vocabSrs[id].due) <= 0; });
}
function weakVocabIds(n){
  var arr = Object.keys(state.vocabSrs).map(function(id){ return {id:id, s:state.vocabSrs[id]}; })
    .filter(function(x){ return x.s.seen>0; })
    .sort(function(a,b){ return pct(a.s.correct,a.s.seen)-pct(b.s.correct,b.s.seen); });
  return arr.slice(0,n||15).map(function(x){return x.id;});
}
