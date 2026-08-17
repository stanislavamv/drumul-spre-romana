# Publication plan

Read this before running `git init`. Three things in the current working
directory must not be published as-is, and one of them is not fixable by
deleting a file.

---

## Blockers, in order of severity

### 1. The audio is not redistributable

`audio/` holds 6,177 MP3s (~92 MB) generated from Google Translate's
`translate_tts` endpoint. That endpoint is undocumented and not covered by
Google's API terms for automated use. The output is **not licensed for
redistribution**.

Using it for personal study is one thing. Committing 92 MB of it to a public
repository is republication, and it is the kind of thing that attracts a
takedown rather than a lawsuit — but it also makes the repo unusable by anyone
who cares about provenance.

This cannot be fixed by adding a license file. The options are:

| Option | Cost | Result |
|---|---|---|
| **Exclude `audio/`, ship the pipeline** | Users run one script, wait ~2 h | Repo is clean; audio is a local build artifact. **Recommended.** |
| Re-record with a paid TTS licensed for redistribution | Google Cloud TTS or Azure, roughly $10–25 for this corpus at standard voices | Clips become publishable; quality similar or better |
| Commission a native speaker | Real money, weeks | Best quality by a distance, and the honest answer to "native Romanian audio" |
| Public-domain / CC-BY sources | Free, patchy coverage | Will not cover 6,177 strings |

The pipeline already supports the second option — `fetch_audio.py` would need
its endpoint swapped, nothing else. The manifest, the key normalisation and the
runtime all stay.

**Recommendation: exclude `audio/` from the repo and treat it as a build
artifact.** The README already documents the two commands. If the project ever
goes properly public, budget for Cloud TTS or a human.

### 2. Teacher-mode credentials become public — RESOLVED

~~`profesor` / `drumul2026` are in the source.~~

**Done: the login was removed entirely.** The third option below was taken. What
remains is a labelled checkbox in Settings that unlocks every unit, plus a card
on the page explaining why there is no password: a static single-file app cannot
hide a secret from the browser running it, so a login box would only tempt
someone into putting something private behind a lock that cannot refuse anyone.

The options that were considered:

- **Accept it** and change the copy to say plainly that it is a convenience
  toggle, not access control. Honest, zero work.
- **Move the credential out of the repo** — read it from a `config.local.js`
  that is gitignored, so each deployment sets its own. Still client-side, still
  readable by a determined student, but not published.
- **Drop the login entirely**, leaving the unlock-all toggle in settings.
  ← **taken**

Anything stronger needs a server, which is a different project.

### 3. Source PDFs must never be committed

Two copyrighted books informed the curriculum:

- *Learn Romanian Manual* — Dr. Mona Moldoveanu Pologea, ROLANG
- *Limba Română* — Grigore Brâncuș

Both live in the user's Downloads/Documents, outside this directory, and must
stay there. Add belt-and-braces `*.pdf` to `.gitignore` regardless.

Structure and pedagogical approach are not copyrightable and were the useful
part. **Before publishing, audit that no exercise reproduces source text
verbatim** — paraphrase or replace anything that does. Grep the exercise data
against the extracted manual text if it is still around.

### Also clean up

- `english words underlined glitch.png`, `hover over voicover glitch.png`,
  `vocabulary sourcing bug.png` — debugging screenshots in the repo root.
- `ro-strings.json` in the root is a stale duplicate of `tools/ro-strings.json`.
- `.claude/settings.local.json` — machine-local, gitignore it.

---

## Repository layout

```
drumul-spre-romana/
├── index.html
├── css/app.css
├── js/core/{utils,state}.js
├── js/features/{activity,mastery}.js
├── README.md
├── LICENSE                    ← code
├── LICENSE-CONTENT            ← course content, likely different terms
├── CLAUDE.md
├── .gitignore
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CONTENT.md
│   ├── AUDIO.md
│   └── GITHUB.md
├── tools/
│   ├── extract_strings.py
│   ├── fetch_audio.py
│   ├── check_content.py
│   ├── check_syntax.py
│   ├── verify_verbs.py
│   └── ro-strings.json        ← commit: it is the audio build input
└── .github/workflows/
    └── check.yml
```

`audio/` and `audio-manifest.js` are both absent by design — they are build
artefacts of the same pipeline, and a manifest listing 6,177 clips that are not
there would be worse than none. `index.html` handles the missing manifest with
`onerror`, so a clone runs silently rather than failing.

An earlier draft of this document said to commit the manifest because "a fresh
clone has no idea what audio should exist". That reasoning was wrong: the clone
does not need to know, because `extract_strings.py` derives the full list from
`index.html` on demand.

### Licensing — WRITTEN

Two licenses, because the code and the course are different things:

- **`LICENSE`** — MIT, covering `index.html`'s markup/styles/JS, `css/`, `js/`,
  `tools/` and `.github/`.
- **`LICENSE-CONTENT`** — **CC BY-NC-SA 4.0**, covering the curriculum itself:
  lessons, exercises, vocabulary, readings, dialogues, grammar articles and
  cultural notes, wherever they appear — including inside `index.html`, where
  most of it lives as JavaScript data.

Both files state that `audio/` is covered by neither and is not distributed.

**On the NonCommercial term.** It is not compatible with Wiktionary's
CC BY-SA, which forbids adding restrictions. That creates no conflict here
because **no Wiktionary text is in the course** — `verify_verbs.py` compares
generated conjugations against Wiktionary and reports disagreements; it copies
nothing. `LICENSE-CONTENT` says this explicitly, because a reader who sees
Wiktionary credited would otherwise reasonably wonder.

---

## `.gitignore`

