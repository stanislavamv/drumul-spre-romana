"""
Pre-render Romanian pronunciation clips from Google Translate's TTS voice.

WHY THIS EXISTS
    Google's translate_tts endpoint refuses browser-originated requests: a page
    fetching it sends Sec-Fetch-Site: cross-site and an Origin/Referer that the
    endpoint treats as hotlinking, and returns an HTML error page instead of
    audio (the <audio> element then reports MEDIA_ELEMENT_ERROR code 4). Those
    headers are forbidden to JavaScript, so it cannot be worked around in-page.

    Fetching ahead of time from a non-browser client works, and has the further
    advantage that the finished course plays its audio offline with no runtime
    dependency on Google at all.

CAVEAT
    translate_tts is undocumented and not covered by Google's API terms for
    automated use. This script is deliberately slow and single-threaded. Keep it
    that way. For anything beyond personal study use the paid Cloud TTS API.

USAGE
    python tools/fetch_audio.py strings.json
    python tools/fetch_audio.py strings.json --limit 50     # try a small batch
    python tools/fetch_audio.py strings.json --retry-failed

    Writes  audio/<hash>.mp3  and  audio-manifest.js
    Safe to re-run: existing clips are skipped, so an interrupted run resumes.
"""

import argparse
import hashlib
import io
import json
import os
import random
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request


# Progress lines echo the Romanian text being fetched, and a Windows console
# defaults to cp1252, which cannot encode ă/ș/ț. Without this the script dies on
# its own logging partway through a run — nothing to do with the download.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
AUDIO_DIR = os.path.join(ROOT, "audio")
MANIFEST = os.path.join(ROOT, "audio-manifest.js")
FAILLOG = os.path.join(HERE, "failed.json")

MAX_CHARS = 190          # endpoint truncates beyond ~200
MIN_DELAY, MAX_DELAY = 1.1, 2.4   # be a considerate client
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")


def strip_diacritics(s):
    nfkd = unicodedata.normalize("NFKD", s)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def norm_key(s):
    """Must mirror normLoose() in index.html so lookups agree at runtime."""
    s = (s.replace("ş", "ș").replace("Ş", "Ș")
          .replace("ţ", "ț").replace("Ţ", "Ț"))
    s = s.strip().lower()
    for ch in '.,!?;:()"„”«»':
        s = s.replace(ch, "")
    s = " ".join(s.split())
    return strip_diacritics(s)


def clip_name(text):
    return hashlib.sha1(norm_key(text).encode("utf-8")).hexdigest()[:16] + ".mp3"


def chunk(text):
    """Split on sentence, then clause, then word boundaries under the cap."""
    text = " ".join(text.split())
    if len(text) <= MAX_CHARS:
        return [text] if text else []
    out, buf = [], ""
    import re
    for part in re.findall(r"[^.!?…]+[.!?…]*\s*", text) or [text]:
        if len(buf) + len(part) > MAX_CHARS:
            if buf.strip():
                out.append(buf.strip())
            while len(part) > MAX_CHARS:
                cut = part.rfind(",", 0, MAX_CHARS)
                if cut < 40:
                    cut = part.rfind(" ", 0, MAX_CHARS)
                if cut < 40:
                    cut = MAX_CHARS
                out.append(part[:cut].strip())
                part = part[cut:]
            buf = part
        else:
            buf += part
    if buf.strip():
        out.append(buf.strip())
    return [c for c in out if c]


def fetch_chunk(text, idx, total):
    url = ("https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ro"
           "&q=" + urllib.parse.quote(text) +
           "&textlen=%d&idx=%d&total=%d" % (len(text), idx, total))
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "audio/mpeg,*/*",
        "Accept-Language": "ro,en;q=0.8",
    })
    with urllib.request.urlopen(req, timeout=25) as r:
        ctype = r.headers.get("Content-Type", "")
        data = r.read()
    if "audio" not in ctype:
        raise RuntimeError("expected audio, got %s (%d bytes)" % (ctype, len(data)))
    if len(data) < 400:
        raise RuntimeError("suspiciously small response (%d bytes)" % len(data))
    return data


