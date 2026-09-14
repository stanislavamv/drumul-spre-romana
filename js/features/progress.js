/* Drumul spre Romana — learner progress and unlocking.
 *
 * Extracted verbatim from index.html. Course progress and unlocking. Unlike js/core/lookup.js these answers depend
 * on the learner: `state` for completion, `session` for the selected course.
 *
 * Kept together because they form a closed cluster — levelIsOpen falls back to
 * recommendedLesson, which needs isUnitUnlocked, which needs lessonProgress and
 * lessonsOfUnit. Splitting them would leave a caller reaching across files for
 * one function.
 *
 * Load order: after js/core/lookup.js, state.js, session.js and utils.js (pct).
 *
 * The "use strict" directive is not new — it is the mode these functions
 * already ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

function currentCourse(){ return session.course || "cefr"; }

function lessonProgress(id){
  return state.progress.lessons[id] || {status:"new", bestScore:0, attempts:0, sectionsDone:{}};
}

/* A unit opens once the unit before it is finished. The very first unit of
   each level is always available, so a learner placed at B1 isn't walled off. */
function isUnitUnlocked(unit){
  /* Teacher/author mode opens everything. See PAGES.admin for what this is and,
     more importantly, what it is not. */
  if(state.settings.unlockAll) return true;
  if(state.unlockedUnits[unit.id]) return true;
  if(unit.order===1) return true;
  /* The first three units of the very first level are open to any visitor,
     not just returning learners, so someone previewing the course (or testing
     the free-writing feedback for the hackathon) isn't stuck finishing Unit 1
     first. Every other unit still unlocks strictly in order. */
  if(unit.order<=3 && unit.levelId===LEVELS[0].id) return true;
  var siblings = UNITS.filter(function(u){ return u.levelId===unit.levelId; });
  var prev = siblings.find(function(u){ return u.order===unit.order-1; });
  if(!prev) return true;
  var pl = lessonsOfUnit(prev.id);
  if(!pl.length) return true;               // nothing to complete yet → don't block
  return pl.every(function(l){ return lessonProgress(l.id).status==="complete"; });
}

function recommendedLesson(){
  var inCourse = UNITS.filter(function(u){
    var lv = levelById(u.levelId); return lv && (lv.course||"cefr")===currentCourse();
  });
  for(var i=0;i<inCourse.length;i++){
    var u = inCourse[i];
    if(!isUnitUnlocked(u)) continue;
    var ls = lessonsOfUnit(u.id);
    for(var j=0;j<ls.length;j++){
      if(lessonProgress(ls[j].id).status!=="complete") return ls[j];
    }
  }
  return lessonsOfUnit(inCourse[0] ? inCourse[0].id : "")[0] || LESSONS[0];
}

/* A level is open when it holds the active unit, unless the learner has
   explicitly toggled it. With seven levels the sidebar is otherwise far too
   long to scan. */
function levelIsOpen(levelId, activeUnitId){
  var explicit = state.settings.openLevels && state.settings.openLevels[levelId];
  if(explicit==="open") return true;
  if(explicit==="closed") return false;
  var active = activeUnitId && unitById(activeUnitId);
  if(active && active.levelId===levelId) return true;
  // Fall back to the level holding the next recommended lesson.
  var rec = recommendedLesson();
  return !!(rec && rec.levelId===levelId);
}

/* The lesson that literally follows this one in course order — next lesson in
   the unit, else the first lesson of the next unit in the same track. Distinct
   from recommendedLesson(), which hunts for the first thing left unfinished:
   after finishing a lesson the learner wants to go FORWARD, not back to an
   earlier gap. Returns null at the end of a track. */
function nextLessonAfter(lesson){
  if(!lesson) return null;
  var siblings = lessonsOfUnit(lesson.unitId);
  var at = siblings.findIndex(function(l){ return l.id===lesson.id; });
  if(at>-1 && siblings[at+1]) return siblings[at+1];

  var unit = unitById(lesson.unitId);
  if(!unit) return null;
  var course = (levelById(unit.levelId)||{}).course || "cefr";
  var track = UNITS.filter(function(u){
    var lv = levelById(u.levelId); return lv && (lv.course||"cefr")===course;
  });
  var ui = track.findIndex(function(u){ return u.id===unit.id; });
  for(var i=ui+1; i<track.length; i++){
    var ls = lessonsOfUnit(track[i].id);
    if(ls.length) return ls[0];
  }
  return null;
}

function levelProgressPct(levelId){
  var lessons = LESSONS.filter(function(l){ return l.levelId===levelId; });
  if(!lessons.length) return 0;
  var done = lessons.filter(function(l){ var p=state.progress.lessons[l.id]; return p&&p.status==="complete"; }).length;
  return pct(done, lessons.length);
}

/* The badge in the top bar tracks the LANGUAGE course only — the civic track
   has no CEFR level and would otherwise overwrite it. */
function overallCourseLevelId(){
  var ls = levelsOfCourse("cefr");
  for(var i=0;i<ls.length;i++){ if(levelProgressPct(ls[i].id) < 100) return ls[i].id; }
  return ls[ls.length-1].id;
}

/* A one-line description of a progress payload. Takes the state object as an
   argument rather than reading the global, because the transfer/import flow
   uses it to describe an INCOMING save before it is applied. */
function progressSummaryLine(st){
  var lessons = Object.keys(st.progress&&st.progress.lessons||{}).filter(function(k){
    return st.progress.lessons[k].status==="complete"; }).length;
  return lessons+" lesson"+(lessons===1?"":"s")+" complete · "+
    Object.keys(st.vocabSrs||{}).length+" words tracked · "+
    (st.mistakes||[]).length+" saved mistakes";
}

/* Exercises done since the learner last got a copy of their progress out of
   this browser (a downloaded file or a copied code -- see exportProgress and
   copyProgressCode in actions.js, the only two places that stamp lastSaved).
   Not "since the last localStorage write": that happens on every answer and
   would make this always read zero, which defeats the point -- the risk this
   guards against is losing the browser itself, not a mid-session reload. */
function exercisesSinceLastSave(){
  return Math.max(0, state.exercisesCompleted - (state.lastSaved.exercisesCompleted||0));
}

/* How many exercises before the course map nudges the learner to save. Low
   enough to catch real work well before a whole session's worth of lessons is
   at risk, high enough that it doesn't fire after one or two answers. */
var SAVE_REMINDER_THRESHOLD = 10;
function shouldShowSaveReminder(){
  return exercisesSinceLastSave() >= SAVE_REMINDER_THRESHOLD;
}

function lastSavedLine(){
  if(!state.lastSaved.at) return "Never saved to a file or code yet.";
  var days = Math.floor((Date.now() - new Date(state.lastSaved.at).getTime()) / 86400000);
  var when = days<=0 ? "today" : days===1 ? "yesterday" : days+" days ago";
  var n = exercisesSinceLastSave();
  return "Last saved "+when+" · "+n+" exercise"+(n===1?"":"s")+" completed since.";
}
