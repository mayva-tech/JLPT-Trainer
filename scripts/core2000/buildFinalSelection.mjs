/**
 * Build final-selection.tsv: 2000 rows.
 * Existing 750 keep IDs/lessons 1–75.
 * New 1250 are thematically regrouped into lessons 76–200, then IDs 4751–6000.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

const vocabSrc = fs.readFileSync(path.join(root, "src/data/vocabulary.ts"), "utf8");
const seedStart = vocabSrc.indexOf("const seeds: VocabularySeed[]");
const seedSlice = vocabSrc.slice(seedStart);
const existing = [];
const re =
  /id:\s*(\d+),\s*\n\s*subcategory:\s*"([^"]+)",\s*\n\s*folder:\s*"([^"]+)",\s*\n\s*word:\s*"([^"]+)",\s*reading:\s*"([^"]+)",\s*meaning:\s*"([^"]+)",/g;
let m;
while ((m = re.exec(seedSlice))) {
  existing.push({
    id: Number(m[1]),
    subcategory: m[2],
    folder: m[3],
    word: m[4].normalize("NFC"),
    reading: m[5],
    meaning: m[6],
  });
}

const lessonsSrc = fs.readFileSync(path.join(root, "src/data/lessons.ts"), "utf8");
const lessonByVocabId = new Map();
const lessonMeta = new Map();
const lessonBlocks = [
  ...lessonsSrc.matchAll(
    /\{\s*id:\s*"(lesson-\d+)",\s*title:\s*"([^"]*)",\s*subtitle:\s*"([^"]*)",\s*youtubeTitle:\s*"([^"]*)",\s*category:\s*"([^"]*)",\s*subcategories:\s*\[([^\]]*)\],\s*vocabularyIds:\s*idRange\((\d+)\)/g
  ),
];
for (const lm of lessonBlocks) {
  const lessonId = lm[1];
  const lessonNumber = Number(lessonId.replace("lesson-", ""));
  const startId = Number(lm[7]);
  const category = lm[5];
  const subcategories = lm[6]
    .split(",")
    .map((s) => s.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
  lessonMeta.set(lessonNumber, {
    lessonId,
    title: lm[2],
    subtitle: lm[3],
    youtubeTitle: lm[4],
    category,
    subcategory: subcategories[0] || "General",
  });
  for (let i = 0; i < 10; i++) {
    lessonByVocabId.set(startId + i, lessonNumber);
  }
}

const selection = JSON.parse(
  fs.readFileSync(path.join(__dirname, "selection-plan.json"), "utf8")
);
/** @type {{rank:number,word:string}[]} */
const newWords = selection.selected.map((s) => ({
  rank: s.rank,
  word: s.word.normalize("NFC"),
}));

/**
 * Theme definitions: ordered lessons 76–200.
 * Each theme pulls matching words from the pool (exact word set or predicate).
 * Remaining words fill later broader lessons.
 */
