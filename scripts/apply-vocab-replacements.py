import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

REPLACEMENTS = {
    4510: ("注意報", "ちゅういほう", "weather advisory; warning bulletin"),
    4513: ("謙遜", "けんそん", "modesty; humility"),
    4521: ("配布", "はいふ", "distribution; handout"),
    4580: ("弾力", "だんりょく", "elasticity; resilience"),
    4584: ("信用", "しんよう", "credit; trustworthiness"),
    4594: ("逸脱", "いつだつ", "deviation; departure from norms"),
    4599: ("施行", "しこう", "enforcement; putting into effect"),
    4617: ("欠損", "けっそん", "deficit; shortfall"),
    4622: ("登用", "とうよう", "appointment; promotion to a post"),
    4633: ("原料", "げんりょう", "raw material"),
    4648: ("警備", "けいび", "security; guard"),
    4653: ("救出", "きゅうしゅつ", "rescue; extrication"),
    4657: ("補償", "ほしょう", "compensation; indemnity"),
    4661: ("特集", "とくしゅう", "feature article; special coverage"),
    4662: ("論説", "ろんせつ", "editorial; opinion article"),
    4665: ("会見", "かいけん", "press conference; interview"),
    4684: ("機器", "きき", "equipment; apparatus"),
    4689: ("機械化", "きかいか", "mechanization"),
    4690: ("先端技術", "せんたんぎじゅつ", "cutting-edge technology"),
    4699: ("浸透", "しんとう", "penetration; permeation; spread"),
    4706: ("効力", "こうりょく", "efficacy; legal effect"),
    4707: ("打撃", "だげき", "blow; hit; serious damage"),
    4721: ("査定", "さてい", "assessment; appraisal"),
}

rows = json.loads(Path("scripts/proposed-4501-4750.json").read_text(encoding="utf-8"))
vocab = Path("src/data/vocabulary.ts").read_text(encoding="utf-8")
word_set = set(re.findall(r'^\s+word:\s*"([^"]+)"', vocab, re.M))

out = []
for row in rows:
    item = dict(row)
    if item["id"] in REPLACEMENTS:
        w, r, m = REPLACEMENTS[item["id"]]
        item["word"], item["reading"], item["meaning"] = w, r, m
        item["replaced"] = True
    out.append(item)

# verify no dups against existing or internally
words = [x["word"] for x in out]
from collections import Counter

c = Counter(words)
assert not [w for w, n in c.items() if n > 1], c
still = [x for x in out if x["word"] in word_set]
print("still duplicate vs existing:", still)
assert not still
print("OK 250 unique words after", len(REPLACEMENTS), "replacements")
Path("scripts/vocab-4501-4750-clean.json").write_text(
    json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8"
)
