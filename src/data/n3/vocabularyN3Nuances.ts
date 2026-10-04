import type { VocabNuanceEntry } from "../vocabularyNuances/types";

/**
 * N3 vocabulary usage notes keyed by id — same rules as N2: every phrase has
 * a note; word and sentence notes only when something is worth saying.
 * Notes are spoken by the Nuance voice, so: one or two short sentences,
 * at most 140 characters, no digits, brackets or quotation marks.
 */
export const n3VocabNuances: Readonly<Record<number, VocabNuanceEntry>> = {
  7001: {
    word: "家事 covers all the work of running a home; cooking, cleaning and laundry are each a kind of 家事.",
    phrase: "分担する means to split a job between people, as in 家事を分担する between a couple.",
  },
  7002: {
    word: "洗濯物 is the clothes being washed or dried; 洗濯 is the act of washing itself.",
    phrase: "干す is to hang something out to dry; bringing it back in is 取り込む.",
  },
  7003: {
    phrase: "Use 厚い for thick flat things like blankets and books; 太い is for thick rods or lines.",
  },
  7004: {
    word: "床 read ゆか is the floor of a room; read とこ it means a bed or alcove in older Japanese.",
    phrase: "拭く means to wipe with a cloth; for sweeping with a broom say 掃く.",
  },
  7005: {
    phrase: "修理 is used for repairing things like roofs and machines; for clothes use 直す or 繕う.",
  },
  7006: {
    word: "瓶 is a glass or plastic bottle; a plastic drink bottle is usually called ペットボトル.",
    phrase: "空 read から means empty; read そら it means the sky.",
  },
  7007: {
    phrase: "缶を開ける is the general phrase; a pull-tab can is opened with プシュッと, a can-opener sound word.",
    sentence: "Japanese towns sort trash strictly, so cans, bottles and plastic often go out on different days.",
  },
  7008: {
    phrase: "蓋をする means to put the lid on; 蓋を取る means to take it off.",
  },
  7009: {
    word: "冷凍庫 is the freezer; the fridge section is 冷蔵庫, which uses the kanji for cooling and storing.",
    phrase: "保存する is to store or keep food; 冷凍 means freezing, so 冷凍保存 is freezer storage.",
  },
  7010: {
    phrase: "In Japan the ベランダ is where laundry and small plants usually go, even in tiny apartments.",
  },
  7011: {
    word: "不満 is a sense that something falls short; 文句 is the complaint actually spoken out loud.",
    phrase: "不満を言う voices a complaint; 不満がある or 不満を持つ just means feeling it.",
  },
  7012: {
    word: "後悔 is regret about your own past actions; for regret about events in general use 残念.",
    phrase: "後悔しない is often used to encourage someone to choose what they truly want.",
    sentence: "すればよかった means I should have done it, a very common way to express regret.",
  },
  7013: {
    word: "退屈 is boredom from having nothing interesting to do; つまらない says the thing itself is dull.",
    phrase: "退屈な takes な before a noun, like other na-adjectives.",
  },
  7014: {
    word: "夢中 literally means inside a dream, used for being completely absorbed in something.",
    phrase: "Use に with 夢中, as in ゲームに夢中になる for getting hooked on a game.",
  },
  7015: {
    phrase: "冗談を言う is to joke; 冗談でしょう means you must be kidding.",
    sentence: "気にしないで means don't worry about it, a soft way to ease someone's mind.",
  },
  7016: {
    word: "自慢 can be friendly pride or annoying boasting, depending on context.",
    phrase: "自慢の before a noun means one's pride and joy, like 自慢の料理 or 自慢の息子.",
  },
  7017: {
    word: "機嫌 is someone's mood toward others; ご機嫌 is the polite or cheerful form.",
    phrase: "機嫌がいい and 機嫌が悪い describe a good or bad mood, often of a boss or a child.",
  },
  7018: {
    word: "平気 means unbothered; it can sound tough, as in 平気で嘘をつく, lying without a second thought.",
    phrase: "平気な顔 is a calm face, often hiding real feelings.",
  },
  7019: {
    phrase: "涙が出る is the natural phrase for tears welling up; 泣く is the verb to cry.",
  },
  7020: {
    word: "笑顔 combines 笑, laugh, and 顔, face, so it means a smiling face.",
    phrase: "明るい笑顔 is a cheerful smile; 明るい also describes a cheerful personality.",
  },
  7021: {
    word: "同僚 is a colleague at the same level; a boss is 上司 and a junior is 部下 or 後輩.",
    phrase: "飲みに行く means going out for drinks, a common way coworkers socialize in Japan.",
  },
  7022: {
    word: "専攻 is your major at university; in conversation people also ask 何を勉強していますか.",
    phrase: "大学の専攻 is used on forms and in interviews to ask what you studied.",
  },
  7023: {
    word: "Japanese schools usually have three 学期, and the school year starts in April.",
    phrase: "新学期 is the short form for a new term, often seen in shop ads in spring.",
  },
  7024: {
    word: "遅刻 is being late for a set start time, like work or class; for being late in general use 遅れる.",
    phrase: "遅刻の理由 is the explanation expected from you when you arrive late.",
  },
  7025: {
    word: "進学 means moving up to a higher school, like high school to university; getting a job is 就職.",
    phrase: "への makes a phrase like 大学への進学 describe the destination of moving up.",
  },
  7026: {
    word: "正社員 are full-time permanent staff; part-time workers are パート or アルバイト.",
    phrase: "正社員になる is a common career goal, since it brings job security and benefits.",
  },
  7027: {
    word: "新入社員 are new hires, usually fresh graduates who join together in April.",
    phrase: "研修 means training; most companies run a group 新入社員研修 for new hires.",
  },
  7028: {
    word: "取引先 is any company you do business with; a customer you sell to can also be 顧客.",
    phrase: "取引先との uses との to link a partner to a noun, like a meeting with them.",
  },
  7029: {
    word: "時給 is pay per hour, typical for part-time jobs; monthly pay is 月給.",
    phrase: "時給が上がる means the hourly wage goes up; the opposite is 下がる.",
  },
  7030: {
    word: "報告書 is a written report; 報告 alone can be spoken, like a quick update to your boss.",
    phrase: "報告書を書く is to write a report; to submit it, say 報告書を出す or 提出する.",
  },
  7031: {
    word: "迷子 is a lost child, but adults also say 迷子になる jokingly when they get lost.",
    phrase: "迷子になる is the set phrase for getting lost; 道に迷う focuses on losing your way.",
  },
  7032: {
    word: "到着 is formal arrival, common in announcements; in conversation say 着く.",
    phrase: "到着の時間 is arrival time; on boards it is often written 到着時刻.",
  },
  7033: {
    word: "発車 is used only for trains, buses and cars leaving; planes use 出発 or 離陸.",
    phrase: "合図 is a signal; stations play a melody or bell as the 発車の合図.",
  },
  7034: {
    phrase: "乗客の安全 is typical announcement language; staff call passengers お客様 when speaking to them.",
  },
  7035: {
    word: "歩道 is the sidewalk; a pedestrian crossing is 横断歩道.",
    phrase: "広い describes a wide sidewalk or room; for a narrow one use 狭い.",
    sentence: "Bicycles in Japan should normally ride on the road, though some sidewalks allow them.",
  },
  7036: {
    word: "人混み is a crowd of people pressing together; 混む is the verb for getting crowded.",
    phrase: "避ける means to avoid; 人混みを避ける is common advice during cold season.",
  },
  7037: {
    word: "観光地 is a tourist destination; a single sight like a temple is a 観光スポット.",
    phrase: "有名な観光地 is a famous spot; a lesser known one is a 穴場.",
  },
  7038: {
    word: "両替 is changing money, either between currencies or into smaller bills and coins.",
    phrase: "空港で両替する is convenient, but rates are often better in town.",
  },
  7039: {
    word: "手荷物 is luggage you carry by hand; checked baggage is 預け荷物.",
    phrase: "手荷物を預ける means to hand your bags over, at a check-in counter or a cloakroom.",
  },
  7040: {
    word: "商店街 is a street of small local shops, often with a covered arcade.",
    phrase: "駅前 means in front of the station, where many shopping streets start.",
  },
  7041: {
    word: "頭痛 is the formal word for a headache; in conversation people say 頭が痛い.",
    phrase: "ひどい頭痛 is a terrible headache; ひどい means severe or awful.",
    sentence: "頭痛がする uses する, the same pattern as 音がする for sounds.",
  },
  7042: {
    word: "咳 is a cough; a sneeze is くしゃみ, and both are common words at the clinic.",
    phrase: "咳が出る is how you tell a doctor you are coughing.",
  },
  7043: {
    word: "怪我 is a physical injury from an accident; illness is 病気.",
    phrase: "足の怪我 can mean a foot or leg injury, since 足 covers both.",
    sentence: "怪我をする is the set phrase for getting hurt; 怪我をさせる is to injure someone else.",
  },
  7044: {
    word: "骨折 combines 骨, bone, and 折, break; a sprain is 捻挫.",
    phrase: "腕の骨折 is a broken arm; doctors say 骨にひびが入る for a crack.",
    sentence: "てしまった adds regret, showing that breaking the leg was unfortunate.",
  },
  7045: {
    word: "体温 is body temperature; weather temperature is 気温.",
    phrase: "測る is the verb for measuring temperature, time or weight; 体温を測る is to take one's temperature.",
  },
  7046: {
    word: "体調 is your overall physical condition, a gentle way to talk about feeling unwell.",
    phrase: "体調を崩す means to fall ill, a soft and very common expression.",
    sentence: "体調が悪い is a polite reason to give for taking a day off.",
  },
  7047: {
    word: "寝不足 means not enough sleep; staying up all night is 徹夜.",
    phrase: "寝不足の顔 is the tired look people notice, often with dark circles called くま.",
  },
  7048: {
    phrase: "With 目薬 the verb is さす, not 入れる; 目薬をさす is the set phrase.",
  },
  7049: {
    word: "虫歯 literally means insect tooth, from an old belief that bugs caused tooth decay.",
    phrase: "治療 is medical treatment; at the dentist you say 虫歯を治療する.",
  },
  7050: {
    word: "食欲 is appetite; 食欲の秋 refers to autumn as the season of good food.",
    phrase: "食欲がない is the usual way to say you have no appetite.",
  },
};
