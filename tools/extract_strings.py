"""Extract every Romanian string needing audio, straight from index.html.

Avoids the browser round-trip: reads the JS data literals and pulls the fields
that get a play button. Mirrors window.__roAudioStrings() in index.html.
"""
import io, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "index.html")

src = io.open(SRC, encoding="utf-8").read()

# Only scan the data region, not the UI code below it.
start = src.index("var LEVELS")
end = src.index("function lessonsOfUnit")
data = src[start:end]

out, seen = [], set()


def add(s):
    s = (s or "").strip()
    if not s or s == "—":
        return
    if s not in seen:
        seen.add(s)
        out.append(s)


def grab(pattern):
    for m in re.finditer(pattern, data):
        add(m.group(1))


STR = r'"((?:[^"\\]|\\.)*)"'

# ro:"..."  — vocabulary headwords, examples, grammar examples, dialogue lines
grab(r'\bro:\s*' + STR)
# inf:"..." — verb infinitives
grab(r'\binf:\s*' + STR)
# audio:"..." — exercise audio prompts
grab(r'\baudio:\s*' + STR)
# answer:"..." — expected answers get a play button in feedback
grab(r'\banswer:\s*' + STR)
# model:"..." — the model answer shown for open-ended writing tasks also has
# a play button, and is long enough to need sentence-level clips too.
for m in re.finditer(r'\bmodel:\s*' + STR, data):
    t = " ".join(m.group(1).replace("\\n", " ").split())
    add(t)
    for sent in re.findall(r"[^.!?…]+[.!?…]*", t):
        sent = sent.strip()
        if len(sent) > 1:
            add(sent)

# Verb conjugation tables: eu/tu/el/noi/voi/ei inside tense objects
for m in re.finditer(r'\b(?:eu|tu|el|noi|voi|ei):\s*' + STR, data):
    add(m.group(1))
# Imperative forms
for m in re.finditer(r'imperative:\s*\{[^}]*\}', data):
    for s in re.finditer(STR, m.group(0)):
        add(s.group(1))
# audioFor:[...] — minimal pair clips
for m in re.finditer(r'audioFor:\s*\[([^\]]*)\]', data):
    for s in re.finditer(STR, m.group(1)):
        add(s.group(1))
# match pairs: first element of each pair
for m in re.finditer(r'pairs:\s*\[(.*?)\]\s*,\s*\n', data, re.S):
    for pair in re.finditer(r'\[' + STR + r'\s*,', m.group(1)):
        add(pair.group(1))

# Reading texts play sentence by sentence (see sentencesOf() in index.html),
# so each sentence needs its own clip as well as the whole passage.
for m in re.finditer(r'\bro:\s*"((?:[^"\\]|\\.)*)"', data):
    t = " ".join(m.group(1).replace("\\n", " ").split())
    if len(t) > 200:
        add(t)
        for sent in re.findall(r"[^.!?…]+[.!?…]*", t):
            sent = sent.strip()
            if len(sent) > 1:
                add(sent)

# Click-to-gloss speaks a SINGLE word, so every word a reader can click needs
# its own clip — otherwise the popup opens in silence, which is the most common
# moment a learner actually wants to hear the pronunciation.
WORD_SPLIT = re.compile(r"[^0-9A-Za-zĂÂÎȘȚăâîșțşţ'\-]+")
# Real one-letter Romanian words — the indefinite article, the infinitive
# marker, the short form of 'este'. Everything else of length 1 is noise.
SINGLE_LETTER_WORDS = {"o", "a", "e", "i"}

def add_words(source):
    for w in WORD_SPLIT.split(source.replace("\\n", " ")):
        w = w.strip("-'")
        if not w or w.isdigit():
            continue
        if len(w) == 1 and w.lower() not in SINGLE_LETTER_WORDS:
            continue
        add(w)

for m in re.finditer(r'\bro:\s*"((?:[^"\\]|\\.)*)"', data):
    add_words(m.group(1))

# Exercise prompts, options, given sentences and model answers are ALSO
# click-to-gloss on the page, so their words need clips too. Only pull from
# strings that actually look Romanian, to avoid fetching English instructions.
def looks_romanian(s):
    if re.search(r"[ăâîșțĂÂÎȘȚ]", s):
        return True
    ro_markers = re.findall(r"\b(este|sunt|am|și|să|nu|cu|la|în|de|un|o|mai)\b", s)
    return len(ro_markers) >= 2

