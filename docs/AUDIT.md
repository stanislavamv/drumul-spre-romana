# Post-refactor audit

Measured 22 August 2026, against `2f65898`.

Application findings were measured against `b7d8de5`; `2f65898` landed during
the audit and touches only `tools/serve.py`, so every finding below except the
dev-server one is unaffected. The dev-server section was re-measured against
`2f65898` itself.

This is a snapshot, not a standing document. Findings that turn into work belong
in `TECH_DEBT.md`; this file records what was measured, how, and what the
numbers were, so the next audit has a baseline to compare against.

Everything below is a measurement or a reproduction. Where a claim could not be
instrumented it says so.

---

## Scorecard

| Area | Score | The number that drives it |
|---|---|---|
| Performance | 3 / 5 | Load is fine (410 ms); one page re-renders in 169 ms |
| Security | 4 / 5 | 0 unescaped sinks found; no CSP; prototype injection contained |
| Reliability | **1 / 5** | Well-formed bad state bricks the app permanently |
| Architecture | 4 / 5 | 277 globals, 0 collisions; merge logic duplicated |
| Testing | **1 / 5** | 0 JavaScript tests |
| Accessibility | 3 / 5 | 0 unnamed controls; focus lost on every re-render |
| Mobile | 2 / 5 | 71 px horizontal overflow on every page at 375 px |
| Learning quality | 4 / 5 | SRS correct, but the ladder starts at 3 days |
| UX | 3 / 5 | Good in the normal path, no recovery in the failure path |

Two areas score 1. Both are the same shape of problem: the app has no answer for
the case where something has already gone wrong.

---

## Performance

### The architectural question: does everything load upfront?

Yes. All 39 files load before the learner can do anything. But the cost is not
where it looks like it is.

| | |
|---|---|
| JavaScript shipped | 1,515 KB across 39 files |
| — content datasets | 771 KB |
| — audio manifest | 420 KB (7,322 entries) |
| — application code | 324 KB |
| Parse + execute, all data + manifest | **~20 ms** |
| DOMContentLoaded, threaded server | **410 ms** |

Object literals parse fast. 1.17 MB of `VOCAB`, `VERBS`, `EXERCISES` and the
audio manifest compile and execute in about 20 milliseconds, measured by
fetching the concatenated source and timing `eval` on it. Lazy-loading the data
would buy back roughly nothing.

**So the modularisation did not create a loading problem, and splitting further
will not fix one.** The remaining 390 ms is 39 HTTP round trips, not bytes. If
that ever needs to come down, the lever is fewer requests, not fewer kilobytes —
and at 410 ms there is no reason to pull that lever.

### The dev server is still costing 3 seconds, for a different reason than it looks

Three variants, same bytes, same 39 files, same machine:

| `tools/serve.py` variant | DCL | Max queue |
|---|---|---|
| before `2f65898` — single-threaded, HTTP/1.0 | 3,100 ms | 2,747 ms |
| **as committed in `2f65898`** — threaded, HTTP/1.0 | 3,423 ms | 3,066 ms |
| threaded **+ `protocol_version = "HTTP/1.1"`** | **411 ms** | 73 ms |

Total server think time is 28 ms and total download 34 ms. Everything else is
connection setup: `SimpleHTTPRequestHandler` defaults to HTTP/1.0, so each of
the 39 files opens and closes its own TCP connection.

**Threading was necessary and delivered no speedup.** `2f65898` fixed a real
defect — a plain `TCPServer` serves one connection at a time, and a browser
holding a connection open parks the whole server, which is why the page stopped
loading after the first script. But that is a correctness fix. The queueing it
was expected to remove is still there, because 39 serial connection setups cost
the same whether one thread or forty handle them.

The remaining change is one line on the handler:

```python
class Handler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
```

Keep-alive is what collapses 39 connections into a handful, and it is only safe
*because* the server is now threaded — which is exactly the deadlock `2f65898`
describes. The two changes are a pair; only one of them has landed.

This is a development-loop cost, not a learner-facing one, but it is paid on
every reload during content work.

### The vocabulary page is the one real hot spot

Full re-render, median of nine, after warm-up:

