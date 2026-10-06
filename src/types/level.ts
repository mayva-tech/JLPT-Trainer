/** Real JLPT level of a word (not the course it is taught in). */
export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

/** Generated row: [lesson id, level, theme, vocabulary ids]. */
export type PlaylistLessonRow = readonly [string, JlptLevel, string, readonly number[]];
