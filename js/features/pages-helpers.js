/* Drumul spre Romana — the PAGES helper layer.
 *
 * Extracted verbatim from index.html. 43 symbols: the placement-test engine,
 * the course-map sidebar, the grammar/vocab/dialogue card renderers, the
 * exam/drill/practice pool builders, the media-list helpers, the ILR mock
 * report, the progress counters, and the transfer/next-lesson cards on Home.
 *
 * This is every remaining private dependency of the 21 still-inline
 * PAGES.<name> = function(){...} assignments. Moving it closes that
 * dependency graph completely: PAGES.* now has zero IIFE-private
 * dependencies left in index.html.
 *
 * PLACEMENT_STOP stays behind in index.html on purpose -- it sits between
 * PLACEMENT_PASS and PLACEMENT_PER_BAND in source but is read only by
 * recordPlacement, an Actions-adjacent function that has not moved.
 *
 * 16 of these 43 are also called directly by Actions (ilrMockState,
 * mockItems, newPlacementRun, placementResult, practicePool and others),
 * not only through PAGES.*. Actions remains inline and resolves all of them
 * as globals, the same pattern already proven for render/navigate/Speech.
 *
 * The "use strict" directive is not new — it is the mode this code already
 * ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

var PLACEMENT_PASS = 0.75;   // 3 of 4 to clear a band

var PLACEMENT_PER_BAND = 4;   // asked per band, drawn at random from the pool

/* Gap-fill is offered from A2 upward only: below that, the learner has not met
   enough vocabulary for a blank to be a listening test rather than a lottery. */
function gapfillEligible(levelId){ return /^(a2|b1)/.test(String(levelId||"")); }

function elapsedSince(t){
  if(!t) return "0:00";
  var s = Math.max(0, Math.floor((Date.now()-t)/1000));
  var m = Math.floor(s/60);
  return m + ":" + String(s%60).padStart(2,"0");
}

/* Romanian dictionaries and coursebooks mark words as s.f. / s.m. / s.n. /
   adj. / vb. — the convention a learner will meet in any Romanian material,
   so the course uses it too, with the English spelled out alongside. */
function posAbbrev(v){
  if(v.pos==="noun"){
    return {m:"s.m.", f:"s.f.", n:"s.n.", "m/f":"s.m./s.f.", "n/f":"s.n./s.f."}[v.gender] || "s.";
  }
  return {verb:"vb.", adj:"adj.", adv:"adv.", prep:"prep.", conj:"conj.",
          pron:"pron.", num:"num.", phrase:"expr.", art:"art."}[v.pos] || v.pos;
}

function totalLessonsBuilt(){ return LESSONS.length; }

function lessonsCompleted(){ return LESSONS.filter(function(l){ return lessonProgress(l.id).status==="complete"; }).length; }

function wordsLearned(){ return Object.keys(state.vocabSrs).length; }

function wordsMastered(){ return Object.keys(state.vocabSrs).filter(function(id){ return state.vocabSrs[id].status==="Mastered"; }).length; }

function unitStatus(unit){
  var ls = lessonsOfUnit(unit.id);
  if(!ls.length) return "soon";
  var done = ls.filter(function(l){ return lessonProgress(l.id).status==="complete"; }).length;
  if(done===ls.length) return "done";
  if(done>0) return "current";
  return isUnitUnlocked(unit) ? "open" : "locked";
}

function unitMastery(unit){
  var ls = lessonsOfUnit(unit.id);
  if(!ls.length) return 0;
  var sum = ls.reduce(function(a,l){ return a + lessonProgress(l.id).bestScore; },0);
  return Math.round(sum/ls.length);
}

function unitsBefore(unit){
  return UNITS.filter(function(u){
    return u.levelId===unit.levelId && u.order < unit.order && lessonsOfUnit(u.id).length;
  });
}

/* Exercises the learner has agreed to see. The profanity unit is opt-in, and an
   opt-in that only guards its own lesson page is not an opt-in at all — those
   questions would still surface through Practice ("all levels"), the Listening
   set, topic drills and vocabulary review. Every broad scan over EXERCISES goes
   through here so the consent holds everywhere. */
function isSensitiveExercise(e){
  var l = e && e.lesson && lessonById(e.lesson);
  return !!(l && l.sensitive);
}

function openExercises(){
  return EXERCISES.filter(function(e){
    /* Mock-exam items are reserved for the simulation. If they leaked into
       practice, review, the listening set or the drills, the learner would
       meet them before sitting the mock and the mock would then measure
       recall of specific items rather than readiness. */
    if(e.mock) return false;
    if(!state.settings.showProfanity && isSensitiveExercise(e)) return false;
    return true;
  });
}

function grammarExerciseCount(topicId){
  return EXERCISES.filter(function(e){ return e.topic===topicId; }).length;
}

/* Counts through openExercises so the number shown matches the number the
   drill will actually serve — the raw EXERCISES list includes mock-exam items
   and, when not opted in, the profanity unit. */
function practiceLinkFor(topicId){
  var n = openExercises().filter(function(e){ return e.topic===topicId; }).length;
  if(!n) return '<div style="font-size:13px;color:var(--text-3)">No exercises target this rule directly yet — it is practiced inside the lessons that introduce it.</div>';
  return '<button class="btn" data-action="startTopicPractice" data-topic="'+topicId+'">Drill this rule ('+n+' exercise'+(n===1?"":"s")+')</button>';
}

