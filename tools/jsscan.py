# -*- coding: utf-8 -*-
"""A JavaScript-aware bracket scanner, good enough for this codebase.

Used by the refactor tooling to measure where a top-level declaration ends, so
functions can be moved out of index.html without guessing their boundaries.

It is a lexer, not a parser. It tracks exactly the states that can hide a brace
or a quote from a naive scan:

    line comments      //
    block comments     /* */
    strings            " ' `   (with backslash escapes)
    regex literals     /.../flags  (with escapes and character classes)

Each of those matters because of a bug that actually shipped:

  * Prose comments are full of apostrophes ("the learner's"). A scanner that
    tracks only quotes reads one as an unterminated string and stops counting
    braces from there on.

  * Regex literals contain braces and quotes. Without regex state, /}/ closes a
    function early and /["']/ opens a string that never ends. Measured against
    the real source, that made glossify look 249 KB long inside a 263 KB
    script, and the file as a whole measured 991 KB of functions -- an
    impossible figure that silently drove several boundary decisions before it
    was caught.

THE DIVISION AMBIGUITY

A forward slash is either division or the start of a regex, and telling them
apart needs context:

    x / y          division
    return /x/     regex

The rule used here: walk back over whitespace and comments to the previous
significant token. A regex may start when that token is an operator, an opening
bracket, a comma, a semicolon, a colon, nothing at all (start of input), or one
of the keywords after which an expression is expected. It is division when the
previous token is a value: an identifier, a number, a string, a closing paren or
a closing square bracket.

Known limits, deliberate:

  * After ')' this assumes division, which is right for `(a+b)/2` and wrong for
    `if (x) /re/.test(s)`. The latter does not occur in this codebase.
  * After '}' it assumes a regex may start, treating the brace as the end of a
    block rather than an object literal. `({a:1} / 2)` would be misread; it does
    not occur either.
  * ASI edge cases and `<!--` style HTML comments are not modelled.

Both assumptions are checked by test_jsscan.py against every top-level
declaration in the real source, so a future change that breaks them shows up as
an impossible or overlapping span rather than as a silent wrong number.
"""

# Keywords after which a '/' begins a regex rather than a division.
_REGEX_OK_WORDS = frozenset("""
return case throw typeof instanceof in of new delete void do else yield await
""".split())

# Characters after which a regex may begin.
_REGEX_OK_CHARS = frozenset("(,;:=!&|?+-*%<>~^[{}")

_FLAGS = frozenset("gimsuydv")


def _prev_significant(t, i):
    """Index of the last non-space, non-comment character before t[i], or -1."""
    j = i - 1
    while j >= 0:
        ch = t[j]
        if ch in " \t\r\n":
            j -= 1
            continue
        # end of a block comment: skip back over it
        if ch == "/" and j > 0 and t[j - 1] == "*":
            k = t.rfind("/*", 0, j)
            if k == -1:
                return -1
            j = k - 1
            continue
        return j
    return -1


def _starts_regex(t, i):
    """Is the '/' at t[i] the start of a regex literal rather than division?"""
    p = _prev_significant(t, i)
    if p < 0:
        return True                      # start of input: expression position
    ch = t[p]
    if ch in _REGEX_OK_CHARS:
        return True
    if ch.isalnum() or ch in "_$":
        # a word: regex only after keywords like `return`
        k = p
        while k >= 0 and (t[k].isalnum() or t[k] in "_$"):
            k -= 1
        word = t[k + 1:p + 1]
        if word.isdigit():
            return False                 # a number is a value
        return word in _REGEX_OK_WORDS
    if ch in ")]":
        return False                     # value position -> division
    if ch in "\"'`":
        return False                     # end of a string is a value
    return True


def _skip_string(t, j, n):
    """j points at the opening quote; return index just past the closing one."""
    q = t[j]
    j += 1
    while j < n:
        if t[j] == "\\":
            j += 2
            continue
        if t[j] == q:
            return j + 1
        j += 1
    return n


def _skip_regex(t, j, n):
    """j points at the opening '/'; return index just past the literal + flags.

    Handles escapes and character classes: inside [...] a '/' is literal and
    does not close the regex.
    """
    j += 1
    in_class = False
    while j < n:
        ch = t[j]
        if ch == "\\":
            j += 2
            continue
        if ch == "\n":
            return j                     # unterminated; bail rather than run away
        if in_class:
            if ch == "]":
                in_class = False
        elif ch == "[":
            in_class = True
        elif ch == "/":
            j += 1
            while j < n and t[j] in _FLAGS:
                j += 1
            return j
        j += 1
    return n


def span_end(t, i):
    """Index just past the bracket that opens at t[i] ('{' or '[')."""
    o, c = ("{", "}") if t[i] == "{" else ("[", "]")
    depth = 0
    j = i
    n = len(t)
    while j < n:
        ch = t[j]
        nxt = t[j + 1] if j + 1 < n else ""
        if ch == "/" and nxt == "/":
            k = t.find("\n", j)
            j = n if k == -1 else k + 1
            continue
        if ch == "/" and nxt == "*":
            k = t.find("*/", j + 2)
            j = n if k == -1 else k + 2
            continue
        if ch == "/" and _starts_regex(t, j):
            j = _skip_regex(t, j, n)
            continue
        if ch in "\"'`":
            j = _skip_string(t, j, n)
            continue
        if ch == o:
            depth += 1
        elif ch == c:
            depth -= 1
            if depth == 0:
                return j + 1
        j += 1
    return n


def strip_code(t):
    """Blank out comments, string bodies and regex literals.

    Leaves structure intact so free identifiers can be counted without matching
    words that only appear inside a string, a comment or a pattern.
    """
    out = []
    j = 0
    n = len(t)
    while j < n:
        ch = t[j]
        nxt = t[j + 1] if j + 1 < n else ""
        if ch == "/" and nxt == "/":
            k = t.find("\n", j)
            j = n if k == -1 else k
            continue
        if ch == "/" and nxt == "*":
            k = t.find("*/", j + 2)
            j = n if k == -1 else k + 2
            continue
        if ch == "/" and _starts_regex(t, j):
            j = _skip_regex(t, j, n)
            out.append(" __RE__ ")
            continue
        if ch in "\"'`":
            j = _skip_string(t, j, n)
            out.append(' "" ')
            continue
        out.append(ch)
        j += 1
    return "".join(out)
