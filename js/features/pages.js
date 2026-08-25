/* Drumul spre Romana — the PAGES page-renderer layer.
 *
 * Extracted verbatim from index.html. All 21 PAGES.<name> = function(){...}
 * assignments, in their original source order. Together with the PAGES
 * helper layer (js/features/pages-helpers.js) and everything else already
 * extracted, this is every page the router can land on.
 *
 * `var PAGES = {}` itself lives in js/core/render.js, loaded above this
 * script. These 21 assignments populate that same global object -- nothing
 * here declares or reassigns PAGES, only PAGES.<name>.
 *
 * PAGES.home calls PAGES.welcome() directly as its onboarding fallback. Both
 * assignments move together in this file, and the call resolves exactly as
 * before: through the one global PAGES object, regardless of which script
 * wrote which property onto it.
 *
 * Several section banners that exclusively documented one page moved here
 * with it (HOME / LEARN, FIRST RUN, UNIT OVERVIEW, AUTHOR MODE, GRAMMAR
 * REFERENCE, VOCABULARY, VERB TOOL, REVIEW, MISTAKE NOTEBOOK, PRACTICE
 * GENERATOR, LISTENING, PROGRESS, CHECKPOINTS & LEVEL EXAMS, READING MODE,
 * WRITING MODE). Banners that label code NOT moving -- MOVING PROGRESS
 * BETWEEN BROWSERS, the PLACEMENT TEST banners guarding the PLACEMENT_STOP
 * constant -- were left in index.html on purpose.
 *
 * The "use strict" directive is not new — it is the mode this code already
 * ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

/* ---------- HOME / LEARN ---------- */
PAGES.home = function(){
  if(!state.onboarded) return PAGES.welcome();
  var next = recommendedLesson();
  var nextUnit = unitById(next.unitId);
  var due = dueVocabIds().length;

  var courseObj = COURSES.find(function(c){ return c.id===currentCourse(); }) || COURSES[0];
  var main =
    courseSwitcher()+
    '<p style="color:var(--text-3);font-size:13px;margin:-8px 0 20px;max-width:62ch">'+escapeHtml(courseObj.blurb)+'</p>'+
    saveReminderCard()+
    (currentCourse()==="ilr"? ilrSourceCard() : '')+
    '<div class="section-eyebrow">Continue where you left off</div>'+
    '<h1 style="font-size:30px;margin-bottom:6px">'+escapeHtml(nextUnit.title)+'</h1>'+
    '<p style="color:var(--text-2);margin-bottom:18px;max-width:60ch">'+escapeHtml(next.objective)+'</p>'+
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:28px">'+
      '<button class="btn" data-action="go" data-page="lesson" data-p1="'+next.id+'">'+
        (lessonProgress(next.id).attempts? "Resume":"Start")+' · '+escapeHtml(next.title)+'</button>'+
      (due? '<button class="btn secondary" data-action="go" data-page="review">'+due+' word'+(due===1?"":"s")+' due for review</button>':'')+
    '</div>'+

    '<div class="grid-3" style="margin-bottom:30px">'+
      '<div class="stat-tile"><div class="num">'+lessonsCompleted()+'<span style="font-size:15px;color:var(--text-3)">/'+totalLessonsBuilt()+'</span></div><div class="lbl">Lessons completed</div></div>'+
      '<div class="stat-tile"><div class="num">'+wordsLearned()+'</div><div class="lbl">Words encountered</div></div>'+
      '<div class="stat-tile"><div class="num">'+overallMastery()+'%</div><div class="lbl">Overall accuracy</div></div>'+
    '</div>'+

    '<h2 style="font-size:19px;margin-bottom:4px">Course path</h2>'+
    '<p style="color:var(--text-3);font-size:13.5px;margin-bottom:16px">'+
      (currentCourse()==="civic"
        ? 'Seven units covering the oath, the anthem, the Constitution, geography, history and the interview itself.'
        : 'A1.1 through B1.2. Units unlock as you finish the one before, and you can revisit anything you\'ve completed.')+'</p>'+
    LEVELS.filter(function(l){ return (l.course||"cefr")===currentCourse(); }).map(function(lv){
      var units = UNITS.filter(function(u){ return u.levelId===lv.id; }).sort(function(a,b){return a.order-b.order;});
      var built = units.filter(function(u){ return lessonsOfUnit(u.id).length; }).length;
      return '<div class="card" style="padding:16px 18px;margin-bottom:12px">'+
        '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px">'+
          '<div><b style="font-family:var(--font-display);font-size:17px">'+lv.code+'</b> <span style="color:var(--text-2)">'+escapeHtml(lv.name)+'</span></div>'+
          '<span style="font-size:12px;color:var(--text-3)" class="tabular">'+units.length+' units · '+built+' built</span>'+
        '</div>'+
        '<div class="progressbar" style="margin-bottom:12px"><span style="width:'+levelProgressPct(lv.id)+'%"></span></div>'+
        '<div style="display:flex;flex-wrap:wrap;gap:6px">'+units.map(function(u){
          var st = unitStatus(u);
          var mark = st==="done"?"✓":st==="current"?"●":st==="locked"?"🔒":st==="soon"?"◌":"○";
          var bg = st==="done"?"var(--pine-soft)":st==="current"?"var(--accent-soft)":"transparent";
          var col = st==="done"?"var(--pine)":st==="current"?"var(--accent-strong)":"var(--text-3)";
          var title = st==="soon" ? "Mapped — lesson content still being written"
                    : st==="locked" ? "Finish the previous unit to unlock" : "";
          return '<button class="chip" style="background:'+bg+';color:'+col+(st==="soon"?";border-style:dashed":"")+'"'+
            (title? ' title="'+title+'"':'')+
            (st==="locked"?' disabled':' data-action="go" data-page="unit" data-p1="'+u.id+'"')+'>'+
            mark+' '+escapeHtml(u.titleEn)+'</button>';
        }).join("")+'</div>'+
      '</div>';
    }).join("");

  var rail = '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin-bottom:10px">Your mastery</div>'+
    ["vocabulary","grammar","listening","reading","writing","pronunciation"].map(function(sk){
      return '<div class="mastery-row" style="margin-bottom:9px"><span class="label">'+sk[0].toUpperCase()+sk.slice(1)+'</span>'+
        '<span class="progressbar'+(skillMastery(sk)>=80?" pine":"")+'"><span style="width:'+skillMastery(sk)+'%"></span></span>'+
        '<span class="pct">'+skillMastery(sk)+'</span></div>';
    }).join("")+
    '<hr class="rule" style="margin:16px 0">'+
    '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin-bottom:8px">Needs work</div>'+
    (weakGrammarTopics(4).length
      ? weakGrammarTopics(4).map(function(t){
          var g = grammarById(t.id);
          return '<div style="font-size:13px;margin-bottom:7px"><a href="#/grammar/'+t.id+'" style="text-decoration:none">'+escapeHtml(g?g.title:t.id)+'</a> <span class="tabular" style="color:var(--brick)">'+t.acc+'%</span></div>';
        }).join("")
      : '<div style="font-size:13px;color:var(--text-3)">Complete a few exercises and weak spots will surface here.</div>');

  return shell(courseMapSidebar(nextUnit.id), main, rail);
};

/* ---------- FIRST RUN ---------- */
PAGES.welcome = function(){
  return '<div class="shell"><main class="main"><div class="main-inner" style="max-width:640px;padding-top:40px">'+
    '<div class="section-eyebrow">Bine ai venit</div>'+
    '<h1 style="font-size:38px;line-height:1.15;margin-bottom:14px">Learn Romanian, properly.</h1>'+
    '<p style="color:var(--text-2);font-size:16px;line-height:1.6;margin-bottom:12px;max-width:58ch">A structured A1–B1 course: grammar explained in plain English, vocabulary in context, listening at four speeds, and an answer checker that tells you <i>why</i> — never just a red cross.</p>'+
    '<p style="color:var(--text-3);font-size:14px;margin-bottom:28px;max-width:58ch">Everything you do is saved in this browser. There is no account and nothing leaves your machine.</p>'+
    '<div class="card" style="padding:20px;margin-bottom:14px">'+
      '<h3 style="font-size:17px;margin-bottom:4px">Start from zero</h3>'+
      '<p style="color:var(--text-2);font-size:14px;margin-bottom:14px">Begin at A1.1 with the alphabet and your first greetings. Recommended if you have never studied Romanian.</p>'+
      '<button class="btn" data-action="startFresh">Start at A1.1</button>'+
    '</div>'+
    '<div class="card" style="padding:20px">'+
      '<h3 style="font-size:17px;margin-bottom:4px">Take a placement test</h3>'+
      '<p style="color:var(--text-2);font-size:14px;margin-bottom:14px">Four questions per level, working upward, and it stops as soon as a level is clearly beyond you. Typed answers as well as multiple choice, so a lucky guess can\'t place you three levels too high. Takes about eight minutes.</p>'+
      '<button class="btn secondary" data-action="go" data-page="placement">Take the placement test</button>'+
    '</div>'+
  '</div></main></div>';
};

