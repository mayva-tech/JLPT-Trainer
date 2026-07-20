import json
import re
import sys
from collections import Counter
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

text = Path(
    r"RESEARCH-Study-reference/chatgpt claude reply/next word list 500to750.txt"
).read_text(encoding="utf-8")
rows = []
for m in re.finditer(
    r"\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|", text
):
    id_, word, reading, meaning = [x.strip() for x in m.groups()]
    if id_.isdigit() and int(id_) >= 4501:
        rows.append((int(id_), word, reading, meaning))

print(
    "proposed",
    len(rows),
    "first",
    rows[0][0],
    rows[0][1],
    "last",
    rows[-1][0],
    rows[-1][1],
)

vocab = Path("src/data/vocabulary.ts").read_text(encoding="utf-8")
words = re.findall(r'^\s+word:\s*"([^"]+)"', vocab, re.M)
word_set = set(words)
print("existing headline words", len(words), "unique", len(word_set))

dup_word = [(i, w, r, m) for i, w, r, m in rows if w in word_set]
print("DUPLICATE HEADLINE WORDS", len(dup_word))
for d in dup_word:
    print(" ", d)

c = Counter(w for _, w, _, _ in rows)
internal = [w for w, n in c.items() if n > 1]
print("INTERNAL DUPES", internal)

Path("scripts/proposed-4501-4750.json").write_text(
    json.dumps(
        [{"id": i, "word": w, "reading": r, "meaning": m} for i, w, r, m in rows],
        ensure_ascii=False,
        indent=2,
    ),
    encoding="utf-8",
)
print("wrote scripts/proposed-4501-4750.json")
