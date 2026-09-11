# -*- coding: utf-8 -*-
"""Parse the JS object/array literals used in js/data/*.js into Python values.

The datasets are plain JS, not JSON: unquoted bareword keys, comments, and
occasional nesting (VOCAB's `ex:{ro,en}`, GRAMMAR_TOPICS' `formation:[...]`
arrays full of HTML tags and apostrophes). check_content.py and friends get
away with line-regex because they only ever pull a handful of flat fields;
grounding data needs the whole entry, so this is a real recursive-descent
parser instead of a wider regex.

Only the subset these files actually use is supported: double-quoted strings
(single quotes never appear as JS string delimiters here: confirmed by grep,
the few `'` characters that occur are apostrophes inside double-quoted
prose), //  and /* */ comments, objects, arrays, numbers, true/false/null.
No trailing commas appear in the data either; if one shows up, parsing fails
loudly rather than silently guessing, which matches how the rest of this
project prefers to fail.
"""
import re

_WS = " \t\r\n"
_KEY_RE = re.compile(r"[A-Za-z_$][A-Za-z0-9_$]*")
_NUM_RE = re.compile(r"-?\d+(\.\d+)?([eE][+-]?\d+)?")
_ESCAPES = {'n': '\n', 't': '\t', 'r': '\r', '"': '"', "'": "'",
            '\\': '\\', '/': '/', 'b': '\b', 'f': '\f'}


class JSLiteralError(ValueError):
    pass


def parse(text, pos=0):
    """Parse one JS value starting at `pos`. Returns (value, next_pos)."""
    pos = _skip(text, pos)
    if pos >= len(text):
        raise JSLiteralError("unexpected end of input")
    ch = text[pos]
    if ch == "{":
        return _parse_object(text, pos)
    if ch == "[":
        return _parse_array(text, pos)
    if ch == '"':
        return _parse_string(text, pos)
    if text.startswith("true", pos):
        return True, pos + 4
    if text.startswith("false", pos):
        return False, pos + 5
    if text.startswith("null", pos):
        return None, pos + 4
    m = _NUM_RE.match(text, pos)
    if m:
        s = m.group(0)
        val = float(s) if ("." in s or "e" in s or "E" in s) else int(s)
        return val, m.end()
    raise JSLiteralError("unexpected character %r at %d" % (ch, pos))


def parse_from(text, marker):
    """Find `marker` in `text`, then parse the JS value that follows the
    next '[' or '{' after it. Used to pull `var NAME = [...]` straight out
    of a region without hand-rolling the offset each time."""
    i = text.index(marker) + len(marker)
    j = i
    while text[j] not in "[{":
        j += 1
    value, end = parse(text, j)
    return value


def _skip(text, pos):
    """Advance past whitespace and comments."""
    n = len(text)
    while pos < n:
        ch = text[pos]
        if ch in _WS:
            pos += 1
            continue
        if ch == "/" and pos + 1 < n and text[pos + 1] == "/":
            nl = text.find("\n", pos)
            pos = n if nl == -1 else nl + 1
            continue
        if ch == "/" and pos + 1 < n and text[pos + 1] == "*":
            end = text.find("*/", pos + 2)
            pos = n if end == -1 else end + 2
            continue
        break
    return pos


def _parse_string(text, pos):
    i = pos + 1
    n = len(text)
    out = []
    while i < n:
        ch = text[i]
        if ch == "\\":
            nxt = text[i + 1]
            if nxt == "u":
                out.append(chr(int(text[i + 2:i + 6], 16)))
                i += 6
                continue
            out.append(_ESCAPES.get(nxt, nxt))
            i += 2
            continue
        if ch == '"':
            return "".join(out), i + 1
        out.append(ch)
        i += 1
    raise JSLiteralError("unterminated string starting at %d" % pos)


def _parse_array(text, pos):
    pos = _skip(text, pos + 1)
    items = []
    if text[pos] == "]":
        return items, pos + 1
    while True:
        val, pos = parse(text, pos)
        items.append(val)
        pos = _skip(text, pos)
        ch = text[pos]
        if ch == ",":
            pos = _skip(text, pos + 1)
            if text[pos] == "]":
                return items, pos + 1
            continue
        if ch == "]":
            return items, pos + 1
        raise JSLiteralError("expected ',' or ']' at %d, found %r" % (pos, ch))


def _parse_object(text, pos):
    pos = _skip(text, pos + 1)
    obj = {}
    if text[pos] == "}":
        return obj, pos + 1
    while True:
        pos = _skip(text, pos)
        if text[pos] == '"':
            key, pos = _parse_string(text, pos)
        else:
            m = _KEY_RE.match(text, pos)
            if not m:
                raise JSLiteralError("expected object key at %d" % pos)
            key, pos = m.group(0), m.end()
        pos = _skip(text, pos)
        if text[pos] != ":":
            raise JSLiteralError("expected ':' at %d" % pos)
        pos = _skip(text, pos + 1)
        val, pos = parse(text, pos)
        obj[key] = val
        pos = _skip(text, pos)
        ch = text[pos]
        if ch == ",":
            pos = _skip(text, pos + 1)
            if text[pos] == "}":
                return obj, pos + 1
            continue
        if ch == "}":
            return obj, pos + 1
        raise JSLiteralError("expected ',' or '}' at %d, found %r" % (pos, ch))
