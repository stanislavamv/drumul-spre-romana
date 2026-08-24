# Technical debt

Known defects and rough edges, parked deliberately rather than forgotten.

Nothing here is urgent. Items are recorded when they are *found*, usually during
work aimed at something else, so that the discovery is not lost and the current
task is not derailed by it. Each entry says what is wrong, what it costs, and
what fixing it would involve.

Format: one heading per item. Delete the entry when it is fixed.

---

## In-progress lesson work is never saved, only a finished lesson is

**Where:** `js/core/session.js`, `js/features/actions.js` (`finishLesson`)

`session` — every answer, every check, everything the learner does while
working through a lesson — is deliberately never persisted. The header of
`session.js` explains why: "adding session data to the saved payload would
make half-finished exercises survive a refresh, which the exercise engine
does not expect." A reload rebuilds `session` from scratch.

The only thing that ever writes to persisted `state.progress.lessons[id]` is
`finishLesson`, and it requires `answered.length===ids.length` — every
exercise in the lesson attempted — before it writes anything at all. Fall
short of that and nothing is recorded: not "partial," not "attempted,"
nothing. `lessonProgress()` returns the same default as a lesson never
opened, and the course map shows "not started."

**Cost:** a learner who works through a lesson across more than one sitting —
closing the tab, coming back later, an entirely ordinary way to study — can
lose real, repeated effort with zero trace it happened, no error, and no
warning it was at risk. Diagnosed directly from a report of exactly this:
real study sessions that left the course map reading 0% afterward. The save
pipeline itself was verified intact (state persists correctly across a
reload once `finishLesson` has run) — this is the gap upstream of it.

**Fix — two options, not mutually exclusive:**

- Record an "attempted" mark on `state.progress.lessons[id]` the moment the
  learner answers the *first* exercise in a lesson, not only at the end. An
  abandoned session would then show "in progress" instead of "not started,"
  even though the individual answers are still lost.
- Autosave `session.answers`/`session.feedback` into `state` periodically —
  the same `visibilitychange`/`pagehide` listeners `state.js` already uses to
  flush `persist()` are the natural hook — and teach the exercise engine to
  resume a saved session on load instead of always starting fresh. This is
  the complete fix, but it means revisiting the reasoning in the `session.js`
  header comment, not just overriding it; that comment exists because the
  exercise engine actively assumes a fresh session today.

A related, narrower fix already shipped alongside this entry: a "save your
progress" reminder now nudges the learner to export/copy a save once enough
work has piled up since the last one (`js/features/progress.js`,
`shouldShowSaveReminder`). That protects *finished* lessons from being
stranded in a browser that gets cleared or swapped — it does not address
in-progress work being silently discardable in the first place, which is
what this entry is about.

---

## Recently cleared

Kept as a short record so the same ground is not re-examined from scratch. The
detail is in the commits.

- **The 35-day review interval was unreachable.** `SRS_LEVELS` has five entries
  and `SRS_INTERVALS` six, and the lookup clamped to the shorter one, so
  *Mastered* came back after 16 days rather than 35. Fixed by reading
  `SRS_INTERVALS[levelIdx+1]`, with index 0 kept as the same-day slot that a
  wrong answer falls into.
- **A direct `localStorage` write was discarded in silence.** `persist()`
  debounces by 80 ms and `writeState()` then serialises the whole in-memory
  `state` over whatever is in storage. `writeState()` now notices that storage
  no longer holds what it last wrote and says so on the console; `clearState()`
  gives `resetProgress()` a supported way to erase the save. The rule is still
  *mutate `state`, then call `persist()`*.
  A size-based guard was considered and rejected: `resetProgress()` is supposed
  to shrink the save to nothing, so a threshold would refuse the one operation
  that most legitimately shrinks it.
- **B1 reading was bimodal.** Three texts cleared the 400–600 word target and
  five sat at roughly a fifth of it. The five were extended in place — every
  original sentence kept verbatim, so the comprehension questions written
  against them stayed valid — and B1 now runs 403–658 words across eight texts.
- **Sixteen extracted strings could never have a clip.** The caesura-marked
  singing-guide lines, punctuation-only noise, and label structures
  (`ILR_PAPERS`, `TENSE_META`, `PERSON_LABELS`) reached by the generic `ro:`
  rule. `ro:` carries two meanings in the datasets — Romanian to be spoken, and
  a Romanian label for a piece of UI — and the extractor now excludes the three
  label-only declarations. "Still missing" reads 0, so a future non-zero is a
  real gap.
- **Playback could not be stopped.** A second click on a playing button now
  stops it and the glyph becomes a stop square; a route change stops playback
  too, since the button that could stop it is about to be replaced.
- **A bad route rendered without navigation**, and **`PAGES.admin` nested two
  `.main-inner` wrappers**. Both were chrome inconsistencies, both fixed by
  routing through `shell()`.
