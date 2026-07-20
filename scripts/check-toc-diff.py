from pathlib import Path
import re

toc_e = Path(r"RESEARCH-Study-reference/from claude/fix/N1andN2fix/_extracted/toc.ts").read_text(encoding="utf-8")
toc_c = Path("src/data/toc.ts").read_text(encoding="utf-8")

# Compare union members
def ids(text):
    return re.findall(r'"((?:word|quiz-vocab|grammar|n1-grammar|quiz-grammar)-[^"]+)"', text)

# structural markers
markers = [
    "word-741-750",
    "quiz-vocab-741-750",
    "grammar-491-500",
    "n1-grammar-09",
    "grammar-n1",
    "quiz-word",
    "quiz-grammar",
]
for m in markers:
    print(f"{m}: current={m in toc_c} extracted={m in toc_e}")

# Diff line counts
print("lines current", toc_c.count("\n"), "extracted", toc_e.count("\n"))

# Check if extracted is basically current + grammar additions
# Find ids only in current or only in extracted
set_c = set(re.findall(r'"([a-z0-9-]+)"', toc_c))
set_e = set(re.findall(r'"([a-z0-9-]+)"', toc_e))
# focus on TocItemId-like
id_re = re.compile(r'^\| "([^"]+)"', re.M)
union_c = set(id_re.findall(toc_c))
union_e = set(id_re.findall(toc_e))
print("union only current", sorted(union_c - union_e)[:30], "count", len(union_c - union_e))
print("union only extracted", sorted(union_e - union_c)[:40], "count", len(union_e - union_c))

# lessonGroupIds presence
for x in ["grammar-491-500", "n1-grammar-01", "word-741-750"]:
    print("lessonGroup", x, "cur", x in toc_c[toc_c.find("lessonGroupIds"):], "ext", x in toc_e[toc_e.find("lessonGroupIds"):])
