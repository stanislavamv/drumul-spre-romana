"""
Check the course's verb tables against English Wiktionary.

WHY THIS EXISTS
    Most conjugations in index.html are produced by a small engine from the
    infinitive plus a conjugation class. That is fine for the regular core of
    the system and wrong in exactly the places a learner most needs to be right,
    so the generated forms have to be checked against something rather than
    trusted. An audit run already caught the engine inventing "zici!", "pui!"
    and "deschizi!" as singular imperatives, none of which are Romanian.

WHY WIKTIONARY AND NOT conjugare.ro
    conjugare.ro has no API, and its tables are a copyrighted database on a
    commercial site — scraping it wholesale to populate this course would be
    taking someone's work. Wiktionary exposes a documented MediaWiki API and is
    CC BY-SA, so it can be queried politely and cited. It is not infallible;
    treat a mismatch as "one of these two is wrong, go look", not as proof the
    course is wrong.

USAGE
    python tools/verify_verbs.py                 # every verb
    python tools/verify_verbs.py a zice a pune   # just these
    python tools/verify_verbs.py --imperatives   # only the imperative column

    Writes tools/verb-report.json and prints a summary of disagreements.
"""

import io
import json
import os
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, "index.html")
REPORT = os.path.join(HERE, "verb-report.json")

API = "https://en.wiktionary.org/w/api.php"
UA = "romanian-course-verifier/1.0 (personal study project; contact via repo)"
DELAY = 2.5          # be a considerate client; this is a donated service


def norm(s):
    """Compare forms ignoring case, punctuation and the cedilla/comma variants."""
    s = (s or "").replace("ş", "ș").replace("ţ", "ț")
    s = s.strip().lower().strip("!.,")
    return " ".join(s.split())


def fetch_wikitext(page, tries=4):
    """One page of wikitext, backing off when the API asks us to.

    Wiktionary answers 429 readily for unthrottled sequential requests. Backing
    off is the difference between a report full of "lookup failed" and one that
    actually says something about the verbs.
    """
    url = API + "?" + urllib.parse.urlencode({
        "action": "parse", "page": page, "prop": "wikitext",
        "format": "json", "formatversion": "2",
    })
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    wait = 3.0
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=25) as r:
                data = json.load(r)
            if "error" in data:
                return None
            return data.get("parse", {}).get("wikitext", "")
        except urllib.error.HTTPError as exc:
            if exc.code == 429 and attempt < tries - 1:
                retry_after = exc.headers.get("Retry-After")
                pause = float(retry_after) if (retry_after or "").isdigit() else wait
                print("    (rate limited, waiting %.0fs)" % pause)
                time.sleep(pause)
                wait *= 2
                continue
            if exc.code == 404:
                return None
            raise
    return None


def wiktionary_facts(bare_inf):
    """Principal parts + transitivity for one verb, or None if not covered.

    en.wiktionary states a Romanian verb as {{ro-verb|infinitive|participle|
    subjunctive-3rd}}, which is exactly the set the engine derives everything
    else from — so agreement here validates the generated tables broadly.
    """
    txt = fetch_wikitext(bare_inf)
    if not txt:
        return None
    i = txt.find("==Romanian==")
    if i < 0:
        return None
    seg = txt[i:]
    # Stop at the next LANGUAGE heading. "\n==" also matches "\n===Etymology===",
    # which truncated the section before the verb template every single time and
    # made every verb look absent from Wiktionary.
    nxt = re.search(r"\n==[^=]", seg[3:])
    if nxt:
        seg = seg[:nxt.start() + 3]

    m = re.search(r"\{\{ro-verb\|([^}]*)\}\}", seg)
    if not m:
        return None
    parts = [p.strip() for p in m.group(1).split("|") if "=" not in p]
    facts = {
        "infinitive": parts[0] if len(parts) > 0 else None,
        "participle": parts[1] if len(parts) > 1 else None,
        "subj3":      parts[2] if len(parts) > 2 else None,
        "transitive": bool(re.search(r"\{\{lb\|ro\|[^}]*transitive", seg))
                      and not re.search(r"\{\{lb\|ro\|[^}]*intransitive", seg),
        "intransitive": bool(re.search(r"\{\{lb\|ro\|[^}]*intransitive", seg)),
    }
    return facts