/* ---------- UNIT OVERVIEW ---------- */
PAGES.unit = function(params){
  var u = unitById(params[0]);
  if(!u) return notFound("That unit doesn't exist.");
  var ls = lessonsOfUnit(u.id);
  var lv = levelById(u.levelId);

  var main = '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap">'+
      '<div><div class="section-eyebrow">'+lv.code+' · Unit '+u.order+'</div>'+
      '<h1 style="font-size:29px;margin-bottom:4px">'+escapeHtml(u.title)+'</h1>'+
      '<p style="color:var(--text-2);font-size:15px;margin-bottom:0">'+escapeHtml(u.titleEn)+'</p></div>'+
      unitNav(u)+
    '</div>'+
    '<p style="color:var(--text-2);max-width:62ch;margin:8px 0 24px">'+escapeHtml(u.blurb)+'</p>';

  /* A unit can point at a purpose-built assessment instead of the generic
     checkpoint builder — the I.L.R. mock is structured as three papers and
     cannot be assembled from a shuffled pool. */
  if(u.mockRoute){
    main += '<div class="card" style="padding:22px 24px;border-left:3px solid var(--accent)">'+
      '<div class="section-eyebrow">Simulare</div>'+
      '<h2 style="font-size:19px;margin-bottom:8px">The three papers, end to end</h2>'+
      '<p style="color:var(--text-2);font-size:14px;max-width:58ch;margin-bottom:14px">Sat in order, on material held back from the lessons, and scored per paper rather than as one blended mark.</p>'+
      '<button class="btn" data-action="go" data-page="'+u.mockRoute+'">Open the mock exam</button>'+
    '</div>';
    return shell(courseMapSidebar(u.id), main, null);
  }
  if(u.checkpoint){
    var cp = buildExam("checkpoint", u.id);
    var lex = u.levelExam ? buildExam("exam", u.levelId) : null;
    main += '<div class="card" style="padding:22px 24px;margin-bottom:14px;border-left:3px solid var(--accent)">'+
      '<div class="section-eyebrow">Checkpoint</div>'+
      '<h2 style="font-size:19px;margin-bottom:8px">Mixed review of this level so far</h2>'+
      '<p style="color:var(--text-2);font-size:14px;max-width:56ch;margin-bottom:14px">Questions are drawn from every unit you\'ve completed in '+lv.code+' and shuffled together. Unlike a lesson, nothing tells you which rule is being tested — that\'s deliberate, so recognizing the pattern can\'t stand in for knowing the language.</p>'+
      (cp
        ? '<button class="btn" data-action="go" data-page="exam" data-p1="checkpoint" data-p2="'+u.id+'">Start checkpoint · '+cp.items.length+' questions</button>'
        : '<p style="font-size:13.5px;color:var(--text-3)">Complete at least one earlier unit in this level to unlock the checkpoint.</p>')+
    '</div>';
    if(u.levelExam){
      main += '<div class="card" style="padding:22px 24px;margin-bottom:14px;border-left:3px solid var(--pine)">'+
        '<div class="section-eyebrow" style="color:var(--pine)">Level exam</div>'+
        '<h2 style="font-size:19px;margin-bottom:8px">'+lv.code+' assessment</h2>'+
        '<p style="color:var(--text-2);font-size:14px;max-width:56ch;margin-bottom:14px">Vocabulary, grammar, listening, reading and written production, scored separately by skill rather than as one number. Pass mark 75%.</p>'+
        (lex
          ? '<button class="btn" data-action="go" data-page="exam" data-p1="exam" data-p2="'+u.levelId+'">Start '+lv.code+' exam · '+lex.items.length+' questions</button>'
          : '<p style="font-size:13.5px;color:var(--text-3)">Complete some lessons in this level first.</p>')+
      '</div>';
    }
    var past = state.examResults.filter(function(r){ return r.id===u.id || r.id===u.levelId; });
    if(past.length){
      main += '<div class="card" style="padding:18px 20px"><h3 style="font-size:15px;margin-bottom:10px">Previous attempts</h3>'+
        past.slice(0,5).map(function(r){
          return '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);font-size:13.5px">'+
            '<span style="flex:1">'+escapeHtml(r.title)+'</span>'+
            '<span class="tabular" style="color:var(--text-3)">'+escapeHtml(r.date)+'</span>'+
            '<span class="badge '+(r.passed?'pine':'brick')+'">'+r.score+'%</span></div>';
        }).join("")+'</div>';
    }
  } else if(!ls.length){
    main += '<div class="card" style="padding:26px;text-align:center">'+
      '<div style="font-size:15px;font-weight:700;margin-bottom:6px">This unit is mapped but not yet written</div>'+
      '<p style="color:var(--text-2);font-size:14px;max-width:52ch;margin:0 auto 16px">The curriculum plan for this unit is fixed — the topics and grammar are listed above. The lesson content itself is still being authored.</p>'+
      '<button class="btn secondary" data-action="go" data-page="home">Back to the course path</button></div>';
  } else {
    main += ls.map(function(l,i){
      var p = lessonProgress(l.id);
      var badge = p.status==="complete" ? '<span class="badge pine">'+iconCheck()+' '+p.bestScore+'%</span>'
                : p.attempts ? '<span class="badge accent">in progress</span>' : '<span class="badge neutral">not started</span>';
      return '<div class="card" style="padding:18px 20px;margin-bottom:12px;display:flex;gap:16px;align-items:flex-start">'+
        '<div style="flex:1">'+
          '<div style="display:flex;gap:10px;align-items:center;margin-bottom:5px">'+
            '<span style="font-family:var(--font-mono);font-size:12px;color:var(--text-3)">'+(i+1)+'</span>'+
            '<b style="font-family:var(--font-display);font-size:17px">'+escapeHtml(l.title)+'</b>'+badge+'</div>'+
          '<div style="font-size:13px;color:var(--text-3);margin-bottom:6px">'+escapeHtml(l.titleEn)+'</div>'+
          '<p style="font-size:13.8px;color:var(--text-2);max-width:58ch">'+escapeHtml(l.objective)+'</p>'+
          '<div style="font-size:12px;color:var(--text-3);margin-top:8px">'+l.sections.length+' stages · '+
            l.sections.filter(function(s){return s.type==="vocab";}).reduce(function(a,s){return a+s.vocabIds.length;},0)+' words</div>'+
        '</div>'+
        '<button class="btn'+(p.status==="complete"?" secondary":"")+'" data-action="go" data-page="lesson" data-p1="'+l.id+'">'+
          (p.status==="complete"?"Review":p.attempts?"Resume":"Start")+'</button>'+
      '</div>';
    }).join("");
  }
  return shell(courseMapSidebar(u.id), main, null);
};

PAGES.media = function(params){
  var openId = params[0] || null;
  if(openId){
    var item = MEDIA.find(function(m){ return m.id===openId; });
    if(item) return shell(null, mediaDetail(item), null);
  }
  var cfg = session.mediaFilter || (session.mediaFilter = {level:"all", kind:"all"});
  var chip = function(group, val, label){
    return '<button class="chip'+(cfg[group]===val?" active":"")+'" data-action="setMediaFilter" '+
      'data-group="'+group+'" data-val="'+escapeHtml(val)+'">'+escapeHtml(label)+'</button>';
  };
  var list = MEDIA.filter(function(m){
    if(cfg.level!=="all" && m.level!==cfg.level) return false;
    if(cfg.kind!=="all" && m.kind!==cfg.kind) return false;
    return true;
  });
  var songs = mediaByKind("song");

  var main = '<h1 style="font-size:28px;margin-bottom:6px">Media & shadowing</h1>'+
    '<p style="color:var(--text-2);margin-bottom:18px;max-width:64ch">Romanian video and music in one place, roughly sorted by level. Nothing loads until you press play. Open any item to add a transcript and shadow along line by line.</p>'+
    '<div class="card" style="padding:16px 18px;margin-bottom:18px">'+
      '<label class="field-label">Level</label>'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">'+
        chip("level","all","Any")+mediaLevels().map(function(l){ return chip("level",l,l); }).join("")+'</div>'+
      '<label class="field-label">Type</label>'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap">'+
        chip("kind","all","Everything")+chip("kind","video","Videos")+chip("kind","song","Songs")+'</div>'+
    '</div>'+
    (list.length? list.map(mediaCard).join("")
      : '<div class="empty-state">Nothing matches those filters yet.</div>')+
    (cfg.kind!=="video" && !songs.length
      ? '<div class="card" style="padding:18px 20px;margin-top:18px;border-left:3px solid var(--accent)">'+
        '<b style="font-family:var(--font-display);font-size:15px">Songs</b>'+
        '<p style="font-size:13.3px;color:var(--text-2);line-height:1.6;margin-top:6px;max-width:62ch">'+
          'No songs added yet. Send me the YouTube links and I will verify each one and add it here with the '+
          'lyrics panel — music is unusually good shadowing material because the melody fixes the stress pattern, '+
          'and Romanian song lyrics tend to use exactly the elisions that make speech hard to follow '+
          '(<i>te-am, s-a, într-un</i>).</p></div>'
      : '')+
    '<div class="card" style="padding:16px 18px;margin-top:18px">'+
      '<div style="font-size:12.5px;color:var(--text-3);line-height:1.6">Videos are embedded from YouTube and remain the property of their channels. '+
      'Levels are approximate — where a channel states one it is used, otherwise it is a judgement. '+
      'If an embed stops working the video has been removed or restricted at source.</div>'+
    '</div>';
  return shell(null, main, null);
};

PAGES.ilrmock = function(){
  var st = ilrMockState();
  var papers = ILR_PAPERS.map(function(p){ return {meta:p, items: mockItems("ilr", p.n)}; });
  var allItems = papers.reduce(function(a,p){ return a.concat(p.items); }, []);

  if(!st.started){
    return shell(null,
      '<div class="section-eyebrow">I.L.R. · Simulare de examen</div>'+
      '<h1 style="font-size:30px;margin-bottom:10px">Full mock exam</h1>'+
      '<p style="color:var(--text-2);max-width:64ch;margin-bottom:18px">Three papers, sat in order, on material you have not seen in the lessons. Each paper is scored separately — that is how the real exam works, and a single combined mark would hide a weak paper behind a strong one.</p>'+
      '<div class="card" style="padding:20px 22px;margin-bottom:16px">'+
        papers.map(function(p){
          return '<div style="padding:12px 0;border-bottom:1px solid var(--line)">'+
            '<div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap">'+
              '<span class="badge accent">Proba '+p.meta.n+'</span>'+
              '<b style="font-family:var(--font-display);font-size:15.5px">'+escapeHtml(p.meta.ro)+'</b>'+
              '<span style="margin-left:auto;font-size:12.5px;color:var(--text-3)">'+p.items.length+' item'+(p.items.length===1?"":"s")+'</span>'+
            '</div>'+
            '<div style="font-size:12.8px;color:var(--text-3);margin-top:3px">'+escapeHtml(p.meta.en)+'</div>'+
            '<p style="font-size:13px;color:var(--text-2);margin-top:6px;line-height:1.55;max-width:62ch">'+escapeHtml(p.meta.note)+'</p>'+
          '</div>';
        }).join("")+
        '<p style="font-size:12.8px;color:var(--text-3);margin-top:14px;line-height:1.6">'+
          '<b>On timing:</b> the ILR does not publish per-paper durations, so this simulation does not impose one — '+
          'an invented limit would train the wrong pace. Elapsed time is shown so you can judge it yourself, and the '+
          'writing tasks are the ones worth timing.</p>'+
      '</div>'+
      '<button class="btn" data-action="startIlrMock">Begin Proba 1</button> '+
      '<button class="btn secondary" data-action="go" data-page="home">Back</button>'
    , null);
  }

  if(st.done) return shell(null, ilrMockReport(papers, allItems), null);

  var cur = papers[st.paper];
  var answered = cur.items.filter(function(e){ return session.feedback[e.id]; }).length;
  var readingId = cur.items.length && cur.items[0].readingId;
  var text = readingId ? readingById(readingId) : null;

  var body =
    '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:6px">'+
      '<div class="section-eyebrow">Proba '+cur.meta.n+' din 3 · '+escapeHtml(cur.meta.en)+'</div>'+
      '<span style="font-size:12.5px;color:var(--text-3)" class="tabular">'+elapsedSince(st.started)+' elapsed</span>'+
    '</div>'+
    '<h1 style="font-size:24px;margin-bottom:8px">'+escapeHtml(cur.meta.ro)+'</h1>'+
    '<p style="color:var(--text-2);font-size:13.5px;max-width:64ch;margin-bottom:16px">'+escapeHtml(cur.meta.note)+'</p>'+
    '<div class="progressbar" style="margin-bottom:18px"><span style="width:'+pct(answered,cur.items.length)+'%"></span></div>'+
    (text? renderReading(text) : '')+
    (text? '<h2 style="font-size:17px;margin:22px 0 12px">Întrebări</h2>' : '')+
    cur.items.map(function(e){
      return '<div style="margin-bottom:16px">'+renderExercise(e,{onContinue:false, showPassage:false})+'</div>';
    }).join("")+
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px;padding-top:16px;border-top:1px solid var(--line)">'+
      (answered < cur.items.length
        ? '<span style="font-size:13px;color:var(--text-3);align-self:center">'+(cur.items.length-answered)+' still unanswered — you can move on anyway.</span>'
        : '')+
      '<button class="btn" data-action="nextIlrPaper" style="margin-left:auto">'+
        (st.paper < papers.length-1 ? 'Finish Proba '+cur.meta.n+' → Proba '+(cur.meta.n+1) : 'Finish and see results')+'</button>'+
    '</div>';
  return shell(null, body, null);
};

