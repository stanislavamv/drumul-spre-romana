# -*- coding: utf-8 -*-
"""Loads the extracted grounding data once and indexes it for the tools.

vocab.json, verbs.json, grammar.json and gloss_index.json are all produced
ahead of time (see README.md in this directory). This module just looks
things up in what was already extracted.
"""
import io
import json
import os
import re

from .normalize import norm_loose

_DIR = os.path.dirname(os.path.abspath(__file__))


def _load(name):
    with io.open(os.path.join(_DIR, name), encoding="utf-8") as f:
        return json.load(f)


VOCAB = _load("vocab.json")
VERBS = _load("verbs.json")
GRAMMAR = _load("grammar.json")
GLOSS_INDEX = _load("gloss_index.json")

_VOCAB_BY_ID = {v["id"]: v for v in VOCAB}
_VERBS_BY_ID = {v["id"]: v for v in VERBS}

# Mirrors glossLookup()'s definite-article/plural fallback chain in
# js/features/gloss.js. The index is checked first, and only these suffix
# trims are retried on a miss. glossLookup() also has a verb-stem fallback,
# its last resort for verbs missing a full table, but that branch never
# fires for this course either: every verb here has a full table. So it's
# left out here too.
_FALLBACK_SUFFIXES = [
    (r"(ul|lui)$", ""),
    (r"(ului)$", ""),
    (r"le$", ""),
    (r"a$", "ă"),
    (r"a$", ""),
    (r"i$", ""),
    (r"ii$", ""),
]


def resolve_word(word):
    """Resolve a Romanian word or short phrase to its gloss-index entry, the
    same way the app resolves a word a learner clicks on. Returns None if
    nothing matches, even after the fallback trims."""
    key = norm_loose(word)
    if not key:
        return None
    hit = GLOSS_INDEX.get(key)
    if hit:
        return hit
    for pattern, repl in _FALLBACK_SUFFIXES:
        trimmed = re.sub(pattern, repl, key)
        if trimmed != key and trimmed in GLOSS_INDEX:
            hit = dict(GLOSS_INDEX[trimmed])
            hit["inferred"] = True
            return hit
    return None


def vocab_by_id(vocab_id):
    return _VOCAB_BY_ID.get(vocab_id)


def verb_by_id(verb_id):
    return _VERBS_BY_ID.get(verb_id)


def search_grammar(query):
    """Substring search over id/title/cat/rule, case-insensitive."""
    q = (query or "").strip().lower()
    if not q:
        return []
    hits = []
    for g in GRAMMAR:
        haystack = " ".join([
            g.get("id", ""), g.get("title", ""), g.get("cat", ""), g.get("rule", ""),
        ]).lower()
        if q in haystack:
            hits.append(g)
    return hits