const THEME_SPECS = [
  // People & family
  { lesson: 76, category: "Daily Life", subcategory: "People", folder: "core-people", title: "People & Pronouns", words: ["私","あなた","人","男","女","子ども","大人","友達","友人","家族"] },
  { lesson: 77, category: "Daily Life", subcategory: "Family", folder: "core-family", title: "Family Members", words: ["父","母","両親","兄","姉","弟","妹","夫","妻","息子"] },
  { lesson: 78, category: "Daily Life", subcategory: "Family", folder: "core-family", title: "Family & School Roles", words: ["娘","先生","学生","生徒","日本人","日本語","英語","外国","外国人","国"] },
  // Places & institutions
  { lesson: 79, category: "Daily Life", subcategory: "Places", folder: "core-places", title: "Places & Institutions", words: ["世界","社会","会社","仕事","学校","大学","教室","病院","銀行","駅"] },
  { lesson: 80, category: "Daily Life", subcategory: "Shopping", folder: "core-shopping", title: "Shops & Stores", words: ["店","スーパー","コンビニ","家","部屋","台所","玄関","風呂","トイレ","窓"] },
  { lesson: 81, category: "Daily Life", subcategory: "Home", folder: "core-home", title: "Home & Furniture", words: ["ドア","階段","庭","テーブル","椅子","ベッド","家具","冷蔵庫","今日","明日"] },
  // Time
  { lesson: 82, category: "Daily Life", subcategory: "Time", folder: "core-time", title: "Days & Time of Day", words: ["昨日","今","朝","昼","夜","夕方","午前","午後","今週","先週"] },
  { lesson: 83, category: "Daily Life", subcategory: "Time", folder: "core-time", title: "Weeks, Months & Years", words: ["来週","今月","先月","来月","今年","去年","来年","時間","時","分"] },
  { lesson: 84, category: "Daily Life", subcategory: "Time", folder: "core-time", title: "Calendar Units & Seasons", words: ["日","週","月","年","春","夏","秋","冬","毎日","毎週"] },
  { lesson: 85, category: "Daily Life", subcategory: "Numbers", folder: "core-numbers", title: "Numbers 1–10", words: ["毎月","毎年","一","二","三","四","五","六","七","八"] },
  { lesson: 86, category: "Daily Life", subcategory: "Numbers", folder: "core-numbers", title: "Larger Numbers & Order", words: ["九","十","百","千","万","半","一番","最初","最後","次"] },
  // Position & direction
  { lesson: 87, category: "Daily Life", subcategory: "Position", folder: "core-position", title: "Position & Direction", words: ["前","後","上","下","中","外","内","左","右","東"] },
  { lesson: 88, category: "Daily Life", subcategory: "Position", folder: "core-position", title: "Directions & Demonstratives", words: ["西","南","北","ここ","そこ","あそこ","どこ","こちら","そちら","あちら"] },
  // Basic verbs / daily actions — filled by classifier below for remaining
];

/** Heuristic theme tags for remaining words (order = lesson packing priority). */
const _HEURISTICS = [
  { key: "demonstratives", category: "Daily Life", subcategory: "Communication", folder: "core-communication", title: "Demonstratives & Questions", test: (w) => /^(これ|それ|あれ|どれ|この|その|あの|どの|誰|何|いつ|どう|なぜ|どうして|どれ|どちら)$/.test(w) },
  { key: "basic-verbs-1", category: "Daily Life", subcategory: "Daily Actions", folder: "core-verbs", title: "Basic Verbs I", test: (w) => /^(する|ある|いる|行く|来る|帰る|食べる|飲む|見る|聞く|言う|話す|読む|書く|買う|売る|持つ|待つ|立つ|座る|歩く|走る|泳ぐ|寝る|起きる|開ける|閉じる|閉める|付ける|消す|出す|入れる|取る|置く|作る|使う|分かる|知る|思う|考える|教える|習う|学ぶ|働く|休む|遊ぶ|会う|送る|もらう|あげる|くれる|始める|終わる|続ける|決める|選ぶ|探す|見つける|忘れる|覚える|手伝う|頼む|断る|許す|謝る|喜ぶ|悲しむ|怒る|笑う|泣く)$/.test(w) },
  { key: "i-adj", category: "Daily Life", subcategory: "Adjectives", folder: "core-adjectives", title: "I-Adjectives", test: (w) => /い$/.test(w) && w.length <= 5 && !/する$/.test(w) && /^(大き|小さ|新し|古|高|安|低|長|短|広|狭|厚|薄|速|早|遅|強|弱|重|軽|暑|熱|寒|涼|暖|温|良|悪|美味|まず|楽し|面白|悲し|嬉し|怖|痛|痒|眠|忙しい|難しい|易しい|優し|厳し|正し|すごい|やばい|近い|遠い|多い|少ない|若い|欲しい|可愛い|美しい|汚い|明るい|暗い|静か|静か)/.test(w) === false ? /い$/.test(w) && !/[する]$/.test(w) : /^(大きい|小さい|新しい|古い|高い|安い|低い|長い|短い|広い|狭い|速い|早い|遅い|強い|弱い|重い|軽い|暑い|熱い|寒い|涼しい|暖かい|温かい|良い|いい|悪い|美味しい|まずい|楽しい|面白い|悲しい|嬉しい|怖い|痛い|眠い|忙しい|難しい|易しい|優しい|厳しい|正しい|近い|遠い|多い|少ない|若い|欲しい|可愛い|美しい|汚い|明るい|暗い|太い|細い|厚い|薄い|甘い|辛い|苦い|塩辛い|酸っぱい|恥ずかしい|寂しい|凄い)$/.test(w) },
];

