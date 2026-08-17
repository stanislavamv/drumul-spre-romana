# Content inventory

Measured from `js/data/*.js`, not from memory. Regenerate the counts with
`python tools/check_content.py`.

---

## Coverage

Every content unit is built. The eight units without lessons are checkpoints and
exams, which assemble their questions from the units before them and need no
lessons of their own.

| Level | Course | Units | With lessons | Lessons |
|---|---|---|---|---|
| A1.1 Foundations I | `cefr` | 9 | 8 | 18 |
| A1.2 Foundations II | `cefr` | 8 | 7 | 14 |
| A2.1 Everyday Romanian I | `cefr` | 9 | 8 | 14 |
| A2.2 Everyday Romanian II | `cefr` | 8 | 7 | 7 |
| B1.1 Independent User I | `cefr` | 9 | 8 | 8 |
| B1.2 Independent User II | `cefr` | 8 | 7 | 7 |
| CET Citizenship | `civic` | 7 | 6 | 11 |
| REG Real speech | `register` | 5 | 5 | 5 |
| ILR B1 exam | `ilr` | 6 | 5 | 5 |
| **Total** | | **69** | **61** | **89** |

Totals: **600** vocabulary entries · **360** exercises · **190** verbs ·
**37** dialogues · **39** reading texts · **41** grammar articles ·
**6** embedded videos · **6,177** audio clips.

---

## `cefr` — the main course

### A1

**A1.1** Greetings and introductions · The alphabet and sounds · Numbers and
days · Where are you from · Family · Getting around the city · Home and daily
life · Weather and seasons · Checkpoint

**A1.2** A colleague's profile · Food and ordering · Arranging to meet ·
Shopping and prices · At the station · Daily routine · Two offers · Checkpoint

Grammar: gender, plurals, the attached definite article, indefinite articles,
subject pronouns and pronoun-dropping, present tense across all conjugation
classes, the six core irregulars, negation, questions, adjective agreement,
possessives, demonstratives, numbers, basic prepositions, reflexives,
`îmi place`, `mă doare`, frequency adverbs, dates, impersonal weather verbs.

### A2

**A2.1** Memories and experiences · Future plans · Hotels and vacations · Health
and the doctor · Housing and moving · Education and work · Personality and
descriptions · Romanian cuisine · Checkpoint

**A2.2** Comparisons and preferences · Bank and post office · Problems and
complaints · Holidays and traditions · Clothing and style · Rules and advice ·
Stories from the past · Checkpoint and level exam

Grammar: perfectul compus, imperfect, the contrast between them, future forms,
the personal accusative with `pe`, direct and indirect object pronouns, dative
and genitive, the imperative including the negative form, comparatives and
superlatives, word order and emphasis.

### B1

**B1.1** Opinions and viewpoints · Careers and technology · Relationships and
emotions · Romanian culture and traditions · Travel and storytelling ·
Bureaucracy and public services · Health and lifestyle · Housing and decisions ·
Checkpoint

**B1.2** Hypotheses and conditions · Media and news · Environment and society ·
Argument and advanced opinions · Education and the future · Personal history ·
Natural communication · Final B1 exam

Grammar: conditional present and perfect, the subjunctive with `să`, relative
clauses, connectors for cause, contrast, concession and purpose, clitic
doubling, reported information, systematic contrast of the past tenses, register.

---

## `civic` — Citizenship

The oath of allegiance · The national anthem *(both official stanzas, line-by-line
translation)* · The state and constitution · Geography · Key points in history ·
The interview and your documents · Mock interview.

Built for applicants restoring citizenship by descent.

---

## `ilr` — Institutul Limbii Române B1 certification

What the exam looks like · Reading comprehension · Grammatical competence ·
Written production · Oral comprehension and expression · Full mock exam.

Built around the sample papers the institute publishes itself. The unit on exam
format is deliberately first: knowing the shape of the paper is worth as much as
another fifty words of vocabulary, and it is the part self-study usually misses.

---

## `register` — Real speech

Everyday informal speech · Fillers and reactions · Slang · Texting and online
Romanian · Swearing and offensive language.

Every item carries a register label. The swearing unit adds a 1–4 strength
rating, masks the strongest items and marks them *understand, don't use* — it is
taught for comprehension, not production. The opt-in is enforced across
practice, listening, review and topic drills, not just on the lesson page.

The slang unit flags what is **dated** as well as what is current. Using stale
slang is worse than using none: it marks you as having learned from old material
in a way that plain standard Romanian never does.

---

## Exercise types

360 exercises. Deliberately not mostly multiple choice, though `mcq` is still
the largest single bucket at 35%.

| Type | Count | | Type | Count |
|---|---|---|---|---|
| `mcq` | 127 | | `error_fix` | 19 |
| `fill` | 50 | | `trans_en_ro` | 15 |
| `produce` | 39 | | `transcribe` | 13 |
| `transform` | 26 | | `build` | 12 |
| `match` | 23 | | `conjugate` | 9 |
| `reading_q` | 20 | | `dictation` | 6 |
| `minimal_pair` | 1 | | | |

Conjugation drills are generated on demand from the verb tables rather than
stored, so any tense can be drilled across any subset of the 190 verbs. Those
are not counted above.

Every one of the 360 carries an `explain` string; `check_content.py` fails the
build if one does not.

---

## Verbs

190, each with present, perfect compus, imperfect, future, conditional,
subjunctive, imperative and participle.

Most are generated from an infinitive plus a conjugation class, which is only as
reliable as the class tag — so they are cross-checked against Wiktionary rather
than trusted. `tools/verify_verbs.py` runs all 190 in about twelve minutes.

Singular imperatives are **declared per verb**, not generated, for classes II–IV
where the form is lexically determined: `scrie!` but `mergi!`, and `zi!`, `du!`,
`adu!` shorten irregularly. An audit caught the engine inventing `zici!`, `pui!`
and `deschizi!`, none of which are Romanian.

---

## What is not here

- **Video transcripts.** The six embedded videos ship without them, because
  transcribing words nobody has checked against the audio hands the learner a
  script to memorise that might be wrong.
- **Audio for the newest content.** Re-run the pipeline after adding material;
  `extract_strings.py` then `fetch_audio.py`.
- ~~**B1 reading at full length.**~~ **Done.** Three long-form B1 pieces now run
  561, 617 and 658 words, against the 400–600 target — a career-change essay, an
  argument about sleep, and reportage from a depopulated village. Each is built
  to reward reading rather than scanning: the thesis arrives late, concessions
  sit mid-text where a careless true/false item will trip on them, and the
  village piece deliberately refuses a tidy conclusion.
- ~~**Reading texts for A2.2 and the register track.**~~ **Done.** A2.2 has five
  (112–152 w) and the register track two (106–128 w), the latter written in the
  undiacriticked, filler-heavy Romanian those units teach.
- **Word counts are now computed, not hand-entered.** Recounting every text
  against its own `ro` field corrected 22 of 39 stored values — most by a word or
  two, but `r_u4` by eleven, because a menu is mostly prices and prices are not
  words. If you edit a text, recount it.
