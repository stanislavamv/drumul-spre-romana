/* Drumul spre Romana — exercise rendering and feedback.
 *
 * Extracted verbatim from index.html. Everything that turns an exercise object
 * into markup, and a graded verdict into the panel a learner reads afterwards.
 *
 * Presentation only. Nothing here decides whether an answer is right — that is
 * js/features/grading.js, which this file calls through globals
 * (checkAgreementStructures, checkDefiniteAfterLike, primaryAnswer,
 * builtSentence, alignTokens). The split is worth keeping: grading is pure
 * logic with no DOM, and this layer is pure markup with no verdict logic.
 *
 * Reads transient view state from `session` (answers, feedback, built, matched,
 * revealed, gaps, optOrder) and lazily initialises session.gaps / session.matched
 * / session.optOrder on first render. It does NOT manage session lifecycle — no
 * resets, no accessors — and it never touches persistent `state`.
 *
 * Two contracts here are load-bearing:
 *
 *   · textField emits data-field="ans_<exerciseId>". js/core/fields.js snapshots
 *     and restores the focused field by that attribute across a full redraw, so
 *     changing the key would silently discard whatever the learner had typed.
 *
 *   · optionOrder caches a shuffled index order in session.optOrder per
 *     exercise. The cache is what stops options reshuffling mid-attempt; the
 *     shuffle itself is what stops repeat testing teaching answer positions.
 *
 * renderExercise dispatches on ex.type: ten explicit cases plus a default that
 * routes the five typed types (conjugate, error_fix, fill, trans_en_ro,
 * transform) through textField.
 *
 * The "use strict" directive is not new — it is the mode these functions
 * already ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

/* Stable-per-attempt shuffle of an exercise's options. Cleared whenever the
   exercise is retried or re-queued, so a second attempt reorders them. */
function optionOrder(ex){
  if(!session.optOrder[ex.id]){
    session.optOrder[ex.id] = shuffle(ex.options.map(function(_,i){ return i; }));
  }
  return session.optOrder[ex.id];
}

function textField(ex, placeholder){
  var key = "ans_"+ex.id;
  var val = session.answers[ex.id]||"";
  return '<input type="text" data-field="'+key+'" data-ex="'+ex.id+'" data-action="typeAnswer" '+
    'data-enter-action="submitExercise" autocomplete="off" autocapitalize="off" spellcheck="false" '+
    'placeholder="'+escapeHtml(placeholder||"Type your answer in Romanian…")+'" value="'+escapeHtml(val)+'" '+
    'aria-label="Your answer" />'+ diacriticBar(key);
}

function skillBadge(skill){
  var cls = {grammar:"accent", vocabulary:"pine", listening:"brick", reading:"neutral", writing:"accent", pronunciation:"pine"}[skill]||"neutral";
  return '<span class="badge '+cls+'">'+escapeHtml(skill)+'</span>';
}

/* Heuristic writing feedback, split by category as the brief requires.
   These are checks a machine can make honestly — they never claim to judge
   meaning or style. */
