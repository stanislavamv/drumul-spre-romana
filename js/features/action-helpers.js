/* Drumul spre Romana — Actions-adjacent runtime helpers.
 *
 * Extracted verbatim from index.html. Everything Actions calls that is not
 * itself an Actions handler: exercise builders and graders (checkOrder,
 * checkGapfill, buildOrderExercise, buildGapfill, buildConjugationDrill,
 * buildVocabQueue, startQueue, findExercise), the progress-transfer codec
 * (slimStateForCode, stateToCode, codeToState, applyImportedState,
 * rehydrateMistakes), number-to-Romanian formatting (needsDe, romanianNumber,
 * isYear, numberNote), the gloss popup widget (showGlossPopup, glossTimer),
 * the shadowing runner (runShadowLine, shadowTimer), and the placement
 * scorer's threshold (recordPlacement, PLACEMENT_STOP).
 *
 * This is every remaining private dependency of Actions. Moving it closes
 * that dependency graph completely: Actions now has zero IIFE-private
 * dependencies left in index.html.
 *
 * shadowTimer and glossTimer are mutable module-level state, not constants --
 * runShadowLine and showGlossPopup each clear and reassign their own timer.
 * They travel with their owning function exactly as frameQueued travelled
 * with render() in an earlier pass.
 *
 * PLACEMENT_STOP stays a bare constant here on purpose: the two PLACEMENT
 * TEST banners that used to introduce the whole placement system stay behind
 * in index.html, already disconnected from their subject since
 * newPlacementRun/placementResult moved to pages-helpers.js in an earlier
 * pass without them -- not this pass's job to retroactively fix that.
 *
 * The "use strict" directive is not new — it is the mode this code already
 * ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

/* Exercises can be generated at runtime (dictation drills, order-the-lines,
   gap-fill, vocabulary review cards) and never enter EXERCISES. Anything that
   resolves an id from the DOM must search the live session first, or those
   activities silently refuse to submit. */
function findExercise(id){
  var pools = [];
  if(session.queue) pools.push(session.queue);
  if(session.exam && session.exam.items) pools.push(session.exam.items);
  for(var i=0;i<pools.length;i++){
    var hit = pools[i].find(function(e){ return e && e.id===id; });
    if(hit) return hit;
  }
  return exerciseById(id);
}

/* Ordering is graded on sequence, and the feedback names how far off it was —
   one swapped pair is a different kind of error from a scrambled guess. */
function checkOrder(ex){
  var placed = session.built[ex.id] || [];
  var n = ex.lines.length;
  if(placed.length < n){
    return {verdict:"incorrect", correct:ex.lines.map(function(l){return l.ro;}).join(" / "),
      diagnosis:"You've placed "+placed.length+" of "+n+" lines. Put them all in order before checking."};
  }
  var wrong = placed.filter(function(idx,pos){ return idx!==pos; }).length;
  if(wrong===0) return {verdict:"correct", correct:ex.lines.map(function(l){return l.ro;}).join(" / ")};
  return {
    verdict: wrong<=2 ? "almost" : "incorrect",
    correct: ex.lines.map(function(l){return l.ro;}).join(" / "),
    diagnosis: wrong===2
      ? "Two lines are swapped — the rest of the sequence is right. Replay the conversation and listen for which one answers which."
      : wrong+" of "+n+" lines are out of place. Try playing it at 0.65× and following the question-and-answer pairs rather than individual words."
  };
}

function checkGapfill(ex){
  var gaps = session.gaps[ex.id] || {};
  var wrong = [], nearMiss = 0;
  ex.answers.forEach(function(a,i){
    var given = gaps[i]||"";
    if(norm(given)===norm(a)) return;
    if(normLoose(given)===normLoose(a)){ nearMiss++; return; }
    wrong.push(a);
  });
  if(!wrong.length && !nearMiss) return {verdict:"correct", correct:ex.fullText};
  if(!wrong.length) return {verdict:"almost", correct:ex.fullText,
    diagnosis:"Every word is right, but "+nearMiss+" of them "+(nearMiss===1?"is":"are")+" missing diacritics. Those letters are part of the spelling, not decoration."};
  return {
    verdict: wrong.length<=1 ? "almost" : "incorrect",
    correct: ex.fullText,
    diagnosis: wrong.length+" of "+ex.answers.length+" gaps "+(wrong.length===1?"is":"are")+" wrong. Replay at a slower speed — the missing words are unstressed in connected speech, which is exactly what makes them hard to catch."
  };
}

