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
          labelJa: "転入届を出したいんですが。",
          labelEn: "I'd like to submit a moving-in notification.",
          correct: true,
          feedbackCorrect:
            "✅ Natural response\n\n「〜たいんですが」is a soft, polite way to state what you want at a service counter.",
        },
        {
          id: "b",
          labelJa: "転入届を食べたいです。",
          labelEn: "I want to eat a moving-in form.",
          correct: false,
          feedbackWrong:
            "❌ That would sound unnatural here.\n\nBetter: 「転入届を出したいんですが。」\n\n「届を出す」means to submit/file a notification or form.",
        },
        {
          id: "c",
          labelJa: "転入届が走っています。",
          labelEn: "The moving-in form is running.",
          correct: false,
          feedbackWrong:
            "❌ Unnatural.\n\nBetter: 「転入届を出したいんですが。」\n\nYou need a request, not a weird description.",
        },
        {
          id: "d",
          labelJa: "すみません、トイレはどこですか。",
          labelEn: "Excuse me, where is the restroom?",
          correct: false,
          feedbackWrong:
            "❌ Polite, but off-topic.\n\nBetter: 「転入届を出したいんですが。」",
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
          labelJa: "来週引っ越します。",
          labelEn: "I will move next week.",
          correct: false,
          feedbackWrong:
            "❌ That is future tense.\n\nThey asked when you already moved. Try 「先週の月曜日です。」",
        },
        {
          id: "c",
          labelJa: "引っ越しが好きです。",
          labelEn: "I like moving.",
          correct: false,
          feedbackWrong:
            "❌ Off-topic.\n\nAnswer with a time: 「先週の月曜日です。」",
        },
        {
          id: "d",
          labelJa: "いつでもいいです。",
          labelEn: "Anytime is fine.",
          correct: false,
          feedbackWrong:
            "❌ That answers a scheduling question, not “when did you move?”",
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
          labelJa: "はい、パスポートを持っています。",
          labelEn: "Yes, I have my passport.",
          correct: true,
          feedbackCorrect:
            "✅ Good.\n\n「本人確認書類」= documents that prove who you are (passport, residence card, etc.).",
        },
        {
          id: "b",
          labelJa: "はい、お弁当を持っています。",
          labelEn: "Yes, I have a bento.",
          correct: false,
          feedbackWrong:
            "❌ 「本人確認書類」are ID documents, not lunch.\n\nBetter: 「はい、パスポートを持っています。」",
        },
        {
          id: "c",
          labelJa: "本人確認書類は飲み物です。",
          labelEn: "ID documents are drinks.",
          correct: false,
          feedbackWrong:
            "❌ Nonsense.\n\n「本人確認書類」= identification papers.",
        },
        {
          id: "d",
          labelJa: "いいえ、名前は忘れました。",
          labelEn: "No, I forgot my name.",
          correct: false,
          feedbackWrong:
            "❌ Funny, but not useful here. Offer an ID if you have one.",
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
        { id: "phone", labelJa: "電話番号", meaningEn: "Phone number" },
      ],
      choices: [
        {
          id: "name",
          labelJa: "氏名",
          correct: false,
          feedbackWrong: "❌ 氏名 = full name.\n\nDate of birth is 「生年月日」.",
        },
        {
          id: "address",
          labelJa: "住所",
          correct: false,
          feedbackWrong: "❌ 住所 = address.\n\nDate of birth is 「生年月日」.",
        },
        {
          id: "dob",
          labelJa: "生年月日",
          correct: true,
          feedbackCorrect:
            "✅ 「生年月日」= date of birth (year / month / day of birth).",
        },
        {
          id: "phone",
          labelJa: "電話番号",
          correct: false,
          feedbackWrong:
            "❌ 電話番号 = phone number.\n\nDate of birth is 「生年月日」.",
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
          labelJa: "この欄に書くように言っています。",
          labelEn: "They're asking me to write in this field.",
          correct: true,
          feedbackCorrect:
            "✅ 「ご記入ください」is a polite request to fill something in.",
        },
        {
          id: "b",
          labelJa: "ここに座るように言っています。",
          labelEn: "They're telling me to sit here.",
          correct: false,
          feedbackWrong:
            "❌ 「ご記入」is about writing/filling in, not sitting.",
        },
        {
          id: "c",
          labelJa: "お金を払うように言っています。",
          labelEn: "They're telling me to pay.",
          correct: false,
          feedbackWrong: "❌ Payment would use 「お支払いください」etc.",
        },
        {
          id: "d",
          labelJa: "帰るように言っています。",
          labelEn: "They're telling me to go home.",
          correct: false,
          feedbackWrong: "❌ Not yet — they want the form filled in.",
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
          labelJa: "すぐに帰れと言っている。",
          labelEn: "They're telling me to leave right away.",
          correct: false,
          feedbackWrong: "❌ They're asking you to double-check the form.",
        },
        {
          id: "c",
          labelJa: "印鑑は不要だと言っている。",
          labelEn: "They're saying a seal is unnecessary.",
          correct: false,
          feedbackWrong: "❌ The line is about checking for missing entries.",
        },
        {
          id: "d",
          labelJa: "料金を払ってほしい。",
          labelEn: "They want me to pay a fee.",
          correct: false,
          feedbackWrong: "❌ No fee mentioned — check for blank fields.",
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
          labelJa: "はい、持っています。こちらです。",
          labelEn: "Yes, I have it. Here it is.",
          correct: true,
          feedbackCorrect:
            "✅ Natural and cooperative.\n\n「こちらです」works when handing something over.",
        },
        {
          id: "b",
          labelJa: "マイナンバーカードを食べました。",
          labelEn: "I ate my My Number card.",
          correct: false,
          feedbackWrong:
            "❌ Please don’t.\n\nBetter: 「はい、持っています。こちらです。」",
        },
        {
          id: "c",
          labelJa: "カードは走ります。",
          labelEn: "Cards run.",
          correct: false,
          feedbackWrong: "❌ Unnatural. Offer the card or say you don’t have it.",
        },
        {
          id: "d",
          labelJa: "いいえ、犬です。",
          labelEn: "No, I’m a dog.",
          correct: false,
          feedbackWrong: "❌ Wrong register and wrong answer.",
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
          labelJa: "丁寧に、もう一度サインしてほしいと言っている。",
          labelEn: "Politely asking me to sign again.",
          correct: true,
          feedbackCorrect:
            "✅ 「恐れ入りますが」softens a request — common N2-level service Japanese.\n\n「ご署名」= signature.",
        },
        {
          id: "b",
          labelJa: "怒っているので帰れと言っている。",
          labelEn: "They're angry and telling me to leave.",
          correct: false,
          feedbackWrong:
            "❌ 「恐れ入りますが」is apologetic/polite, not angry.",
        },
        {
          id: "c",
          labelJa: "料金が上がったと知らせている。",
          labelEn: "They're saying the fee went up.",
          correct: false,
          feedbackWrong: "❌ They're asking for another signature.",
        },
        {
          id: "d",
          labelJa: "住所を変更できないと言っている。",
          labelEn: "They're saying the address can't be changed.",
          correct: false,
          feedbackWrong: "❌ The key ask is 「ご署名」— a signature.",
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
          labelJa: "土日も24時間受付している。",
          labelEn: "Open 24 hours on weekends too.",
          correct: false,
          feedbackWrong:
            "❌ The notice says weekends/holidays are closed.",
        },
        {
          id: "c",
          labelJa: "夜間のみ受付している。",
          labelEn: "Only open at night.",
          correct: false,
          feedbackWrong: "❌ Hours are daytime weekdays, not nights.",
        },
        {
          id: "d",
          labelJa: "受付は完全に終了した。",
          labelEn: "Reception has completely ended.",
          correct: false,
          feedbackWrong: "❌ It lists regular weekday hours — still open then.",
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
