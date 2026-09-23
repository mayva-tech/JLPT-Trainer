import type { ConversationDefinition, QuestDefinition } from "../../types";

/**
 * Chapter 4 · Morning at the Office
 * 朝の職場 — workplace greetings, お疲れ様, timing checks, leaving phrases.
 *
 * Contrast: casual おつかれ / じゃ帰ります are awkward (not always incorrect).
 * Branch: coworker (Mika) vs senpai (Sato) register on the hallway beat.
 */
export const MORNING_OFFICE_CONVERSATION: ConversationDefinition = {
  startNodeId: "arrive",
  resultSummaryTitle: "MORNING BRIEF",
  nodes: [
    {
      id: "arrive",
      japanese: "朝のオフィスです。まず挨拶から始めましょう。",
      reading: "あさ の オフィス です まず あいさつ から はじめましょう",
      english:
        "Morning at the office.\n\nGreetings change by time of day and who you're talking to — おはよう vs お疲れ様 vs leaving phrases.",
      nextNodeId: "morning-greet",
      speech: { autoPlay: true, language: "en" },
    },
    {
      id: "morning-greet",
      npcId: "mika-coworker",
      japanese: "あ、おはよう。今日もよろしくね。",
      reading: "あ おはよう きょう も よろしく ね",
      english: "Oh — morning. Looking forward to working with you today.",
      objectiveType: "social-choice",
      socialContext: "coworker",
      register: "polite",
      helpHint:
        "Morning → おはようございます. 「お疲れ」is for later in the day, not a morning opener.",
      vocabHint: "おはようございます",
      speech: { autoPlay: true },
      choices: [
        {
          id: "greet-ex",
          japanese: "おはようございます。こちらこそよろしくお願いします。",
          reading: "おはよう ございます こちら こそ よろしく おねがい します",
          english: "Good morning. Likewise — looking forward to it.",
          quality: "excellent",
          nextNodeId: "hallway",
          relationshipDelta: 2,
          feedback:
            "🌟 Very natural\n\n「おはようございます」+ こちらこそ — solid morning coworker register.",
          vocabHint: "おはようございます",
        },
        {
          id: "greet-nat",
          japanese: "おはようございます。",
          reading: "おはよう ございます",
          english: "Good morning.",
          quality: "natural",
          nextNodeId: "hallway",
          relationshipDelta: 1,
          feedback:
            "✓ Natural\n\nClear morning greeting. Safe with anyone in the office.",
        },
        {
          id: "greet-ok",
          japanese: "おはよう。",
          reading: "おはよう",
          english: "Morning.",
          quality: "acceptable",
          nextNodeId: "hallway",
          relationshipDelta: 1,
          feedback:
            "✓ Understandable\n\nFine with a close coworker like Mika — still a bit casual for senpai/manager.",
        },
        {
          id: "greet-awk",
          japanese: "お疲れ！",
          reading: "おつかれ",
          english: "Thanks for your hard work!",
          quality: "awkward",
          nextNodeId: "hallway",
          relationshipDelta: 0,
          feedback:
            "△ Awkward timing\n\n「おつかれ」is not a morning opener — save お疲れ様です for later in the day.",
          vocabHint: "お疲れ様です",
        },
      ],
    },
    {
      id: "hallway",
      japanese:
        "午前の途中。廊下で人とすれ違います。相手で言葉を変えましょう。",
      reading:
        "ごぜん の とちゅう ろうか で ひと と すれちがい ます あいて で ことば を かえましょう",
      english:
        "Mid-morning in the hallway. Who you bump into changes how お疲れ様です lands.",
      nextNodeId: "hallway-router",
      speech: { autoPlay: true, language: "en" },
    },
    {
      id: "hallway-router",
      japanese: "",
      nextNodeId: "otsukare-mika",
      relationshipBranches: [
        { npcId: "sato-senpai", minLevel: 1, nextNodeId: "otsukare-senpai" },
      ],
    },
    {
      id: "otsukare-mika",
      npcId: "mika-coworker",
      japanese: "資料、さっき出したよ。ちょっと一息。",
      reading: "しりょう さっき だした よ ちょっと ひといき",
      english: "Just submitted the docs. Taking a short break.",
      objectiveType: "social-choice",
      socialContext: "coworker",
      register: "polite",
      helpHint:
        "After someone finishes a task: お疲れ様です. Bare おつかれ is casual — awkward if you're not close.",
      vocabHint: "お疲れ様です",
      speech: { autoPlay: true },
      choices: [
        {
          id: "mika-ex",
          japanese: "お疲れ様です。助かります。",
          reading: "おつかれさま です たすかります",
          english: "Thanks for your hard work — that helps a lot.",
          quality: "excellent",
          nextNodeId: "need-ask",
          relationshipDelta: 2,
          feedback:
            "🌟 Very natural\n\n「お疲れ様です」acknowledges her effort without going too casual.",
          vocabHint: "お疲れ様です",
        },
        {
          id: "mika-nat",
          japanese: "お疲れ様です。",
          reading: "おつかれさま です",
          english: "Thanks for your hard work.",
          quality: "natural",
          nextNodeId: "need-ask",
          relationshipDelta: 1,
          feedback: "✓ Natural\n\nStandard workplace acknowledgment.",
        },
        {
          id: "mika-awk",
          japanese: "おつかれ〜",
          reading: "おつかれ",
          english: "Nice work~",
          quality: "awkward",
          nextNodeId: "need-ask",
          relationshipDelta: 0,
          feedback:
            "△ Awkward register\n\n「おつかれ」is buddy-casual. Not wrong with a close peer, but sounds sloppy at the office.",
        },
        {
          id: "mika-wrong",
          japanese: "おはようございます。",
          reading: "おはよう ございます",
          english: "Good morning.",
          quality: "incorrect",
          nextNodeId: "need-ask",
          feedback:
            "✕ Wrong phrase\n\nIt's mid-morning and she just finished work — use お疲れ様です, not another おはよう.",
          communicationDelta: -8,
        },
      ],
    },
    {
      id: "otsukare-senpai",
      npcId: "sato-senpai",
      japanese: "資料、さっき共有したよ。確認しておいて。",
      reading: "しりょう さっき きょうゆう した よ かくにん して おいて",
      english: "I just shared the docs. Please check them.",
      objectiveType: "social-choice",
      socialContext: "senpai",
      register: "business",
      helpHint:
        "With senpai, keep です/ます. Casual おつかれ drops too much respect.",
      vocabHint: "お疲れ様です",
      speech: { autoPlay: true },
      choices: [
        {
          id: "senpai-ex",
          japanese: "お疲れ様です。確認します。ありがとうございます。",
          reading:
            "おつかれさま です かくにん します ありがとう ございます",
          english: "Thank you for your hard work. I'll check — thank you.",
          quality: "excellent",
          nextNodeId: "need-ask",
          relationshipDelta: 2,
          feedback:
            "🌟 Very natural\n\n「お疲れ様です」+ clear next action — good senpai register.",
          vocabHint: "お疲れ様です",
        },
        {
          id: "senpai-nat",
          japanese: "お疲れ様です。確認します。",
          reading: "おつかれさま です かくにん します",
          english: "Thanks for your hard work. I'll check.",
          quality: "natural",
          nextNodeId: "need-ask",
          relationshipDelta: 1,
          feedback: "✓ Natural\n\nPolite and clear with senpai.",
        },
        {
          id: "senpai-awk",
          japanese: "おつかれ！見るね。",
          reading: "おつかれ みる ね",
          english: "Nice work! I'll look.",
          quality: "awkward",
          nextNodeId: "need-ask",
          relationshipDelta: 0,
          feedback:
            "△ Awkward with senpai\n\nDropped です and used buddy 「おつかれ」— too casual upward.",
        },
        {
          id: "senpai-wrong",
          japanese: "了解。あとで。",
          reading: "りょうかい あとで",
          english: "Got it. Later.",
          quality: "incorrect",
          nextNodeId: "need-ask",
          confidenceDelta: -1,
          relationshipDelta: -1,
          feedback:
            "✕ Too blunt\n\nMissing お疲れ様です and sounding dismissive toward senpai.",
          communicationDelta: -8,
        },
      ],
    },
    {
      id: "need-ask",
      japanese:
        "佐藤先輩に短い確認が必要です。声をかける前に、時間を伺いましょう。",
      reading:
        "さとうせんぱい に みじかい かくにん が ひつよう です こえ を かける まえ に じかん を うかがいましょう",
      english:
        "You need a quick check with Sato-senpai. Ask if they have a moment first.",
      nextNodeId: "ask-time",
      speech: { autoPlay: true, language: "en" },
    },
    {
      id: "ask-time",
      npcId: "sato-senpai",
      japanese: "ん？どうした。",
      reading: "ん どうした",
      english: "Hm? What's up?",
      objectiveType: "social-choice",
      socialContext: "senpai",
      register: "business",
      helpHint:
        "「今お時間よろしいでしょうか」softly checks availability before the ask.",
      vocabHint: "今お時間よろしいでしょうか",
      speech: { autoPlay: true },
      choices: [
        {
          id: "time-ex",
          japanese: "すみません、今お時間よろしいでしょうか。",
          reading: "すみません いま おじかん よろしい でしょう か",
          english: "Excuse me — do you have a moment right now?",
          quality: "excellent",
          nextNodeId: "ask-ok",
          relationshipDelta: 2,
          feedback:
            "🌟 Very natural\n\n「今お時間よろしいでしょうか」is classic business timing keigo.",
          vocabHint: "今お時間よろしいでしょうか",
        },
        {
          id: "time-nat",
          japanese: "少しお時間いただけますか。",
          reading: "すこし おじかん いただけます か",
          english: "Could I have a little of your time?",
          quality: "natural",
          nextNodeId: "ask-ok",
          relationshipDelta: 1,
          feedback: "✓ Natural\n\nSoft and polite — good for senpai.",
        },
        {
          id: "time-ok",
          japanese: "今いいですか。",
          reading: "いま いい です か",
          english: "Is now okay?",
          quality: "acceptable",
          nextNodeId: "ask-ok",
          feedback:
            "✓ Understandable\n\nWorks, but 「お時間よろしいでしょうか」sounds more polished upward.",
        },
        {
          id: "time-awk",
          japanese: "ちょっといい？",
          reading: "ちょっと いい",
          english: "Got a sec?",
          quality: "awkward",
          nextNodeId: "ask-ok",
          relationshipDelta: 0,
          feedback:
            "△ Awkward upward\n\nFine with a close peer; too casual for senpai.",
        },
      ],
    },
    {
      id: "ask-ok",
      npcId: "sato-senpai",
      japanese:
        "いいよ。なに？あ、その件なら問題ない。印刷室に置いてあるよ。",
      reading:
        "いい よ なに あ その けん なら もんだい ない いんさつしつ に おいて ある よ",
      english:
        "Sure. What is it? Ah — that one's fine. It's in the print room.",
      nextNodeId: "return-desk",
      speech: { autoPlay: true },
    },
    {
      id: "return-desk",
      npcId: "mika-coworker",
      japanese: "あ、戻った？どこ行ってたの。",
      reading: "あ もどった どこ いってた の",
      english: "Oh — you're back? Where'd you go?",
      objectiveType: "social-choice",
      socialContext: "coworker",
      register: "polite",
      helpHint:
        "Returning to your seat/team: 「戻りました」is clear office Japanese. 「ただいま」is home language.",
      vocabHint: "戻りました",
      speech: { autoPlay: true },
      choices: [
        {
          id: "ret-ex",
          japanese: "戻りました。印刷室に行っていました。",
          reading: "もどりました いんさつしつ に いって いました",
          english: "I'm back. I was at the print room.",
          quality: "excellent",
          nextNodeId: "end-of-day",
          relationshipDelta: 1,
          feedback:
            "🌟 Very natural\n\n「戻りました」+ brief reason — clean office update.",
          vocabHint: "戻りました",
        },
        {
          id: "ret-nat",
          japanese: "戻りました。",
          reading: "もどりました",
          english: "I'm back.",
          quality: "natural",
          nextNodeId: "end-of-day",
          relationshipDelta: 1,
          feedback: "✓ Natural\n\nShort and clear.",
        },
        {
          id: "ret-awk",
          japanese: "ただいま。",
          reading: "ただいま",
          english: "I'm home.",
          quality: "awkward",
          nextNodeId: "end-of-day",
          feedback:
            "△ Awkward here\n\n「ただいま」is for coming home — at work, prefer 「戻りました」.",
        },
        {
          id: "ret-cas",
          japanese: "戻ったよ。",
          reading: "もどった よ",
          english: "I'm back.",
          quality: "acceptable",
          nextNodeId: "end-of-day",
          feedback:
            "✓ Understandable\n\nCasual with Mika; use 戻りました with senpai/manager.",
        },
      ],
    },
    {
      id: "end-of-day",
      japanese:
        "夕方。先に帰ります。上司や先輩の前では、帰る言い方が大事です。",
      reading:
        "ゆうがた さき に かえります じょうし や せんぱい の まえ で は かえる いいかた が だいじ です",
      english:
        "Evening — you're leaving first. How you exit matters in front of coworkers and senpai.",
      nextNodeId: "leaving",
      speech: { autoPlay: true, language: "en" },
    },
    {
      id: "leaving",
      npcId: "sato-senpai",
      japanese: "もう帰るの？おつかれ。",
      reading: "もう かえる の おつかれ",
      english: "Heading out already? Good work today.",
      objectiveType: "social-choice",
      socialContext: "senpai",
      register: "business",
      helpHint:
        "Leaving before others: 「お先に失礼します」. 「じゃ帰ります」is abrupt buddy-talk.",
      vocabHint: "お先に失礼します",
      speech: { autoPlay: true },
      choices: [
        {
          id: "leave-ex",
          japanese: "お先に失礼します。お疲れ様でした。",
          reading: "おさき に しつれい します おつかれさま でした",
          english: "Excuse me for leaving first. Thank you for your hard work.",
          quality: "excellent",
          nextNodeId: "success",
          relationshipDelta: 2,
          feedback:
            "🌟 Very natural\n\n「お先に失礼します」+ お疲れ様でした — textbook end-of-day exit.",
          vocabHint: "お先に失礼します",
        },
        {
          id: "leave-nat",
          japanese: "お先に失礼します。",
          reading: "おさき に しつれい します",
          english: "Excuse me for leaving first.",
          quality: "natural",
          nextNodeId: "success",
          relationshipDelta: 1,
          feedback: "✓ Natural\n\nThe core leaving phrase — clear and polite.",
        },
        {
          id: "leave-awk",
          japanese: "じゃ、帰ります。",
          reading: "じゃ かえります",
          english: "Okay, I'm going home.",
          quality: "awkward",
          nextNodeId: "success",
          relationshipDelta: 0,
          feedback:
            "△ Awkward at the office\n\n「じゃ帰ります」isn't always wrong with close friends — but it skips お先に失礼します and sounds blunt upward.",
        },
        {
          id: "leave-cas",
          japanese: "おつかれ！先帰るね。",
          reading: "おつかれ さき かえる ね",
          english: "Later! Heading out first.",
          quality: "awkward",
          nextNodeId: "success",
          feedback:
            "△ Too casual upward\n\nBuddy 「おつかれ」+ no 失礼します — fine after-hours with peers, weak with senpai.",
        },
      ],
    },
    {
      id: "success",
      japanese: "朝から帰りまで、職場の基本フレーズを使えました。",
      reading:
        "あさ から かえり まで しょくば の きほん フレーズ を つかえました",
      english:
        "Morning through leaving — you practiced core office phrases. Next: report clearly to your boss.",
      endState: "success",
      speech: { autoPlay: true },
    },
  ],
};

