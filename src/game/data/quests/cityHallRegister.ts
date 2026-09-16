import type { QuestDefinition } from "../../types";

/**
 * Chapter 1 · City Hall Quest 1
 * 転入届を出せ！ — Register Your New Address
 *
 * Conversation-first vertical slice. Steps are data; the runner stays generic.
 */
export const CITY_HALL_REGISTER_QUEST: QuestDefinition = {
  id: "city-hall-register",
  title: "Register Your New Address",
  japaneseTitle: "転入届を出せ！",
  locationId: "city-hall",
  chapter: 1,
  description:
    "You have just moved into Kotoba Town. Complete your address registration at City Hall without losing all your Confidence.",
  difficulty: "normal",
  recommendedLevel: 1,
  startingConfidence: 5,
  objectives: [
    { id: "state-purpose", label: "Explain why you came" },
    { id: "answer-move-date", label: "Say when you moved" },
    { id: "id-documents", label: "Handle ID vocabulary" },
    { id: "fill-form", label: "Read a registration form" },
    { id: "follow-instructions", label: "Follow polite instructions" },
    { id: "finish", label: "Complete the registration" },
  ],
  steps: [
    {
      id: "intro",
      kind: "intro",
      promptJa: "ことば町の市役所に着きました。",
      promptEn:
        "You arrive at Kotoba Town City Hall.\n\nYour mission: Complete your address registration without losing all your Confidence.",
      costsConfidence: false,
    },
    {
      id: "purpose",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "tanaka-city-hall",
      promptJa: "本日はどのようなご用件でしょうか。",
      promptReading: "ほんじつ は どの ような ごようけん でしょう か。",
      promptEn: "What business do you have today?",
      skillHint: "conversation",
      choices: [
        {
          id: "a",
          labelJa: "転出届を出したいんですが。",
          labelEn: "I'd like to submit a moving-out notification.",
          correct: false,
          feedbackWrong:
            "❌ Close, but 「転出届」is for leaving an address.\n\nYou just moved in — use 「転入届を出したいんですが。」",
        },
        {
          id: "b",
          labelJa: "転入届を出したいんですが。",
          labelEn: "I'd like to submit a moving-in notification.",
          correct: true,
          feedbackCorrect:
            "✅ Natural response\n\n「〜たいんですが」is a soft, polite way to state what you want at a service counter.",
        },
        {
          id: "c",
          labelJa: "印鑑証明をお願いします。",
          labelEn: "I'd like a seal registration certificate.",
          correct: false,
          feedbackWrong:
            "❌ That is another City Hall service, not today’s quest.\n\nBetter: 「転入届を出したいんですが。」",
        },
      ],
    },
    {
      id: "move-date",
      kind: "dialogue",
      objectiveType: "multiple-choice",
      npcId: "tanaka-city-hall",
      promptJa: "いつこちらに引っ越してきましたか。",
      promptReading: "いつ こちら に ひっこして きました か。",
      promptEn: "When did you move here?",
      skillHint: "listening",
      choices: [
        {
          id: "a",
          labelJa: "先週の月曜日です。",
          labelEn: "Last Monday.",
          correct: true,
          feedbackCorrect:
            "✅ Clear date answer.\n\n「先週の〜」= last week’s … — natural for a recent move.",
        },
        {
          id: "b",
          labelJa: "来週の月曜日です。",
          labelEn: "Next Monday.",
          correct: false,
          feedbackWrong:
            "❌ 「来週」is next week (future).\n\nThey asked when you already moved: 「先週の月曜日です。」",
        },
        {
          id: "c",
          labelJa: "来月引っ越します。",
          labelEn: "I will move next month.",
          correct: false,
          feedbackWrong:
            "❌ Future plans don’t answer “when did you move?”\n\nTry 「先週の月曜日です。」",
        },
      ],
    },
    {
      id: "id-docs",
      kind: "dialogue",
      objectiveType: "vocabulary",
      npcId: "tanaka-city-hall",
      promptJa: "本人確認書類をお持ちですか。",
      promptReading: "ほんにん かくにん しょるい を おもち です か。",
      promptEn: "Do you have identification documents?",
      skillHint: "vocabulary",
      vocabHint: "本人確認書類",
      choices: [
        {
          id: "a",
          labelJa: "はい、ポイントカードを持っています。",
          labelEn: "Yes, I have a point card.",
          correct: false,
          feedbackWrong:
            "❌ A point card is for shops, not ID.\n\nOffer a passport or residence card instead.",
        },
        {
          id: "b",
          labelJa: "はい、クレジットカードを持っています。",
          labelEn: "Yes, I have a credit card.",
          correct: false,
          feedbackWrong:
            "❌ Cards for payment usually aren’t enough as 「本人確認書類」.\n\nBetter: passport or residence card.",
        },
        {
          id: "c",
          labelJa: "はい、パスポートを持っています。",
          labelEn: "Yes, I have my passport.",
          correct: true,
          feedbackCorrect:
            "✅ Good.\n\n「本人確認書類」= documents that prove who you are (passport, residence card, etc.).",
        },
      ],
    },
    {
      id: "form-fields",
      kind: "form-label",
      objectiveType: "form-label",
      npcId: "tanaka-city-hall",
      promptJa: "この用紙にご記入ください。",
      promptReading: "この ようし に ごきにゅう ください。",
      promptEn: "Please fill in this form.",
      formAskEn: "Which field means “date of birth”?",
      formCorrectFieldId: "dob",
      skillHint: "reading",
      formFields: [
        { id: "name", labelJa: "氏名", meaningEn: "Full name" },
        { id: "address", labelJa: "住所", meaningEn: "Address" },
        { id: "dob", labelJa: "生年月日", meaningEn: "Date of birth" },
      ],
      choices: [
        {
          id: "name",
          labelJa: "氏名",
          correct: false,
          feedbackWrong: "❌ 氏名 = full name.\n\nDate of birth is 「生年月日」.",
        },
        {
          id: "dob",
          labelJa: "生年月日",
          correct: true,
          feedbackCorrect:
            "✅ 「生年月日」= date of birth (year / month / day of birth).",
        },
        {
          id: "address",
          labelJa: "住所",
          correct: false,
          feedbackWrong: "❌ 住所 = address.\n\nDate of birth is 「生年月日」.",
        },
      ],
    },
    {
      id: "please-fill",
      kind: "dialogue",
      objectiveType: "grammar",
      npcId: "tanaka-city-hall",
      promptJa: "こちらにご記入ください。",
      promptReading: "こちら に ごきにゅう ください。",
      promptEn: "Please fill this in here.",
      skillHint: "politeness",
      choices: [
        {
          id: "a",
          labelJa: "ここに座るように言っています。",
          labelEn: "They're telling me to sit here.",
          correct: false,
          feedbackWrong:
            "❌ 「ご記入」is about writing/filling in, not sitting.",
        },
        {
          id: "b",
          labelJa: "お金を払うように言っています。",
          labelEn: "They're telling me to pay.",
          correct: false,
          feedbackWrong:
            "❌ Payment would use 「お支払いください」.\n\n「ご記入ください」= please fill this in.",
        },
        {
          id: "c",
          labelJa: "この欄に書くように言っています。",
          labelEn: "They're asking me to write in this field.",
          correct: true,
          feedbackCorrect:
            "✅ 「ご記入ください」is a polite request to fill something in.",
        },
      ],
    },
    {
      id: "grammar-context",
      kind: "dialogue",
      objectiveType: "grammar",
      npcId: "tanaka-city-hall",
      promptJa: "記入漏れがないかご確認ください。",
      promptReading: "きにゅう もれ が ない か ごかくにん ください。",
      promptEn: "Please check that nothing was left unfilled.",
      skillHint: "grammar",
      choices: [
        {
          id: "a",
          labelJa: "書き忘れがないか確認してほしい。",
          labelEn: "They want me to check for anything I forgot to write.",
          correct: true,
          feedbackCorrect:
            "✅ 「記入漏れ」= something left unfilled on a form.\n\n「〜がないか」= whether there isn’t any …",
        },
        {
          id: "b",
          labelJa: "印鑑を押してほしい。",
          labelEn: "They want me to stamp a seal.",
          correct: false,
          feedbackWrong:
            "❌ Nearby City Hall action, but this line is about checking blank fields.",
        },
        {
          id: "c",
          labelJa: "料金を払ってほしい。",
          labelEn: "They want me to pay a fee.",
          correct: false,
          feedbackWrong:
            "❌ No fee mentioned — check for blank fields on the form.",
        },
      ],
    },
    {
      id: "mynumber",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "tanaka-city-hall",
      promptJa: "マイナンバーカードはお持ちですか。",
      promptReading: "マイナンバーカード は おもち です か。",
      promptEn: "Do you have a My Number card?",
      skillHint: "conversation",
      vocabHint: "マイナンバーカード",
      choices: [
        {
          id: "a",
          labelJa: "いいえ、在留カードだけです。",
          labelEn: "No, I only have my residence card.",
          correct: false,
          feedbackWrong:
            "❌ Plausible at City Hall, but this quest assumes you have the card.\n\nTry: 「はい、持っています。こちらです。」",
        },
        {
          id: "b",
          labelJa: "はい、持っています。こちらです。",
          labelEn: "Yes, I have it. Here it is.",
          correct: true,
          feedbackCorrect:
            "✅ Natural and cooperative.\n\n「こちらです」works when handing something over.",
        },
        {
          id: "c",
          labelJa: "はい、パスポートを忘れました。",
          labelEn: "Yes, I forgot my passport.",
          correct: false,
          feedbackWrong:
            "❌ Mixed answer — they asked about the My Number card, not your passport.",
        },
      ],
    },
    {
      id: "n2-phrase",
      kind: "dialogue",
      objectiveType: "vocabulary",
      npcId: "tanaka-city-hall",
      promptJa: "恐れ入りますが、もう一度ご署名をお願いできますでしょうか。",
      promptReading:
        "おそれいります が、もう いちど ごしょめい を おねがい できます でしょう か。",
      promptEn:
        "I’m sorry to trouble you, but could I ask you to sign once more?",
      skillHint: "politeness",
      vocabHint: "恐れ入りますが",
      choices: [
        {
          id: "a",
          labelJa: "住所をもう一度書いてほしいと言っている。",
          labelEn: "They're asking me to write my address again.",
          correct: false,
          feedbackWrong:
            "❌ Close, but the key word is 「ご署名」— a signature, not the address field.",
        },
        {
          id: "b",
          labelJa: "印鑑をもう一度押してほしいと言っている。",
          labelEn: "They're asking me to stamp my seal again.",
          correct: false,
          feedbackWrong:
            "❌ Seal stamping is common at City Hall, but here they want 「ご署名」(signature).",
        },
        {
          id: "c",
          labelJa: "丁寧に、もう一度サインしてほしいと言っている。",
          labelEn: "Politely asking me to sign again.",
          correct: true,
          feedbackCorrect:
            "✅ 「恐れ入りますが」softens a request — common N2-level service Japanese.\n\n「ご署名」= signature.",
        },
      ],
    },
    {
      id: "notice-reading",
      kind: "reading",
      objectiveType: "reading",
      npcId: "tanaka-city-hall",
      promptJa: "掲示をご確認ください。",
      promptEn: "Please check the notice.",
      speech: { karaokeMode: "off", autoPlay: false },
      bodyJa:
        "【お知らせ】転入届の受付時間は平日の午前9時から午後5時までです。土日祝日はお休みです。",
      bodyEn:
        "Notice: Moving-in notifications are accepted on weekdays from 9:00 a.m. to 5:00 p.m. Closed on weekends and national holidays.",
      skillHint: "reading",
      choices: [
        {
          id: "a",
          labelJa: "平日の9時〜17時に受付している。",
          labelEn: "Accepted weekdays 9–17.",
          correct: true,
          feedbackCorrect:
            "✅ You read the hours correctly. 「平日」= weekdays.",
        },
        {
          id: "b",
          labelJa: "土日も同じ時間に受付している。",
          labelEn: "Open the same hours on weekends too.",
          correct: false,
          feedbackWrong:
            "❌ The notice says weekends and holidays are closed.",
        },
        {
          id: "c",
          labelJa: "平日の午後のみ受付している。",
          labelEn: "Accepted weekday afternoons only.",
          correct: false,
          feedbackWrong:
            "❌ Partial — hours start at 9:00 a.m., not only afternoon.",
        },
      ],
    },
    {
      id: "complete",
      kind: "outro",
      npcId: "tanaka-city-hall",
      promptJa: "以上で手続きは完了です。お疲れさまでした。",
      promptReading: "いじょう で てつづき は かんりょう です。おつかれさま でした。",
      promptEn: "That completes the procedure. Thank you for your effort.",
      costsConfidence: false,
    },
  ],
  rewards: {
    xp: 150,
    replayXp: 20,
    skillRewards: {
      vocabulary: 2,
      grammar: 1,
      conversation: 3,
      politeness: 3,
      reading: 1,
    },
    replaySkillRewards: { conversation: 1 },
    unlockLocationIds: ["convenience-store"],
    unlockQuestIds: ["convenience-first-shop"],
    nextQuestTeaser: {
      id: "convenience-first-shop",
      title: "Your First Convenience Store Visit",
      japaneseTitle: "初めての買い物",
    },
  },
  unlocks: {
    locationIds: ["convenience-store"],
    questIds: ["convenience-first-shop"],
  },
  meetNpcIds: ["tanaka-city-hall"],
  icon: "🏯",
};
