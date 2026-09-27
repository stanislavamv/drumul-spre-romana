/* Drumul spre Romana — the gloss engine.
 *
 * Extracted verbatim from index.html. Answers one question: for a word the
 * learner clicked, which dictionary entry does it belong to? Every clickable
 * word in every reading, dialogue, lesson and exercise resolves through here.
 *
 * Two lazily built indexes back it, both rebuilt from scratch on reload:
 *
 *   GLOSS_INDEX  inflected form -> entry. Built once on the first lookup from
 *                VOCAB (headwords, gender variants, declared plurals and
 *                definites), every declared conjugation cell in VERBS, and
 *                CORE_GLOSS — then, last and lowest priority, the individual
 *                words of multi-word VOCAB entries.
 *   VERB_STEMS   a longest-first stem list, used only when the index misses, so
 *                an unlisted conjugated form still finds its infinitive.
 *
 * glossPut never overwrites an existing key, so index build order IS lookup
 * priority. Reordering the sections inside buildGlossIndex would silently
 * change which entry a shared form resolves to.
 *
 * The multi-word split runs last on purpose: "pare" split out of the taught
 * phrase "Îmi pare rău" (x_imiparerau, "I'm sorry") used to be indexed before
 * v_parea's own present-tense conjugation reached the same key ("pare" is
 * also "el/ea" of "a părea", to seem) — so every "pare" in the course, taught
 * meaning or not, showed "I'm sorry". A word's own headword or conjugation
 * must win before it is ever reachable as an incidental word of a different
 * phrase.
 *
 * looksRomanian gates glossify: English prompts contain words like "a" and
 * "care" that collide with Romanian entries, and underlining those is worse
 * than underlining nothing.
 *
 * Depends only on data (VOCAB, VERBS, CORE_GLOSS, KNOWN_NAMES,
 * ENGLISH_MARKERS) and two utils (normLoose, escapeHtml). It does not use the
 * conjugation engine: the index is built from the tables declared in the verb
 * data, not from generated forms.
 */
"use strict";