/* ---------- AUTHOR MODE ----------
   Opens every unit regardless of progress, for reviewing or authoring content
   without working through the sequence first.

   There is deliberately no password. The course is a static file with no
   server, so any check would run in the learner's own browser against a value
   in the same file — defeated by viewing source. A login box that cannot
   actually refuse anyone is worse than none, because it invites putting
   something behind it. This is a preference, and it is labelled as one.
   Real authorisation needs a server, and can arrive with accounts. */
PAGES.admin = function(){
  var on = state.settings.unlockAll;
  /* Plain div, not .main-inner: shell() supplies that wrapper, and having
     both nested one inside the other applied its padding and max-width twice. */
  var main = '<div style="max-width:560px;padding-top:30px">'+
    '<div class="section-eyebrow">Author mode</div>'+
    '<h1 style="font-size:28px;margin-bottom:10px">Open every unit</h1>'+
    '<div class="card" style="padding:22px 24px;margin-bottom:16px">'+
      '<p style="font-size:14px;color:var(--text-2);line-height:1.6;margin-bottom:16px">'+
        'Unlocks every unit in every track, so you can open anything without completing what comes '+
        'before it. Intended for reviewing material or checking a lesson you have not reached yet. '+
        'Your scores, review queue and mistake notebook are unaffected \u2014 this only removes the locks.</p>'+
      '<label style="display:flex;align-items:flex-start;gap:10px;font-size:14px;cursor:pointer">'+
        '<input type="checkbox" data-action="toggleUnlockAll" '+(on?"checked":"")+' style="width:auto;margin-top:3px" />'+
        '<span><b>Unlock all course content</b><br>'+
        '<span style="font-size:12.5px;color:var(--text-3)">'+
          (on? 'Currently on. Every unit is open.' : 'Currently off. Units open as you complete the one before.')+
        '</span></span></label>'+
    '</div>'+
    '<div class="card" style="padding:18px 20px">'+
      '<b style="font-family:var(--font-display);font-size:15px">Why there is no password here</b>'+
      '<p style="font-size:13px;color:var(--text-2);line-height:1.6;margin-top:6px">'+
        'This course runs entirely in your browser with no server behind it. Any password check would happen '+
        'on the same machine as the thing it is checking, and anyone could read it in the page source or set '+
        'the flag from the developer console. A lock that cannot refuse anyone is worse than an honest switch, '+
        'because it tempts you into putting something private behind it. Nothing here is private \u2014 it is a '+
        'preference about how the course behaves.</p>'+
    '</div>'+
  '</div>';
  return shell(null, main, null);
};

PAGES.lesson = function(params){
  var l = lessonById(params[0]);
  if(!l) return notFound("That lesson doesn't exist.");
  /* The profanity lesson is opted into once, not gated every visit — a wall you
     have to click through repeatedly stops being a choice and becomes friction.
     The consent is stored, and can be withdrawn from Progress. */
  if(l.sensitive && !state.settings.showProfanity) return shell(null, profanityGate(l), null);
  var stageIdx = clamp(parseInt(params[1]||"0",10)||0, 0, l.sections.length-1);
  var s = l.sections[stageIdx];
  var p = lessonProgress(l.id);
  var u = unitById(l.unitId);

  var body = "";
  switch(s.type){
    case "context":
      body = (s.note? '<p style="color:var(--text-2);margin-bottom:14px;max-width:62ch">'+s.note+'</p>':'')+
             renderDialogue(dialogueById(s.dialogueId), {hideEn:true})+
             '<p style="color:var(--text-3);font-size:13px;margin-top:12px;max-width:62ch">Listen through once before revealing any English. Understanding the gist without the translation is the skill you are building.</p>';
      break;
    case "grammar":
      body = (s.intro? '<p style="color:var(--text-2);margin-bottom:14px;max-width:62ch">'+s.intro+'</p>':'')+
             renderGrammarArticle(grammarById(s.topicId));
      break;
    case "vocab":
      body = '<p style="color:var(--text-2);margin-bottom:16px;max-width:62ch">Tap the speaker on any word or example to hear it. These words enter your review queue as soon as you finish the lesson.</p>'+
             '<div class="grid-2">'+ s.vocabIds.map(function(id){
               var v = vocabById(id); return v? renderVocabCard(v):"";
             }).join("") +'</div>';
      break;
    case "contrast":
      body = renderContrast(s);
      break;
    case "culture":
      body = '<div class="card" style="padding:22px 24px;border-left:3px solid var(--pine)">'+
        '<div class="section-eyebrow" style="color:var(--pine)">Cultural note</div>'+
        '<h3 style="font-size:19px;margin-bottom:10px">'+escapeHtml(s.title)+'</h3>'+
        '<p style="color:var(--text-2);line-height:1.7">'+s.body+'</p></div>';
      break;
    default: {
      var ids = s.exerciseIds||[];
      body = ids.map(function(id,i){
        var ex = exerciseById(id);
        if(!ex) return "";
        return '<div style="margin-bottom:18px">'+renderExercise(ex,{counter:(i+1)+" / "+ids.length, onContinue:false})+'</div>';
      }).join("");
      if(s.type==="reading" && s.readingId) body = renderReading(readingById(s.readingId));
      break;
    }
  }
  if(s.type==="reading" && s.readingId && !s.exerciseIds) body = renderReading(readingById(s.readingId));

  var allAnswered = (s.exerciseIds||[]).every(function(id){ return session.feedback[id]; });
  var isLast = stageIdx===l.sections.length-1;

  var main =
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'+
      '<button class="btn ghost sm" data-action="go" data-page="unit" data-p1="'+u.id+'">← '+escapeHtml(u.titleEn)+'</button>'+
      '<span style="font-size:12px;color:var(--text-3)" class="tabular">Stage '+(stageIdx+1)+' of '+l.sections.length+'</span>'+
    '</div>'+
    '<div class="progressbar" style="margin-bottom:20px"><span style="width:'+Math.round(100*(stageIdx)/(l.sections.length-1||1))+'%"></span></div>'+
    '<div class="section-eyebrow">'+(STAGE_LABEL[s.type]||s.type)+'</div>'+
    '<h1 style="font-size:26px;margin-bottom:16px">'+escapeHtml(l.title)+'</h1>'+
    body+
    '<div style="display:flex;gap:10px;margin-top:26px;padding-top:18px;border-top:1px solid var(--line)">'+
      (stageIdx>0? '<button class="btn secondary" data-action="go" data-page="lesson" data-p1="'+l.id+'" data-p2="'+(stageIdx-1)+'">Previous</button>':'')+
      (isLast
        ? '<button class="btn" data-action="finishLesson" data-lesson="'+l.id+'">Finish lesson</button>'
        : '<button class="btn" data-action="go" data-page="lesson" data-p1="'+l.id+'" data-p2="'+(stageIdx+1)+'"'+
          ((s.exerciseIds&&s.exerciseIds.length&&!allAnswered)?' disabled title="Answer the exercises above first"':'')+'>Continue</button>')+
    '</div>';

  var railStages = '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin-bottom:10px">Lesson stages</div>'+
    l.sections.map(function(sec,i){
      var active = i===stageIdx;
      return '<div style="display:flex;gap:8px;align-items:center;padding:6px 8px;border-radius:6px;cursor:pointer;'+(active?'background:var(--accent-soft)':'')+'" data-action="go" data-page="lesson" data-p1="'+l.id+'" data-p2="'+i+'" role="button" tabindex="0">'+
        '<span style="width:18px;height:18px;border-radius:50%;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;'+
        (i<stageIdx?'background:var(--pine);color:#fff':active?'background:var(--accent);color:#fff':'border:1.5px solid var(--line-strong);color:var(--text-3)')+'">'+(i<stageIdx?'✓':i+1)+'</span>'+
        '<span style="font-size:13px;'+(active?'font-weight:700':'color:var(--text-2)')+'">'+(STAGE_LABEL[sec.type]||sec.type)+'</span></div>';
    }).join("")+
    '<hr class="rule" style="margin:16px 0">'+
    '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin-bottom:8px">Objective</div>'+
    '<p style="font-size:13px;color:var(--text-2);line-height:1.55">'+escapeHtml(l.objective)+'</p>'+
    (p.status==="complete"? '<div style="margin-top:14px"><span class="badge pine">'+iconCheck()+' completed · '+p.bestScore+'%</span></div>':'');

  return shell(courseMapSidebar(u.id), main, railStages);
};

/* ---------- GRAMMAR REFERENCE ---------- */