function writingFeedback(text){
  var out = [];
  var t = String(text||"");
  var hasDia = /[ăâîșț]/i.test(t);
  var looksRo = /\b(este|sunt|am|și|să|nu|cu|la|în|de)\b/i.test(normLoose(t));
  out.push({cat:"Diacritics", ok:hasDia,
    note: hasDia ? "You are using Romanian diacritics — keep it up; they are part of the spelling."
                 : "I don't see any of <b>ă â î ș ț</b>. Almost any Romanian paragraph of this length needs some. Use the character bar under the box."});
  var sentences = t.split(/[.!?]+/).map(function(s){return s.trim();}).filter(Boolean);
  var avg = sentences.length ? Math.round(t.split(/\s+/).filter(Boolean).length / sentences.length) : 0;
  out.push({cat:"Sentence length", ok: avg>0 && avg<=22,
    note: avg===0 ? "I couldn't find sentence-ending punctuation. Romanian uses <b>. ! ?</b> just as English does."
        : avg>22 ? "Your sentences average "+avg+" words, which is long. Try splitting some — or join them deliberately with connectors like <b>pentru că</b>, <b>deși</b>, <b>iar</b>."
        : "Sentence length averages "+avg+" words, which reads naturally."});
  var sunt_mers = /\b(sunt|este|esti|suntem|sunteti) (mers|venit|plecat|facut|fost)\b/i.test(normLoose(t));
  var agree = checkAgreementStructures(t);
  var arts  = checkDefiniteAfterLike(t);
  var grammarProblems = [];
  if(sunt_mers) grammarProblems.push("<b>a fi</b> used as a past auxiliary — perfectul compus always takes <b>a avea</b>: <i>am mers</i>, <i>am făcut</i>.");
  agree.forEach(function(x){ grammarProblems.push(x); });
  arts.forEach(function(x){ grammarProblems.push(x); });
  out.push({cat:"Grammar", ok:!grammarProblems.length,
    note: grammarProblems.length
      ? grammarProblems.join("<br>")
      : "Nothing flagged by the checks that run here: past-tense auxiliary, and verb agreement in <i>îmi place/plac</i> and <i>mă doare/dor</i>."});
  /* Say plainly what is NOT examined, so a clean result is not mistaken for
     a verdict on the whole text. */
  out.push({cat:"Not checked", ok:null,
    note:"Meaning, word order, tense choice, gender agreement on adjectives and most spelling are <b>not</b> verified here. Read your text against the model line by line — that comparison is the exercise."});
  out.push({cat:"Vocabulary", ok:looksRo,
    note: looksRo ? "Your text reads as Romanian rather than translated English word-for-word."
                  : "I can't detect common Romanian function words here. Make sure you are writing in Romanian, not English."});
  return out;
}

