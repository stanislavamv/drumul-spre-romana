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
    placement:null,
    /* Watermark for the "save your progress" reminder (js/features/progress.js,
       exercisesSinceLastSave). Stamped by the two actions that get progress out
       of this browser -- exportProgress and copyProgressCode in actions.js --
       so it reflects the last point the learner actually has an external copy,
       not the last localStorage write, which happens continuously and proves
       nothing about whether a copy exists anywhere else. */
    lastSaved:{ at:null, exercisesCompleted:0 }
  };
}
/* Keys that would let a merged-in object escape its own shape via the
   prototype chain. JSON.parse never creates an actual __proto__ *link* — it
   creates a harmless own property with that name — but copying that
   property onto a fresh object with `target[k] = v` does invoke the
   Object.prototype accessor and reassigns target's real prototype. Checked
   once here rather than at every merge call site. */
var UNSAFE_MERGE_KEYS = {"__proto__":1, "constructor":1, "prototype":1};

/* Merge `saved` over defaultState(), one level deep. Used both for the
   localStorage read on startup and for an imported transfer code or file, so
   a payload from an older build (missing a key) or a malformed one (wrong
   type for a key) always produces a complete, correctly-shaped state rather
   than whatever partial thing was on disk or pasted in.

   A field whose saved value is not the same *kind* of container as the
   default (array vs plain object vs anything else) is dropped in favour of
   the default instead of trusted. That gap is what let a bad import replace
   state.mistakes — an Array every render assumes it can .map() over — with
   an arbitrary object, which then crashed the next page that touched it. */
function mergeStateShape(saved){
  var d = defaultState();
  if(!saved || typeof saved!=="object" || Array.isArray(saved)) return d;
  Object.keys(d).forEach(function(k){
    if(UNSAFE_MERGE_KEYS[k]) return;
    var def = d[k], val = saved[k];
    if(val===undefined || val===null) return;
    if(Array.isArray(def)){
      if(Array.isArray(val)) d[k] = val;
      return; // shape mismatch: keep the default array
    }
    if(def && typeof def==="object"){
      if(!val || typeof val!=="object" || Array.isArray(val)) return; // keep default
      var merged = {};
      Object.keys(def).forEach(function(kk){ merged[kk] = def[kk]; });
      Object.keys(val).forEach(function(kk){
        if(UNSAFE_MERGE_KEYS[kk]) return;
        merged[kk] = val[kk];
      });
      d[k] = merged;
      return;
    }
    d[k] = val; // scalar default (string/number/boolean), or null (placement)
  });
  return d;
}

var state = loadState();
function loadState(){
  try{
    var raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    return mergeStateShape(JSON.parse(raw));
  }catch(e){ return defaultState(); }
}

var saveTimer=null;
/* What writeState() last put in storage. Used only to notice that something
   else has been writing, which is the one thing this module cannot otherwise
   detect. */
var lastWritten=null;
function writeState(){
  clearTimeout(saveTimer); saveTimer=null;
  var next;
  try{ next = JSON.stringify(state); }catch(e){ return; }
  try{
    /* The rule is: mutate `state`, then call persist(). Anything that edits
       localStorage directly — a console one-liner, a migration, a test fixture
       — is racing the 80ms debounce, and loses. That used to happen in
       silence: the edit appeared to work, survived a moment, then vanished on
       the next state change. It is still discarded, because `state` is the
       source of truth, but it no longer goes unremarked. */
    var current = localStorage.getItem(STORAGE_KEY);
    if(lastWritten!==null && current!==null && current!==lastWritten && current!==next){
      console.warn("state.js: a direct localStorage edit is being overwritten. "+
                   "Mutate `state` and call persist() instead.");
    }
    localStorage.setItem(STORAGE_KEY, next);
    lastWritten = next;
  }catch(e){}
}
/* The supported way to erase the saved course. Goes through this module so the
   pending debounce is cancelled and lastWritten is cleared; calling
   localStorage.removeItem() directly leaves a queued writeState() free to put
   the old state straight back. */
function clearState(){
  clearTimeout(saveTimer); saveTimer=null;
  try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
  lastWritten = null;
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

/* Self-test for mergeStateShape() — the boundary between untrusted JSON (a
   stored value, an imported transfer code or file) and `state`. Pure: only
   calls mergeStateShape() on throwaway input and never touches `state` or
   localStorage, so it is safe to run at any time without disturbing real
   progress. Runs automatically when the page is opened with ?selftest=1;
   otherwise call selfTestMergeStateShape() from devtools. Collects every
   failing case and throws once at the end, so "no output" is not a passing
   result — check the console. */
function selfTestMergeStateShape(){
  var cases = [
    {
      name: "wrong container type is dropped, not trusted",
      input: {mistakes:{evil:"not an array"}, exercisesCompleted:42},
      check: function(r){
        return Array.isArray(r.mistakes) && r.mistakes.length===0
            && r.exercisesCompleted===42;
      }
    },
    {
      name: "__proto__ inside a nested object never becomes an own property",
      input: JSON.parse('{"settings":{"__proto__":{"polluted":"yes"},"audioSpeed":1.5}}'),
      check: function(r){
        return r.settings.audioSpeed===1.5
            && !Object.prototype.hasOwnProperty.call(r.settings, "polluted")
            && ({}).polluted===undefined;
      }
    },
    {
      name: "old-build export missing newer keys still merges",
      input: {displayName:"Test", progress:{lessons:{l_a1u1:{status:"done"}}}},
      check: function(r){
        return r.displayName==="Test"
            && r.progress.lessons.l_a1u1.status==="done"
            && r.settings.audioSpeed===1 // untouched key keeps its default
            && r.lastSaved.at===null && r.lastSaved.exercisesCompleted===0; // ditto: a save made before this field existed
      }
    },
    {
      name: "top-level non-object input returns a clean default",
      input: "not an object",
      check: function(r){ return Array.isArray(r.mistakes) && r.onboarded===false; }
    },
    {
      name: "array masquerading as the whole payload returns a clean default",
      input: ["nope"],
      check: function(r){ return Array.isArray(r.mistakes) && r.onboarded===false; }
    }
  ];
  var failed = [];
  cases.forEach(function(c){
    var ok;
    try{ ok = c.check(mergeStateShape(c.input)); }catch(e){ ok = false; }
    console[ok?"log":"error"]((ok?"PASS: ":"FAIL: ")+c.name);
    if(!ok) failed.push(c.name);
  });
  if(failed.length){
    throw new Error("selfTestMergeStateShape: "+failed.length+" failing case(s): "+failed.join("; "));
  }
  console.log("selfTestMergeStateShape: all "+cases.length+" cases passed.");
}
if(/[?&]selftest=1(&|$)/.test(location.search)){
  try{ selfTestMergeStateShape(); }catch(e){ console.error(e.message); }
}