/* Drill everything the current filters are showing. The level and category
   chips were previously only a way to browse; this turns a filtered view into
   a practice set, which is what a learner narrowing to "A2 · Verbs" actually
   wants next. */
function grammarDrillBar(list){
  var ids = list.map(function(g){ return g.id; });
  var pool = openExercises().filter(function(e){ return ids.indexOf(e.topic)>-1; });
  if(!pool.length) return '';
  var withEx = list.filter(function(g){
    return pool.some(function(e){ return e.topic===g.id; });
  }).length;
  return '<div class="card" style="padding:14px 16px;margin-bottom:16px;display:flex;gap:12px;'+
      'align-items:center;flex-wrap:wrap;border-left:3px solid var(--accent)">'+
    '<div style="flex:1;min-width:220px">'+
      '<b style="font-family:var(--font-display);font-size:15px">Drill what you are looking at</b>'+
      '<div style="font-size:12.8px;color:var(--text-3);margin-top:3px">'+
        pool.length+' exercise'+(pool.length===1?"":"s")+' across '+withEx+' rule'+(withEx===1?"":"s")+
        ', shuffled so nothing tells you which one is being tested.</div>'+
    '</div>'+
    '<button class="btn" data-action="drillGrammarFiltered">Start drill</button>'+
  '</div>';
}

function exercisesForUnits(units){
  var lessonIds = [];
  units.forEach(function(u){ lessonsOfUnit(u.id).forEach(function(l){ lessonIds.push(l.id); }); });
  return EXERCISES.filter(function(e){ return lessonIds.indexOf(e.lesson)>-1; });
}

/* Spread the draw across skills so an exam can't be all grammar by accident. */
function balancedDraw(pool, n){
  var bySkill = {};
  pool.forEach(function(e){ (bySkill[e.skill] = bySkill[e.skill]||[]).push(e); });
  var skills = Object.keys(bySkill);
  skills.forEach(function(s){ bySkill[s] = shuffle(bySkill[s]); });
  var out = [], i = 0;
  while(out.length < n && skills.length){
    var s = skills[i % skills.length];
    if(bySkill[s].length) out.push(bySkill[s].shift());
    else { skills.splice(i % skills.length, 1); continue; }
    i++;
  }
  return out;
}

function buildExam(kind, id){
  if(kind==="checkpoint"){
    var unit = unitById(id);
    if(!unit) return null;
    var pool = exercisesForUnits(unitsBefore(unit));
    if(!pool.length) return null;
    return {
      kind:"checkpoint", id:id,
      title:"Checkpoint · "+unit.titleEn,
      blurb:"Mixed questions drawn from the units you've completed in this level. The grammar point being tested is deliberately not named.",
      items: balancedDraw(pool, Math.min(12, pool.length)),
      passMark: 70
    };
  }
  var level = levelById(id);
  if(!level) return null;
  var levelUnits = UNITS.filter(function(u){ return u.levelId===level.id && lessonsOfUnit(u.id).length; });
  var pool2 = exercisesForUnits(levelUnits);
  if(!pool2.length) return null;
  /* A level exam weights toward production and comprehension rather than
     recognition — closer to what the CEFR descriptor actually claims. */
  var core = balancedDraw(pool2.filter(function(e){ return e.type!=="produce"; }), 14);
  var written = pool2.filter(function(e){ return e.type==="produce"; });
  var comprehension = pool2.filter(function(e){ return e.skill==="reading" || e.skill==="listening"; });
  var items = core
    .concat(shuffle(comprehension).slice(0,3))
    .concat(shuffle(written).slice(0,2));
  // de-duplicate while preserving order
  var seen = {}, uniq = [];
  items.forEach(function(e){ if(e && !seen[e.id]){ seen[e.id]=1; uniq.push(e); } });
  return {
    kind:"exam", id:id,
    title:level.code+" Level Exam",
    blurb:"A full assessment of "+level.code+": vocabulary, grammar, listening, reading and written production. Results are reported per skill, not as a single number.",
    items: uniq, passMark: 75
  };
}

function filteredVerbs(){
  var q = session.verbQuery||"", grp = session.verbGroup||"all";
  return VERBS.filter(function(x){
    if(grp==="irregular" && !verbIsIrregular(x)) return false;
    if(grp==="reflexive" && !verbIsReflexive(x)) return false;
    if(grp==="marked" && state.verbsMarked.indexOf(x.id)===-1) return false;
    if(["I","I-ez","II","III","IV","IV-esc","IV-î"].indexOf(grp)>-1 && verbGroupKey(x)!==grp) return false;
    if(q){
      var hay = normLoose(x.inf+" "+x.en);
      if(hay.indexOf(normLoose(q))===-1) return false;
    }
    return true;
  }).sort(function(a,b){ return normLoose(a.inf) < normLoose(b.inf) ? -1 : 1; });
}

function drillPool(cfg){
  return VERBS.filter(function(v){
    if(cfg.scope==="irregular" && !verbIsIrregular(v)) return false;
    if(cfg.scope==="reflexive" && !verbIsReflexive(v)) return false;
    if(cfg.scope==="marked" && state.verbsMarked.indexOf(v.id)===-1) return false;
    if(["I","I-ez","II","III","IV","IV-esc"].indexOf(cfg.scope)>-1 && verbGroupKey(v)!==cfg.scope) return false;
    return true;
  });
}

