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
  7101: {
    word: "湿気 is moisture in the air or in a room; the weather term for humidity is 湿度.",
    phrase: "湿気が多い describes muggy air; the opposite is 乾燥している.",
    sentence: "ひどい here means severe, a common way to complain about weather.",
  },
  7102: {
    word: "泉 is a natural spring; a hot spring is 温泉, which shares the same kanji.",
    phrase: "きれいな describes clear water as well as pretty things.",
  },
  7103: {
    word: "岩 is a large rock; a small stone is 石.",
    phrase: "大きな is the pre-noun form of 大きい, common before nouns like 岩.",
  },
  7104: {
    word: "稲 is the rice plant in the field; harvested grain is 米, and cooked rice is ご飯.",
    phrase: "刈る means to cut plants, used for rice, grass and hair.",
    sentence: "田んぼ is a rice paddy, a common sight in the Japanese countryside.",
  },
  7105: {
    word: "巣 is a nest or den; a beehive is 蜂の巣, and a spider web is くもの巣.",
    phrase: "鳥の巣 is a bird's nest; to build one is 巣を作る.",
    sentence: "Swallows nesting under the eaves are seen as a sign of good luck in Japan.",
  },
  7106: {
    word: "酸素 is oxygen; 素 means element, as in 水素 for hydrogen.",
    phrase: "足りない means not enough; 酸素が足りない is also used figuratively for a stuffy room.",
  },
  7107: {
    word: "石油 is crude oil or kerosene; cooking oil is just 油.",
    phrase: "石油の値段 affects gasoline and heating prices, a frequent news topic.",
    sentence: "ほとんど means almost all; 輸入 is import and 輸出 is export.",
  },
  7108: {
    word: "生物 read せいぶつ is a living thing or biology class; read なまもの it means raw food.",
    phrase: "海の生物 covers fish, shellfish and any creature living in the sea.",
  },
  7109: {
    word: "人工 means made by people; the opposite is 自然, natural.",
    phrase: "人工の池 can also be said 人工池; 人工知能 means artificial intelligence.",
  },
  7110: {
    word: "衛星 is a satellite, natural or artificial; a man-made one is 人工衛星.",
    phrase: "気象衛星 are the weather satellites behind TV forecasts.",
  },
  7111: {
    word: "性格 is personality; 性質 is more about the nature or properties of things.",
    phrase: "明るい性格 is a cheerful personality, a common compliment.",
    sentence: "全然違う means completely different, a casual but very common phrase.",
  },
  7112: {
    word: "真剣 means fully serious; it literally refers to a real sword, not a practice one.",
    phrase: "真剣な顔 is a serious look; 真剣に before a verb means seriously.",
  },
  7113: {
    word: "意地悪 means mean or spiteful; a mean person is 意地悪な人.",
    phrase: "意地悪な質問 is a tricky question meant to trip someone up.",
    sentence: "意地悪をする means to be mean to someone, often used with children.",
  },
  7114: {
    word: "親しい means close, as in friends or relationships; it is more formal than 仲がいい.",
    phrase: "親しい友達 is a close friend; 親友 is the closest kind.",
  },
  7115: {
    word: "羨ましい means envious in a light way; strong jealousy is 嫉妬.",
    phrase: "羨ましい生活 is a life others would envy.",
    sentence: "なんて here shows surprise, like you get to do that?",
  },
  7116: {
    word: "飽きる means to get tired of something from too much of it.",
    phrase: "Use に with 飽きる for the thing you are tired of.",
  },
  7117: {
    word: "諦める means to give up on something you wanted; quitting an activity is やめる.",
    phrase: "夢を諦める is a common phrase in stories about growing up.",
    sentence: "諦めないで is a gentle way to say don't give up.",
  },
  7118: {
    word: "慌てる means to panic or hurry in a flustered way.",
    phrase: "慌てて before a verb means doing it in a rush.",
  },
  7119: {
    word: "失望 is deep disappointment; everyday disappointment is がっかり.",
    phrase: "結果に失望する uses に for the cause of the disappointment.",
  },
  7120: {
    word: "いらいら describes being irritated or impatient; it is a mimetic word.",
    phrase: "いらいらする is the usual verb form; it is often written in katakana as イライラ.",
  },
  7121: {
    word: "失業 is losing your job or being unemployed; the jobless rate is 失業率.",
    phrase: "失業の不安 is the worry of losing one's job.",
    sentence: "倒産 means a company going bankrupt.",
  },
  7122: {
    word: "支給 is when a company or government provides money or items to people.",
    phrase: "交通費 is travel expenses, which many Japanese companies pay for commuting.",
  },
  7123: {
    word: "請求 is a demand for payment; the bill itself is 請求書.",
    phrase: "請求の書類 are billing documents from a company.",
  },
  7124: {
    word: "署名 is a signature; in daily life people often use a personal seal called はんこ instead.",
    phrase: "署名を集める means collecting signatures, as for a petition.",
  },
  7125: {
    word: "証明 is proof; an official certificate is 証明書.",
    phrase: "身分の証明 is proof of identity, often a driver's license or residence card.",
  },
  7126: {
    word: "依頼 is a formal request for work or help; お願い is the everyday version.",
    phrase: "仕事の依頼 is a job request, common in business emails.",
    sentence: "依頼された is passive, meaning we were asked to do the work.",
  },
  7127: {
    word: "委員 is a member of a committee; the committee itself is 委員会.",
    phrase: "学級委員 is the class representative chosen in Japanese schools.",
  },
  7128: {
    word: "首相 is the prime minister; the official title is 内閣総理大臣.",
    phrase: "首相の発言 means remarks by the prime minister, common in news.",
  },
  7129: {
    word: "首都 is a capital city; Tokyo and its area are often called 首都圏.",
    phrase: "日本の首都 is Tokyo, though it is not written in any law.",
  },
  7130: {
    word: "商売 is running a business or trade, often a small shop.",
    phrase: "商売を始める is to start a business; doing well is 商売繁盛.",
  },
  7131: {
    word: "居間 is the living room in a traditional home; modern homes often say リビング.",
    phrase: "くつろぐ means to relax and feel at ease.",
  },
  7132: {
    word: "書斎 is a private study for reading and writing.",
    phrase: "父の書斎 is a classic image of a quiet room full of books.",
  },
  7133: {
    word: "芝生 is a lawn; 芝 alone is the grass itself.",
    phrase: "芝生に座る is a common picnic phrase in parks.",
    sentence: "This exact sign is common in Japanese parks, where some lawns are off limits.",
  },
  7134: {
    word: "明かり is light from a lamp or window; daylight is 光 or 日光.",
    phrase: "部屋の明かり is the light in a room; to turn it on is 明かりをつける.",
  },
  7135: {
    word: "板 is a flat board; a blackboard is 黒板, using the same kanji.",
    phrase: "木の板 is a wooden board; a metal plate is 鉄板.",
    sentence: "二枚 uses the counter 枚 for flat things like boards and paper.",
  },
  7136: {
    word: "穴 is a hole; 穴場 means a hidden gem of a place.",
    phrase: "靴下の穴 is a hole in a sock; 穴が開く means a hole forms.",
  },
  7137: {
    word: "泡 is foam or bubbles; soap bubbles for play are シャボン玉.",
    phrase: "石けん is soap; 石けんの泡 is the lather.",
  },
  7138: {
    word: "インク is ink for pens and printers; ink for calligraphy is 墨.",
    phrase: "切れる means to run out, as in インクが切れる or 電池が切れる.",
  },
  7139: {
    word: "スイッチ is a switch; to turn something on is スイッチを入れる.",
    phrase: "To switch off, say スイッチを切る.",
  },
  7140: {
    word: "衣服 is a formal word for clothing; in conversation say 服.",
    phrase: "整理 means sorting and organizing, as in 衣服の整理.",
    sentence: "衣替え is the custom of swapping summer and winter clothes.",
  },
  7141: {
    word: "冷める is for something hot cooling down; for chilling something use 冷える or 冷やす.",
    phrase: "料理が冷める is the food getting cold; 熱が冷める also means enthusiasm fading.",
    sentence: "冷めないうちに means while it is still hot.",
  },
  7142: {
    word: "温める is to warm something up; 暖める is used for rooms and air.",
    phrase: "牛乳を温める is a typical bedtime comfort.",
  },
  7143: {
    word: "預ける is to leave something in someone's care; the receiver uses 預かる.",
    phrase: "荷物を預ける is to check bags, at a hotel, station locker or airport.",
  },
  7144: {
    word: "受け取る is to receive something handed to you; もらう is more casual.",
    phrase: "荷物を受け取る is to pick up a package or delivery.",
    sentence: "Many Japanese convenience stores let you pick up online orders.",
  },
  7145: {
    word: "動かす is to move something; 動く is for something moving by itself.",
    phrase: "机を動かす is to move a desk; 心を動かす means to move someone emotionally.",
  },
  7146: {
    word: "疑う is to doubt or suspect; the noun is 疑い.",
    phrase: "目を疑う means you cannot believe your eyes.",
  },
  7147: {
    word: "埋める is to bury, or to fill in a gap or blank space.",
    phrase: "穴を埋める is filling a hole, and also covering a gap or loss.",
  },
  7148: {
    word: "奪う is to take something away by force; 盗む is to steal secretly.",
    phrase: "命を奪う is a serious phrase used in news about disasters and accidents.",
  },
  7149: {
    word: "救う is to rescue or save; 助ける is the everyday word for help.",
    phrase: "命を救う is to save a life; a lifesaver is 命の恩人.",
  },
  7150: {
    word: "沈む is to sink; it is also used for the sun setting and moods falling.",
    phrase: "船が沈む is a ship sinking; floating is 浮く.",
    sentence: "気分が沈む means feeling low or depressed.",
  },
  7151: {
    word: "筋肉 is muscle; sore muscles after exercise are 筋肉痛.",
    phrase: "筋肉をつける means to build muscle; losing it is 筋肉が落ちる.",
  },
  7152: {
    word: "血液 is the formal word for blood; in daily speech people say 血.",
    phrase: "血液の検査 is a blood test, usually shortened to 血液検査.",
    sentence: "健康診断 is the yearly health checkup most Japanese workers take.",
  },
  7153: {
    word: "呼吸 is breathing; 息 is a single breath.",
    phrase: "深い呼吸 is a deep breath; 深呼吸 is the set word for taking one.",
  },
  7154: {
    word: "腰 is the lower back and hip area; back pain there is 腰痛.",
    phrase: "腰が痛い is one of the most common complaints in Japan.",
    sentence: "痛める means to injure a body part, as in 腰を痛める.",
  },
  7155: {
    word: "傷 is a cut, wound or scratch on skin or objects; 怪我 is the injury as an event.",
    phrase: "小さな傷 can be on skin or on something like a car or phone.",
    sentence: "傷がつく means to get scratched, often used for objects.",
  },
  7156: {
    word: "かゆい means itchy; scratching is かく.",
    phrase: "背中がかゆい uses が for the place that itches.",
  },
  7157: {
    word: "臭い means bad-smelling; a pleasant smell is いい匂い or 香り.",
    phrase: "臭い before a noun describes what smells bad.",
  },
  7158: {
    word: "嗅ぐ is to sniff on purpose; noticing a smell is 匂いがする.",
    phrase: "香り is a pleasant scent, used for flowers, coffee and perfume.",
  },
  7159: {
    word: "苦しい means painful or hard to bear, for the body or for a situation.",
    phrase: "息が苦しい is used when it is hard to breathe.",
  },
  7160: {
    word: "疲れ is tiredness as a noun; the verb is 疲れる.",
    phrase: "疲れが取れる means fatigue goes away; 取る here means to remove.",
    sentence: "Hot springs are a classic way to relax and recover in Japan.",
  },
  7161: {
    word: "科目 is a school subject; a required subject is 必修科目.",
    phrase: "得意な科目 is your best subject; the weak one is 苦手な科目.",
  },
  7162: {
    word: "学者 is a scholar or researcher; 者 after a word often means a person.",
    phrase: "有名な学者 is a well-known expert, often seen on TV news.",
  },
  7163: {
    word: "学問 is learning as an activity or field; 勉強 is the everyday word for studying.",
    phrase: "学問の自由 is academic freedom, protected by the constitution.",
  },
  7164: {
    word: "教授 is a professor; an associate professor is 准教授.",
    phrase: "大学の教授 is used for full professors; students call them 先生.",
    sentence: "教わる means to be taught, the opposite side of 教える.",
  },
  7165: {
    word: "黒板 is a blackboard; a whiteboard is ホワイトボード.",
    phrase: "黒板を消す means to erase the board, often a job for students on duty.",
  },
  7166: {
    word: "論文 is an academic paper; 卒論 is the short form for a graduation thesis.",
    phrase: "卒業論文 is required at many Japanese universities.",
  },
  7167: {
    word: "留学 is studying abroad; an international student is 留学生.",
    phrase: "留学の経験 is often mentioned in job interviews.",
    sentence: "つもりです shows a plan you intend to carry out.",
  },
  7168: {
    word: "寮 is a dormitory for students or company employees.",
    phrase: "学生の寮 is also called 学生寮.",
  },
  7169: {
    word: "化学 is chemistry; it sounds the same as 科学, science, so people sometimes say ばけがく.",
    phrase: "実験 is an experiment, done in labs and science classes.",
  },
  7170: {
    word: "哲学 is philosophy; it is also used for a personal philosophy, like 人生の哲学.",
    phrase: "哲学の本 can be academic or a popular book on how to live.",
  },
  7171: {
    word: "金額 is a sum of money; 値段 is the price of goods.",
    phrase: "大きな金額 is a large sum, often in news about money.",
    sentence: "請求書 is a bill or invoice listing the amount owed.",
  },
  7172: {
    word: "財産 is property or a fortune; it is also used for anything valuable, like health.",
    phrase: "親の財産 is often discussed in the context of inheritance.",
  },
  7173: {
    word: "稼ぐ means to earn money by working; 儲ける is to make a profit.",
    phrase: "お金を稼ぐ is the everyday phrase for earning money.",
    sentence: "学費 means school fees or tuition.",
  },
  7174: {
    word: "雇う is to hire someone; being hired is 雇われる.",
    phrase: "人を雇う is used by shops and companies hiring staff.",
  },
  7175: {
    word: "辞める is to quit a job or position; stopping a habit is やめる in kana.",
    phrase: "会社を辞める is the usual phrase for leaving a company.",
  },
  7176: {
    word: "後輩 is someone junior to you at school or work; a senior is 先輩.",
    phrase: "会社の後輩 is a junior colleague, often someone you look after.",
  },
  7177: {
    word: "監督 is a director in film, a manager in sports, or a supervisor at work.",
    phrase: "映画の監督 is a film director.",
    sentence: "交代 means swapping one person for another, like a substitution.",
  },
  7178: {
    word: "議員 is an elected member of an assembly; Diet members are 国会議員.",
    phrase: "国会議員 are members of Japan's national parliament.",
    sentence: "Politicians often speak in front of busy stations before elections.",
  },
  7179: {
    word: "名刺 is a business card; exchanging them politely is an important business custom.",
    phrase: "名刺を交換する is the set phrase for swapping business cards.",
  },
  7180: {
    word: "休暇 is a formal word for leave or vacation; paid leave is 有給休暇.",
    phrase: "夏の休暇 is summer vacation; in conversation people often say 夏休み.",
    sentence: "実家 is the home where your parents live.",
  },
  7181: {
    word: "天候 is weather over a period, a formal word; daily weather is 天気.",
    phrase: "悪い天候 is often heard in travel announcements.",
  },
  7182: {
    word: "予報 is a forecast; the weather forecast is 天気予報.",
    phrase: "予報が当たる means the forecast turns out right; wrong is 外れる.",
    sentence: "らしい here passes on what the forecast says.",
  },
  7183: {
    word: "夜明け is dawn, the moment night ends; 明け方 is the early morning hours.",
    phrase: "夜明けの空 slowly turns from dark blue to orange.",
  },
  7184: {
    word: "地平線 is the horizon over land; over the sea it is 水平線.",
    phrase: "向こう means the far side, as in 地平線の向こう.",
  },
  7185: {
    word: "故郷 is read こきょう or, more warmly, ふるさと, meaning one's hometown.",
    phrase: "故郷の味 is the taste of home cooking from where you grew up.",
    sentence: "Many people travel home for New Year's, so trains and roads get crowded.",
  },
  7186: {
    word: "岸 is a shore or bank; the far bank is 向こう岸.",
    phrase: "川の岸 is also called 川岸.",
  },
  7187: {
    word: "谷 is a valley; the opposite landform is 山.",
    phrase: "深い谷 is a deep valley, often crossed by a bridge.",
  },
  7188: {
    word: "宿 is any place to stay, often a traditional inn; a hotel is ホテル.",
    phrase: "宿を予約する is to book a place to stay.",
  },
  7189: {
    word: "休憩 is a short break; a longer rest is 休み.",
    phrase: "休憩を取る is to take a break; a break room is 休憩室.",
  },
  7190: {
    word: "混雑 is formal for crowding, used in announcements; in speech say 混む.",
    phrase: "駅の混雑 is common during rush hour and holidays.",
  },
  7191: {
    word: "隠す is to hide something; hiding yourself is 隠れる.",
    phrase: "本当の気持ちを隠す is to hide how you really feel.",
  },
  7192: {
    word: "抱える means to hold in your arms, and also to have problems or debts.",
    phrase: "問題を抱える is a common way to say someone has problems.",
  },
  7193: {
    word: "囲む is to surround; being surrounded is 囲まれる.",
    phrase: "テーブルを囲む means sitting around a table together.",
  },
  7194: {
    word: "重ねる is to stack things or to repeat something many times.",
    phrase: "皿を重ねる is stacking plates; 年を重ねる means getting older.",
  },
  7195: {
    word: "こぼす is to spill; when liquid spills by itself use こぼれる.",
    phrase: "お茶をこぼす is a small everyday accident.",
    sentence: "てしまった adds that spilling was an accident.",
  },
  7196: {
    word: "転ぶ is to fall over; falling from a height is 落ちる.",
    phrase: "道で転ぶ is tripping on the road or sidewalk.",
  },
  7197: {
    word: "誘う is to invite someone casually; a formal invitation is 招待する.",
    phrase: "食事に誘う uses に for the event you invite someone to.",
    sentence: "飲み会 is a drinking party, often with coworkers.",
  },
  7198: {
    word: "断る is to refuse or decline; Japanese often refuse indirectly to stay polite.",
    phrase: "誘いを断る is declining an invitation; ちょっと is a soft way to start.",
  },
  7199: {
    word: "叫ぶ is to shout or scream; calling someone's name is 呼ぶ.",
    phrase: "大声で叫ぶ means shouting loudly; 大声 is a loud voice.",
  },
  7200: {
    word: "黙る is to stop talking or stay silent; 黙って can mean without saying anything.",
    phrase: "急に黙る is suddenly falling silent, often from surprise or anger.",
  },
  7201: {
    word: "恐ろしい is stronger than 怖い and sounds a little formal or literary.",
    phrase: "恐ろしい事件 is common in news about serious crimes.",
  },
  7202: {
    word: "悔しい is frustration at losing or failing when you tried hard; 残念 is plain disappointment.",
    phrase: "悔しい思い is the bitter feeling after a defeat.",
    sentence: "一点差 means a one-point margin.",
  },
  7203: {
    word: "がっかり is the everyday word for being let down; 失望 is the formal version.",
    phrase: "結果にがっかりする uses に for what disappointed you.",
  },
  7204: {
    word: "感心 is being impressed by someone's effort or behavior; 関心 is interest.",
    phrase: "感心な子ども is a child who behaves admirably.",
  },
  7205: {
    word: "興奮 is excitement or agitation; it can be happy or angry.",
    phrase: "興奮した声 is a raised, excited voice.",
  },
  7206: {
    word: "恐怖 is strong fear as a noun; the everyday adjective is 怖い.",
    phrase: "恐怖を感じる is a formal way to say you felt afraid.",
  },
  7207: {
    word: "怒り is anger as a noun; the verb is 怒る.",
    phrase: "抑える means to hold down or control, as in 怒りを抑える.",
    sentence: "こみ上げる means a feeling welling up from inside.",
  },
  7208: {
    word: "勇気 is courage; a brave person is 勇気のある人.",
    phrase: "勇気を出す is the set phrase for working up courage.",
  },
  7209: {
    word: "尊敬 is deep respect; respectful language is 尊敬語.",
    phrase: "尊敬する先輩 is a senior you look up to.",
  },
  7210: {
    word: "苦労 is hardship or effort through difficulty; ご苦労様 thanks someone for their work.",
    phrase: "苦労が多い describes a hard life or job.",
    sentence: "苦労して育てる is a common phrase about raising children through hard times.",
  },
  7211: {
    word: "貝 is shellfish or a shell; clams are あさり and scallops are ほたて.",
    phrase: "貝を拾う is a classic beach activity.",
  },
  7212: {
    word: "芽 is a sprout or bud; it also means early signs, as in 才能の芽.",
    phrase: "芽が出る is a sprout coming up; it also means starting to succeed.",
  },
  7213: {
    word: "翼 is a wing of a bird or plane; it is a common image of freedom in songs.",
    phrase: "鳥の翼 is a bird's wings; spreading them is 翼を広げる.",
  },
  7214: {
    word: "象 is an elephant; the same kanji in 印象 means image or impression.",
    phrase: "象の鼻 is an elephant's trunk; 鼻 also means nose.",
    sentence: "餌をあげる means to feed an animal.",
  },
  7215: {
    word: "氷 is ice; shaved ice dessert is かき氷.",
    phrase: "氷を入れる is adding ice to a drink.",
  },
  7216: {
    word: "煙 is smoke; cigarette smoke is also 煙, and no smoking signs say 禁煙.",
    phrase: "黒い煙 is black smoke, often a sign of fire.",
    sentence: "煙突 is a chimney.",
  },
  7217: {
    word: "桜 is the cherry tree and its blossoms, Japan's symbol of spring.",
    phrase: "桜の花 is the blossom itself; viewing them is お花見.",
  },
  7218: {
    word: "豆 is beans; it also appears in names like 豆腐 and 枝豆.",
    phrase: "煮る is to simmer food in liquid.",
    sentence: "At Setsubun in February, people throw roasted beans to drive away bad luck.",
  },
  7219: {
    word: "砂漠 is a desert; 砂 means sand.",
    phrase: "広い砂漠 is a vast desert; Japan's famous dunes are 砂丘.",
  },
  7220: {
    word: "湾 is a bay or gulf; a harbor is 港.",
    phrase: "東京湾 is Tokyo Bay, home to many ports and bridges.",
  },
  7221: {
    word: "火災 is a fire as a disaster, used in news and on signs; in conversation say 火事.",
    phrase: "火災の原因 is the cause of a fire, often reported in the news.",
  },
  7222: {
    word: "警告 is a formal warning; a weather warning is 警報.",
    phrase: "警告を受ける is to receive a warning.",
  },
  7223: {
    word: "刑事 is a police detective; it also means criminal, as in 刑事事件.",
    phrase: "ベテランの刑事 is a typical TV drama character.",
    sentence: "現場 is the scene where something happened.",
  },
  7224: {
    word: "罪 is a crime or sin; a criminal is 犯罪者.",
    phrase: "罪を犯す is the set phrase for committing a crime.",
  },
  7225: {
    word: "停電 is a power outage; 停 means stop and 電 means electricity.",
    phrase: "突然の停電 is a sudden blackout, common during storms.",
  },
  7226: {
    word: "宣伝 is promoting something, like ads; an advertisement itself is 広告.",
    phrase: "商品の宣伝 is promoting a product.",
  },
  7227: {
    word: "予防 is prevention; a vaccine is 予防接種.",
    phrase: "病気の予防 is disease prevention.",
    sentence: "手洗い is hand washing, a common health message in Japan.",
  },
  7228: {
    word: "禁煙 means no smoking, or quitting smoking; smoking areas are 喫煙所.",
    phrase: "禁煙の席 is a non-smoking seat in a restaurant.",
  },
  7229: {
    word: "差別 is unfair discrimination; 区別 is neutral distinction.",
    phrase: "差別をなくす is to eliminate discrimination.",
  },
  7230: {
    word: "国境 is a national border; Japan has no land borders.",
    phrase: "国境を越える is crossing a border; 越える means to go over.",
  },
  7231: {
    word: "賢い means clever or wise, for people and animals; 頭がいい is the casual phrase.",
    phrase: "賢い選択 is a wise choice.",
  },
  7232: {
    word: "大人しい means quiet and well-behaved, often for children, pets or personalities.",
    phrase: "大人しい性格 is a calm, quiet character.",
    sentence: "鳴く is used for animal sounds, like a cat meowing.",
  },
  7233: {
    word: "器用 means good with your hands; clumsy is 不器用.",
    phrase: "器用な手 is skillful hands; 手先が器用 means dexterous.",
  },
  7234: {
    word: "優秀 means excellent, often for students and staff.",
    phrase: "優秀な学生 is a top student.",
    sentence: "成績 means grades or results.",
  },
  7235: {
    word: "才能 is natural talent; effort is 努力.",
    phrase: "音楽の才能 is a talent for music.",
  },
  7236: {
    word: "有能 means capable at work; the opposite is 無能.",
    phrase: "有能な社員 is a capable employee.",
  },
  7237: {
    word: "利口 means smart or sensible; it is often used for children and animals.",
    phrase: "利口な子 is a bright child.",
  },
  7238: {
    word: "けち means stingy with money; it can sound rude when said to someone.",
    phrase: "けちな人 is a stingy person.",
    sentence: "おごる means to treat someone to food or drinks.",
  },
  7239: {
    word: "わがまま means selfish or demanding.",
    phrase: "わがままな子ども is a spoiled child.",
    sentence: "わがままを言う means to make selfish demands.",
  },
  7240: {
    word: "陽気 means cheerful and lively; it can also describe the weather.",
    phrase: "陽気な音楽 is upbeat music.",
  },
  7241: {
    word: "乾かす is to dry something; when it dries by itself use 乾く.",
    phrase: "髪を乾かす is to dry your hair.",
  },
  7242: {
    word: "茹でる is to boil food in water; boiling the water itself is 沸かす.",
    phrase: "卵を茹でる is to boil eggs; a boiled egg is ゆで卵.",
  },
  7243: {
    word: "炊く is used only for cooking rice; other cooking is 作る or 煮る.",
    phrase: "ご飯を炊く is the everyday phrase; rice cookers are 炊飯器.",
    sentence: "ておく shows doing it in advance.",
  },
  7244: {
    word: "割る is to break or split something; it also means to divide in math.",
    phrase: "卵を割る is cracking an egg.",
    sentence: "When something breaks by itself, use 割れる.",
  },
  7245: {
    word: "燃やす is to burn something; when it burns by itself use 燃える.",
    phrase: "ごみを燃やす is burning trash; burnable trash is 燃えるごみ.",
  },
  7246: {
    word: "積もる is for snow or dust piling up; piling things on purpose is 積む.",
    phrase: "雪が積もる is snow building up on the ground.",
  },
  7247: {
    word: "溶ける is for melting or dissolving; 解ける is for problems being solved.",
    phrase: "氷が溶ける is ice melting.",
  },
  7248: {
    word: "掴む is to grab firmly; it also means to grasp a chance or meaning.",
    phrase: "腕を掴む is grabbing someone's arm.",
    sentence: "手すり is a handrail.",
  },
  7249: {
    word: "叩く is to hit or knock; tapping lightly is also 叩く.",
    phrase: "ドアを叩く is knocking on the door; knocking politely is ノックする.",
  },
  7250: {
    word: "揃える is to arrange things neatly or to collect a full set.",
    phrase: "靴を揃える is lining up shoes at the entrance, an important Japanese manner.",
  },
};
