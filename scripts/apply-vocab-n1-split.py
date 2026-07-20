from pathlib import Path

# Apply Stage 2 vocabulary.ts jlpt conditional
vocab = Path("src/data/vocabulary.ts")
vs = vocab.read_text(encoding="utf-8")
old = """];

export const vocabulary: VocabularyItem[] = seeds.map(({ folder, ...seed }) => ({
  ...seed,
  jlpt: "N2",
  category: "Daily Life",
  kanjiDetails: kanjiDetailsFor(seed.word, seed.phrase, seed.sentence),
  ...audio(folder, String(seed.id)),
}));
"""
new = """];

/**
 * Vocabulary items confirmed as genuine N1-level words during a targeted manual
 * review (no clean canonical N1 word list exists the way it does for grammar
 * patterns, so this list reflects informed judgment on register/specialization,
 * not a verified external cross-reference).
 */
const N1_VOCAB_IDS = new Set<number>([
  4213, 4248, 4286, 4288, 4305, 4367, 4368, 4410, 4416, 4454, 4455, 4459, 4460,
  4513, 4529, 4594, 4617, 4622, 4658, 4680, 4699, 4706,
]);

export const vocabulary: VocabularyItem[] = seeds.map(({ folder, ...seed }) => ({
  ...seed,
  jlpt: N1_VOCAB_IDS.has(seed.id) ? "N1" : "N2",
  category: "Daily Life",
  kanjiDetails: kanjiDetailsFor(seed.word, seed.phrase, seed.sentence),
  ...audio(folder, String(seed.id)),
}));
"""
if old not in vs:
    raise SystemExit("vocabulary map block not found")
vocab.write_text(vs.replace(old, new, 1), encoding="utf-8")
print("vocabulary.ts OK")

# Stage 3 lessons
lessons = Path("src/data/lessons.ts")
ls = lessons.read_text(encoding="utf-8")
n1_lessons = """
  // -- N1 Vocabulary Lessons -----------------------------------------------
  // Curated view: references existing N1-level words by their original ids.
  // No ids or audio paths are changed; these words remain in their original
  // N2-themed lessons above as well. This is a browsing lens, not a move.
  {
    id: "n1-lesson-01",
    title: "JLPT N1 Vocabulary -- Legal, Financial & Administrative #1",
    subtitle: "Legal • Financial • Administrative",
    youtubeTitle: "JLPT N1 Daily Life Vocabulary #1 | Legal, Financial & Administrative",
    category: "Daily Life",
    subcategories: ["Legal", "Financial", "Administrative"],
    vocabularyIds: [4213, 4248, 4286, 4288, 4305, 4367, 4368, 4410],
  },
  {
    id: "n1-lesson-02",
    title: "JLPT N1 Vocabulary -- Formal Ceremonies & Mourning #2",
    subtitle: "Ceremonies • Mourning",
    youtubeTitle: "JLPT N1 Daily Life Vocabulary #2 | Formal Ceremonies & Mourning",
    category: "Daily Life",
    subcategories: ["Ceremonies", "Mourning"],
    vocabularyIds: [4416, 4454, 4455, 4459, 4460],
  },
  {
    id: "n1-lesson-03",
    title: "JLPT N1 Vocabulary -- Specialized Register #3",
    subtitle: "Specialized • Formal Register",
    youtubeTitle: "JLPT N1 Daily Life Vocabulary #3 | Specialized Register",
    category: "Daily Life",
    subcategories: ["Specialized", "Formal Register"],
    vocabularyIds: [4513, 4529, 4594, 4617, 4622, 4658, 4680, 4699, 4706],
  },
"""
anchor = """];

export function getLessonById(id: string): Lesson | undefined {
"""
if "n1-lesson-01" in ls:
    print("lessons already has n1")
elif anchor not in ls:
    raise SystemExit("lessons anchor not found")
else:
    lessons.write_text(ls.replace(anchor, n1_lessons + "\n" + anchor, 1), encoding="utf-8")
    print("lessons.ts OK")

