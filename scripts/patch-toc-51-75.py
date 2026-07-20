from pathlib import Path

toc = Path("src/data/toc.ts").read_text(encoding="utf-8")
union = Path("scripts/vocab-batches/toc-union.txt").read_text(encoding="utf-8").strip()
word_items = Path("scripts/vocab-batches/toc-word-items.ts").read_text(encoding="utf-8").rstrip()
quiz_items = Path("scripts/vocab-batches/toc-quiz-items.ts").read_text(encoding="utf-8").rstrip()
flat = Path("scripts/vocab-batches/toc-flat-ids.txt").read_text(encoding="utf-8").strip().splitlines()
word_flat = [l for l in flat if l.strip().startswith('"word-')]
quiz_flat = [l for l in flat if "quiz-vocab" in l]

# Split union file - first 25 lines word, next 25 quiz
union_lines = union.splitlines()
word_union = "\n".join(union_lines[:25])
quiz_union = "\n".join(union_lines[25:])

if '| "word-501-510"' in toc:
    print("word union already present")
else:
    toc = toc.replace(
        '  | "word-491-500"\n  | "grammar-1-10"',
        f'  | "word-491-500"\n{word_union}\n  | "grammar-1-10"',
    )
    print("added word union")

if '| "quiz-vocab-501-510"' in toc:
    print("quiz union already present")
else:
    toc = toc.replace(
        '  | "quiz-vocab-491-500"\n  | "quiz-grammar-1-10"',
        f'  | "quiz-vocab-491-500"\n{quiz_union}\n  | "quiz-grammar-1-10"',
    )
    print("added quiz union")

if 'id: "word-501-510"' in toc:
    print("word items already present")
else:
    toc = toc.replace(
        """      {
        id: "word-491-500",
        label: "Word Lesson 491–500",
        kind: "word",
        lessonId: "lesson-50",
      },
    ],
  },
  {
    id: "grammar",""",
        """      {
        id: "word-491-500",
        label: "Word Lesson 491–500",
        kind: "word",
        lessonId: "lesson-50",
      },
"""
        + word_items
        + """
    ],
  },
  {
    id: "grammar",""",
    )
    print("added word items")

if 'id: "quiz-vocab-501-510"' in toc:
    print("quiz items already present")
else:
    toc = toc.replace(
        """      {
        id: "quiz-vocab-491-500",
        label: "Word Quiz 491–500",
        kind: "quiz",
        quizId: "quiz-vocab-491-500",
      },
    ],
  },
  {
    id: "quiz-grammar",""",
        """      {
        id: "quiz-vocab-491-500",
        label: "Word Quiz 491–500",
        kind: "quiz",
        quizId: "quiz-vocab-491-500",
      },
"""
        + quiz_items
        + """
    ],
  },
  {
    id: "quiz-grammar",""",
    )
    print("added quiz items")

if '"word-501-510"' in toc and "lessonGroupIds" in toc:
    # check if already in lessonGroupIds section after 491-500
    marker = '  "word-491-500",\n  "grammar-1-10"'
    if marker in toc:
        toc = toc.replace(
            marker,
            '  "word-491-500",\n' + ",\n".join(word_flat) + ',\n  "grammar-1-10"',
        )
        print("added lessonGroupIds words")
    else:
        print("lessonGroupIds word marker missing or already patched")

marker_q = '  "quiz-vocab-491-500",\n  "quiz-grammar-1-10"'
if marker_q in toc:
    toc = toc.replace(
        marker_q,
        '  "quiz-vocab-491-500",\n' + ",\n".join(quiz_flat) + ',\n  "quiz-grammar-1-10"',
    )
    print("added quizIds")
else:
    print("quizIds marker missing or already patched")

Path("src/data/toc.ts").write_text(toc, encoding="utf-8")
print("toc.ts written", len(toc))
