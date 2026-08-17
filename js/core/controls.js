/* Drumul spre Romana — small interactive controls.
 *
 * Extracted verbatim from index.html. Both helpers here return the markup for
 * a control and nothing else: the behaviour arrives later, through the
 * data-action delegation in index.html.
 *
 * That separation is the reason audioButton lives here rather than with the
 * audio runtime. It emits data-action="playAudio" and data-action="setSpeed"
 * and never references Speech, AUDIO_ASSETS or assetFor — it does not know how
 * audio is produced, only how to ask for it. Its only dependencies are
 * escapeHtml, iconPlay and state.settings.audioSpeed, all already global.
 *
 * DIACRITICS sits with diacriticBar because it is its only consumer. The order
 * of those five characters is the order of the buttons a learner sees, so it
 * is load-bearing, not incidental.
 */
"use strict";

/* text may be a string, or an array of lines to play back to back. */
function audioButton(text, opts){
  opts=opts||{};
  var size = opts.small? " small":"";
  var label = opts.label!==false ? (opts.label||"Listen") : "";
  var isSeq = Object.prototype.toString.call(text)==="[object Array]";
  var payload = isSeq ? JSON.stringify(text) : String(text);
  var aria = isSeq ? "Play all "+text.length+" lines" : "Play Romanian audio: "+text;
  return '<button type="button" class="audio-btn'+size+'" data-action="playAudio" '+
    (isSeq? 'data-seq="'+escapeHtml(payload)+'"' : 'data-text="'+escapeHtml(payload)+'"')+
    ' aria-label="'+escapeHtml(aria)+'">'+iconPlay()+(label? '<span>'+escapeHtml(label)+'</span>':'')+'</button>'+
    (opts.speedControl? '<span class="speed-row">'+[0.65,0.8,1,1.2].map(function(s){ return '<button data-action="setSpeed" data-speed="'+s+'" class="'+(state.settings.audioSpeed===s?"active":"")+'">'+s+'×</button>'; }).join("")+'</span>' : '');
}

var DIACRITICS = ["ă","â","î","ș","ț"];
function diacriticBar(fieldKey){
  return '<div class="diacritic-bar" role="group" aria-label="Insert Romanian characters">'+
    DIACRITICS.map(function(c){
      return '<button type="button" data-action="insertChar" data-char="'+c+'" data-target="'+escapeHtml(fieldKey)+'" aria-label="Insert '+c+'">'+c+'</button>';
    }).join("")+'</div>';
}