| Route | Median | Max | DOM nodes | HTML |
|---|---|---|---|---|
| vocabulary | **169 ms** | 274 ms | 9,204 | 548 KB |
| verbs | 50 ms | 64 ms | 2,730 | 200 KB |
| listening | 22 ms | 25 ms | 1,103 | 150 KB |
| grammar | 12 ms | 13 ms | 538 | 47 KB |
| home | 7 ms | 12 ms | 303 | 22 KB |
| progress | 2 ms | 2 ms | 120 | 7 KB |

The vocabulary page carries a live search box, and the app re-renders everything
on every state change. Simulating a learner typing `casa` and deleting it again:

| Action | Render | Nodes |
|---|---|---|
| page opens, no query | 146 ms | 9,204 |
| type `c` | **95 ms** | 5,628 |
| type `a` | 33 ms | 1,384 |
| type `s` | 8 ms | 149 |
| backspace to `ca` | 27 ms | 1,384 |
| backspace to `c` | 102 ms | 5,628 |
| backspace to empty | **148 ms** | 9,204 |

Every keystroke at the wide end costs about a tenth of a second on a desktop.
A mid-range phone is three to five times slower, which puts the first keystroke
somewhere between 300 ms and 700 ms. That is the difference between a search box
that feels instant and one that feels broken.

Three ways out, cheapest first: debounce the search input by ~120 ms; cap the
unfiltered list and render the rest on demand; or give this one page a
targeted update path instead of the full re-render. The first is a few lines and
removes most of the pain, because the expensive renders are exactly the ones a
fast typist passes straight through.

### Clean passes

**localStorage.** Simulated a fully completed course — every lesson done, all
600 words at Mastered, two years of daily activity, 300 saved mistakes:

| | |
|---|---|
| Serialised size | 183 KB |
| Share of a 5 MB quota | 3.6 % |
| `JSON.stringify` | 0.42 ms |
| `JSON.parse` | 0.49 ms |
| `localStorage.setItem` | 0.50 ms |

The 80 ms debounce in `persist()` is comfortably more than this needs. Largest
contributors are `mistakes` (97 KB) and `vocabSrs` (62 KB), both of which grow
with use but not alarmingly.

**Audio.** Clips are constructed on demand with `new Audio(src)`, one at a time.
The only `<audio>` element in the codebase carries `preload="none"`. Nothing is
fetched until a play button is pressed. 7,696 clips on disk, none of them touched
at load.

---

## Security

Threat model first, because it changes what matters. This is a single-user,
client-side, offline-capable app with no server, no accounts and no shared data.
There is no one to escalate to. The only meaningful attacker is a malicious
*file or transfer code* handed to the learner, and the only meaningful damage is
to that learner's own browser.

Against that model the posture is good.

### What was checked

| Check | Result |
|---|---|
| `innerHTML` assignment sites | 4 total; 2 static literals, 2 dynamic |
| Attribute interpolations without `escapeHtml` | **0** found by pattern scan |
| `eval` / `new Function` | none |
| Inline event handlers | 2 (`onerror` on the manifest tag, `onclick="this.select()"`) |
| External origins | 3 — `youtube-nocookie.com`, `youtube.com`, `ilr.ro` |
| Learner-supplied strings rendered | transcripts, typed answers, mistake entries — all escaped |

`escapeHtml` escapes `& < > " '`, which covers both text and quoted-attribute
contexts. Spot checks confirmed the learner-supplied paths: the transcript
editor escapes into both the `<textarea>` body and the display lines, and
`audioButton` escapes into `data-text` and `aria-label`.

### Prototype pollution: contained, and by design rather than luck

`applyImportedState` and `loadState` both merge with
`Object.assign({}, defaults, saved)`. `JSON.parse` produces `__proto__` as a real
own property, so this is a live question. Tested it:

| | |
|---|---|
| `Object.prototype` globally polluted | **no** |
| Prototype of the merged object changed | yes |
| A gated setting flipped through the prototype | **no** |

The gate holds, and it holds for a structural reason worth keeping: the defaults
object supplies `showProfanity: false` and `unlockAll: false` as *own*
properties, and own properties shadow anything arriving on the prototype. The
merge-over-defaults pattern that exists to protect returning learners from
missing keys also happens to neutralise this. Do not replace it with a plain
assignment.

The residual issue is that an imported file can still set an arbitrary prototype
on a nested state object. Nothing reads through it today. `Object.create(null)`
for the merge target, or deleting `__proto__` before merging, closes it outright.

### CSP is nearly free

