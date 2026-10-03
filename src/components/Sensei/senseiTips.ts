import type { SceneBackdrop } from "../../services/sceneBus";
import type { SenseiCharacter, SenseiTip } from "../../services/senseiBus";

export const SENSEI_NAMES: Record<SenseiCharacter, { ja: string; en: string }> = {
  tanuki: { ja: "たぬき先生", en: "Tanuki-sensei" },
  neko: { ja: "ねこ先生", en: "Neko-sensei" },
};

/** Study habits and everyday-Japanese notes — the pool when there is no scene. */
export const GENERAL_TIPS: readonly SenseiTip[] = [
  { id: "g-isogaba", ja: "急がば回れ", reading: "いそがばまわれ", en: "“More haste, less speed.” Slow, accurate repetition beats rushing through a deck." },
  { id: "g-keizoku", ja: "継続は力なり", reading: "けいぞくはちからなり", en: "“Persistence is power.” Ten minutes every day beats two hours once a week." },
  { id: "g-shadowing", ja: "シャドーイング", en: "Shadowing: repeat a line a split second behind the voice. Copy the rhythm and pitch, not just the words." },
  { id: "g-ondoku", ja: "音読", reading: "おんどく", en: "Reading aloud ties the sound of a word to its kanji — it sticks far better than silent reading." },
  { id: "g-aizuchi", ja: "あいづち", en: "Aizuchi — うん, へえ, なるほど, そうなんだ — show you are listening. Silence on the other end can feel cold in Japanese." },
  { id: "g-desumasu", ja: "です・ます", en: "Not sure how polite to be? です・ます is always safe with someone you have just met." },
  { id: "g-ndesu", ja: "〜んです", en: "〜んです explains or asks for an explanation. Handy, but using it on every sentence can sound pushy." },
  { id: "g-shitsurei", ja: "失礼します", reading: "しつれいします", en: "Say it entering or leaving a room, and to close a polite phone call." },
  { id: "g-yoroshiku", ja: "よろしくお願いします", reading: "よろしくおねがいします", en: "No neat English equivalent: “please treat me kindly”, “thanks in advance”, “looking forward to working with you” — all in one." },
  { id: "g-kanji-parts", ja: "部首", reading: "ぶしゅ", en: "Learn kanji by their parts (radicals). 氵 is water, 言 is speech — new kanji become guessable." },
  { id: "g-sentences", ja: "例文", reading: "れいぶん", en: "Learn words inside an example sentence. The particles and collocations come for free." },
  { id: "g-sleep", ja: "寝る前に復習", reading: "ねるまえにふくしゅう", en: "A quick review before bed helps memory settle overnight." },
];

/** Shown after a run of misses. */
export const ENCOURAGE_TIPS: readonly SenseiTip[] = [
  { id: "e-donmai", ja: "ドンマイ！", en: "Don't mind! Mistakes are exactly where the learning happens. Read the explanation, then try again." },
  { id: "e-nanakorobi", ja: "七転び八起き", reading: "ななころびやおき", en: "“Fall seven times, get up eight.” Slow down and read each option once more." },
  { id: "e-ippo", ja: "一歩ずつ", reading: "いっぽずつ", en: "One step at a time. Try a shorter set, or switch to study mode for a moment." },
];

/** Shown after a strong session. */
export const CELEBRATE_TIPS: readonly SenseiTip[] = [
  { id: "c-omigoto", ja: "お見事！", reading: "おみごと", en: "Splendid! Come back tomorrow to lock it in — a review the next day is worth three today." },
  { id: "c-choushi", ja: "その調子！", reading: "そのちょうし", en: "Keep it up! Try the next level, or shadow the lines you just got right." },
  { id: "c-sasuga", ja: "さすが！", en: "Just as expected of you! さすが is a handy compliment — use it when someone lives up to their reputation." },
];

