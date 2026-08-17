/* Drumul spre Romana — the conjugation engine.
 *
 * Extracted verbatim from index.html. Generates a verb's full paradigm from its
 * infinitive plus its conjugation class, so 190 verbs do not each need a
 * hand-written table.
 *
 * Closed by construction: it takes verb objects as arguments and reads only the
 * conjugation tables in js/data/verbs.js. No state, no session, no DOM, no
 * rendering, no audio. That is why it can load this early.
 *
 * Two things here are load-bearing rather than incidental:
 *
 *   · The singular imperative is NEVER guessed. imperativeOf returns tu:null
 *     unless the class genuinely derives it or the verb declares one. An earlier
 *     version inferred it and invented zici!, pui! and deschizi!, none of which
 *     are Romanian. Eleven verbs currently carry a deliberate null.
 *
 *   · VERB_CACHE memoises by verb id for the page lifetime only. Callers
 *     receive the cached object itself, so identity is observable; it is never
 *     persisted, and there is no invalidation because the verb data is static.
 *
 * verbIsIrregular and verbHasOddParticiple stay in index.html with the verb
 * tool: they consume this engine to label the UI rather than belonging to it.
 */
"use strict";

/* Consonants soften before the -i of the tu form: t→ț, d→z, s→ș, st→ șt … */
function softenBeforeI(stem){
  return stem
    .replace(/sc$/,"șt").replace(/st$/,"șt")
    .replace(/t$/,"ț").replace(/d$/,"z").replace(/s$/,"ș");
}
/* Strip the citation form down to the bare infinitive. Three shapes occur:
   "a merge", "a se trezi" (accusative reflexive) and "a-și aminti" (dative
   reflexive). Missing the third produced a stem of "a-și aminti" and tables
   reading "îmi a-și amintesc". */
function verbParts(inf){
  var bare = String(inf)
    .replace(/^a[-‑](și|şi|mi|ți|ţi)\s+/, "")
    .replace(/^a\s+/, "")
    .replace(/^se\s+/, "")
    .trim();
  var m = bare.match(/(ea|î|a|e|i)$/);
  var ending = m ? m[1] : "";
  return {bare:bare, stem: ending ? bare.slice(0, -ending.length) : bare, ending:ending};
}
/* Reflexive in either paradigm — the citation form alone is not enough, since
   dative reflexives are written "a-și …" rather than "a se …". */
function verbIsReflexive(v){ return !!(v.refl || /^a[\s-](se|și|şi)\b/.test(v.inf)); }


function conjugatePresent(v){
  if(v.irr && v.irr.present) return v.irr.present;
  var p = verbParts(v.inf), g = v.group, ends = PRESENT_ENDINGS[g] || PRESENT_ENDINGS["III"];
  var out = {};
  PERSONS.forEach(function(person, i){
    var stem = p.stem;
    // The tu form softens the final consonant before its -i.
    if(i===1 && ends[i]==="i") stem = softenBeforeI(stem);
    out[person] = stem + ends[i];
  });
  return out;
}
function participleOf(v){
  if(v.irr && v.irr.participle) return v.irr.participle;
  var p = verbParts(v.inf);
  return p.stem + (PARTICIPLE_SUFFIX[v.group] || "ut");
}
function conjugateImperfect(v){
  if(v.irr && v.irr.imperfect) return v.irr.imperfect;
  var p = verbParts(v.inf), link = IMPERFECT_LINK[v.group] || "ea", out = {};
  PERSONS.forEach(function(person, i){ out[person] = p.stem + link + IMPERFECT_ENDINGS[i]; });
  return out;
}
function compoundWith(auxes, tail){
  var out = {};
  PERSONS.forEach(function(person, i){ out[person] = auxes[i] + " " + tail; });
  return out;
}
function conjugateAll(v){
  var part = participleOf(v);
  var infBare = verbParts(v.inf).bare;
  return {
    present:     conjugatePresent(v),
    past:        (v.irr && v.irr.past)        || compoundWith(["am","ai","a","am","ați","au"], part),
    imperfect:   conjugateImperfect(v),
    future:      (v.irr && v.irr.future)      || compoundWith(["voi","vei","va","vom","veți","vor"], infBare),
    conditional: (v.irr && v.irr.conditional) || compoundWith(["aș","ai","ar","am","ați","ar"], infBare),
    subjunctive: subjunctiveOf(v),
    imperative:  imperativeOf(v),
    participle:  part
  };
}
/* Only the third person differs from the present indicative — and that form is
   irregular often enough that it is declared per verb as `subj3`. */
