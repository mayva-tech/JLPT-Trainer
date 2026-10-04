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
  7051: {
    word: "食材 is anything used as an ingredient; 材料 is broader and covers craft materials too.",
    phrase: "新鮮な食材 is a common phrase on menus and in cooking shows.",
    sentence: "地元の食材 means locally produced ingredients, a big selling point in Japan.",
  },
  7052: {
    word: "小麦粉 is wheat flour; 粉 alone means any powder, and rice flour is 米粉.",
    phrase: "混ぜる means to mix; 混ざる is the intransitive form when things become mixed.",
  },
  7053: {
    phrase: "味噌汁 is miso soup; tofu and wakame are its most common ingredients.",
    sentence: "体にいい means good for your health, a very common everyday phrase.",
  },
  7054: {
    word: "納豆 is sticky fermented soybeans, usually eaten with rice at breakfast.",
    phrase: "納豆ご飯 is natto on rice, often mixed with soy sauce and green onion.",
    sentence: "Use 苦手 for food you dislike; it is softer than 嫌い.",
  },
  7055: {
    word: "和菓子 are traditional Japanese sweets; Western cakes and cookies are 洋菓子.",
    phrase: "Many 和菓子 change with the seasons, like sakura mochi in spring.",
    sentence: "いただく is the humble verb for eating or receiving, used politely.",
  },
  7056: {
    word: "食卓 is the dining table at mealtimes; the furniture itself is often called テーブル.",
    phrase: "家族の食卓 suggests family meals together, not just the table.",
  },
  7057: {
    word: "食品 is food as a product, as in shops or labels; 食べ物 is the everyday word.",
    phrase: "冷凍食品 are frozen foods; 冷凍 means freezing, and 冷蔵 means chilling.",
  },
  7058: {
    word: "栄養 is nutrition; a balanced diet is 栄養のバランスがいい食事.",
    phrase: "栄養のある means nutritious; 栄養がある is the same in a full sentence.",
    sentence: "たっぷり means plenty of, often used for food and drink.",
  },
  7059: {
    word: "こしょう is usually written in hiragana; the kanji 胡椒 is rare in daily life.",
    phrase: "Japanese lists salt first, as in 塩とこしょう.",
    sentence: "味を調える means to adjust the seasoning, a common recipe phrase.",
  },
  7060: {
    word: "油 is cooking or machine oil; 脂 with a different kanji is animal fat.",
    phrase: "揚げる is to deep-fry; 炒める is to stir-fry with a little oil.",
  },
  7061: {
    word: "梅雨 is read つゆ, though ばいう is also used in forecasts; it runs from early June to July.",
    phrase: "梅雨の季節 is the rainy season; its end is called 梅雨明け.",
    sentence: "梅雨に入る means the rainy season begins; forecasters say 梅雨入り.",
  },
  7062: {
    word: "嵐 is a storm with strong wind and rain; a typhoon is 台風.",
    phrase: "嵐の夜 is a stormy night, also used figuratively for a dramatic night.",
  },
  7063: {
    word: "霧 is fog or mist; light mist is also called もや.",
    phrase: "Use 濃い for thick fog; thin fog is 薄い霧.",
  },
  7064: {
    word: "霜 is frost on the ground; frost on a window is also 霜, and frost-free fridges say 霜取り.",
    phrase: "霜が降りる is the set phrase for frost forming overnight.",
  },
  7065: {
    word: "雷 is thunder and lightning together; the flash itself is 稲妻 or 稲光.",
    phrase: "雷が鳴る is thunder rumbling; 雷が落ちる means lightning strikes.",
  },
  7066: {
    word: "満開 means in full bloom, used mostly for cherry blossoms.",
    phrase: "満開の桜 is a classic spring phrase; partial bloom is 五分咲き.",
  },
  7067: {
    word: "花火 literally means fire flowers; summer fireworks festivals are a big tradition.",
    phrase: "花火大会 is a fireworks festival, where many people wear yukata.",
  },
  7068: {
    word: "太陽 is the sun in science and formal speech; children often say お日様.",
    phrase: "太陽の光 is sunlight; 日光 is a shorter word for the same thing.",
    sentence: "沈む is used for the sun setting; rising is 昇る.",
  },
  7069: {
    word: "丘 is a low hill; a mountain is 山, and a small hill can also be 小山.",
    phrase: "丘の上 is a common spot for parks, schools and views over the town.",
  },
  7070: {
    word: "波 is a wave of water; a wave of change can also be called 波.",
    phrase: "波が高い is the usual way beaches warn swimmers about rough sea.",
  },
  7071: {
    word: "代金 is the price you pay for goods or services; 料金 is a set fee like a fare.",
    phrase: "商品の代金 is the cost of the item itself, not shipping or tax.",
  },
  7072: {
    word: "値下げ is a seller lowering a price; prices falling by themselves is 値下がり.",
    phrase: "大幅な means large in scale, often used with price cuts and changes.",
    sentence: "Supermarkets put discount stickers on bento before closing, a well-known evening bargain.",
  },
  7073: {
    word: "値上げ is a deliberate price raise by a seller; 値上がり is prices rising on their own.",
    phrase: "電気代 is the electricity bill; 代 after a noun means the charge for it.",
  },
  7074: {
    word: "偽物 is a fake; the genuine article is 本物.",
    phrase: "ブランド品 means designer goods, a common target for fakes.",
    sentence: "かもしれない means might be, showing the speaker is not sure.",
  },
  7075: {
    word: "中古 means second-hand; brand new is 新品.",
    phrase: "中古の車 is often shortened to 中古車.",
  },
  7076: {
    word: "硬貨 is the formal word for coins; in conversation people say 小銭 for small change.",
    phrase: "百円硬貨 is the hundred-yen coin; in speech just say 百円玉.",
  },
  7077: {
    word: "合計 is the total of several amounts; the bill or check is お会計.",
    phrase: "合計の金額 is the total amount, shown at the bottom of a receipt.",
    sentence: "になります is the typical register phrase when telling the total.",
  },
  7078: {
    word: "宝くじ is a lottery ticket; the big year-end lottery draws long lines.",
    phrase: "宝くじが当たる is to win the lottery; 当たる also means a guess is right.",
  },
  7079: {
    word: "通信販売 is mail order, usually shortened to 通販, now mostly online.",
    phrase: "通信販売の商品 are goods sold by catalog or online, delivered to your home.",
  },
  7080: {
    word: "札 read さつ is a banknote; the same kanji read ふだ means a tag or card.",
    phrase: "一万円札 is the largest note; coins and notes together are お金.",
  },
  7081: {
    word: "親友 is a best friend; a friend in general is 友達, and a formal word is 友人.",
    phrase: "昔からの means since long ago, as in 昔からの友達.",
  },
  7082: {
    word: "知り合い is someone you know but are not close to, weaker than 友達.",
    phrase: "仕事の知り合い is a work contact, not necessarily a friend.",
    sentence: "の紹介で means through someone's introduction, a common way to find jobs in Japan.",
  },
  7083: {
    word: "恋人 is a romantic partner of any gender; in speech people also say 彼氏 or 彼女.",
    phrase: "恋人ができる means to start dating someone; できる here means to come to have.",
  },
  7084: {
    word: "夫婦 is a married couple; a dating couple is カップル.",
    phrase: "仲のいい means on good terms, used for couples, friends and siblings.",
  },
  7085: {
    word: "双子 are twins; triplets are 三つ子.",
    phrase: "兄弟 can mean brothers or siblings; sisters are 姉妹.",
    sentence: "そっくり means looks exactly alike, often used for family resemblance.",
  },
  7086: {
    word: "いとこ is usually written in hiragana; it covers male and female cousins alike.",
    phrase: "いとこの結婚式 is a cousin's wedding, a common family gathering.",
  },
  7087: {
    word: "味方 is someone on your side; the opposite is 敵, an enemy.",
    phrase: "子どもの味方 means siding with or supporting children.",
    sentence: "あなたの味方だよ is a warm way to promise support.",
  },
  7088: {
    word: "婚約 is engagement to marry; the fiancé or fiancée is 婚約者.",
    phrase: "婚約の指輪 is usually shortened to 婚約指輪.",
  },
  7089: {
    word: "若者 means young people as a group, often in news; 若い人 is softer.",
    phrase: "今の若者 is how older people talk about young people today, sometimes critically.",
  },
  7090: {
    word: "独身 means single and not married; living alone is 一人暮らし.",
    phrase: "独身の生活 is single life; 独身寮 is a company dorm for single workers.",
  },
  7091: {
    word: "読書 is reading as an activity or hobby; reading a document is just 読む.",
    phrase: "読書の時間 is time for reading; 読書の秋 calls autumn the season for books.",
    sentence: "が楽しみだ means something is a pleasure to look forward to.",
  },
  7092: {
    word: "登山 is mountain climbing in general; a casual hike is ハイキング.",
    phrase: "冬の登山 needs special gear; summer climbing season in Japan is short.",
  },
  7093: {
    word: "手品 is a magic trick; a magician is 手品師 or マジシャン.",
    phrase: "手品を見せる is to perform a trick for someone.",
    sentence: "目を輝かせる means eyes sparkling with excitement.",
  },
  7094: {
    word: "芝居 is a stage play; it also means an act or pretense, as in 芝居をする.",
    phrase: "芝居を見る is to watch a play; to perform in one is 芝居に出る.",
  },
  7095: {
    word: "キャンプ is camping; a campsite is キャンプ場.",
    phrase: "キャンプに行く is to go camping; with する it focuses on doing it.",
  },
  7096: {
    word: "ハイキング is an easy walk in nature; serious climbing is 登山.",
    phrase: "山でハイキング is a light mountain walk, popular on weekends.",
    sentence: "いこう is the casual let's form of 行く.",
  },
  7097: {
    word: "作曲 is composing music; writing the lyrics is 作詞.",
    phrase: "ピアノで作曲する uses で for the instrument or tool you compose with.",
  },
  7098: {
    word: "漫画家 is a manga artist; 家 after a field means a professional, like 作家 or 画家.",
    phrase: "人気の means popular, as in 人気の店 or 人気の漫画家.",
  },
  7099: {
    word: "休日 is a day off or holiday; national holidays are 祝日.",
    phrase: "過ごし方 means a way of spending time; 休日の過ごし方 is a common interview topic.",
  },
  7100: {
    word: "劇場 is a theater for plays; a movie theater is 映画館.",
    phrase: "駅前の means in front of the station, a common location in Japanese towns.",
  },
};