Two inline handlers stand between this and a strict `Content-Security-Policy`.
Both are trivially movable: the manifest's `onerror` can become a load check in
script, and `onclick="this.select()"` can join the existing `data-action`
delegation. With those gone the policy is roughly:

```
default-src 'self'; script-src 'self'; style-src 'self';
frame-src https://www.youtube-nocookie.com; img-src 'self' data:;
```

Worth doing before the repository ever goes public, not urgent while it is
private.

---

## Reliability — the finding that matters

**A well-formed progress file with one wrong field type permanently bricks the
app, through a supported user action, with no recovery path.**

Reproduced end to end. The payload is a valid transfer code: valid base64, valid
JSON, correct wrapper shape, one field of the wrong type.

```js
btoa(JSON.stringify({ v:2, at:"…", slim:1, state:{ progress: [] } }))
```

`progress` should be an object; here it is an array. What happens, in order:

1. `codeToState` accepts it — `rehydrateMistakes` only guards `mistakes`.
2. `applyImportedState` merges it. The merge only substitutes the default when a
   value is `undefined` or `null`. A wrong *type* passes straight through.
3. `writeState()` persists it. **The bad state is now on disk.**
4. `render()` is called — which schedules through `requestAnimationFrame`.
5. The try/catch around the import returns. It reports **success**.
6. One frame later `renderApp()` throws
   `TypeError: Cannot read properties of undefined (reading 'l_u1l1')`
   — outside the try/catch, because the callback is asynchronous.
7. `#root` is empty. `document.body.innerText` is empty. The page is blank.
8. The state survives the reload. Every subsequent load is blank.

There is no `window.onerror`, no error boundary, and no recovery UI. The reset
button is on a settings page that cannot render. A learner in this state has
lost everything and has no way to find that out or fix it.

Broader corruption sweep — five well-formed states with one wrong type each,
loaded through `loadState()`:

| Corruption | `loadState` | `renderApp` |
|---|---|---|
| `progress` as array | accepted | **TypeError** |
| `activityDates` as object | accepted | **TypeError** |
| `mistakes` as string | accepted | ok |
| `settings` as number | accepted | ok |
| `vocabSrs` as string | accepted | ok |

Two of five are fatal. `loadState` accepts all five.

How this happens without an attacker: an export from a build where a field's
type later changed, a hand-edited file, a partially written state, or any future
migration that gets a shape wrong. The transfer-code feature exists precisely so
learners can move progress between browsers, which means files do travel.

**Three fixes, in order of value:**

1. **A validator on the merge.** Compare `typeof` and array-ness against the
   default and fall back to the default on mismatch, rather than only on
   `null`/`undefined`. Both merge sites need it — see the duplication note below.
2. **A global error handler.** `window.addEventListener("error", …)` that
   renders a plain recovery screen: what happened, an export button, a reset
   button. This is the difference between a bad import and a lost course.
3. **Validate before persisting.** `applyImportedState` writes and then renders.
   Rendering into a detached node first, and only persisting if that succeeds,
   makes a bad import a rejected import rather than a fatal one.

---

## Architecture

### The flat namespace is holding

| | |
|---|---|
| Globals the app adds to `window` | 280 |
| Top-level declarations across `js/` | 277 |
| Names declared at top level twice | **0** |

No module system, one shared scope, 38 files — and no collisions. That is
discipline, and it is worth stating plainly because it is the thing most likely
to quietly stop being true. A duplicate-declaration scan is cheap and belongs in
CI, precisely so this stays at zero.

*(An earlier pass of this scan reported 123 duplicates. That was a bad regex
matching indented `var` inside function bodies. The real number is zero.)*

### The merge invariant lives in two places

`loadState()` in `js/core/state.js` and `applyImportedState()` in
`js/features/action-helpers.js` implement the same merge-over-defaults algorithm,
independently, with the same `undefined`/`null`-only guard and the same
`Object.assign` nesting rule.

That is why the reliability fix above has to be applied twice, and why it could
be applied once and look done. One shared `mergeOverDefaults(defaults, incoming)`
removes the class of problem.

### One shadowing hazard

`js/features/exercise-render.js:217` declares `var state = ""` inside the
`gapfill` renderer, holding a CSS fragment. It shadows the application's `state`
global for the length of that closure. Harmless today because nothing in the
callback needs the real one — and exactly the kind of thing that stops being
harmless the day someone adds `state.settings.audioSpeed` to it.

