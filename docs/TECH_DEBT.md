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

## All dialogue speakers share one voice — no gender or per-character TTS

**Where:** `js/core/speech.js` (`Speech`, `scoreVoice`, `speakLocal`,
`speakOne`), `js/data/texts.js` (`DIALOGUES`, `l.speaker`)

A dialogue line only carries `speaker` as a display name (e.g. `"Diana"`,
`"Vlad"`) — nothing marks its grammatical or actual gender, and nothing
downstream would use it if it did. `Speech.speak()`/`speakOne()` take no
speaker or voice argument at all. Two playback paths exist and both end up
gender-blind for a different reason:

- **Pre-rendered clips** (`AUDIO_ASSETS`/`audio-manifest.js`, see
  `docs/AUDIO.md`) are Google Translate `translate_tts` output, which exposes
  no voice or gender parameter — every clip for a given language is the same
  voice, so this path cannot distinguish speakers even in principle without
  switching to a different TTS backend.
- **The local-voice fallback** (`speakLocal`) picks exactly one voice up
  front — `refresh()` ranks every installed `ro-*` voice via `scoreVoice` and
  keeps only the single highest-scoring one in `roVoice` — and every line of
  every dialogue is spoken with that one voice, regardless of who is
  speaking. On a machine whose only (or best-ranked) Romanian voice is a
  single one — Windows/Edge commonly expose just one, such as "Microsoft
  Andrei" — this reads as "everyone in every dialogue sounds like the same
  man," which is what was reported: Diana's lines in `d_u2l2` come out in the
  same voice as Vlad's.

**Cost:** does not break comprehension, but makes it harder to tell, by ear
alone, which character is speaking mid-playback — a dialogue between two
people should not sound like one person reading both parts.

**Fix — two independent efforts, since the two playback paths need different
work:**

- For the local-voice fallback: add a gender (or a specific preferred voice
  name) to each `DIALOGUES` entry's speaker, or infer it from a small
  name→gender table, thread it through `audioButton`/`speakSequence`/
  `speakOne` down to `speakLocal`, and have `refresh()`/`scoreVoice` keep the
  best-ranked voice *per gender* instead of a single global best — falling
  back to the one available voice when only one exists, same as today.
- For pre-rendered clips: `translate_tts` cannot do this at all. A different
  backend would be needed for gendered clips (e.g. Edge's neural voices,
  which do come in distinct named voices per language — the same voices
  `scoreVoice` already ranks for the *live* fallback), which is a bigger
  change to `tools/fetch_audio.py` and the licensing question in
  `docs/AUDIO.md`, not a small patch.

---

## Recently cleared

Kept as a short record so the same ground is not re-examined from scratch. The
detail is in the commits.