function subjunctiveOf(v){
  if(v.irr && v.irr.subjunctive) return v.irr.subjunctive;
  var pres = conjugatePresent(v), out = {};
  var third = (v.irr && v.irr.subj3) || defaultSubj3(v, pres);
  PERSONS.forEach(function(person){ out[person] = "să " + pres[person]; });
  out.el = "să " + third;
  out.ei = "să " + third;
  return out;
}
function defaultSubj3(v, pres){
  var p = verbParts(v.inf);
  if(v.group==="I")      return p.stem + "e";
  if(v.group==="I-ez")   return p.stem + "eze";
  if(v.group==="IV-esc") return p.stem + "ească";
  if(v.group==="IV-î")   return p.stem + "ască";
  return p.stem + "ă";          // II, III, IV
}

function imperativeOf(v){
  var pres = conjugatePresent(v);
  var voi = pres.voi + "!";
  if(v.irr && v.irr.imperative){
    var given = v.irr.imperative;
    return {tu: given.tu, voi: given.voi || voi};
  }
  if(IMPERATIVE_FROM_THIRD[v.group]) return {tu: pres.el + "!", voi: voi};
  return {tu: null, voi: voi};      // must be declared; never guessed
}


function applyReflexive(v, tables){
  if(!v.refl) return tables;
  var dative = v.refl === "dative";
  var PRON = dative ? REFLEX_PRON_D : REFLEX_PRON;
  var PAST = dative ? REFLEX_PAST_D : REFLEX_PAST;
  var COND = dative ? REFLEX_COND_D : REFLEX_COND;
  var FUT  = dative ? REFLEX_FUT_D  : REFLEX_FUT;
  var part = tables.participle;
  var infBare = verbParts(v.inf).bare;
  var out = {participle: part};
  ["present","imperfect"].forEach(function(t){
    out[t] = {};
    PERSONS.forEach(function(p){ out[t][p] = PRON[p] + " " + tables[t][p]; });
  });
  out.past = {}; out.conditional = {}; out.future = {}; out.subjunctive = {};
  PERSONS.forEach(function(p){
    out.past[p]        = PAST[p] + " " + part;
    out.conditional[p] = COND[p] + " " + infBare;
    out.future[p]      = FUT[p]  + " " + infBare;
    out.subjunctive[p] = "să " + PRON[p] + " " + String(tables.subjunctive[p]).replace(/^să\s+/,"");
  });
  /* In the affirmative imperative the pronoun jumps to the end and hyphenates —
     -te for accusative reflexives, -ți for dative ones (trezește-te! but
     amintește-ți!). A null tu-form means the singular imperative was never
     declared for this verb, and "null-te!" is worse than showing nothing. */
  out.imperative = {
    tu: tables.imperative.tu
        ? String(tables.imperative.tu).replace(/!$/,"") + (dative ? "-ți!" : "-te!")
        : null,
    voi: String(tables.imperative.voi).replace(/!$/,"") + "-vă!"
  };
  return out;
}
/* Public accessor: returns a fully-formed verb with all tables filled in. */
var VERB_CACHE = {};
function verbTables(v){
  if(VERB_CACHE[v.id]) return VERB_CACHE[v.id];
  var t;
  if(v.present && v.past && v.subjunctive){
    /* Hand-written entry: every table already spelled out (the original core
       verbs). Reflexive pronouns are baked into those, so no post-processing. */
    t = {present:v.present, past:v.past, imperfect:v.imperfect, future:v.future,
         conditional:v.conditional, subjunctive:v.subjunctive,
         imperative:v.imperative, participle:v.participle};
  } else {
    t = applyReflexive(v, conjugateAll(v));
  }
  VERB_CACHE[v.id] = t;
  return t;
}

function verbGroupKey(v){
  if(GROUP_LABEL[v.group]) return v.group;
  /* Legacy entries carry a prose group string; map it back to a class. */
  var g = String(v.group||"");
  if(/irregular|impersonal/i.test(g)) return "irr";
  if(/1st|-a\b/.test(g)) return /ez/.test(g) ? "I-ez" : "I";
  if(/2nd|-ea/.test(g)) return "II";
  if(/3rd|-e\b|-ge/.test(g)) return "III";
  if(/esc/.test(g)) return "IV-esc";
  if(/4th|-i\b/.test(g)) return "IV";
  return "irr";
}
function verbGroupLabel(v){
  var k = verbGroupKey(v);
  return k==="irr" ? "Irregular" : (GROUP_LABEL[k]||k);
}