EX_REGION = src[src.index("var EXERCISES"):src.index("var LESSONS")]
for field in (r'\bprompt:\s*', r'\bgiven:\s*', r'\bmodel:\s*'):
    for m in re.finditer(field + STR, EX_REGION):
        txt = re.sub(r"<[^>]+>", " ", m.group(1))
        if looks_romanian(txt):
            add_words(txt)
for m in re.finditer(r'\bopts?:\s*\[([^\]]*)\]|\boptions:\s*\[([^\]]*)\]', EX_REGION):
    block = m.group(1) or m.group(2) or ""
    for s in re.finditer(STR, block):
        if looks_romanian(s.group(1)):
            add_words(s.group(1))
# Dialogue lines and glossary keys are clickable too.
for m in re.finditer(r'glossary:\s*\{([^}]*)\}', data, re.S):
    for s in re.finditer(STR, m.group(1)):
        val = s.group(1)
        if re.match(r"^[0-9A-Za-zĂÂÎȘȚăâîșț\- ]+$", val) and len(val) >= 2:
            add(val)

# Numerals in reading texts are clickable and speak their Romanian reading
# (1859 -> "o mie opt sute cincizeci și nouă"), so those readings need clips
# too. This mirrors romanianNumber() in index.html; if you change the rules
# there, change them here.
ONES = ["zero", "unu", "doi", "trei", "patru", "cinci", "șase", "șapte", "opt", "nouă"]
ONES_F = ["zero", "una", "două", "trei", "patru", "cinci", "șase", "șapte", "opt", "nouă"]
TEENS = ["zece", "unsprezece", "doisprezece", "treisprezece", "paisprezece",
         "cincisprezece", "șaisprezece", "șaptesprezece", "optsprezece", "nouăsprezece"]
TENS = ["", "", "douăzeci", "treizeci", "patruzeci", "cincizeci",
        "șaizeci", "șaptezeci", "optzeci", "nouăzeci"]


def needs_de(n):
    n = abs(int(n))
    if n < 20:
        return False
    last_two = n % 100
    return not (1 <= last_two <= 19)


def ro_number(n, feminine=False):
    n = abs(int(n))
    ones = ONES_F if feminine else ONES
    if n < 10:
        return ones[n]
    if n < 20:
        return TEENS[n - 10]
    if n < 100:
        t, u = divmod(n, 10)
        return TENS[t] + (" și " + ones[u] if u else "")
    if n < 1000:
        h, rest = divmod(n, 100)
        head = "o sută" if h == 1 else ONES_F[h] + " sute"
        return head + (" " + ro_number(rest, feminine) if rest else "")
    if n < 1000000:
        th, rest = divmod(n, 1000)
        head = "o mie" if th == 1 else ro_number(th, True) + (" de mii" if needs_de(th) else " mii")
        return head + (" " + ro_number(rest, feminine) if rest else "")
    mil, rest = divmod(n, 1000000)
    head = ("un milion" if mil == 1
            else ro_number(mil, True) + (" de milioane" if needs_de(mil) else " milioane"))
    return head + (" " + ro_number(rest, feminine) if rest else "")


MONTHS = ("ianuarie februarie martie aprilie mai iunie iulie august "
          "septembrie octombrie noiembrie decembrie").split()

_num_region = src[src.index("var READING_TEXTS"):]
for m in re.finditer(r'\bro:\s*' + STR, _num_region):
    body = m.group(1)
    toks = re.split(r"(\s+)", body)
    for i, tok in enumerate(toks):
        for run in re.findall(r"\d+", tok):
            if len(run) > 9:
                continue
            value = int(run)
            nxt = toks[i + 2] if i + 2 < len(toks) else ""
            nxt_clean = re.sub(r"[^a-zăâîșț]", "", nxt.lower())
            if value == 1 and nxt_clean in MONTHS:
                add("întâi")
            else:
                add(ro_number(value))

out = [s.replace('\\"', '"').replace("\\n", " ") for s in out]
out = [" ".join(s.split()) for s in out]
# De-dup again after unescaping
final, seen2 = [], set()
for s in out:
    if s and s not in seen2:
        seen2.add(s)
        final.append(s)

dest = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ro-strings.json")
io.open(dest, "w", encoding="utf-8").write(json.dumps(final, ensure_ascii=False, indent=0))
print("extracted %d unique strings -> %s" % (len(final), dest))
print("total chars: %d" % sum(len(s) for s in final))