var GLOSS_INDEX = null;
var KNOWN_NAMES_NORM = null;
function glossPut(ix, form, entry){
  var k = normLoose(String(form||"").replace(/[!?.]/g,""));
  if(!k || k.indexOf(" ")>-1 && !entry.allowPhrase) { if(!k) return; }
  if(k && !ix[k]) ix[k] = entry;
}
function buildGlossIndex(){
  var ix = {};
  /* Multi-word VOCAB entries also need their individual words reachable
     (îmi place, aproape de, drept înainte) — that is how a reader clicks. But
     a word like "pare" split out of "Îmi pare rău" must not beat "pare" as
     its own headword or conjugation (v_parea, "to seem") to the same key.
     So these are collected here and only put into the index at the very end,
     after every pass that indexes a word under its own, correct meaning. */
  var phraseWords = [];
  /* 1. Vocabulary: headword, and any slash-separated gender variants, plus the
        plural and definite forms the entry already declares. */
  VOCAB.forEach(function(v){
    var meta = v.pos + (v.gender? " · "+v.gender : "");
    String(v.ro).split("/").forEach(function(part){
      part = part.trim();
      glossPut(ix, part, {ro:part, en:v.en, pos:meta, vocabId:v.id, allowPhrase:true});
      var words = part.split(/\s+/);
      if(words.length>1){
        words.forEach(function(w){
          if(w.length<2) return;
          phraseWords.push([w, {ro:w, en:v.en, pos:meta, lemma:part, partOfPhrase:true, vocabId:v.id}]);
        });
      }
    });
    if(v.plural) String(v.plural).split("/").forEach(function(p){
      glossPut(ix, p, {ro:p.trim(), en:v.en, pos:meta+" · plural", lemma:v.ro, vocabId:v.id});
    });
    if(v.definite) String(v.definite).split("/").forEach(function(p){
      glossPut(ix, p, {ro:p.trim(), en:v.en, pos:meta+" · definite", lemma:v.ro, vocabId:v.id});
    });
  });
  /* 2. Every conjugated form maps back to its infinitive. */
  var TENSE_LABEL = {present:"present", past:"perfect compus", imperfect:"imperfect",
    future:"future", conditional:"conditional", subjunctive:"subjunctive"};
  var PERSON_LABEL = {eu:"eu", tu:"tu", el:"el/ea", noi:"noi", voi:"voi", ei:"ei/ele"};
  VERBS.forEach(function(vb){
    glossPut(ix, vb.inf, {ro:vb.inf, en:vb.en, pos:"verb · infinitive", verbId:vb.id, allowPhrase:true});
    /* verbTables() (conjugation.js, loaded before this file) is the single
       source of truth the rest of the app already uses to display a verb's
       paradigm: a hand-written table when the data spells one out, an
       engine-generated one otherwise, `irr` overrides folded in either way.
       Reading vb[t]/vb.irr[t] directly here used to miss both an `irr`-only
       verb's non-present cells and, worse, EVERY cell of a fully-regular verb
       that declares no table at all — only its group/class, which is most of
       VERBS. Calling the same accessor the Verbs page uses means a form is
       glossable exactly when it is displayable, no separate bookkeeping to
       keep in sync. */
    var tables = verbTables(vb);
    Object.keys(TENSE_LABEL).forEach(function(t){
      var table = tables[t];
      if(!table) return;
      Object.keys(table).forEach(function(p){
        var form = table[p];
        if(!form) return;
        glossPut(ix, form, {ro:form, en:vb.en, lemma:vb.inf,
          pos:"verb · "+TENSE_LABEL[t]+", "+PERSON_LABEL[p], verbId:vb.id, allowPhrase:true});
        /* Reflexive tables store the pronoun with the verb ("se trezește").
           Index the bare verb too, since that is how it appears when a reader
           clicks a single word. */
        var parts = String(form).split(" ");
        if(parts.length>1){
          var bare = parts[parts.length-1];
          if(bare.length>2) glossPut(ix, bare, {ro:bare, en:vb.en, lemma:vb.inf,
            pos:"verb · "+TENSE_LABEL[t]+", "+PERSON_LABEL[p], verbId:vb.id});
        }
      });
    });
    if(tables.imperative){
      ["tu","voi"].forEach(function(p){
        var form = tables.imperative[p];
        if(form && form!=="—")
          glossPut(ix, form, {ro:form, en:vb.en, lemma:vb.inf,
            pos:"verb · imperative, "+p, verbId:vb.id});
      });
    }
    if(tables.participle) glossPut(ix, tables.participle, {ro:tables.participle, en:vb.en, lemma:vb.inf,
      pos:"verb · past participle", verbId:vb.id});
  });
  /* 3. Core high-frequency words, added before taught vocabulary's own
        phrase-words so those don't lose to a generic core entry either. */
  CORE_GLOSS.forEach(function(row){
    glossPut(ix, row[0], {ro:row[0], en:row[1], pos:row[2], note:row[3], allowPhrase:true});
  });
  /* 4. Individual words of multi-word VOCAB entries, lowest priority — see
        the header comment for why this must run last. */
  phraseWords.forEach(function(pair){ glossPut(ix, pair[0], pair[1]); });
  return ix;
}
function glossLookup(word){
  if(!GLOSS_INDEX) GLOSS_INDEX = buildGlossIndex();
  /* Poetic elisions keep a trailing apostrophe — nost' for nostru, într' for
     întru. Strip it so the lookup and the audio clip both resolve. */
  var raw = String(word||"").trim().replace(/['’]+$/,"");
  var k = normLoose(raw.replace(/[!?.]/g,""));
  if(!k) return null;
  if(/^\d+$/.test(k)) return null;                       // bare digits need no gloss
  /* KNOWN_NAMES is written with diacritics (bucurești, românia) for
     readability, but k has already had its diacritics stripped by normLoose
     above — a plain indexOf(k) against the accented array never matched any
     of them, so every accented name silently fell through to "no gloss"
     instead of "proper name". Compare against a normalized copy instead. */
  if(!KNOWN_NAMES_NORM) KNOWN_NAMES_NORM = KNOWN_NAMES.map(function(n){ return normLoose(n); });
  if(KNOWN_NAMES_NORM.indexOf(k)>-1) return {ro:raw, en:"proper name", pos:"name", isName:true};
  if(GLOSS_INDEX[k]) return GLOSS_INDEX[k];
  /* Fall back to stripping a suffixed definite article, which is the single
     most common reason a real word misses: orașul → oraș, casa → casă. */
  var tries = [
    k.replace(/(ul|lui)$/,""), k.replace(/(ului)$/,""),
    /* A stem that already ends in a vowel takes just -l for the definite
       article, not -ul (nou → noul, birou → biroul), so the generic "ul"
       strip above removes one letter too many (noul → "no", not "nou") and
       the word never resolves. This targets that case specifically instead
       of widening the plain "l$" strip to every word ending in l. */
    k.replace(/([aeiouăâ])l$/,"$1"),
    k.replace(/le$/,""), k.replace(/a$/,"ă"), k.replace(/a$/,""),
    k.replace(/i$/,""), k.replace(/ii$/,"")
  ];
  for(var i=0;i<tries.length;i++){
    if(tries[i] && tries[i]!==k && GLOSS_INDEX[tries[i]]){
      var hit = GLOSS_INDEX[tries[i]];
      return {ro:word, en:hit.en, pos:hit.pos, lemma:hit.lemma||hit.ro,
              inferred:true, vocabId:hit.vocabId, verbId:hit.verbId, note:hit.note};
    }
  }
  /* Last resort: match a conjugated form against the stem of a vocabulary verb
     that has no conjugation table. Deliberately does NOT claim a person or
     tense — it only says which verb the form belongs to, which is what a
     reader actually needs and all this can honestly support. */
  if(!VERB_STEMS) buildVerbStems();
  for(var s=0;s<VERB_STEMS.length;s++){
    var vs = VERB_STEMS[s];
    if(k.length >= vs.stem.length && k.indexOf(vs.stem)===0){
      return {ro:word, en:vs.en, pos:"verb form", lemma:vs.inf, inferred:true,
              note:"Stem match — the exact person and tense are not resolved here."};
    }
  }
  return null;
}
/* Stems of every vocabulary verb lacking a full table, longest first so the
   most specific match wins. */
var VERB_STEMS = null;
function buildVerbStems(){
  var tabled = {};
  VERBS.forEach(function(v){ tabled[normLoose(v.inf)] = true; });
  VERB_STEMS = [];
  VOCAB.forEach(function(v){
    if(v.pos!=="verb") return;
    var inf = String(v.ro).replace(/^a\s+/,"").replace(/^se\s+/,"").replace(/\s+.*$/,"");
    if(tabled[normLoose(v.ro)]) return;
    var stem = normLoose(inf).replace(/(a|e|i|î)$/,"");
    if(stem.length < 4) return;
    VERB_STEMS.push({stem:stem, inf:v.ro, en:v.en});
  });
  VERB_STEMS.sort(function(a,b){ return b.stem.length - a.stem.length; });
}
/* Only glossify strings that are actually Romanian. English prompts contain
   words like "a" and "care" that collide with Romanian entries, and underlining
   them would be worse than not offering the gloss at all. */
/* Decide language from the NARRATIVE FRAME only — the text outside emphasis
   tags. An English instruction routinely quotes Romanian in bold ("Use mai …
   decât"), and judging the whole string would classify it as Romanian and then
   gloss English words that happen to collide: English "in" normalizes to the
   same key as Romanian "în", "care"/"mare"/"place" collide outright. */

function looksRomanian(s){
  var outside = String(s||"")
    .replace(/<(b|i|em|strong|span)\b[^>]*>[\s\S]*?<\/\1>/gi," ")  // drop quoted spans
    .replace(/<[^>]+>/g," ");
  var words = outside.split(/\s+/).map(function(w){ return w.replace(/[.,!?;:()"„”…]/g,""); })
               .filter(function(w){ return w.length>1; });
  if(!words.length) return false;

  /* An English instruction that names something Romanian — "Write an email to
     the Institutul Limbii Române" — carries a diacritic without being Romanian.
     Treating one diacritic as proof classified the whole sentence as Romanian
     and underlined "information" and "certificate" as glossable words. So count
     unambiguous English function words first; several of them settle it
     regardless of what the proper nouns look like. */
  var english = words.filter(function(w){ return ENGLISH_MARKERS[w.toLowerCase()]; }).length;
  if(english >= 3) return false;

  var diacritic = words.filter(function(w){ return /[ăâîșțĂÂÎȘȚ]/.test(w); }).length;
  /* Diacritics in more than one word are strong evidence: a lone one is
     usually a name, but two rarely co-occur outside actual Romanian. */
  if(diacritic >= 2) return true;
  if(diacritic === 1 && english === 0 && words.length <= 6) return true;

  if(words.length < 3) return false;
  var hits = words.filter(function(w){ var g = glossLookup(w); return g && !g.isName; }).length;
  return hits / words.length >= 0.7;
}
/* Wrap glossable words, leaving HTML tags untouched. When the surrounding text
   is English, only the quoted Romanian inside <b>/<i>/<span> is glossed. */
function glossify(html, opts){
  opts = opts||{};
  var s = String(html);
  var wholeIsRomanian = opts.force || looksRomanian(s);
  var depth = 0;
  return s.split(/(<[^>]+>)/).map(function(seg){
    if(seg.charAt(0)==="<"){
      if(/^<\/\s*(b|i|em|strong|span)\s*>/i.test(seg)) depth = Math.max(0, depth-1);
      else if(/^<\s*(b|i|em|strong|span)\b/i.test(seg) && !/\/>$/.test(seg)) depth++;
      return seg;
    }
    if(!wholeIsRomanian && depth===0) return seg;   // English narrative — leave alone
    return seg.split(/(\s+)/).map(function(tok){
      if(!tok.trim()) return tok;
      var clean = tok.replace(/[.,!?;:()"„”…]/g,"");
      if(!clean || /^[\d—–\-]+$/.test(clean)) return tok;
      var g = glossLookup(clean);
      if(!g || g.isName) return tok;
      return '<span class="link-word" data-action="glossWord" data-word="'+escapeHtml(clean)+'" data-def="">'+tok+'</span>';
    }).join("");
  }).join("");
}