PAGES.grammar = function(params){
  var q = session.grammarQuery||"";
  var lvl = session.grammarLevel||"all";
  var cat = session.grammarCat||"all";
  var focus = params[0] ? grammarById(params[0]) : null;

  var cats = [];
  GRAMMAR_TOPICS.forEach(function(g){ if(cats.indexOf(g.cat)===-1) cats.push(g.cat); });
  var levels = [];
  GRAMMAR_TOPICS.forEach(function(g){ if(levels.indexOf(g.level)===-1) levels.push(g.level); });
  levels.sort();

  function matches(g){
    if(lvl!=="all" && g.level!==lvl) return false;
    if(cat!=="all" && g.cat!==cat) return false;
    if(q){
      var hay = normLoose(g.title+" "+g.cat+" "+g.rule+" "+(g.formation||[]).join(" "));
      if(hay.indexOf(normLoose(q))===-1) return false;
    }
    return true;
  }
  var list = GRAMMAR_TOPICS.filter(matches);

  /* Sidebar mirrors the active filters, so the two views never disagree. */
  var side = '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin:0 8px 10px">'+
      'Topics'+((lvl!=="all"||cat!=="all")? ' · filtered':'')+'</div>'+
    cats.filter(function(c){ return list.some(function(g){ return g.cat===c; }); }).map(function(c){
      return '<div style="margin-bottom:14px"><div style="font-size:12px;font-weight:700;color:var(--text-2);margin:0 8px 5px">'+escapeHtml(c)+'</div>'+
        list.filter(function(g){return g.cat===c;}).map(function(g){
          var n = grammarExerciseCount(g.id);
          return '<div class="unit-node'+(focus&&focus.id===g.id?" current":"")+'" style="padding:7px 8px" data-action="go" data-page="grammar" data-p1="'+g.id+'" role="button" tabindex="0">'+
            '<div><div style="font-size:13.3px;font-weight:600">'+escapeHtml(g.title)+'</div>'+
            '<div style="font-size:11px;color:var(--text-3)">'+g.level+' · '+n+' exercise'+(n===1?"":"s")+'</div></div></div>';
        }).join("")+'</div>';
    }).join("") || '<div style="padding:8px;font-size:13px;color:var(--text-3)">Nothing matches these filters.</div>';

  var filterBar =
    '<div style="margin-bottom:8px"><span style="font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin-right:8px">Level</span>'+
      ['all'].concat(levels).map(function(L){
        return '<button class="chip'+(lvl===L?" active":"")+'" style="margin:0 4px 4px 0" data-action="setGrammarLevel" data-v="'+L+'">'+
          (L==="all"?"All":L)+'</button>';
      }).join("")+
    '</div>'+
    '<div style="margin-bottom:16px"><span style="font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin-right:8px">Topic</span>'+
      ['all'].concat(cats).map(function(C){
        return '<button class="chip'+(cat===C?" active":"")+'" style="margin:0 4px 4px 0" data-action="setGrammarCat" data-v="'+escapeHtml(C)+'">'+
          (C==="all"?"All":escapeHtml(C))+'</button>';
      }).join("")+
    '</div>';

  var main = focus
    ? '<button class="btn ghost sm" data-action="go" data-page="grammar" style="margin-bottom:12px">← All grammar</button>'+renderGrammarArticle(focus)+
      '<div style="margin-top:16px">'+practiceLinkFor(focus.id)+'</div>'
    : '<h1 style="font-size:28px;margin-bottom:6px">Grammar reference</h1>'+
      '<p style="color:var(--text-2);margin-bottom:16px;max-width:60ch">Every rule with its formation, worked examples, and the mistakes English speakers actually make. Filter by level or topic, or search across all of them.</p>'+
      '<input type="search" data-field="gq" data-action="grammarSearch" placeholder="Search rules, e.g. \'plural\', \'perfectul compus\', \'pe\'…" value="'+escapeHtml(q)+'" style="margin-bottom:14px" aria-label="Search grammar" />'+
      filterBar+
      grammarDrillBar(list)+
      '<div style="font-size:12.5px;color:var(--text-3);margin-bottom:12px" class="tabular">'+list.length+' of '+GRAMMAR_TOPICS.length+' rules'+
        ((lvl!=="all"||cat!=="all"||q)? ' · <button class="btn ghost sm" style="padding:0 4px" data-action="clearGrammarFilters">clear filters</button>':'')+'</div>'+
      (list.length? list.map(function(g){
        var n = grammarExerciseCount(g.id);
        return '<div class="card" style="padding:16px 18px;margin-bottom:10px;cursor:pointer" data-action="go" data-page="grammar" data-p1="'+g.id+'" role="button" tabindex="0">'+
          '<div style="display:flex;gap:8px;align-items:center;margin-bottom:5px;flex-wrap:wrap"><span class="badge accent">'+g.level+'</span><span class="badge neutral">'+escapeHtml(g.cat)+'</span>'+
            '<span class="badge '+(n>=3?"pine":n>0?"neutral":"brick")+'">'+n+' exercise'+(n===1?"":"s")+'</span></div>'+
          '<b style="font-family:var(--font-display);font-size:16.5px">'+escapeHtml(g.title)+'</b>'+
          '<p style="font-size:13.5px;color:var(--text-2);margin-top:4px;max-width:66ch">'+escapeHtml(g.rule.slice(0,150))+(g.rule.length>150?"…":"")+'</p></div>';
      }).join("") : '<div class="empty-state">No rule matches these filters.</div>');

  return shell(side, main, null);
};

/* ---------- VOCABULARY ---------- */
PAGES.vocabulary = function(){
  var q = session.vocabQuery||"", f = session.vocabFilter||"all";
  var list = VOCAB.filter(function(v){
    if(q){
      var hay = normLoose(v.ro+" "+v.en+" "+(v.tags||[]).join(" "));
      if(hay.indexOf(normLoose(q))===-1) return false;
    }
    if(f==="all") return true;
    if(["noun","verb","adj","adv","phrase"].indexOf(f)>-1) return v.pos===f;
    var st = state.vocabSrs[v.id];
    if(f==="learning") return st && (st.status==="Learning"||st.status==="New");
    if(f==="weak") return st && st.seen>1 && pct(st.correct,st.seen)<60;
    if(f==="mastered") return st && st.status==="Mastered";
    return v.level===f;
  });
  var filters = [["all","All"],["noun","Nouns"],["verb","Verbs"],["adj","Adjectives"],["phrase","Phrases"],
                 ["a1_1","A1.1"],["a2_1","A2.1"],["b1_1","B1.1"],["learning","Learning"],["weak","Weak"],["mastered","Mastered"]];
  var main = '<h1 style="font-size:28px;margin-bottom:6px">Vocabulary</h1>'+
    '<p style="color:var(--text-2);margin-bottom:16px;max-width:60ch">'+VOCAB.length+' entries. Nouns show gender, plural and definite form; verbs link to the conjugator. Your review status appears on each card once you\'ve met the word.</p>'+
    '<input type="search" data-field="vq" data-action="vocabSearch" placeholder="Search Romanian or English…" value="'+escapeHtml(q)+'" style="margin-bottom:12px" aria-label="Search vocabulary" />'+
    '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px">'+
      filters.map(function(x){ return '<button class="chip'+(f===x[0]?" active":"")+'" data-action="setVocabFilter" data-f="'+x[0]+'">'+x[1]+'</button>'; }).join("")+
    '</div>'+
    '<div style="font-size:12.5px;color:var(--text-3);margin-bottom:12px" class="tabular">'+list.length+' result'+(list.length===1?"":"s")+'</div>'+
    (list.length? '<div class="grid-2">'+list.map(renderVocabCard).join("")+'</div>' : '<div class="empty-state">Nothing matches that filter.</div>');
  return shell(null, main, null, true);
};

/* ---------- VERB TOOL ---------- */


PAGES.verbs = function(params){
  var v = params[0]? verbById(params[0]) : null;
  var list = filteredVerbs();
  var side = '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin:0 8px 10px">'+
      'Verbs · '+list.length+'</div>'+
    list.map(function(x){
      return '<div class="unit-node'+(v&&v.id===x.id?" current":"")+'" style="padding:8px" data-action="go" data-page="verbs" data-p1="'+x.id+'" role="button" tabindex="0">'+
        '<div><div style="font-family:var(--font-display);font-size:15px;font-weight:600">'+escapeHtml(x.inf)+'</div>'+
        '<div style="font-size:11.5px;color:var(--text-3)">'+escapeHtml(x.en)+(verbIsIrregular(x)?' · irregular':'')+'</div></div></div>';
    }).join("");
  if(!v){
    var groups = [["all","All"],["I","I · -a"],["I-ez","I · -ez-"],["II","II · -ea"],["III","III · -e"],
                  ["IV","IV · -i"],["IV-esc","IV · -esc-"],["irregular","Irregular"],["reflexive","Reflexive"],["marked","Marked ★"]];
    return shell(side, '<h1 style="font-size:28px;margin-bottom:6px">Verb reference</h1>'+
      '<p style="color:var(--text-2);max-width:62ch;margin-bottom:14px">'+VERBS.length+' verbs, each with six tenses plus imperative and participle, audio on every form, and a note on what is irregular. Grouped by conjugation class — the class tells you the endings, so learning one member teaches you the pattern for the rest.</p>'+
      '<input type="search" data-field="vbq" data-action="verbSearch" placeholder="Search a verb or its meaning…" value="'+escapeHtml(session.verbQuery||"")+'" style="margin-bottom:12px" aria-label="Search verbs" />'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">'+
        groups.map(function(g){
          var n = g[0]==="all" ? VERBS.length : VERBS.filter(function(x){
            if(g[0]==="irregular") return verbIsIrregular(x);
            if(g[0]==="reflexive") return verbIsReflexive(x);
            if(g[0]==="marked") return state.verbsMarked.indexOf(x.id)>-1;
            return verbGroupKey(x)===g[0];
          }).length;
          return '<button class="chip'+((session.verbGroup||"all")===g[0]?" active":"")+'" data-action="setVerbGroup" data-g="'+g[0]+'">'+
            g[1]+'<span style="opacity:.6;margin-left:5px">'+n+'</span></button>';
        }).join("")+
      '</div>'+
      '<div class="card" style="padding:14px 16px;margin-bottom:16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">'+
        '<div style="flex:1;min-width:200px"><b style="font-size:14.5px">Conjugation drill</b>'+
        '<div style="font-size:12.5px;color:var(--text-2)">Practice a chosen tense across many verbs, instead of only ever meeting the present.</div></div>'+
        '<button class="btn" data-action="go" data-page="drill">Open drills</button>'+
      '</div>'+
      '<div style="font-size:12.5px;color:var(--text-3);margin-bottom:10px" class="tabular">'+list.length+' shown</div>'+
      '<div class="grid-2">'+list.map(function(x){
        var marked = state.verbsMarked.indexOf(x.id)>-1;
        return '<div class="card" style="padding:16px 18px">'+
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">'+
          '<div><div style="font-family:var(--font-display);font-size:19px;font-weight:700">'+escapeHtml(x.inf)+audioButton(x.inf,{small:true,label:false})+'</div>'+
          '<div style="font-size:13px;color:var(--text-2)">'+escapeHtml(x.en)+'</div>'+
          '<div style="font-size:11.5px;color:var(--text-3);margin-top:4px">'+escapeHtml(verbGroupLabel(x))+
            (verbIsIrregular(x)?' · irregular':'')+(verbIsReflexive(x)?' · reflexive':'')+'</div></div>'+
          (marked?'<span class="badge accent">★</span>':'')+'</div>'+
          '<button class="btn secondary sm" style="margin-top:12px" data-action="go" data-page="verbs" data-p1="'+x.id+'">Conjugate</button></div>';
      }).join("")+'</div>', null, true);
  }
  var TENSES = [["present","Prezent"],["past","Perfect compus"],["imperfect","Imperfect"],["future","Viitor"],["conditional","Condițional"],["subjunctive","Conjunctiv"]];
  var PERSON_ROWS = [["eu","eu"],["tu","tu"],["el","el / ea"],["noi","noi"],["voi","voi"],["ei","ei / ele"]];
  var marked = state.verbsMarked.indexOf(v.id)>-1;
  var T = verbTables(v);
  var isRefl = verbIsReflexive(v);
  var main = '<button class="btn ghost sm" data-action="go" data-page="verbs" style="margin-bottom:12px">← All verbs</button>'+
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:6px">'+
      '<div><h1 style="font-size:30px;margin-bottom:2px">'+escapeHtml(v.inf)+' '+audioButton(v.inf,{small:true,label:false})+'</h1>'+
      '<p style="color:var(--text-2);font-size:15px">'+escapeHtml(v.en)+'</p></div>'+
      '<button class="btn '+(marked?'':'secondary')+' sm" data-action="toggleVerbMark" data-verb="'+v.id+'">'+(marked?'✓ Marked for review':'Mark for review')+'</button>'+
    '</div>'+
    '<div style="display:flex;gap:6px;margin:10px 0 18px;flex-wrap:wrap">'+
      '<span class="badge '+(verbIsIrregular(v)?'brick':'pine')+'">'+(verbIsIrregular(v)?'irregular':'regular')+'</span>'+
      '<span class="badge neutral">'+escapeHtml(verbGroupLabel(v))+'</span>'+
      (isRefl? '<span class="badge accent">reflexive</span>':'')+
      '<span class="badge neutral">participle: '+escapeHtml(T.participle)+'</span></div>'+
    (isRefl? '<div class="card" style="padding:14px 16px;margin-bottom:14px;border-left:3px solid var(--accent)">'+
      '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--accent-strong);margin-bottom:8px">Reflexive pronouns</div>'+
      '<p style="font-size:13.5px;color:var(--text-2);line-height:1.6">The pronoun is part of this verb and moves with the tense. In the present and imperfect it sits before the verb (<b>mă, te, se, ne, vă, se</b>); in the past it contracts with the auxiliary (<b>m-am, te-ai, s-a, ne-am, v-ați, s-au</b>); and in the affirmative imperative it jumps to the end and hyphenates'+
      (T.imperative.tu? ' (<b>'+escapeHtml(T.imperative.tu)+'</b>)' : '')+
      '. Every form below already includes it.</p></div>':'')+
    (v.notes? '<div class="card" style="padding:14px 16px;margin-bottom:18px;border-left:3px solid var(--accent)"><p style="font-size:13.8px;color:var(--text-2);line-height:1.6">'+escapeHtml(v.notes)+'</p></div>':'')+
    '<div class="grid-2">'+ TENSES.map(function(t){
      if(!T[t[0]]) return "";
      return '<div class="card" style="padding:14px 16px">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
          '<span style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--accent-strong)">'+t[1]+'</span>'+
          '<button class="btn ghost sm" style="padding:1px 6px;font-size:11px" data-action="drillThisTense" data-tense="'+t[0]+'">drill</button>'+
        '</div>'+
        '<table class="conj-table">'+PERSON_ROWS.map(function(p){
          var form = T[t[0]][p[0]];
          return '<tr><th style="width:66px">'+p[1]+'</th><td class="ro">'+escapeHtml(form)+'</td>'+
            '<td style="width:34px;text-align:right">'+audioButton(form,{small:true,label:false})+'</td></tr>';
        }).join("")+'</table></div>';
    }).join("") +'</div>'+
    '<div class="card" style="padding:14px 16px;margin-top:14px">'+
      '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--accent-strong);margin-bottom:8px">Imperativ</div>'+
      '<table class="conj-table"><tr><th style="width:66px">tu</th>'+
        (T.imperative.tu
          ? '<td class="ro">'+escapeHtml(T.imperative.tu)+'</td>'+
            '<td style="width:34px;text-align:right">'+audioButton(T.imperative.tu,{small:true,label:false})+'</td>'
          : '<td class="ro" style="color:var(--text-3);font-style:italic">not used</td><td></td>')+
      '</tr>'+
      '<tr><th>voi</th><td class="ro">'+escapeHtml(T.imperative.voi)+'</td>'+
        '<td style="text-align:right">'+audioButton(T.imperative.voi,{small:true,label:false})+'</td></tr>'+
      '<tr><th>negative</th><td class="ro" style="color:var(--text-2)">nu '+escapeHtml(verbParts(v.inf).bare)+'!</td><td></td></tr>'+
      '</table></div>'+
    (v.example? '<div class="card" style="padding:16px 18px;margin-top:14px">'+
      '<div style="font-family:var(--font-display);font-size:17px">'+escapeHtml(v.example.ro)+' '+audioButton(v.example.ro,{small:true,label:false})+'</div>'+
      '<div style="font-size:13px;color:var(--text-3);margin-top:4px">'+escapeHtml(v.example.en)+'</div></div>':'');
  return shell(side, main, null, true);
};

