/* Drumul spre Romana — persisted state.
 *
 * Extracted verbatim from index.html: the localStorage-backed store, its
 * defaults, the debounced writer, and the two listeners that flush it before
 * the page goes away.
 *
 * Scope note. `state` is a mutable global here, and two callers still in
 * index.html reassign it wholesale — applyImportedState (restoring a transfer
 * code or file) and resetProgress. That worked when this code sat inside the
 * application IIFE and it works now: those callers are nested inside that IIFE,
 * find no local binding named `state`, and walk the scope chain out to this
 * one. The binding they reach is declared, so assigning to it is legal under
 * strict mode. What changed is only which scope holds it, not which binding
 * they resolve to.
 *
 * The "use strict" directive is not new — it is the mode these statements
 * already ran in inside that IIFE, repeated here because a separate classic
 * script would otherwise default to sloppy mode.
 *
 * Load order: after utils.js (which this does not use, but which is cheaper to
 * keep in a fixed order than to reason about later) and before the application
 * script, which reads `state` as soon as it runs.
 */
"use strict";

/* ===================== PERSISTED STATE ===================== */
var STORAGE_KEY = "ro_course_state_v2";
function defaultState(){
  return {
    onboarded:false,
    displayName:"",
    progress:{ lessons:{} }, // lessonId -> {status, bestScore, attempts, sectionsDone:{}}
    vocabSrs:{}, // vocabId -> {status,interval,due,correctStreak,seen,correct}
    grammarStats:{}, // topicId -> {correct,total}
    skillStats:{ vocabulary:{c:0,t:0}, grammar:{c:0,t:0}, listening:{c:0,t:0}, reading:{c:0,t:0}, writing:{c:0,t:0}, pronunciation:{c:0,t:0} },
    mistakes:[], // {id,date,skill,topic,exerciseId,yourAnswer,correctAnswer,explanation,promptText}
    mediaTranscripts:{}, // youtube videoId -> learner-supplied shadowing script
    activityDates:[],
    exercisesCompleted:0,
    examResults:[],
    verbsMarked:[],
    unlockedUnits:{}, // unitId -> true (beyond default first unit per level)
    settings:{ audioSpeed:1, reduceMotion:false, openLevels:{}, showProfanity:false, unlockAll:false },
    placement:null
  };
}
var state = loadState();
/* Merge saved state over the defaults one level deep, so adding a key to a
   nested object (settings, skillStats) does not leave returning learners with
   undefined where a default is expected. */
function loadState(){
  var d = defaultState();
  var parsed;
  try{
    var raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return d;
    parsed = JSON.parse(raw);
  }catch(e){ return d; }
  if(!parsed || typeof parsed!=="object") return d;

  Object.keys(d).forEach(function(k){
    var def = d[k], saved = parsed[k];
    if(saved===undefined || saved===null) return;
    var nestedObject = def && typeof def==="object" && !Array.isArray(def)
                    && saved && typeof saved==="object" && !Array.isArray(saved);
    d[k] = nestedObject ? Object.assign({}, def, saved) : saved;
  });
  return d;
}

var saveTimer=null;
function writeState(){
  clearTimeout(saveTimer); saveTimer=null;
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){}
}
function persist(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(writeState, 80);
}
/* Flush the debounce before the page goes away. visibilitychange + pagehide
   are the pair that actually fire on mobile; beforeunload does not. */
document.addEventListener("visibilitychange", function(){
  if(document.visibilityState==="hidden" && saveTimer) writeState();
});
window.addEventListener("pagehide", function(){ if(saveTimer) writeState(); });
