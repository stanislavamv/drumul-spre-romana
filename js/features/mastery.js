/* Drumul spre Romana — skill mastery and grammar accuracy.
 *
 * Extracted verbatim from index.html. Records per-skill and per-grammar-topic
 * hit rates, and derives the mastery percentages the dashboard shows.
 *
 * Depends on `state` and persist() from state.js, and clamp()/pct() from
 * utils.js, so it loads after both.
 *
 * Two behaviours here are deliberate and must survive future edits:
 *
 *   overallMastery() averages only skills with at least one attempt. A learner
 *   who has never touched a listening exercise is not carrying a 0% listening
 *   score in their overall figure. Including untouched skills would make the
 *   headline number a measure of how much of the course had been opened rather
 *   than how well it was answered.
 *
 *   weakGrammarTopics() ignores topics with fewer than two attempts. One wrong
 *   answer on a topic met once is noise, and surfacing it as a weakness sends
 *   the learner to drill something they have barely seen.
 *
 * The "use strict" directive is not new — it is the mode these functions
 * already ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

/* ===================== SKILL STATS / MASTERY ===================== */
function recordSkill(skill, correct){
  if(!state.skillStats[skill]) state.skillStats[skill]={c:0,t:0};
  state.skillStats[skill].t++;
  if(correct) state.skillStats[skill].c++;
  persist();
}
function skillMastery(skill){
  var s = state.skillStats[skill]||{c:0,t:0};
  if(s.t===0) return 0;
  return clamp(pct(s.c,s.t),0,100);
}
function overallMastery(){
  var skills=["vocabulary","grammar","listening","reading","writing","pronunciation"];
  var sum=0,n=0;
  skills.forEach(function(sk){ var s=state.skillStats[sk]||{c:0,t:0}; if(s.t>0){ sum+=pct(s.c,s.t); n++; } });
  return n? Math.round(sum/n) : 0;
}
function recordGrammar(topicId, correct){
  if(!topicId) return;
  if(!state.grammarStats[topicId]) state.grammarStats[topicId]={correct:0,total:0};
  state.grammarStats[topicId].total++;
  if(correct) state.grammarStats[topicId].correct++;
  persist();
}
function weakGrammarTopics(n){
  var arr = Object.keys(state.grammarStats).map(function(id){
    var s=state.grammarStats[id];
    return {id:id, acc: pct(s.correct,s.total), total:s.total};
  }).filter(function(x){ return x.total>=2; }).sort(function(a,b){ return a.acc-b.acc; });
  return arr.slice(0,n||5);
}