function mockItems(kind, paper){
  return EXERCISES.filter(function(e){
    return e.mock===kind && (paper==null || e.paper===paper);
  });
}

function practicePool(cfg){
  return openExercises().filter(function(e){
    var l = lessonById(e.lesson);
    if(cfg.level!=="all"){
      var lvl = l? l.levelId:"";
      var fam = cfg.level.slice(0,2);
      if(lvl.slice(0,2)!==fam) return false;
    }
    if(cfg.skill!=="all" && e.skill!==cfg.skill) return false;
    return true;
  });
}

function mediaByKind(k){ return MEDIA.filter(function(m){ return m.kind===k; }); }

function mediaLevels(){
  var out = [];
  MEDIA.forEach(function(m){ if(out.indexOf(m.level)===-1) out.push(m.level); });
  return out.sort();
}

function mediaCard(m){
  var hasScript = !!mediaTranscript(m.id);
  return '<div class="card" style="padding:16px 18px;margin-bottom:12px">'+
    '<div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin-bottom:4px">'+
      '<span class="badge accent">'+escapeHtml(m.level)+'</span>'+
      (m.levelSource==="stated"? '<span class="badge neutral" title="Level stated by the channel">stated</span>'
                               : '<span class="badge neutral" title="Level judged from the content, not stated by the channel">approx.</span>')+
      (m.kind==="song"? '<span class="badge pine">song</span>':'')+
      (hasScript? '<span class="badge pine">transcript saved</span>':'')+
    '</div>'+
    '<b style="font-family:var(--font-display);font-size:16px">'+escapeHtml(m.title)+'</b>'+
    '<div style="font-size:12.5px;color:var(--text-3);margin-top:2px">'+escapeHtml(m.channel)+'</div>'+
    '<p style="font-size:13.2px;color:var(--text-2);line-height:1.55;margin-top:7px;max-width:64ch">'+escapeHtml(m.note)+'</p>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:11px">'+
      '<button class="btn secondary sm" data-action="go" data-page="media" data-p1="'+m.id+'">Open &amp; shadow</button>'+
      '<a class="btn ghost sm" href="https://www.youtube.com/watch?v='+m.id+""+'" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>'+
    '</div>'+
  '</div>';
}

function ilrMockState(){
  if(!session.ilrMock) session.ilrMock = {paper:0, started:null, done:false};
  return session.ilrMock;
}

/* Per-paper results. Free writing is excluded from the scored denominator for
   the same reason it is everywhere else — nothing here can grade it — and is
   counted and reported separately instead of being quietly dropped. */
function ilrMockReport(papers, allItems){
  var rows = papers.map(function(p){
    var gradable = p.items.filter(function(e){
      var f = session.feedback[e.id]; return f && f.verdict!=="submitted";
    });
    var correct = gradable.filter(function(e){ return session.feedback[e.id].verdict==="correct"; }).length;
    var selfCheck = p.items.filter(function(e){
      var f = session.feedback[e.id]; return f && f.verdict==="submitted";
    }).length;
    var skipped = p.items.filter(function(e){ return !session.feedback[e.id]; }).length;
    return {meta:p.meta, total:p.items.length, gradable:gradable.length, correct:correct,
            selfCheck:selfCheck, skipped:skipped,
            score: gradable.length? pct(correct, gradable.length) : null};
  });
  var scored = rows.filter(function(r){ return r.score!==null; });
  var overall = scored.length
    ? Math.round(scored.reduce(function(a,r){ return a+r.score; },0)/scored.length) : null;

  return '<div class="section-eyebrow">I.L.R. · Rezultate</div>'+
    '<h1 style="font-size:28px;margin-bottom:6px">Mock exam results</h1>'+
    '<p style="color:var(--text-2);font-size:13.5px;max-width:64ch;margin-bottom:18px">Scored per paper, because the real exam is. A strong reading paper does not compensate for a weak written one.</p>'+
    '<div class="card" style="padding:22px 24px;margin-bottom:16px">'+
      rows.map(function(r){
        var col = r.score===null? "var(--text-3)" : r.score>=70? "var(--pine)" : r.score>=50? "var(--accent-strong)" : "var(--brick)";
        return '<div style="padding:14px 0;border-bottom:1px solid var(--line)">'+
          '<div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap">'+
            '<span class="badge neutral">Proba '+r.meta.n+'</span>'+
            '<b style="font-family:var(--font-display);font-size:15px">'+escapeHtml(r.meta.en)+'</b>'+
            '<span class="tabular" style="margin-left:auto;font-weight:700;font-size:18px;color:'+col+'">'+
              (r.score===null? "—" : r.score+"%")+'</span>'+
          '</div>'+
          '<div style="font-size:12.8px;color:var(--text-3);margin-top:5px">'+
            (r.gradable? r.correct+' of '+r.gradable+' auto-graded correct' : 'nothing auto-gradable on this paper')+
            (r.selfCheck? ' · '+r.selfCheck+' written task'+(r.selfCheck===1?"":"s")+' to compare against the model yourself' : '')+
            (r.skipped? ' · '+r.skipped+' not attempted' : '')+
          '</div>'+
        '</div>';
      }).join("")+
      (overall!==null
        ? '<div style="margin-top:16px;font-size:13.5px;color:var(--text-2)">Average across auto-graded papers: <b>'+overall+'%</b>. '+
          'The written papers carry heavy weight in the real exam and cannot be scored here — read them against the models before judging yourself ready.</div>'
        : '')+
    '</div>'+
    whatYouGotWrong(allItems, {retryAction:null})+
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px">'+
      '<button class="btn" data-action="restartIlrMock">Sit it again</button>'+
      '<button class="btn secondary" data-action="go" data-page="home">Back to the track</button>'+
    '</div>';
}