PAGES.drill = function(){
  if(session.queue && session.queueKind==="drill"){
    return shell(null, runSession("Conjugation drill","Type the form asked for.", session.queue, {}), null);
  }
  var cfg = session.drillCfg || (session.drillCfg = {tenses:["present"], scope:"all", length:15});
  var scopes = [["all","All verbs"],["irregular","Irregular only"],["reflexive","Reflexive only"],
                ["I","Class I -a"],["I-ez","Class I -ez-"],["II","Class II -ea"],["III","Class III -e"],
                ["IV","Class IV -i"],["IV-esc","Class IV -esc-"],["marked","Marked ★"]];
  var pool = drillPool(cfg);
  var main = '<h1 style="font-size:28px;margin-bottom:6px">Conjugation drills</h1>'+
    '<p style="color:var(--text-2);margin-bottom:20px;max-width:62ch">Pick the tenses you want to work on and drill them across the whole verb list. Questions are generated fresh each time, so nothing can be memorized by position.</p>'+
    '<div class="card" style="padding:20px 22px;margin-bottom:16px">'+
      '<label class="field-label">Tenses — choose one or more</label>'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px">'+
        TENSE_META.map(function(t){
          var on = cfg.tenses.indexOf(t.id)>-1;
          return '<button class="chip'+(on?" active":"")+'" data-action="toggleDrillTense" data-t="'+t.id+'">'+
            t.ro+'<span style="opacity:.6;margin-left:5px">'+t.en+'</span></button>';
        }).join("")+
      '</div>'+
      '<label class="field-label">Which verbs</label>'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px">'+
        scopes.map(function(s){
          return '<button class="chip'+(cfg.scope===s[0]?" active":"")+'" data-action="setDrillScope" data-s="'+s[0]+'">'+s[1]+'</button>';
        }).join("")+
      '</div>'+
      '<label class="field-label">Length</label>'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px">'+
        [10,15,25,40].map(function(n){
          return '<button class="chip'+(cfg.length===n?" active":"")+'" data-action="setDrillLength" data-n="'+n+'">'+n+' questions</button>';
        }).join("")+
      '</div>'+
      '<div style="font-size:13px;color:var(--text-3);margin-bottom:14px">'+
        pool.length+' verb'+(pool.length===1?"":"s")+' in scope · '+
        (cfg.tenses.length||1)+' tense'+((cfg.tenses.length||1)===1?"":"s")+' selected'+
        (cfg.tenses.length===0? ' — pick at least one tense':'')+'</div>'+
      '<button class="btn" data-action="startDrill"'+((pool.length && cfg.tenses.length)?'':' disabled')+'>Start drill</button>'+
    '</div>'+
    '<div class="card" style="padding:18px 20px">'+
      '<b style="font-family:var(--font-display);font-size:16px">Why drill by tense</b>'+
      '<p style="font-size:13.5px;color:var(--text-2);margin-top:6px;line-height:1.6">Lessons introduce a tense and then move on, so the present ends up massively over-practiced and the imperfect and conditional barely at all. Drilling one tense across many verbs is how the pattern becomes automatic — and mixing two tenses together is what stops you applying the right ending to the wrong tense.</p>'+
    '</div>';
  return shell(null, main, null);
};

/* ---------- REVIEW ---------- */
PAGES.review = function(){
  if(session.queue && session.queueKind==="review"){
    return shell(null, runSession("Review session","Mixed items drawn from everything you've studied.", session.queue, {}), null);
  }
  var due = dueVocabIds(), weak = weakVocabIds(10), mistakes = state.mistakes.length;
  var card = function(title,desc,count,attrs,label){
    return '<div class="card" style="padding:18px 20px;margin-bottom:12px;display:flex;gap:16px;align-items:center">'+
      '<div style="flex:1"><b style="font-family:var(--font-display);font-size:17px">'+title+'</b>'+
      '<p style="font-size:13.5px;color:var(--text-2);margin-top:3px;max-width:52ch">'+desc+'</p></div>'+
      '<div style="text-align:right"><div class="tabular" style="font-size:22px;font-weight:700">'+count+'</div>'+
      '<button class="btn '+(count?'':'secondary')+' sm" style="margin-top:6px" '+(count?attrs:'disabled')+'>'+(label||"Start")+'</button></div></div>';
  };
  var main = '<h1 style="font-size:28px;margin-bottom:6px">Review</h1>'+
    '<p style="color:var(--text-2);margin-bottom:20px;max-width:60ch">Spaced repetition schedules each word by how well you know it: items you get wrong come back sooner, items you know well drift further out. Missing a day never resets anything.</p>'+
    card("Due today","Words whose review interval has elapsed. This is the queue that keeps vocabulary from fading.",due.length,'data-action="startReviewDue"')+
    card("Weak vocabulary","The words you get wrong most often, regardless of schedule.",weak.length,'data-action="startReviewWeak"')+
    card("Weak grammar","Exercises targeting the rules with your lowest accuracy.",weakGrammarTopics(5).length,'data-action="startReviewGrammar"')+
    card("Mistake notebook","Every meaningful mistake you've made, with the explanation that went with it.",mistakes,'data-action="go" data-page="mistakes"',"Open")+
    '<hr class="rule" style="margin:22px 0">'+
    '<h2 style="font-size:18px;margin-bottom:10px">Your vocabulary by strength</h2>'+
    '<div class="grid-3">'+SRS_LEVELS.map(function(lvl){
      var n = Object.keys(state.vocabSrs).filter(function(id){ return state.vocabSrs[id].status===lvl; }).length;
      return '<div class="stat-tile"><div class="num">'+n+'</div><div class="lbl"><span class="mastery-tag '+lvl+'">'+lvl+'</span></div></div>';
    }).join("")+'</div>';
  return shell(null, main, null, true);
};

/* ---------- MISTAKE NOTEBOOK ---------- */
PAGES.mistakes = function(){
  var main = '<h1 style="font-size:28px;margin-bottom:6px">Mistake notebook</h1>'+
    '<p style="color:var(--text-2);margin-bottom:20px;max-width:60ch">Saved automatically whenever you get something wrong — never when you get it right. Each entry keeps what you wrote, what was correct, and why.</p>'+
    (state.mistakes.length? state.mistakes.map(function(m){
      return '<div class="card" style="padding:16px 18px;margin-bottom:10px">'+
        '<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">'+
          '<span class="badge brick">'+escapeHtml(m.skill||"grammar")+'</span>'+
          (m.topicTitle? '<span class="badge neutral">'+escapeHtml(m.topicTitle)+'</span>':'')+
          '<span style="font-size:11.5px;color:var(--text-3);margin-left:auto" class="tabular">'+escapeHtml(m.date)+'</span></div>'+
        '<div style="font-size:13px;color:var(--text-3);margin-bottom:6px">'+escapeHtml(m.promptText||"")+'</div>'+
        '<div style="font-family:var(--font-display);font-size:15.5px;color:var(--brick);text-decoration:line-through">'+escapeHtml(m.yourAnswer||"(blank)")+'</div>'+
        '<div style="font-family:var(--font-display);font-size:15.5px;margin:3px 0 8px">'+escapeHtml(m.correctAnswer)+' '+audioButton(m.correctAnswer,{small:true,label:false})+'</div>'+
        '<div style="font-size:13.3px;color:var(--text-2);line-height:1.55">'+m.explanation+'</div>'+
        /* Only offer a replay for exercises that still exist. Generated ones
           (dictation drills, order-the-lines, review cards) are built per
           session and cannot be reopened later — a button that silently does
           nothing is worse than no button. */
        (exerciseById(m.exerciseId)
          ? '<button class="btn secondary sm" style="margin-top:10px" data-action="practiceMistake" data-ex="'+escapeHtml(m.exerciseId)+'">Practice this again</button>'
          : '<div style="margin-top:10px;font-size:12px;color:var(--text-3)">Generated in a listening session — replay it from the Listening page.</div>')+
      '</div>';
    }).join("") : '<div class="empty-state">No mistakes recorded yet. They\'ll collect here as you work.</div>');
  return shell(null, main, null);
};