# Stage 5 toc
toc = Path("src/data/toc.ts")
ts = toc.read_text(encoding="utf-8")

def once(old, new, label):
    global ts
    if old not in ts:
        raise SystemExit(f"toc missing: {label}")
    if new.strip() in ts and label.startswith("insert"):
        # idempotent check for already applied inserts
        pass
    ts = ts.replace(old, new, 1)
    print("toc", label)

# 5a
once(
  '  | "word-741-750"\n  | "grammar-1-10"',
  '  | "word-741-750"\n  | "word-n1-01"\n  | "word-n1-02"\n  | "word-n1-03"\n  | "grammar-1-10"',
  "union words",
)

# 5b
once(
  '  | "quiz-vocab-741-750"\n  | "quiz-grammar-1-10"',
  '  | "quiz-vocab-741-750"\n  | "quiz-vocab-n1-01"\n  | "quiz-vocab-n1-02"\n  | "quiz-vocab-n1-03"\n  | "quiz-grammar-1-10"',
  "union quizzes",
)

# 5c - preserve N2 labels
once(
"""      {
        id: "word-741-750",
        label: "N2 Word Lesson 741–750",
        kind: "word",
        lessonId: "lesson-75",
      },
    ],
  },
  {
    id: "grammar",
""",
"""      {
        id: "word-741-750",
        label: "N2 Word Lesson 741–750",
        kind: "word",
        lessonId: "lesson-75",
      },
    ],
  },
  {
    id: "vocabulary-n1",
    title: "2b. N1 Vocabulary Lessons (curated)",
    items: [
      { id: "word-n1-01", label: "N1 Vocabulary 1: Legal, Financial & Administrative", kind: "word", lessonId: "n1-lesson-01" },
      { id: "word-n1-02", label: "N1 Vocabulary 2: Formal Ceremonies & Mourning", kind: "word", lessonId: "n1-lesson-02" },
      { id: "word-n1-03", label: "N1 Vocabulary 3: Specialized Register", kind: "word", lessonId: "n1-lesson-03" },
    ],
  },
  {
    id: "grammar",
""",
  "vocab-n1 group",
)

# 5d
once(
"""      {
        id: "quiz-vocab-741-750",
        label: "N2 Word Quiz 741–750",
        kind: "quiz",
        quizId: "quiz-vocab-741-750",
      },
    ],
  },
  {
    id: "quiz-grammar",
""",
"""      {
        id: "quiz-vocab-741-750",
        label: "N2 Word Quiz 741–750",
        kind: "quiz",
        quizId: "quiz-vocab-741-750",
      },
    ],
  },
  {
    id: "quiz-vocab-n1",
    title: "4b. N1 Word Quizzes (curated)",
    items: [
      { id: "quiz-vocab-n1-01", label: "N1 Word Quiz 1: Legal, Financial & Administrative", kind: "quiz", quizId: "quiz-vocab-n1-01" },
      { id: "quiz-vocab-n1-02", label: "N1 Word Quiz 2: Formal Ceremonies & Mourning", kind: "quiz", quizId: "quiz-vocab-n1-02" },
      { id: "quiz-vocab-n1-03", label: "N1 Word Quiz 3: Specialized Register", kind: "quiz", quizId: "quiz-vocab-n1-03" },
    ],
  },
  {
    id: "quiz-grammar",
""",
  "quiz-n1 group",
)

# 5e
once(
  '  "word-741-750",\n  "grammar-1-10",',
  '  "word-741-750",\n  "word-n1-01",\n  "word-n1-02",\n  "word-n1-03",\n  "grammar-1-10",',
  "lessonGroupIds",
)

# 5f
once(
  '  "quiz-vocab-741-750",\n  "quiz-grammar-1-10",',
  '  "quiz-vocab-741-750",\n  "quiz-vocab-n1-01",\n  "quiz-vocab-n1-02",\n  "quiz-vocab-n1-03",\n  "quiz-grammar-1-10",',
  "quizIds",
)

toc.write_text(ts, encoding="utf-8")
print("toc.ts OK")