/* Point at the ILR's own published papers rather than asking anyone to take
   this course's word for the format. Exam requirements change, and a
   preparation course that cannot be checked against the source is worth less
   than one that can. Deliberately prominent rather than tucked in a footer. */
function ilrSourceCard(){
  return '<div class="card" style="padding:18px 20px;margin-bottom:22px;border-left:3px solid var(--accent)">'+
    '<b style="font-family:var(--font-display);font-size:15px">Check the format against the source</b>'+
    '<p style="font-size:13.3px;color:var(--text-2);line-height:1.6;margin-top:6px;max-width:64ch">'+
      'This track is built on the sample papers the Institutul Limbii Române publishes itself (November 2019 '+
      'Bucharest session). The materials here are written for this course — the official papers are linked, not '+
      'reproduced. Exam requirements change, so confirm dates, fees and the current format with the ILR before '+
      'you sit it.</p>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">'+
      '<a class="btn secondary sm" href="https://www.ilr.ro/category/atestate/aplicatii-si-nivel-prag/" target="_blank" rel="noopener noreferrer">Official sample papers ↗</a>'+
      '<a class="btn ghost sm" href="https://www.ilr.ro/category/atestate/sesiuni-de-atestare/" target="_blank" rel="noopener noreferrer">Exam sessions ↗</a>'+
      '<a class="btn ghost sm" href="https://www.ilr.ro/atestate/legislatie-atestate/" target="_blank" rel="noopener noreferrer">Legislation ↗</a>'+
    '</div>'+
  '</div>';
}

function placementFlatIndex(st, bandIdx, itemIdx){
  var n = 0;
  for(var b=0;b<bandIdx;b++) n += st.picks[b].length;
  return n + itemIdx;
}

/* Score each band, then place at the FIRST band not cleared — that is where
   the learner still has something to learn, which is where they should start. */
function placementResult(st){
  var bands = [];
  for(var b=0; b<PLACEMENT_BANDS.length; b++){
    var band = PLACEMENT_BANDS[b];
    var items = st.picks[b];
    var answered = 0, correct = 0;
    items.forEach(function(item, i){
      var key = b+"_"+i;
      if(!(key in st.answers)) return;
      answered++;
      if(item.type==="mcq"){ if(st.answers[key]===item.a) correct++; }
      else if(item.accept.some(function(a){ return normLoose(st.answers[key])===normLoose(a); })) correct++;
    });
    if(!answered) break;
    bands.push({level:band.level, label:band.label, correct:correct, total:answered,
                pct:pct(correct,answered), passed: (correct/answered) >= PLACEMENT_PASS});
  }
  var placement = PLACEMENT_BANDS[0].level;
  for(var i=0;i<bands.length;i++){
    if(bands[i].passed) placement = PLACEMENT_BANDS[Math.min(i+1, PLACEMENT_BANDS.length-1)].level;
    else { placement = bands[i].level; break; }
  }
  return {bands:bands, placement:placement,
          totalCorrect: bands.reduce(function(a,x){return a+x.correct;},0),
          totalAsked: bands.reduce(function(a,x){return a+x.total;},0)};
}

/* Draw this attempt's questions: a random subset of each band, each with its
   options in a random order. Regenerated on every retake. */
function newPlacementRun(){
  return {
    bandIndex:0, itemIndex:0, answers:{}, done:false, typed:"",
    picks: PLACEMENT_BANDS.map(function(band){
      var chosen = pick(band.items, Math.min(PLACEMENT_PER_BAND, band.items.length));
      return chosen.map(function(item){
        var copy = {};
        for(var k in item) copy[k] = item[k];
        if(copy.type==="mcq"){
          var order = shuffle(copy.opts.map(function(_,i){ return i; }));
          copy.opts = order.map(function(i){ return item.opts[i]; });
          copy.a = order.indexOf(item.a);
        }
        return copy;
      });
    })
  };
}

/* Unit order across the whole course: grouped by LEVELS (which already spans
   every track — CEFR, citizenship, ILR, register — in course order), then by
   each unit's own `order` within its level. Mirrors readingSequence(). */
function unitSequence(){
  var out = [];
  LEVELS.forEach(function(lv){
    UNITS.filter(function(u){ return u.levelId===lv.id; })
      .sort(function(a,b){ return a.order-b.order; })
      .forEach(function(u){ out.push(u); });
  });
  /* Anything whose level is not in LEVELS would otherwise vanish from the
     sequence and become unreachable by arrow. */
  UNITS.forEach(function(u){ if(out.indexOf(u)===-1) out.push(u); });
  return out;
}