/** Culture notes for each scene the talking head can be in. */
export const SCENE_TIPS: Record<SceneBackdrop, readonly SenseiTip[]> = {
  home: [
    { id: "s-home-genkan", ja: "玄関", reading: "げんかん", en: "Shoes come off at the genkan, the entrance step. Point them toward the door when you leave them." },
    { id: "s-home-tadaima", ja: "ただいま・おかえり", en: "Coming home: ただいま. Whoever is home answers おかえり(なさい)." },
    { id: "s-home-moshimoshi", ja: "もしもし", en: "もしもし is fine at home. At work, answer with the company name instead." },
  ],
  office: [
    { id: "s-office-meishi", ja: "名刺", reading: "めいし", en: "Business cards: offer and receive with both hands, read it, and keep it on the table during the meeting." },
    { id: "s-office-otsukare", ja: "お疲れ様です", reading: "おつかれさまです", en: "The all-purpose colleague greeting — in the corridor, at the start of an email, when someone leaves." },
    { id: "s-office-hourensou", ja: "報連相", reading: "ほうれんそう", en: "Report, inform, consult — the basics of Japanese office communication (and a pun on spinach)." },
  ],
  clinic: [
    { id: "s-clinic-hokensho", ja: "保険証", reading: "ほけんしょう", en: "Bring your health insurance card — or a My Number card registered for insurance — to every visit." },
    { id: "s-clinic-monshin", ja: "問診票", reading: "もんしんひょう", en: "On a first visit (初診) you fill in a medical questionnaire before seeing the doctor." },
    { id: "s-clinic-itai", ja: "〜が痛いです", reading: "〜がいたいです", en: "Point and say 〜が痛いです: 頭が, お腹が, 喉が — head, stomach, throat." },
  ],
  restaurant: [
    { id: "s-izakaya-otoshi", ja: "お通し", reading: "おとおし", en: "A small starter that arrives unordered at many izakaya. It usually appears on the bill as a table charge." },
    { id: "s-izakaya-sumimasen", ja: "すみません！", en: "Call staff with a raised hand and すみません! — waiting to be noticed can take a while." },
    { id: "s-izakaya-okaikei", ja: "お会計お願いします", reading: "おかいけいおねがいします", en: "Ask for the bill. You usually pay at the register by the door, not at the table." },
  ],
  hotel: [
    { id: "s-hotel-checkin", ja: "チェックイン", en: "Check-in is often around 3 p.m. You can usually leave bags at the front desk earlier: 荷物を預かってもらえますか。" },
    { id: "s-hotel-yukata", ja: "浴衣", reading: "ゆかた", en: "At a ryokan, the yukata in the room is yours to wear — left side over right." },
    { id: "s-hotel-slippers", ja: "スリッパ", en: "Slippers inside, but never on tatami. Toilets often have their own pair." },
  ],
  station: [
    { id: "s-station-norikae", ja: "乗り換え", reading: "のりかえ", en: "Changing trains. Ask 〜に行きたいんですが、どこで乗り換えますか。" },
    { id: "s-station-escalator", ja: "エスカレーター", en: "In Tokyo people traditionally stand on the left; in Osaka, on the right. Many stations now ask everyone to stand still." },
    { id: "s-station-manner", ja: "マナーモード", en: "Phones on silent on the train, and no phone calls. Talking quietly is fine." },
  ],
  konbini: [
    { id: "s-konbini-atatame", ja: "温めますか？", reading: "あたためますか", en: "“Shall I heat it up?” — for bento. Answer はい、お願いします or 大丈夫です." },
    { id: "s-konbini-fukuro", ja: "袋はいりません", reading: "ふくろはいりません", en: "Plastic bags cost a few yen now. Say this if you don't need one." },
    { id: "s-konbini-services", ja: "支払い", reading: "しはらい", en: "Konbini do much more than snacks: bill payments, parcels, tickets, ATMs and copiers." },
  ],
  street: [
    { id: "s-street-koban", ja: "交番", reading: "こうばん", en: "Lost? A kōban (police box) will give you directions — that's a big part of their job." },
    { id: "s-street-gomi", ja: "ゴミ箱", reading: "ごみばこ", en: "Public bins are rare. Carry your rubbish home, or use the bins beside konbini and vending machines." },
    { id: "s-street-tabearuki", ja: "食べ歩き", reading: "たべあるき", en: "Eating while walking is frowned upon in many places. Finish your snack near the stall." },
  ],
  cafe: [
    { id: "s-cafe-kissaten", ja: "喫茶店", reading: "きっさてん", en: "An old-style coffee shop — slower and more personal than a chain café. Many serve a morning set (モーニング)." },
    { id: "s-cafe-gochisou", ja: "ごちそうさまでした", en: "Say it to the staff on your way out — it thanks them for the food and drink." },
    { id: "s-cafe-casual", ja: "ため口", reading: "ためぐち", en: "Casual speech between friends. Use it only once the other person has switched to it too." },
  ],
  counter: [
    { id: "s-counter-bangou", ja: "番号札", reading: "ばんごうふだ", en: "Take a number ticket first and wait for it to be called — don't queue at the window." },
    { id: "s-counter-inkan", ja: "印鑑", reading: "いんかん", en: "A personal seal (はんこ) is still needed for some banking and office paperwork. Ask whether a signature is OK." },
    { id: "s-counter-hours", ja: "窓口", reading: "まどぐち", en: "Counters at city offices and banks often close around 5 p.m. on weekdays — go early." },
  ],
};

/**
 * Pick a tip from `pool`, avoiding the most recently shown ids when possible.
 * `rand` is 0–1 (Math.random in the app).
 */
export function pickTip(
  pool: readonly SenseiTip[],
  recent: readonly string[],
  rand: number
): SenseiTip | null {
  if (!pool.length) return null;
  const fresh = pool.filter((t) => !recent.includes(t.id));
  const from = fresh.length ? fresh : pool;
  const i = Math.min(from.length - 1, Math.max(0, Math.floor(rand * from.length)));
  return from[i];
}

/** Rough reading time for a tip, ms: 5 s base, grows with length, capped. */
export function tipDurationMs(tip: SenseiTip): number {
  const chars = tip.en.length + (tip.ja?.length ?? 0) * 3;
  return Math.min(15_000, 5000 + chars * 45);
}