function renderExercise(ex, opts){
  opts = opts||{};
  var fb = session.feedback[ex.id];
  var done = !!fb;
  var body = "";

  switch(ex.type){
    case "mcq": case "reading_q": case "minimal_pair": {
      var sel = session.answers[ex.id];
      /* Option order is shuffled per attempt. With a fixed order, repeating a
         test teaches you that "the answer is B" rather than making you read the
         question — which is exactly the pattern-matching this course is built
         to avoid. The permutation is held for the attempt so re-renders don't
         reshuffle mid-answer, and is discarded on retry. */
      var order = optionOrder(ex);
      body = order.map(function(orig, slot){
        var o = ex.options[orig];
        var cls = "mcq-option";
        if(done){
          if(orig===ex.correct) cls+=" show-correct";
          else if(String(sel)===String(orig)) cls+=" show-wrong";
        } else if(String(sel)===String(orig)) cls+=" selected";
        var audio = ex.type==="minimal_pair" && ex.audioFor
          ? ' '+audioButton(ex.audioFor[orig], {small:true, label:"hear"}) : '';
        /* Options in Romanian are glossable word by word. The gloss click is
           handled before the option click, so looking a word up does not
           accidentally submit an answer. */
        return '<button type="button" class="'+cls+'" data-action="pickOption" data-ex="'+ex.id+'" data-i="'+orig+'"'+(done?' disabled':'')+'>'+
          '<span class="mcq-letter">'+String.fromCharCode(65+slot)+'</span><span class="ro">'+glossify(escapeHtml(o))+'</span>'+audio+'</button>';
      }).join("");
      break;
    }
    case "build": {
      var placed = session.built[ex.id]||[];
      var pool = ex.words.map(function(w,i){
        var used = placed.indexOf(i)>-1;
        return '<button type="button" class="wordchip'+(used?" used":"")+'" data-action="placeWord" data-ex="'+ex.id+'" data-i="'+i+'"'+(used||done?' disabled':'')+'>'+escapeHtml(w)+'</button>';
      }).join("");
      body = '<div class="sentence-bank" aria-label="Your sentence">'+
        (placed.length? placed.map(function(idx,pos){
          return '<button type="button" class="wordchip placed" data-action="unplaceWord" data-ex="'+ex.id+'" data-pos="'+pos+'"'+(done?' disabled':'')+'>'+escapeHtml(ex.words[idx])+'</button>';
        }).join("") : '<span style="color:var(--text-3);font-size:13.5px;align-self:center">Tap the words below in order…</span>')+
        '</div><div class="word-pool">'+pool+'</div>';
      break;
    }
    case "match": {
      var right = session.matched[ex.id+"_shuffled"] || (session.matched[ex.id+"_shuffled"] = shuffle(ex.pairs.map(function(p,i){return i;})));
      var picks = session.matched[ex.id] || {};
      body = '<div style="display:flex;flex-direction:column;gap:8px">'+ ex.pairs.map(function(p,i){
        var v = picks[i];
        var ok = done ? (String(v)===String(i)) : null;
        var border = done ? (ok? "var(--pine)":"var(--brick)") : "var(--line-strong)";
        return '<div style="display:flex;gap:10px;align-items:center">'+
          '<span class="ro" style="flex:1;font-family:var(--font-display);font-size:16px">'+escapeHtml(p[0])+'</span>'+
          audioButton(p[0],{small:true,label:false})+
          '<select data-action="pickMatch" data-ex="'+ex.id+'" data-row="'+i+'" style="flex:1.4;border-color:'+border+'"'+(done?' disabled':'')+' aria-label="Meaning of '+escapeHtml(p[0])+'">'+
            '<option value="">— choose —</option>'+
            right.map(function(ri){ return '<option value="'+ri+'"'+(String(v)===String(ri)?' selected':'')+'>'+escapeHtml(ex.pairs[ri][1])+'</option>'; }).join("")+
          '</select></div>';
      }).join("") +'</div>';
      break;
    }
    case "produce": {
      var key="ans_"+ex.id;
      body = '<textarea data-field="'+key+'" data-ex="'+ex.id+'" data-action="typeAnswer" placeholder="Write in Romanian…" aria-label="Your answer">'+escapeHtml(session.answers[ex.id]||"")+'</textarea>'+
        diacriticBar(key)+
        '<div style="font-size:12.5px;color:var(--text-3);margin-top:8px">Target: at least '+(ex.minWords||10)+' words'+
        (ex.mustUse&&ex.mustUse.length? ' · try to use '+ex.mustUse.map(function(m){return '<b>'+escapeHtml(m)+'</b>';}).join(", ") : '')+'</div>';
      break;
    }
    case "transcribe": case "dictation": {
      body = '<div style="margin-bottom:14px">'+audioButton(ex.audio,{speedControl:true,label:"Play"})+'</div>'+ textField(ex, "Type what you hear…");
      break;
    }
    /* Rebuild a heard conversation in the right order. Tests whether the
       learner followed the exchange, not whether they caught single words. */
    case "order_lines": {
      var shufKey = ex.id+"_shuf";
      var order = session.matched[shufKey] || (session.matched[shufKey] = shuffle(ex.lines.map(function(_,i){return i;})));
      var placed = session.built[ex.id] || [];
      var lineRow = function(idx, pos){
        var l = ex.lines[idx];
        var correctHere = done && placed[pos]===pos;
        var border = done ? (correctHere? "var(--pine)" : "var(--brick)") : "var(--line-strong)";
        return '<button type="button" style="display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;'+
          'border:1.5px solid '+border+';background:var(--surface);border-radius:var(--radius-s);padding:10px 12px;'+
          'margin-bottom:7px;cursor:'+(done?'default':'pointer')+'" '+
          (pos!=null ? 'data-action="unplaceLine" data-ex="'+ex.id+'" data-pos="'+pos+'"'
                     : 'data-action="placeLine" data-ex="'+ex.id+'" data-i="'+idx+'"')+
          (done?' disabled':'')+'>'+
          (pos!=null? '<span style="font-family:var(--font-mono);font-size:12px;color:var(--text-3);flex:0 0 auto;padding-top:2px">'+(pos+1)+'</span>':'')+
          '<span style="flex:1"><span style="font-size:11px;font-weight:700;letter-spacing:.3px;text-transform:uppercase;color:var(--text-3)">'+escapeHtml(l.speaker)+'</span>'+
          '<span class="ro" style="display:block;font-family:var(--font-display);font-size:15.5px">'+escapeHtml(l.ro)+'</span></span>'+
          '</button>';
      };
      body =
        '<div style="margin-bottom:14px">'+audioButton(ex.lines.map(function(l){return l.ro;}),{label:"Play the conversation",speedControl:true})+'</div>'+
        '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin-bottom:6px">Your order</div>'+
        '<div style="min-height:54px;border:1.5px dashed var(--line-strong);border-radius:var(--radius-s);padding:10px;margin-bottom:14px">'+
          (placed.length? placed.map(function(idx,pos){ return lineRow(idx,pos); }).join("")
            : '<span style="color:var(--text-3);font-size:13.5px">Listen first, then tap the lines below in the order you heard them.</span>')+
        '</div>'+
        '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin-bottom:6px">Lines</div>'+
        order.filter(function(i){ return placed.indexOf(i)===-1; }).map(function(i){ return lineRow(i,null); }).join("") ||
        '<span style="color:var(--text-3);font-size:13px">All lines placed.</span>';
      break;
    }
    /* Listen and restore the missing words. A2+ only — blanking vocabulary a
       learner has not met yet tests guessing, not listening. */
    case "gapfill": {
      var gaps = session.gaps[ex.id] || (session.gaps[ex.id] = {});
      var gi = -1;
      body = '<div style="margin-bottom:14px">'+audioButton(ex.audio,{speedControl:true,label:"Play"})+'</div>'+
        '<div style="font-family:var(--font-display);font-size:16.5px;line-height:2.1">'+
        ex.tokens.map(function(t){
          if(!t.blank) return escapeHtml(t.text)+" ";
          gi++;
          var idx = gi;
          var val = gaps[idx]||"";
          var state = "";
          if(done){
            var ok = normLoose(val)===normLoose(ex.answers[idx]);
            state = ';border-color:'+(ok?'var(--pine)':'var(--brick)')+';background:'+(ok?'var(--pine-soft)':'var(--brick-soft)');
          }
          return '<input type="text" data-field="gap_'+ex.id+'_'+idx+'" data-ex="'+ex.id+'" data-gap="'+idx+'" '+
            'data-action="typeGap" data-enter-action="submitExercise" autocomplete="off" spellcheck="false" '+
            'aria-label="Missing word '+(idx+1)+'" value="'+escapeHtml(val)+'"'+(done?' disabled':'')+
            ' style="display:inline-block;width:'+Math.max(70, ex.answers[idx].length*13)+'px;padding:3px 8px;'+
            'font-family:var(--font-display);font-size:15.5px;text-align:center;margin:0 2px'+state+'" /> ';
        }).join("")+
        '</div>'+ diacriticBar("gap_"+ex.id+"_0")+
        (done? '<div style="margin-top:12px;font-size:13.5px;color:var(--text-2)">Full text: <span style="font-family:var(--font-display)">'+escapeHtml(ex.fullText)+'</span></div>':'');
      break;
    }
    default:
      body = textField(ex, ex.type==="trans_ro_en" ? "Type in English…" : "Type in Romanian…");
  }

  /* A comprehension question is unanswerable without its passage. In a lesson
     the reading stage renders the text separately, but in exams, practice and
     review the question travels alone — so carry the passage with it. */
  var passage = "";
  if(ex.readingId && opts.showPassage!==false){
    var rt = readingById(ex.readingId);
    if(rt){
      passage =
        '<div style="border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:var(--radius-s);'+
        'padding:14px 16px;margin-bottom:16px;background:var(--bg)">'+
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px">'+
            '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3)">'+
              escapeHtml(rt.title)+' · '+rt.wordCount+' words</div>'+
            audioButton(sentencesOf(rt.ro),{small:true,label:"listen"})+
          '</div>'+
          '<div style="font-family:var(--font-display);font-size:15px;line-height:1.7;max-height:230px;overflow-y:auto">'+
            escapeHtml(rt.ro).replace(/\n+/g,"<br><br>")+
          '</div>'+
        '</div>';
    }
  }

  var promptHtml = glossify(ex.prompt);
  if(ex.given) promptHtml += '<div class="correct-answer-line" style="color:var(--brick);margin-top:8px">'+glossify(escapeHtml(ex.given))+'</div>';

  var audioTop = (ex.audio && ex.type!=="transcribe" && ex.type!=="dictation" && done)
    ? ' '+audioButton(ex.audio,{small:true,label:"listen"}) : '';

  return '<div class="exercise-shell fade-in" data-exercise="'+ex.id+'">'+
    '<div class="exercise-kicker">'+
      '<span style="display:flex;gap:6px;align-items:center">'+skillBadge(ex.skill)+'<span style="font-size:11.5px;color:var(--text-3);font-weight:700;letter-spacing:.3px;text-transform:uppercase">'+(TYPE_LABEL[ex.type]||ex.type)+'</span></span>'+
      (opts.counter? '<span style="font-size:12px;color:var(--text-3)" class="tabular">'+opts.counter+'</span>':'')+
    '</div>'+
    passage+
    '<div class="exercise-prompt">'+promptHtml+audioTop+'</div>'+
    body+
    (ex.hint && !done ? '<div style="margin-top:10px">'+(session.revealed[ex.id]
        ? '<span style="font-size:13px;color:var(--text-2)">💡 '+escapeHtml(ex.hint)+'</span>'
        : '<button class="btn ghost sm" data-action="revealHint" data-ex="'+ex.id+'">Show a hint</button>')+'</div>' : '')+
    (done ? renderFeedback(ex, fb, opts) :
      '<div style="margin-top:18px;display:flex;gap:10px;align-items:center">'+
        '<button class="btn" data-action="submitExercise" data-ex="'+ex.id+'">Check answer</button>'+
        '<span style="font-size:12px;color:var(--text-3)">or press <span class="kbd">Enter</span></span>'+
      '</div>')+
  '</div>';
}

