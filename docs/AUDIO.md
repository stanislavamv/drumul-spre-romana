# The audio pipeline

4,703 MP3 clips, ~62 MB, covering every Romanian string a learner can click.

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

`extract_strings.py` scans the data region of `index.html` for everything that
gets a play button: `ro`, `inf`, `audio`, `answer`, `model` fields, every
conjugation cell, match pairs, reading sentences, dialogue lines, **and every
individual word**, since click-to-gloss speaks single words.

That last point was a bug once: the extractor emitted phrases but not their
words, so clicking a word in a sentence opened a silent popup — the exact moment
a learner most wants to hear it. Coverage is now 100%.

Exercise prompts and options are filtered through `looks_romanian()` so English
instructions are not sent for synthesis.

`fetch_audio.py` downloads each string, chunking anything over 190 characters on
sentence then clause then word boundaries, and concatenating the MPEG frames.
It is single-threaded with a 1.1–2.4 s delay, skips clips already on disk, and
is safe to interrupt and resume. Failures are written to `tools/failed.json` for
`--retry-failed`, and that file is **deleted** on a clean run — leaving a stale
one made a finished fetch look broken.

Both scripts rewrite `audio-manifest.js`, which maps `normLoose(text)` to a clip
path. The manifest is generated; never edit it by hand.

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