function unitNeighbours(u){
  var seq = unitSequence();
  var i = seq.findIndex(function(x){ return x.id===u.id; });
  return {prev: i>0? seq[i-1] : null, next: (i>-1 && i<seq.length-1)? seq[i+1] : null,
          index: i+1, total: seq.length};
}

/* Disabled rather than hidden at the ends, so the control does not reflow
   between units. Mirrors readingNav(). */
function unitNav(u){
  var n = unitNeighbours(u);
  var btn = function(t, glyph, label){
    if(!t) return '<button class="unit-arrow" disabled aria-label="'+label+'">'+glyph+'</button>';
    return '<button class="unit-arrow" data-action="go" data-page="unit" data-p1="'+t.id+'" '+
      'title="'+escapeHtml(t.title)+'" aria-label="'+label+': '+escapeHtml(t.title)+'">'+glyph+'</button>';
  };
  return '<div class="unit-nav">'+
    btn(n.prev, "←", "Previous unit")+
    '<span class="unit-count tabular">'+n.index+' / '+n.total+'</span>'+
    btn(n.next, "→", "Next unit")+
  '</div>';
}

function courseMapLevel(lv, activeUnitId){
  return [lv].map(function(lv){
    var units = UNITS.filter(function(u){ return u.levelId===lv.id; }).sort(function(a,b){return a.order-b.order;});
    var open = levelIsOpen(lv.id, activeUnitId);
    var built = units.filter(function(u){ return lessonsOfUnit(u.id).length; }).length;
    return '<div class="level-block">'+
      '<button class="level-head" data-action="toggleLevel" data-level="'+lv.id+'" aria-expanded="'+(open?"true":"false")+'">'+
        '<span class="chev'+(open?" open":"")+'" aria-hidden="true">›</span>'+
        '<h3>'+lv.code+' · '+escapeHtml(lv.name)+'</h3>'+
        '<span class="lvl-pct tabular">'+(open? levelProgressPct(lv.id)+'%' : built+'/'+units.length)+'</span>'+
      '</button>'+
      (open? units.map(function(u){
        var st = unitStatus(u);
        var dot = st==="done" ? '<span class="status-dot done">'+iconCheck()+'</span>'
                : st==="current" ? '<span class="status-dot current">●</span>'
                : st==="locked" ? '<span class="status-dot locked">'+iconLock()+'</span>'
                : st==="soon" ? '<span class="status-dot soon">◌</span>'
                : '<span class="status-dot open">○</span>';
        var built = lessonsOfUnit(u.id).length;
        var sub = built? built+" lesson"+(built===1?"":"s")+(st!=="open"&&st!=="locked"? " · "+unitMastery(u)+"%":"") : "in development";
        var locked = st==="locked";
        return '<div class="unit-node'+(u.id===activeUnitId?" current":"")+(locked?" locked":"")+'"'+
          (locked?'':' data-action="go" data-page="unit" data-p1="'+u.id+'" role="button" tabindex="0"')+'>'+
          dot+'<div><div class="u-title">'+escapeHtml(u.title)+'</div><div class="u-sub">'+escapeHtml(u.titleEn)+' · '+sub+'</div></div></div>';
      }).join("") : '')+
    '</div>';
  }).join("");
}

/* The whole course map, both tracks, in one continuous list — the citizenship
   levels sit below the CEFR ones under their own heading rather than behind a
   toggle, so nothing is hidden from view. Opening any unit switches track by
   itself. */
function courseMapSidebar(activeUnitId){
  var levels = LEVELS;
  return '<div style="display:flex;justify-content:space-between;align-items:center;padding:0 8px 10px">'+
      '<span style="font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3)">Course map</span>'+
      /* "Collapse all" as soon as ANYTHING is open, not only when everything
         is. Requiring every level meant that opening one course by hand left
         the button still offering to expand, with no way to close up again. */
      '<button class="btn ghost sm" style="padding:2px 6px;font-size:11.5px" data-action="toggleAllLevels">'+
        (levels.some(function(l){ return levelIsOpen(l.id, activeUnitId); }) ? "Collapse all" : "Expand all")+'</button>'+
    '</div>'+
    levels.map(function(lv, li){
    var courseId = lv.course||"cefr";
    var prevCourse = li>0 ? (LEVELS[li-1].course||"cefr") : null;
    var groupHeader = (courseId!==prevCourse)
      ? '<div class="course-group">'+
          escapeHtml((COURSES.find(function(c){return c.id===courseId;})||{}).name||courseId)+
        '</div>'
      : '';
    return groupHeader + courseMapLevel(lv, activeUnitId);
  }).join("");
}

/* One-time consent screen for the profanity unit. Says plainly what is behind
   it and why it is worth reading, rather than being coy — the content is a
   comprehension aid, and treating it as forbidden would misrepresent it. */