function renderTranscript(ex, typed){
  var text = ex.audio || primaryAnswer(ex);
  if(!text) return "";
  var sents = sentencesOf(text);
  if(!sents.length) sents = [text];

  /* The transcript itself: one sentence per line, generously set, each with its
     own play button so a line can be replayed in isolation while reading it. */
  var lines = sents.map(function(s){
    return '<div class="transcript-line">'+
        audioButton(s, {small:true, label:false})+
        '<span class="transcript-text">'+glossify(escapeHtml(s), {force:true})+'</span>'+
      '</div>';
  }).join("");

  var compare = "";
  if(typed && String(typed).trim()){
    var heardTokens = String(typed).trim().split(/\s+/);
    var saidTokens  = text.split(/\s+/);
    var aligned = alignTokens(saidTokens, heardTokens);
    var wrong = aligned.filter(function(t){ return t.status!=="ok"; });
    compare = '<div class="transcript-compare">'+
      '<div class="transcript-label">What you typed, word by word</div>'+
      '<div class="transcript-diff">'+aligned.map(function(t){
        if(t.status==="ok") return '<span class="tw ok">'+escapeHtml(t.word)+'</span>';
        if(t.status==="near") return '<span class="tw near" title="You wrote: '+escapeHtml(t.typed)+'">'+escapeHtml(t.word)+'</span>';
        return '<span class="tw missed">'+escapeHtml(t.word)+'</span>';
      }).join(" ")+'</div>'+
      '<div class="transcript-key">'+
        (wrong.length===0
          ? 'Every word matched.'
          : '<span class="tw near">green-underlined</span> = right word, spelling or diacritics off · '+
            '<span class="tw missed">struck</span> = you did not catch this word')+
      '</div></div>';
  }

  return '<div class="transcript-panel">'+
      '<div class="transcript-head">'+
        '<span class="transcript-label">Transcript</span>'+
        audioButton(sents, {small:true, label:"Play all"})+
      '</div>'+
      lines + compare +
      '<div class="transcript-key" style="margin-top:10px">Replay a line and read it at the same time — that is the pass that turns a sound you missed into a word you know. Click any word for its meaning.</div>'+
    '</div>';
}

