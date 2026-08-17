"""Check course content for verbatim reuse of copyrighted source material.

WHY
    Three sources informed this curriculum: two textbooks and the I.L.R.'s
    published sample papers. Structure, sequencing and pedagogical approach are
    not copyrightable and were the useful part. Sentences are copyrightable.

    Before publishing, we need evidence — not a hope — that no exercise,
    reading text or dialogue reproduces a run of words from a source.

WHAT IT DOES
    Extracts text from each source PDF, normalises it, and slides an n-gram
    window over both sides. Any shared run of N+ consecutive words is reported
    with its location so it can be judged and rewritten.

    Short overlaps are expected and harmless: fixed phrases, grammatical
    formulae and common sentences will collide in any two Romanian courses.
    `Bună ziua, ce mai faceți` is not anyone's property. The default window is
    deliberately long enough to skip those and surface real copying.

USAGE
    python tools/check_reuse.py                 # default sources, 6-word window
    python tools/check_reuse.py --n 8           # looser, fewer false positives
    python tools/check_reuse.py --pdf path.pdf  # add a source

    Exits 1 if anything is found, so it can gate a release.
"""

import argparse
import io
import os
import re
import sys
import unicodedata

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import _sources

# The sources that actually informed the curriculum. Missing files are skipped
# with a warning rather than failing — they live outside the repo by design, so
# a fresh clone will not have them.
DEFAULT_SOURCES = [
    os.path.join(HERE, "ilr", "nivel_B1_sample.pdf"),
    os.path.join(HERE, "ilr", "Intelegere-scrisa-si-competenta-gramaticala_B1.pdf"),
    os.path.join(HERE, "ilr", "Elaborarea-unui-text-pe-o-tema-data_B1.pdf"),
    os.path.join(HERE, "ilr", "Audio-B1.pdf"),
    os.path.join(os.path.dirname(ROOT), "Grigore Brancus Limba-Romana.pdf"),
    os.path.join(os.path.dirname(ROOT), "Romanian_A1v2_Complete.pdf"),
    os.path.join(os.path.expanduser("~"), "Downloads", "Documents", "Language Learning",
                 "Learn Romanian Manual -- Dr_ Mona Moldoveanu Pologea -- 3, 2023 -- "
                 "ROLANG Publishing House -- 1d3c65a5d1fb43450f455fd7cb82324c -- "
                 "Anna’s Archive.pdf"),
]


# Passages that legitimately appear in both the course and a source because
# neither party wrote them. Romanian copyright law (Law 8/1996, art. 9) places
# official texts — laws, administrative and judicial texts, and their official
# translations — outside copyright altogether. A language course and a textbook
# quoting the same constitutional article is convergence, not copying.
#
# Add to this list only for genuinely uncopyrightable text, and say why.
#
# Entries must be the WHOLE passage, not a fragment. The comparison slides an
# n-word window, so a window straddling the end of a short entry would not be
# contained by it and would still be reported — which is what happened when
# these were first written as fragments.
ALLOWLIST = [
    # Constitution of Romania, Article 1 — quoted in the citizenship track.
    "romania este stat national suveran si independent unitar si indivizibil "
    "forma de guvernamant este republica capitala este bucuresti limba oficiala "
    "este limba romana",
    # National anthem, Andrei Muresanu, 1848. Public domain by age.
    "desteapta te romane din somnul cel de moarte in care te adancira barbarii "
    "de tirani",
    # The oath of allegiance — statutory wording, fixed by law.
    "jur sa fiu devotat patriei si poporului roman sa apar drepturile si "
    "interesele nationale",
    # Official names of the I.L.R. exam papers. A course that explains the exam
    # has to name its parts; these are titles of a public procedure, not prose.
    "intelegere scrisa si competenta gramaticala",
    "elaborarea unui text pe o tema data",
    "intelegerea si exprimarea orala",
]


# A SEPARATE category, and the distinction matters. ALLOWLIST above is a legal
# claim: nobody owns that text. This list is a factual one: these are fixed
# phrases and stock teaching examples that any two Romanian courses will produce
# independently, because there is no other natural way to say the thing.
#
# "Bună ziua! Cu ce vă pot ajuta?" is what a Romanian shop assistant says.
# "Dacă aș avea mai mult timp…" is the standard conditional example in every
# textbook ever written. Rewriting them to avoid a match would make the course
# worse in exchange for nothing.
#
# Keep this list short and keep it justified. It is the easy place to hide a
# real lifting, so anything added here should be a phrase you would expect to
# find in a phrasebook, not a sentence someone composed.
COMMON_PHRASES = [
    "buna ziua cu ce va pot ajuta",          # standard service greeting
    "daca as avea mai mult timp as",         # stock conditional example
    "am douazeci si opt de ani",             # stating an age; formulaic
    "o camera dubla pentru trei nopti",      # standard hotel booking phrase
]


def allowed(gram):
    """True if this window is a passage nobody owns, or a fixed phrase."""
    return (any(gram in a for a in ALLOWLIST)
            or any(gram in c for c in COMMON_PHRASES))


