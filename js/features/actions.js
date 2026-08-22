/* Drumul spre Romana — Actions: the event-delegation handler table.
 *
 * Extracted verbatim from index.html. 90 handlers, one per data-action value
 * a click/input/change/keydown can carry. This was the last IIFE-private
 * cluster in the application: every dependency it has is already a global,
 * either from an earlier extraction or a browser built-in (navigator,
 * localStorage).
 *
 * Actions is called exclusively through the five delegated listeners
 * (click/input/change/keydown×2), which stay inline in index.html and
 * resolve Actions as a global — the same pattern already proven for
 * render/navigate/Speech/PAGES. INPUT_DRIVEN, which the click listener reads
 * to decide which actions must NOT fire on click, stays inline too: nothing
 * in this file uses it, and it belongs to the delegation layer, not to the
 * handlers themselves.
 *
 * The "use strict" directive is not new — it is the mode this code already
 * ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

var Actions = {
  go: function(el){
    var page = el.getAttribute("data-page");
    var ps = [el.getAttribute("data-p1"), el.getAttribute("data-p2")].filter(function(x){ return x!=null; });
    /* Opening a unit or lesson from the map implies its track — keep the rest
       of the app (recommended lesson, Learn page) in step with what was opened. */
    var ctx = page==="unit" ? unitById(ps[0])
            : page==="lesson" ? lessonById(ps[0]) : null;
    if(ctx){
      var lv = levelById(ctx.levelId);
      if(lv) session.course = lv.course||"cefr";
    }
    session.sidebarOpen = false;
    if(page!==parseHash().page){
      session.queue=null; session.queueKind=null; session.sessionDone=false; session.qIndex=0;
      if(page!=="exam") session.exam = null;
    }
    navigate(page, ps);
  },
  toggleSidebar: function(){ session.sidebarOpen = !session.sidebarOpen; render(); },
  setCourse: function(el){
    session.course = el.getAttribute("data-course");
    session.queue=null; session.exam=null; session.sessionDone=false; session.qIndex=0;
    navigate("home");
  },
  toggleLevel: function(el){
    var id = el.getAttribute("data-level");
    state.settings.openLevels = state.settings.openLevels || {};
    var wasOpen = el.getAttribute("aria-expanded")==="true";
    state.settings.openLevels[id] = wasOpen ? "closed" : "open";
    persist(); render();
  },
  /* Operates on every level the sidebar renders, which is all of them across
     all tracks. It used to toggle only the current course's levels while the
     button's label tested all of them — so once there was more than one track,
     "every level is open" was never true, the label was stuck on "Expand all",
     and "Collapse all" could not be reached. */
  toggleAllLevels: function(){
    /* Mirrors the label: if anything is open, close everything; otherwise open
       everything. The active unit's level counts as open even when nothing has
       been set explicitly, so the first click on a fresh session collapses. */
    var route = parseHash();
    var activeUnit = route.page==="unit" ? route.params[0]
                   : (route.page==="lesson" && lessonById(route.params[0]) ? lessonById(route.params[0]).unitId : null);
    var anyOpen = LEVELS.some(function(l){ return levelIsOpen(l.id, activeUnit); });
    state.settings.openLevels = state.settings.openLevels || {};
    LEVELS.forEach(function(l){ state.settings.openLevels[l.id] = anyOpen ? "closed" : "open"; });
    persist(); render();
  },
  /* Same elision handling as glossLookup, so the clip resolves for nost' etc. */
  replayGloss: function(el){ Speech.speak(String(el.getAttribute("data-text")||"").replace(/['’]+$/,"")); },
  setMediaFilter: function(el){
    var cfg = session.mediaFilter || (session.mediaFilter = {level:"all", kind:"all"});
    cfg[el.getAttribute("data-group")] = el.getAttribute("data-val");
    render();
  },
  typeTranscript: function(el){ session.transcriptDraft = el.value; },
  editTranscript: function(el){
    session.mediaEditing = el.getAttribute("data-vid");
    session.transcriptDraft = mediaTranscript(session.mediaEditing);
    render();
  },
  cancelTranscript: function(){
    session.mediaEditing = null; session.transcriptDraft = null; render();
  },
  saveTranscript: function(el){
    var id = el.getAttribute("data-vid");
    state.mediaTranscripts = state.mediaTranscripts || {};
    var text = String(session.transcriptDraft==null ? mediaTranscript(id) : session.transcriptDraft).trim();
    if(text) state.mediaTranscripts[id] = text;
    else delete state.mediaTranscripts[id];
    session.mediaEditing = null; session.transcriptDraft = null;
    persist(); render();
  },
  startIlrMock: function(){
    var st = ilrMockState();
    st.started = Date.now(); st.paper = 0; st.done = false;
    /* Clear any prior attempt so a re-sit is not pre-filled with old answers. */
    mockItems("ilr").forEach(function(e){
      delete session.feedback[e.id]; delete session.answers[e.id];
      delete session.built[e.id];    delete session.matched[e.id];
      delete session.gaps[e.id];     delete session.optOrder[e.id];
    });
    render();
  },
  nextIlrPaper: function(){
    var st = ilrMockState();
    if(st.paper < ILR_PAPERS.length-1){ st.paper++; window.scrollTo(0,0); }
    else st.done = true;
    render();
  },
  restartIlrMock: function(){ session.ilrMock = null; Actions.startIlrMock(); },
  toggleUnlockAll: function(){
    state.settings.unlockAll = !state.settings.unlockAll; persist(); render();
  },
  enableProfanity: function(el){
    state.settings.showProfanity = true; persist();
    navigate("lesson",[el.getAttribute("data-lesson"),"0"]);
  },
  toggleProfanity: function(){
    state.settings.showProfanity = !state.settings.showProfanity; persist(); render();
  },
  playAudio: function(el){
    var seq = el.getAttribute("data-seq");
    var lines = seq ? JSON.parse(seq) : null;
    var text = lines ? lines.join(" ") : el.getAttribute("data-text");
    el.classList.remove("audio-failed");
    el.classList.add("playing");
    var clear = function(){ el.classList.remove("playing"); };
    var fail = function(){
      clear(); el.classList.add("audio-failed");
      el.title = "No Romanian pronunciation for this — see Listening → Pronunciation source";
    };
    var res = lines
      ? Speech.speakSequence(lines, {onend:clear})
      : Speech.speak(text, {onend:clear, onerror:fail});
    if(!res.ok) fail();
    setTimeout(clear, Math.max(2500, text.length*100));
  },
  setSpeed: function(el){ state.settings.audioSpeed = parseFloat(el.getAttribute("data-speed")); persist(); render(); },
  recheckVoices: function(){ Speech.resetSource(); Speech.refresh(); render(); },
  toggleMotion: function(){ state.settings.reduceMotion = !state.settings.reduceMotion; persist(); render(); },

  typeAnswer: function(el){ session.answers[el.getAttribute("data-ex")] = el.value; },
  insertChar: function(el){
    var key = el.getAttribute("data-target");
    var field = document.querySelector('[data-field="'+key+'"]');
    if(!field) return;
    var ch = el.getAttribute("data-char");
    var s = field.selectionStart==null? field.value.length : field.selectionStart;
    var e = field.selectionEnd==null? s : field.selectionEnd;
    field.value = field.value.slice(0,s) + ch + field.value.slice(e);
    field.focus();
    try{ field.setSelectionRange(s+1, s+1); }catch(err){}
    var exId = field.getAttribute("data-ex");
    if(exId) session.answers[exId] = field.value;
  },
  pickOption: function(el){
    var id = el.getAttribute("data-ex");
    if(session.feedback[id]) return;
    session.answers[id] = parseInt(el.getAttribute("data-i"),10);
    render();
  },
  placeWord: function(el){
    var id = el.getAttribute("data-ex");
    if(session.feedback[id]) return;
    session.built[id] = (session.built[id]||[]).concat([parseInt(el.getAttribute("data-i"),10)]);
    render();
  },
  unplaceWord: function(el){
    var id = el.getAttribute("data-ex");
    if(session.feedback[id]) return;
    var arr = (session.built[id]||[]).slice();
    arr.splice(parseInt(el.getAttribute("data-pos"),10),1);
    session.built[id]=arr; render();
  },
  pickMatch: function(el){
    var id = el.getAttribute("data-ex");
    session.matched[id] = session.matched[id]||{};
    session.matched[id][el.getAttribute("data-row")] = el.value;
  },
  revealHint: function(el){ session.revealed[el.getAttribute("data-ex")]=true; render(); },
  revealLine: function(el){
    var k = el.getAttribute("data-key");
    /* Toggles where the control offers to hide again (verse translations);
       one-way reveal everywhere else, where re-hiding makes no sense. */
    session.revealed[k] = el.hasAttribute("data-toggle") ? !session.revealed[k] : true;
    render();
  },
  revealAllLines: function(el){
    var id = el.getAttribute("data-id"), n = parseInt(el.getAttribute("data-n"),10);
    for(var i=0;i<n;i++) session.revealed["lst_"+id+"_"+i] = true;
    render();
  },
  toggleDialogue: function(el){
    var id = el.getAttribute("data-id");
    session.openDialogue = (session.openDialogue===id) ? null : id;
    render();
  },
  placeLine: function(el){
    var id = el.getAttribute("data-ex");
    if(session.feedback[id]) return;
    session.built[id] = (session.built[id]||[]).concat([parseInt(el.getAttribute("data-i"),10)]);
    render();
  },
  unplaceLine: function(el){
    var id = el.getAttribute("data-ex");
    if(session.feedback[id]) return;
    var arr = (session.built[id]||[]).slice();
    arr.splice(parseInt(el.getAttribute("data-pos"),10),1);
    session.built[id] = arr; render();
  },
  typeGap: function(el){
    var id = el.getAttribute("data-ex"), i = el.getAttribute("data-gap");
    session.gaps[id] = session.gaps[id]||{};
    session.gaps[id][i] = el.value;
  },
  startOrderLines: function(el){
    var d = dialogueById(el.getAttribute("data-id"));
    if(!d) return;
    startQueue("listening", [buildOrderExercise(d)]);
    navigate("listening");
  },
  startGapfill: function(el){
    var d = dialogueById(el.getAttribute("data-id"));
    if(!d) return;
    var made = d.lines.map(function(l,i){ return buildGapfill(d.id+"_"+i, l.ro, d.level, d.title); }).filter(Boolean);
    if(!made.length) return;
    startQueue("listening", made);
    navigate("listening");
  },

  /* --- Shadowing --- */
  startShadow: function(el){
    var d = dialogueById(el.getAttribute("data-id"));
    if(!d) return;
    session.shadow = {dialogueId:d.id, index:0, phase:"listen", showEn:false};
    session.openDialogue = null;
    render();
    runShadowLine();
  },
  stopShadow: function(){ Speech.stop(); clearTimeout(shadowTimer); session.shadow=null; render(); },
  shadowRepeat: function(){ runShadowLine(); },
  shadowNext: function(){
    var s = session.shadow; if(!s) return;
    var d = dialogueById(s.dialogueId);
    clearTimeout(shadowTimer); Speech.stop();
    if(s.index < d.lines.length-1){ s.index++; s.phase="listen"; render(); runShadowLine(); }
    else { session.shadow=null; render(); }
  },
  shadowToggleEn: function(){ if(session.shadow){ session.shadow.showEn = !session.shadow.showEn; render(); } },
  /* Turn a dialogue into a dictation drill on the fly — one exercise per line.
     No new content needed: the lines and their clips already exist. */
  startDialogueDictation: function(el){
    var d = dialogueById(el.getAttribute("data-id"));
    if(!d) return;
    startQueue("listening", d.lines.map(function(l,i){
      return {
        id:"dict_"+d.id+"_"+i, lesson:null, skill:"listening", type:"dictation", diff:2,
        topic:null, generated:true,
        prompt:"Listen and type the line exactly as you hear it.",
        audio:l.ro, answer:l.ro, accept:[l.ro],
        hint:"Speaker: "+l.speaker,
        explain:"<b>"+escapeHtml(l.ro)+"</b><br><span style=\"color:var(--text-3)\">"+escapeHtml(l.en)+"</span>"+
          "<br><br>From the dialogue <i>"+escapeHtml(d.title)+"</i>. Replay it at 0.65× if any word ran together — that is normal at conversational speed, not a failure of listening."
      };
    }));
    navigate("listening");
  },
  /* Same popup as a glossed word, but the "meaning" of a numeral is how you say
     it — so the body is the Romanian reading, plus whatever rule that number
     happens to illustrate. */
  glossNumber: function(el){
    var n = parseInt(el.getAttribute("data-num"), 10);
    if(!isFinite(n)) return;
    var asDate = el.hasAttribute("data-date");
    var words = (asDate && n === 1) ? "întâi" : romanianNumber(n);
    var notes = numberNote(n, asDate ? "date" : null);
    var body = '<div style="font-family:var(--font-display);font-size:15px;margin-top:2px">'+escapeHtml(words)+'</div>'+
      (isYear(n)? '<div style="opacity:.7;margin-top:3px;font-size:11.5px">year</div>' : '')+
      notes.map(function(t){ return '<div style="opacity:.8;margin-top:5px;font-size:11.5px;line-height:1.45">'+t+'</div>'; }).join("");
    var canSpeak = Speech.statusFor(words) !== "unavailable";
    var audioRow = canSpeak
      ? '<button type="button" class="gloss-play" data-action="replayGloss" data-text="'+escapeHtml(words)+'">'+iconPlay()+' play again</button>'
      : '<div style="opacity:.6;margin-top:6px;font-size:11.5px">No pronunciation clip for this number yet.</div>';
    showGlossPopup(el, String(n), body + audioRow, canSpeak ? words : null);
  },
  glossWord: function(el){
    var w = el.getAttribute("data-word"), def = el.getAttribute("data-def");
    var g = glossLookup(w);
    var body;
    if(def){
      // A per-text glossary note always wins — it is written for this passage.
      body = '<div>'+escapeHtml(def)+'</div>';
    } else if(g){
      body = '<div>'+escapeHtml(g.en)+'</div>'+
        (g.pos? '<div style="opacity:.7;margin-top:3px">'+escapeHtml(g.pos)+'</div>' : '')+
        (g.lemma && normLoose(g.lemma)!==normLoose(w)
          ? '<div style="opacity:.7;margin-top:2px">'+(g.partOfPhrase?"part of":"from")+' <b>'+escapeHtml(g.lemma)+'</b></div>' : '')+
        (g.note? '<div style="opacity:.75;margin-top:4px">'+escapeHtml(g.note)+'</div>' : '');
    } else {
      body = '<div>Not in the course glossary yet.</div>'+
        '<div style="opacity:.7;margin-top:3px">Search it under Vocabulary, or check the verb reference if it looks like a verb form.</div>';
    }
    /* Say whether this word can actually be pronounced, and give a control to
       replay it. Auto-playing once and going silent left no way to tell a
       missing clip from a missed moment. */
    var canSpeak = Speech.statusFor(w) !== "unavailable";
    var audioRow = canSpeak
      ? '<button type="button" class="gloss-play" data-action="replayGloss" data-text="'+escapeHtml(w)+'">'+iconPlay()+' play again</button>'
      : '<div style="opacity:.6;margin-top:6px;font-size:11.5px">No pronunciation clip for this word yet.</div>';

    showGlossPopup(el, w, body + audioRow, canSpeak ? w : null);
  },

  submitExercise: function(el){
    var id = el.getAttribute("data-ex");
    var ex = findExercise(id); if(!ex || session.feedback[id]) return;
    var result;
    if(ex.type==="mcq"||ex.type==="reading_q"||ex.type==="minimal_pair"){
      var sel = session.answers[id];
      if(sel==null) return;
      result = (sel===ex.correct)
        ? {verdict:"correct", correct:ex.options[ex.correct]}
        : {verdict:"incorrect", correct:ex.options[ex.correct],
           // strip the option's own terminal punctuation so we don't print ".."
           diagnosis:"You chose <b>"+escapeHtml(String(ex.options[sel]).replace(/[.!?]+$/,""))+"</b>."};
    } else if(ex.type==="build"){
      result = checkBuild(ex);
    } else if(ex.type==="order_lines"){
      result = checkOrder(ex);
    } else if(ex.type==="gapfill"){
      result = checkGapfill(ex);
    } else if(ex.type==="match"){
      var picks = session.matched[id]||{};
      var wrong = ex.pairs.filter(function(p,i){ return String(picks[i])!==String(i); }).length;
      result = wrong===0 ? {verdict:"correct"} :
        {verdict:"incorrect", diagnosis:wrong+" of "+ex.pairs.length+" pairs are not matched correctly. The correct pairings are shown above."};
    } else if(ex.type==="produce"){
      result = checkProduce(ex, session.answers[id]);
    } else {
      result = checkAnswer(ex, session.answers[id]);
    }
    gradeAndRecord(ex, result);
    render();
  },
  retryExercise: function(el){
    var id = el.getAttribute("data-ex");
    delete session.feedback[id]; delete session.answers[id];
    delete session.built[id]; delete session.matched[id];
    /* Match exercises cache their pair order under a sibling key. Missing it
       left the pairs in the same positions on every retry while every other
       exercise type reshuffled. */
    delete session.matched[id+"_shuffled"];
    delete session.gaps[id];
    delete session.optOrder[id];      // reshuffle options on a second attempt
    render();
  },
  continueExercise: function(){
    var run = session.exam ? session.exam.items : session.queue;
    if(run){
      if(session.qIndex < run.length-1) session.qIndex++;
      else session.sessionDone = true;
    }
    render();
  },
  retakeExam: function(el){
    session.exam = null; session.qIndex = 0; session.sessionDone = false;
    navigate("exam",[el.getAttribute("data-kind"), el.getAttribute("data-id")]);
  },

  finishLesson: function(el){
    var id = el.getAttribute("data-lesson");
    var l = lessonById(id); if(!l) return;
    var ids = []; l.sections.forEach(function(s){ (s.exerciseIds||[]).forEach(function(x){ if(ids.indexOf(x)===-1) ids.push(x); }); });
    var answered = ids.filter(function(x){ return session.feedback[x]; });
    /* "submitted" means open writing the app cannot grade — it is neither right
       nor wrong, so it must not sit in the denominator. Counting it as a miss
       capped every lesson containing a free-writing task below the 80% needed
       to complete it, no matter how well the learner did. */
    var scorable = ids.filter(function(x){
      var f = session.feedback[x]; return !f || f.verdict!=="submitted";
    });
    var correct = scorable.filter(function(x){
      var f = session.feedback[x]; return f && f.verdict==="correct";
    }).length;
    var score = scorable.length? pct(correct, scorable.length) : 100;
    var prev = lessonProgress(id);
    state.progress.lessons[id] = {
      status: (answered.length===ids.length && score>=80) ? "complete" : "partial",
      bestScore: Math.max(prev.bestScore||0, score),
      attempts: (prev.attempts||0)+1,
      sectionsDone: {}
    };
    // Words from this lesson enter the review queue.
    l.sections.forEach(function(s){ (s.vocabIds||[]).forEach(function(v){ getVocabState(v); }); });
    markActivityToday(); persist();
    session.lastLessonResult = {id:id, score:score, answered:answered.length, total:ids.length, correct:correct};
    navigate("lessondone",[id]);
  },
  restartSession: function(){ session.queue=null; session.queueKind=null; session.sessionDone=false; session.qIndex=0; render(); },
  /* Re-run only the items just got wrong, cleared so they can be re-attempted. */
  retryWrongOnly: function(){
    var pool = session.exam ? session.exam.items : (session.queue||[]);
    var wrong = pool.filter(function(e){
      var f = session.feedback[e.id];
      return f && f.verdict!=="correct";
    });
    if(!wrong.length) return;
    session.exam = null;
    startQueue("practice", shuffle(wrong));
    navigate("practice");
  },

  startReviewDue: function(){ startQueue("review", buildVocabQueue(dueVocabIds())); },
  startReviewWeak: function(){ startQueue("review", buildVocabQueue(weakVocabIds(10))); },
  startReviewGrammar: function(){
    var topics = weakGrammarTopics(5).map(function(t){return t.id;});
    var ex = openExercises().filter(function(e){ return topics.indexOf(e.topic)>-1; });
    startQueue("review", shuffle(ex).slice(0,12));
  },
  /* Recomputes the filtered set from session state rather than trusting a
     value baked into the button, so the drill always matches what is on
     screen even if a filter changed since the last paint. */
  drillGrammarFiltered: function(){
    var q = session.grammarQuery||"", lvl = session.grammarLevel||"all", cat = session.grammarCat||"all";
    var ids = GRAMMAR_TOPICS.filter(function(g){
      if(lvl!=="all" && g.level!==lvl) return false;
      if(cat!=="all" && g.cat!==cat) return false;
      if(q){
        var hay = normLoose(g.title+" "+g.cat+" "+g.rule+" "+(g.formation||[]).join(" "));
        if(hay.indexOf(normLoose(q))===-1) return false;
      }
      return true;
    }).map(function(g){ return g.id; });
    var ex = openExercises().filter(function(e){ return ids.indexOf(e.topic)>-1; });
    if(!ex.length) return;
    startQueue("practice", shuffle(ex));
    navigate("practice");
  },
  startTopicPractice: function(el){
    var topic = el.getAttribute("data-topic");
    var ex = openExercises().filter(function(e){ return e.topic===topic; });
    if(!ex.length) return;
    startQueue("practice", shuffle(ex));
    navigate("practice");
  },
  practiceMistake: function(el){
    var ex = findExercise(el.getAttribute("data-ex"));
    if(!ex) return;
    delete session.feedback[ex.id]; delete session.answers[ex.id]; delete session.built[ex.id];
    startQueue("practice",[ex]); navigate("practice");
  },
  setPractice: function(el){
    var g = el.getAttribute("data-group"), v = el.getAttribute("data-val");
    session.practiceCfg[g] = (g==="length")? parseInt(v,10) : v;
    render();
  },
  startPractice: function(){
    var pool = practicePool(session.practiceCfg);
    var n = session.practiceCfg.length;
    var out = shuffle(pool);
    while(out.length < n && pool.length) out = out.concat(shuffle(pool));
    startQueue("practice", out.slice(0,n));
  },
  startListening: function(){
    startQueue("listening", shuffle(openExercises().filter(function(e){ return e.skill==="listening"; })));
  },

  answerPlacement: function(el){
    recordPlacement(parseInt(el.getAttribute("data-i"),10));
  },
  typePlacement: function(el){ session.placement.typed = el.value; },
  submitPlacement: function(){
    var st = session.placement;
    recordPlacement(String(st.typed||"").trim());
  },
  skipPlacement: function(){ recordPlacement(""); },
  restartPlacement: function(){ session.placement = newPlacementRun(); render(); },
  acceptPlacement: function(el){
    var lvl = el.getAttribute("data-level");
    state.onboarded = true;
    state.placement = lvl;
    if(session.placement) state.placementDetail = placementResult(session.placement);
    UNITS.filter(function(u){ return u.levelId===lvl; }).forEach(function(u){ if(u.order===1) state.unlockedUnits[u.id]=true; });
    var idx = LEVELS.findIndex(function(l){ return l.id===lvl; });
    LEVELS.slice(0,idx).forEach(function(l){
      UNITS.filter(function(u){ return u.levelId===l.id; }).forEach(function(u){ state.unlockedUnits[u.id]=true; });
    });
    markActivityToday(); persist(); navigate("home");
  },
  startFresh: function(){ state.onboarded=true; markActivityToday(); persist(); navigate("home"); },
  toggleVerbMark: function(el){
    var id = el.getAttribute("data-verb");
    var i = state.verbsMarked.indexOf(id);
    if(i>-1) state.verbsMarked.splice(i,1); else state.verbsMarked.push(id);
    persist(); render();
  },
  grammarSearch: function(el){ session.grammarQuery = el.value; render(); },
  setGrammarLevel: function(el){ session.grammarLevel = el.getAttribute("data-v"); render(); },
  setGrammarCat: function(el){ session.grammarCat = el.getAttribute("data-v"); render(); },
  clearGrammarFilters: function(){
    session.grammarLevel="all"; session.grammarCat="all"; session.grammarQuery="";
    render();
  },
  verbSearch: function(el){ session.verbQuery = el.value; render(); },
  setVerbGroup: function(el){ session.verbGroup = el.getAttribute("data-g"); render(); },
  toggleDrillTense: function(el){
    var cfg = session.drillCfg || (session.drillCfg = {tenses:["present"], scope:"all", length:15});
    var t = el.getAttribute("data-t");
    var i = cfg.tenses.indexOf(t);
    if(i>-1) cfg.tenses.splice(i,1); else cfg.tenses.push(t);
    render();
  },
  setDrillScope: function(el){
    (session.drillCfg = session.drillCfg||{tenses:["present"],scope:"all",length:15}).scope = el.getAttribute("data-s");
    render();
  },
  setDrillLength: function(el){
    (session.drillCfg = session.drillCfg||{tenses:["present"],scope:"all",length:15}).length = parseInt(el.getAttribute("data-n"),10);
    render();
  },
  startDrill: function(){
    var items = buildConjugationDrill(session.drillCfg);
    if(!items.length) return;
    startQueue("drill", items);
  },
  /* From a verb page: drill this one tense across the whole verb list, which is
     the practice that actually fixes a paradigm — one verb's table on screen is
     recognition, not recall. */
  drillThisTense: function(el){
    session.drillCfg = {tenses:[el.getAttribute("data-tense")], scope:"all", length:15};
    session.queue = null; session.queueKind = null;
    navigate("drill");
  },
  vocabSearch: function(el){ session.vocabQuery = el.value; render(); },
  setVocabFilter: function(el){ session.vocabFilter = el.getAttribute("data-f"); render(); },

  exportProgress: function(){
    writeState();
    var blob = new Blob([JSON.stringify({v:2, at:new Date().toISOString(), state:state}, null, 1)],
                        {type:"application/json"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "drumul-progress-"+new Date().toISOString().slice(0,10)+".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    session.transferMsg = "Progress file downloaded. Open the course in the other browser, go to Progress → Import progress, and choose this file.";
    session.transferErr = ""; render();
  },
  /* Show the code as well as trying to copy it. Clipboard access is refused in
     plenty of ordinary situations — file:// pages, an unfocused window, a
     locked-down browser — and a button whose only outcome is an error message
     is a dead button. The textarea always works. */
  copyProgressCode: function(){
    writeState();
    var code = stateToCode();
    session.transferCode = code;
    session.transferErr = "";
    session.transferMsg = "Transfer code ready ("+code.length+" characters). Copy all of it, then paste it into Progress → Import progress in the other browser.";
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(code).then(function(){
        session.transferMsg = "Transfer code copied to the clipboard ("+code.length+" characters). Paste it into Progress → Import progress in the other browser.";
        render();
      }, function(){ /* keep the textarea fallback message */ });
    }
    render();
  },
  toggleImport: function(){
    session.transferOpen = !session.transferOpen;
    session.transferMsg = ""; session.transferErr = ""; render();
  },
  typeImport: function(el){ session.importCode = el.value; },
  importProgress: function(){
    try{
      var incoming = codeToState(session.importCode||"");
      applyImportedState(incoming, "transfer code");
    }catch(e){
      session.transferErr = "That doesn't look like a transfer code from this course. Copy the whole thing, with no line breaks removed.";
      session.transferMsg = ""; render();
    }
  },
  importFile: function(el){
    var f = el.files && el.files[0];
    if(!f) return;
    var rd = new FileReader();
    rd.onload = function(){
      try{
        var wrapper = JSON.parse(rd.result);
        if(!wrapper || !wrapper.state) throw new Error("bad file");
        applyImportedState(rehydrateMistakes(wrapper.state), f.name);
      }catch(e){
        session.transferErr = "That file isn't a progress export from this course.";
        session.transferMsg = ""; render();
      }
    };
    rd.readAsText(f);
  },
  resetProgress: function(){
    if(!window.confirm("This permanently deletes all your progress, vocabulary history and saved mistakes in this browser. Continue?")) return;
    try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
    state = defaultState();
    session = defaultSession();
    navigate("home");
  }
};
