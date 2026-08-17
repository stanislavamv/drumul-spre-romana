/* Drumul spre Romana — the answer-checking engine.
 *
 * Extracted verbatim from index.html. Decides what a submitted answer is worth
 * and, for the paths that record, writes the outcome into the learner's
 * progress. Pure logic: nothing here touches the DOM or builds markup, which is
 * why it can be tested by calling it rather than by rendering.
 *
 * The five verdicts are a product decision, not an implementation detail:
 *
 *   correct    exactly right, or right once case, punctuation, whitespace and
 *              cedilla-vs-comma-below spelling are normalised away
 *   almost     the right answer with a small defect — missing diacritics, one
 *              letter out. Carries a `diagnosis` naming what was wrong
 *   unnatural  grammatical but not how a Romanian would say it, e.g. a build
 *              exercise assembled in a legal but odd word order
 *   incorrect  wrong, or nothing submitted
 *   submitted  free writing the app cannot grade. Never "correct" — it carries
 *              selfCheck and the model answer to compare against, because
 *              silently passing unchecked prose would be worse than admitting
 *              the limit
 *
 * checkProduce reaches `submitted` only after checkAgreementStructures and
 * checkDefiniteAfterLike find nothing and the required structures are present,
 * so the order of those calls is the order of the feedback a learner sees.
 *
 * NUMBER_SETS is a lazily built singular/plural lookup for the definite-article
 * rule, rebuilt from VOCAB on first use and never persisted.
 *
 * gradeAndRecord is the one function here with side effects. It updates skill
 * and grammar counters, the SRS, the mistake notebook and the activity streak,
 * all through already-extracted globals, then persists. It does not render.
 */
"use strict";

function levenshtein(a,b){
  if(a===b) return 0;
  var m=a.length, n=b.length;
  if(!m) return n; if(!n) return m;
  var prev=new Array(n+1), cur=new Array(n+1), i, j;
  for(j=0;j<=n;j++) prev[j]=j;
  for(i=1;i<=m;i++){
    cur[0]=i;
    for(j=1;j<=n;j++){
      cur[j] = Math.min(prev[j]+1, cur[j-1]+1, prev[j-1] + (a[i-1]===b[j-1]?0:1));
    }
    var t=prev; prev=cur; cur=t;
  }
  return prev[n];
}

function sameWordsAnyOrder(a,b){
  var wa=norm(a).split(" ").filter(Boolean).sort();
  var wb=norm(b).split(" ").filter(Boolean).sort();
  return wa.length===wb.length && wa.join(" ")===wb.join(" ");
}

function stripLeadPronoun(s){
  var w = norm(s).split(" ");
  if(w.length>1 && SUBJECT_PRONOUNS.indexOf(w[0])>-1) return w.slice(1).join(" ");
  return norm(s);
}

function primaryAnswer(ex){
  if(ex.answer) return ex.answer;
  if(ex.type==="mcq"||ex.type==="minimal_pair"||ex.type==="reading_q") return ex.options[ex.correct];
  return "";
}

/* session.built holds INDICES into ex.words, not the words themselves — they
   have to be mapped back before comparison, or every answer is graded against
   a string like "3 0 1 2". */
function builtSentence(ex){
  return (session.built[ex.id]||[])
    .map(function(i){ return ex.words[i]; })
    .filter(Boolean)
    .join(" ");
}

/* Word-level alignment of what the learner typed against the transcript.
   A plain string comparison tells them "wrong" and nothing else; a dictation
   learner needs to see WHICH words they missed, because that is the whole
   diagnostic value of the exercise. Standard LCS backtrace over loosely
   normalized tokens, so a missing diacritic still aligns and shows up as a
   near-miss rather than shunting every later word out of position. */
