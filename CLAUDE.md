# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A Romanian course for English speakers, A1–B1, plus citizenship, I.L.R. exam
and register tracks. Vanilla JS, no build step, no dependencies, no framework.

**Do not propose React, Vite, npm or a bundler.** This machine has no Node
toolchain, and running without a build step is the point: the course works
offline from a file and will still run in ten years. Work with it.

Layout is **part-extracted**. `css/app.css`, eight `js/data/*.js` content
files and nine `js/core` + `js/features` modules are out; `index.html` is now
282 KB and holds the page renderers, the `Actions` map, answer checking, the
gloss index, speech and the conjugation engine. Files load as plain
`<script src>` in dependency order sharing one global scope — data first, then
`utils.js` → `state.js` → `session.js` → `router.js` → `fields.js` →
`scroll.js` → features → inline. A new file means a new tag in the right
position; nothing warns you if the order is wrong.

## Commands

```bash
python -m http.server 8777          # serve, then open /index.html
python tools/check_content.py       # dangling ids, missing explanations — RUN AFTER EVERY CONTENT EDIT
python tools/check_syntax.py        # localises a parse error to a line
python tools/extract_strings.py     # collect Romanian strings needing audio
python tools/fetch_audio.py tools/ro-strings.json    # download clips, rebuild manifest (~2h cold)
python tools/verify_verbs.py        # cross-check conjugations vs Wiktionary (~12 min, 190 requests)
```

## Documentation

`docs/ARCHITECTURE.md` for the data model and engine. `docs/CONTENT.md` for
curriculum status. `docs/AUDIO.md` for the pipeline. `docs/GITHUB.md` before any
thought of publishing.

## Traps that have already caused bugs

These are not hypotheticals. Each one shipped.

**`\b` is ASCII-only in JS.** `/\bîmi/` never matches. Tokenise manually for any
word-boundary logic over Romanian.

**Ids must be ASCII.** A vocab id written `b_atenție` and referenced
`b_atentie` renders a blank stage with no error. `check_content.py` catches it.

**New input actions need adding to `INPUT_DRIVEN`.** Otherwise the control
renders, does nothing, and reports nothing. This has happened twice — typed
answers silently discarded, then a checkbox.

**Generated exercises need `findExercise`, not `exerciseById`.** The latter only
sees static data, so anything generated at runtime becomes unsubmittable.

**Never state in the DOM.** Full re-render on every change; anything typed or
selected must live in `session`.

**Order of data arrays is not what you expect** — `COURSES` precedes `LEVELS`.
Anything parsing regions of the file must look up the end marker *after* the
start, or it slices backwards into nothing. This bit `check_content.py` itself:
it reported *every* lesson as having a dangling level until the region lookup
was fixed.

**The Python tools parse the data textually, and depend on its ORDER.** The
content datasets live in `js/data/*.js`; `tools/_sources.py` concatenates them
in document order so the region markers in `check_content.py`, `check_reuse.py`,
`extract_strings.py` and `verify_verbs.py` slice the spans they expect. Moving a
dataset between files, or reordering `DATA_FILES`, silently changes what those
tools scan — they will keep exiting 0 while looking at the wrong text.

**Extracted JS and CSS are not cache-busted — only `audio-manifest.js` is.** Edit
`utils.js` or any other `js/`/`css/` file and the browser may keep running the
old copy, with no error. It looks exactly like the edit doing nothing. Hard
reload (Ctrl+Shift+R) before concluding a change is broken; this has already
cost two rounds of debugging. See `docs/TECH_DEBT.md`.

**Python scripts must force UTF-8 stdout.** Windows consoles are cp1252 and
cannot encode `ș`/`ț`; a script dies reporting the problem it found.

**Imperatives are declared, not generated,** for classes II–IV — the form is
lexical (`scrie!` but `mergi!`; `zi!`, `du!`, `adu!` shorten). The engine once
invented `zici!`, `pui!` and `deschizi!`. If you add a verb, check its
imperative rather than trusting the output.

**`audio/` and `audio-manifest.js` are gitignored build artefacts.** A clone has
no audio until the pipeline runs. Do not "fix" the missing manifest by
committing it.

## Content rules

These come from user feedback and are not stylistic preferences.

- **Every exercise needs `explain`.** A bare ✓/✗ teaches nothing. Wrong answers
  explain what was wrong with *that* answer.
- **Reading questions must not be answerable by keyword-matching.** The correct
  option never reproduces the text's wording; at least one distractor does.
- **Free writing is never graded "Correct"** — use `submitted`, and say what was
  not checked.
- **Never let the app read Romanian in an English voice.** Silence instead, with
  a disabled play button that explains why.
- **Options shuffle per attempt**, or repeat testing teaches answer positions.
- **Label register.** Colloquial and regional usage is marked as such.

## Verification

Automated route sweeps catch total breakage. They do **not** catch a question
answerable without reading the text, a grader passing a wrong answer, or a
pedagogically empty exercise — every one of those bugs here was found by a human
looking at the screen. After content work, open the lesson and click through it.

Do not report content as complete without running `check_content.py` and loading
the affected pages.