// Simpler packing: use curated theme word lists for early lessons, then
// pack remaining words into sequential thematic buckets using keyword maps.

const KEYWORD_BUCKETS = [
  { category: "Daily Life", subcategory: "Demonstratives", folder: "core-demo", title: "This & That", match: ["これ","それ","あれ","どれ","この","その","あの","どの","誰","何"] },
  { category: "Daily Life", subcategory: "Questions", folder: "core-questions", title: "Question Words", match: ["いつ","どう","なぜ","どうして","どちら","どっち","いくら","いくつ","どんな","どのくらい"] },
  { category: "Daily Life", subcategory: "Daily Actions", folder: "core-verbs-a", title: "Core Verbs A", match: ["する","ある","いる","居る","行く","来る","帰る","戻る","食べる","飲む"] },
  { category: "Daily Life", subcategory: "Daily Actions", folder: "core-verbs-b", title: "Core Verbs B", match: ["見る","聞く","言う","話す","読む","書く","買う","売る","持つ","待つ"] },
  { category: "Daily Life", subcategory: "Daily Actions", folder: "core-verbs-c", title: "Core Verbs C", match: ["立つ","座る","歩く","走る","泳ぐ","寝る","起きる","開ける","閉める","付ける"] },
  { category: "Daily Life", subcategory: "Daily Actions", folder: "core-verbs-d", title: "Core Verbs D", match: ["消す","出す","入れる","取る","置く","作る","使う","分かる","知る","思う"] },
  { category: "Daily Life", subcategory: "Daily Actions", folder: "core-verbs-e", title: "Core Verbs E", match: ["考える","教える","習う","学ぶ","働く","休む","遊ぶ","会う","送る","もらう"] },
  { category: "Daily Life", subcategory: "Giving & Receiving", folder: "core-give", title: "Give & Receive", match: ["あげる","くれる","やる","借りる","貸す","返す","届く","届ける","受け取る","渡す"] },
  { category: "Daily Life", subcategory: "Adjectives", folder: "core-iadj-a", title: "Common I-Adjectives A", match: ["大きい","小さい","新しい","古い","高い","安い","低い","長い","短い","広い"] },
  { category: "Daily Life", subcategory: "Adjectives", folder: "core-iadj-b", title: "Common I-Adjectives B", match: ["狭い","速い","早い","遅い","強い","弱い","重い","軽い","暑い","寒い"] },
  { category: "Daily Life", subcategory: "Adjectives", folder: "core-iadj-c", title: "Common I-Adjectives C", match: ["熱い","涼しい","暖かい","温かい","良い","いい","悪い","美味しい","まずい","楽しい"] },
  { category: "Daily Life", subcategory: "Adjectives", folder: "core-iadj-d", title: "Common I-Adjectives D", match: ["面白い","悲しい","嬉しい","怖い","痛い","眠い","忙しい","難しい","優しい","厳しい"] },
  { category: "Daily Life", subcategory: "Na-Adjectives", folder: "core-naadj", title: "Na-Adjectives", match: ["静か","有名","便利","不便","元気","暇","好き","嫌い","上手","下手","簡単","複雑","大切","大事","必要","特別","普通","同じ","色々","大変"] },
  { category: "Daily Life", subcategory: "Food", folder: "core-food-a", title: "Food & Drink A", match: ["ご飯","水","お茶","コーヒー","牛乳","パン","肉","魚","野菜","果物"] },
  { category: "Daily Life", subcategory: "Food", folder: "core-food-b", title: "Food & Drink B", match: ["卵","米","塩","砂糖","油","醤油","味噌","スープ","サラダ","デザート"] },
  { category: "Daily Life", subcategory: "Food", folder: "core-food-c", title: "Meals & Taste", match: ["朝食","昼食","夕食","弁当","味","甘い","辛い","苦い","酸っぱい","塩辛い"] },
  { category: "Daily Life", subcategory: "Body", folder: "core-body", title: "Body & Health Basics", match: ["体","頭","顔","目","耳","口","鼻","手","足","髪"] },
  { category: "Daily Life", subcategory: "Health", folder: "core-health", title: "Health & Illness", match: ["病気","風邪","熱","薬","医者","看護","症状","治療","健康","怪我"] },
  { category: "Daily Life", subcategory: "Transportation", folder: "core-transport", title: "Transportation", match: ["電車","バス","タクシー","車","自転車","飛行機","船","地下鉄","切符","乗車券"] },
  { category: "Daily Life", subcategory: "Travel", folder: "core-travel", title: "Travel Basics", match: ["旅行","観光","ホテル","予約","地図","道","橋","空港","港","パスポート"] },
  { category: "Daily Life", subcategory: "Weather", folder: "core-weather", title: "Weather Basics", match: ["天気","雨","雪","風","雲","空","太陽","星","晴れ","曇り"] },
  { category: "Daily Life", subcategory: "Clothing", folder: "core-clothes", title: "Clothes", match: ["服","シャツ","ズボン","スカート","靴","帽子","コート","眼鏡","時計","鞄"] },
  { category: "Daily Life", subcategory: "School", folder: "core-school", title: "School Life", match: ["授業","宿題","試験","テスト","成績","教科書","ノート","鉛筆","ペン","消しゴム"] },
  { category: "Work & Business", subcategory: "Work", folder: "core-work", title: "Work Basics", match: ["会社員","社員","部長","課長","同僚","会議","残業","給料","休暇","就職"] },
  { category: "Work & Business", subcategory: "Money", folder: "core-money", title: "Money Basics", match: ["お金","現金","カード","財布","値段","料金","費用","給料","貯金","借金"] },
  { category: "Daily Life", subcategory: "Communication", folder: "core-comms", title: "Communication", match: ["手紙","電話","メール","会話","質問","答え","説明","紹介","挨拶","連絡"] },
  { category: "Daily Life", subcategory: "Emotions", folder: "core-emotions", title: "Emotions", match: ["気持ち","感情","愛","恋","夢","希望","不安","心配","安心","満足"] },
  { category: "Technology & Science", subcategory: "Technology", folder: "core-tech", title: "Technology Basics", match: ["パソコン","スマホ","携帯","インターネット","ウェブサイト","アプリ","パスワード","データ","ファイル","プリンター"] },
  { category: "Society & Public Affairs", subcategory: "Society", folder: "core-society", title: "Society Basics", match: ["政治","経済","法律","税金","選挙","政府","市長","市民","住民","公共"] },
  { category: "Academic & Abstract", subcategory: "Abstract", folder: "core-abstract", title: "Abstract Nouns A", match: ["問題","答え","理由","原因","結果","目的","方法","場合","状態","状況"] },
];

