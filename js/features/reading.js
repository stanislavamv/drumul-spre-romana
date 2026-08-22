/* Drumul spre Romana — reading rendering.
 *
 * Extracted verbatim from index.html. Everything that turns a READING_TEXTS
 * entry into a readable, clickable, navigable page: prose and verse rendering,
 * the per-word gloss run, numeral tokenising, and the previous/next sequence.
 *
 * Two entry points. renderReading(r) handles prose and dispatches anthem/verse
 * texts to renderVerse(r), which additionally builds the singing guide, the
 * video list and the audio player. Everything else here is a leaf.
 *
 * Presentation only — no DOM access, no persistent `state`, and the only
 * `session` reads are session.revealed (translation toggles) and
 * session.revealed only — the sung version is embedded, so nothing here tracks
 * which video is open any more.
 *
 * Nothing in this file is random. The comprehension questions below a reading
 * are rendered by renderExercise in js/features/exercise-render.js, whose
 * optionOrder() shuffles and caches into session.optOrder — that is the only
 * source of run-to-run variation on a reading page, and it lives elsewhere.
 *
 * glossRun has one caller outside this file: mediaDetail, still inline in
 * index.html, which glosses a learner-supplied transcript with it. It resolves
 * glossRun as a global, so this script must load before the inline script.
 *
 * The anthem stanzas rendered through renderVerse are quoted official text.
 * They are reproduced here exactly as they were — wording, diacritics, curly
 * quotes and line breaks unchanged. This file renders that text; it does not
 * edit it.
 *
 * The "use strict" directive is not new — it is the mode these functions
 * already ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

function glossCoverage(text){
  var words = String(text||"").split(/\s+/).map(function(w){ return w.replace(/[.,!?;:()"„”—–]/g,""); })
    .filter(function(w){ return w.length>1 && !/^\d+$/.test(w); });
  var hit = words.filter(function(w){ return glossLookup(w); }).length;
  return {total:words.length, hit:hit, pct:pct(hit, words.length)};
}

/* Wrap every numeral in a text so it can be clicked like a word. Runs on the
   raw token before escaping, and leaves anything that is not a plain integer
   (ranges, prices with decimals) to be split into its parts by the caller. */
/* A day-of-month reads as an ordinal in one place only: the 1st is "întâi".
   Detected from the following word, since "1 decembrie" and "1 leu" are read
   differently and nothing in the digit itself says which is which. */
function numberToken(tok, nextWord){
  if(!/\d/.test(tok)) return null;
  var isDate = !!(nextWord && MONTHS_RO.indexOf(String(nextWord).toLowerCase().replace(/[^a-zăâîșț]/g,"")) > -1);
  /* A token may be a bare number, or a range like 1877–1878, or carry
     punctuation. Split on anything that is not a digit and make each numeric
     run separately clickable, so both years in a range can be heard. */
  var parts = String(tok).split(/(\d+)/);
  if(parts.filter(function(p){ return /^\d+$/.test(p); }).length === 0) return null;
  return parts.map(function(p){
    if(!/^\d+$/.test(p)) return escapeHtml(p);
    var n = parseInt(p, 10);
    if(!isFinite(n) || p.length > 9) return escapeHtml(p);
    return '<span class="link-word num-word" data-action="glossNumber" data-num="' + n + '"' +
           (isDate ? ' data-date="1"' : '') + '>' +
           escapeHtml(p) + '</span>';
  }).join("");
}

/* Turn one run of text into clickable, glossed words. Shared by prose and
   verse rendering so both get the same gloss behavior. */