/* ---------- PRACTICE GENERATOR ---------- */
PAGES.practice = function(){
  if(session.queue && session.queueKind==="practice"){
    return shell(null, runSession("Practice session","Generated from your settings.", session.queue, {}), null);
  }
  var cfg = session.practiceCfg || (session.practiceCfg = {level:"all", skill:"all", length:10});
  var opt = function(group,val,label){
    return '<button class="chip'+(cfg[group]===val?" active":"")+'" data-action="setPractice" data-group="'+group+'" data-val="'+val+'">'+label+'</button>';
  };
  var pool = practicePool(cfg);
  var main = '<h1 style="font-size:28px;margin-bottom:6px">Practice</h1>'+
    '<p style="color:var(--text-2);margin-bottom:22px;max-width:60ch">Build a session from anything you\'ve unlocked. Items are drawn at random and interleaved, so you can\'t coast on the order you first saw them in.</p>'+
    '<div class="card" style="padding:20px 22px;margin-bottom:16px">'+
      '<label class="field-label">Level</label><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">'+
        opt("level","all","Any")+opt("level","a1_1","A1")+opt("level","a2_1","A2")+opt("level","b1_1","B1")+
        opt("level","civic","Citizenship")+opt("level","register","Real speech")+'</div>'+
      '<label class="field-label">Skill</label><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">'+
        opt("skill","all","Mixed")+opt("skill","vocabulary","Vocabulary")+opt("skill","grammar","Grammar")+
        opt("skill","listening","Listening")+opt("skill","reading","Reading")+opt("skill","writing","Writing")+'</div>'+
      '<label class="field-label">Length</label><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px">'+
        [5,10,20,30].map(function(n){ return '<button class="chip'+(cfg.length===n?" active":"")+'" data-action="setPractice" data-group="length" data-val="'+n+'">'+n+' questions</button>'; }).join("")+'</div>'+
      '<div style="font-size:13px;color:var(--text-3);margin-bottom:14px">'+pool.length+' matching exercise'+(pool.length===1?"":"s")+' available'+
        (pool.length && pool.length<cfg.length? ' — the session will repeat some to reach '+cfg.length+'.':'')+'</div>'+
      '<button class="btn" data-action="startPractice"'+(pool.length?'':' disabled')+'>Start practice session</button>'+
    '</div>'+
    '<h2 style="font-size:18px;margin:24px 0 10px">Focused modes</h2>'+
    '<div class="grid-2">'+
      '<div class="card" style="padding:18px 20px">'+
        '<b style="font-family:var(--font-display);font-size:16.5px">Reading</b>'+
        '<p style="font-size:13.5px;color:var(--text-2);margin:4px 0 12px">'+READING_TEXTS.length+' texts from short messages to B1 articles. Click any word to gloss it.</p>'+
        '<button class="btn secondary sm" data-action="go" data-page="reading">Open reading</button></div>'+
      '<div class="card" style="padding:18px 20px">'+
        '<b style="font-family:var(--font-display);font-size:16.5px">Writing</b>'+
        '<p style="font-size:13.5px;color:var(--text-2);margin:4px 0 12px">'+EXERCISES.filter(function(e){return e.type==="produce";}).length+' production tasks with categorised feedback and model answers.</p>'+
        '<button class="btn secondary sm" data-action="go" data-page="writing">Open writing</button></div>'+
    '</div>';
  return shell(null, main, null);
};

/* ---------- LISTENING ---------- */
PAGES.listening = function(){
  if(session.queue && session.queueKind==="listening"){
    return shell(null, runSession("Listening session","Transcripts stay hidden until you answer.", session.queue, {}), null);
  }
  var speeds=[0.65,0.8,1,1.2];
  var items = openExercises().filter(function(e){ return e.skill==="listening"; });
  var main = '<h1 style="font-size:28px;margin-bottom:6px">Listening</h1>'+
    '<p style="color:var(--text-2);margin-bottom:18px;max-width:60ch">Every Romanian word, phrase and dialogue line in the course has its own pronunciation clip. Set the speed before you play — start slow and work up to conversational pace.</p>'+
    shadowPanel()+
    '<div class="card" style="padding:18px 20px;margin-bottom:18px">'+
      '<label class="field-label">Playback speed</label>'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap">'+speeds.map(function(s){
        var lbl = {0.65:"Beginner slow",0.8:"Slow",1:"Normal",1.2:"Conversational"}[s];
        return '<button class="chip'+(state.settings.audioSpeed===s?" active":"")+'" data-action="setSpeed" data-speed="'+s+'">'+s+'× · '+lbl+'</button>';
      }).join("")+'</div>'+
      audioSourcePanel()+
    '</div>'+
    '<div class="card" style="padding:18px 20px;margin-bottom:18px">'+
      '<b style="font-family:var(--font-display);font-size:17px">Dictation &amp; comprehension</b>'+
      '<p style="font-size:13.5px;color:var(--text-2);margin:4px 0 12px">'+items.length+' listening exercises drawn from across the course. Transcripts appear only after you answer.</p>'+
      '<button class="btn" data-action="startListening"'+(items.length?'':' disabled')+'>Start listening set</button></div>'+
    '<h2 style="font-size:18px;margin:22px 0 4px">Dialogues</h2>'+
    '<p style="font-size:13px;color:var(--text-3);margin-bottom:12px;max-width:60ch">Play a dialogue through before opening the transcript — the point is to hear it first. Once open, each line has its own play button, and the English stays hidden until you ask for it line by line.</p>'+
    DIALOGUES.map(function(d){
      var open = session.openDialogue === d.id;
      var lvl = (levelById(d.level)||{code:""}).code;
      return '<div class="card" style="padding:0;margin-bottom:9px;overflow:hidden">'+
        '<div style="padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">'+
          '<div style="flex:1;min-width:180px">'+
            '<b style="font-family:var(--font-display);font-size:15.5px">'+escapeHtml(d.title)+'</b>'+
            '<div style="font-size:12.5px;color:var(--text-3)">'+escapeHtml(d.titleEn)+' · '+d.lines.length+' lines · '+lvl+'</div>'+
          '</div>'+
          '<div style="display:flex;gap:8px;align-items:center">'+
            audioButton(d.lines.map(function(l){return l.ro;}),{label:"Play all"})+
            '<button class="chip'+(open?" active":"")+'" data-action="toggleDialogue" data-id="'+d.id+'" '+
              'aria-expanded="'+(open?"true":"false")+'">'+(open?"Hide transcript":"Transcript")+'</button>'+
          '</div>'+
        '</div>'+
        /* Four ways to work the same dialogue, ordered easiest → hardest. */
        '<div style="padding:0 16px 14px;display:flex;gap:6px;flex-wrap:wrap;align-items:center">'+
          '<span style="font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin-right:2px">Practice</span>'+
          '<button class="chip" data-action="startShadow" data-id="'+d.id+'" title="Hear a line, then repeat it aloud in the gap">Shadow</button>'+
          '<button class="chip" data-action="startOrderLines" data-id="'+d.id+'" title="Rebuild the conversation in the right order">Order the lines</button>'+
          '<button class="chip" data-action="startDialogueDictation" data-id="'+d.id+'" title="Type each line as you hear it">Dictation</button>'+
          (gapfillEligible(d.level)
            ? '<button class="chip" data-action="startGapfill" data-id="'+d.id+'" title="Fill the missing words while listening">Gap-fill</button>'
            : '<span class="chip" style="opacity:.45;cursor:default" title="Gap-fill unlocks at A2, once you have enough vocabulary for the blanks to test listening rather than guessing">Gap-fill · A2+</span>')+
        '</div>'+
        (open
          ? '<div class="fade-in" style="padding:0 16px 16px;border-top:1px solid var(--line)">'+
              '<div style="margin-top:14px">'+
              d.lines.map(function(l,i){
                var shown = session.revealed["lst_"+d.id+"_"+i];
                return '<div class="dialogue-line">'+
                  '<div class="speaker">'+escapeHtml(l.speaker)+'</div>'+
                  '<div class="bubble">'+
                    '<div style="display:flex;gap:8px;align-items:flex-start">'+
                      '<div class="ro-text" style="flex:1">'+escapeHtml(l.ro)+'</div>'+
                      audioButton(l.ro,{small:true,label:false})+
                    '</div>'+
                    (shown
                      ? '<div class="en-text">'+escapeHtml(l.en)+'</div>'
                      : '<button class="btn ghost sm" style="padding:2px 0;margin-top:3px" data-action="revealLine" data-key="lst_'+d.id+'_'+i+'">show English</button>')+
                  '</div></div>';
              }).join("")+
              '</div>'+
              '<button class="btn secondary sm" data-action="revealAllLines" data-id="'+d.id+'" data-n="'+d.lines.length+'">Show all English</button>'+
            '</div>'
          : '')+
      '</div>';
    }).join("")+

    '<h2 style="font-size:18px;margin:26px 0 4px">Longer listening</h2>'+
    '<p style="font-size:13px;color:var(--text-3);margin-bottom:12px;max-width:60ch">Reading passages played end to end, sentence by sentence. Useful for training your ear on connected speech rather than single lines.</p>'+
    READING_TEXTS.map(function(r){
      return '<div class="card" style="padding:14px 16px;margin-bottom:9px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">'+
        '<div style="flex:1;min-width:180px"><b style="font-family:var(--font-display);font-size:15.5px">'+escapeHtml(r.title)+'</b>'+
        '<div style="font-size:12.5px;color:var(--text-3)">'+escapeHtml(r.format)+' · '+r.wordCount+' words · '+(levelById(r.level)||{code:""}).code+'</div></div>'+
        '<div style="display:flex;gap:8px;align-items:center">'+
          audioButton(sentencesOf(r.ro),{label:"Play"})+
          '<button class="chip" data-action="go" data-page="reading" data-p1="'+r.id+'">Open text</button>'+
        '</div></div>';
    }).join("");
  return shell(null, main, null);
};

