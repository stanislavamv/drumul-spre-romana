# -*- coding: utf-8 -*-
"""The four grounding tools the agent must call before it grades anything.

Each one answers a narrow question against data extracted from the course
itself (see agent/grounding/README.md), giving the model something
concrete to check a claim against.
"""
from strands import tool

from grounding import loader


@tool
def lookup_vocab(word: str) -> dict:
    """Look up a single Romanian word or short phrase in the course's
    vocabulary, resolving inflected forms to their dictionary entry the same
    way the app resolves a word a learner clicks on (e.g. "case" or
    "caselor" both resolve to "casă").

    Args:
        word: the Romanian word or phrase to look up, exactly as it appears
            in the learner's text.

    Returns:
        The resolved entry (headword, English gloss, part of speech,
        register, an example sentence), or {"found": False} if this word
        isn't in the course at all. If the word is actually a conjugated
        verb form, "is_verb_form" is true and "infinitive" names the verb to
        pass to lookup_verb instead, since that tool has the full table.
    """
    hit = loader.resolve_word(word)
    if not hit:
        return {"found": False, "word": word}

    if hit.get("verbId"):
        return {
            "found": True,
            "is_verb_form": True,
            "infinitive": hit.get("lemma"),
            "english": hit.get("en"),
            "note": ("This is a conjugated verb form. Call lookup_verb with "
                     "the infinitive to get the full table and check the "
                     "exact person and tense."),
        }

    entry = loader.vocab_by_id(hit.get("vocabId")) if hit.get("vocabId") else None
    return {
        "found": True,
        "is_verb_form": False,
        "headword": entry["ro"] if entry else (hit.get("lemma") or hit.get("ro")),
        "english": hit.get("en"),
        "part_of_speech": hit.get("pos"),
        "register": entry.get("register") if entry else None,
        "example": entry.get("ex") if entry else None,
        "inferred": bool(hit.get("inferred")),
    }


@tool
def lookup_verb(word: str) -> dict:
    """Look up a Romanian verb by its infinitive or any conjugated form and
    return its full conjugation table: present, past, imperfect, future,
    conditional, subjunctive, imperative, and past participle. The table
    comes from the course's own conjugation engine, so it's safe to check
    an exact person/tense form against it directly.

    Args:
        word: an infinitive ("a merge") or any conjugated form ("merg",
            "mergeam", "mersese") found in the learner's text.

    Returns:
        The full verb entry with every tense, or {"found": False} if this
        verb isn't in the course.
    """
    hit = loader.resolve_word(word)
    verb_id = hit.get("verbId") if hit else None
    if not verb_id:
        return {"found": False, "word": word}
    verb = loader.verb_by_id(verb_id)
    if not verb:
        return {"found": False, "word": word}
    return {"found": True, **verb}


@tool
def lookup_grammar(topic: str) -> dict:
    """Search the course's grammar reference for a topic, e.g. "subjunctive",
    "definite article", "past tense", "word order". Matches against topic
    titles, categories, and rule text. A plain-English description is
    fine, it doesn't need to be an exact topic id.

    Args:
        topic: a keyword or short phrase naming the grammar point to check.

    Returns:
        Up to 3 matching grammar topics with their rule text and formation
        notes, or {"found": False} if nothing matches.
    """
    hits = loader.search_grammar(topic)[:3]
    if not hits:
        return {"found": False, "topic": topic}
    return {"found": True, "topics": hits}


@tool
def check_register(word: str) -> dict:
    """Check the register of a Romanian word or phrase (formal, informal,
    slang, regional, vulgar, etc.) before commenting on it, so a learner
    isn't told a slang or offensive word is simply "correct" with no
    caveat, or that a formal word is wrong just because it sounds stiff.

    Args:
        word: the Romanian word or phrase to check.

    Returns:
        {"found": True, "register": "..."} if the course flags this word's
        register, {"found": True, "register": None} if the word is known
        and unflagged (plain neutral/standard usage), or {"found": False}
        if the word isn't in the course at all.
    """
    hit = loader.resolve_word(word)
    if not hit:
        return {"found": False, "word": word}
    vocab_id = hit.get("vocabId")
    entry = loader.vocab_by_id(vocab_id) if vocab_id else None
    if not entry:
        return {"found": True, "word": word, "register": None}
    return {"found": True, "word": entry["ro"], "register": entry.get("register")}