- **A word inside a taught phrase could shadow its own real meaning, most
  verbs had no conjugated forms glossable at all, and accented proper nouns
  could never be recognized.** Three separate bugs in `js/features/gloss.js`,
  all found from one reported case ("pare" in a dialogue showing "I'm sorry"
  instead of "seems"):
  - `buildGlossIndex` indexed VOCAB before VERBS, so "pare" split out of the
    taught phrase "Îmi pare rău" claimed that key before `v_parea`'s own
    present tense ("to seem") ever got a turn. The phrase-word split now runs
    last, lowest priority.
  - The VERBS pass only read a verb's own `present`/`past`/etc. fields (or,
    briefly, those plus `irr`), which covers hand-written tables but nothing
    for a verb declared with only its conjugation class — most of VERBS,
    including `a exista`, `a spera`, `a accepta`. It now calls `verbTables()`
    (`conjugation.js`, already loaded first), the same accessor the Verbs
    page itself uses, so a form is glossable exactly when it's displayable.
  - `KNOWN_NAMES` is written with diacritics (`bucurești`) but was compared
    against a diacritic-stripped lookup key, so `indexOf` never matched any
    accented name — every one of them showed as an unknown word instead of
    "proper name". Fixed by normalizing the comparison; `Moldova`, `Brașov`
    and `Transilvania` were also missing from the list entirely and got added.
  While in there: `drăguț` had no gloss entry anywhere (added to `VOCAB`);
  `ei` was mislabeled "they (f.)" — it is masculine, `ele` is the feminine
  one; and the definite-article fallback stripped `-ul` even from a stem that
  already ends in a vowel (`noul` → `no`, not `nou`) — now its own case.
  A follow-up audit of every dialogue and reading line against `glossLookup`
  found nearly 1,240 word-forms with no gloss at all. Worked down the
  frequency list in two further passes — every word-form occurring 4+ times,
  then every one occurring 2–3 times — adding the missing pronouns/clitics,
  ~150 `CORE_GLOSS` entries (`doar`, `despre`, `mâncare`, contractions like
  `s-a`/`m-am`/`într-un`…), a handful of missing region/country names to
  `KNOWN_NAMES`, and 13 verbs that turned out to not exist in `VERBS` at all
  — not just under-conjugated but entirely absent — including `a exista`,
  `a verifica`, `a percepe`, `a trece`, `a se culca` (full conjugation
  entries, cross-checked by hand against the engine's own rules and verified
  live on the Verbs page, not just a single patched form). Two real content
  bugs turned up in the process and got fixed too: `ei` collapsing multiple
  senses of "national" (`națională`/`naționale`) into one entry the first
  time round, and a homograph the diacritic-stripped index can't actually
  tell apart (`vită`/`viță`, `această`/`aceasta`), now stated honestly in the
  gloss rather than silently picking one.
  Every word-form occurring **2 or more times** anywhere in the course is now
  glossable (down from 1,239 total unglossed forms to ~820, all of them now
  singletons — a word used exactly once).

  A further pass finished the job: every one of those ~820 singletons is now
  glossed too, taking the course from 1,239 unglossed word-forms to 4 — three
  anonymized forum usernames in a reading passage (`anonim_23`, `mihai_b`,
  `elenap`) and one address-initial fragment, all deliberately left alone
  since they aren't real words. That pass added roughly 30 more verbs entirely
  missing from `VERBS` (`a decide`, `a scoate`, `a povesti`, `a se strădui`…),
  ~350 more `CORE_GLOSS`/`KNOWN_NAMES` entries, and turned up three more real
  bugs, all in `conjugation.js`'s mechanical imperfect-tense rule:
  - `a sta`'s imperfect is generated from its bare stem (`st-`) and the
    engine's default `-a-` link, giving `stam` — real Romanian is `stăteam`.
    Same failure mode for `a scrie`/`a descrie` (`scriea` instead of `scria`)
    and for any verb whose infinitive ends in a vowel+`i` diphthong that
    `verbParts` strips down to the wrong stem (`a altoi`, `a sfătui`,
    `a plănui`, `a revizui`, `a se strădui` — `altoiam` was coming out as
    `altoam`, dropping the `oi`). Fixed per verb with an explicit
    `irr.imperfect`, the same way `irr.present` already overrides the
    mechanical rule elsewhere. Not audited across the rest of `VERBS` for
    more instances of the same class — a worthwhile follow-up.
  - Some verbs are taught in `VOCAB` (with `pos:"verb"` and an example) but
    were never given a matching `VERBS` conjugation entry (`a tuși`, `a răci`)
    — the same "conjugated forms unglossable" bug from the first pass, just
    reached from the VOCAB side. `VOCAB` and `VERBS` are two separate lists
    with nothing keeping them in sync; whether other such gaps remain wasn't
    checked exhaustively.
  - Three whole tenses the course actually uses in its reading passages have
    no category in the engine at all: the pluperfect (`terminasem` = "I had
    finished"), the literary simple past (`făcui` = "I did"), and the gerund
    (`lucrând` = "working"). All patched as one-off `CORE_GLOSS` word-forms
    rather than taught as a paradigm — giving them proper engine support is
    real follow-up work, not something to improvise at the end of a long
    session.

  `git log` has the commit-by-commit detail of what changed at each pass.
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
