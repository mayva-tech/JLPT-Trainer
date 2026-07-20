from pathlib import Path
import re

base = Path(r"RESEARCH-Study-reference/from claude/fix/N1andN2-wordfix/_extracted")
for name in ["vocabulary.ts", "lessons.ts", "toc.ts", "quizVocabLesson.ts", "quizVocabLesson.test.ts", "vocabulary-type.ts"]:
    p = base / name
    print(name, "exists", p.exists(), "size", p.stat().st_size if p.exists() else 0)

# Check extracted vocabulary has N1_VOCAB_IDS
v = (base / "vocabulary.ts").read_text(encoding="utf-8")
print("has N1_VOCAB_IDS", "N1_VOCAB_IDS" in v)
print("has conditional jlpt", 'N1_VOCAB_IDS.has(seed.id)' in v)

# lessons
l = (base / "lessons.ts").read_text(encoding="utf-8")
print("n1-lesson count", len(re.findall(r'id: "n1-lesson-\d+"', l)))
print("lesson-75 present", "lesson-75" in l)

# toc
t = (base / "toc.ts").read_text(encoding="utf-8")
tc = Path("src/data/toc.ts").read_text(encoding="utf-8")
print("extracted N2 Vocab title", "N2 Vocabulary" in t, "N1 Vocabulary" in t)
print("current N2 Vocab title", "N2 Vocabulary" in tc)
print("extracted n1-word", "n1-word-01" in t, "n1-quiz" in t or "quiz-n1" in t)
for needle in ["n1-word-01", "n1-vocab", "quiz-n1", "N1 Vocabulary", "N1 Word Quiz", "vocabulary-n1"]:
    if needle in t:
        print(" found", needle)

union_re = re.compile(r'^\s*\|\s*"([^"]+)"', re.M)
union_e = set(union_re.findall(t))
union_c = set(union_re.findall(tc))
print("union only extracted", sorted(union_e - union_c))
print("union only current", sorted(union_c - union_e))
