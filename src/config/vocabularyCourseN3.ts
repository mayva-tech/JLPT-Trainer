/**
 * N3 vocabulary course layout. Ids sit in their own block (7001+) so the
 * N2 / Core 2000 course (4001–6000) and its counts are never touched.
 * Raise N3_VOCAB_LESSON_COUNT as each batch of 10-word lessons lands.
 */
export const N3_VOCAB_ID_START = 7001;
export const N3_VOCAB_ITEMS_PER_LESSON = 10;
export const N3_VOCAB_LESSON_COUNT = 10;
export const N3_VOCAB_ITEM_COUNT = N3_VOCAB_LESSON_COUNT * N3_VOCAB_ITEMS_PER_LESSON;
export const N3_VOCAB_ID_END = N3_VOCAB_ID_START + N3_VOCAB_ITEM_COUNT - 1;
