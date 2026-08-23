/* Drumul spre Romana — the media / shadowing detail view.
 *
 * Extracted verbatim from index.html. Three symbols, not contiguous in the
 * original source but mechanically independent: the trivial per-video
 * transcript lookup, the media detail page body, and the pronunciation-source
 * status panel shown on the listening page.
 *
 * mediaDetail is the reason a learner-supplied transcript is treated
 * differently from course content: almost none of it has a pre-rendered clip,
 * so before rendering a line it checks Speech.statusFor() and shows a real
 * disabled state instead of a play button that would silently do nothing.
 *
 * audioSourcePanel reports on Speech/assetCount — both already global — and
 * has no dependency of its own beyond them and escapeHtml.
 *
 * mediaTranscript is a one-line reader of state.mediaTranscripts, called by
 * mediaCard, PAGES.media's edit/save handlers and mediaDetail itself, all of
 * which remain inline and resolve it as a global.
 *
 * The "use strict" directive is not new — it is the mode this code already
 * ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

/* Transcripts are supplied by the learner, not by this course. Writing out a
   transcript of a video nobody here has watched would mean inventing the words
   a learner then commits to memory — the one place in this app where a
   confident guess would do real damage. So the panel is an editor: paste what
   you hear (or the channel's own subtitles), and it becomes a shadowing script
   with click-to-gloss and line-by-line stepping. Saved per video, locally. */
function mediaTranscript(id){ return (state.mediaTranscripts||{})[id] || ""; }

function mediaDetail(m){
  var script = mediaTranscript(m.id);
  var editing = session.mediaEditing===m.id || !script;
  var lines = script.split(/\n+/).map(function(l){ return l.trim(); }).filter(Boolean);
  return '<button class="btn ghost sm" data-action="go" data-page="media" style="margin-bottom:12px">← All media</button>'+
    '<div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin-bottom:6px">'+
      '<span class="badge accent">'+escapeHtml(m.level)+'</span>'+
      '<span style="font-size:12.5px;color:var(--text-3)">'+escapeHtml(m.channel)+'</span>'+
    '</div>'+
    '<h1 style="font-size:23px;margin-bottom:12px;max-width:60ch">'+escapeHtml(m.title)+'</h1>'+
    '<div class="video-frame" style="margin-bottom:8px">'+
      '<iframe src="https://www.youtube-nocookie.com/embed/'+m.id+'?rel=0'+""+'" '+
      'title="'+escapeHtml(m.title)+'" frameborder="0" allowfullscreen '+
      'allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"></iframe></div>'+
    '<p style="font-size:13px;color:var(--text-2);line-height:1.55;max-width:64ch;margin-bottom:18px">'+escapeHtml(m.note)+'</p>'+

    '<div class="card" style="padding:18px 20px">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px">'+
        '<b style="font-family:var(--font-display);font-size:16px">Shadowing script</b>'+
        (script && !editing? '<button class="btn ghost sm" data-action="editTranscript" data-vid="'+m.id+'">Edit</button>':'')+
      '</div>'+
      (editing
        ? '<p style="font-size:13px;color:var(--text-2);line-height:1.6;max-width:64ch;margin-bottom:10px">'+
            'Paste the transcript here — the channel\'s subtitles, or what you can make out yourself. '+
            'One sentence per line works best. It is saved in this browser and travels with your progress export.<br><br>'+
            '<span style="color:var(--text-3)">This course does not ship transcripts for these videos. Writing out words '+
            'nobody here has verified against the audio would mean handing you a script to memorise that might be wrong — '+
            'so the text is yours to supply.</span></p>'+
          '<textarea data-field="transcript" data-action="typeTranscript" rows="10" '+
            'style="width:100%;font-size:14px;line-height:1.6;margin-bottom:10px" '+
            'placeholder="Mă trezesc la ora șapte.&#10;Mă spăl pe față și mă îmbrac.&#10;Iau micul dejun la opt.">'+escapeHtml(script)+'</textarea>'+
          '<button class="btn sm" data-action="saveTranscript" data-vid="'+m.id+'">Save script</button>'+
          (script? ' <button class="btn ghost sm" data-action="cancelTranscript">Cancel</button>':'')
        : (function(){
            /* A transcript the learner typed is not course material, so almost
               none of it has a pre-rendered clip. Without a local Romanian
               voice installed the app refuses to speak it — correctly, since
               an English voice reading Romanian teaches the wrong sounds — but
               a play button that silently does nothing reads as a broken
               feature. Check each line up front and show the real state. */
            var speakable = lines.filter(function(l){ return Speech.statusFor(l)!=="unavailable"; }).length;
            var silent = lines.length - speakable;
            return '<p style="font-size:12.8px;color:var(--text-3);margin-bottom:'+(silent?'8px':'12px')+'">'+
              lines.length+' line'+(lines.length===1?"":"s")+'. Click any word for its meaning. Play the video and speak along one line at a time.</p>'+
            (silent
              ? '<div style="font-size:12.6px;color:var(--text-2);line-height:1.6;background:var(--accent-soft);'+
                'border-radius:var(--radius-s);padding:10px 12px;margin-bottom:12px">'+
                '<b>'+silent+' of '+lines.length+' line'+(lines.length===1?" has":"s have")+' no playback here.</b> '+
                'The course ships clips only for its own material, and this transcript is yours. Individual '+
                '<i>words</i> usually still play if they appear in the course — click one to hear it. '+
                'For the full lines, use the video: it is the recording you want to imitate anyway.'+
                (Speech.hasNativeVoice()? '' :
                  '<br><br>Installing a Romanian system voice would let your browser read any line aloud. '+
                  'Without one this course stays silent rather than reading Romanian in an English accent.')+
                '</div>'
              : '')+
            '<div class="verse">'+lines.map(function(l,i){
              var canPlay = Speech.statusFor(l)!=="unavailable";
              return '<div class="verse-line" style="display:flex;gap:10px;align-items:flex-start">'+
                '<span class="tabular" style="flex:0 0 26px;color:var(--text-3);font-size:12px;padding-top:5px">'+(i+1)+'</span>'+
                '<div class="verse-ro" style="flex:1">'+glossRun(l, null)+'</div>'+
                (canPlay
                  ? audioButton(l,{small:true,label:false})
                  : '<span class="audio-btn small audio-none" title="No clip for this line — click a word instead, or play the video" aria-hidden="true">'+iconPlay()+'</span>')+
              '</div>';
            }).join("")+'</div>';
          })())+
    '</div>';
}