def course_verbs():
    """Pull id / infinitive / group / declared irregular forms out of index.html.

    A regex over the data literal rather than a JS parse: the file is one big
    script and there is no JS runtime on this machine.
    """
    src = io.open(SRC, encoding="utf-8").read()
    start = src.index("var VERBS")
    end = src.index("var GRAMMAR_TOPICS", start)
    block = src[start:end]
    out = []
    for m in re.finditer(r'\{id:"(v_[a-z_0-9]+)",\s*inf:"([^"]+)"', block):
        chunk = block[m.start():m.start() + 1400]
        stop = chunk.find('\n {id:"')
        if stop > 0:
            chunk = chunk[:stop]
        grp = re.search(r'group:"([^"]*)"', chunk)
        part = re.search(r'participle:"([^"]*)"', chunk)
        subj = re.search(r'subj3:"([^"]*)"', chunk)
        # imperative:{tu:null} is a deliberate "this verb has no imperative"
        # (a părea — nobody commands someone to seem). Distinct from the key
        # being absent, which means nobody has looked at it yet.
        imp = re.search(r'imperative:\s*\{tu:"([^"]*)"', chunk)
        imp_none = bool(re.search(r'imperative:\s*\{tu:null', chunk))
        out.append({
            "id": m.group(1),
            "inf": m.group(2),
            "bare": re.sub(r"^a\s+(se\s+)?", "", m.group(2)),
            "group": grp.group(1) if grp else "",
            "participle": part.group(1) if part else None,
            "subj3": subj.group(1) if subj else None,
            "imperative_tu": imp.group(1) if imp else None,
            "imperative_none": imp_none,
            "reflexive": m.group(2).startswith("a se "),
        })
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    only_imp = "--imperatives" in sys.argv

    verbs = course_verbs()
    if args:
        wanted = {norm(a) for a in args}
        verbs = [v for v in verbs if norm(v["inf"]) in wanted or norm(v["bare"]) in wanted]

    print("checking %d verbs against en.wiktionary\n" % len(verbs))
    report, issues, missing = [], 0, 0

    for n, v in enumerate(verbs, 1):
        try:
            facts = wiktionary_facts(v["bare"])
        except Exception as exc:
            print("  %-22s lookup failed: %s" % (v["inf"], exc))
            time.sleep(DELAY)
            continue

        if not facts:
            missing += 1
            report.append({"inf": v["inf"], "status": "not-on-wiktionary"})
            time.sleep(DELAY)
            continue

        notes = []
        if v["participle"] and facts["participle"] \
                and norm(v["participle"]) != norm(facts["participle"]):
            notes.append("participle: course %s / wiktionary %s"
                         % (v["participle"], facts["participle"]))
        if v["subj3"] and facts["subj3"] and norm(v["subj3"]) != norm(facts["subj3"]):
            notes.append("subjunctive 3rd: course %s / wiktionary %s"
                         % (v["subj3"], facts["subj3"]))
        # The singular imperative is not derivable for classes II/III/IV, so the
        # course must declare it there. Flag anything left undeclared.
        if v["group"] in ("II", "III", "IV") and not v["imperative_tu"] \
                and not v["imperative_none"]:
            notes.append("no singular imperative declared (class %s cannot derive one; "
                         "wiktionary marks it %s)"
                         % (v["group"],
                            "transitive" if facts["transitive"]
                            else "intransitive" if facts["intransitive"] else "unmarked"))

        if only_imp:
            notes = [x for x in notes if "imperative" in x]

        entry = {"inf": v["inf"], "group": v["group"], "wiktionary": facts, "notes": notes}
        report.append(entry)
        if notes:
            issues += 1
            print("  %-22s %s" % (v["inf"], notes[0]))
            for extra in notes[1:]:
                print("  %-22s %s" % ("", extra))

        if n % 25 == 0:
            print("  ... %d/%d" % (n, len(verbs)))
        time.sleep(DELAY)

    with io.open(REPORT, "w", encoding="utf-8") as fh:
        json.dump(report, fh, ensure_ascii=False, indent=1)

    print("\n%d verbs checked | %d with disagreements | %d not on wiktionary"
          % (len(verbs), issues, missing))
    print("full report: %s" % REPORT)
    print("\nWiktionary content is CC BY-SA. It is a cross-check, not an authority —"
          "\nwhere the two disagree, look the form up properly before changing it.")


if __name__ == "__main__":
    main()