/* ---------- PROGRESS ---------- */
PAGES.progress = function(){
  var lv = levelById(overallCourseLevelId());
  var weak = weakGrammarTopics(5);
  var main = '<h1 style="font-size:28px;margin-bottom:4px">My Romanian</h1>'+
    '<p style="color:var(--text-2);margin-bottom:22px">Currently working at <b>'+lv.code+' · '+escapeHtml(lv.name)+'</b></p>'+
    '<div class="grid-3" style="margin-bottom:18px">'+
      '<div class="stat-tile"><div class="num">'+overallMastery()+'%</div><div class="lbl">Overall accuracy</div></div>'+
      '<div class="stat-tile"><div class="num">'+state.exercisesCompleted+'</div><div class="lbl">Exercises completed</div></div>'+
      '<div class="stat-tile"><div class="num">'+currentStreak()+'</div><div class="lbl">Day streak</div></div>'+
      '<div class="stat-tile"><div class="num">'+lessonsCompleted()+'</div><div class="lbl">Lessons completed</div></div>'+
      '<div class="stat-tile"><div class="num">'+wordsLearned()+'</div><div class="lbl">Words encountered</div></div>'+
      '<div class="stat-tile"><div class="num">'+wordsMastered()+'</div><div class="lbl">Words mastered</div></div>'+
    '</div>'+
    '<div class="card" style="padding:20px 22px;margin-bottom:16px">'+
      '<h2 style="font-size:17px;margin-bottom:14px">Mastery by skill</h2>'+
      ["vocabulary","grammar","listening","reading","writing","pronunciation"].map(function(sk){
        var m = skillMastery(sk), t=(state.skillStats[sk]||{t:0}).t;
        return '<div class="mastery-row" style="margin-bottom:11px"><span class="label">'+sk[0].toUpperCase()+sk.slice(1)+'</span>'+
          '<span class="progressbar'+(m>=80?" pine":"")+'"><span style="width:'+m+'%"></span></span>'+
          '<span class="pct">'+(t? m+"%" : "—")+'</span></div>';
      }).join("")+
      '<p style="font-size:12.5px;color:var(--text-3);margin-top:6px">A dash means you haven\'t attempted that skill yet.</p>'+
    '</div>'+
    '<div class="card" style="padding:20px 22px;margin-bottom:16px">'+
      '<h2 style="font-size:17px;margin-bottom:6px">Weak areas</h2>'+
      (weak.length? '<p style="font-size:13.5px;color:var(--text-2);margin-bottom:12px">Ranked by your accuracy on exercises testing each rule.</p>'+
        weak.map(function(t){
          var g = grammarById(t.id);
          return '<div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--line)">'+
            '<div style="flex:1"><b style="font-size:14px">'+escapeHtml(g?g.title:t.id)+'</b>'+
            '<div style="font-size:12px;color:var(--text-3)">'+t.total+' attempt'+(t.total===1?"":"s")+'</div></div>'+
            '<span class="tabular" style="font-weight:700;color:'+(t.acc<60?"var(--brick)":"var(--accent-strong)")+'">'+t.acc+'%</span>'+
            '<button class="btn secondary sm" data-action="startTopicPractice" data-topic="'+t.id+'">Practice</button></div>';
        }).join("")
      : '<p style="font-size:13.5px;color:var(--text-3)">Nothing flagged yet — weak areas appear once you\'ve attempted a rule at least twice.</p>')+
    '</div>'+
    transferCard()+
    '<div class="card" style="padding:20px 22px">'+
      '<h2 style="font-size:17px;margin-bottom:10px">Settings</h2>'+
      '<label style="display:flex;align-items:center;gap:10px;font-size:14px;cursor:pointer;margin-bottom:10px">'+
        '<input type="checkbox" data-action="toggleMotion" '+(state.settings.reduceMotion?"checked":"")+' style="width:auto" /> Reduce animation</label>'+
      '<label style="display:flex;align-items:flex-start;gap:10px;font-size:14px;cursor:pointer;margin-bottom:4px">'+
        '<input type="checkbox" data-action="toggleProfanity" '+(state.settings.showProfanity?"checked":"")+' style="width:auto;margin-top:3px" />'+
        '<span>Show the swearing unit<br><span style="font-size:12.5px;color:var(--text-3)">Register track only. Profanity taught for recognition, with strength ratings.</span></span></label>'+
      '<div style="height:12px"></div>'+
      '<div style="border-top:1px solid var(--line);margin:14px 0;padding-top:14px">'+
        '<div style="font-size:13.5px;color:var(--text-2);margin-bottom:8px">'+
          (state.settings.unlockAll
            ? '<b style="color:var(--pine)">Author mode is on</b> — every unit is open.'
            : 'Author mode opens every unit regardless of progress.')+'</div>'+
        '<button class="btn secondary sm" data-action="go" data-page="admin">'+
          (state.settings.unlockAll? 'Manage author mode' : 'Author mode')+'</button>'+
      '</div>'+
      '<button class="btn secondary sm" data-action="resetProgress">Reset all progress</button>'+
      '<p style="font-size:12.5px;color:var(--text-3);margin-top:8px">This clears everything stored in this browser and cannot be undone.</p>'+
    '</div>';
  return shell(null, main, null, true);
};

/* ---------- CHECKPOINTS & LEVEL EXAMS ----------
   A checkpoint mixes material from the units before it; a level exam covers the
   whole level and adds reading, listening and a written task. Neither tells the
   learner which rule is being tested — that is the point of them, since naming
   the rule lets pattern-matching stand in for knowing the language. */


PAGES.exam = function(params){
  var kind = params[0], id = params[1];
  if(!session.exam || session.exam.key !== kind+":"+id){
    var built = buildExam(kind, id);
    if(!built) return notFound("There isn't enough completed material to build this assessment yet.");
    built.key = kind+":"+id;
    session.exam = built;
    session.qIndex = 0; session.sessionDone = false;
    built.items.forEach(function(e){
      delete session.feedback[e.id]; delete session.answers[e.id];
      delete session.built[e.id];    delete session.matched[e.id];
      delete session.gaps[e.id];     delete session.optOrder[e.id];
    });
  }
  var ex = session.exam;
  var answered = ex.items.filter(function(e){ return session.feedback[e.id]; }).length;

  if(session.sessionDone){
    var bySkill = {};
    ex.items.forEach(function(e){
      var f = session.feedback[e.id];
      bySkill[e.skill] = bySkill[e.skill] || {c:0,t:0};
      bySkill[e.skill].t++;
      if(f && f.verdict==="correct") bySkill[e.skill].c++;
    });
    var correct = ex.items.filter(function(e){ var f=session.feedback[e.id]; return f&&f.verdict==="correct"; }).length;
    var score = pct(correct, ex.items.length);
    var passed = score >= ex.passMark;
    var weakest = Object.keys(bySkill).filter(function(k){ return bySkill[k].t; })
      .sort(function(a,b){ return pct(bySkill[a].c,bySkill[a].t)-pct(bySkill[b].c,bySkill[b].t); });

    if(!ex.recorded){
      ex.recorded = true;
      state.examResults.unshift({
        date: todayStr(), kind: ex.kind, id: ex.id, title: ex.title,
        score: score, passed: passed, total: ex.items.length, correct: correct,
        bySkill: Object.keys(bySkill).reduce(function(a,k){ a[k]=pct(bySkill[k].c,bySkill[k].t); return a; }, {})
      });
      if(state.examResults.length>40) state.examResults.length=40;
      markActivityToday(); persist();
    }

    return shell(null,
      '<div class="card" style="padding:28px">'+
        '<div class="section-eyebrow">'+escapeHtml(ex.title)+'</div>'+
        '<h1 style="font-size:32px;margin-bottom:4px">'+score+'%</h1>'+
        '<p style="color:var(--text-2);margin-bottom:18px">'+correct+' of '+ex.items.length+' correct · '+
          (passed? '<b style="color:var(--pine)">passed</b>' : '<b style="color:var(--brick)">below the '+ex.passMark+'% pass mark</b>')+'</p>'+
        '<h2 style="font-size:16px;margin-bottom:12px">Results by skill</h2>'+
        Object.keys(bySkill).map(function(k){
          var p = pct(bySkill[k].c, bySkill[k].t);
          return '<div class="mastery-row" style="margin-bottom:10px">'+
            '<span class="label">'+k[0].toUpperCase()+k.slice(1)+'</span>'+
            '<span class="progressbar'+(p>=80?" pine":"")+'"><span style="width:'+p+'%"></span></span>'+
            '<span class="pct">'+bySkill[k].c+'/'+bySkill[k].t+'</span></div>';
        }).join("")+
        (weakest.length? '<p style="font-size:13.5px;color:var(--text-2);margin-top:14px;padding-top:14px;border-top:1px solid var(--line)">'+
          'Weakest area: <b>'+escapeHtml(weakest[0])+'</b>. '+
          (passed? 'Worth a review pass before you move on.' : 'Focus here before retaking.')+'</p>':'')+
        whatYouGotWrong(ex.items, {retryAction:"retryWrongOnly"})+
        '<div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">'+
          '<button class="btn" data-action="go" data-page="home">Back to Learn</button>'+
          '<button class="btn secondary" data-action="retakeExam" data-kind="'+escapeHtml(kind)+'" data-id="'+escapeHtml(id)+'">Retake</button>'+
          (state.mistakes.length? '<button class="btn secondary" data-action="go" data-page="mistakes">Review mistakes</button>':'')+
        '</div>'+
      '</div>', null);
  }

  var i = clamp(session.qIndex, 0, ex.items.length-1);
  var item = ex.items[i];
  return shell(null,
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">'+
      '<div><div class="section-eyebrow">'+escapeHtml(ex.title)+'</div>'+
      '<p style="color:var(--text-2);font-size:13.5px;max-width:56ch">'+escapeHtml(ex.blurb)+'</p></div>'+
      '<span class="tabular" style="font-size:12.5px;color:var(--text-3);white-space:nowrap">'+answered+' / '+ex.items.length+'</span>'+
    '</div>'+
    '<div class="progressbar" style="margin:12px 0 20px"><span style="width:'+pct(answered,ex.items.length)+'%"></span></div>'+
    renderExercise(item, {counter:"Question "+(i+1)+" of "+ex.items.length, examMode:true}),
    null);
};

/* ---------- READING MODE ---------- */
PAGES.reading = function(params){
  var r = params[0]? readingById(params[0]) : null;
  if(r){
    var qs = openExercises().filter(function(e){ return e.readingId===r.id; });
    var inEnglish = qs.filter(function(e){ return e.qLang!=="ro"; });
    var inRomanian = qs.filter(function(e){ return e.qLang==="ro"; });
    var block = function(list){
      return list.map(function(e){
        return '<div style="margin-bottom:16px">'+renderExercise(e,{onContinue:false, showPassage:false})+'</div>';
      }).join("");
    };
    return shell(null,
      '<button class="btn ghost sm" data-action="go" data-page="reading" style="margin-bottom:12px">← All texts</button>'+
      renderReading(r)+
      (inEnglish.length? '<h2 style="font-size:18px;margin:22px 0 12px">Comprehension</h2>'+block(inEnglish) : '')+
      /* Romanian-language questions sit in their own block so the switch of
         language is announced rather than sprung. */
      (inRomanian.length
        ? '<h2 style="font-size:18px;margin:26px 0 4px">Întrebări în română</h2>'+
          '<p style="font-size:13px;color:var(--text-3);margin-bottom:12px;max-width:60ch">'+
            'Same text, questions in Romanian. Click any word you don\'t know — the point is to answer '+
            'without translating the question into English first.</p>'+
          block(inRomanian)
        : '')
    , null);
  }
  var byLevel = {};
  READING_TEXTS.forEach(function(t){ (byLevel[t.level]=byLevel[t.level]||[]).push(t); });
  return shell(null,
    '<h1 style="font-size:28px;margin-bottom:6px">Reading</h1>'+
    '<p style="color:var(--text-2);margin-bottom:20px;max-width:60ch">Texts get longer and less supported as you climb: 40–70 words at A1, 80–100 at A2.1, 110–150 at A2.2, and 560–660 in the B1 long-form pieces — well past the 230-word texts the I.L.R. exam uses, because reading at length is a different skill from reading accurately. Click any word for its meaning; the full translation stays hidden until you ask for it.</p>'+
    LEVELS.filter(function(l){ return byLevel[l.id]; }).map(function(l){
      return '<h2 style="font-size:16px;margin:20px 0 10px">'+l.code+' · '+escapeHtml(l.name)+'</h2>'+
        byLevel[l.id].map(function(t){
          /* The whole row opens the text — same data-action as the Read button,
             just on a wider target — so a click anywhere on the title or the
             blurb works, not only on the button itself. role="button" plus
             tabindex make it keyboard-reachable and matches how the grammar and
             verbs list rows already do this (see PAGES.grammar / PAGES.verbs). The
             Read button stays: it is still the more discoverable target for a
             mouse, and this only widens what already works rather than replacing
             it. Clicking the button still resolves to the button's own
             data-action, since the delegated listener walks up from e.target. */
          return '<div class="card row-link" style="padding:16px 18px;margin-bottom:10px;display:flex;gap:14px;align-items:center" '+
            'data-action="go" data-page="reading" data-p1="'+t.id+'" role="button" tabindex="0" '+
            'aria-label="Read '+escapeHtml(t.title)+'">'+
            '<div style="flex:1"><b style="font-family:var(--font-display);font-size:16.5px">'+escapeHtml(t.title)+'</b>'+
            '<div style="font-size:12.5px;color:var(--text-3);margin-top:2px">'+escapeHtml(t.titleEn)+' · '+escapeHtml(t.format)+' · '+t.wordCount+' words</div></div>'+
            '<button class="btn secondary sm" data-action="go" data-page="reading" data-p1="'+t.id+'" tabindex="-1">Read</button></div>';
        }).join("");
    }).join(""), null);
};

