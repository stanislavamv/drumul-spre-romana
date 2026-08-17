# -*- coding: utf-8 -*-
"""Tests for tools/jsscan.py.

Two layers:

  1. Synthetic cases pinning the lexer states, especially the division-vs-regex
     decision that the scanner has to make from context.

  2. Invariants checked against the real index.html, because the synthetic
     cases cannot catch a boundary that is merely plausible. A declaration span
     that runs past the next declaration, overlaps a sibling, or makes the file
     measure larger than it is, is wrong no matter how many unit tests pass.

    python tools/test_jsscan.py

No network, no browser. Exits non-zero on failure.
"""
import io
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")   # cp1252 consoles cannot print ș/ț
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

from jsscan import span_end, strip_code

failures = []


def check(name, got, want):
    if got == want:
        print("  ok    %s" % name)
    else:
        failures.append(name)
        print("  FAIL  %s: got %r, want %r" % (name, got, want))


# ---------------------------------------------------------------- synthetic
# Each source is one function; the span must end at the final closing brace,
# i.e. at the very end of the (right-stripped) source.
SPAN_CASES = [
    ("plain function",            "function a(){\n  return x + 1;\n}"),
    ("division",                  "function a(){\n  return p / q;\n}"),
    ("chained division",          "function a(){\n  return p / q / r;\n}"),
    ("division after ]",          "function a(){\n  return arr[0] / 2;\n}"),
    ("division after )",          "function a(){\n  return (p+q) / 2;\n}"),
    ("basic regex",               "function a(){\n  return /ab/.test(x);\n}"),
    ("regex containing }",        "function a(){\n  return /}/.test(x);\n}"),
    ("regex containing {",        "function a(){\n  return /a{2,3}/.test(x);\n}"),
    ("regex containing parens",   "function a(){\n  return /(a|b)/.test(x);\n}"),
    ("regex containing quotes",   "function a(){\n  return /[\"']/.test(x);\n}"),
    ("regex char class",          "function a(){\n  return /[a-z]+/.test(x);\n}"),
    ("slash inside char class",   "function a(){\n  return /[a-z/]+/.test(x);\n}"),
    ("escaped slash",             "function a(){\n  return /foo\\/bar/.test(x);\n}"),
    ("regex flags",               "function a(){\n  return /ab/gimsuy.test(x);\n}"),
    ("regex after return",        "function a(){\n  return /x/;\n}"),
    ("regex after assignment",    "function a(){\n  var r = /x{1}/;\n  return r;\n}"),
    ("regex after (",             "function a(){\n  return t.replace(/[{}]/g, '');\n}"),
    ("regex after comma",         "function a(){\n  return f(1, /[)]/, 2);\n}"),
    ("regex after :",             "function a(){\n  var o = {k: /[}]/};\n  return o;\n}"),
    ("regex after &&",            "function a(){\n  return x && /[{]/.test(y);\n}"),
    ("regex after !",             "function a(){\n  return !/[}]/.test(y);\n}"),
    ("regex then division",       "function a(){\n  var r = /a/; return p / q;\n}"),
    ("string with brace",         "function a(){\n  return \"}\";\n}"),
    ("string with apostrophe",    "function a(){\n  return \"the learner's\";\n}"),
    ("comment with brace",        "function a(){\n  /* } */\n  return 1;\n}"),
    ("comment with apostrophe",   "function a(){\n  // the learner's\n  return 1;\n}"),
    ("line comment with slash",   "function a(){\n  // a/b\n  return 1;\n}"),
    ("template literal",          "function a(){\n  return `a}b`;\n}"),
    ("nested braces",             "function a(){\n  if(x){ y(); }\n  return 1;\n}"),
]

print("synthetic span cases")
for name, src in SPAN_CASES:
    check(name, span_end(src, src.index("{")), len(src))

# strip_code must remove pattern bodies, not structure
print("\nstrip_code")
check("regex body removed",
      "abc" in strip_code("var r = /abc/;"), False)
check("string body removed",
      "hello" in strip_code('var s = "hello";'), False)
check("comment body removed",
      "secret" in strip_code("// secret\nvar x = 1;"), False)
check("identifier kept",
      "myVar" in strip_code("var myVar = /abc/;"), True)
check("division not eaten",
      "q" in strip_code("var z = p / q;"), True)

# ------------------------------------------------------------- real source
src = io.open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
JS0 = src.index("<script>", src.index("audio-manifest")) + len("<script>")
js = src[JS0:src.rindex("</script>")]

decls = sorted((m.start(), m.group(1)) for m in
               re.finditer(r"^function\s+(\w+)\s*\(", js, re.M))
starts = [d[0] for d in decls] + [len(js)]
spans = [(nm, st, span_end(js, js.index("{", st))) for st, nm in decls]

print("\nreal source (%d top-level functions, script %d bytes)" % (len(decls), len(js)))

over = [(nm, en - starts[i + 1]) for i, (nm, st, en) in enumerate(spans)
        if en > starts[i + 1]]
check("no span runs past the next declaration", over, [])

bad = [(nm, st, en) for nm, st, en in spans if en <= st]
check("no zero or negative spans", bad, [])

overlaps = [(spans[i][0], spans[i + 1][0]) for i in range(len(spans) - 1)
            if spans[i][2] > spans[i + 1][1]]
check("no overlapping spans", overlaps, [])

total = sum(en - st for _, st, en in spans)
check("sum of spans fits inside the script", total <= len(js), True)

huge = [nm for nm, st, en in spans if (en - st) > len(js) // 4]
check("no single function is a quarter of the file", huge, [])

# Functions that previously overran, with independently derived ends.
def truth_end(i):
    seg = js[starts[i]:starts[i + 1]]
    k = seg.rfind("\n}")
    return starts[i] + k + 2 if k != -1 else starts[i + 1]

print("\nregression: functions that used to overrun")
for name in ("glossify", "glossCoverage", "checkAgreementStructures",
             "sentencesOf", "glossLookup", "numberToken"):
    i = next((k for k, d in enumerate(decls) if d[1] == name), None)
    if i is None:
        continue
    check("%s bounded correctly" % name, spans[i][2], truth_end(i))

print()
if failures:
    print("FAILED: %d" % len(failures))
    for f in failures:
        print("   - %s" % f)
    sys.exit(1)
print("all %d checks passed" % (len(SPAN_CASES) + 5 + 5 + 6))