/* Where pronunciation comes from, stated plainly, with a working switch. */
function audioSourcePanel(){
  var clips = assetCount();
  var localVoices = Speech.romanianVoices();
  var st = Speech.statusFor("");

  var status;
  if(clips){
    status = '<div style="background:var(--pine-soft);color:var(--pine);padding:10px 12px;border-radius:var(--radius-s);font-size:13px">'+
      '<b>Using '+clips+' pre-rendered Romanian clips.</b> Recorded from Google Translate\'s Romanian voice and bundled with the course, so pronunciation is consistent and works offline.'+
      (localVoices.length? '' : ' Anything not covered by a clip stays silent rather than being read in an English voice.')+'</div>';
  } else if(st==="tts"){
    status = '<div style="background:var(--pine-soft);color:var(--pine);padding:10px 12px;border-radius:var(--radius-s);font-size:13px">'+
      '<b>Using a Romanian voice installed on this computer:</b> '+escapeHtml(Speech.voiceName()||"")+'.</div>';
  } else {
    status = '<div style="background:var(--brick-soft);color:var(--brick);padding:10px 12px;border-radius:var(--radius-s);font-size:13px">'+
      '<b>No Romanian pronunciation available yet.</b> Rather than read Romanian aloud in an English voice and teach you the wrong sounds, playback stays silent. '+
      'Run <code>python tools/fetch_audio.py tools/ro-strings.json</code> to download the clips, or install a Romanian voice (see below).</div>';
  }

  return '<div style="margin-top:16px;border-top:1px solid var(--line);padding-top:14px">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
      '<label class="field-label" style="margin:0">Pronunciation source</label>'+
      '<button class="chip" data-action="recheckVoices">Re-check</button></div>'+
    status+
    '<details style="margin-top:12px"><summary style="cursor:pointer;font-size:13px;color:var(--text-2);font-weight:600">Where the audio comes from</summary>'+
      '<div style="font-size:13px;color:var(--text-2);line-height:1.65;margin-top:8px">'+
      '<p style="margin-bottom:8px">Playback tries three sources in order:</p>'+
      '<ol style="margin:0 0 10px;padding-left:18px">'+
        '<li><b>Pre-rendered clips</b> ('+clips+' loaded) — MP3s in <code>audio/</code>, listed in <code>audio-manifest.js</code>. Generated by <code>tools/fetch_audio.py</code> from Google Translate\'s Romanian voice. Google\'s endpoint refuses requests coming from a web page, so the audio has to be fetched ahead of time — which also means it works with no internet connection.</li>'+
        '<li><b>A Romanian voice installed on your computer</b> — covers anything without a clip.</li>'+
        '<li><b>Silence.</b> If neither is available the play button turns red instead of mispronouncing the word. An English voice reading Romanian teaches the wrong sounds, which is worse than no audio.</li>'+
      '</ol>'+
      '<p style="margin-bottom:6px">To swap in real native-speaker recordings later, drop files into <code>audio/</code> and list them in <code>AUDIO_ASSETS</code> at the top of the source — they take priority over everything else, and no lesson content needs to change.</p>'+
      '<p style="margin-bottom:6px"><b>Offline voice on Windows:</b> Settings → Time &amp; language → Language &amp; region → Add a language → Română → tick <i>Text-to-speech</i> → Install. Restart the browser, then press <b>Re-check</b>.</p>'+
      '<p><b>Microsoft Edge</b> also exposes free Romanian neural voices (Emil, Alina) with no install — open this page in Edge and press Re-check.</p>'+
      '</div></details>'+
  '</div>';
}
