# -*- coding: utf-8 -*-
"""Where the tools read course data from.

The content datasets used to sit inside index.html and the tools sliced them
out of it with adjacency markers -- region("var VOCAB", "var DIALOGUES"),
region("var EXERCISES", "var LESSONS") and so on. The data now lives in
js/data/*.js, so this module rebuilds the text those markers expect.

data_source() concatenates the data files in their original document order.
That is the whole trick: because the order is unchanged, every existing
region() call slices exactly the span it sliced before, and no tool's logic
had to be rewritten. It also preserves the quirks -- region("var READING_TEXTS",
"var CORE_GLOSS") still runs through EXERCISES and LESSONS the way it always
did, which is harmless because the regexes reading it are specific, but it is
behaviour this refactor deliberately did not change.

If a dataset ever moves between files, or DATA_FILES is reordered, the tools
will silently scan different spans. Keep this list in step with the script tags
in index.html.
"""
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "js", "data")
INDEX = os.path.join(ROOT, "index.html")

# Document order. Not alphabetical, not thematic -- see the note above.
DATA_FILES = [
    "courses.js",    # COURSES, LEVELS, UNITS
    "verbs.js",      # conjugation tables, VERBS
    "grammar.js",    # GRAMMAR_TOPICS
    "vocab.js",      # VOCAB
    "texts.js",      # DIALOGUES, READING_TEXTS
    "exercises.js",  # EXERCISES
    "lessons.js",    # LESSONS
    "reference.js",  # CORE_GLOSS and the small lookup tables
]


def data_source():
    """The data files concatenated in document order, as one string."""
    parts = []
    for name in DATA_FILES:
        path = os.path.join(DATA_DIR, name)
        if not os.path.exists(path):
            raise SystemExit(
                "missing data file: %s\n"
                "Course data lives in js/data/*.js. If you moved or renamed it, "
                "update DATA_FILES in tools/_sources.py as well." % path)
        parts.append(io.open(path, encoding="utf-8").read())
    return "\n".join(parts)


def index_source():
    """index.html itself, for tools that inspect the application shell."""
    return io.open(INDEX, encoding="utf-8").read()


def region_reader(src):
    """region(start[, end]) over `src`.

    `end` is looked up *after* `start` rather than globally: the datasets are
    not in the order you might guess, and a global lookup silently slices
    backwards into an empty region, which reads as "every id is dangling".
    That bug has been shipped here before.
    """
    def region(start, end=None):
        i = src.index(start)
        return src[i:src.index(end, i)] if end else src[i:]
    return region