function alignTokens(said, heard){
  var a = said, b = heard, n = a.length, m = b.length;
  var grid = [];
  for(var i=0;i<=n;i++){ grid.push(new Array(m+1).fill(0)); }
  for(i=1;i<=n;i++){
    for(var j=1;j<=m;j++){
      grid[i][j] = normLoose(a[i-1])===normLoose(b[j-1])
        ? grid[i-1][j-1]+1
        : Math.max(grid[i-1][j], grid[i][j-1]);
    }
  }
  var out = []; i = n; j = m;
  while(i>0 && j>0){
    if(normLoose(a[i-1])===normLoose(b[j-1])){
      /* Loose match: same word, but the spelling may still differ (diacritics). */
      out.unshift({word:a[i-1], status: norm(a[i-1])===norm(b[j-1]) ? "ok" : "near", typed:b[j-1]});
      i--; j--;
    } else if(grid[i-1][j] >= grid[i][j-1]){
      out.unshift({word:a[i-1], status:"missed"}); i--;
    } else { j--; }   /* extra word the learner typed — dropped, the gap shows it */
  }
  while(i>0){ out.unshift({word:a[i-1], status:"missed"}); i--; }
  return out;
}

/* Name the specific mistake where we can recognize it, rather than only
   restating the expected string. These patterns are real learner errors. */
function diagnose(ex, raw){
  var n = normLoose(raw);
  if(/\bsunt (mers|venit|plecat|dus|fost la)\b/.test(n) || /\b(sunt|este|esti) (mers|venit|plecat)\b/.test(n))
    return "You used <b>a fi</b> as the past auxiliary. Romanian's perfectul compus always builds on <b>a avea</b>: <i>am mers</i>, never <i>sunt mers</i>.";
  if(/^eu este\b/.test(n) || /\beu (este|e|are)\b/.test(n))
    return "The verb doesn't agree with <b>eu</b>. Check the person endings before anything else — that is what carries the subject in Romanian.";
  if(/\bvreau (invat|merg|fac)\b/.test(n))
    return "After <b>a vrea</b> you need <b>să</b> + subjunctive: <i>vreau să învăț</i>. Romanian rarely uses a bare infinitive here.";
  if(ex.type==="conjugate")
    return "That isn't a form of this verb in the tense asked for. Check the verb reference — irregular verbs in particular have to be memorized as a block.";
  if(/\btrezesc\b/.test(n) && !/\bma trezesc\b/.test(n))
    return "This verb is reflexive: the pronoun <b>mă</b> is part of it, not optional.";
  return "Not quite. Read the correct answer and the explanation below, then try saying it aloud once before you continue.";
}

/* ---- Number lookup, built from the vocabulary's own plural/definite fields.
   Used to check agreement in constructions where the verb must match the
   thing, not the person: îmi place / îmi plac, mă doare / mă dor. ---- */
var NUMBER_SETS = null;

function buildNumberSets(){
  var sg = {}, pl = {};
  VOCAB.forEach(function(v){
    if(v.pos!=="noun") return;
    var plurals = String(v.plural||"").split("/").map(function(s){return s.trim();}).filter(Boolean);
    var heads   = String(v.ro).split("/").map(function(s){return s.trim();}).filter(Boolean);
    var defs    = String(v.definite||"").split("/").map(function(s){return s.trim();}).filter(Boolean);

    plurals.forEach(function(p){
      pl[normLoose(p)] = true;
      /* Definite plural: mere→merele, flori→florile, frați→frații. */
      if(/[ei]$/.test(p)) pl[normLoose(p+"le")] = true;
      if(/i$/.test(p))    pl[normLoose(p+"i")]  = true;
    });
    var headIsPlural = plurals.length && normLoose(heads[0])===normLoose(plurals[0]);
    if(!headIsPlural){
      heads.forEach(function(h){ sg[normLoose(h)] = true; });
      defs.forEach(function(d){ sg[normLoose(d)] = true; });
    } else {
      heads.forEach(function(h){ pl[normLoose(h)] = true; });
      defs.forEach(function(d){ pl[normLoose(d)] = true; });
    }
  });
  NUMBER_SETS = {sg:sg, pl:pl};
}

function numberOf(word){
  if(!NUMBER_SETS) buildNumberSets();
  var k = normLoose(word);
  if(!k) return null;
  if(NUMBER_SETS.pl[k]) return "pl";
  if(NUMBER_SETS.sg[k]) return "sg";
  return null;   // unknown — say nothing rather than guess
}

