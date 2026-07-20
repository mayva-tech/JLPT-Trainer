#!/usr/bin/env python3
"""Replace static N2 vocabulary TOC items with generated builders."""

from __future__ import annotations

import re
from pathlib import Path

TOC_PATH = Path("src/data/toc.ts")

IMPORT_LINE = 'import { buildN2VocabularyLessonTocItems, buildN2VocabularyQuizTocItems } from "./tocVocabularyItems";\n'

VOCAB_ITEMS_RE = re.compile(
    r'(id: "vocabulary",\s*title: "2\. N2 Vocabulary Lessons",\s*items: )\[[\s\S]*?(\],\s*\},\s*\{\s*id: "vocabulary-n1")',
    re.MULTILINE,
)

QUIZ_WORD_ITEMS_RE = re.compile(
    r'(id: "quiz-word",\s*title: "4\. N2 Word Quizzes",\s*items: )\[[\s\S]*?(\],\s*\},\s*\{\s*id: "quiz-vocab-n1")',
    re.MULTILINE,
)


def main() -> None:
    text = TOC_PATH.read_text(encoding="utf-8")

    if 'from "./tocVocabularyItems"' not in text:
        text = text.replace(
            '/** Table of Contents for video production navigation. */\n\n',
            '/** Table of Contents for video production navigation. */\n\n' + IMPORT_LINE,
        )

    vocab_replacement = r'\1buildN2VocabularyLessonTocItems(),\2'
    text, vocab_count = VOCAB_ITEMS_RE.subn(vocab_replacement, text, count=1)
    if vocab_count != 1:
        raise SystemExit("failed to replace vocabulary TOC items")

    quiz_replacement = (
        r'\1[\n'
        r'      {\n'
        r'        id: "quiz-pre-comment",\n'
        r'        label: "Pre Quiz Comment",\n'
        r'        kind: "quiz-pre",\n'
        r'      },\n'
        r'      ...buildN2VocabularyQuizTocItems(),\n'
        r'    ]\2'
    )
    text, quiz_count = QUIZ_WORD_ITEMS_RE.subn(quiz_replacement, text, count=1)
    if quiz_count != 1:
        raise SystemExit("failed to replace quiz-word TOC items")

    TOC_PATH.write_text(text, encoding="utf-8")
    print("Patched toc.ts vocabulary and quiz-word items")


if __name__ == "__main__":
    main()
