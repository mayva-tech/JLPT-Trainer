import type { QuestDefinition } from "../../types";

/** Short street encounters (~20–60s) using the same QuestRunner engine. */

export const RANDOM_BAG_ASK_QUEST: QuestDefinition = {
  id: "random-bag-ask",
  title: "Bag Needed?",
  japaneseTitle: "袋いりますか？",
  locationId: "convenience-store",
  chapter: 1,
  description: "A quick counter question — bag or no bag.",
  difficulty: "easy",
  recommendedLevel: 1,
  startingConfidence: 3,
  requiresQuestIds: ["convenience-first-shop"],
  objectives: [{ id: "bag", label: "Answer the bag question naturally" }],
  meetNpcIds: ["sato-clerk"],
  icon: "🛍️",
  steps: [
    {
      id: "intro",
      kind: "intro",
      promptJa: "コンビニのレジで、さっと聞かれる一言。",
      promptEn: "A quick question at the convenience-store register.",
      speech: { autoPlay: true, language: "en" },
    },
    {
      id: "ask",
      kind: "dialogue",
      npcId: "sato-clerk",
      promptJa: "袋いりますか？",
      promptReading: "ふくろ いります か",
      promptEn: "Do you need a bag?",
      helpHint: "いりますか？= do you need…？ 結構です declines politely.",
      vocabHint: "袋",
      speech: { autoPlay: true },
      choices: [
        {
          id: "yes",
          labelJa: "はい、お願いします。",
          labelEn: "Yes, please.",
          correct: true,
          feedbackCorrect: "✅ Natural yes.\n\n「お願いします」keeps it polite.",
        },
        {
          id: "no",
          labelJa: "いいえ、結構です。",
          labelEn: "No, I'm fine.",
          correct: false,
          feedbackWrong:
            "❌ Also workable in real life — but for this drill pick 「はい、お願いします」.\n\n「結構です」politely declines.",
        },
        {
          id: "wrong",
          labelJa: "袋を食べます。",
          labelEn: "I'll eat the bag.",
          correct: false,
          feedbackWrong:
            "❌ That would confuse the clerk.\n\nTry 「はい、お願いします」or 「いいえ、結構です」.",
        },
      ],
    },
    {
      id: "outro",
      kind: "outro",
      promptJa: "短いやり取り、クリア！",
      promptEn: "Short exchange — clear!",
    },
  ],
  rewards: {
    xp: 25,
    replayXp: 5,
    skillRewards: { conversation: 1, vocabulary: 1 },
    coins: 10,
    randomEncounter: true,
    relationshipNpcIds: ["sato-clerk"],
  },
  unlocks: {},
};

export const RANDOM_HEAT_ASK_QUEST: QuestDefinition = {
  id: "random-heat-ask",
  title: "Shall I Heat It?",
  japaneseTitle: "温めますか？",
  locationId: "convenience-store",
  chapter: 1,
  description: "The clerk asks if you want your bento heated.",
  difficulty: "easy",
  recommendedLevel: 1,
  startingConfidence: 3,
  requiresQuestIds: ["convenience-first-shop"],
  objectives: [{ id: "heat", label: "Answer the heating question" }],
  meetNpcIds: ["sato-clerk"],
  icon: "♨️",
  steps: [
    {
      id: "intro",
      kind: "intro",
      promptJa: "お弁当を買うと、よく聞かれる一言。",
      promptEn: "A common question when you buy a bento.",
      speech: { autoPlay: true, language: "en" },
    },
    {
      id: "ask",
      kind: "dialogue",
      npcId: "sato-clerk",
      promptJa: "温めますか？",
      promptReading: "あたためます か",
      promptEn: "Shall I heat this up?",
      helpHint: "温めますか？= Shall I warm it？",
      vocabHint: "温める",
      speech: { autoPlay: true },
      choices: [
        {
          id: "yes",
          labelJa: "はい、お願いします。",
          labelEn: "Yes, please.",
          correct: true,
          feedbackCorrect: "✅ Clear and polite.",
        },
        {
          id: "no",
          labelJa: "大丈夫です。",
          labelEn: "I'm fine (no heat).",
          correct: false,
          feedbackWrong:
            "❌ Soft decline works in real life — for this drill choose heating: 「はい、お願いします」.",
        },
        {
          id: "wrong",
          labelJa: "冷やしてください。",
          labelEn: "Please chill it.",
          correct: false,
          feedbackWrong:
            "❌ They're offering heat, not a fridge.\n\nBetter: 「はい、お願いします」.",
        },
      ],
    },
    {
      id: "outro",
      kind: "outro",
      promptJa: "スムーズなレジ対応！",
      promptEn: "Smooth register skills!",
    },
  ],
  rewards: {
    xp: 25,
    replayXp: 5,
    skillRewards: { listening: 1, conversation: 1 },
    coins: 10,
    randomEncounter: true,
    relationshipNpcIds: ["sato-clerk"],
  },
  unlocks: {},
};

