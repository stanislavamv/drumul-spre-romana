# The audio pipeline

6,177 MP3 clips, ~92 MB, covering every Romanian string a learner can click.

Neither `audio/` nor the generated `audio-manifest.js` is in the repository —
both are build artefacts. A fresh clone runs with no audio until the pipeline
below is run; `index.html` loads the manifest with
`onerror="window.AUDIO_MANIFEST=null"` so this degrades to silence rather than
a broken page.

## Why clips instead of browser TTS

Two attempts failed before this one, and both failures are worth recording so
nobody repeats them.

**Browser speech synthesis.** `speechSynthesis` only has a Romanian voice if the
user's OS ships one. Most Windows installs do not. Without it the browser
happily reads Romanian with an English voice — `ceașcă` as "chesska" — which
actively teaches wrong pronunciation. Worse than silence.

**Fetching Google TTS from the page.** `translate_tts` returns HTTP 200 and
`audio/mpeg` to a normal HTTP client, but from a browser it returns an HTML
error page and the `<audio>` element reports `MEDIA_ELEMENT_ERROR` code 4. The
endpoint rejects requests carrying `Sec-Fetch-Site: cross-site` and a browser
`Origin`. Those headers are forbidden to JavaScript, so this cannot be worked
around in-page. Verified it was not a sandbox restriction by loading an external
image and MP3 from the same context, both of which worked.

So clips are fetched ahead of time from a non-browser client. The side benefit
is that the finished course plays audio **offline**, with no runtime dependency
on Google at all.

## The pipeline

```bash
python tools/extract_strings.py
python tools/fetch_audio.py tools/ro-strings.json
```

`extract_strings.py` scans the datasets in `js/data/*.js` for everything that
gets a play button: `ro`, `inf`, `audio`, `answer`, `model` fields, every
conjugation cell, match pairs, reading sentences, dialogue lines, **and every
individual word**, since click-to-gloss speaks single words.

That last point was a bug once: the extractor emitted phrases but not their
words, so clicking a word in a sentence opened a silent popup — the exact moment
a learner most wants to hear it. Coverage is now 100%.

**Verse readings are extracted line by line, not sentence by sentence.** Prose
readings play through `sentencesOf()`, so sentence-level clips are what they
need. `renderVerse()` — anything with `format:"anthem"`, `format:"verse"`, or a
`lineEn` field — instead plays one clip per *line*. The anthem's lines mostly
end in commas, so sentence splitting glued them into pairs and no single line
was ever emitted; fourteen of its sixteen lines had no clip at all. On a machine
with a Romanian voice installed those lines quietly fell through to
`speechSynthesis`, which is why it looked like a voice inconsistency rather than
missing audio — and on a machine without one they were simply silent. The
extractor now walks verse records separately and adds each line.

Exercise prompts and options are filtered through `looks_romanian()` so English
instructions are not sent for synthesis.

`fetch_audio.py` downloads each string, chunking anything over 190 characters on
sentence then clause then word boundaries, and concatenating the MPEG frames.
It is single-threaded with a 1.1–2.4 s delay, skips clips already on disk, and
is safe to interrupt and resume. Failures are written to `tools/failed.json` for
`--retry-failed`, and that file is **deleted** on a clean run — leaving a stale
one made a finished fetch look broken.

`fetch_audio.py` rewrites `audio-manifest.js`, which maps `normLoose(text)` to a
clip path — currently 6,993 entries, 383 KB. It is generated; never edit it by
hand.

The mapping is built from **`tools/ro-strings.json` — the full extract — not
from the list handed to the run**, intersected with the clips actually on disk.
This matters more than it sounds: see the third trap below. A run may pass extra
strings that are not in `ro-strings.json` yet (a hand-made recording, or a fetch
done before the extractor was re-run) and those are unioned in.

`tools/build_manifest.py` rebuilds the manifest on its own, without downloading
anything. It calls the same `write_manifest()`, so the two cannot drift apart,
and it passes `force=True` because rebuilding from the full extract is the
recovery path when the manifest is already wrong.

## Key agreement

The Python `norm_key()` must mirror the JavaScript `normLoose()` exactly: unify
cedilla to comma-below, lowercase, strip punctuation, collapse whitespace, strip
diacritics. If these drift, clips exist on disk but are never found. Change one,
change the other.

## Licensing

**The clips are Google Translate TTS output. They are not licensed for
redistribution.**

Fine for personal study. Not fine to publish. See `GITHUB.md` — this is the
single biggest blocker to making the repository public, and the plan there
covers the options.

## Three traps this pipeline has already hit

**Glossary values are English — do not fetch them.** `extract_strings.py` used to
walk every quoted string inside a `glossary:{...}` block. Those blocks map a
Romanian headword to an English definition, so that rule took both sides and
sent 349 English phrases ("I do not regret it", "Kind regards", "abroad") to a
Romanian TTS endpoint. Nothing ever played them — `glossWord` speaks the
headword, not the definition — but they were a twelfth of the download budget
against an endpoint this script is deliberately gentle with. The extractor now
matches `key:value` pairs and keeps only the key.

A related check worth repeating if the extractor changes again: because the
manifest is keyed by `normLoose()`, which is diacritic-blind, an English string
can collide with a Romanian one — English *in* and Romanian *în* produce the
same key. Auditing the 349 leaked strings turned up exactly three collisions
(`pot`, `specialist`, `delta`), all harmless, because every clip is fetched with
`tl=ro` and those three are spelled identically in both languages. A collision
on a word that is *not* spelled identically would be a real defect.

**Fetching a subset used to silently delete the rest of the manifest.**
`write_manifest()` was documented as regenerating "from whatever is on disk",
but it actually iterated the string list passed to that run. Fetching sixteen
anthem lines therefore rewrote the manifest with sixteen entries, down from
about 6,981, and muted every other clip in the course. Nothing failed: the fetch
reported success, the manifest write reported success, the page loaded, the play
buttons rendered. Only the audio was gone.

It now builds from `ro-strings.json` as described above, and refuses to write a
manifest that maps less than 90% of what the current one does:

```
REFUSING to write audio-manifest.js.
  it currently maps 6993 clips; this run would map only 16.
```

A genuine shrink — content really was removed — is allowed with
`--force-manifest`. Reach for that only after confirming `ro-strings.json` is
current, because a stale extract produces exactly the same symptom.

**The manifest is cached, and a stale one looks exactly like missing audio.**
`audio-manifest.js` is pulled in with a plain `<script src>`. After a
regeneration the browser will keep serving its cached copy, so the page reports
words as having no clip while the clip sits on disk — a 74% coverage reading
that was really 100%. `write_manifest()` now hashes the file and stamps
`index.html` with `audio-manifest.js?v=<hash>`, so the URL changes if and only
if the content does. Reruns that change nothing leave the tag alone, so this
does not churn the diff.
