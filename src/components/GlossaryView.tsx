import { useMemo, useState } from "react";
import { lessons } from "../data/lessons";
import { vocabulary, getVocabularyByIds } from "../data/vocabulary";
import {
  grammar,
  grammarLessons,
  getGrammarItemsForLesson,
} from "../data/grammar";
import { grammarBatchDisplayLabel } from "../data/tocGrammarItems";
import { FuriganaWrapText } from "./FuriganaWrapText";

type Tab = "words" | "grammar";
type GlossaryPage = 1 | 2;

export type GlossaryNavigateTarget =
  | { kind: "word"; lessonId: string; vocabularyId: number }
  | { kind: "grammar"; lessonId: string; grammarId: number };

type Props = {
  onNavigate: (target: GlossaryNavigateTarget) => void;
};

function isN1LessonId(id: string): boolean {
  return id.startsWith("n1-");
}

/**
 * In-app content glossary for sanity-checking existing words and grammar
 * patterns. Reads live data, so it is always up to date with the lessons.
 * Page 1 lists N2 content (N3 foundations excluded); page 2 lists curated N1.
 * Rows are clickable and jump to the matching player slide.
 */
export function GlossaryView({ onNavigate }: Props) {
  const [page, setPage] = useState<GlossaryPage>(1);
  const [tab, setTab] = useState<Tab>("words");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const wantN1 = page === 2;

  const wordLessons = useMemo(
    () => lessons.filter((lesson) => isN1LessonId(lesson.id) === wantN1),
    [wantN1]
  );

  const grammarLessonList = useMemo(
    () =>
      grammarLessons.filter((lesson) => {
        if (wantN1) return lesson.id.startsWith("n1-");
        // N2 course navigation uses family batches (not every singleton family row).
        return lesson.id.startsWith("grammar-batch-");
      }),
    [wantN1]
  );

  const wordSections = useMemo(
    () =>
      wordLessons.map((lesson) => ({
        lesson,
        items: getVocabularyByIds(lesson.vocabularyIds).filter(
          (v) =>
            (wantN1 ? v.jlpt === "N1" : v.jlpt === "N2") &&
            (!q ||
              v.word.toLowerCase().includes(q) ||
              v.reading.toLowerCase().includes(q) ||
              v.meaning.toLowerCase().includes(q))
        ),
      })),
    [q, wantN1, wordLessons]
  );

  const grammarSections = useMemo(
    () =>
      grammarLessonList.map((lesson) => ({
        lesson,
        items: getGrammarItemsForLesson(lesson).filter(
          (g) =>
            !q ||
            g.pattern.toLowerCase().includes(q) ||
            g.patternReading.toLowerCase().includes(q) ||
            g.meaning.toLowerCase().includes(q)
        ),
      })),
    [q, wantN1, grammarLessonList]
  );

  const pageWordCount = useMemo(
    () =>
      vocabulary.filter((v) => (wantN1 ? v.jlpt === "N1" : v.jlpt === "N2"))
        .length,
    [wantN1]
  );

  const pageGrammarCount = useMemo(
    () =>
      grammar.filter((g) => (wantN1 ? g.jlpt === "N1" : g.jlpt === "N2")).length,
    [wantN1]
  );

  return (
    <div className="safe-area toc-safe">
      <div className="toc-panel card-fade glossary-panel">
        <div className="category-chip">Reference</div>
        <h1 className="toc-title">Content Glossary</h1>
        <p className="toc-subtitle">
          {wantN1 ? "N1" : "N2"} · {pageWordCount} words · {pageGrammarCount}{" "}
          grammar patterns · {wordLessons.length} word lessons ·{" "}
          {grammarLessonList.length} grammar lessons · tap a row to open its
          slide
        </p>

        <div className="toc-page-nav" role="tablist" aria-label="Glossary pages">
          <button
            type="button"
            role="tab"
            aria-selected={page === 1}
            className={
              page === 1 ? "toc-page-btn toc-page-btn--active" : "toc-page-btn"
            }
            onClick={() => setPage(1)}
          >
            Page 1 · N2
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={page === 2}
            className={
              page === 2 ? "toc-page-btn toc-page-btn--active" : "toc-page-btn"
            }
            onClick={() => setPage(2)}
          >
            Page 2 · N1
          </button>
        </div>

        <div className="glossary-controls">
          <button
            type="button"
            className={
              tab === "words" ? "toc-item toc-item--active" : "toc-item"
            }
            onClick={() => setTab("words")}
          >
            Words ({pageWordCount})
          </button>
          <button
            type="button"
            className={
              tab === "grammar" ? "toc-item toc-item--active" : "toc-item"
            }
            onClick={() => setTab("grammar")}
          >
            Grammar ({pageGrammarCount})
          </button>
          <input
            type="text"
            className="glossary-search"
            placeholder="Search word / reading / meaning…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="glossary-scroll">
          {tab === "words"
            ? wordSections.map(({ lesson, items }) =>
                items.length === 0 ? null : (
                  <section key={lesson.id} className="glossary-section">
                    <h2 className="toc-group-title">
                      {lesson.title}{" "}
                      <span className="glossary-count">({items.length})</span>
                    </h2>
                    <table className="glossary-table">
                      <tbody>
                        {items.map((v) => (
                          <tr key={v.id}>
                            <td className="glossary-id">{v.id}</td>
                            <td className="glossary-ja" lang="ja">
                              <button
                                type="button"
                                className="glossary-link"
                                onClick={() =>
                                  onNavigate({
                                    kind: "word",
                                    lessonId: lesson.id,
                                    vocabularyId: v.id,
                                  })
                                }
                              >
                                <FuriganaWrapText
                                  surface={v.word}
                                  reading={v.reading}
                                  className="glossary-furi"
                                  showFurigana
                                />
                              </button>
                            </td>
                            <td className="glossary-en">{v.meaning}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                )
              )
            : grammarSections.map(({ lesson, items }) =>
                items.length === 0 ? null : (
                  <section key={lesson.id} className="glossary-section">
                    <h2 className="toc-group-title">
                      {(lesson.id.startsWith("grammar-batch-")
                        ? grammarBatchDisplayLabel(lesson.id)
                        : lesson.title) || lesson.title}{" "}
                      <span className="glossary-count">({items.length})</span>
                    </h2>
                    <table className="glossary-table">
                      <tbody>
                        {items.map((g) => (
                          <tr key={g.id}>
                            <td className="glossary-id">{g.id}</td>
                            <td className="glossary-ja" lang="ja">
                              <button
                                type="button"
                                className="glossary-link"
                                onClick={() =>
                                  onNavigate({
                                    kind: "grammar",
                                    lessonId: lesson.id,
                                    grammarId: g.id,
                                  })
                                }
                              >
                                <FuriganaWrapText
                                  surface={g.pattern}
                                  reading={g.patternReading}
                                  className="glossary-furi"
                                  showFurigana
                                />
                              </button>
                            </td>
                            <td className="glossary-en">{g.meaning}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                )
              )}
        </div>
      </div>
    </div>
  );
}
