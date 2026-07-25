import re, io, string, json
from pathlib import Path

root = Path(".")
s = io.open("src/data/grammar.ts", encoding="utf-8").read()

ids = re.findall(r"\bid: (\d+),", s)
# Only grammar item ids (5001-5500 range roughly) — also matches lesson ids numbers inside grammarIds.
# Prefer counting jlpt fields on items:
n1_count = len(re.findall(r'jlpt: "N1"', s))
n2_count = len(re.findall(r'jlpt: "N2"', s))
n3_count = len(re.findall(r'jlpt: "N3"', s))
course_n2_core = len(re.findall(r'courseLevel: "N2_CORE"', s))
course_n2_sec = len(re.findall(r'courseLevel: "N2_SECONDARY"', s))
course_n3 = len(re.findall(r'courseLevel: "N3_REVIEW"', s))
course_n1 = len(re.findall(r'courseLevel: "N1"', s))

patterns = re.findall(r'pattern: "([^"]+)"', s)
sentences = re.findall(r'\bsentence: "([^"]+)"', s)
family_lessons = re.findall(r'id: "(grammar-lesson-\d+|n1-grammar-lesson-\d+|n3-grammar-lesson-\d+|grammar-batch-\d+-\d+)"', s)

item_ids = re.findall(r"\n  \{\n    id: (\d+),", s)
assert len(item_ids) == 500, f"expected 500 items, found {len(item_ids)}"
assert len(set(item_ids)) == 500, "duplicate item ids"
assert len(set(patterns)) == len(patterns), f"DUPLICATE PATTERNS"

ascii_letters = set(string.ascii_letters)
leaks = [se for se in sentences if any(c in ascii_letters for c in se)]
assert not leaks, f"ASCII LEAKS: {leaks}"

assert n1_count + n2_count + n3_count == 500
assert course_n2_core + course_n2_sec + course_n3 + course_n1 == 500

catalog = json.loads(Path("scripts/_grammar_course_catalog.json").read_text(encoding="utf-8"))
c = catalog["counts"]
print("OK -- raw inventory")
print(f"  Raw N2 items: {n2_count}")
print(f"  Raw N1 items: {n1_count}")
print(f"  Raw N3 items: {n3_count}")
print(f"  Core N2 families: {c['coreFamilies']}")
print(f"  Secondary N2 families: {c['secondaryFamilies']}")
print(f"  Total N2 families: {c['totalN2Families']}")
print(f"  N3 prerequisite families: {c['n3Families']}")
print(f"  N1 families: {c['n1Families']}")
print(f"  Lessons (incl batches): {len(family_lessons)}")
print(f"  Course field coverage: {course_n2_core + course_n2_sec + course_n3 + course_n1}/500")
assert 140 <= c["totalN2Families"] <= 160, c["totalN2Families"]
