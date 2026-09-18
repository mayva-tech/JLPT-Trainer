import type { ConversationDefinition, QuestDefinition } from "../../types";

/**
 * Chapter 4 · Business Phone Call — Conversation Engine V2
 * 電話を受ける — external caller, hold, message taking, delayed recall.
 *
 * Facts locked mid-call: caller / company / person / number / time / message.
 * Recalled after hang-up without replaying the original detail line.
 */
export const BUSINESS_PHONE_CONVERSATION: ConversationDefinition = {
  startNodeId: "incoming",
  presentation: "phone",
  resultSummaryTitle: "BUSINESS CALL REPORT",
  nodes: [
    {
      id: "incoming",
      japanese: "オフィスで外線が鳴っています。出てください。",
      english:
        "An outside line is ringing at the office.\n\nAnswer like a company receptionist — listen carefully; details will matter later.",
      nextNodeId: "answer",
      speech: { autoPlay: true, language: "en" },
    },
    {
      id: "answer",
      japanese: "受話器を取りました。最初の一言は？",
      english: "You pick up. What’s the opening line?",
      objectiveType: "social-choice",
      socialContext: "external-caller",
      register: "business",
      helpHint:
        "Company phone answer: thank them → company name → your name (or でございます).",
      vocabHint: "お電話ありがとうございます",
      speech: { autoPlay: true, language: "en" },
      choices: [
        {
          id: "ans-excellent",
          japanese:
            "お電話ありがとうございます。ことば株式会社のヴィラでございます。",
          reading:
            "おでんわ ありがとう ございます ことば かぶしきがいしゃ の ヴィラ で ございます",
          english:
            "Thank you for calling. This is Villa of Kotoba Corporation.",
          quality: "excellent",
          nextNodeId: "caller-intro",
          feedback:
            "🌟 Very natural\n\nClassic business answer: お電話ありがとうございます + company + name.",
          relationshipDelta: 1,
          vocabHint: "お電話ありがとうございます",
        },
        {
          id: "ans-natural",
          japanese: "はい、ことば株式会社でございます。",
          reading: "はい ことば かぶしきがいしゃ で ございます",
          english: "Yes, Kotoba Corporation.",
          quality: "natural",
          nextNodeId: "caller-intro",
          feedback: "✓ Natural\n\nClear company ID — adding your name would be even better.",
        },
        {
          id: "ans-awkward",
          japanese: "はい、もしもし。",
          reading: "はい もしもし",
          english: "Hello?",
          quality: "awkward",
          nextNodeId: "caller-intro",
          feedback:
            "△ Awkward here\n\n「もしもし」is fine for personal calls — business lines usually name the company.",
          communicationDelta: -3,
        },
        {
          id: "ans-wrong",
          japanese: "だれですか。",
          reading: "だれ です か",
          english: "Who is this?",
          quality: "incorrect",
          nextNodeId: "caller-intro",
          feedback: "✕ Too blunt\n\nNever open a business line with だれですか.",
          communicationDelta: -8,
          confidenceDelta: -1,
        },
      ],
    },
    {
      id: "caller-intro",
      npcId: "arai-phone",
      japanese:
        "あ、お世話になっております。青空商事の山田と申します。佐藤さんはいらっしゃいますでしょうか。",
      reading:
        "あ おせわ に なって おります あおぞら しょうじ の やまだ と もうします さとうさん は いらっしゃいます でしょう か",
      english:
        "Thank you for your help. This is Yamada from Aozora Trading. Is Sato available?",
      objectiveType: "listening",
      audioFirst: true,
      listenOnly: true,
      socialContext: "external-caller",
      register: "business",
      helpHint:
        "Lock company 青空商事, caller 山田, and requested person 佐藤.",
      vocabHint: "と申します",
      setsFacts: {
        callerName: "山田",
        companyName: "青空商事",
        requestedPerson: "佐藤",
      },
      factLabels: {
        callerName: "Caller",
        companyName: "Company",
        requestedPerson: "Requested person",
      },
      speech: { autoPlay: true, karaokeMode: "after-answer" },
      choices: [
        {
          id: "intro-excellent",
          japanese:
            "青空商事の山田様ですね。佐藤でございますね。少々お待ちください。",
          reading:
            "あおぞら しょうじ の やまださま です ね さとう で ございます ね しょうしょう おまち ください",
          english:
            "Yamada-sama from Aozora Trading — Sato, yes. One moment please.",
          quality: "excellent",
          nextNodeId: "hold-desk",
          feedback:
            "🌟 Very natural\n\nYou confirmed caller + company, echoed 佐藤, and used 少々お待ちください.",
          relationshipDelta: 1,
          vocabHint: "少々お待ちください",
          checksFact: "callerName",
          expectedFactValue: "山田",
        },
        {
          id: "intro-natural",
          japanese: "はい、少々お待ちください。",
          reading: "はい しょうしょう おまち ください",
          english: "Yes — one moment please.",
          quality: "natural",
          nextNodeId: "hold-desk",
          feedback: "✓ Natural\n\nHold phrase is correct — confirming the name would be safer.",
          vocabHint: "少々お待ちください",
        },
        {
          id: "intro-wrong",
          japanese: "鈴木ですね。少々お待ちください。",
          reading: "すずき です ね しょうしょう おまち ください",
          english: "Suzuki, right? One moment.",
          quality: "incorrect",
          nextNodeId: "hold-desk",
          feedback: "✕ Wrong person\n\nThey asked for 佐藤, not 鈴木.",
          communicationDelta: -8,
          checksFact: "requestedPerson",
          expectedFactValue: "鈴木",
        },
        {
          id: "intro-repeat",
          japanese: "すみません、もう一度お願いします。",
          reading: "すみません もう いちど おねがい します",
          english: "Sorry, one more time please.",
          quality: "acceptable",
          nextNodeId: "caller-intro",
          isRepair: true,
          repairKind: "repeat",
          replayCurrent: true,
          communicationDelta: 3,
          feedback: "✓ Repair\n\nReplay at normal speed — phone listening skill.",
          vocabHint: "もう一度お願いします",
        },
      ],
    },
    {
      id: "hold-desk",
      npcId: "mika-coworker",
      japanese:
        "あ、佐藤先輩？さっき外出したよ。午後から戻るって言ってた。",
      reading:
        "あ さとうせんぱい さっき がいしゅつ した よ ごご から もどる って いってた",
      english:
        "Sato-senpai? He just stepped out. Said he’d be back this afternoon.",
      objectiveType: "dialogue",
      socialContext: "coworker",
      register: "polite",
      helpHint: "Internal check — Sato is out. Return to the caller with that status.",
      speech: { autoPlay: true },
      nextNodeId: "back-on-line",
    },
    {
      id: "back-on-line",
      japanese: "保留を解除しました。相手が待っています。",
      english: "You’re back on the line. The caller is waiting.",
      nextNodeId: "unavailable",
      speech: { autoPlay: true, language: "en" },
    },
    {
      id: "unavailable",
      npcId: "arai-phone",
      japanese: "あ、お待たせいたしました…佐藤さんは？",
      reading: "あ おまたせ いたしました さとうさん は",
      english: "Sorry to keep you waiting… Is Sato there?",
      objectiveType: "social-choice",
      socialContext: "external-caller",
      register: "business",
      helpHint:
        "Unavailable line: ただいま席を外しております. Offer to take a message.",
      vocabHint: "席を外しております",
      speech: { autoPlay: true },
      choices: [
        {
          id: "unavail-excellent",
          japanese:
            "申し訳ございません。佐藤はただいま席を外しております。",
          reading:
            "もうしわけ ございません さとう は ただいま せき を はずして おります",
          english:
            "I’m very sorry — Sato is away from his desk at the moment.",
          quality: "excellent",
          nextNodeId: "offer-message",
          feedback:
            "🌟 Very natural\n\n「席を外しております」is the standard unavailable phrase.",
          relationshipDelta: 1,
          vocabHint: "席を外しております",
        },
        {
          id: "unavail-natural",
          japanese: "あいにく外出しております。",
          reading: "あいにく がいしゅつ して おります",
          english: "Unfortunately he’s out of the office.",
          quality: "natural",
          nextNodeId: "offer-message",
          feedback: "✓ Natural\n\nClear status — 「席を外して」is a bit more desk-phone native.",
        },
        {
          id: "unavail-awkward",
          japanese: "いません。",
          reading: "いません",
          english: "He’s not here.",
          quality: "awkward",
          nextNodeId: "offer-message",
          feedback:
            "△ Awkward here\n\nToo blunt for an external client — soften with 申し訳ございません.",
          communicationDelta: -3,
        },
        {
          id: "unavail-wrong",
          japanese: "今、会議中ですので、後でかけてください。",
          reading: "いま かいぎちゅう です ので あとで かけて ください",
          english: "He’s in a meeting — please call later.",
          quality: "incorrect",
          nextNodeId: "offer-message",
          feedback:
            "✕ Wrong status\n\nYou checked the desk — he’s out, not in a meeting. Don’t invent details.",
          communicationDelta: -8,
        },
      ],
    },
    {
      id: "offer-message",
      npcId: "arai-phone",
      japanese: "そうですか…では、伝言をお願いできますでしょうか。",
      reading: "そう です か では でんごん を おねがい できます でしょう か",
      english: "I see… Could I leave a message, then?",
      objectiveType: "social-choice",
      socialContext: "external-caller",
      register: "business",
      helpHint: "Offer to take the message and promise a callback.",
      vocabHint: "伝言",
      speech: { autoPlay: true },
      choices: [
        {
          id: "offer-excellent",
          japanese:
            "かしこまりました。伝言を承ります。折り返すよう申し伝えます。",
          reading:
            "かしこまりました でんごん を うけたまわります おりかえす よう もうしつたえます",
          english:
            "Certainly. I’ll take a message and let him know to call you back.",
          quality: "excellent",
          nextNodeId: "message-details",
          feedback:
            "🌟 Very natural\n\n「伝言を承ります」+「折り返すよう申し伝えます」— textbook phone manners.",
          relationshipDelta: 1,
          vocabHint: "折り返すよう申し伝えます",
        },
        {
          id: "offer-natural",
          japanese: "はい、伝言をお預かりします。",
          reading: "はい でんごん を おあずかり します",
          english: "Yes, I’ll take a message.",
          quality: "natural",
          nextNodeId: "message-details",
          feedback: "✓ Natural\n\nClear offer to take the message.",
          vocabHint: "伝言",
        },
        {
          id: "offer-awkward",
          japanese: "じゃあ、何か言っときます。",
          reading: "じゃあ なにか いっときます",
          english: "I’ll tell him something then.",
          quality: "awkward",
          nextNodeId: "message-details",
          feedback:
            "△ Awkward here\n\nToo casual for an external business caller.",
          communicationDelta: -3,
        },
      ],
    },
    {
      id: "message-details",
      npcId: "arai-phone",
      japanese:
        "では、ゼロ三の一二三四の五六七八まで、今日の午後三時ごろにお電話いただけますと助かります。企画書の件でご相談したいとお伝えください。",
      reading:
        "では ゼロさん の いち に さん よん の ご ろく なな はち まで きょう の ごご さんじ ごろ に おでんわ いただけます と たすかります きかくしょ の けん で ごそうだん したい と おつたえ ください",
      english:
        "Please have him call 03-1234-5678 around 3 p.m. today. Tell him I’d like to discuss the proposal.",
      objectiveType: "listening",
      audioFirst: true,
      listenOnly: true,
      socialContext: "external-caller",
      register: "business",
      helpHint:
        "Lock number 03-1234-5678, time 午後三時, message 企画書の件. You’ll recall these later.",
      vocabHint: "折り返す",
      setsFacts: {
        callbackNumber: "03-1234-5678",
        callbackTime: "午後三時",
        message: "企画書の件",
      },
      factLabels: {
        callbackNumber: "Callback number",
        callbackTime: "Callback time",
        message: "Message",
      },
      speech: { autoPlay: true, karaokeMode: "after-answer" },
      nextNodeId: "details-check",
    },
    {
      id: "details-check",
      npcId: "arai-phone",
      japanese: "番号とお時間、よろしいでしょうか。",
      reading: "ばんごう と おじかん よろしい でしょう か",
      english: "Is the number and time alright?",
      objectiveType: "social-choice",
      socialContext: "external-caller",
      register: "business",
      helpHint: "Confirm number + time, or ask for a slow/repeat replay.",
      vocabHint: "確認する",
      speech: { autoPlay: true },
      choices: [
        {
          id: "det-excellent",
          japanese:
            "はい、ゼロ三の一二三四の五六七八、午後三時ごろですね。企画書の件、承知しました。",
          reading:
            "はい ゼロさん の いち に さん よん の ご ろく なな はち ごご さんじ ごろ です ね きかくしょ の けん しょうち しました",
          english:
            "Yes — 03-1234-5678 around 3 p.m. About the proposal — understood.",
          quality: "excellent",
          nextNodeId: "promise",
          isRepair: true,
          repairKind: "confirm",
          communicationDelta: 6,
          feedback:
            "🌟 Very natural\n\nRestating number, time, and topic locks the message for both sides.",
          vocabHint: "承知しました",
          checksFact: "callbackNumber",
          expectedFactValue: "03-1234-5678",
        },
        {
          id: "det-natural",
          japanese: "はい、承知しました。",
          reading: "はい しょうち しました",
          english: "Yes, understood.",
          quality: "natural",
          nextNodeId: "promise",
          feedback: "✓ Natural\n\nAcceptable — restating the number would be safer.",
          checksFact: "callbackTime",
          expectedFactValue: "午後三時",
        },
        {
          id: "det-mishear",
          japanese: "午後二時で、ゼロ三の一二三四の五六七八ですね。",
          reading:
            "ごご にじ で ゼロさん の いち に さん よん の ご ろく なな はち です ね",
          english: "2 p.m., at 03-1234-5678, right?",
          quality: "incorrect",
          nextNodeId: "mishear-recovery",
          feedback: "✕ Misheard the hour\n\n午後三時 ≠ 午後二時.",
          communicationDelta: -8,
          checksFact: "callbackTime",
          expectedFactValue: "午後二時",
        },
        {
          id: "det-slow",
          japanese: "すみません、もう少しゆっくりお願いできますか。",
          reading: "すみません もう すこし ゆっくり おねがい できます か",
          english: "Sorry, could you speak a little more slowly?",
          quality: "natural",
          nextNodeId: "details-slow",
          isRepair: true,
          repairKind: "slow",
          communicationDelta: 6,
          feedback: "✓ Repair\n\n「ゆっくり」buys listening time on business calls.",
          vocabHint: "もう一度お願いします",
        },
        {
          id: "det-repeat",
          japanese: "すみません、もう一度お願いします。",
          reading: "すみません もう いちど おねがい します",
          english: "Sorry, one more time please.",
          quality: "acceptable",
          nextNodeId: "message-details",
          isRepair: true,
          repairKind: "repeat",
          communicationDelta: 3,
          feedback: "✓ Repair\n\nAsking again is a real phone skill.",
          vocabHint: "もう一度お願いします",
        },
      ],
    },
    {
      id: "details-slow",
      npcId: "arai-phone",
      japanese:
        "はい。ゼロ三の…一二三四の…五六七八。今日の…午後…三時ごろ。企画書の件です。",
      reading:
        "はい ゼロさん の いち に さん よん の ご ろく なな はち きょう の ごご さんじ ごろ きかくしょ の けん です",
      english:
        "Yes. 03… 1234… 5678. Today… around… 3 p.m. About the proposal.",
      objectiveType: "listening",
      audioFirst: true,
      listenOnly: true,
      forceSlowSpeech: true,
      socialContext: "external-caller",
      register: "business",
      helpHint: "Slower repeat of number, time, and message topic.",
      vocabHint: "午後三時",
      speech: { autoPlay: true, karaokeMode: "after-answer" },
      nextNodeId: "details-rejoin",
    },
    {
      id: "mishear-recovery",
      npcId: "arai-phone",
      japanese: "あ、二時ではなく、午後三時ごろです。番号はそのままで。",
      reading: "あ にじ で は なく ごご さんじ ごろ です ばんごう は そのまま で",
      english: "Ah — not 2 o’clock; around 3 p.m. The number stays the same.",
      objectiveType: "repair",
      socialContext: "external-caller",
      register: "business",
      helpHint: "Caller corrected the time. Confirm cleanly.",
      vocabHint: "確認する",
      speech: { autoPlay: true },
      choices: [
        {
          id: "recover-ok",
          japanese: "すみません。午後三時ごろですね。承知しました。",
          reading: "すみません ごご さんじ ごろ です ね しょうち しました",
          english: "Sorry — around 3 p.m. Understood.",
          quality: "natural",
          nextNodeId: "promise",
          isRepair: true,
          repairKind: "confirm",
          communicationDelta: 6,
          feedback: "✓ Repair\n\nYou recovered the mishearing with a clear confirm.",
          checksFact: "callbackTime",
          expectedFactValue: "午後三時",
        },
        {
          id: "recover-guess",
          japanese: "じゃあ、四時ですか。",
          reading: "じゃあ よじ です か",
          english: "Then… 4 o’clock?",
          quality: "incorrect",
          nextNodeId: "promise",
          feedback: "✕ Still guessing\n\nThey already said 午後三時.",
          communicationDelta: -8,
          confidenceDelta: -1,
        },
      ],
    },
    {
      id: "details-rejoin",
      npcId: "arai-phone",
      japanese: "ご確認いただけましたか。午後三時ごろ、企画書の件です。",
      reading:
        "ごかくにん いただけました か ごご さんじ ごろ きかくしょ の けん です",
      english: "Have you got that? Around 3 p.m., about the proposal.",
      objectiveType: "social-choice",
      socialContext: "external-caller",
      register: "business",
      helpHint: "Branch rejoin after slow replay — confirm and move on.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "rejoin-ok",
          japanese:
            "はい、ゼロ三の一二三四の五六七八、午後三時ごろ、企画書の件ですね。",
          reading:
            "はい ゼロさん の いち に さん よん の ご ろく なな はち ごご さんじ ごろ きかくしょ の けん です ね",
          english: "Yes — 03-1234-5678, around 3 p.m., about the proposal.",
          quality: "excellent",
          nextNodeId: "promise",
          isRepair: true,
          repairKind: "confirm",
          communicationDelta: 6,
          feedback: "🌟 Very natural\n\nConfirmed after the slow repeat.",
          checksFact: "message",
          expectedFactValue: "企画書の件",
        },
        {
          id: "rejoin-wrong",
          japanese: "契約書の件で、午後三時ですね。",
          reading: "けいやくしょ の けん で ごご さんじ です ね",
          english: "About the contract, at 3 p.m., right?",
          quality: "incorrect",
          nextNodeId: "promise",
          feedback: "✕ Wrong topic\n\n企画書 ≠ 契約書 — close, but wrong.",
          communicationDelta: -8,
          checksFact: "message",
          expectedFactValue: "契約書の件",
        },
      ],
    },
    {
      id: "promise",
      npcId: "arai-phone",
      japanese: "では、よろしくお願いいたします。",
      reading: "では よろしく おねがい いたします",
      english: "Thank you in advance.",
      objectiveType: "social-choice",
      socialContext: "external-caller",
      register: "business",
      helpHint: "Close the message loop: promise the callback, then hang up politely.",
      vocabHint: "折り返すよう申し伝えます",
      speech: { autoPlay: true },
      choices: [
        {
          id: "prom-excellent",
          japanese:
            "かしこまりました。佐藤に折り返すよう申し伝えます。失礼いたします。",
          reading:
            "かしこまりました さとう に おりかえす よう もうしつたえます しつれい いたします",
          english:
            "Certainly. I’ll ask Sato to call you back. Goodbye.",
          quality: "excellent",
          nextNodeId: "hang-up",
          feedback:
            "🌟 Very natural\n\n「折り返すよう申し伝えます」+ formal close.",
          relationshipDelta: 1,
          vocabHint: "折り返すよう申し伝えます",
        },
        {
          id: "prom-natural",
          japanese: "はい、申し伝えます。失礼します。",
          reading: "はい もうしつたえます しつれい します",
          english: "Yes, I’ll pass that on. Goodbye.",
          quality: "natural",
          nextNodeId: "hang-up",
          feedback: "✓ Natural\n\nClean close-out.",
        },
        {
          id: "prom-awkward",
          japanese: "じゃあ、伝えておきます。バイ。",
          reading: "じゃあ つたえて おきます ばい",
          english: "I’ll tell him. Bye.",
          quality: "awkward",
          nextNodeId: "hang-up",
          feedback:
            "△ Awkward here\n\nToo casual for an external business hang-up.",
          communicationDelta: -3,
        },
      ],
    },
    {
      id: "hang-up",
      japanese: "通話終了。みかが伝言の確認に来ました。",
      english:
        "Call ended. Mika comes over to check the message — no peeking at the caller’s lines.",
      nextNodeId: "recall",
      speech: { autoPlay: true, language: "en" },
    },
    {
      id: "recall",
      npcId: "mika-coworker",
      japanese:
        "ねえ、さっきの電話。誰からで、何の伝言？番号と時間も教えて。",
      reading:
        "ねえ さっき の でんわ だれ から で なん の でんごん ばんごう と じかん も おしえて",
      english:
        "Hey — that call just now. Who was it, what’s the message? Number and time too.",
      objectiveType: "listening",
      socialContext: "coworker",
      register: "polite",
      helpHint:
        "Recall from earlier: 青空商事の山田 → 佐藤 → 03-1234-5678 / 午後三時 / 企画書の件. Original line is not shown.",
      vocabHint: "伝言",
      speech: { autoPlay: true },
      choices: [
        {
          id: "recall-excellent",
          japanese:
            "青空商事の山田さんから。佐藤先輩に、ゼロ三の一二三四の五六七八へ午後三時ごろ折り返し。企画書の件だって。",
          reading:
            "あおぞら しょうじ の やまださん から さとうせんぱい に ゼロさん の いち に さん よん の ご ろく なな はち へ ごご さんじ ごろ おりかえし きかくしょ の けん だって",
          english:
            "Yamada from Aozora Trading. Ask Sato-senpai to call back 03-1234-5678 around 3 p.m. — about the proposal.",
          quality: "excellent",
          nextNodeId: "success",
          feedback:
            "🌟 Very natural\n\nYou recalled caller, company, number, time, and message.",
          communicationDelta: 6,
          relationshipDelta: 1,
          checksFact: "callerName",
          expectedFactValue: "山田",
          vocabHint: "折り返す",
        },
        {
          id: "recall-partial",
          japanese: "山田さんから。企画書の件で、午後三時ごろ電話してほしいって。",
          reading:
            "やまださん から きかくしょ の けん で ごご さんじ ごろ でんわ して ほしい って",
          english:
            "From Yamada. About the proposal — wants a call around 3 p.m.",
          quality: "acceptable",
          nextNodeId: "success",
          feedback:
            "✓ Understandable\n\nTopic and time are right — company and number were missing.",
          checksFact: "message",
          expectedFactValue: "企画書の件",
        },
        {
          id: "recall-wrong-company",
          japanese: "空の商事の田中さんから、契約の件だって。",
          reading: "そら の しょうじ の たなかさん から けいやく の けん だって",
          english: "Tanaka from Sora Trading — about a contract.",
          quality: "incorrect",
          nextNodeId: "success",
          feedback:
            "✕ Wrong recall\n\n青空商事の山田 / 企画書 — not 田中 or 契約.",
          communicationDelta: -8,
          confidenceDelta: 0,
          checksFact: "companyName",
          expectedFactValue: "空の商事",
        },
        {
          id: "recall-wrong-time",
          japanese:
            "青空商事の山田さん。午後二時にゼロ三の一二三四の五六七八へ折り返し。",
          reading:
            "あおぞら しょうじ の やまださん ごご にじ に ゼロさん の いち に さん よん の ご ろく なな はち へ おりかえし",
          english:
            "Yamada from Aozora — call back 03-1234-5678 at 2 p.m.",
          quality: "incorrect",
          nextNodeId: "success",
          feedback: "✕ Wrong hour\n\nTime was 午後三時, not 二時.",
          communicationDelta: -8,
          checksFact: "callbackTime",
          expectedFactValue: "午後二時",
        },
      ],
    },
    {
      id: "success",
      japanese: "伝言メモ完了。ビジネス電話、クリアです。",
      english:
        "Message logged. You handled an external business call — hold, unavailable status, and recall under pressure.",
      endState: "success",
      speech: { autoPlay: true, language: "en" },
    },
  ],
};

