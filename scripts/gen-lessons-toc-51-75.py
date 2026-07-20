"""Generate TOC / lessons TypeScript snippets for word lessons 51-75."""
from pathlib import Path

LESSONS = [
    (51, 4501, 501, "Advanced Weather & Climate", "Weather • Climate", "Weather", "Climate"),
    (52, 4511, 511, "Social Etiquette & Consideration", "Etiquette • Consideration", "Etiquette", "Consideration"),
    (53, 4521, 521, "Workplace Communication", "Workplace • Communication", "Workplace", "Communication"),
    (54, 4531, 531, "Decisions & Problem Solving", "Decisions • Problem Solving", "Decisions", "Problem Solving"),
    (55, 4541, 541, "Quality & Manufacturing", "Quality • Manufacturing", "Quality", "Manufacturing"),
    (56, 4551, 551, "Research & Data", "Research • Data", "Research", "Data"),
    (57, 4561, 561, "Opinions & Arguments", "Opinions • Arguments", "Opinions", "Arguments"),
    (58, 4571, 571, "Personality & Character", "Personality • Character", "Personality", "Character"),
    (59, 4581, 581, "Conflict & Relationships", "Conflict • Relationships", "Conflict", "Relationships"),
    (60, 4591, 591, "Rules & Compliance", "Rules • Compliance", "Rules", "Compliance"),
    (61, 4601, 601, "Government & Politics", "Government • Politics", "Government", "Politics"),
    (62, 4611, 611, "Economy & Business Conditions", "Economy • Business", "Economy", "Business"),
    (63, 4621, 621, "Employment Conditions", "Employment • Labor", "Employment", "Labor"),
    (64, 4631, 631, "Environment & Sustainability", "Environment • Sustainability", "Environment", "Sustainability"),
    (65, 4641, 641, "Crime & Public Safety", "Crime • Public Safety", "Crime", "Public Safety"),
    (66, 4651, 651, "Accidents & Insurance", "Accidents • Insurance", "Accidents", "Insurance"),
    (67, 4661, 661, "News & Public Information", "News • Media", "News", "Media"),
    (68, 4671, 671, "Digital Security & Privacy", "Digital Security • Privacy", "Digital Security", "Privacy"),
    (69, 4681, 681, "Science & Technology", "Science • Technology", "Science", "Technology"),
    (70, 4691, 691, "Changes & Trends", "Changes • Trends", "Changes", "Trends"),
    (71, 4701, 701, "Causes & Consequences", "Causes • Consequences", "Causes", "Consequences"),
    (72, 4711, 711, "Possibility & Prediction", "Possibility • Prediction", "Possibility", "Prediction"),
    (73, 4721, 721, "Evaluation & Comparison", "Evaluation • Comparison", "Evaluation", "Comparison"),
    (74, 4731, 731, "Academic Reading Vocabulary", "Academic • Reading", "Academic", "Reading"),
    (75, 4741, 741, "Abstract High-Frequency N2 Verbs", "Abstract • Verbs", "Abstract", "Verbs"),
]

out = Path("scripts/vocab-batches")
out.mkdir(exist_ok=True)

# lessons.ts fragment
lines = []
for ln, sid, disp, theme, subtitle, s1, s2 in LESSONS:
    lid = f"lesson-{ln:02d}"
    a, b = disp, disp + 9
    lines.append(
        f"""  {{
    id: "{lid}",
    title: "JLPT N2 {theme} Vocabulary #{ln}",
    subtitle: "{subtitle}",
    youtubeTitle: "JLPT N2 Daily Life Vocabulary #{ln} | {theme}",
    category: "Daily Life",
    subcategories: ["{s1}", "{s2}"],
    vocabularyIds: idRange({sid}),
  }},"""
    )
(out / "lessons-51-75.ts").write_text("\n".join(lines) + "\n", encoding="utf-8")

# TocItemId unions
union_word = "\n".join(f'  | "word-{d}-{d+9}"' for _, _, d, *_ in LESSONS)
union_quiz = "\n".join(f'  | "quiz-vocab-{d}-{d+9}"' for _, _, d, *_ in LESSONS)
(out / "toc-union.txt").write_text(union_word + "\n" + union_quiz + "\n", encoding="utf-8")

# toc vocab items
vocab_items = []
for ln, sid, d, *_ in LESSONS:
    vocab_items.append(
        f"""      {{
        id: "word-{d}-{d+9}",
        label: "Word Lesson {d}–{d+9}",
        kind: "word",
        lessonId: "lesson-{ln:02d}",
      }},"""
    )
(out / "toc-word-items.ts").write_text("\n".join(vocab_items) + "\n", encoding="utf-8")

quiz_items = []
for ln, sid, d, *_ in LESSONS:
    quiz_items.append(
        f"""      {{
        id: "quiz-vocab-{d}-{d+9}",
        label: "Word Quiz {d}–{d+9}",
        kind: "quiz",
        quizId: "quiz-vocab-{d}-{d+9}",
      }},"""
    )
(out / "toc-quiz-items.ts").write_text("\n".join(quiz_items) + "\n", encoding="utf-8")

ids_word = ",\n".join(f'  "word-{d}-{d+9}"' for _, _, d, *_ in LESSONS)
ids_quiz = ",\n".join(f'  "quiz-vocab-{d}-{d+9}"' for _, _, d, *_ in LESSONS)
(out / "toc-flat-ids.txt").write_text(ids_word + "\n" + ids_quiz + "\n", encoding="utf-8")
print("wrote lesson/toc fragments")