/* ---------- WRITING MODE ---------- */
PAGES.writing = function(params){
  var e = params[0]? exerciseById(params[0]) : null;
  if(e){
    return shell(null,
      '<button class="btn ghost sm" data-action="go" data-page="writing" style="margin-bottom:12px">← All writing tasks</button>'+
      renderExercise(e,{onContinue:false}), null);
  }
  var tasks = openExercises().filter(function(x){ return x.type==="produce"; });
  var byLevel = {};
  tasks.forEach(function(t){
    var l = lessonById(t.lesson);
    var key = l? l.levelId : "a1_1";
    (byLevel[key]=byLevel[key]||[]).push(t);
  });
  return shell(null,
    '<h1 style="font-size:28px;margin-bottom:6px">Writing</h1>'+
    '<p style="color:var(--text-2);margin-bottom:8px;max-width:60ch">Single sentences at A1, short messages at A2, connected texts of 100–180 words at B1.</p>'+
    '<p style="color:var(--text-3);font-size:13.5px;margin-bottom:20px;max-width:60ch">Submitted work gets feedback split by category — diacritics, sentence length, grammar and vocabulary — alongside a model answer to compare against. The checks are mechanical, so they catch structure rather than judging style.</p>'+
    LEVELS.filter(function(l){ return byLevel[l.id]; }).map(function(l){
      return '<h2 style="font-size:16px;margin:20px 0 10px">'+l.code+' · '+escapeHtml(l.name)+'</h2>'+
        byLevel[l.id].map(function(t){
          var done = session.feedback[t.id];
          return '<div class="card" style="padding:16px 18px;margin-bottom:10px;display:flex;gap:14px;align-items:center">'+
            '<div style="flex:1"><div style="font-size:14.5px">'+t.prompt+'</div>'+
            '<div style="font-size:12px;color:var(--text-3);margin-top:5px">at least '+(t.minWords||10)+' words'+
              (done? ' · <span style="color:var(--pine)">attempted</span>':'')+'</div></div>'+
            '<button class="btn secondary sm" data-action="go" data-page="writing" data-p1="'+t.id+'">Write</button></div>';
        }).join("");
    }).join(""), null);
};

PAGES.placement = function(){
  var st = session.placement || (session.placement = newPlacementRun());

  if(st.done){
    var res = placementResult(st);
    var rec = levelById(res.placement) || LEVELS[0];
    var cefrLevels = levelsOfCourse("cefr");
    return '<div class="shell"><main class="main"><div class="main-inner" style="max-width:660px;padding-top:30px">'+
      '<div class="section-eyebrow">Placement result</div>'+
      '<h1 style="font-size:30px;margin-bottom:6px">Start at '+rec.code+'</h1>'+
      '<p style="color:var(--text-2);margin-bottom:20px;max-width:58ch">'+
        res.totalCorrect+' of '+res.totalAsked+' correct overall. You are placed at the first level you did <b>not</b> clear — '+
        'that is where there is still something to learn, so it is where the course starts you.</p>'+

      '<div class="card" style="padding:18px 20px;margin-bottom:16px">'+
        '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin-bottom:12px">How you did at each level</div>'+
        res.bands.map(function(b){
          return '<div class="mastery-row" style="margin-bottom:10px">'+
            '<span class="label">'+b.label+'</span>'+
            '<span class="progressbar'+(b.passed?" pine":"")+'"><span style="width:'+b.pct+'%"></span></span>'+
            '<span class="pct" style="width:70px;text-align:right">'+b.correct+'/'+b.total+
              ' <span class="badge '+(b.passed?'pine':'brick')+'" style="margin-left:4px">'+(b.passed?'pass':'not yet')+'</span></span>'+
          '</div>';
        }).join("")+
        '<p style="font-size:12.5px;color:var(--text-3);margin-top:10px">A level counts as cleared at 3 of 4. '+
          (res.bands.length < PLACEMENT_BANDS.length
            ? 'The test stopped early once a level was clearly beyond you — the remaining levels were not asked.'
            : 'You were asked every level.')+'</p>'+
      '</div>'+

      '<p style="color:var(--text-2);font-size:14px;margin-bottom:10px">This is a recommendation, not a verdict. Override it if you disagree:</p>'+
      '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">'+
        cefrLevels.map(function(l){
          return '<button class="btn '+(l.id===rec.id?'':'secondary')+'" style="justify-content:flex-start" data-action="acceptPlacement" data-level="'+l.id+'">'+
            l.code+' · '+escapeHtml(l.name)+(l.id===rec.id?'  — recommended':'')+'</button>';
        }).join("")+'</div>'+
      '<button class="btn ghost sm" data-action="restartPlacement">Retake the test</button>'+
    '</div></main></div>';
  }

  var band = PLACEMENT_BANDS[st.bandIndex];
  var item = st.picks[st.bandIndex][st.itemIndex];
  var asked = placementFlatIndex(st, st.bandIndex, st.itemIndex);
  var maxItems = st.picks.reduce(function(a,p){ return a+p.length; },0);

  var body;
  if(item.type==="mcq"){
    body = item.opts.map(function(o,i){
      return '<button type="button" class="mcq-option" data-action="answerPlacement" data-i="'+i+'">'+
        '<span class="mcq-letter">'+String.fromCharCode(65+i)+'</span><span class="ro">'+escapeHtml(o)+'</span></button>';
    }).join("");
  } else {
    body = '<input type="text" data-field="plc" data-autofocus data-action="typePlacement" '+
      'data-enter-action="submitPlacement" autocomplete="off" spellcheck="false" '+
      'placeholder="Type your answer…" value="'+escapeHtml(st.typed||"")+'" aria-label="Your answer" />'+
      diacriticBar("plc")+
      '<div style="margin-top:12px;display:flex;gap:10px;align-items:center">'+
        '<button class="btn" data-action="submitPlacement">Submit</button>'+
        '<button class="btn secondary" data-action="skipPlacement">I don\'t know</button>'+
      '</div>';
  }

  return '<div class="shell"><main class="main"><div class="main-inner" style="max-width:620px;padding-top:30px">'+
    '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">'+
      '<div class="section-eyebrow">Placement test · '+band.label+' section</div>'+
      '<span class="tabular" style="font-size:12.5px;color:var(--text-3)">question '+(asked+1)+'</span></div>'+
    '<div class="progressbar" style="margin-bottom:22px"><span style="width:'+pct(asked,maxItems)+'%"></span></div>'+
    '<div class="exercise-shell">'+
      '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin-bottom:8px">'+
        (item.type==="mcq"?"Choose one":"Type the answer")+'</div>'+
      '<div class="exercise-prompt" style="font-family:var(--font-display)">'+item.q+'</div>'+
      body+
      (item.hint? '<p style="font-size:12.5px;color:var(--text-3);margin-top:10px">'+escapeHtml(item.hint)+'</p>':'')+
      '<p style="font-size:12.5px;color:var(--text-3);margin-top:12px;padding-top:10px;border-top:1px solid var(--line)">'+
        'No feedback until the end. If you genuinely don\'t know, say so rather than guessing — '+
        'a wrong guess that happens to land right will place you above your actual level, which helps nobody.</p>'+
    '</div></div></main></div>';
};

PAGES.lessondone = function(params){
  var r = session.lastLessonResult;
  var l = lessonById(params[0]);
  if(!r || !l) return notFound("No lesson result to show.");
  var passed = r.score>=80 && r.answered===r.total;
  var next = nextLessonAfter(l);
  return '<div class="shell"><main class="main"><div class="main-inner" style="max-width:620px;padding-top:30px">'+
    '<div class="section-eyebrow">'+(passed?"Lesson complete":"Lesson attempted")+'</div>'+
    '<h1 style="font-size:30px;margin-bottom:10px">'+escapeHtml(l.title)+'</h1>'+
    '<div class="card" style="padding:22px;margin-bottom:16px">'+
      '<div style="font-size:34px;font-weight:700;font-family:var(--font-mono)">'+r.score+'%</div>'+
      '<div style="color:var(--text-2);font-size:14px;margin-bottom:14px">'+r.correct+' of '+r.total+' exercises correct'+
        (r.answered<r.total? ' · '+(r.total-r.answered)+' not attempted':'')+'</div>'+
      (passed
        ? '<p style="font-size:14px;color:var(--pine)"><b>Marked complete.</b> The vocabulary from this lesson has entered your review queue and will come back on a spaced schedule.</p>'
        : '<p style="font-size:14px;color:var(--accent-strong)"><b>Not marked complete yet.</b> A lesson needs every core exercise attempted and a score of at least 80%. Your best score is kept — retry the weak parts rather than starting over.</p>')+
      whatYouGotWrong(lessonExercises(l), {retryAction:"retryWrongOnly"})+
    '</div>'+
    nextLessonCard(l, passed)+
    '<div style="display:flex;gap:10px;flex-wrap:wrap">'+
      (next
        ? '<button class="btn" data-action="go" data-page="lesson" data-p1="'+next.id+'">Next lesson →</button>'+
          '<button class="btn secondary" data-action="go" data-page="unit" data-p1="'+l.unitId+'">Back to unit</button>'
        : '<button class="btn" data-action="go" data-page="unit" data-p1="'+l.unitId+'">Back to unit</button>')+
      '<button class="btn secondary" data-action="go" data-page="lesson" data-p1="'+l.id+'">Review this lesson</button>'+
      (dueVocabIds().length? '<button class="btn secondary" data-action="go" data-page="review">Review vocabulary</button>':'')+
    '</div>'+
  '</div></main></div>';
};