function profanityGate(l){
  return '<div class="main-inner" style="max-width:620px;padding-top:30px">'+
    '<div class="section-eyebrow">Register track · optional unit</div>'+
    '<h1 style="font-size:28px;margin-bottom:12px">'+escapeHtml(l.title)+'</h1>'+
    '<div class="card" style="padding:22px 24px;margin-bottom:16px">'+
      '<p style="font-size:14px;color:var(--text-2);line-height:1.65;margin-bottom:12px">'+
        'This unit contains Romanian profanity, including strong and anatomical vulgarity, shown with '+
        'literal English translations. It is taught for <b>recognition</b>: what the words mean, how strong '+
        'each one is, and why almost none of them are worth a learner using.</p>'+
      '<p style="font-size:14px;color:var(--text-2);line-height:1.65;margin-bottom:12px">'+
        'It is here because not understanding it is its own problem — you cannot otherwise tell an '+
        'affectionate jab from a real insult, and Romanian swearing is harsher than the English glosses '+
        'suggest. The strongest items are shown partially masked and marked <i>never use</i>.</p>'+
      '<p style="font-size:13px;color:var(--text-3);line-height:1.6;margin-bottom:18px">'+
        'Nothing else in the course depends on this unit. You can skip it entirely, and you can turn it '+
        'back off later from Progress → Settings.</p>'+
      '<div style="display:flex;gap:10px;flex-wrap:wrap">'+
        '<button class="btn" data-action="enableProfanity" data-lesson="'+l.id+'">Show this unit</button>'+
        '<button class="btn secondary" data-action="go" data-page="home">Skip it</button>'+
      '</div>'+
    '</div>'+
  '</div>';
}

/* Two columns of paired sentences, each pair differing in exactly one thing.
   Borrowed from Brâncuș: a contrast shown is understood faster than a rule
   stated, because the learner does the noticing. */
function renderContrast(s){
  return '<div class="card" style="padding:20px 22px">'+
    (s.intro? '<p style="color:var(--text-2);margin-bottom:16px;max-width:62ch">'+s.intro+'</p>':'')+
    '<div class="contrast-grid">'+
      '<div class="contrast-head">'+escapeHtml(s.leftLabel||"A")+'</div>'+
      '<div class="contrast-head">'+escapeHtml(s.rightLabel||"B")+'</div>'+
      s.pairs.map(function(p){
        return '<div class="contrast-cell">'+
            '<div class="ro">'+escapeHtml(p[0])+' '+audioButton(p[0],{small:true,label:false})+'</div>'+
            (p[2]? '<div class="en">'+escapeHtml(p[2])+'</div>':'')+
          '</div>'+
          '<div class="contrast-cell">'+
            '<div class="ro">'+escapeHtml(p[1])+' '+audioButton(p[1],{small:true,label:false})+'</div>'+
            (p[3]? '<div class="en">'+escapeHtml(p[3])+'</div>':'')+
          '</div>';
      }).join("")+
    '</div>'+
    (s.note? '<p style="font-size:13.5px;color:var(--text-2);margin-top:14px;padding-top:12px;border-top:1px solid var(--line)">'+s.note+'</p>':'')+
  '</div>';
}

function renderDialogue(d, opts){
  opts=opts||{};
  return '<div class="card" style="padding:20px 22px">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'+
      '<div><b style="font-family:var(--font-display);font-size:17px">'+escapeHtml(d.title)+'</b>'+
      '<div style="font-size:12.5px;color:var(--text-3)">'+escapeHtml(d.titleEn)+'</div></div>'+
      audioButton(d.lines.map(function(l){return l.ro;}),{label:"Play all",speedControl:true})+
    '</div>'+
    d.lines.map(function(l,i){
      return '<div class="dialogue-line">'+
        '<div class="speaker">'+escapeHtml(l.speaker)+'</div>'+
        '<div class="bubble">'+
          '<div style="display:flex;gap:8px;align-items:flex-start">'+
            /* Dialogue lines are the first Romanian a learner meets in a
               lesson, and they were the one place the gloss did not reach —
               force it on, since a dialogue line is Romanian by definition. */
            '<div class="ro-text" style="flex:1">'+glossify(escapeHtml(l.ro),{force:true})+'</div>'+
            audioButton(l.ro,{small:true,label:false})+
          '</div>'+
          (opts.hideEn && !session.revealed["dlg_"+d.id+"_"+i]
            ? '<button class="btn ghost sm" style="padding:2px 0;margin-top:3px" data-action="revealLine" data-key="dlg_'+d.id+'_'+i+'">show English</button>'
            : '<div class="en-text">'+escapeHtml(l.en)+'</div>')+
        '</div></div>';
    }).join("")+
  '</div>';
}

function renderGrammarArticle(g, compact){
  return '<div class="card" style="padding:22px 24px">'+
    '<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">'+
      '<span class="badge accent">'+escapeHtml(g.level)+'</span><span class="badge neutral">'+escapeHtml(g.cat)+'</span></div>'+
    '<h3 style="font-size:20px;margin-bottom:10px">'+escapeHtml(g.title)+'</h3>'+
    '<p style="color:var(--text-2);line-height:1.6;margin-bottom:16px">'+g.rule+'</p>'+
    (g.formation&&g.formation.length? '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin-bottom:7px">Formation</div>'+
      '<ul style="margin:0 0 16px;padding-left:18px;line-height:1.75;color:var(--text-2)">'+
      g.formation.map(function(f){ return '<li>'+f+'</li>'; }).join("")+'</ul>':'')+
    (g.examples&&g.examples.length? '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin-bottom:7px">Examples</div>'+
      g.examples.map(function(e){
        return '<div style="margin-bottom:10px;padding-left:12px;border-left:2px solid var(--accent)">'+
          '<div style="font-family:var(--font-display);font-size:16px">'+escapeHtml(e.ro)+' '+audioButton(e.ro,{small:true,label:false})+'</div>'+
          '<div style="font-size:13px;color:var(--text-3)">'+escapeHtml(e.en)+'</div></div>';
      }).join("")+'':'')+
    (!compact && g.mistakes&&g.mistakes.length? '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--brick);margin:16px 0 7px">Common mistakes</div>'+
      g.mistakes.map(function(m){
        return '<div style="background:var(--brick-soft);border-radius:var(--radius-s);padding:10px 12px;margin-bottom:8px;font-size:13.5px">'+
          '<div style="text-decoration:line-through;color:var(--brick);font-family:var(--font-display);font-size:15px">'+escapeHtml(m.wrong)+'</div>'+
          '<div style="font-family:var(--font-display);font-size:15px;margin:2px 0 4px">'+escapeHtml(m.right)+'</div>'+
          (m.note? '<div style="color:var(--text-2);font-size:13px">'+m.note+'</div>':'')+'</div>';
      }).join(""):'')+
  '</div>';
}