export const MORNING_OFFICE_QUEST: QuestDefinition = {
  id: "morning-office",
  title: "Morning at the Office",
  japaneseTitle: "朝の職場",
  japaneseTitleReading: "あさ の しょくば",
  locationId: "office",
  chapter: 4,
  description:
    "Unlock after Chapter 3. Practice おはようございます, お疲れ様です, 今お時間よろしいでしょうか, 戻りました, and お先に失礼します — and feel why casual おつかれ / じゃ帰ります can sound awkward at work.",
  difficulty: "normal",
  recommendedLevel: 7,
  startingConfidence: 5,
  requiresQuestIds: ["relationships-challenge"],
  objectives: [
    { id: "morning", label: "Morning greeting" },
    { id: "otsukare", label: "Use お疲れ様です appropriately" },
    { id: "timing", label: "Ask if someone has a moment" },
    { id: "return", label: "Announce your return" },
    { id: "leave", label: "Leave with お先に失礼します" },
  ],
  steps: [],
  conversation: MORNING_OFFICE_CONVERSATION,
  rewards: {
    xp: 180,
    replayXp: 20,
    skillRewards: {
      listening: 2,
      conversation: 4,
      politeness: 4,
    },
    replaySkillRewards: {
      conversation: 1,
      politeness: 1,
    },
    coins: 45,
    unlockQuestIds: ["reporting-to-boss"],
    nextQuestTeaser: {
      id: "reporting-to-boss",
      title: "Reporting to Your Boss",
      japaneseTitle: "上司に報告",
    },
    relationshipNpcIds: ["mika-coworker", "sato-senpai"],
  },
  unlocks: {
    questIds: ["reporting-to-boss"],
  },
  meetNpcIds: ["mika-coworker", "sato-senpai"],
  icon: "🌅",
};