function renderFeedback(ex, fb, opts){
  opts = opts||{};
  var cls = fb.verdict==="correct" ? "correct"
          : fb.verdict==="incorrect" ? "incorrect"
          : fb.verdict==="submitted" ? "neutral" : "partial";
  var title = {
    correct:"Correct",
    almost:"Almost — worth a second look",
    unnatural:"Understandable, but not how it's usually said",
    incorrect:"Not quite",
    submitted:"Submitted — now compare it with the model"
  }[fb.verdict];
  var icon = fb.verdict==="correct" ? iconCheck() : "";

  var answerBlock = "";
  if(fb.verdict!=="correct" || ex.type==="produce"){
    answerBlock = '<div style="margin-top:10px">'+
      '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3)">'+(ex.type==="produce"?"Model answer":"Correct answer")+'</div>'+
      '<div class="correct-answer-line">'+escapeHtml(fb.correct||primaryAnswer(ex))+
        (fb.correct? ' '+audioButton(fb.correct,{small:true,label:false}) : '')+'</div></div>';
  }
  var writing = (ex.type==="produce" && session.answers[ex.id])
    ? '<div style="margin-top:12px;border-top:1px solid var(--line);padding-top:12px">'+
      '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin-bottom:8px">Feedback on your writing</div>'+
      writingFeedback(session.answers[ex.id]).map(function(f){
        var mark = f.ok===null ? "·" : (f.ok ? "✓" : "!");
        var col  = f.ok===null ? "var(--text-3)" : (f.ok ? "var(--pine)" : "var(--brick)");
        return '<div style="display:flex;gap:8px;margin-bottom:7px;font-size:13.2px;line-height:1.5">'+
          '<span style="flex:0 0 auto;color:'+col+';font-weight:800">'+mark+'</span>'+
          '<span><b>'+f.cat+'.</b> '+f.note+'</span></div>';
      }).join("")+'</div>' : "";

  var transcript = (ex.type==="transcribe"||ex.type==="dictation")
    ? renderTranscript(ex, session.answers[ex.id]) : "";

  return '<div class="feedback-box '+cls+' fade-in" role="status">'+
      '<div class="feedback-title">'+icon+title+'</div>'+
      (fb.diagnosis? '<div class="feedback-explain" style="margin-bottom:8px">'+fb.diagnosis+'</div>':'')+
      answerBlock+
      '<div class="feedback-explain" style="margin-top:10px">'+ex.explain+'</div>'+
      writing + transcript +
    '</div>'+
    '<div style="margin-top:14px;display:flex;gap:10px">'+
      (opts.onContinue!==false? '<button class="btn" data-action="continueExercise" data-ex="'+ex.id+'">Continue</button>':'')+
      '<button class="btn secondary" data-action="retryExercise" data-ex="'+ex.id+'">Try again</button>'+
    '</div>';
}

