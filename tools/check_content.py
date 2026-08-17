"""Validate the course content data.

Cross-references are resolved at render time and a bad id produces an empty
stage rather than an error, so nothing surfaces until a learner opens that
lesson. Both failure modes below have already shipped as real bugs:

  * a vocab id written "b_atentie" but defined as "b_atenție" -> blank stage
  * an exercise with no `explain` -> a bare right/wrong, which the whole
    course exists to avoid

Exits non-zero on any problem, so it can gate CI.
"""
import io
import os
import re
import sys

# Findings quote Romanian back at you, and Windows consoles default to cp1252,
# which cannot encode ș or ț — the script would die reporting the very problem
# it found. Force UTF-8 on the way out.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _sources

# The datasets moved out of index.html into js/data/*.js. _sources rebuilds
# them in their original document order, so the region markers below still
# slice exactly the spans they always did.
src = _sources.data_source()
region = _sources.region_reader(src)


VOCAB_R = region("var VOCAB", "var DIALOGUES")
EX_R = region("var EXERCISES", "var LESSONS")
DLG_R = region("var DIALOGUES", "var READING_TEXTS")
READ_R = region("var READING_TEXTS", "var CORE_GLOSS")
LESSON_R = region("var LESSONS")
UNIT_R = region("var UNITS", "var VOCAB")

vocab_ids = set(re.findall(r'\{id:"([^"]+)", ro:"', VOCAB_R))
ex_ids = set(re.findall(r'\{id:"([^"]+)", lesson:', EX_R))
dlg_ids = set(re.findall(r'\{id:"([^"]+)", title:', DLG_R))
read_ids = set(re.findall(r'\{id:"([^"]+)", title:', READ_R))
topic_ids = set(re.findall(r'\{id:"(g_\w+)", cat:', src))
unit_ids = set(re.findall(r'\{id:"([a-z0-9_]+)", levelId:', UNIT_R))
level_ids = set(re.findall(r'\{id:"([a-z0-9_]+)", code:', region("var LEVELS", "var UNITS")))

problems = []


def bad(kind, where, what):
    problems.append("%-22s %-14s %s" % (kind, where, what))


# --- ids must be ASCII -------------------------------------------------------
# Romanian belongs in the `ro` field. A diacritic in an id reads fine but will
# not match the ASCII spelling every reference site uses.
for ids, label in ((vocab_ids, "vocab"), (ex_ids, "exercise"),
                   (dlg_ids, "dialogue"), (read_ids, "reading")):
    for i in ids:
        try:
            i.encode("ascii")
        except UnicodeEncodeError:
            bad("non-ascii id", label, i)

# --- lesson cross-references -------------------------------------------------
lessons = re.findall(r'\{id:"(l_\w+)",.*?(?=\n\{id:"l_|\n\];)', LESSON_R, re.S)
for m in re.finditer(r'\{id:"(l_\w+)",.*?(?=\n\{id:"l_|\n\];)', LESSON_R, re.S):
    lid, body = m.group(1), m.group(0)

    for blk in re.findall(r"vocabIds:\[([^\]]*)\]", body):
        for v in re.findall(r'"([^"]+)"', blk):
            if v not in vocab_ids:
                bad("dangling vocab", lid, v)

    for blk in re.findall(r"exerciseIds:\[([^\]]*)\]", body):
        for e in re.findall(r'"([^"]+)"', blk):
            if e not in ex_ids:
                bad("dangling exercise", lid, e)

    for d in re.findall(r'dialogueId:"([^"]+)"', body):
        if d not in dlg_ids:
            bad("dangling dialogue", lid, d)

    for r in re.findall(r'readingId:"([^"]+)"', body):
        if r not in read_ids:
            bad("dangling reading", lid, r)

    for t in re.findall(r'topicId:"([^"]+)"', body):
        if t not in topic_ids:
            bad("dangling topic", lid, t)

    u = re.search(r'unitId:"([^"]+)"', body)
    if u and u.group(1) not in unit_ids:
        bad("dangling unit", lid, u.group(1))

    lv = re.search(r'levelId:"([^"]+)"', body)
    if lv and lv.group(1) not in level_ids:
        bad("dangling level", lid, lv.group(1))

# --- every exercise must explain itself --------------------------------------
for m in re.finditer(r'\{id:"(\w+)", lesson:.*?(?=\n\{id:"\w+", lesson:|\n\];)',
                     EX_R, re.S):
    eid, body = m.group(1), m.group(0)
    if "explain:" not in body:
        bad("missing explain", eid, "")
    else:
        exp = re.search(r'explain:"((?:[^"\\]|\\.)*)"', body)
        if exp and len(exp.group(1).strip()) < 25:
            bad("thin explain", eid, exp.group(1)[:44])

# --- duplicate ids -----------------------------------------------------------
for ids, label, pattern, reg in (
    (vocab_ids, "vocab", r'\{id:"([^"]+)", ro:"', VOCAB_R),
    (ex_ids, "exercise", r'\{id:"([^"]+)", lesson:', EX_R),
):
    all_ids = re.findall(pattern, reg)
    seen = set()
    for i in all_ids:
        if i in seen:
            bad("duplicate id", label, i)
        seen.add(i)

# --- report ------------------------------------------------------------------
print("vocab %d | exercises %d | dialogues %d | readings %d | lessons %d"
      % (len(vocab_ids), len(ex_ids), len(dlg_ids), len(read_ids), len(lessons)))

if problems:
    print("\n%d problem(s):\n" % len(problems))
    for p in problems:
        print("  " + p)
    sys.exit(1)

print("\nno problems found")
