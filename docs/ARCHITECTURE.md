# Architecture

Vanilla ES5-flavoured JavaScript. No framework, no build step, no dependencies,
no package manager.

That is a deliberate constraint, not an accident: the machine this was built on
has no Node toolchain, and the result is a course that still runs in 2035
without a bundler existing. The cost is that there is no type checking and no
module system — every file shares one global scope, in load order.

## Where things are

The project began as a single 10,000-line `index.html`. That became unpleasant
to edit, so extraction into `js/` and `css/` began — and is now essentially
complete. What's left inline is a thin wiring layer, not a "half."

```
index.html           script tags, event-delegation wiring, two debug/build
                      hooks, the boot call (446 lines)
js/data/*.js          the content datasets (8 files, ~732 KB)
css/app.css           design tokens, both themes, all component CSS (414 lines)
js/core/*.js          state, routing, rendering, speech, and the smaller
                       DOM-facing utilities (14 files)
js/features/*.js      everything content-facing — pages, actions, grading,
                       SRS, the gloss index, the conjugation engine (16 files)
audio-manifest.js    generated: normalised Romanian text -> clip path (gitignored)
audio/               6,177 pre-rendered MP3s (gitignored)
tools/               Python build scripts, not shipped to the browser
docs/                this documentation
```

**Still inline in `index.html`:** the event-delegation wiring (`INPUT_DRIVEN`
and the click/input/change/keydown listeners that dispatch to `Actions`), two
debug/build hooks (`__verbAudit` for checking generated conjugations,
`__roAudioStrings` for `extract_strings.py`), and the `render()` boot call.
Everything else named in earlier drafts of this doc — the render loop, page
functions, the `Actions` map itself, answer checking, the gloss index, speech,
the conjugation engine — has moved to `js/core`/`js/features`.

### Load order matters

Scripts are plain `<script src>` tags in `index.html`, loaded in dependency
order and sharing one global scope. Roughly: `audio-manifest.js` → the eight
`js/data/*.js` files → core primitives (`utils.js`, `state.js`, `session.js`,
`router.js`, `fields.js`, `scroll.js`, `lookup.js`, `icons.js`,
`navigation.js`) → features built on those (`activity.js` through
`grading.js`, then `controls.js`, `exercise-render.js`, `topbar.js`,
`chrome.js`, `session-runner.js`, `reading.js`) → `render.js` and
`speech.js` → the last consumers (`media.js`, `pages-helpers.js`,
`pages.js`, `action-helpers.js`, `actions.js`) → the inline wiring script.

**`index.html`'s own tags are the source of truth for this, not this
document.** Each one carries a comment explaining what it needs and why it
sits where it does — that comment trail stayed accurate while this section
of this file quietly went stale. Read them top to bottom before adding a new
one, rather than trusting a summary here to still match reality.

The manifest is loaded with `onerror="window.AUDIO_MANIFEST=null"` so a clone
without audio degrades to silence rather than a hard failure.

There is no bundler and no module system, so a new file means a new
`<script src>` tag in the right position. Nothing will warn you if you get the
order wrong — you get an undefined-function error at load.

### Inside `index.html` now

| Region | Contents |
|---|---|
| `<head>` | One `<link>` to `css/app.css` |
| `<body>` | `#root`, then every `<script src>` tag — data, core, features |
| Inline script | Event delegation, `__verbAudit`, `__roAudioStrings`, `render()` |

The boundary between data and engine matters: the Python tools parse the data
**textually**, not by executing it. The content datasets now live in
`js/data/*.js`, and `tools/_sources.py` concatenates them **in document order**
to rebuild the text those tools slice with adjacency markers such as
`region("var VOCAB", "var DIALOGUES")`. That order is load-bearing: moving a
dataset between files, or reordering `DATA_FILES`, changes what the tools see
without changing their exit code. Keep `DATA_FILES` in step with the `<script>`
tags in `index.html`.

---

## Data model

Content is data, not markup. A lesson is a list of typed sections; the renderer
switches on `type`.

```js
{id:"l_a2_2u7l1", unitId:"a2_2_u7", levelId:"a2_2", order:1,
 title:"Povești din trecut", titleEn:"Stories from the past",
 objective:"Tell a story: background in the imperfect, events in the perfect compus.",
 sections:[
   {type:"context",    dialogueId:"d_a2_2u7", note:"..."},
   {type:"vocab",      vocabIds:["b_odata","b_dintrodata"]},
   {type:"grammar",    topicId:"g_imperfect", intro:"..."},
   {type:"contrast",   leftLabel:"...", rightLabel:"...", pairs:[[...]]},
   {type:"practice",   exerciseIds:["b361","b362"]},
   {type:"production", exerciseIds:["b363"]},
   {type:"review",     exerciseIds:["b361","b362"]}
 ]}
```

Section types: `context`, `input`, `vocab`, `grammar`, `contrast`, `culture`,
`practice`, `listening`, `reading`, `production`, `review`.

### Cross-references are by id and are not validated at runtime

