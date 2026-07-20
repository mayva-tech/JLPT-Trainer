import re, io, string

s = io.open("src/data/grammar.ts", encoding="utf-8").read()

ids = re.findall(r"\bid: (\d+),", s)
patterns = re.findall(r'pattern: "([^"]+)"', s)
sentences = re.findall(r'\bsentence: "([^"]+)"', s)
lessons = re.findall(r'id: "(grammar-lesson-\d+|n1-grammar-lesson-\d+)"', s)

assert len(set(ids)) == len(ids), f"DUPLICATE IDS: {[i for i in ids if ids.count(i) > 1]}"
assert len(set(patterns)) == len(patterns), f"DUPLICATE PATTERNS: {[p for p in patterns if patterns.count(p) > 1]}"

ascii_letters = set(string.ascii_letters)
leaks = [se for se in sentences if any(c in ascii_letters for c in se)]
assert not leaks, f"ASCII LEAKS: {leaks}"

n1_count = len(re.findall(r'jlpt: "N1"', s))
n2_count = len(re.findall(r'jlpt: "N2"', s))
assert n1_count == 89, f"expected 89 N1 items, found {n1_count}"
assert n1_count + n2_count == len(ids), "N1 + N2 counts do not add up to total items"
assert len(ids) == 500, f"expected 500 items, found {len(ids)}"
assert len(lessons) == 59, f"expected 59 lessons, found {len(lessons)}"

print(f"OK -- {len(ids)} items ({n1_count} N1, {n2_count} N2), {len(lessons)} lessons, 0 duplicate ids/patterns, 0 ASCII leaks")