function renderVocabCard(v){
  var st = state.vocabSrs[v.id];
  var meta = [];
  if(v.pos==="noun"){
    if(v.gender) meta.push({m:"masculine",f:"feminine",n:"neuter","m/f":"masc./fem.","n/f":"neuter/fem."}[v.gender]||v.gender);
    if(v.plural) meta.push("pl. "+v.plural);
    if(v.definite) meta.push("def. "+v.definite);
  }
  /* Some headwords are patterns rather than words — "mai … decât", "la fel de
     … ca". There is nothing coherent to pronounce, so they get no play button;
     the example sentence underneath carries the audio instead. */
  var speakable = v.ro.indexOf("…") === -1;
  return '<div class="vocab-card">'+
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">'+
      '<div><div class="headword">'+escapeHtml(v.ro)+(speakable? audioButton(v.ro,{small:true,label:false}) : '')+'</div>'+
      '<div class="pos"><span style="font-style:italic;color:var(--accent-strong)">'+posAbbrev(v)+'</span> '+
        escapeHtml(v.pos)+(meta.length? ' — '+escapeHtml(meta.join(" · ")):'')+'</div></div>'+
      (st? '<span class="mastery-tag '+st.status+'">'+st.status+'</span>':'')+
    '</div>'+
    (v.register? '<div style="margin-top:5px;display:flex;gap:6px;flex-wrap:wrap"><span class="badge '+
        (v.severity>=3?"brick":/formal/.test(v.register)&&/informal/.test(v.register)?"neutral":/^informal/.test(v.register)?"accent":"pine")+
        '">'+escapeHtml(v.register)+'</span>'+
        /* Strength is shown as its own mark, because "vulgar" alone does not
           tell a learner whether a word is closer to "damn" or to something
           that ends a conversation — and that gap is the whole lesson. */
        (v.severity? '<span class="badge '+(v.severity>=3?"brick":v.severity===2?"accent":"neutral")+'" '+
          'title="Strength '+v.severity+' of 4">'+"●".repeat(v.severity)+"○".repeat(4-v.severity)+'</span>':'')+
        (v.useIt===false? '<span class="badge brick">understand, don\'t use</span>':'')+
      '</div>':'')+
    '<div class="en">'+escapeHtml(v.en)+'</div>'+
    (v.ex? '<div class="ex">'+escapeHtml(v.ex.ro)+' '+audioButton(v.ex.ro,{small:true,label:false})+
      '<div class="ex-en">'+escapeHtml(v.ex.en)+'</div></div>':'')+
  '</div>';
}

function shadowPanel(){
  var s = session.shadow;
  if(!s) return "";
  var d = dialogueById(s.dialogueId);
  if(!d) return "";
  var line = d.lines[s.index];
  var pctDone = pct(s.index, d.lines.length);
  return '<div class="card fade-in" style="padding:22px 24px;margin-bottom:18px;border-left:3px solid var(--pine)">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'+
      '<div><div class="section-eyebrow" style="color:var(--pine)">Shadowing · '+escapeHtml(d.title)+'</div>'+
      '<div style="font-size:12.5px;color:var(--text-3)">Line '+(s.index+1)+' of '+d.lines.length+'</div></div>'+
      '<button class="btn secondary sm" data-action="stopShadow">Stop</button>'+
    '</div>'+
    '<div class="progressbar pine" style="margin-bottom:16px"><span style="width:'+pctDone+'%"></span></div>'+
    '<div style="font-size:11px;font-weight:700;letter-spacing:.3px;text-transform:uppercase;color:var(--text-3)">'+escapeHtml(line.speaker)+'</div>'+
    '<div style="font-family:var(--font-display);font-size:22px;line-height:1.45;margin:4px 0 10px">'+escapeHtml(line.ro)+'</div>'+
    (s.showEn? '<div style="font-size:13.5px;color:var(--text-3);margin-bottom:12px">'+escapeHtml(line.en)+'</div>':'')+
    '<div style="padding:12px 14px;border-radius:var(--radius-s);margin-bottom:14px;font-size:14px;font-weight:600;'+
      (s.phase==="repeat"
        ? 'background:var(--accent-soft);color:var(--accent-strong)">Your turn — say it aloud'
        : 'background:var(--pine-soft);color:var(--pine)">Listen…')+'</div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'+
      '<button class="btn sm" data-action="shadowRepeat">Hear it again</button>'+
      '<button class="btn secondary sm" data-action="shadowNext">Next line →</button>'+
      '<button class="chip" data-action="shadowToggleEn">'+(s.showEn?"Hide English":"Show English")+'</button>'+
      '<span class="speed-row" style="margin-left:auto">'+[0.65,0.8,1].map(function(sp){
        return '<button data-action="setSpeed" data-speed="'+sp+'" class="'+(state.settings.audioSpeed===sp?"active":"")+'">'+sp+'×</button>';
      }).join("")+'</span>'+
    '</div>'+
  '</div>';
}

