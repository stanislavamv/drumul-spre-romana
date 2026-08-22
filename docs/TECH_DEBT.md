# Technical debt

Known defects and rough edges, parked deliberately rather than forgotten.

Nothing here is urgent. Items are recorded when they are *found*, usually during
work aimed at something else, so that the discovery is not lost and the current
task is not derailed by it. Each entry says what is wrong, what it costs, and
what fixing it would involve.

Format: one heading per item. Delete the entry when it is fixed.

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
is in `localStorage`. There are flushes on `visibilitychange` and `pagehide`, so
a real learner closing the tab does not lose the last 80 ms — but neither
changes the hazard below.

So any code that edits `localStorage[STORAGE_KEY]` directly — a console
one-liner, a migration, a test fixture, a devtools tweak — is racing an
80 ms timer. If a `persist()` is pending, or anything calls one afterwards, the
direct write is discarded with no error. The change appears to work, survives a
moment, and then vanishes on the next state mutation.

**The mirror image is worse, and has actually happened.** Calling `writeState()`
when the in-memory `state` is *not* the state you meant to keep serialises the
wrong object over the saved one. A debugging probe did exactly this and
destroyed the saved progress on the dev machine: `state` was at defaults, the
probe called `writeState()` to tidy up after itself, and 7.7 KB of saved
progress became a 517-byte default. Nothing failed; the write succeeded.

**Cost:** confusing to debug, and a trap for anyone writing a migration or a
test harness later. No effect on normal use, because the app itself always goes
through `state`.

**Fix:** the rule is *mutate `state`, then call `persist()`* — never touch
`localStorage` directly, and never call `writeState()` speculatively. Worth
enforcing rather than documenting:

- A setter that takes a mutator function would make the correct path the easy
  one, and would leave no reason to reach for `writeState()` from outside.
- A guard in `writeState()` that refuses to overwrite a substantially larger
  saved state without an explicit flag, in the same spirit as the audio
  manifest's shrink guard. That would have prevented the loss above outright.

Related: `applyImportedState()` and `resetProgress()` reassign `state` wholesale.
That works — the scope-chain reasoning is documented in the header of
`state.js` — but it is the other place where the invariant matters, since they
must call `persist()` themselves to make the swap durable.

Note for whoever writes the guard: those two are exactly why it is not a
one-liner. `resetProgress()` is *supposed* to shrink the saved state to almost
nothing, so a size check alone would refuse the one operation that most
legitimately shrinks it. The guard needs a way for a caller to say "yes, this
shrink is intended" — the `--force-manifest` shape from the audio pipeline — and
those two call sites need to pass it.

---

## Reading texts are uneven at B1

**Where:** content, not code — `READING_TEXTS` in `js/data/texts.js`

The specification calls for 400–600 word reading texts at B1. Three now clear
it — `r_b1_long_munca` (617), `r_b1_long_somn` (561), `r_b1_long_sat` (658) —
but the older B1 texts were never brought up with them:

| id | words |
|---|---|
| `r_b1u1` | 117 |
| `r_b1u4` | 148 |
| `r_b1u6` | 116 |
| `r_b1_2u2` | 120 |
| `r_b1_2u6` | 150 |

So B1 reading is bimodal: three texts at full length and five at roughly a
fifth of it. The ILR practice texts sit at 234 words, also under the paper they
model.

A2.2 (5 texts, 112–152 words) and the register track (2 texts, 106–128) do have
texts — an earlier version of this entry claimed they had none, which is no
longer true.

**Cost:** a learner working through B1 in order meets a long text, then several
short ones, so sustained-reading practice is inconsistent rather than absent.

**Fix:** extend the five short B1 texts, or reclassify them as something other
than the level's main reading. Content work, not a bug.

---



## Eleven extracted strings can never have a clip

**Where:** `tools/extract_strings.py`

`build_manifest.py` reports "11 still missing" on every run, and always will.
This was sixteen until the extractor learned to drop two groups that were never
speech to begin with:

- **Four singing-guide lines carrying the caesura mark**, e.g.
  `Deșteaptă-te, române, ‖ din somnul cel de moarte,`. `renderSingingGuide()`
  speaks `l.ro.replace(/‖/g,"")`, so the marked version could never match. The
  extractor now strips `‖` the same way, and the four collapse onto the plain
  lines that were already fetched.
- **Punctuation-only noise**, such as the string `”.`, now filtered by
  requiring at least one letter or digit.

The eleven that remain are labels and metadata that the extractor mistakes for
speech. None of them has a play button anywhere in the app:

- `Perfect compus`, `Conjunctiv`, `Imperativ` — `leftLabel` / `rightLabel` on
  contrast blocks in `js/data/lessons.js`. Table headers.
- `el / ea`, `ei / ele` — `PERSON_LABELS` in `js/data/reference.js`, the pronoun
  column of a conjugation table.
- The three ILR paper names (`Comprehensiune de lectură și competență
  gramaticală` and friends) plus the individual words `Înțelegerea`,
  `exprimarea`, `orală` — Romanian embedded in the English `explain` text of an
  exercise, and a unit title.

**Cost:** the "still missing" count has a permanent floor of 11, so it cannot be
read at a glance as "coverage is complete". Smaller than it was, and no longer
carries entries that are actively wrong, but still not zero.

**Fix:** narrow the rules that reach label fields — `leftLabel`/`rightLabel`,
`PERSON_LABELS`, and Romanian inside `explain`. This needs care rather than
effort: those same rules pull in strings that genuinely are spoken, so each one
wants checking against the rendered page before it is tightened. Fetching the
eleven instead would zero the number, but it would buy clips nothing plays.

---

## Playback cannot be paused or stopped

**Where:** `js/features/actions.js` (`playAudio`), `js/core/speech.js`

The original specification asked for play, pause, replay and speed control.
Speed control exists. Pause does not, and neither does stop.

Clicking a playing button calls `Speech.speak()` again, which stops the current
clip and restarts it from the beginning — sensible as "replay", but there is no
way to simply make it stop. `Speech.stop()` exists and works; the only caller is
the shadowing feature, and no button anywhere exposes it. An `iconPause()` was
written and never called; it was deleted rather than left sitting uncalled, and
is recoverable from git history if pause is ever built.

**Cost:** low for a single word, higher for `speakSequence()` over a long
reading, which can run for minutes. A route change now stops playback, so the
worst case — audio following you onto an unrelated page — is gone. What remains
is that you cannot stop it *without* leaving the page.

**Fix:** track the playing element in `playAudio` and swap the button to a stop
control while it plays, calling `Speech.stop()`. The `.audio-btn.playing` class
is already applied and styled, so the state is there to hang it on.