Written and in force — see the file itself rather than a copy here, which would
drift. It covers `audio/` and `audio-manifest.js`, the pipeline's intermediate
JSON, `*.pdf`, screenshots, machine-local `.claude` config, and Python bytecode.

`.claude/launch.json` is deliberately **kept**: it is how anyone runs the
project.

---

## CI

There is no test suite, but three checks are cheap and catch the failure modes
this project actually has. All three already exist as scripts.

```yaml
name: check
on: [push, pull_request]

jobs:
  content:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: '3.12'}

      # The real gate: dangling ids, non-ASCII ids, duplicates, and exercises
      # missing an explanation. All have shipped as real bugs; none throw at
      # runtime.
      - run: python tools/check_content.py

      # Informational only. Its tokenizer does not understand regex literals,
      # so the depths it prints are indicative and it always exits 0. Kept
      # because it localises a genuine parse error to a line.
      - run: python tools/check_syntax.py
```

Deliberately **not** in CI: `verify_verbs.py` hits Wiktionary 190 times and
takes about twelve minutes. Run it manually after adding verbs.

Worth adding later: a headless browser sweep of every route asserting no console
errors. That catches total breakage — but as the architecture doc says, it does
not catch a mis-graded answer or a question answerable without reading the text.
Those need human eyes.

---

## Sequence

1. ~~`git init`, add `.gitignore` **first**, confirm `git status` shows no `audio/`
   and no PDFs.~~ **Done** — 17 files, 1.5 MB, verified with `git check-ignore`
   before the first commit.
2. ~~Delete the loose screenshots and the stale root `ro-strings.json`.~~ **Done** —
   both are gitignored rather than deleted, so they stay on disk but out of history.
3. ~~Decide the teacher-mode question above; apply it.~~ **Done** — login removed.
4. ~~Audit exercises against the source material for verbatim reuse.~~ **Done** —
   see below. `tools/check_reuse.py` now automates it.
5. ~~Add `LICENSE` and `LICENSE-CONTENT`.~~ **Done** — MIT and CC BY-NC-SA 4.0.
6. ~~First commit.~~ **Done.** Verified `audio/` and `audio-manifest.js` are
   untracked.
7. ~~Push private.~~ **Done** — `origin` is
   `github.com/stanislavamv/drumul-spre-romana`, and an unauthenticated API
   request returns 404, confirming it is private. Live with it a while.
8. ~~Add the CI workflow.~~ **Done** — `.github/workflows/check.yml`.
9. Only then consider making it public — and only after the audio question has a
   real answer, not a hope.

**Only step 9 is left,** and it is the one that should not be rushed.

### The verbatim-reuse audit

`tools/check_reuse.py` extracts text from each source PDF, strips diacritics and
punctuation, and slides a six-word window over both sides. It exits non-zero on
any hit, so it can gate a release.

It found **five genuine liftings**, all in the I.L.R. track, all now rewritten:

| id | What was lifted |
|---|---|
| `i621` | *Mașina va fi adusă mâine.* |
| `i622` | *Dacă-mi cerea bani, îi dădeam.* |
| `i623` | *O să te aștept la gară.* |
| `i624` | *De ce nu m-ai așteptat unde ne-am înțeles?* |
| `i625` | *După ce-l întâlnisem, mi-am dat seama cine era.* |

Each was a transformation drill whose *source sentence* came straight from the
published sample paper. The grammatical operation is a fact about Romanian and
was kept; the sentences were replaced. `i622`'s explanation had even admitted it
in prose — "this is item 9 on the official sample paper almost verbatim" — which
went too. Two vocabulary examples and one model answer echoing the paper's own
rubric wording were reworded at the same time. All five re-verified as grading
`Correct` in the browser afterwards.

Two categories are waived, and the distinction is deliberate:

- **`ALLOWLIST`** — a *legal* claim: nobody owns this text. The Constitution's
  Article 1, the statutory oath, the 1848 anthem. Romanian Law 8/1996 art. 9
  puts official texts outside copyright.
- **`COMMON_PHRASES`** — a *factual* claim: any two Romanian courses produce
  these independently. *Bună ziua! Cu ce vă pot ajuta?* is what a shop assistant
  says; *Dacă aș avea mai mult timp…* is the stock conditional example.

Keeping them apart matters, because the second list is the easy place to hide a
real lifting behind a plausible-sounding excuse.

**One honest gap:** the Brâncuș volume is a scanned PDF with no text layer, so
the tool could not read it and reports so rather than passing silently. It
informed the contrast tables conceptually; no text was taken from it, but that
is my assertion rather than something the check can evidence.

**If audio ever does get committed by accident,** `git rm --cached` does not
remove it from history — that needs `git filter-repo` or a fresh repo. Check
before pushing, not after.

---

## If it becomes a real project

- **Accounts and sync.** The most-requested thing. Progress is `localStorage`
  today, with JSON export/import as the escape hatch. Real sync needs a backend,
  which changes the project's nature — a static file becomes a service with
  uptime, data protection duties and a bill. Worth it only if other people
  actually use it.
- **Audio, properly.** A native speaker recording 6,177 strings is the single
  largest quality jump available, and it also removes the licensing blocker.
- **Finishing the split.** Underway: `css/app.css` and four `js/` modules are
  out, but `index.html` is still 989 KB with every content array and page
  renderer inline. Moving content to JSON fetched at load would cost the
  `file://` guarantee, which is worth more than it sounds — plain `<script src>`
  files, as used now, keep it.
- **Community content.** The data model is clean enough that a contributor could
  add a unit without touching the engine. `check_content.py` becomes the
  contribution gate.