/* Check îmi place/plac and mă doare/dor against the number of what follows.
   Returns a list of concrete, quotable problems — never a vague verdict. */


function checkAgreementStructures(text){
  var issues = [];
  var VERBS_TO_CHECK = [
    {sg:"place", pl:"plac",  pron:LIKE_PRONOUNS},
    {sg:"doare", pl:"dor",   pron:HURT_PRONOUNS}
  ];
  String(text||"").split(/[.!?;\n]+/).forEach(function(sent){
    var toks = sent.trim().split(/\s+/).filter(Boolean);
    for(var i=0;i<toks.length;i++){
      var bare = normLoose(toks[i]);
      var spec = VERBS_TO_CHECK.find(function(v){ return bare===normLoose(v.sg) || bare===normLoose(v.pl); });
      if(!spec) continue;
      /* Require a preceding object pronoun, so we only judge this construction
         and not some unrelated use of the same word. */
      var prev = i>0 ? normLoose(toks[i-1]) : "";
      if(spec.pron.indexOf(prev)===-1) continue;

      // Walk forward to the first word whose number we actually know.
      var subject = null, sawSa = false;
      for(var j=i+1; j<toks.length && j<=i+6; j++){
        var w = toks[j].replace(/[.,!?;:()"„”]/g,"");
        if(!w) continue;
        var nw = normLoose(w);
        if(nw==="sa"){ sawSa = true; break; }              // să-clause
        if(AGREEMENT_SKIP.indexOf(nw)>-1) continue;        // foarte, mult, și…
        var n = numberOf(w);
        if(n){ subject = {w:w, n:n}; }
        break;   // first content word decides; don't skip ahead and guess
      }
      if(sawSa){
        if(bare===normLoose(spec.pl)){
          issues.push("<b>"+escapeHtml(toks[i]+" să…")+"</b> — before a <b>să</b>-clause the verb stays singular: <b>"+spec.sg+" să…</b>");
        }
        continue;
      }
      if(!subject) continue;
      var want = subject.n==="pl" ? normLoose(spec.pl) : normLoose(spec.sg);
      if(bare !== want){
        issues.push("<b>"+escapeHtml(toks[i]+" "+subject.w)+"</b> — <i>"+escapeHtml(subject.w)+"</i> is "+
          (subject.n==="pl" ? "plural, so the verb must be <b>"+spec.pl+"</b>"
                            : "singular, so the verb must be <b>"+spec.sg+"</b>")+
          ". The verb agrees with the thing, not with you.");
      }
    }
  });
  return issues;
}

/* Definite article: after place/plac and doare/dor Romanian normally uses the
   definite form for a general statement. Flag the bare form where we can tell. */
function checkDefiniteAfterLike(text){
  var issues = [];
  if(!NUMBER_SETS) buildNumberSets();
  String(text||"").split(/[.!?;\n]+/).forEach(function(sent){
    var toks = sent.trim().split(/\s+/).filter(Boolean);
    for(var i=0;i<toks.length;i++){
      var bare = normLoose(toks[i]);
      if(bare!=="place" && bare!=="plac") continue;
      var prev = i>0 ? normLoose(toks[i-1]) : "";
      if(LIKE_PRONOUNS.indexOf(prev)===-1) continue;
      for(var j=i+1; j<toks.length && j<=i+6; j++){
        var w = toks[j].replace(/[.,!?;:()"„”]/g,"");
        if(!w) continue;
        var nw = normLoose(w);
        if(nw==="sa") break;                             // să-clause: no article
        if(AGREEMENT_SKIP.indexOf(nw)>-1) continue;
        /* Bare headword where the definite form is what a general statement
           needs — and only when it isn't already the definite form. */
        var v = VOCAB.find(function(x){
          return x.pos==="noun" && x.definite &&
            String(x.ro).split("/").some(function(h){ return normLoose(h.trim())===nw; }) &&
            !String(x.definite).split("/").some(function(d){ return normLoose(d.trim())===nw; });
        });
        if(v){
          issues.push("<b>"+escapeHtml(w)+"</b> → <b>"+escapeHtml(String(v.definite).split("/")[0].trim())+"</b>. "+
            "For a general statement Romanian puts the definite article on the thing liked, where English uses no article.");
        }
        break;
      }
    }
  });
  return issues;
}

/* Graded verdict: correct | almost | unnatural | incorrect.
   `almost` means the meaning is right but the form has a small defect the
   learner should see named — most often missing diacritics. */
function checkAnswer(ex, given){
  var raw = String(given==null?"":given).trim();
  if(!raw) return {verdict:"incorrect", diagnosis:"You didn't enter an answer.", correct:primaryAnswer(ex)};

  var accepted = (ex.accept && ex.accept.length ? ex.accept : [ex.answer]).filter(Boolean);
  var target = primaryAnswer(ex);

  // 1. exact (ignoring case, punctuation, cedilla-vs-comma)
  for(var i=0;i<accepted.length;i++){
    if(norm(raw)===norm(accepted[i])) return {verdict:"correct", correct:target};
  }
  // 2. right but for the subject pronoun
  for(i=0;i<accepted.length;i++){
    if(stripLeadPronoun(raw)===stripLeadPronoun(accepted[i])) return {verdict:"correct", correct:target};
  }
  // 3. right words, missing diacritics
  for(i=0;i<accepted.length;i++){
    if(normLoose(raw)===normLoose(accepted[i])){
      return {verdict:"almost", correct:target,
        diagnosis:"Your words are right, but some Romanian diacritics are missing. Compare your spelling with the answer below — <b>ă â î ș ț</b> are letters in their own right, not accents you can leave off."};
    }
  }
  // 4. right words, wrong order
  for(i=0;i<accepted.length;i++){
    if(sameWordsAnyOrder(raw, accepted[i])){
      return {verdict:"unnatural", correct:target,
        diagnosis:"You used exactly the right words, but not in the order a Romanian would choose here. Romanian word order is flexible, yet each arrangement carries a different emphasis."};
    }
  }
  // 5. one or two characters off — a typo or a single ending
  var best = Infinity;
  accepted.forEach(function(a){ best = Math.min(best, levenshtein(normLoose(raw), normLoose(a))); });
  if(best<=2){
    return {verdict:"almost", correct:target,
      diagnosis:"Very close — this looks like a small slip in an ending or a single letter. Read your answer against the correct one word by word."};
  }
  return {verdict:"incorrect", correct:target, diagnosis:diagnose(ex, raw)};
}

function checkBuild(ex){
  return checkAnswer(ex, builtSentence(ex));
}

/* Grade a fixed text reproduced from memory. Exact wording matters (it is a
   legal formula), but punctuation and capitalization do not, and a missing
   diacritic is a near-miss worth naming rather than a failure. */
function checkRecital(ex, t){
  var target = ex.model || primaryAnswer(ex);
  if(!t) return {verdict:"incorrect", correct:target,
    diagnosis:"Nothing submitted yet — write out as much as you can recall before checking."};
  if(norm(t)===norm(target)) return {verdict:"correct", correct:target};
  if(normLoose(t)===normLoose(target)){
    return {verdict:"almost", correct:target,
      diagnosis:"Word for word this is the oath — the only differences are diacritics. That matters here: <b>apăr</b> (I defend) and <i>apar</i> (I appear) are different verbs. Use the diacritics bar and try once more."};
  }
  /* Name the specific words that went missing rather than just showing the model. */
  var diff = alignTokens(target.split(/\s+/), t.split(/\s+/));
  var missed = diff.filter(function(w){ return w.status==="missed"; })
                   .map(function(w){ return w.word.replace(/[.,]/g,""); });
  var near = diff.filter(function(w){ return w.status==="near"; })
                 .map(function(w){ return "<b>"+escapeHtml(w.word.replace(/[.,]/g,""))+"</b> (you wrote <i>"+escapeHtml(w.typed)+"</i>)"; });
  var bits = [];
  if(missed.length) bits.push("missing: "+missed.map(function(w){ return "<b>"+escapeHtml(w)+"</b>"; }).join(", "));
  if(near.length)   bits.push("spelled differently: "+near.join(", "));
  return {verdict: missed.length>3 ? "incorrect" : "almost", correct:target,
    diagnosis: bits.length
      ? "Close, but not yet word-perfect — "+bits.join("; ")+"."
      : "Your version differs from the official wording. Compare it line by line below."};
}

/* Open production is NEVER graded "correct" — nothing here verifies meaning,
   word order or most of the grammar, and saying "Correct" over text that has
   real errors in it actively teaches the wrong thing. The verdicts are:
     incorrect → too short, or a structure the checker CAN verify is wrong
     almost    → required structures missing
     submitted → nothing detectable is wrong; compare against the model yourself */
function checkProduce(ex, text){
  var t = String(text||"").trim();
  /* Recitation is not open production. Where the task is to reproduce one fixed
     text from memory — the oath, the anthem — there IS a single right answer, so
     it gets graded exactly instead of being sent to self-check. Without this,
     a word-perfect recital comes back "Submitted" and counts against the lesson
     score, which is the opposite of the feedback the learner earned. */
  if(ex.recite) return checkRecital(ex, t);
  var words = t.split(/\s+/).filter(Boolean).length;
  if(words < (ex.minWords||10)){
    return {verdict:"incorrect", correct:ex.model,
      diagnosis:"This is shorter than the task asks for — you wrote "+words+" word"+(words===1?"":"s")+", and the target is at least "+(ex.minWords||10)+". Producing the language yourself is where most of the learning happens, so it's worth the effort."};
  }
  /* Structures we can genuinely verify are checked first — a detected error
     outranks having met the word count. */
  var agreement = checkAgreementStructures(t);
  if(agreement.length){
    return {verdict:"incorrect", correct:ex.model, agreementIssues:agreement,
      diagnosis:"There "+(agreement.length===1?"is one agreement error":"are "+agreement.length+" agreement errors")+
        " in a structure this lesson targets:<br>• "+agreement.join("<br>• ")};
  }
  var missing = (ex.mustUse||[]).filter(function(k){ return normLoose(t).indexOf(normLoose(k))===-1; });
  if(missing.length){
    return {verdict:"almost", correct:ex.model,
      diagnosis:"Good length. The task asked you to use "+missing.map(function(m){return "<b>"+escapeHtml(m)+"</b>";}).join(" and ")+", which I can't find in your answer. Compare with the model below and try folding "+(missing.length>1?"them":"it")+" in."};
  }
  var articles = checkDefiniteAfterLike(t);
  if(articles.length){
    return {verdict:"almost", correct:ex.model, articleIssues:articles,
      diagnosis:"The structures are right, but the article is missing on what is liked:<br>• "+articles.join("<br>• ")};
  }
  return {verdict:"submitted", correct:ex.model, selfCheck:true};
}

function gradeAndRecord(ex, result){
  session.feedback[ex.id] = result;
  state.exercisesCompleted++;
  markActivityToday();
  var ok = result.verdict==="correct";
  recordSkill(ex.skill, ok);
  recordGrammar(ex.topic, ok);
  (ex.vocab||[]).forEach(function(vid){ reviewVocab(vid, ok); });
  if(!ok){
    var g = grammarById(ex.topic);
    saveMistake({
      skill: ex.skill, topicTitle: g? g.title : null, exerciseId: ex.id,
      promptText: String(ex.prompt).replace(/<[^>]+>/g,""),
      yourAnswer: ex.type==="mcq"||ex.type==="reading_q"||ex.type==="minimal_pair"
        ? (ex.options[session.answers[ex.id]]||"(no answer)")
        : (ex.type==="build" ? builtSentence(ex) : (session.answers[ex.id]||"(blank)")),
      correctAnswer: result.correct || primaryAnswer(ex),
      explanation: (result.diagnosis? result.diagnosis+" " : "") + ex.explain
    });
  }
  persist();
}