export const BUSINESS_PHONE_QUEST: QuestDefinition = {
  id: "business-phone",
  title: "Business Phone Call",
  japaneseTitle: "電話を受ける",
  locationId: "office",
  chapter: 4,
  description:
    "Answer an external business call: confirm the caller, put them on hold, explain Sato is unavailable, take a callback message, and recall the details after hanging up.",
  difficulty: "hard",
  recommendedLevel: 7,
  startingConfidence: 5,
  requiresQuestIds: ["reporting-to-boss"],
  icon: "📞",
  meetNpcIds: ["arai-phone", "mika-coworker", "sato-senpai"],
  objectives: [
    { id: "answer", label: "Answer with a company greeting" },
    { id: "confirm", label: "Confirm caller and requested person" },
    { id: "hold", label: "Use 少々お待ちください" },
    { id: "unavailable", label: "Explain 席を外しております" },
    { id: "message", label: "Take callback number, time, and message" },
    { id: "promise", label: "Promise 折り返すよう申し伝えます" },
    { id: "recall", label: "Recall the message without the original line" },
  ],
  conversation: BUSINESS_PHONE_CONVERSATION,
  steps: [],
  rewards: {
    xp: 220,
    replayXp: 25,
    skillRewards: {
      listening: 5,
      politeness: 4,
      conversation: 3,
      vocabulary: 2,
    },
    replaySkillRewards: {
      listening: 1,
      politeness: 1,
    },
    unlockQuestIds: ["customer-service"],
    nextQuestTeaser: {
      id: "customer-service",
      title: "Customer Interaction",
      japaneseTitle: "お客様対応",
    },
  },
  unlocks: {
    questIds: ["customer-service"],
  },
};