export const RANDOM_DIRECTIONS_QUEST: QuestDefinition = {
  id: "random-directions",
  title: "Someone Asks the Way",
  japaneseTitle: "道を聞かれます",
  locationId: "train-station",
  chapter: 1,
  description: "A stranger asks for the ticket gates.",
  difficulty: "normal",
  recommendedLevel: 2,
  startingConfidence: 3,
  requiresQuestIds: ["station-master"],
  objectives: [{ id: "gate", label: "Point someone to the 改札" }],
  meetNpcIds: ["yamamoto-station"],
  icon: "🧭",
  steps: [
    {
      id: "intro",
      kind: "intro",
      promptJa: "駅で、通りがかりの人に道を聞かれました。",
      promptEn: "At the station, a passerby asks you for directions.",
      speech: { autoPlay: true, language: "en" },
    },
    {
      id: "ask",
      kind: "dialogue",
      promptJa: "すみません、改札はどこですか？",
      promptReading: "すみません かいさつ は どこ です か",
      promptEn: "Excuse me — where are the ticket gates?",
      helpHint: "改札 = ticket gates.",
      vocabHint: "改札",
      speech: { autoPlay: true },
      choices: [
        {
          id: "good",
          labelJa: "まっすぐ行くと、あそこにあります。",
          labelEn: "Go straight — they're over there.",
          correct: true,
          feedbackCorrect: "✅ Helpful and natural.",
        },
        {
          id: "ok",
          labelJa: "改札はあちらです。",
          labelEn: "The gates are that way.",
          correct: false,
          feedbackWrong:
            "❌ Also fine in real life — for this drill prefer the fuller 「まっすぐ行くと…」.",
        },
        {
          id: "wrong",
          labelJa: "トイレはあちらです。",
          labelEn: "The restroom is that way.",
          correct: false,
          feedbackWrong:
            "❌ They asked for 改札, not トイレ.\n\nTry 「改札はあちらです」.",
        },
      ],
    },
    {
      id: "thanks",
      kind: "dialogue",
      promptJa: "ありがとうございます！",
      promptEn: "Thank you!",
      speech: { autoPlay: true },
    },
    {
      id: "outro",
      kind: "outro",
      promptJa: "小さな親切、クリア。",
      promptEn: "A small kindness — clear.",
    },
  ],
  rewards: {
    xp: 30,
    replayXp: 5,
    skillRewards: { conversation: 1, vocabulary: 1 },
    coins: 10,
    randomEncounter: true,
  },
  unlocks: {},
};

export const RANDOM_ENCOUNTER_QUESTS: readonly QuestDefinition[] = [
  RANDOM_BAG_ASK_QUEST,
  RANDOM_HEAT_ASK_QUEST,
  RANDOM_DIRECTIONS_QUEST,
];