A typo in `vocabIds` renders an empty stage rather than throwing. Run the
reference checker (below) after any content edit — this has already caught a
real bug where a vocab id was written `b_atenție` and referenced `b_atentie`.

**Keep every id ASCII.** Romanian text belongs in the `ro` field, never the id.

---

## Exercises

13 types, all sharing one submit/verdict/explanation path:

`mcq` `fill` `produce` `reading_q` `match` `error_fix` `trans_en_ro`
`transform` `transcribe` `build` `conjugate` `dictation` `minimal_pair`

Every exercise carries an `explain` string. This is enforced by convention and
checked by `tools/check_content.py`; an exercise without one is a bug.

### Verdicts

`checkAnswer()` returns one of five verdicts rather than a boolean:

| Verdict | Meaning |
|---|---|
| `correct` | Fully natural Romanian |
| `almost` | Right idea, minor slip — diacritic, agreement, spelling |
| `unnatural` | Grammatical but not what a Romanian would say |
| `incorrect` | Meaning or grammar significantly wrong |
| `submitted` | Free writing — recorded, explicitly *not* graded correct |

`submitted` exists because free writing cannot be reliably graded. Marking it
"Correct" once passed a paragraph containing three agreement errors, which is
how the category came to exist.

### Normalisation

Four functions, deliberately distinct:

- `unifyRomanian()` — cedilla forms (`ş ţ`) to comma-below (`ș ț`). Both exist
  in Unicode; Romanian uses comma-below, but keyboards and pasted text produce
  cedilla constantly.
- `norm()` — strict: case, punctuation, whitespace.
- `normLoose()` — also strips diacritics. Used for audio keys and for the
  early-level rule that a missing diacritic is a warning, not a failure.
- `stripDiacritics()` — the primitive the other two build on.

**`\b` is ASCII-only in JavaScript.** `/\bîmi/` never matches. Any word-boundary
logic over Romanian must tokenise manually. This caused a silent bug where an
agreement checker matched almost nothing.

---

## Rendering

Full re-render on every state change: `render()` rebuilds `#root` from the
current route and state, and there is no virtual DOM or diffing.

This is fine at this scale and removes a whole class of stale-view bugs. It also
means **no state may live in the DOM** — anything the user has typed or selected
must be in `session` or it vanishes on the next render.

### Event delegation

One listener on `document` dispatches `data-action` to the `Actions` map.

**Inputs need explicit wiring.** `INPUT_DRIVEN` lists actions driven by `input`
or `change` rather than `click`. Forgetting to add an action there means the
control renders, does nothing, and reports no error. This has bitten twice —
once with typed answers silently discarded, once with a checkbox.

---

## Spaced repetition

Five states, intervals in days:

```js
SRS_LEVELS    = ["New","Learning","Familiar","Strong","Mastered"]
SRS_INTERVALS = [0, 1, 3, 7, 16, 35]
```

Correct promotes, incorrect demotes to `Learning`. Mastery is tracked per skill
— vocabulary, grammar, listening, reading, writing, pronunciation — so the
dashboard can name weak areas rather than showing one number.

---

## The gloss index

Any Romanian word in the app can be clicked for its meaning. That requires
mapping *inflected* forms back to headwords, built at load from:

- `VOCAB` plurals and definite forms
- every cell of every verb conjugation (190 verbs × ~40 forms)
- reflexive stems
- individual words inside phrases
- `CORE_GLOSS`, a hand-written list of function words
- a verb-stem fallback for unrecognised forms

Numerals are handled separately by `romanianNumber()`, which generates the
spoken form (`1859` → *o mie opt sute cincizeci și nouă*) plus a note on the
rule involved.

---

## Speech

Three-step fallback, and the third step matters:

1. Pre-rendered clip from `AUDIO_MANIFEST`, keyed by `normLoose()`
2. A local Romanian system voice, if one is installed
3. **Silence**

Never an English voice reading Romanian. A learner who hears Romanian in an
English accent learns the wrong pronunciation, which is worse than hearing
nothing. The play button shows a disabled state and says why.

---

## Tools

```bash
python tools/extract_strings.py             # find Romanian strings needing audio
python tools/fetch_audio.py <strings.json>  # download clips, rebuild manifest
python tools/check_content.py               # dangling refs, missing explanations
python tools/check_syntax.py                # brace balance, localises a parse error
python tools/verify_verbs.py                # cross-check conjugations vs Wiktionary
```

`check_content.py` is the one to run after any content edit.

---

## Adding content

1. Add `VOCAB` entries — ASCII id, `ro`, `en`, `pos`, gender/plural for nouns,
   an example sentence.
2. Add `EXERCISES` — unique id, `explain` on every one.
3. Add a `LESSONS` entry with typed sections referencing those ids.
4. Set the unit's `depth` to `"full"`.
5. Run `check_content.py`, then `extract_strings.py` and `fetch_audio.py`.
6. Load the lesson in a browser and click through it.

Step 6 is not optional. Automated sweeps catch total breakage; they do not catch
a question that is answerable without reading the text, or a grader that passes
a wrong answer. Most of the valuable bugs in this project were found by looking
at the screen.