/* ---- Generators: build activities from dialogues that already exist ---- */
function buildOrderExercise(d){
  return {
    id:"ord_"+d.id, lesson:null, skill:"listening", type:"order_lines", diff:3,
    topic:null, generated:true, lines:d.lines,
    prompt:"Listen to the whole conversation, then put the lines back in the order you heard them.",
    explain:"Following a conversation means tracking who answers what, not catching every word. "+
      "Question-and-answer pairs are the anchor: a line ending in a question mark is almost always followed by the reply to it. "+
      "From the dialogue <i>"+escapeHtml(d.title)+"</i> — "+escapeHtml(d.titleEn)+"."
  };
}

function buildGapfill(id, text, levelId, title){
  if(!gapfillEligible(levelId)) return null;
  var clean = String(text||"").replace(/\s+/g," ").trim();
  var raw = clean.split(" ");
  // Blank content words only — skip short function words and anything numeric.
  var candidates = [];
  raw.forEach(function(w,i){
    var bare = w.replace(/[.,!?;:()"„”—–]/g,"");
    if(bare.length>4 && !/^\d+$/.test(bare)) candidates.push(i);
  });
  if(candidates.length < 3) return null;
  var chosen = pick(candidates, Math.min(4, Math.max(3, Math.floor(candidates.length/6)))).sort(function(a,b){return a-b;});
  var answers = [];
  var tokens = raw.map(function(w,i){
    if(chosen.indexOf(i)===-1) return {text:w, blank:false};
    var bare = w.replace(/[.,!?;:()"„”—–]/g,"");
    answers.push(bare);
    return {text:w, blank:true};
  });
  return {
    id:"gap_"+id, lesson:null, skill:"listening", type:"gapfill", diff:4,
    topic:null, generated:true, tokens:tokens, answers:answers, fullText:clean, audio:clean,
    prompt:"Listen and type the missing words. Play it as many times as you need.",
    explain:"The blanked words are content words — the ones that carry meaning and that connected speech tends to compress. "+
      (title? "From <i>"+escapeHtml(title)+"</i>. ":"")+
      "If a word kept escaping you, replay at 0.65×: hearing it slowed down once usually makes it audible at full speed afterwards."
  };
}

/* ---------- MOVING PROGRESS BETWEEN BROWSERS ----------
   Progress lives in this browser's localStorage, which is per-browser and
   per-device by design. Real accounts need a server to hold the data, and this
   course is a single static file with no backend — so instead of pretending,
   the app makes the save file portable: export it, carry it, import it. That
   covers the actual need (continue on another machine) and has the side benefit
   that the data stays yours and never leaves your computer. */
/* The mistake notebook stores the prompt and the full explanation alongside
   every saved mistake, which is most of the save file's bulk. Both are
   reconstructible from the exercise id, so the pasteable code drops them and
   the import puts them back. The downloaded FILE keeps everything, since size
   costs nothing there. */
function slimStateForCode(st){
  var copy = Object.assign({}, st);
  copy.mistakes = (st.mistakes||[]).map(function(m){
    if(!m.exerciseId || !exerciseById(m.exerciseId)) return m;   // generated: keep verbatim
    var s = Object.assign({}, m);
    delete s.explanation; delete s.promptText;
    return s;
  });
  return copy;
}

function rehydrateMistakes(st){
  (st.mistakes||[]).forEach(function(m){
    if(m.explanation && m.promptText) return;
    var ex = m.exerciseId && exerciseById(m.exerciseId);
    if(!ex) return;
    if(!m.explanation) m.explanation = ex.explain;
    if(!m.promptText)  m.promptText  = String(ex.prompt||"").replace(/<[^>]+>/g,"");
  });
  return st;
}

function stateToCode(){
  var json = JSON.stringify({v:2, at:new Date().toISOString(), slim:1, state:slimStateForCode(state)});
  /* btoa is byte-oriented; Romanian text and names are not ASCII. */
  return btoa(unescape(encodeURIComponent(json)));
}

function codeToState(code){
  var json = decodeURIComponent(escape(atob(String(code).replace(/\s+/g,""))));
  var wrapper = JSON.parse(json);
  if(!wrapper || !wrapper.state) throw new Error("not a progress code");
  return rehydrateMistakes(wrapper.state);
}

/* Restore an imported save. The shape check happens in mergeStateShape() —
   shared with the startup load, so a transfer code or file gets the same
   protection against a malformed field as a hand-edited localStorage value.

   writeState() runs last, after building the confirmation message and after
   render(), rather than immediately on reassigning `state`. Both of those
   read the newly-imported state and could throw on something the shape
   check didn't catch; keeping writeState() last means that if they do, the
   bad import was never persisted and the previous save is still there on
   reload — instead of the old failure mode, where a bad import overwrote
   localStorage before anything had a chance to notice it was bad. */
function applyImportedState(incoming, source){
  state = mergeStateShape(incoming);
  session.transferOpen = false;
  session.importCode = "";
  session.transferErr = "";
  session.transferMsg = "Progress restored from "+source+" — "+progressSummaryLine(state)+".";
  render();
  writeState();
}

/* Romanian inserts "de" between a numeral and the noun it counts once the
   numeral reaches 20 — douăzeci DE ani, but nouăsprezece ani. The rule keys off
   the last two digits, so 101 takes no "de" (o sută unu ani) while 120 does. */
function needsDe(n){
  n = Math.floor(Math.abs(n));
  if(n < 20) return false;
  var lastTwo = n % 100;
  return !(lastTwo >= 1 && lastTwo <= 19);
}

function romanianNumber(n, opts){
  opts = opts || {};
  n = Math.floor(Math.abs(n));
  var fem = !!opts.feminine;
  if(n < 10) return (fem ? NUM_ONES_F : NUM_ONES)[n];
  if(n < 20) return NUM_TEENS[n-10];
  if(n < 100){
    var t = Math.floor(n/10), u = n%10;
    return NUM_TENS[t] + (u ? " și " + (fem ? NUM_ONES_F : NUM_ONES)[u] : "");
  }
  if(n < 1000){
    var h = Math.floor(n/100), rest = n%100;
    /* sută is feminine: o sută, două sute, trei sute … */
    var head = h===1 ? "o sută" : NUM_ONES_F[h] + " sute";
    return head + (rest ? " " + romanianNumber(rest, {feminine:fem}) : "");
  }
  if(n < 1000000){
    var th = Math.floor(n/1000), r2 = n%1000;
    /* mie is feminine (o mie, două mii) and is itself a counted noun, so a
       multiplier of 20 or more takes "de": douăzeci DE mii, cinci sute DE mii. */
    var thHead = th===1 ? "o mie"
      : romanianNumber(th, {feminine:true}) + (needsDe(th) ? " de mii" : " mii");
    return thHead + (r2 ? " " + romanianNumber(r2, {feminine:fem}) : "");
  }
  var mil = Math.floor(n/1000000), r3 = n%1000000;
  /* milion is neuter, and neuter nouns take the feminine numeral in the plural:
     două milioane, not *doi milioane. The "de" rule applies here too. */
  var milHead = mil===1 ? "un milion"
    : romanianNumber(mil, {feminine:true}) + (needsDe(mil) ? " de milioane" : " milioane");
  return milHead + (r3 ? " " + romanianNumber(r3, {feminine:fem}) : "");
}

function isYear(n){ return n >= 1000 && n <= 2999; }

function numberNote(n, context){
  var notes = [];
  if(isYear(n)) notes.push("Years are read out in full in Romanian — never split into pairs the way English says “eighteen fifty-nine”.");
  if(needsDe(n) && !isYear(n)) notes.push("Counting a noun needs <b>de</b> from 20 up: <i>" + romanianNumber(n) + " de ani</i>.");
  else if(n >= 20 && !isYear(n)) notes.push("No <b>de</b> here — the last two digits are between 1 and 19: <i>" + romanianNumber(n) + " ani</i>.");
  if(n === 1 && context === "date") notes.push("The first of the month is <b>întâi</b>, not <i>unu</i>.");
  if(String(n).length > 3 && !isYear(n)) notes.push("<b>mie</b> is feminine, so it takes <b>două</b>: <i>două mii</i>.");
  return notes;
}

function buildConjugationDrill(cfg){
  var pool = drillPool(cfg);
  if(!pool.length) return [];
  var tenses = cfg.tenses.length? cfg.tenses : ["present"];
  var out = [];
  for(var i=0; i<cfg.length; i++){
    var v = sample(pool);
    var tense = sample(tenses);
    var T = verbTables(v);
    if(!T[tense]) continue;
    var meta = TENSE_META.find(function(t){ return t.id===tense; });
    if(tense==="imperative"){
      var who = sample(["tu","voi"]);
      /* Verbs whose singular imperative is undeclared (or genuinely unused, as
         with stative a părea) must not become drill questions — there would be
         no correct answer to mark against. */
      if(!T.imperative[who]) continue;
      out.push({
        id:"drill_"+v.id+"_imp_"+who+"_"+i, lesson:null, skill:"grammar", type:"conjugate", diff:3,
        topic:"g_imperative", generated:true, vocab:[],
        prompt: escapeHtml(v.inf)+" — <b>"+who+"</b> — "+meta.ro,
        answer: T.imperative[who], accept:[T.imperative[who], String(T.imperative[who]).replace(/!$/,"")],
        audio: T.imperative[who],
        explain:"<b>"+escapeHtml(T.imperative[who])+"</b> — "+escapeHtml(v.en)+". "+
          (v.notes? escapeHtml(v.notes) : "The voi-imperative is identical to the voi present tense; the tu form is less predictable.")
      });
      continue;
    }
    var person = sample(PERSONS);
    var form = T[tense][person];
    if(!form || form==="—") continue;
    out.push({
      id:"drill_"+v.id+"_"+tense+"_"+person+"_"+i, lesson:null, skill:"grammar", type:"conjugate", diff:3,
      topic: tense==="subjunctive" ? "g_subjunctive" : tense==="imperfect" ? "g_imperfect"
           : tense==="past" ? "g_perfect_compus" : tense==="future" ? "g_future"
           : tense==="conditional" ? "g_conditional" : "g_present",
      generated:true, vocab:[],
      prompt: escapeHtml(v.inf)+" — <b>"+PERSON_LABELS[person]+"</b> — "+meta.ro,
      answer: form, accept:[form],
      audio: form,
      explain:"<b>"+escapeHtml(form)+"</b> — "+escapeHtml(v.en)+" ("+meta.en.toLowerCase()+", "+PERSON_LABELS[person]+")."+
        (verbIsIrregular(v)? " This verb is irregular, so the form has to be known rather than derived." :
          " Conjugation class "+escapeHtml(verbGroupLabel(v))+" — the same endings apply to every verb in that class.")+
        (v.notes? "<br><span style=\"color:var(--text-3)\">"+escapeHtml(v.notes)+"</span>" : "")
    });
  }
  return out;
}

var PLACEMENT_STOP = 0.5;    // below half → stop, the ceiling has been found

/* Shadowing runner. Plays the current line, then holds a silent gap scaled to
   the line's length so there is time to repeat it, then advances by itself. */
var shadowTimer = null;

var glossTimer = null;

/* One popup implementation for both words and numerals — positioning, the
   dismiss timer and the hover-to-keep-open behaviour are identical, and the
   replay control is only reachable because of that timer handling. */
function showGlossPopup(el, title, innerHtml, speakText){
  var old = document.querySelector(".gloss-pop"); if(old) old.remove();
  var pop = document.createElement("div");
  pop.className = "gloss-pop";
  pop.innerHTML = '<b>' + escapeHtml(title) + '</b>' + innerHtml;
  document.body.appendChild(pop);
  var r = el.getBoundingClientRect();
  pop.style.left = Math.min(r.left, window.innerWidth - 250) + "px";
  pop.style.top = (r.bottom + 6) + "px";
  if(speakText) Speech.speak(speakText);
  clearTimeout(glossTimer);
  /* Long enough, and canceled while the pointer is over the popup, so the
     replay control is actually reachable. */
  glossTimer = setTimeout(function(){ pop.remove(); }, 9000);
  pop.addEventListener("mouseenter", function(){ clearTimeout(glossTimer); });
  pop.addEventListener("mouseleave", function(){
    glossTimer = setTimeout(function(){ pop.remove(); }, 1500);
  });
}

/* Advance the placement test, stopping early once a band is clearly beyond the
   learner — there is no point asking B1.2 questions of someone who could not
   clear A1.2, and every extra guess only adds noise to the result. */
function recordPlacement(answer){
  var st = session.placement; if(!st || st.done) return;
  st.answers[st.bandIndex+"_"+st.itemIndex] = answer;
  st.typed = "";
  var items = st.picks[st.bandIndex];

  if(st.itemIndex < items.length-1){
    st.itemIndex++;
    render();
    return;
  }
  // Band finished — score it before deciding whether to continue.
  var correct = 0;
  items.forEach(function(item, i){
    var a = st.answers[st.bandIndex+"_"+i];
    if(item.type==="mcq"){ if(a===item.a) correct++; }
    else if(a && item.accept.some(function(x){ return normLoose(a)===normLoose(x); })) correct++;
  });
  var ratio = correct / items.length;
  var lastBand = st.bandIndex >= PLACEMENT_BANDS.length-1;

  if(lastBand || ratio < PLACEMENT_STOP){
    st.done = true;
  } else {
    st.bandIndex++; st.itemIndex = 0;
  }
  render();
}

function runShadowLine(){
  var s = session.shadow; if(!s) return;
  var d = dialogueById(s.dialogueId); if(!d) return;
  var line = d.lines[s.index];
  clearTimeout(shadowTimer);
  s.phase = "listen"; render();
  Speech.speak(line.ro, {
    onend: function(){
      if(!session.shadow || session.shadow!==s) return;
      s.phase = "repeat"; render();
      // Roughly the time the line itself took, floored at 1.8s.
      var gap = Math.max(1800, line.ro.length * 85 / (state.settings.audioSpeed||1));
      shadowTimer = setTimeout(function(){
        if(!session.shadow || session.shadow!==s) return;
        if(s.index < d.lines.length-1){ s.index++; runShadowLine(); }
        else { session.shadow = null; render(); }
      }, gap);
    },
    onerror: function(){
      if(!session.shadow || session.shadow!==s) return;
      s.phase = "repeat"; render();
    }
  });
}

function startQueue(kind, exercises){
  session.queue = exercises; session.queueKind = kind;
  session.qIndex = 0; session.sessionDone = false;
  /* Clear everything per-attempt, including the option permutation — a new
     session must not present the same answer in the same position. */
  exercises.forEach(function(e){
    delete session.feedback[e.id]; delete session.answers[e.id];
    delete session.built[e.id];    delete session.matched[e.id];
    delete session.gaps[e.id];     delete session.optOrder[e.id];
  });
  render();
}

/* Vocabulary review re-uses whichever course exercises tag the due words; if a
   word has no exercise yet, it gets a generated recognition question so the
   queue is never empty. */
function buildVocabQueue(ids){
  var out = [];
  ids.forEach(function(vid){
    var tagged = openExercises().filter(function(e){ return (e.vocab||[]).indexOf(vid)>-1; });
    if(tagged.length){ out.push(sample(tagged)); return; }
    var v = vocabById(vid); if(!v) return;
    var distractors = pick(VOCAB.filter(function(x){ return x.id!==vid && x.pos===v.pos; }), 2);
    if(distractors.length<2) return;
    var opts = shuffle([v].concat(distractors));
    out.push({
      id:"gen_"+vid, lesson:null, skill:"vocabulary", type:"mcq", diff:1, topic:null, generated:true,
      prompt:'What does <span class="ro" style="font-family:var(--font-display);font-size:20px">'+escapeHtml(v.ro)+'</span> mean?',
      options: opts.map(function(o){ return o.en; }), correct: opts.indexOf(v),
      audio: v.ro, vocab:[vid],
      explain:"<b>"+escapeHtml(v.ro)+"</b> — "+escapeHtml(v.en)+(v.ex? "<br><i>"+escapeHtml(v.ex.ro)+"</i> — "+escapeHtml(v.ex.en):"")
    });
  });
  return out.filter(Boolean);
}
