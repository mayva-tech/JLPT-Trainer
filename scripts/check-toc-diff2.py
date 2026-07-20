import re
from pathlib import Path

toc_e = Path(r"RESEARCH-Study-reference/from claude/fix/N1andN2fix/_extracted/toc.ts").read_text(encoding="utf-8")
toc_c = Path("src/data/toc.ts").read_text(encoding="utf-8")

union_re = re.compile(r'^\s*\|\s*"([^"]+)"', re.M)
union_c = set(union_re.findall(toc_c))
union_e = set(union_re.findall(toc_e))
print("union current", len(union_c), "extracted", len(union_e))
print("only current", sorted(union_c - union_e))
print("only extracted", sorted(union_e - union_c))

# Compare non-grammar sections roughly by hashing after stripping grammar-n1 and grammar-351+
# Just check key word/quiz presence counts
for prefix in ["word-", "quiz-vocab-", "quiz-grammar-", "grammar-", "n1-grammar-"]:
    c = len([x for x in union_c if x.startswith(prefix)])
    e = len([x for x in union_e if x.startswith(prefix)])
    print(prefix, "cur", c, "ext", e)
