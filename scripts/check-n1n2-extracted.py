import re
from pathlib import Path

ext = Path(r"RESEARCH-Study-reference/from claude/fix/N1andN2fix/_extracted/grammar.ts").read_text(encoding="utf-8")
cur = Path("src/data/grammar.ts").read_text(encoding="utf-8")
ids_e = re.findall(r"\bid: (\d+),", ext)
ids_c = re.findall(r"\bid: (\d+),", cur)
lessons_e = re.findall(r'id: "(grammar-lesson-\d+|n1-grammar-lesson-\d+)"', ext)
lessons_c = re.findall(r'id: "(grammar-lesson-\d+|n1-grammar-lesson-\d+)"', cur)
n1_e = len(re.findall(r'jlpt: "N1"', ext))
n2_e = len(re.findall(r'jlpt: "N2"', ext))
print("extracted items", len(ids_e), "range", ids_e[0], ids_e[-1], "N1", n1_e, "N2", n2_e)
print("current items", len(ids_c), "range", ids_c[0], ids_c[-1])
print("extracted lessons", len(lessons_e), lessons_e[:3], "...", lessons_e[-5:])
print("current lessons", len(lessons_c), lessons_c[-3:] if lessons_c else None)

toc_e = Path(r"RESEARCH-Study-reference/from claude/fix/N1andN2fix/_extracted/toc.ts").read_text(encoding="utf-8")
toc_c = Path("src/data/toc.ts").read_text(encoding="utf-8")
print("extracted has n1-grammar-01", "n1-grammar-01" in toc_e)
print("extracted has grammar-491-500", "grammar-491-500" in toc_e)
print("extracted has word-741-750", "word-741-750" in toc_e)
print("current has word-741-750", "word-741-750" in toc_c)
print("current has grammar-491-500", "grammar-491-500" in toc_c)
print(
    "sizes",
    Path("src/data/grammar.ts").stat().st_size,
    Path(r"RESEARCH-Study-reference/from claude/fix/N1andN2fix/_extracted/grammar.ts").stat().st_size,
)

# Check if first 350 items match between current and extracted (except jlpt)
# Extract item blocks by id for a sample
def item_fields(text, iid):
    m = re.search(rf"\{{\s*id: {iid},.*?audioSentence: \"[^\"]*\",\s*\}},", text, re.DOTALL)
    return m.group(0) if m else None

mismatches = []
for iid in range(5001, 5351):
    a = item_fields(cur, iid)
    b = item_fields(ext, iid)
    if a is None or b is None:
        mismatches.append((iid, "missing"))
        continue
    # Compare ignoring jlpt field
    a2 = re.sub(r'jlpt: "N[12]",', 'jlpt: "X",', a)
    b2 = re.sub(r'jlpt: "N[12]",', 'jlpt: "X",', b)
    if a2 != b2:
        mismatches.append((iid, "content"))
print("content mismatches in 5001-5350 (ignoring jlpt):", len(mismatches))
print("sample", mismatches[:5])
