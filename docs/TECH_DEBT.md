# Technical debt

Known defects and rough edges, parked deliberately rather than forgotten.

Nothing here is urgent. Items are recorded when they are *found*, usually during
work aimed at something else, so that the discovery is not lost and the current
task is not derailed by it. Each entry says what is wrong, what it costs, and
what fixing it would involve.

Format: one heading per item. Delete the entry when it is fixed.

---

## SRS: the 35-day interval is unreachable

**Where:** `js/features/srs.js`

```js
var SRS_LEVELS    = ["New","Learning","Familiar","Strong","Mastered"];  // 5
var SRS_INTERVALS = [0,1,3,7,16,35];                                     // 6
```

`reviewVocab()` clamps the level index to `SRS_LEVELS.length-1`, which is **4**.
The interval is then read as `SRS_INTERVALS[levelIdx]`, so index 5 — the 35-day
step — is never reached. A word at *Mastered* comes back after **16 days**, not
35.

**Cost:** mastered vocabulary is reviewed roughly twice as often as intended.
That is wasted study time, not incorrect behaviour, which is why it can wait.
Nothing is broken and no learner would notice without reading the source.

**Fix — decide which of two things was meant:**

- The arrays are meant to line up, and one interval is surplus. Drop the `35`
  and the ceiling becomes an honest 16 days.
- Six intervals were intended for five levels because index 0 is "unseen" and
  the levels are meant to map to indices 1–5. Then the lookup should be
  `SRS_INTERVALS[levelIdx+1]`, and the ceiling becomes 35 as the table implies.

The second is more likely the original intent — `[0,1,3,7,16,35]` reads as a
deliberate doubling sequence with a leading zero — but it changes the schedule
for every existing learner, so it wants a conscious decision rather than a
quiet patch.

**Do not fix by clamping to `SRS_INTERVALS.length-1`.** That would index
`SRS_LEVELS[5]`, which is `undefined`, and write `undefined` into the saved
status field.

---

## Writing `localStorage` directly can be silently overwritten

**Where:** `js/core/state.js`

`persist()` does not write immediately — it debounces:

```js
function persist(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(writeState, 80);
}
```

`writeState()` then serialises the whole in-memory `state` object over whatever
is in `localStorage`.

So any code that edits `localStorage[STORAGE_KEY]` directly — a console
one-liner, a migration, a test fixture, a devtools tweak — is racing an
80 ms timer. If a `persist()` is pending, or anything calls one afterwards, the
direct write is discarded with no error. The change appears to work, survives a
moment, and then vanishes on the next state mutation.

**Cost:** confusing to debug, and a trap for anyone writing a migration later.
No effect on normal use, because the app itself always goes through `state`.

**Fix:** the rule is *mutate `state`, then call `persist()`* — never touch
`localStorage` directly. Worth enforcing rather than documenting:

- A `loadState()`-style setter that takes a mutator function would make the
  correct path the easy one.
- Failing that, a comment at the top of `state.js` stating the invariant, and a
  note in `CLAUDE.md` so future sessions do not reach for the shortcut.

Related: `applyImportedState()` and `resetProgress()` reassign `state` wholesale
from `index.html`. That works — the scope-chain reasoning is documented in the
header of `state.js` — but it is the other place where the invariant matters,
since they must call `persist()` themselves to make the swap durable.

---

## Reading texts are short of the B1 target

**Where:** content, not code — `READING_TEXTS` in `index.html`

The original specification calls for 400–600 word reading texts at B1. Actual
lengths: B1.1 runs 150–178 words across three texts, B1.2 runs 186–192 across
two. The longest text in the whole course is an ILR practice text at 281 words.

A2.2 and the register track have no reading texts at all.

**Cost:** B1 reading practice is roughly half the length the level calls for,
which under-prepares for both the ILR paper and real B1 reading.

**Fix:** write longer texts. This is content work, not a bug — it is here so
the gap stays visible rather than being rediscovered during the next audit.

---

## `index.html` is still 989 KB

Extraction into `js/` and `css/` is underway — `utils`, `state`, `activity`,
`mastery`, `srs` and `mistakes` are out — but every content array, every page
renderer, the `Actions` map, answer checking, the gloss index, the speech module
and the conjugation engine remain inline.

**Cost:** the file is past the point of being comfortable to edit, and any tool
that parses it textually (`extract_strings.py`, `check_content.py`,
`check_reuse.py`) has to be taught about each region.

**Fix:** continue the extraction. Note the constraint that shapes it — plain
`<script src>` files preserve the `file://` guarantee, whereas moving content to
JSON fetched at load would break it. See `docs/ARCHITECTURE.md`.
