"""Merge seed batches into vocabulary.ts and report missing KANJI chars."""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

vocab_path = Path("src/data/vocabulary.ts")
vocab = vocab_path.read_text(encoding="utf-8")

parts = []
for p in sorted(Path("scripts/vocab-batches").glob("seeds-*.ts")):
    t = p.read_text(encoding="utf-8").strip()
    # strip wrapping [ ] if any
    if t.startswith("["):
        t = t[1:]
    if t.endswith("]"):
        t = t[:-1]
    t = t.strip().rstrip(",")
    parts.append(t)

merged = ",\n\n".join(parts)

if "id: 4501" in vocab:
    print("seeds already merged")
else:
    # insert before closing of seeds array
    needle = "  },\n\n];\n\nexport const vocabulary"
    # last item ends with }, then ];
    alt = "  },\n];\n\nexport const vocabulary"
    if needle in vocab:
        vocab = vocab.replace(
            needle,
            "  },\n\n" + merged + ",\n\n];\n\nexport const vocabulary",
            1,
        )
        print("merged via needle")
    elif alt in vocab:
        vocab = vocab.replace(
            alt,
            "  },\n\n" + merged + ",\n\n];\n\nexport const vocabulary",
            1,
        )
        print("merged via alt")
    else:
        # find last seed closing before export const vocabulary
        idx = vocab.rfind("export const vocabulary")
        before = vocab[:idx]
        after = vocab[idx:]
        # remove trailing ]; of seeds
        before2 = re.sub(r"\];\s*$", "", before.rstrip())
        vocab = before2.rstrip().rstrip(",") + ",\n\n" + merged + ",\n\n];\n\n" + after
        print("merged via rfind")
    vocab_path.write_text(vocab, encoding="utf-8")

# recount
vocab = vocab_path.read_text(encoding="utf-8")
ids = [int(x) for x in re.findall(r"^\s+id:\s*(\d+),", vocab, re.M)]
# only seed ids in 4000s
seed_ids = [i for i in ids if 4001 <= i <= 4750]
print("seed ids in 4001-4750:", len(seed_ids), "min", min(seed_ids), "max", max(seed_ids))

# missing KANJI: extract chars from new seeds' word/phrase/sentence
# crude: get KANJI keys
kanji_keys = set(re.findall(r"^\s+([\u4e00-\u9faf])\s*:", vocab, re.M))
print("KANJI map size", len(kanji_keys))

# extract surfaces from ids >= 4501 blocks - simpler: all word/phrase/sentence in file after 4501
# collect all JP surfaces from seed fields
surfaces = []
for field in ("word", "phrase", "sentence"):
    surfaces += re.findall(rf'^\s+{field}:\s*"([^"]+)"', vocab, re.M)

chars = set()
for s in surfaces:
    for ch in s:
        if "\u4e00" <= ch <= "\u9faf":
            chars.add(ch)

missing = sorted(chars - kanji_keys)
print("missing KANJI count", len(missing))
Path("scripts/vocab-batches/missing-kanji.txt").write_text(
    "\n".join(missing), encoding="utf-8"
)
print("wrote missing-kanji.txt")
if missing:
    print("sample", "".join(missing[:80]))
