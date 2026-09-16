import type { QuestDefinition } from "../../types";

/**
 * Chapter 2 · Clinic
 * クリニックを受診 — Visit the Clinic
 *
 * Correct answer positions (0-based): 1, 0, 2, 1, 0
 */
export const CLINIC_VISIT_QUEST: QuestDefinition = {
  id: "clinic-visit",
  title: "Visit the Clinic",
  japaneseTitle: "クリニックを受診",
  locationId: "clinic",
  chapter: 2,
  description:
    "You woke up feverish with a sore throat. Check in at the neighborhood clinic, describe your symptoms, and understand the doctor’s instructions.",
  difficulty: "normal",
  recommendedLevel: 4,
  startingConfidence: 5,
  requiresQuestIds: ["first-week-challenge"],
  icon: "🏥",
  meetNpcIds: ["mori-clinic", "doctor-nakamura"],
  objectives: [
    { id: "check-in", label: "Ask to be seen" },
    { id: "insurance", label: "Present insurance or My Number Card" },
    { id: "symptoms", label: "Describe symptoms" },
    { id: "since-when", label: "Say when it started" },
    { id: "instructions", label: "Understand rest and medicine instructions" },
  ],
  steps: [
    {
      id: "intro",
      kind: "intro",
      promptJa: "朝から熱っぽくて、のども痛みます。近所のクリニックに来ました。",
      promptEn:
        "You’ve felt feverish since this morning, and your throat hurts.\n\nYou arrive at the neighborhood clinic. Time to get seen — in Japanese.",
      costsConfidence: false,
    },
    {
      id: "reception-purpose",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "mori-clinic",
      promptJa: "今日はどうされましたか。",
      promptReading: "きょう は どう されました か。",
      promptEn: "Mori at reception greets you. How do you ask to be examined?",
      skillHint: "conversation",
      vocabHint: "受診",
      helpHint: "受診する = to see a doctor / receive a medical exam.",
      choices: [
        {
          id: "a",
          labelJa: "住民票の写しをいただきたいんですが。",
          labelEn: "I’d like a copy of my residence record.",
          correct: false,
          feedbackWrong: "❌ City Hall language — this is a clinic.",
        },
        {
          id: "b",
          labelJa: "今日、受診したいんですが。",
          labelEn: "I’d like to be seen today.",
          correct: true,
          feedbackCorrect:
            "✅ Natural check-in.\n\n「受診したいんですが」softly states why you’re here.",
        },
        {
          id: "c",
          labelJa: "アイスコーヒーを一つお願いします。",
          labelEn: "One iced coffee, please.",
          correct: false,
          feedbackWrong: "❌ Café order — wrong place.",
        },
      ],
    },
    {
      id: "insurance-card",
      kind: "listening",
      objectiveType: "listening",
      npcId: "mori-clinic",
      promptJa: "受付の話を聞いてください。",
      promptEn: "Listen. What is reception asking for?",
      listenText: "保険証かマイナンバーカードをお持ちですか。",
      listenReading: "ほけんしょう か マイナンバーカード を おもち です か。",
      skillHint: "listening",
      vocabHint: "保険証",
      speech: { karaokeMode: "after-answer", autoPlay: true },
      helpHint:
        "保険証 = health insurance card. マイナンバーカード = My Number Card.",
      choices: [
        {
          id: "a",
          labelJa: "保険証かマイナンバーカードを見せてほしい。",
          labelEn: "They want to see your insurance card or My Number Card.",
          correct: true,
          feedbackCorrect:
            "✅ Clinics usually check 保険証 or マイナンバーカード at reception.",
        },
        {
          id: "b",
          labelJa: "ポイントカードを出してほしい。",
          labelEn: "They want your point card.",
          correct: false,
          feedbackWrong: "❌ Not a konbini — they’re asking for medical ID.",
        },
        {
          id: "c",
          labelJa: "乗車券を確認したい。",
          labelEn: "They want to check your train ticket.",
          correct: false,
          feedbackWrong: "❌ Wrong document for a clinic.",
        },
      ],
    },
    {
      id: "symptoms",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "doctor-nakamura",
      promptJa: "どんな症状がありますか。",
      promptReading: "どんな しょうじょう が あります か。",
      promptEn: "Dr. Nakamura asks about your symptoms.",
      skillHint: "conversation",
      vocabHint: "症状",
      helpHint: "症状 = symptoms. 熱 = fever. のどが痛い = sore throat.",
      choices: [
        {
          id: "a",
          labelJa: "今日、受診したいんですが。",
          labelEn: "I’d like to be examined today.",
          correct: false,
          feedbackWrong:
            "❌ You already checked in. Now describe 症状.",
        },
        {
          id: "b",
          labelJa: "おすすめは何ですか。",
          labelEn: "What do you recommend?",
          correct: false,
          feedbackWrong: "❌ Café language. List your symptoms.",
        },
        {
          id: "c",
          labelJa: "熱があって、のどが痛いです。",
          labelEn: "I have a fever and a sore throat.",
          correct: true,
          feedbackCorrect:
            "✅ Clear symptom report.\n\n「熱があって、のどが痛い」covers both issues.",
        },
      ],
    },
    {
      id: "since-when",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "doctor-nakamura",
      promptJa: "いつからですか。",
      promptReading: "いつ から です か。",
      promptEn: "Since when?",
      skillHint: "conversation",
      vocabHint: "昨日の夕方から",
      helpHint: "夕方 = evening. 「〜から」marks when it started.",
      choices: [
        {
          id: "a",
          labelJa: "来週の月曜日からです。",
          labelEn: "Starting next Monday.",
          correct: false,
          feedbackWrong: "❌ Future time — symptoms already started.",
        },
        {
          id: "b",
          labelJa: "昨日の夕方からです。",
          labelEn: "Since yesterday evening.",
          correct: true,
          feedbackCorrect:
            "✅ Exact timeline.\n\nDoctors need 「いつから」to judge urgency.",
        },
        {
          id: "c",
          labelJa: "少々お待ちください。",
          labelEn: "Please wait a moment.",
          correct: false,
          feedbackWrong: "❌ Staff phrase — answer when it started.",
        },
      ],
    },
    {
      id: "doctor-instructions",
      kind: "listening",
      objectiveType: "listening",
      npcId: "doctor-nakamura",
      promptJa: "先生の指示を聞いてください。何をするように言われましたか。",
      promptEn: "Listen carefully. What were you instructed to do?",
      listenText:
        "薬を三日分出します。今日はできるだけ安静にして、水分をよく取ってください。",
      listenReading:
        "くすり を みっかぶん だします。きょう は できるだけ あんせい にして、すいぶん を よく とって ください。",
      skillHint: "listening",
      vocabHint: "安静",
      speech: { karaokeMode: "after-answer", autoPlay: true },
      helpHint:
        "三日分 = three days’ worth. 安静 = rest. 水分を取る = drink fluids.",
      choices: [
        {
          id: "a",
          labelJa:
            "三日分の薬をもらい、安静にして水分をよく取る。",
          labelEn:
            "Get three days of medicine, rest, and drink plenty of fluids.",
          correct: true,
          feedbackCorrect:
            "✅ All three: 薬・三日分, 安静, 水分を取る.",
        },
        {
          id: "b",
          labelJa: "今日からすぐに運動して汗を出す。",
          labelEn: "Exercise hard today to sweat it out.",
          correct: false,
          feedbackWrong: "❌ The doctor said 安静 — rest, not hard exercise.",
        },
        {
          id: "c",
          labelJa: "薬は一週間分で、水分は控える。",
          labelEn: "One week of medicine, and avoid fluids.",
          correct: false,
          feedbackWrong:
            "❌ It was 三日分, and you should take fluids — not avoid them.",
        },
      ],
    },
    {
      id: "outro",
      kind: "outro",
      promptJa:
        "受診おつかれさま。症状の伝え方と指示の聞き取りができた。次は電話での問い合わせだ。",
      promptEn:
        "Clinic visit clear. You can check in, describe symptoms, and catch medical instructions.\n\nNext: a phone inquiry — no visual context to lean on.",
      costsConfidence: false,
    },
  ],
  rewards: {
    xp: 180,
    replayXp: 20,
    skillRewards: {
      conversation: 5,
      listening: 5,
      vocabulary: 2,
      politeness: 2,
    },
    replaySkillRewards: {
      conversation: 1,
      listening: 1,
    },
    unlockLocationIds: ["phone-center"],
    unlockQuestIds: ["phone-call"],
    nextQuestTeaser: {
      id: "phone-call",
      title: "Handle a Phone Inquiry",
      japaneseTitle: "電話で問い合わせ",
    },
  },
  unlocks: {
    locationIds: ["phone-center"],
    questIds: ["phone-call"],
  },
};
