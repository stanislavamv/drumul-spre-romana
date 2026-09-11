# -*- coding: utf-8 -*-
"""Mirrors unifyRomanian / norm / stripDiacritics / normLoose from js/core/utils.js.

Lookup keys in gloss_index.json were built with the app's own normLoose(), so
a query has to go through the same normalization to hit them. This is a
handful of character substitutions with no linguistic judgment involved --
unlike the conjugation engine, there's no risk of "inventing" a wrong answer
by reimplementing it, only of drifting out of sync if utils.js changes. Keep
it byte-for-byte in step with that file.
"""
import re

_PUNCT_RE = re.compile(r'[.,!?;:()"„”«»]')
_WS_RE = re.compile(r"\s+")


def unify_romanian(s):
    s = "" if s is None else str(s)
    return (s.replace("ş", "ș").replace("Ş", "Ș")
             .replace("ţ", "ț").replace("Ţ", "Ț"))


def norm(s):
    s = unify_romanian(s).strip().lower()
    s = _PUNCT_RE.sub("", s)
    return _WS_RE.sub(" ", s)


def strip_diacritics(s):
    s = "" if s is None else str(s)
    return (s.replace("ă", "a").replace("â", "a").replace("î", "i")
             .replace("ș", "s").replace("ț", "t"))


def norm_loose(s):
    return strip_diacritics(norm(s))
