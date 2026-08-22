"""Content-hash every local <script src> and <link stylesheet> in index.html
and stamp it with a ?v=<hash> query string, so a browser that has already
cached a file cannot silently keep serving it after an edit.

Generalises tools/fetch_audio.py's stamp_manifest_tag() to the rest of the
extracted assets. See docs/TECH_DEBT.md, "Only the audio manifest is
cache-busted; the other 27 assets are not" (now fixed by this script) for why
this exists: an edit to an extracted module could appear to do nothing,
because the file loads from the browser's cache with no error and no visual
sign of staleness. Hashing means the URL changes if and only if the content
does, so a rebuild always lands and an unchanged file still gets cached.

audio-manifest.js is deliberately NOT handled here -- it has its own stamping
in fetch_audio.py, run as part of that pipeline, not by hand after editing a
core/feature module.

Usage:
    python tools/stamp_assets.py

Run it after editing any file under js/ or css/. It is idempotent: re-running
with no file changes rewrites nothing.
"""
import hashlib
import io
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "index.html")

TAG = re.compile(
    r'(<(?:script src|link rel="stylesheet" href)="(js/[^"?]+|css/[^"?]+))'
    r'(\?v=[0-9a-f]+)?(")'
)


def digest_of(rel_path):
    path = os.path.join(ROOT, rel_path)
    with open(path, "rb") as fh:
        return hashlib.sha1(fh.read()).hexdigest()[:10]


def main():
    with io.open(INDEX, encoding="utf-8") as fh:
        html = fh.read()

    changed, unchanged, missing = [], [], []

    def repl(m):
        prefix, rel_path, old_v, quote = m.group(1), m.group(2), m.group(3), m.group(4)
        try:
            digest = digest_of(rel_path)
        except OSError:
            missing.append(rel_path)
            return m.group(0)
        new_v = "?v=" + digest
        if old_v == new_v:
            unchanged.append(rel_path)
        else:
            changed.append((rel_path, old_v, new_v))
        return prefix + new_v + quote

    new_html = TAG.sub(repl, html)

    if missing:
        print("MISSING (left untouched):")
        for rel_path in missing:
            print("  %s" % rel_path)

    if new_html != html:
        with io.open(INDEX, "w", encoding="utf-8", newline="") as fh:
            fh.write(new_html)
        print("stamped %d asset(s):" % len(changed))
        for rel_path, old_v, new_v in changed:
            print("  %-40s %s -> %s" % (rel_path, old_v or "(none)", new_v))
    else:
        print("no changes needed")

    print("%d asset(s) already up to date" % len(unchanged))
    if missing:
        sys.exit(1)


if __name__ == "__main__":
    main()
