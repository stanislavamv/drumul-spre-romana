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

## A bad route renders without navigation

**Where:** `notFound()` in `js/core/chrome.js`

`notFound()` builds its own `.shell`/`.main` markup rather than calling
`shell()`, and so renders with **no sidebar**. Every other page gets one, and
`shell()` deliberately prepends `mobileNav()` so navigation stays reachable from
the menu button even on pages with no desktop sidebar.

The result is that the one screen a lost user lands on is the one screen with no
way out except the single "Back to Learn" button.

**Cost:** small. The button works, so nobody is stranded — it is an
inconsistency, not a trap.

**Fix:** call `shell(null, <the empty-state markup>, null)`. The asymmetry looks
deliberate enough in the source that it is worth a moment's thought about
whether a bare dead end was the intent before changing it.

---

## `PAGES.admin` nests two `.main-inner` wrappers

**Where:** `js/features/pages.js`, `PAGES.admin`

It builds `var main = '<div class="main-inner" ...>'` and then hands that to
`shell()`, which wraps everything in a `.main-inner` of its own. The page ends
up with two nested, both carrying padding and a `max-width`.

Pre-existing and stable — it renders acceptably, which is why it survived this
long unnoticed.

**Cost:** cosmetic. The inner `max-width:560px` wins, so the page is narrower
than its own declaration suggests, and anyone editing the width will change the
outer one first and see nothing happen.

**Fix:** drop the hand-rolled wrapper and pass the inner content to `shell()`,
moving the `max-width`/`padding-top` onto the content itself.

---

## Sixteen extracted strings can never have a clip

**Where:** `tools/extract_strings.py`

`build_manifest.py` reports "16 still missing" on every run, and always will.
The sixteen fall into three groups:

- **Four singing-guide lines carrying the caesura mark**, e.g.
  `Deșteaptă-te, române, ‖ din somnul cel de moarte,`. These can never match a
  clip, because `renderSingingGuide()` speaks `l.ro.replace(/‖/g,"")` — the
  version without the mark, which *is* fetched and mapped. The `‖` variants are
  extractor output that nothing ever asks for.
- **Extraction noise**, such as the string `”.`
- **ILR section titles and their individual words** (`Înțelegerea`,
  `exprimarea`, `orală`), which have no play button.

**Cost:** the "still missing" count has a permanent floor of 16, so it cannot be
used to detect a *real* coverage gap at a glance — which is exactly what that
number is for. It also means four pointless entries sit in `ro-strings.json` as
fetch targets that will fail forever.

**Fix:** strip `‖` in the extractor before emitting singing-guide lines (mirroring
what the renderer does), and filter strings with no letters. Then "still
missing" should read 0, and any future non-zero is a genuine gap worth chasing.
