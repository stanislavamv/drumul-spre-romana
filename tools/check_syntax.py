"""Extract the inline <script> from index.html and report brace/bracket balance
per top-level data block, to localise a syntax error to a line."""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = io.open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()

anchor = src.index("audio-manifest.js")
start = src.index("<script>", anchor) + len("<script>")
end = src.rindex("</script>")
js = src[start:end]

lines = js.split("\n")
depth = {"{": 0, "[": 0, "(": 0}
pairs = {"}": "{", "]": "[", ")": "("}
in_str = None
in_line_comment = False
in_block_comment = False
prev_depth = 0
report = []

for ln, line in enumerate(lines, 1):
    i = 0
    in_line_comment = False
    while i < len(line):
        c = line[i]
        nxt = line[i + 1] if i + 1 < len(line) else ""
        if in_block_comment:
            if c == "*" and nxt == "/":
                in_block_comment = False
                i += 1
            i += 1
            continue
        if in_line_comment:
            break
        if in_str:
            if c == "\\":
                i += 2
                continue
            if c == in_str:
                in_str = None
            i += 1
            continue
        if c in "\"'":
            in_str = c
        elif c == "/" and nxt == "/":
            in_line_comment = True
        elif c == "/" and nxt == "*":
            in_block_comment = True
            i += 1
        elif c in depth:
            depth[c] += 1
        elif c in pairs:
            depth[pairs[c]] -= 1
            if depth[pairs[c]] < 0:
                report.append((ln, "UNMATCHED %s" % c, line.strip()[:90]))
                depth[pairs[c]] = 0
        i += 1
    total = depth["{"] + depth["["] + depth["("]
    # Flag lines where we return to near-zero unexpectedly or spike
    if ln > 1 and total == 0 and prev_depth > 3:
        report.append((ln, "depth returned to 0", line.strip()[:90]))
    prev_depth = total

print("final depths: braces=%d brackets=%d parens=%d" % (depth["{"], depth["["], depth["("]))
print("unterminated string: %r" % in_str)
if report:
    print("\nsuspicious lines:")
    for ln, why, txt in report[:25]:
        print("  %5d  %-22s %s" % (ln, why, txt))