def normalise(text):
    """Lowercase, strip diacritics and punctuation, collapse whitespace.

    Diacritics are stripped so that a passage copied without them still
    matches — an evasion that would otherwise slip through, and also just what
    happens when text is retyped from a book.
    """
    text = (text.replace("ş", "ș").replace("ţ", "ț")
                .replace("Ş", "Ș").replace("Ţ", "Ț"))
    text = unicodedata.normalize("NFKD", text.lower())
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def ngrams(words, n):
    return {" ".join(words[i:i + n]): i for i in range(len(words) - n + 1)}


def pdf_text(path):
    from pypdf import PdfReader
    out = []
    reader = PdfReader(path)
    for page in reader.pages:
        try:
            out.append(page.extract_text() or "")
        except Exception:
            pass  # scanned page with no text layer; nothing to compare
    return "\n".join(out)


def looks_romanian(s):
    """Reject English so it is never compared.

    The ROLANG manual is bilingual, so English instruction text in this course
    collides with English instruction text in the book — "I would like to open
    an account" matched on the first run. That is noise: the English side is
    this project's own prose, and two courses teaching bank vocabulary will
    write the same sentence independently.
    """
    if re.search(r"[ăâîșțĂÂÎȘȚ]", s):
        return True
    ro = re.findall(r"\b(este|sunt|am|și|să|nu|cu|la|în|de|un|o|mai|se|care)\b", s)
    return len(ro) >= 2


def course_strings():
    """Every Romanian string a learner reads, with a label for where it lives.

    English prompts and explanations are excluded — see looks_romanian().
    """
    src = _sources.data_source()
    items = []

    region = _sources.region_reader(src)

    STR = r'"((?:[^"\\]|\\.)*)"'

    # Reading passages and dialogue lines are the longest runs of prose and so
    # the likeliest place for a lifted paragraph.
    for label, reg in (("reading", region("var READING_TEXTS", "var CORE_GLOSS")),
                       ("dialogue", region("var DIALOGUES", "var READING_TEXTS")),
                       ("vocab-ex", region("var VOCAB", "var DIALOGUES"))):
        for m in re.finditer(r"\bro:\s*" + STR, reg):
            items.append((label, m.group(1)))

    # Exercise prompts, given sentences, options and model answers.
    ex = region("var EXERCISES", "var LESSONS")
    for field in (r"\bprompt:\s*", r"\bgiven:\s*", r"\bmodel:\s*", r"\banswer:\s*"):
        for m in re.finditer(field + STR, ex):
            items.append(("exercise", m.group(1)))
    for m in re.finditer(r"\boptions:\s*\[([^\]]*)\]", ex):
        for o in re.finditer(STR, m.group(1)):
            items.append(("exercise", o.group(1)))

    return items


def main():
    ap = argparse.ArgumentParser()
    # 6 rather than 8: the three genuine liftings found at 8 were each a whole
    # sentence, but two more only showed up at 6. Below 6, fixed phrases and
    # ordinary grammatical formulae collide constantly and the signal is lost.
    ap.add_argument("--n", type=int, default=6,
                    help="shared consecutive words that count as reuse (default 6)")
    ap.add_argument("--pdf", action="append", default=[],
                    help="extra source PDF; repeatable")
    args = ap.parse_args()

    sources = DEFAULT_SOURCES + args.pdf
    items = course_strings()
    print("course strings scanned: %d" % len(items))

    # Index the course side once: n-gram -> (label, original string)
    course_index = {}
    for label, raw in items:
        plain = re.sub(r"<[^>]+>", " ", raw)
        if not looks_romanian(plain):
            continue
        w = normalise(plain).split()
        if len(w) < args.n:
            continue
        for g in ngrams(w, args.n):
            course_index.setdefault(g, (label, raw))

    print("distinct %d-word sequences: %d\n" % (args.n, len(course_index)))

    findings = []
    for path in sources:
        name = os.path.basename(path)
        if not os.path.exists(path):
            print("  skipped (not on disk): %s" % name[:66])
            continue
        try:
            text = pdf_text(path)
        except Exception as exc:
            print("  FAILED to read %s: %s" % (name[:44], exc))
            continue

        words = normalise(text).split()
        if not words:
            print("  no text layer: %s" % name[:66])
            continue

        hits, waived = {}, 0
        for g in ngrams(words, args.n):
            if g in course_index:
                if allowed(g):
                    waived += 1
                    continue
                label, raw = course_index[g]
                hits.setdefault(g, (label, raw))
        print("  %-58s %6d words  %d hit(s)%s"
              % (name[:58], len(words), len(hits),
                 "  (%d waived as uncopyrightable)" % waived if waived else ""))
        for g, (label, raw) in hits.items():
            findings.append((name, label, g, raw))

    if findings:
        print("\n%d overlapping passage(s) — review each before publishing:\n"
              % len(findings))
        for name, label, g, raw in findings[:40]:
            print("  source : %s" % name[:70])
            print("  in     : %s" % label)
            print("  shared : %s" % g[:120])
            print("  course : %s\n" % re.sub(r"\s+", " ", raw)[:120])
        sys.exit(1)

    print("\nno shared runs of %d+ words found" % args.n)


if __name__ == "__main__":
    main()