const pool = new Map(newWords.map((w) => [w.word, w]));
const used = new Set();
const newLessons = [];

function available() {
  return [...pool.values()]
    .filter((w) => !used.has(w.word))
    .sort((a, b) => a.rank - b.rank);
}

/** Peek exact matches without committing to `used`. */
function peekExact(words) {
  const taken = [];
  for (const w of words) {
    if (pool.has(w) && !used.has(w) && !taken.some((t) => t.word === w)) {
      taken.push(pool.get(w));
    }
  }
  return taken;
}

function peekFill(n, excludeWords, preferFn) {
  const exclude = new Set(excludeWords);
  const candidates = available().filter((w) => !exclude.has(w.word));
  const preferred = preferFn ? candidates.filter(preferFn) : candidates;
  const ordered = preferred.length ? preferred : candidates;
  return ordered.slice(0, n);
}

function commit(items) {
  for (const w of items) {
    if (used.has(w.word)) throw new Error(`Double-commit: ${w.word}`);
    used.add(w.word);
  }
}

function pushLesson(lessonNumber, category, subcategory, folder, title, items) {
  if (items.length !== 10) {
    throw new Error(
      `Lesson ${lessonNumber} (${title}) has ${items.length} words, need 10: ${items.map((i) => i.word).join(",")}`
    );
  }
  newLessons.push({ lessonNumber, category, subcategory, folder, title, items });
}

