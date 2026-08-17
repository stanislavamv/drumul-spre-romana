/* Drumul spre Romana — general-purpose utilities.
 *
 * Extracted verbatim from index.html. These are the free-standing helpers the
 * rest of the application calls: string normalisation for Romanian, date
 * arithmetic for the review scheduler, and small array/number helpers. Nothing
 * here reads application state, touches the DOM, or depends on load order
 * beyond itself.
 *
 * Loaded as a classic script before the main one, so every name below is a
 * global that the app's IIFE picks up through the scope chain. The "use
 * strict" directive is not new — it is the mode these functions already ran in
 * inside that IIFE, repeated here because a separate classic script would
 * otherwise default to sloppy mode.
 */
"use strict";

/* ===================== UTILITIES ===================== */
function uid(prefix){ return prefix+"_"+Math.random().toString(36).slice(2,9); }
function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
function escapeHtml(s){ return String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
/* Romanian ș/ț exist in two Unicode forms: the correct comma-below characters
   (U+0219/U+021B) and legacy cedilla lookalikes (U+015F/U+0163) that some
   keyboard layouts still emit. Unify them before ANY comparison, so a learner
   who types perfect Romanian on a cedilla layout is not told to fix diacritics
   they already typed. */
function unifyRomanian(s){
  return String(s==null?"":s)
    .replace(/ş/g,"ș").replace(/Ş/g,"Ș")   // ş Ş -> ș Ș
    .replace(/ţ/g,"ț").replace(/Ţ/g,"Ț");  // ţ Ţ -> ț Ț
}
/* Strict form: used to decide "fully correct" vs "almost correct". */
function norm(s){
  return unifyRomanian(s).trim().toLowerCase()
    .replace(/[.,!?;:()"„”«»]/g,"")
    .replace(/\s+/g," ");
}
/* Diacritic-blind form: used to detect "right word, missing diacritics".
   Only ever receives already-lowercased text from normLoose. */
function stripDiacritics(s){
  return String(s==null?"":s)
    .replace(/[ăâ]/g,"a").replace(/î/g,"i")
    .replace(/ș/g,"s").replace(/ț/g,"t");
}
function normLoose(s){ return stripDiacritics(norm(s)); }
function todayStr(d){ d=d||new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function addDays(dateStr, n){
  var d = new Date(dateStr+"T00:00:00");
  d.setDate(d.getDate()+n);
  return todayStr(d);
}
function daysUntil(dateStr){
  var a = new Date(todayStr()+"T00:00:00"), b = new Date(dateStr+"T00:00:00");
  return Math.round((b-a)/86400000);
}
function pct(a,b){ if(!b) return 0; return Math.round(100*a/b); }
function pick(arr,n){ var c=arr.slice(); var out=[]; while(c.length&&out.length<n){ out.push(c.splice(Math.floor(Math.random()*c.length),1)[0]); } return out; }
function shuffle(arr){ var c=arr.slice(); for(var i=c.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=c[i];c[i]=c[j];c[j]=t;} return c; }
function sample(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

/* Split a passage into sentences for line-by-line playback and gloss.
   Lives here rather than with the gloss engine: it is punctuation handling,
   not lookup, and the reading and exercise renderers both use it. */
function sentencesOf(text){
  var parts = String(text||"").replace(/\n+/g," ").match(/[^.!?…]+[.!?…]*/g) || [];
  return parts
    /* Quoted speech inside a passage ("…!" strigă toți) leaves fragments that
       begin with a closing quote. Strip stray quote marks and drop anything
       with no actual words left. */
    .map(function(s){ return s.replace(/^[\s”"„»«]+/, "").trim(); })
    .filter(function(s){ return /[a-zăâîșțA-ZĂÂÎȘȚ]{2,}/.test(s); });
}
