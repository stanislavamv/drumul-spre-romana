# Drumul spre Română

A self-contained Romanian course for English speakers, A1 through B1, plus
citizenship preparation, I.L.R. exam preparation, and a register/slang track.
No build step, no server, no framework, no dependencies.

Open `index.html` in a browser. That is the whole install procedure.

---

## What it is

A structured course, not a vocabulary drill app. Lessons run through stages —
context, vocabulary, grammar, guided practice, listening, reading, production,
review — and every answer, right or wrong, gets an explanation rather than a
bare tick.

| | |
|---|---|
| Courses | 4 |
| Levels | 9 |
| Units | 69 — every content unit built; the 8 remaining are checkpoints and exams, which generate their questions |
| Lessons | 89 |
| Exercises | 360 across 13 types |
| Vocabulary | 600 entries |
| Verbs | 190, fully conjugated, verified against Wiktionary |
| Dialogues | 37 |
| Reading texts | 39, from 40-word notes to 658-word essays |
| Grammar articles | 41 |
| Media items | 6 embedded videos |
| Audio clips | 6,177 (~92 MB, not in the repo) |

### Four tracks, one engine

- **`cefr`** — the main A1–B1 course. Six levels, 47 content units.
- **`civic`** — citizenship and oath preparation: the oath, the anthem, the
  constitution, geography, history, the interview.
- **`ilr`** — preparation for the Institutul Limbii Române B1 certification,
  built on the sample papers the institute publishes itself, with a three-paper
  mock exam.
- **`register`** — how Romanians actually talk: fillers, short reactions, slang,
  texting without diacritics, and an opt-in unit on swearing.

Tracks are just a `course` field on a level, so they share every page, the SRS,
the mistake notebook and the progress model.

---

## Running it

```bash
python -m http.server 8777
```

Then open `http://localhost:8777/index.html`.

Opening `index.html` directly off disk should also work. The CSS and JS are
pulled in with plain `<link>` and `<script src>` tags, which browsers allow on
`file://` — unlike `fetch`, `XMLHttpRequest`, ES modules and service workers,
none of which are used. It has not been verified on every browser, and note that
`file://` pages share one `localStorage` origin, so progress would not be
isolated from other local pages. The server is the safer route.

### Regenerating audio

Audio is pre-rendered to MP3 rather than synthesised in the browser. See
[`docs/AUDIO.md`](docs/AUDIO.md) for why, and for the two-command pipeline.

```bash
python tools/extract_strings.py          # scan index.html for Romanian strings
python tools/fetch_audio.py tools/ro-strings.json
```

Both are resumable and safe to re-run; existing clips are skipped.

### Checking the verb tables

Most conjugations are generated from an infinitive plus a class. That is only
as good as the class tag, so the tables are checked against Wiktionary rather
than trusted:

```bash
python tools/verify_verbs.py             # all 190
python tools/verify_verbs.py "a zice"    # or just one
```

This has already caught real errors — see *Design commitments* below.

---

## Documentation

| Document | What's in it |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Data model, rendering loop, answer checking, how to add content |
| [`docs/CONTENT.md`](docs/CONTENT.md) | Curriculum inventory, what's built, what isn't |
| [`docs/AUDIO.md`](docs/AUDIO.md) | The audio pipeline and why it works the way it does |
| [`docs/GITHUB.md`](docs/GITHUB.md) | Publication plan — **read before making this public** |
| [`docs/TECH_DEBT.md`](docs/TECH_DEBT.md) | Known defects parked for later, with what fixing each involves |
| [`CLAUDE.md`](CLAUDE.md) | Working notes for AI assistants on this codebase |

---

## Design commitments

These are decisions with reasons behind them, not preferences. Changing one
means changing the thing it was protecting against.

**Every answer gets an explanation.** A bare ✗ teaches nothing. Wrong answers
say what was wrong with *that* answer, not just what the right one was. All 360
exercises have one; there is a check for this.

**Answers are graded, not binary.** `correct` / `almost` / `unnatural` /
`incorrect` / `submitted`. "Grammatically possible but no Romanian would say
it" is a real category and the learner is told which one they hit.

**Ungradeable answers are excluded from the score, not counted wrong.** Free
writing returns `submitted`, which sits outside the denominator. Counting it as
a miss once capped every lesson containing a writing task below the mark needed
to complete it.

**Options are shuffled per attempt.** Repeating a test otherwise teaches answer
positions instead of Romanian. This was a real reported bug, not a hypothetical.

**Reading questions cannot be answered by keyword-matching.** The correct
option never reproduces the text's wording; at least one distractor does. This
came directly from a user noticing the questions were testing scanning skill
rather than comprehension.

**Free writing is never marked "Correct".** An agreement checker catches what it
can and says plainly what it did not check. Silently passing three errors is
worse than admitting the limit.

**The app never mispronounces Romanian.** If no clip exists and no Romanian
system voice is installed, it stays silent rather than reading Romanian with an
English voice. Where that happens the interface says so rather than showing a
play button that does nothing.

**Generated grammar is never guessed.** The conjugation engine produces a
singular imperative only for the classes where the rule actually holds. For
classes II–IV the form is lexically determined — `scrie!` but `mergi!`, and
`zi!`, `du!`, `adu!` shorten irregularly — so it must be declared per verb. An
audit caught the engine inventing `zici!`, `pui!` and `deschizi!`, none of which
are Romanian.

---

## Known limits

- **Author mode is a preference, not access control.** A checkbox in Settings
  that unlocks every unit. It deliberately has no password: any check would run
  in the learner's own browser against a value in the same file, so a login box
  would only invite putting something private behind a lock that cannot refuse
  anyone.
- **Progress is per-browser.** `localStorage`, with JSON export and a paste-able
  transfer code. No accounts, no sync — there is no server to hold them.
- **Audio is Google Translate TTS.** Good enough for study, not licensable for
  redistribution — see `docs/GITHUB.md`.
- **Media transcripts are learner-supplied.** The course ships no transcripts
  for the embedded videos, because writing out words nobody here has checked
  against the audio would hand the learner a script to memorise that might be
  wrong.
- **`index.html` is 282 KB.** Extraction into `js/` and `css/`
  has started — utilities, persistent state, activity tracking and mastery are
  out, and the content arrays now live in `js/data/*.js` — but the page renderers are still inline, and they
  are the bulk of it. See `docs/ARCHITECTURE.md` for what has moved and what
  has not.
- **A fresh clone has no audio.** `audio/` and `audio-manifest.js` are both
  gitignored, so the app loads silently until the pipeline is run. This is
  deliberate — see `docs/GITHUB.md`.
