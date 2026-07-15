import { useMemo, useState } from "react";
import { lessons } from "../data/lessons";
import { vocabulary, getVocabularyByIds } from "../data/vocabulary";
import { grammar, grammarLessons, getGrammarByIds } from "../data/grammar";

type Tab = "words" | "grammar";

/**
 * In-app content glossary for sanity-checking existing words and grammar
 * patterns. Reads live data, so it is always up to date with the lessons.
 */
export function GlossaryView() {
  const [tab, setTab] = useState<Tab>("words");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  const wordSections = useMemo(
    () =>
      lessons.map((lesson) => ({
        lesson,
        items: getVocabularyByIds(lesson.vocabularyIds).filter(
          (v) =>
            !q ||
            v.word.toLowerCase().includes(q) ||
            v.reading.toLowerCase().includes(q) ||
            v.meaning.toLowerCase().includes(q)
        ),
      })),
    [q]
  );

  const grammarSections = useMemo(
    () =>
      grammarLessons.map((lesson) => ({
        lesson,
        items: getGrammarByIds(lesson.grammarIds).filter(
          (g) =>
            !q ||
            g.pattern.toLowerCase().includes(q) ||
            g.patternReading.toLowerCase().includes(q) ||
            g.meaning.toLowerCase().includes(q)
        ),
      })),
    [q]
  );

  return (
    <div className="safe-area toc-safe">
      <div className="toc-panel card-fade glossary-panel">
        <div className="category-chip">Reference</div>
        <h1 className="toc-title">Content Glossary</h1>
        <p className="toc-subtitle">
          {vocabulary.length} words · {grammar.length} grammar patterns ·{" "}
          {lessons.length} word lessons · {grammarLessons.length} grammar
          lessons
        </p>

        <div className="glossary-controls">
          <button
            type="button"
            className={
              tab === "words" ? "toc-item toc-item--active" : "toc-item"
            }
            onClick={() => setTab("words")}
          >
            Words ({vocabulary.length})
          </button>
          <button
            type="button"
            className={
              tab === "grammar" ? "toc-item toc-item--active" : "toc-item"
            }
            onClick={() => setTab("grammar")}
          >
            Grammar ({grammar.length})
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
                              {v.word}
                            </td>
                            <td className="glossary-reading" lang="ja">
                              {v.reading}
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
                      {lesson.title}{" "}
                      <span className="glossary-count">({items.length})</span>
                    </h2>
                    <table className="glossary-table">
                      <tbody>
                        {items.map((g) => (
                          <tr key={g.id}>
                            <td className="glossary-id">{g.id}</td>
                            <td className="glossary-ja" lang="ja">
                              {g.pattern}
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