/* A score alone doesn't teach anything. List every item the learner got wrong,
   with what they answered, what was right, and why — so the review happens
   where the session ends rather than in a separate notebook they may never
   open. */
function whatYouGotWrong(exercises, opts){
  opts = opts||{};
  /* "submitted" is open writing the app cannot grade. It belongs in this list —
     the learner should still compare it against the model — but it is not a
     mistake, so it is counted and worded separately. */
  var wrong = exercises.filter(function(e){
    var f = session.feedback[e.id];
    return f && f.verdict !== "correct";
  });
  var graded = wrong.filter(function(e){ return session.feedback[e.id].verdict!=="submitted"; }).length;
  var selfCheck = wrong.length - graded;
  if(!wrong.length){
    return '<div style="margin-top:18px;padding:14px 16px;background:var(--pine-soft);color:var(--pine);'+
      'border-radius:var(--radius-s);font-size:13.5px"><b>Nothing to review.</b> Every answer in this set was fully correct.</div>';
  }
  var lead = graded
    ? graded+' of '+exercises.length+' need another pass. Each one is saved to your mistake notebook too.'
    : 'Nothing was marked wrong.';
  if(selfCheck) lead += (graded?' ':'')+selfCheck+' free-writing answer'+(selfCheck===1?'':'s')+
    ' can’t be graded automatically — compare '+(selfCheck===1?'it':'them')+' against the model below. '+
    (selfCheck===1?'It does':'They do')+' not count against your score.';
  return '<div style="margin-top:22px;padding-top:18px;border-top:1px solid var(--line)">'+
    '<h3 style="font-size:16px;margin-bottom:4px">'+(graded?'What to look at again':'Worth a second look')+'</h3>'+
    '<p style="font-size:13px;color:var(--text-3);margin-bottom:14px">'+lead+'</p>'+
    wrong.map(function(e){
      var f = session.feedback[e.id];
      var yours = (e.type==="mcq"||e.type==="reading_q"||e.type==="minimal_pair")
        ? (e.options[session.answers[e.id]] || "(no answer)")
        : (e.type==="build" ? (builtSentence(e)||"(nothing arranged)")
        : (session.answers[e.id] || "(blank)"));
      var right = f.correct || primaryAnswer(e);
      var band = f.verdict==="incorrect" ? "brick" : "accent";
      return '<div style="border:1px solid var(--line);border-left:3px solid var(--'+band+');'+
        'border-radius:var(--radius-s);padding:13px 15px;margin-bottom:10px">'+
        '<div style="display:flex;gap:8px;align-items:center;margin-bottom:7px">'+
          skillBadge(e.skill)+
          '<span class="badge '+band+'">'+escapeHtml(f.verdict==="incorrect"?"incorrect":f.verdict)+'</span>'+
          (e.topic && grammarById(e.topic)
            ? '<a href="#/grammar/'+e.topic+'" style="font-size:11.5px;margin-left:auto;text-decoration:none">'+
              escapeHtml(grammarById(e.topic).title)+' →</a>' : '')+
        '</div>'+
        '<div style="font-size:13.5px;color:var(--text-2);margin-bottom:8px">'+
          String(e.prompt).replace(/<[^>]+>/g,"")+'</div>'+
        '<div style="display:grid;grid-template-columns:auto 1fr;gap:4px 10px;font-size:14px;align-items:baseline">'+
          '<span style="font-size:11px;font-weight:700;letter-spacing:.3px;text-transform:uppercase;color:var(--text-3)">You</span>'+
          '<span style="font-family:var(--font-display);color:var(--brick)">'+escapeHtml(yours)+'</span>'+
          '<span style="font-size:11px;font-weight:700;letter-spacing:.3px;text-transform:uppercase;color:var(--text-3)">Correct</span>'+
          '<span style="font-family:var(--font-display)">'+escapeHtml(right)+
            (right? ' '+audioButton(right,{small:true,label:false}) : '')+'</span>'+
        '</div>'+
        '<div style="font-size:13px;color:var(--text-2);line-height:1.55;margin-top:9px;'+
          'padding-top:9px;border-top:1px solid var(--line)">'+
          (f.diagnosis? f.diagnosis+' ' : '')+e.explain+'</div>'+
      '</div>';
    }).join("")+
    (opts.retryAction
      ? '<button class="btn secondary sm" data-action="'+opts.retryAction+'">Practice just these '+wrong.length+' again</button>'
      : '')+
  '</div>';
}

function bySkillBreakdown(exercises){
  var by = {};
  exercises.forEach(function(e){
    var f = session.feedback[e.id]; if(!f) return;
    if(f.verdict==="submitted") return;   // not gradeable — see finishLesson
    by[e.skill] = by[e.skill]||{c:0,t:0};
    by[e.skill].t++; if(f.verdict==="correct") by[e.skill].c++;
  });
  var keys = Object.keys(by);
  if(!keys.length) return "";
  return '<div style="margin-top:16px">'+
    '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin-bottom:10px">By skill</div>'+
    keys.map(function(k){
      return '<div class="mastery-row" style="margin-bottom:8px"><span class="label">'+k[0].toUpperCase()+k.slice(1)+'</span>'+
        '<span class="progressbar"><span style="width:'+pct(by[k].c,by[k].t)+'%"></span></span>'+
        '<span class="pct">'+by[k].c+'/'+by[k].t+'</span></div>';
    }).join("")+'</div>';
}