function glossRun(text, glossary){
  var toks = String(text).split(/(\s+)/);
  return toks.map(function(tok, ti){
    var clean = tok.replace(/[.,!?;:()"„”\n]/g,"");
    if(!clean.trim()) return tok.replace(/\n/g,"<br>");
    var numHtml = numberToken(tok, toks[ti+2]);
    if(numHtml) return numHtml;
    if(/^[\d—–\-]+%?$/.test(clean)) return escapeHtml(tok);
    var g = glossary && Object.keys(glossary).find(function(k){ return normLoose(k)===normLoose(clean); });
    if(g) return '<span class="link-word" data-action="glossWord" data-word="'+escapeHtml(g)+'" data-def="'+escapeHtml(glossary[g])+'">'+escapeHtml(tok)+'</span>';
    var known = !!glossLookup(clean);
    return '<span class="link-word'+(known?'':' link-word-unknown')+'" data-action="glossWord" '+
      'data-word="'+escapeHtml(clean)+'" data-def="">'+escapeHtml(tok)+'</span>';
  }).join("");
}

/* Reading order: grouped by level, exactly as the index page lists them, so
   "next" moves the way the eye expects rather than following array order. */
function readingSequence(){
  var out = [];
  LEVELS.forEach(function(l){
    READING_TEXTS.forEach(function(t){ if(t.level===l.id) out.push(t); });
  });
  /* Anything whose level is not in LEVELS would otherwise vanish from the
     sequence and become unreachable by arrow. */
  READING_TEXTS.forEach(function(t){
    if(out.indexOf(t)===-1) out.push(t);
  });
  return out;
}

function readingNeighbours(r){
  var seq = readingSequence();
  var i = seq.findIndex(function(t){ return t.id===r.id; });
  return {prev: i>0? seq[i-1] : null, next: (i>-1 && i<seq.length-1)? seq[i+1] : null,
          index: i+1, total: seq.length};
}

/* Arrows sit with the audio controls, where the eye already is. Disabled rather
   than hidden at the ends, so the control row does not reflow between texts. */
function readingNav(r){
  var n = readingNeighbours(r);
  var btn = function(t, glyph, label){
    if(!t) return '<button class="reading-arrow" disabled aria-label="'+label+'">'+glyph+'</button>';
    return '<button class="reading-arrow" data-action="go" data-page="reading" data-p1="'+t.id+'" '+
      'title="'+escapeHtml(t.title)+'" aria-label="'+label+': '+escapeHtml(t.title)+'">'+glyph+'</button>';
  };
  return '<div class="reading-nav">'+
    btn(n.prev, "←", "Previous text")+
    '<span class="reading-count tabular">'+n.index+' / '+n.total+'</span>'+
    btn(n.next, "→", "Next text")+
  '</div>';
}

function renderSingingGuide(){
  var s = ANTHEM_SUNG;
  return '<div class="card" style="padding:20px 22px;margin-bottom:16px">'+
    '<div class="section-eyebrow" style="margin-bottom:6px">How it is sung</div>'+
    '<h3 style="font-size:18px;margin-bottom:8px">Fitting the words to the melody</h3>'+
    '<p style="font-size:13.5px;color:var(--text-2);line-height:1.6;max-width:64ch;margin-bottom:8px">'+escapeHtml(s.intro)+'</p>'+
    '<p style="font-size:13.5px;color:var(--text-2);line-height:1.6;max-width:64ch;margin-bottom:16px">'+
      'The hyphens printed in the text are not decoration — they mark vowels that <b>merge into one syllable</b> when sung. '+
      'Getting those wrong is the single most common way a learner falls out of time with everyone else.</p>'+
    s.lines.map(function(l, i){
      return '<div style="padding:12px 0;border-top:1px solid var(--line)">'+
        '<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:6px">'+
          audioButton(l.ro.replace(/‖/g,""),{small:true,label:false})+
          '<div class="transcript-text" style="flex:1">'+escapeHtml(l.ro)+'</div>'+
          '<span class="badge neutral" style="flex:0 0 auto">'+l.count+' syllables</span>'+
        '</div>'+
        '<div style="font-family:var(--font-mono);font-size:12.5px;color:var(--accent-strong);line-height:1.8;padding-left:2px">'+escapeHtml(l.syl)+'</div>'+
        '<p style="font-size:12.8px;color:var(--text-3);line-height:1.55;margin-top:5px">'+l.note+'</p>'+
      '</div>';
    }).join("")+
    '<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line)">'+
      '<div style="font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);margin-bottom:8px">When you will hear it</div>'+
      s.occasions.map(function(o){
        return '<div style="display:flex;gap:10px;padding:5px 0;font-size:13.2px;line-height:1.5">'+
          '<b style="flex:0 0 34%;color:var(--text-1)">'+escapeHtml(o[0])+'</b>'+
          '<span style="color:var(--text-2)">'+escapeHtml(o[1])+'</span></div>';
      }).join("")+
      '<p style="font-size:12.8px;color:var(--text-2);line-height:1.6;margin-top:10px">'+
        'Eleven stanzas were written; four are official (1, 2, 4 and 11). In practice you will almost only ever '+
        'need the first, which is why it is the one broken down above.</p>'+
    '</div>'+
  '</div>';
}

function renderAnthemVideos(){
  var v = ANTHEM_VIDEOS[0];
  if(!v) return "";
  /* Embedded rather than click-to-load: there is only one recording now, and it
     is the one worth watching, so making the learner press a button first only
     put a step in front of it. It still comes from YouTube, so this section
     needs a connection and can break if the upload disappears. */
  return '<div class="card" style="padding:20px 22px;margin-bottom:16px">'+
    '<div class="section-eyebrow" style="margin-bottom:6px">Sung version</div>'+
    '<h3 style="font-size:18px;margin-bottom:12px">Hearing it with the words</h3>'+
    '<div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/'+v.id+'?rel=0" '+
      'title="'+escapeHtml(v.title)+'" frameborder="0" allowfullscreen loading="lazy" '+
      'allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"></iframe></div>'+
    '<p style="font-size:12.5px;color:var(--text-3);margin-top:10px">'+
      escapeHtml(v.by)+' · <a href="https://www.youtube.com/watch?v='+v.id+'" '+
      'target="_blank" rel="noopener noreferrer">Open on YouTube ↗</a></p>'+
  '</div>';
}

function renderAnthemPlayer(){
  return '<div class="card" style="padding:20px 22px;margin-bottom:16px">'+
    '<div class="section-eyebrow" style="margin-bottom:6px">The melody</div>'+
    '<h3 style="font-size:18px;margin-bottom:6px">Deșteaptă-te, române! — the music</h3>'+
    '<p style="font-size:13.5px;color:var(--text-2);line-height:1.6;max-width:62ch;margin-bottom:16px">'+
      'Music by Anton Pann, words by Andrei Mureșanu, both from 1848. '+
      '<b>Both recordings are instrumental — nobody sings on them.</b> That is not an oversight: the 1848 composition '+
      'is long out of copyright, but every <i>sung performance</i> of it carries its own separate rights, and there is '+
      'no freely licensed one to bundle. Use these for the melody and the tempo, and read the syllable breakdown '+
      'underneath to see exactly where each word falls — that is the part a recording would only let you work out by ear.</p>'+
    ANTHEM_TRACKS.map(function(t){
      return '<div style="padding:12px 0;border-top:1px solid var(--line)">'+
        '<div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin-bottom:6px">'+
          '<b style="font-family:var(--font-display);font-size:15px">'+escapeHtml(t.title)+'</b>'+
          '<span style="font-size:12px;color:var(--text-3)">'+escapeHtml(t.meta)+'</span>'+
          '<span class="badge pine" style="margin-left:auto">public domain</span>'+
        '</div>'+
        '<audio controls preload="none" src="'+t.file+'" style="width:100%;max-width:520px"></audio>'+
        '<p style="font-size:12.8px;color:var(--text-3);line-height:1.55;margin-top:6px;max-width:62ch">'+escapeHtml(t.note)+'</p>'+
      '</div>';
    }).join("")+
    '<p style="font-size:12px;color:var(--text-3);margin-top:12px;padding-top:10px;border-top:1px solid var(--line)">'+
      'Recordings from Wikimedia Commons. The Navy Band performance is a work of the US Government; the Victor Military Band '+
      'recording predates 1926. The 1848 composition and lyrics are long out of copyright.</p>'+
  '</div>';
}

/* Verse: each line paired with its own English directly underneath, and its own
   play button. A single prose translation under a poem forces the reader to
   work out which clause answers which line, and in the anthem — inverted word
   order, 1848 vocabulary — that mapping is not recoverable by guessing. */
function renderVerse(r){
  var lines = r.ro.split("\n");
  var en = r.lineEn || [];
  var shown = session.revealed["read_"+r.id];
  var body = lines.map(function(line, i){
    if(!line.trim()) return '<div style="height:14px"></div>';
    return '<div class="verse-line">'+
      '<div class="verse-ro">'+glossRun(line, r.glossary)+
        ' '+audioButton(line,{small:true,label:false})+'</div>'+
      (shown && en[i]? '<div class="verse-en">'+escapeHtml(en[i])+'</div>' : '')+
    '</div>';
  }).join("");
  var cov = glossCoverage(r.ro);
  return (r.format==="anthem" ? renderAnthemVideos() + renderSingingGuide() + renderAnthemPlayer() : "")+
  '<div class="card" style="padding:22px 24px">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap">'+
      '<div><b style="font-family:var(--font-display);font-size:17px">'+escapeHtml(r.title)+'</b>'+
      '<div style="font-size:12px;color:var(--text-3)">'+escapeHtml(r.format)+' · '+r.wordCount+' words</div></div>'+
      '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">'+
        readingNav(r)+
        audioButton(lines.filter(function(l){return l.trim();}),{label:"Read aloud",speedControl:true})+
      '</div>'+
    '</div>'+
    (en.length
      ? '<div style="margin-bottom:12px">'+
        '<button class="btn secondary sm" data-action="revealLine" data-toggle="1" data-key="read_'+r.id+'">'+
          (shown? "Hide the line-by-line English" : "Show the English line by line")+'</button></div>'
      : '')+
    '<div class="verse">'+body+'</div>'+
    '<div style="font-size:12.5px;color:var(--text-3);margin-top:12px">Click any word for its meaning. '+cov.pct+'% of this text is glossed.</div>'+
  '</div>';
}

function renderReading(r){
  if(r.format==="anthem" || r.format==="verse" || r.lineEn) return renderVerse(r);
  var toks = r.ro.split(/(\s+)/);
  var words = toks.map(function(tok, ti){
    var clean = tok.replace(/[.,!?;:()"„”\n]/g,"");
    if(!clean.trim()) return tok.replace(/\n/g,"<br>");
    // Numerals, percentages and lone punctuation are not words — leave inert.
    var numHtml = numberToken(tok, toks[ti+2]);
    if(numHtml) return numHtml;
    if(/^[\d—–\-]+%?$/.test(clean)) return escapeHtml(tok);
    var g = r.glossary && Object.keys(r.glossary).find(function(k){ return normLoose(k)===normLoose(clean); });
    if(g) return '<span class="link-word" data-action="glossWord" data-word="'+escapeHtml(g)+'" data-def="'+escapeHtml(r.glossary[g])+'">'+escapeHtml(tok)+'</span>';
    /* Words with no gloss are still clickable but not underlined, so the
       dotted line is a promise the app can keep rather than a guess. */
    var known = !!glossLookup(clean);
    return '<span class="link-word'+(known?'':' link-word-unknown')+'" data-action="glossWord" '+
      'data-word="'+escapeHtml(clean)+'" data-def="">'+escapeHtml(tok)+'</span>';
  }).join("");
  var cov = glossCoverage(r.ro);
  var shown = session.revealed["read_"+r.id];
  return '<div class="card" style="padding:22px 24px">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px">'+
      '<div><b style="font-family:var(--font-display);font-size:17px">'+escapeHtml(r.title)+'</b>'+
      '<div style="font-size:12px;color:var(--text-3)">'+escapeHtml(r.format)+' · '+r.wordCount+' words</div></div>'+
      '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">'+
        readingNav(r)+
        audioButton(sentencesOf(r.ro),{label:"Read aloud",speedControl:true})+
      '</div>'+
    '</div>'+
    '<div style="font-family:var(--font-display);font-size:16.5px;line-height:1.75">'+words+'</div>'+
    '<div style="font-size:12.5px;color:var(--text-3);margin-top:10px">Click any word for its meaning. '+
      '<span title="Underlined words resolve to a course entry, including inflected forms">'+cov.pct+'% of this text is glossed.</span></div>'+
    '<hr class="rule" style="margin:16px 0">'+
    (shown? '<div style="font-size:14px;color:var(--text-2);line-height:1.6"><b style="color:var(--text-1)">Translation.</b> '+escapeHtml(r.en)+'</div>'
          : '<button class="btn secondary sm" data-action="revealLine" data-key="read_'+r.id+'">Show English translation</button>')+
  '</div>';
}