// Lessons 76–88 from THEME_SPECS (may need fill if some words already matched elsewhere)
for (const spec of THEME_SPECS) {
  let items = peekExact(spec.words);
  if (items.length < 10) {
    items = items.concat(peekFill(10 - items.length, items.map((i) => i.word)));
  }
  items = items.slice(0, 10);
  commit(items);
  pushLesson(spec.lesson, spec.category, spec.subcategory, spec.folder, spec.title, items);
}

// Keyword buckets for next lessons
let nextLesson = 89;
for (const bucket of KEYWORD_BUCKETS) {
  if (nextLesson > 200) break;
  let items = peekExact(bucket.match);
  if (items.length < 10) {
    items = items.concat(
      peekFill(
        10 - items.length,
        items.map((i) => i.word),
        (w) => bucket.match.some((x) => w.word.includes(x))
      )
    );
  }
  if (items.length < 10) {
    items = items.concat(peekFill(10 - items.length, items.map((i) => i.word)));
  }
  if (items.length >= 10) {
    items = items.slice(0, 10);
    commit(items);
    pushLesson(
      nextLesson,
      bucket.category,
      bucket.subcategory,
      bucket.folder,
      bucket.title,
      items
    );
    nextLesson++;
  }
}

// Remaining words: pack by rank into lessons with broad themes rotating
const remaining = [...pool.values()]
  .filter((w) => !used.has(w.word))
  .sort((a, b) => a.rank - b.rank);

const ROTATING = [
  { category: "Daily Life", subcategory: "Daily Vocabulary", folder: "core-daily", title: "Daily Vocabulary" },
  { category: "Daily Life", subcategory: "Common Verbs", folder: "core-verbs-more", title: "Common Verbs" },
  { category: "Daily Life", subcategory: "Common Adjectives", folder: "core-adj-more", title: "Common Adjectives" },
  { category: "Work & Business", subcategory: "Business Basics", folder: "core-business", title: "Business Vocabulary" },
  { category: "Society & Public Affairs", subcategory: "Public Life", folder: "core-public", title: "Public Life" },
  { category: "Academic & Abstract", subcategory: "Abstract Concepts", folder: "core-abstract-more", title: "Abstract Concepts" },
  { category: "Technology & Science", subcategory: "Science & Tech", folder: "core-science", title: "Science & Technology" },
  { category: "Daily Life", subcategory: "Nature", folder: "core-nature", title: "Nature & Environment" },
  { category: "Daily Life", subcategory: "Media", folder: "core-media", title: "Media & Culture" },
  { category: "Academic & Abstract", subcategory: "N2 Reading", folder: "core-n2-reading", title: "N2 Reading Vocabulary" },
];