def fetch(text):
    """Return concatenated MPEG frames for text (chunked if long)."""
    parts = chunk(text)
    blobs = []
    for i, c in enumerate(parts):
        blobs.append(fetch_chunk(c, i, len(parts)))
        if i + 1 < len(parts):
            time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))
    # Plain MPEG frame concatenation plays back as one continuous clip.
    return b"".join(blobs)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("strings", help="JSON array of Romanian strings")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--retry-failed", action="store_true")
    args = ap.parse_args()

    with io.open(args.strings, encoding="utf-8") as fh:
        strings = json.load(fh)

    if args.retry_failed and os.path.exists(FAILLOG):
        with io.open(FAILLOG, encoding="utf-8") as fh:
            strings = json.load(fh)
        print("retrying %d previously failed strings" % len(strings))

    os.makedirs(AUDIO_DIR, exist_ok=True)

    # Deduplicate by the key the runtime will look up.
    seen, todo = {}, []
    for s in strings:
        s = (s or "").strip()
        if not s or s == "—":
            continue
        k = norm_key(s)
        if k and k not in seen:
            seen[k] = s
            todo.append(s)

    if args.limit:
        todo = todo[:args.limit]

    print("%d unique strings" % len(todo))
    done, skipped, failed = 0, 0, []

    for n, text in enumerate(todo, 1):
        path = os.path.join(AUDIO_DIR, clip_name(text))
        if os.path.exists(path) and os.path.getsize(path) > 400:
            skipped += 1
            continue
        try:
            data = fetch(text)
            with open(path, "wb") as fh:
                fh.write(data)
            done += 1
            print("  [%d/%d] %-46s %6d B" % (n, len(todo), text[:44], len(data)))
        except Exception as exc:
            failed.append(text)
            print("  [%d/%d] FAILED %-40s %s" % (n, len(todo), text[:38], exc))
            if len(failed) >= 8 and done == 0:
                print("\nAborting: nothing is downloading. The endpoint is most "
                      "likely rate-limiting or blocking this IP. Wait and retry.")
                break
        time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

    write_manifest()
    if failed:
        with io.open(FAILLOG, "w", encoding="utf-8") as fh:
            json.dump(failed, fh, ensure_ascii=False, indent=1)
    elif os.path.exists(FAILLOG):
        # Clear it on a clean run. Leaving a stale list behind makes a finished
        # fetch look like it still has outstanding failures.
        os.remove(FAILLOG)

    print("\ndownloaded %d | already had %d | failed %d" % (done, skipped, len(failed)))
    if failed:
        print("failures saved to %s — re-run with --retry-failed" % FAILLOG)


def stamp_manifest_tag():
    """Point index.html at the manifest by content hash, to defeat caching.

    The manifest is pulled in with a plain <script src>, so a browser that has
    seen it once will happily keep serving the old copy after a regeneration —
    silently, and for as long as its heuristic cache holds. That looks exactly
    like missing audio: the page reports words as having no clip when the clip
    is sitting on disk. It cost a confused round of debugging once already.

    Hashing the file and putting that in the query string means the URL changes
    if and only if the content does, so a rebuild always lands and an unchanged
    manifest still gets cached.
    """
    index = os.path.join(ROOT, "index.html")
    if not os.path.exists(index):
        return
    with open(MANIFEST, "rb") as fh:
        digest = hashlib.sha1(fh.read()).hexdigest()[:10]
    with io.open(index, encoding="utf-8") as fh:
        html = fh.read()
    pattern = re.compile(r'(<script src="audio-manifest\.js)(\?v=[0-9a-f]+)?(")')
    new_html, n = pattern.subn(lambda m: m.group(1) + "?v=" + digest + m.group(3), html)
    if n and new_html != html:
        with io.open(index, "w", encoding="utf-8", newline="") as fh:
            fh.write(new_html)
        print("stamped index.html -> audio-manifest.js?v=%s" % digest)


def write_manifest():
    """Regenerate audio-manifest.js from whatever is on disk."""
    entries = {}
    for text in ALL_KNOWN:
        name = clip_name(text)
        p = os.path.join(AUDIO_DIR, name)
        if os.path.exists(p) and os.path.getsize(p) > 400:
            entries[norm_key(text)] = "audio/" + name
    with io.open(MANIFEST, "w", encoding="utf-8") as fh:
        fh.write("/* Generated by tools/fetch_audio.py — do not edit by hand.\n"
                 "   Maps normalised Romanian text to a pre-rendered clip. */\n")
        fh.write("window.AUDIO_MANIFEST = ")
        json.dump(entries, fh, ensure_ascii=False, indent=0, sort_keys=True)
        fh.write(";\n")
    print("wrote %s (%d clips)" % (os.path.basename(MANIFEST), len(entries)))
    stamp_manifest_tag()


ALL_KNOWN = []

if __name__ == "__main__":
    with io.open(sys.argv[1], encoding="utf-8") as _fh:
        ALL_KNOWN = [s for s in json.load(_fh) if s and s.strip() and s.strip() != "—"]
    main()