function transferCard(){
  var open = session.transferOpen;
  return '<div class="card" style="padding:20px 22px;margin-bottom:16px">'+
    '<h2 style="font-size:17px;margin-bottom:6px">Move your progress to another browser</h2>'+
    '<p style="font-size:13.5px;color:var(--text-2);line-height:1.6;max-width:62ch;margin-bottom:12px">'+
      'Your progress is saved in this browser only — there is no account system, because the course is a single file '+
      'that runs with no server behind it. To carry it to another browser or computer, export it here and import it there. '+
      'Nothing is uploaded anywhere.</p>'+
    '<div style="font-size:12.5px;color:var(--text-3);margin-bottom:12px">Currently saved here: '+escapeHtml(progressSummaryLine(state))+'</div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:'+(open?'14px':'0')+'">'+
      '<button class="btn secondary sm" data-action="exportProgress">Download progress file</button>'+
      '<button class="btn secondary sm" data-action="copyProgressCode">Copy transfer code</button>'+
      '<button class="btn secondary sm" data-action="toggleImport">'+(open?'Cancel import':'Import progress')+'</button>'+
    '</div>'+
    (session.transferMsg? '<div style="font-size:13px;color:var(--pine);margin-top:8px">'+escapeHtml(session.transferMsg)+'</div>':'')+
    (session.transferErr? '<div style="font-size:13px;color:var(--brick);margin-top:8px">'+escapeHtml(session.transferErr)+'</div>':'')+
    (session.transferCode
      ? '<textarea readonly rows="4" data-field="exportCode" onclick="this.select()" '+
        'style="width:100%;margin-top:10px;font-family:var(--font-mono);font-size:11px;word-break:break-all">'+
        escapeHtml(session.transferCode)+'</textarea>'+
        '<div style="font-size:12px;color:var(--text-3);margin-top:4px">Click the box to select it all, then copy.</div>'
      : '')+
    (open
      ? '<div style="border-top:1px solid var(--line);padding-top:14px">'+
        '<label class="field-label">Paste a transfer code, or choose a downloaded progress file</label>'+
        '<textarea data-field="importCode" data-action="typeImport" rows="4" placeholder="Paste the code here…" '+
          'style="width:100%;font-family:var(--font-mono);font-size:11.5px;margin-bottom:10px"></textarea>'+
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'+
          '<button class="btn sm" data-action="importProgress">Replace my progress</button>'+
          '<input type="file" accept="application/json,.json" data-action="importFile" style="font-size:12px" />'+
        '</div>'+
        '<p style="font-size:12.5px;color:var(--brick);margin-top:10px">Importing replaces everything currently saved in this browser.</p>'+
      '</div>'
      : '')+
  '</div>';
}

/* Name what comes next rather than only offering a button, so the learner can
   decide whether to continue or stop here. A lesson that was not marked
   complete still gets the option — nothing is gated on it — but the card says
   so plainly instead of quietly moving them on. */
function nextLessonCard(l, passed){
  var next = nextLessonAfter(l);
  if(!next) return '<div class="card" style="padding:16px 18px;margin-bottom:16px">'+
    '<b style="font-family:var(--font-display);font-size:15px">That is the last lesson in this track.</b>'+
    '<p style="font-size:13.5px;color:var(--text-2);margin-top:5px">Head to Review to keep the vocabulary from fading, or take the level exam from the course map.</p></div>';
  var nu = unitById(next.unitId);
  var newUnit = nu && nu.id!==l.unitId;
  return '<div class="card" style="padding:16px 18px;margin-bottom:16px">'+
    '<div class="section-eyebrow" style="margin-bottom:6px">'+(newUnit? "Next unit" : "Next lesson")+'</div>'+
    '<b style="font-family:var(--font-display);font-size:17px">'+escapeHtml(next.title)+'</b>'+
    (next.titleEn? ' <span style="color:var(--text-3);font-size:14px">'+escapeHtml(next.titleEn)+'</span>' : '')+
    (next.objective? '<p style="font-size:13.5px;color:var(--text-2);margin-top:6px;line-height:1.55">'+escapeHtml(next.objective)+'</p>' : '')+
    (newUnit? '<p style="font-size:12.5px;color:var(--text-3);margin-top:8px">Starts <b>'+escapeHtml(nu.title)+'</b> — '+escapeHtml(nu.titleEn||"")+'</p>' : '')+
    (passed? '' : '<p style="font-size:12.5px;color:var(--accent-strong);margin-top:8px">You can move on, but this lesson is not marked complete yet — the material it teaches is assumed from here.</p>')+
  '</div>';
}