### The documentation has drifted

`ARCHITECTURE.md` describes a codebase that no longer exists:

| Claim | Reality |
|---|---|
| `index.html` is 282 KB | **22 KB** |
| Four extracted modules listed | **38** |
| Load order shown as 5 steps | 39 tags |
| "13 exercise types" | 13 static **plus** `gapfill` and `order_lines`, generated |
| Page renderers "still inline in index.html" | in `js/features/pages.js` |

`README.md` repeats the 282 KB figure. `js/core/render.js`'s own header says the
21 page functions are "still assigned inline in index.html".

The two generated types matter more than the count: they are exactly what
`CLAUDE.md` warns about under *"Generated exercises need `findExercise`, not
`exerciseById`"*, and the type list is where someone would look for them.

---

## Testing

One test file in the repository — `tools/test_jsscan.py`, covering a Python
helper. **Zero tests over the JavaScript.** CI runs `check_content.py` (a real
gate) and `check_syntax.py` (informational, always exits 0).

Every behavioural fact in this document was established by hand, in a console,
and none of it is now protected. That includes things already fixed and paid for:
the `__proto__` route crash, the reachable 35-day interval, audio stopping on
route change.

The constraint is no Node toolchain, and that rules out the usual runners. It
does not rule out testing. A single `tests.html` that loads the same 39 script
tags and runs assertions against the loaded globals needs no tooling at all,
opens from disk, and matches how this project already works.

The checks in this audit are the first suite, nearly verbatim:

| Test | What it locks in |
|---|---|
| Render all 21 routes, assert no throw | route smoke — all 21 pass today |
| Assert `PAGES` has the expected 21 keys | catches a page lost in extraction |
| Drive `reviewVocab` through its ladder | intervals, promotion, same-day return |
| Merge five corrupt states, assert survival | the reliability fix, permanently |
| Assert 0 duplicate top-level declarations | the flat namespace stays clean |
| Assert every `js`/`css` tag carries `?v=` | the stamper actually ran |

The last one is a Python check and can join CI immediately.

---

## Accessibility

Fundamentals are genuinely good. On the vocabulary page, the heaviest in the app:

| Check | Result |
|---|---|
| Buttons without an accessible name | **0** of 1,226 |
| Inputs without a label | 0 |
| Images without `alt` | 0 |
| Heading level skips | 0 |
| `main` and `nav` landmarks | present |
| Focusable content inside `aria-hidden` | 0 |
| `:focus-visible` styling | present |

Two real problems, both consequences of the full re-render.

**Focus is lost on every re-render.** `captureField`/`restoreField` preserve the
focused *input* and its caret. Nothing preserves anything else. Measured: focus a
play button, re-render, and `document.activeElement` is `<body>`.

For a keyboard learner that means pressing Enter on an audio button, or
submitting an answer, drops them to the top of the document. The machinery to fix
this already exists and already runs — `restoreField` just needs to capture the
active element generally, not only elements carrying `data-field`.

**No skip link, and 1,227 tabbable elements on one page.** Combined with the
focus loss above, a keyboard user who activates any control on the vocabulary
page has to tab past up to 1,226 controls to get back. A skip link is a few lines
and would help every page.

---

## Mobile

At 375 × 812, **every page overflows horizontally by 71 px.** Not one page — the
shared topbar.

```
viewport   375 px
scrollWidth 446 px
```

Traced to `.topbar-right` (the level pill and streak chip), which ends at x=445.
`.topbar` is a flex row with `gap: 24px`, `.brand` is `white-space: nowrap`, and
below 980 px `.topnav` is hidden — but nothing lets the remaining items shrink,
so the row simply overhangs and the whole document scrolls sideways.

Nothing inside `#root` is at fault, which is why it survived: the page content is
correct and the chrome is not.

Also found: one or two touch targets under the 24 px WCAG 2.2 minimum
(`.teacher-chip` at 68 × 22, `.btn.ghost.sm` at 76 × 21).

The viewport meta tag is correct, the sidebar/menu-button pattern below 980 px
works, and no content element exceeds the viewport. This is one CSS rule away
from being fine.

---

## Learning quality

The SRS was driven through a full lifecycle — six correct, one wrong, two
correct — and behaves as documented:

