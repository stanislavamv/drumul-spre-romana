/* Drumul spre Romana — study activity and streak.
 *
 * Extracted verbatim from index.html. Two functions: one records that the
 * learner studied today, the other counts back from today to give the current
 * streak.
 *
 * Depends on todayStr() from utils.js and the `state` global from state.js, so
 * it loads after both. It reads and mutates state.activityDates but never
 * writes to storage itself — markActivityToday only pushes the date, and each
 * of its five callers in index.html invokes persist() separately. That split is
 * preserved here; adding a persist() call would change behaviour.
 *
 * The "use strict" directive is not new — it is the mode these functions
 * already ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

function markActivityToday(){
  var t = todayStr();
  if(state.activityDates.indexOf(t)===-1){ state.activityDates.push(t); }
}
function currentStreak(){
  var set = {}; state.activityDates.forEach(function(d){ set[d]=true; });
  var n=0, cursor = new Date();
  // if today not studied yet, streak counts back from yesterday (missing a day doesn't erase history, just doesn't extend)
  if(!set[todayStr(cursor)]){ cursor.setDate(cursor.getDate()-1); }
  while(set[todayStr(cursor)]){ n++; cursor.setDate(cursor.getDate()-1); }
  return n;
}
