/* Drumul spre Romana — id lookups over the course data.
 *
 * Extracted verbatim from index.html. Pure lookups over the datasets in js/data/*.js. Every one is a first-match
 * find() over an array, so a duplicate id would resolve to the earlier entry
 * and an unknown id yields undefined — both preserved exactly, because callers
 * lean on the undefined case (renderers test the result before using it).
 * Depends on the data globals only: no state, no session, no DOM.
 *
 * The "use strict" directive is not new — it is the mode these functions
 * already ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

function lessonsOfUnit(unitId){ return LESSONS.filter(function(l){ return l.unitId===unitId; }).sort(function(a,b){return a.order-b.order;}); }

/* Every exercise a lesson uses, de-duplicated (review stages reuse earlier ones). */
function lessonExercises(l){
  var ids = [];
  l.sections.forEach(function(s){ (s.exerciseIds||[]).forEach(function(x){ if(ids.indexOf(x)===-1) ids.push(x); }); });
  return ids.map(exerciseById).filter(Boolean);
}

function exerciseById(id){ return EXERCISES.find(function(e){ return e.id===id; }); }

function vocabById(id){ return VOCAB.find(function(v){ return v.id===id; }); }

function readingById(id){ return READING_TEXTS.find(function(r){ return r.id===id; }); }

function dialogueById(id){ return DIALOGUES.find(function(d){ return d.id===id; }); }

function grammarById(id){ return GRAMMAR_TOPICS.find(function(g){ return g.id===id; }); }

function verbById(id){ return VERBS.find(function(v){ return v.id===id; }); }

function unitById(id){ return UNITS.find(function(u){ return u.id===id; }); }

function lessonById(id){ return LESSONS.find(function(l){ return l.id===id; }); }

function levelById(id){ return LEVELS.find(function(l){ return l.id===id; }); }

function levelsOfCourse(c){ return LEVELS.filter(function(l){ return (l.course||"cefr")===c; }); }