| | |
|---|---|
| Reaches `Mastered` | yes |
| 35-day interval reachable | yes |
| Wrong answer returns same day | yes |

Both previously recorded defects are genuinely fixed.

**But the ladder has no short rung.** Observed intervals across the whole
lifecycle were 3, 7, 16, 35. The 1-day interval in `SRS_INTERVALS` is written to
`v.interval` only when a word at `New` is answered *wrong* — and that case forces
`due` to today regardless. So no word is ever scheduled one day out.

A word answered correctly for the first time next appears in three days. The
forgetting curve is steepest in the first 24 hours, and a next-day touch is the
highest-value review in most SRS designs. This is a curriculum decision rather
than a bug, but it is currently an implicit one.

**Related:** a lapse demotes one level and a single correct answer restores the
full 35 days. A word failed on Monday and passed on Tuesday is not seen again
until September. Most schedulers treat a lapse as evidence the interval was too
long and rebuild more cautiously.

Both are one-line changes to intent, not to code structure. They deserve a
deliberate answer rather than a default.

---

## UX

Least instrumented of the nine areas; scored on what was observed rather than
measured, and flagged as such.

In the normal path the app is coherent — navigation reachable at every width,
the 21 routes all render, the profanity gate holds across all six scan sites, and
every exercise carries an explanation.

The failure path has nothing in it. The blank page described under Reliability is
the whole experience: no message, no reset, no export. That single gap is most of
this area's score, and fixing it is the same work item.

---

## Prioritised roadmap

Ordered by impact divided by cost. The order is the recommendation.

### 1 — Make bad state survivable
*Reliability 1 → 4. Half a day.*

Validate types in the merge; add a `window.onerror` recovery screen with export
and reset; render into a detached node before persisting an import. Extract the
shared `mergeOverDefaults` while doing it, so the fix lands in both places.

This is the only finding that can cost a learner everything they have done.

### 2 — Finish the dev server: add keep-alive
*One line. 3,423 ms → 411 ms on every reload.*

`2f65898` made the server threaded, which fixed the deadlock but left the load
time unchanged. Adding `protocol_version = "HTTP/1.1"` to the handler is the
half that delivers the speed, and it is only safe now that the threading is in
place. Pure profit, and it makes every subsequent item on this list faster to
work on.

### 3 — Stop the topbar overflowing
*One CSS rule. Fixes every page on every phone.*

Let `.brand` shrink, or hide `.level-pill` and `.streak-chip` below ~420 px.

### 4 — Restore focus, not just fields
*Accessibility 3 → 4. An hour.*

Generalise `restoreField` to the active element. Add a skip link.

### 5 — Debounce the vocabulary search
*Removes a 150 ms stall per keystroke. An hour.*

~120 ms debounce first; only measure again afterwards, because that alone skips
the expensive renders a fast typist passes through.

### 6 — Start `tests.html`
*Testing 1 → 3. A day for the first six tests.*

Zero tooling, no Node, opens from disk. Seed it with the six checks listed above,
which are already written. Add the stamp-coverage check to CI the same day.

### 7 — Decide the short end of the SRS
*A curriculum decision, then one line.*

Whether a first-learned word should return the next day, and whether a lapse
should rebuild more cautiously than it does.

### 8 — Refresh the architecture docs
*Half a day.*

`ARCHITECTURE.md` and `README.md` both describe a 282 KB `index.html` that is now
22 KB, and a four-module layout that is now 38. Add the two generated exercise
types to the type list.

### 9 — Close the CSP
*Before any visibility change, not before.*

Move the two inline handlers, add the policy, delete the `__proto__` key before
merging.

---

## What was not covered

Stated so the next audit knows where the holes are.

- **No real-device testing.** Mobile findings come from a 375 px emulated
  viewport, not from a phone. Touch behaviour, iOS Safari quirks and real scroll
  performance are untested.
- **No colour-contrast measurement.** Both themes were confirmed to have complete
  token sets; no ratios were computed.
- **No screen-reader testing.** The accessibility checks are structural.
- **UX has no instrumentation.** No task timings, no error-rate data, no
  observation of anyone using the course.
- **Pedagogy was not assessed.** Exercise quality, question difficulty and
  curriculum sequencing need a human reading the content, which is exactly what
  `CLAUDE.md` already says and what no audit of this kind replaces.
