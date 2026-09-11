"""Extract grounding data for the Corectorul agent's lookup tools.

Pulls VOCAB and GRAMMAR_TOPICS out of js/data/*.js and writes them as plain
JSON under agent/grounding/, for lookup_vocab / lookup_grammar / check_register
to read at runtime. Verb conjugation tables are deliberately not produced
here. They come from calling the app's own verbTables() engine in a real
browser (see agent/grounding/README.md), not from re-parsing verbs.js, so a
class-tagging bug never gets a second, disagreeing implementation.

Run after any content edit that touches VOCAB or GRAMMAR_TOPICS, same as
check_content.py.
"""
import io
import json
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _sources
import _jslit

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "agent", "grounding")

src = _sources.data_source()
region = _sources.region_reader(src)

# Document order (see _sources.DATA_FILES): verbs.js, then grammar.js, then
# vocab.js. Each region's end marker is the *next* dataset's start marker --
# looked up after the start, per the region_reader contract.
GRAMMAR_R = region("var GRAMMAR_TOPICS", "var VOCAB")
VOCAB_R = region("var VOCAB", "var DIALOGUES")

vocab = _jslit.parse_from(VOCAB_R, "var VOCAB")
grammar = _jslit.parse_from(GRAMMAR_R, "var GRAMMAR_TOPICS")

if not os.path.isdir(OUT_DIR):
    os.makedirs(OUT_DIR)


def write_json(name, data):
    path = os.path.join(OUT_DIR, name)
    with io.open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print("%s: %d entries -> %s" % (name, len(data), path))


write_json("vocab.json", vocab)
write_json("grammar.json", grammar)

registered = [v for v in vocab if v.get("register")]
print("\n%d of %d vocab entries carry a register label" % (len(registered), len(vocab)))
for v in registered[:5]:
    print("  %-14s %-28s %s" % (v["id"], v["ro"], v["register"]))