let ri = 0;
while (nextLesson <= 200) {
  const chunk = remaining.slice(ri, ri + 10);
  if (chunk.length < 10) {
    throw new Error(
      `Not enough remaining words for lesson ${nextLesson}: have ${chunk.length}, total remaining ${remaining.length - ri}, lessons so far ${newLessons.length}`
    );
  }
  chunk.forEach((w) => used.add(w.word));
  const theme = ROTATING[(nextLesson - 89) % ROTATING.length];
  pushLesson(
    nextLesson,
    theme.category,
    theme.subcategory,
    theme.folder,
    `${theme.title} ${nextLesson}`,
    chunk
  );
  ri += 10;
  nextLesson++;
}

if (newLessons.length !== 125) {
  throw new Error(`Expected 125 new lessons, got ${newLessons.length}`);
}
if (used.size !== 1250) {
  throw new Error(`Expected 1250 used new words, got ${used.size}`);
}

// Assign IDs 4751–6000 in lesson order
let nextId = 4751;
const newRows = [];
for (const lesson of newLessons) {
  lesson.items.forEach((item, _idx) => {
    const id = nextId++;
    newRows.push({
      final_position: id - 4000,
      id,
      word: item.word,
      candidate_rank: item.rank,
      source: "candidate",
      existing_id: "",
      lesson_number: lesson.lessonNumber,
      category: lesson.category,
      subcategory: lesson.subcategory,
      folder: lesson.folder,
      lesson_title: lesson.title,
    });
  });
}
if (nextId !== 6001) throw new Error(`ID end mismatch: ${nextId}`);

// Existing rows
const existingRows = existing.map((e) => {
  const lessonNumber = lessonByVocabId.get(e.id) ?? Math.floor((e.id - 4001) / 10) + 1;
  const meta = lessonMeta.get(lessonNumber);
  return {
    final_position: e.id - 4000,
    id: e.id,
    word: e.word,
    candidate_rank: "",
    source: "existing",
    existing_id: e.id,
    lesson_number: lessonNumber,
    category: meta?.category ?? "Daily Life",
    subcategory: e.subcategory,
    folder: e.folder,
    lesson_title: meta?.subtitle ?? "",
  };
});

const allRows = [...existingRows, ...newRows].sort((a, b) => a.id - b.id);
if (allRows.length !== 2000) throw new Error(`Expected 2000 rows, got ${allRows.length}`);

const header = [
  "final_position",
  "id",
  "word",
  "candidate_rank",
  "source",
  "existing_id",
  "lesson_number",
  "category",
  "subcategory",
  "folder",
  "lesson_title",
];
const tsv = [
  header.join("\t"),
  ...allRows.map((r) => header.map((h) => String(r[h] ?? "")).join("\t")),
].join("\n") + "\n";

fs.writeFileSync(path.join(__dirname, "final-selection.tsv"), tsv, "utf8");
fs.writeFileSync(
  path.join(__dirname, "new-lessons-plan.json"),
  JSON.stringify(newLessons, null, 2),
  "utf8"
);

// Per-batch word lists for authoring
const batches = [];
for (let start = 4751; start <= 6000; start += 100) {
  const end = Math.min(start + 99, 6000);
  const rows = newRows.filter((r) => r.id >= start && r.id <= end);
  batches.push({ start, end, count: rows.length, rows });
  fs.writeFileSync(
    path.join(__dirname, `batch-${start}-${end}.json`),
    JSON.stringify(rows, null, 2),
    "utf8"
  );
}

console.log(
  JSON.stringify(
    {
      totalRows: allRows.length,
      existing: existingRows.length,
      neu: newRows.length,
      newLessons: newLessons.length,
      firstNewLesson: newLessons[0].title,
      lastNewLesson: newLessons[newLessons.length - 1].title,
      idRange: `${newRows[0].id}-${newRows[newRows.length - 1].id}`,
      batches: batches.map((b) => `${b.start}-${b.end}:${b.count}`),
    },
    null,
    2
  )
);
