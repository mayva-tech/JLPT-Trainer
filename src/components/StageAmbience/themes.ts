/**
 * Stage ambience — a quiet background that follows the item on screen.
 *
 * Ten themes. Each item (vocabulary word, grammar pattern, onomatopoeia,
 * quiz question) is matched to the theme its words point at:
 *
 *   1. keywords in the word / pattern and its meaning      (strongest)
 *   2. the item's subcategory, then its category
 *   3. keywords in the phrase and example sentence          (weakest)
 *
 * When nothing matches, a stable hash of the item id picks one of the
 * neutral themes, so every item gets some variation and always the same
 * one — the background never changes between the steps of one item.
 */

export type AmbienceTheme =
  // Seasons and weather
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "rain"
  // People scenes
  | "hanami"
  | "bonOdori"
  | "rushHour"
  | "shodo"
  | "sado"
  | "sumo"
  | "mikoshi"
  | "trainWindow"
  | "konbini"
  | "jihanki"
  | "scramble"
  | "kendo"
  | "classroom"
  | "fishing"
  | "kaitenSushi"
  | "kamakura"
  | "kingyo"
  | "radioTaiso"
  | "meishi"
  | "engawa"
  // Japan scenes
  | "fuji"
  | "torii"
  | "seaTorii"
  | "pagoda"
  | "castle"
  | "machiya"
  | "onsen"
  | "karesansui"
  | "bamboo"
  | "shinkansen"
  | "tanabata"
  | "koi"
  | "yatai"
  | "washitsu"
  | "tanbo"
  | "gassho"
  | "neon"
  | "koinobori"
  | "tsukimi"
  | "ukiyoe"
  // Wide, calm scenes
  | "space"
  | "ocean"
  | "city"
  | "mountains"
  | "washi"
  // Motion scenes
  | "cycling"
  | "kite"
  | "enoden"
  | "toro"
  | "hotaru"
  | "kanransha"
  | "aquarium"
  | "surf"
  | "balloon"
  | "ekiden"
  | "undokai"
  | "laundry"
  | "demae"
  | "deer"
  | "unkai"
  | "camping"
  | "ski"
  | "dogWalk"
  | "manekineko"
  | "rainbow"
  // Festival and craft scenes
  | "mochitsuki"
  | "shishimai"
  | "ukai"
  | "snowMonkey"
  | "tsurumai"
  | "fujidana"
  | "chabatake"
  | "furin"
  | "kabuki"
  | "taiko"
  | "takoyaki"
  | "gacha"
  | "shogi"
  | "library"
  | "kissaten"
  | "playground"
  | "harvest"
  | "harbor"
  | "yukimatsuri"
  | "origami"
  // Surprise scenes
  | "tanuki"
  | "kitsune"
  | "ninja"
  | "ufo"
  | "whale"
  | "karakuri"
  | "daruma"
  | "yokai"
  | "stargaze"
  | "beetle"
  | "dragon"
  | "ramen"
  | "robot"
  | "omikuji"
  | "himawari"
  | "kamishibai"
  | "gust"
  | "ama"
  | "starTrain"
  | "seri";

export interface AmbienceThemeInfo {
  id: AmbienceTheme;
  /** Short Japanese name, shown in the toggle tooltip. */
  ja: string;
  en: string;
}

/** Order also breaks score ties. */
export const AMBIENCE_THEMES: readonly AmbienceThemeInfo[] = [
  { id: "spring", ja: "春", en: "Spring blossoms" },
  { id: "summer", ja: "夏祭り", en: "Summer fireworks" },
  { id: "autumn", ja: "秋", en: "Autumn leaves" },
  { id: "winter", ja: "冬", en: "Winter snow" },
  { id: "rain", ja: "雨", en: "Rainy season" },
  { id: "hanami", ja: "花見の宴", en: "Hanami party" },
  { id: "bonOdori", ja: "盆踊り", en: "Bon dance" },
  { id: "rushHour", ja: "通勤ラッシュ", en: "Rush hour platform" },
  { id: "shodo", ja: "書道", en: "Calligraphy" },
  { id: "sado", ja: "茶道", en: "Tea ceremony" },
  { id: "sumo", ja: "相撲", en: "Sumo bout" },
  { id: "mikoshi", ja: "神輿", en: "Mikoshi carriers" },
  { id: "trainWindow", ja: "車窓", en: "Train window" },
  { id: "konbini", ja: "コンビニ", en: "Konbini at night" },
  { id: "jihanki", ja: "自販機", en: "Vending machine road" },
  { id: "scramble", ja: "雨の交差点", en: "Rainy crossing" },
  { id: "kendo", ja: "剣道", en: "Kendo dojo" },
  { id: "classroom", ja: "教室", en: "Classroom" },
  { id: "fishing", ja: "川釣り", en: "River fishing" },
  { id: "kaitenSushi", ja: "回転寿司", en: "Conveyor sushi" },
  { id: "kamakura", ja: "かまくら", en: "Snow hut" },
  { id: "kingyo", ja: "金魚すくい", en: "Goldfish scooping" },
  { id: "radioTaiso", ja: "ラジオ体操", en: "Radio exercises" },
  { id: "meishi", ja: "名刺交換", en: "Business card bow" },
  { id: "engawa", ja: "縁側", en: "Veranda afternoon" },
  { id: "fuji", ja: "富士山", en: "Mount Fuji at dawn" },
  { id: "torii", ja: "千本鳥居", en: "Torii gate tunnel" },
  { id: "seaTorii", ja: "海の鳥居", en: "Torii in the sea" },
  { id: "pagoda", ja: "五重塔", en: "Five-storey pagoda" },
  { id: "castle", ja: "城", en: "Castle and pine" },
  { id: "machiya", ja: "京町家", en: "Kyoto townhouses" },
  { id: "onsen", ja: "温泉", en: "Hot spring" },
  { id: "karesansui", ja: "枯山水", en: "Zen rock garden" },
  { id: "bamboo", ja: "竹林", en: "Bamboo grove" },
  { id: "shinkansen", ja: "新幹線", en: "Bullet train" },
  { id: "tanabata", ja: "七夕", en: "Tanabata wishes" },
  { id: "koi", ja: "鯉の池", en: "Koi pond" },
  { id: "yatai", ja: "屋台", en: "Ramen stall" },
  { id: "washitsu", ja: "和室", en: "Tatami room" },
  { id: "tanbo", ja: "田んぼ", en: "Rice terraces" },
  { id: "gassho", ja: "合掌造り", en: "Snowy thatched village" },
  { id: "neon", ja: "横丁", en: "Neon alley" },
  { id: "koinobori", ja: "鯉のぼり", en: "Carp streamers" },
  { id: "tsukimi", ja: "月見", en: "Moon viewing" },
  { id: "ukiyoe", ja: "浮世絵", en: "Woodblock wave" },
  { id: "space", ja: "宇宙", en: "Outer space" },
  { id: "ocean", ja: "海", en: "Ocean waves" },
  { id: "city", ja: "夜の街", en: "City at night" },
  { id: "mountains", ja: "山", en: "Mountains and forest" },
  { id: "washi", ja: "和紙", en: "Washi paper and ink" },
  { id: "cycling", ja: "自転車", en: "Riverside cycling" },
  { id: "kite", ja: "凧揚げ", en: "Kite flying" },
  { id: "enoden", ja: "江ノ電", en: "Seaside tram" },
  { id: "toro", ja: "灯籠流し", en: "Floating lanterns" },
  { id: "hotaru", ja: "蛍", en: "Fireflies" },
  { id: "kanransha", ja: "観覧車", en: "Ferris wheel" },
  { id: "aquarium", ja: "水族館", en: "Aquarium" },
  { id: "surf", ja: "波乗り", en: "Surfing" },
  { id: "balloon", ja: "熱気球", en: "Hot-air balloons" },
  { id: "ekiden", ja: "駅伝", en: "Ekiden relay" },
  { id: "undokai", ja: "運動会", en: "Sports day" },
  { id: "laundry", ja: "洗濯物", en: "Laundry day" },
  { id: "demae", ja: "出前", en: "Delivery scooter" },
  { id: "deer", ja: "奈良の鹿", en: "Nara deer" },
  { id: "unkai", ja: "雲海", en: "Sea of clouds" },
  { id: "camping", ja: "星空キャンプ", en: "Starry campsite" },
  { id: "ski", ja: "スキー場", en: "Ski slope" },
  { id: "dogWalk", ja: "犬の散歩", en: "Dog walk in the park" },
  { id: "manekineko", ja: "招き猫", en: "Lucky cats" },
  { id: "rainbow", ja: "雨上がり", en: "After the rain" },
  { id: "mochitsuki", ja: "餅つき", en: "Mochi pounding" },
  { id: "shishimai", ja: "獅子舞", en: "Lion dance" },
  { id: "ukai", ja: "鵜飼", en: "Cormorant fishing" },
  { id: "snowMonkey", ja: "雪猿の湯", en: "Snow monkeys" },
  { id: "tsurumai", ja: "丹頂鶴の舞", en: "Dancing cranes" },
  { id: "fujidana", ja: "藤棚", en: "Wisteria trellis" },
  { id: "chabatake", ja: "茶畑", en: "Tea fields" },
  { id: "furin", ja: "風鈴市", en: "Wind chimes" },
  { id: "kabuki", ja: "歌舞伎", en: "Kabuki stage" },
  { id: "taiko", ja: "和太鼓", en: "Taiko drummers" },
  { id: "takoyaki", ja: "たこ焼き", en: "Takoyaki stall" },
  { id: "gacha", ja: "ガチャガチャ", en: "Capsule toys" },
  { id: "shogi", ja: "将棋", en: "Shogi match" },
  { id: "library", ja: "図書館", en: "Library" },
  { id: "kissaten", ja: "喫茶店", en: "Retro coffee shop" },
  { id: "playground", ja: "公園の遊具", en: "Playground" },
  { id: "harvest", ja: "稲刈り", en: "Rice harvest" },
  { id: "harbor", ja: "漁港", en: "Fishing harbor" },
  { id: "yukimatsuri", ja: "雪まつり", en: "Snow festival" },
  { id: "origami", ja: "折り鶴", en: "Paper cranes" },
  { id: "tanuki", ja: "狸の森", en: "Tanuki in the wood" },
  { id: "kitsune", ja: "狐の嫁入り", en: "Fox wedding" },
  { id: "ninja", ja: "忍者", en: "Ninja rooftops" },
  { id: "ufo", ja: "田舎の夜空", en: "UFO over the fields" },
  { id: "whale", ja: "鯨", en: "Whale watching" },
  { id: "karakuri", ja: "からくり時計", en: "Clock tower dolls" },
  { id: "daruma", ja: "だるま市", en: "Daruma market" },
  { id: "yokai", ja: "百鬼夜行", en: "Yokai night" },
  { id: "stargaze", ja: "天体観測", en: "Stargazing" },
  { id: "beetle", ja: "昆虫採集", en: "Bug hunting" },
  { id: "dragon", ja: "龍", en: "Dragon in the storm" },
  { id: "ramen", ja: "ラーメン屋", en: "Ramen counter" },
  { id: "robot", ja: "ロボット工場", en: "Robot factory" },
  { id: "omikuji", ja: "おみくじ", en: "Fortune slips" },
  { id: "himawari", ja: "ひまわり畑", en: "Sunflower field" },
  { id: "kamishibai", ja: "紙芝居", en: "Picture-card show" },
  { id: "gust", ja: "強風", en: "Windy day" },
  { id: "ama", ja: "海女", en: "Ama divers" },
  { id: "starTrain", ja: "夜空の列車", en: "Night train to the stars" },
  { id: "seri", ja: "マグロの競り", en: "Tuna auction" },
];

const THEME_ORDER: readonly AmbienceTheme[] = AMBIENCE_THEMES.map((t) => t.id);

/**
 * Used when an item matches nothing — calm, season-free scenes, so items
 * with no signal still give plenty of variety.
 */
export const NEUTRAL_THEMES: readonly AmbienceTheme[] = [
  "washi",
  "space",
  "mountains",
  "ocean",
  "city",
  "fuji",
  "seaTorii",
  "pagoda",
  "castle",
  "karesansui",
  "bamboo",
  "koi",
  "tanbo",
  "ukiyoe",
  "machiya",
  "shodo",
  "sado",
  "engawa",
  "fishing",
  "trainWindow",
  "jihanki",
  "konbini",
  "radioTaiso",
  "kingyo",
  "bonOdori",
  "cycling",
  "kite",
  "enoden",
  "toro",
  "hotaru",
  "unkai",
  "balloon",
  "dogWalk",
  "rainbow",
  "laundry",
  "fujidana",
  "chabatake",
  "furin",
  "tsurumai",
  "harbor",
  "library",
  "kissaten",
  "origami",
  "yukimatsuri",
  "playground",
  "tanuki",
  "kitsune",
  "whale",
  "karakuri",
  "stargaze",
  "himawari",
  "starTrain",
  "ama",
  "kamishibai",
  "ninja",
];

export function ambienceThemeInfo(id: AmbienceTheme): AmbienceThemeInfo {
  return AMBIENCE_THEMES.find((t) => t.id === id) ?? AMBIENCE_THEMES[0]!;
}

interface ThemeRule {
  /** Japanese substrings. */
  ja: readonly string[];
  /** English whole words (lower case). A trailing `*` matches any ending. */
  en: readonly string[];
  /** Japanese substrings that must NOT count as a hit (e.g. 沢山 for 山). */
  jaExclude?: readonly string[];
  /** Subcategory / category names that belong to this theme. */
  categories: readonly string[];
}

const RULES: Record<AmbienceTheme, ThemeRule> = {
  spring: {
    ja: [
      "春",
      "桜",
      "花粉",
      "咲",
      "開花",
      "入学",
      "卒業",
      "新学期",
      "新入社員",
      "新生活",
      "芽",
    ],
    en: [
      "spring",
      "cherry",
      "blossom*",
      "bloom*",
      "flower*",
      "petal*",
      "graduat*",
      "pollen",
      "hay",
    ],
    jaExclude: ["温泉"],
    categories: [
      "Pregnancy & Childbirth",
      "Personality & Character",
      "Emotions",
      "Emotions & Attitudes",
    ],
  },
  summer: {
    ja: [
      "夏",
      "暑",
      "猛暑",
      "熱中症",
      "花火",
      "浴衣",
      "汗",
      "日焼",
      "冷房",
      "海水浴",
      "蚊",
      "スイカ",
      "かき氷",
      "扇風機",
      "晴",
    ],
    en: [
      "summer",
      "hot",
      "heat",
      "heatstroke",
      "sweat*",
      "firework*",
      "sunburn*",
      "sunscreen",
      "mosquito*",
      "watermelon",
      "vacation",
      "holiday*",
      "sunny",
      "sunshine",
      "sun",
    ],
    categories: [],
  },
  autumn: {
    ja: ["秋", "紅葉", "落ち葉", "実る", "実り", "枯", "栗", "食欲"],
    en: [
      "autumn",
      "maple",
      "leaf",
      "leaves",
      "chestnut*",
      "wither*",
      "ripe*",
      "appetite",
    ],
    categories: ["Change & Progression", "Changes & Trends"],
  },
  winter: {
    ja: [
      "冬",
      "雪",
      "寒",
      "凍",
      "氷",
      "暖房",
      "正月",
      "年末",
      "大晦日",
      "風邪",
      "こたつ",
      "毛布",
      "マフラー",
    ],
    en: [
      "winter",
      "snow*",
      "cold",
      "freez*",
      "frozen",
      "ice",
      "icy",
      "chilly",
      "flu",
      "heater",
      "blanket*",
      "scarf",
    ],
    jaExclude: [
      "かき氷",
      "雪国",
      "雪だるま",
      "雪合戦",
      "雪遊び",
      "雪まつり",
      "雪祭",
    ],
    categories: ["Clothing", "Home Appliances"],
  },
  rain: {
    ja: [
      "雨",
      "梅雨",
      "傘",
      "台風",
      "嵐",
      "雷",
      "洪水",
      "湿",
      "濡",
      "涙",
      "泣",
      "悲し",
      "寂し",
      "後悔",
      "葬",
      "災害",
      "地震",
    ],
    en: [
      "rain*",
      "umbrella*",
      "typhoon*",
      "storm*",
      "thunder*",
      "lightning",
      "flood*",
      "humid*",
      "wet",
      "damp",
      "tear",
      "tears",
      "cry",
      "cried",
      "crying",
      "sad",
      "sadness",
      "lonely",
      "regret*",
      "grief",
      "funeral*",
      "disaster*",
      "earthquake*",
    ],
    categories: [
      "Weather",
      "Weather & Climate",
      "Emergency Preparedness",
      "Accidents & Insurance",
      "Funerals & Bereavement",
      "Criticism, Regret & Reproach",
      "Warning & Caution",
      "Feelings & Moods",
      "Concession & Resignation",
      "Conflict & Relationships",
    ],
  },
  hanami: {
    ja: [
      "花見",
      "宴会",
      "乾杯",
      "ピクニック",
      "お弁当",
      "仲間",
      "友達",
      "友人",
      "パーティー",
    ],
    en: [
      "blossom viewing",
      "flower viewing",
      "picnic*",
      "party",
      "parties",
      "toast*",
      "cheers",
      "celebrat*",
      "friend*",
      "gathering*",
    ],
    categories: ["Friends & Social Life", "Relationships"],
  },
  bonOdori: {
    ja: ["盆", "踊", "帰省", "先祖", "浴衣"],
    en: [
      "dance*",
      "dancing",
      "danced",
      "obon",
      "ancestor*",
      "homecoming",
      "yukata",
    ],
    jaExclude: ["盆栽"],
    categories: ["Similarity & Equivalence"],
  },
  rushHour: {
    ja: ["通勤", "満員", "ラッシュ", "混雑", "遅刻", "並ぶ", "間に合"],
    en: ["commut*", "rush*", "crowded", "late", "queue*", "hurr*", "platform*"],
    categories: [
      "Time & Sequence",
      "Simultaneity & Sequence",
      "Timing & Opportunity",
      "Necessity & Obligation",
    ],
  },
  shodo: {
    ja: ["書道", "習字", "筆", "墨", "文字", "清書"],
    en: [
      "calligraph*",
      "brush*",
      "ink",
      "handwrit*",
      "character",
      "characters",
      "stroke*",
    ],
    categories: [
      "Formal Written Register",
      "Formal & Written Expressions",
      "Manner & Method",
    ],
  },
  sado: {
    ja: ["茶道", "抹茶", "茶", "お辞儀", "礼", "作法"],
    en: [
      "tea",
      "matcha",
      "ceremon*",
      "bow",
      "bowed",
      "bowing",
      "etiquette",
      "grace*",
      "elegan*",
    ],
    jaExclude: ["茶色", "喫茶", "茶畑", "茶摘み", "新茶"],
    categories: ["Etiquette", "Etiquette & Consideration"],
  },
  sumo: {
    ja: ["相撲", "力士", "土俵", "力", "強い", "重い", "押す", "体重", "横綱"],
    en: [
      "sumo",
      "wrestl*",
      "strength",
      "strong",
      "heavy",
      "weight*",
      "push*",
      "power*",
      "force*",
    ],
    jaExclude: ["協力", "魅力", "努力", "電力"],
    categories: ["Degree & Limit", "Degree & Extremity"],
  },
  mikoshi: {
    ja: ["神輿", "祭", "担ぐ", "掛け声", "法被", "盛り上"],
    en: [
      "festival*",
      "carry",
      "carried",
      "carrying",
      "shout*",
      "cheer*",
      "lively",
      "excit*",
    ],
    categories: ["Emphasis & Insistence"],
  },
  trainWindow: {
    ja: ["車窓", "旅行", "窓", "揺れ", "各駅", "乗客", "車内"],
    en: [
      "trip",
      "trips",
      "journey*",
      "window*",
      "passenger*",
      "ride",
      "riding",
    ],
    categories: ["Travel"],
  },
  konbini: {
    ja: [
      "コンビニ",
      "買い物",
      "便利",
      "支払",
      "払う",
      "店員",
      "レジ",
      "レシート",
      "弁当",
      "商品",
      "値段",
      "割引",
      "セール",
      "買",
    ],
    en: [
      "convenien*",
      "cashier*",
      "receipt*",
      "pay",
      "paid",
      "paying",
      "payment*",
      "purchase*",
      "buy",
      "buys",
      "buying",
      "bought",
      "shop",
      "shops",
      "shopping",
      "store*",
      "price*",
      "discount*",
      "sale*",
    ],
    categories: [
      "Shopping",
      "Money & Shopping",
      "Retail & Customer Service",
      "Postal Services",
      "Daily Actions",
    ],
  },
  jihanki: {
    ja: [
      "自販機",
      "自動販売機",
      "小銭",
      "硬貨",
      "百円",
      "缶",
      "飲み物",
      "夜道",
    ],
    en: ["vending", "coin*", "beverage*", "machine*", "automatic*"],
    categories: [],
  },
  scramble: {
    ja: [
      "交差点",
      "信号",
      "横断",
      "人混み",
      "渋谷",
      "通行",
      "歩行者",
      "大勢",
      "世間",
    ],
    en: [
      "crosswalk*",
      "crossing",
      "intersection*",
      "pedestrian*",
      "crowd*",
      "signal*",
      "public",
      "people",
    ],
    categories: [
      "Public Life",
      "Society & Public Life",
      "Traffic & Driving",
      "Perception & Reputation",
    ],
  },
  kendo: {
    ja: [
      "剣道",
      "稽古",
      "練習",
      "試合",
      "勝",
      "負",
      "武道",
      "竹刀",
      "挑戦",
      "努力",
      "頑張",
    ],
    en: [
      "kendo",
      "practice*",
      "practis*",
      "training",
      "match",
      "matches",
      "win",
      "wins",
      "winning",
      "won",
      "lose",
      "losing",
      "defeat*",
      "compet*",
      "martial",
      "effort*",
      "challeng*",
      "try",
      "tried",
      "attempt*",
    ],
    jaExclude: ["勝手", "負担"],
    categories: [
      "Volition & Effort",
      "Attempt & Trial",
      "Comparison & Contrast",
    ],
  },
  classroom: {
    ja: [
      "教室",
      "先生",
      "生徒",
      "学校",
      "学生",
      "授業",
      "黒板",
      "宿題",
      "試験",
      "テスト",
      "教え",
      "質問",
    ],
    en: [
      "classroom*",
      "teacher*",
      "teach*",
      "taught",
      "student*",
      "school*",
      "class",
      "classes",
      "exam*",
      "homework",
      "blackboard",
      "pupil*",
    ],
    categories: [
      "School",
      "School & Learning",
      "N2 Reading",
      "Passive & Causative",
    ],
  },
  fishing: {
    ja: ["釣", "川", "待つ", "待", "我慢", "辛抱", "のんびり"],
    en: [
      "fishing",
      "angler*",
      "wait",
      "waits",
      "waiting",
      "waited",
      "patien*",
      "rod",
    ],
    jaExclude: ["期待", "招待", "接待"],
    categories: ["Expectation & Result"],
  },
  kaitenSushi: {
    ja: ["寿司", "すし", "回転", "外食", "板前", "皿", "選ぶ", "選"],
    en: [
      "sushi",
      "plate*",
      "chef*",
      "choose",
      "chose",
      "chosen",
      "choice*",
      "select*",
      "prefer*",
    ],
    jaExclude: ["選挙"],
    categories: ["Dining Out", "Selection & Preference"],
  },
  kamakura: {
    ja: ["かまくら", "雪だるま", "雪遊び", "雪合戦", "遊"],
    en: [
      "snowman",
      "snowball*",
      "igloo*",
      "hut",
      "huts",
      "play",
      "plays",
      "playing",
      "played",
      "fun",
    ],
    categories: [],
  },
  kingyo: {
    ja: ["金魚", "すくう", "掬", "縁日", "夜店"],
    en: ["goldfish", "scoop*", "fair", "fairs", "catch*", "caught"],
    categories: ["Hobbies & Free Time"],
  },
  radioTaiso: {
    ja: [
      "体操",
      "運動",
      "朝",
      "早起き",
      "毎朝",
      "毎日",
      "習慣",
      "筋肉",
      "ストレッチ",
    ],
    en: [
      "exercise*",
      "stretch*",
      "morning*",
      "workout*",
      "fitness",
      "habit*",
      "routine*",
      "daily",
    ],
    jaExclude: ["運動会"],
    categories: [
      "Sports",
      "Fitness & Gym",
      "Habitual Actions & Recurring Patterns",
    ],
  },
  meishi: {
    ja: [
      "名刺",
      "挨拶",
      "取引",
      "商談",
      "営業",
      "担当",
      "紹介",
      "初対面",
      "確認",
    ],
    en: [
      "business card*",
      "client*",
      "greet*",
      "negotiat*",
      "sales",
      "introduc*",
      "confirm*",
      "colleague*",
    ],
    categories: [
      "Business Basics",
      "Office & Meetings",
      "Workplace Communication",
      "Job Hunting",
      "Networking",
      "Communication",
      "Confirmation & Certainty",
    ],
  },
  engawa: {
    ja: [
      "縁側",
      "祖母",
      "祖父",
      "おばあ",
      "おじい",
      "高齢",
      "老人",
      "猫",
      "風鈴",
      "昔",
      "懐かし",
      "日向",
    ],
    en: [
      "grandmother*",
      "grandma*",
      "grandfather*",
      "grandpa*",
      "elder*",
      "cat",
      "cats",
      "nostalg*",
      "veranda*",
      "advice",
      "advise*",
      "rumou*",
      "rumor*",
      "hearsay",
    ],
    jaExclude: ["招き猫"],
    categories: [
      "Aging & Elder Care",
      "Daily Vocabulary",
      "Advice & Recommendation",
      "Appearance & Hearsay",
    ],
  },
  fuji: {
    ja: [
      "富士",
      "日本一",
      "頂上",
      "景色",
      "眺め",
      "絶景",
      "日の出",
      "初日の出",
      "旅",
      "観光",
      "名所",
      "登山",
    ],
    en: [
      "fuji",
      "summit*",
      "peak*",
      "view",
      "views",
      "scenery",
      "sunrise",
      "landscape*",
      "travel*",
      "tourist*",
      "tourism",
      "sightseeing",
      "climb*",
    ],
    categories: ["Town & Travel", "Places", "Nature & Seasons"],
  },
  torii: {
    ja: [
      "神社",
      "鳥居",
      "参拝",
      "お参り",
      "神様",
      "祈",
      "お守り",
      "初詣",
      "縁起",
      "運",
      "結婚",
    ],
    en: [
      "shrine*",
      "pray*",
      "god",
      "gods",
      "luck",
      "lucky",
      "unlucky",
      "charm*",
      "worship*",
      "wedding*",
      "marry",
      "married",
      "marriage",
    ],
    jaExclude: ["運転", "運動", "運賃", "運送", "運営", "運ぶ", "運用", "運搬"],
    categories: ["Weddings & Ceremonies"],
  },
  seaTorii: {
    ja: ["宮島", "厳島", "干潮", "満潮", "潮", "海辺"],
    en: ["tide*", "floating", "shore*", "seaside"],
    categories: [],
  },
  pagoda: {
    ja: [
      "寺",
      "仏",
      "塔",
      "京都",
      "奈良",
      "伝統",
      "古都",
      "僧",
      "鐘",
      "文化財",
    ],
    en: [
      "temple*",
      "buddh*",
      "monk*",
      "kyoto",
      "nara",
      "tradition*",
      "bell*",
      "pagoda*",
      "heritage",
      "ancient",
    ],
    categories: ["Social Convention & Custom"],
  },
  castle: {
    ja: [
      "城",
      "武士",
      "侍",
      "歴史",
      "戦",
      "大名",
      "守る",
      "天守",
      "法律",
      "政府",
      "政治",
      "規則",
      "将軍",
    ],
    en: [
      "castle*",
      "samurai",
      "history",
      "historic*",
      "lord*",
      "war",
      "wars",
      "battle*",
      "defend*",
      "protect*",
      "warrior*",
      "law",
      "laws",
      "legal",
      "government*",
      "politic*",
      "rule",
      "rules",
      "shogun",
    ],
    categories: [
      "Government & Politics",
      "Rules & Compliance",
      "Insurance & Legal",
      "Crime & Public Safety",
      "Safety & Society",
    ],
  },
  machiya: {
    ja: [
      "町家",
      "民家",
      "住宅",
      "近所",
      "路地",
      "下町",
      "隣",
      "町並",
      "家賃",
      "引っ越",
      "大家",
      "提灯",
    ],
    en: [
      "neighbo*",
      "alley*",
      "townhouse*",
      "residen*",
      "rent",
      "rental",
      "landlord*",
      "lantern*",
      "moving",
    ],
    categories: ["Apartment", "Real Estate", "Housing Maintenance"],
  },
  onsen: {
    ja: [
      "温泉",
      "風呂",
      "銭湯",
      "湯",
      "健康",
      "癒",
      "疲",
      "休養",
      "回復",
      "治",
      "病院",
      "体調",
      "旅館",
    ],
    en: [
      "hot spring*",
      "onsen",
      "bath*",
      "relax*",
      "heal*",
      "recover*",
      "tired",
      "health*",
      "fatigue",
      "hospital*",
      "illness",
      "sick*",
      "inn",
    ],
    categories: [
      "Health",
      "Health & Body",
      "Body",
      "Body & Senses",
      "Body & Health",
      "Medicine",
    ],
  },
  karesansui: {
    ja: [
      "禅",
      "庭",
      "石",
      "静か",
      "落ち着",
      "集中",
      "心",
      "考え",
      "悟",
      "瞑想",
      "冷静",
      "判断",
    ],
    en: [
      "zen",
      "garden*",
      "calm*",
      "quiet*",
      "silence",
      "silent",
      "focus*",
      "mind",
      "minds",
      "think*",
      "thought*",
      "meditat*",
      "stone*",
      "rock*",
      "judg*",
      "decid*",
      "decision*",
    ],
    categories: [
      "Abstract Concepts",
      "Abstract",
      "Academic & Abstract",
      "Decisions & Problem Solving",
      "Judgement & Evaluation",
    ],
  },
  bamboo: {
    ja: [
      "竹",
      "嵐山",
      "筍",
      "たけのこ",
      "成長",
      "伸び",
      "真っ直ぐ",
      "しなやか",
    ],
    en: [
      "bamboo",
      "growth",
      "straight",
      "flexib*",
      "wind",
      "windy",
      "improv*",
      "progress*",
    ],
    categories: ["Continuity & Persistence"],
  },
  shinkansen: {
    ja: [
      "新幹線",
      "特急",
      "電車",
      "駅",
      "地下鉄",
      "乗り換え",
      "時速",
      "出発",
      "到着",
      "時刻",
      "定刻",
      "遅延",
      "線路",
      "終電",
      "改札",
    ],
    en: [
      "bullet",
      "express",
      "train*",
      "station*",
      "subway",
      "fast",
      "speed*",
      "depart*",
      "arriv*",
      "punctual*",
      "schedule*",
      "railway*",
    ],
    categories: [
      "Transportation",
      "Trains & Journeys",
      "Quality & Manufacturing",
      "Time Management",
    ],
  },
  tanabata: {
    ja: ["七夕", "願", "天の川", "短冊", "夢", "希望", "祈願", "目標"],
    en: ["wish*", "hope*", "milky", "tanabata", "dream*", "goal*", "aim*"],
    categories: [
      "Purpose & Intention",
      "Purpose, Tendency & Formal Expression",
    ],
  },
  koi: {
    ja: ["鯉", "池", "錦", "泳"],
    en: ["koi", "carp", "pond*", "swim*"],
    jaExclude: ["鯉のぼり", "水族館"],
    categories: ["Nature & Animals"],
  },
  yatai: {
    ja: [
      "屋台",
      "食",
      "料理",
      "飲",
      "酒",
      "味",
      "美味",
      "夕飯",
      "外食",
      "居酒屋",
      "焼き鳥",
      "注文",
      "定食",
    ],
    en: [
      "food*",
      "eat",
      "eats",
      "eating",
      "ate",
      "meal*",
      "dinner*",
      "lunch*",
      "drink*",
      "taste*",
      "tasty",
      "delicious",
      "restaurant*",
      "cook*",
      "stall*",
      "izakaya",
      "order*",
    ],
    categories: ["Food", "Food & Cooking", "Cooking", "Kitchen Equipment"],
  },
  washitsu: {
    ja: [
      "和室",
      "畳",
      "障子",
      "襖",
      "床の間",
      "部屋",
      "正座",
      "客間",
      "掃除",
      "片付",
      "おもてなし",
    ],
    en: [
      "room",
      "rooms",
      "tatami",
      "guest*",
      "tidy*",
      "clean*",
      "hospitality",
      "polite*",
      "manners",
    ],
    categories: [
      "Home",
      "Rooms & Household Items",
      "Home & Chores",
      "Honorific & Humble Expressions",
    ],
  },
  tanbo: {
    ja: ["田んぼ", "田舎", "米", "稲", "農", "畑", "村", "野菜"],
    en: [
      "rice",
      "paddy",
      "paddies",
      "farm*",
      "crop*",
      "agricultur*",
      "countryside",
      "village*",
      "vegetable*",
      "rural",
    ],
    jaExclude: ["稲刈り"],
    categories: ["Environment", "Environment & Sustainability"],
  },
  gassho: {
    ja: [
      "合掌",
      "白川郷",
      "雪国",
      "屋根",
      "豪雪",
      "囲炉裏",
      "協力",
      "助け合",
      "地域",
      "ボランティア",
      "支え",
    ],
    en: [
      "roof*",
      "cooperat*",
      "together",
      "community",
      "communities",
      "volunteer*",
      "support*",
      "local",
      "region*",
    ],
    categories: ["Community", "Volunteering & Charity"],
  },
  neon: {
    ja: [
      "看板",
      "ネオン",
      "カラオケ",
      "ゲーム",
      "流行",
      "若者",
      "広告",
      "宣伝",
      "繁華街",
      "飲み会",
      "テレビ",
      "番組",
      "ニュース",
      "新聞",
      "雑誌",
      "映画",
    ],
    en: [
      "neon",
      "karaoke",
      "game*",
      "trend*",
      "advertis*",
      "ads",
      "nightlife",
      "sign",
      "signs",
      "entertainment",
      "fashion*",
      "tv",
      "television",
      "news",
      "newspaper*",
      "magazine*",
      "movie*",
      "film*",
      "media",
    ],
    categories: [
      "Media",
      "News & Media",
      "Media & News",
      "Fashion",
      "Arts & Entertainment",
    ],
  },
  koinobori: {
    ja: [
      "鯉のぼり",
      "こどもの日",
      "子供",
      "子ども",
      "息子",
      "娘",
      "家族",
      "親",
      "育児",
      "赤ちゃん",
      "誕生",
      "出産",
      "兄弟",
    ],
    en: [
      "child*",
      "kid",
      "kids",
      "son",
      "sons",
      "daughter*",
      "family",
      "families",
      "parent*",
      "baby",
      "babies",
      "birth*",
      "born",
      "newborn",
      "brother*",
      "sister*",
      "sibling*",
    ],
    categories: ["Childcare", "Family", "Family & Relationships"],
  },
  tsukimi: {
    ja: [
      "月見",
      "満月",
      "三日月",
      "月光",
      "団子",
      "眠",
      "寝",
      "睡眠",
      "兎",
      "うさぎ",
      "ススキ",
      "夜空",
    ],
    en: [
      "moon",
      "moonlight",
      "full moon",
      "sleep*",
      "slept",
      "asleep",
      "bedtime",
      "dango",
      "rabbit*",
      "insomnia",
      "nap*",
    ],
    categories: ["Sleep & Rest"],
  },
  ukiyoe: {
    ja: ["浮世絵", "版画", "絵", "芸術", "江戸", "北斎", "画家", "美術", "波"],
    en: [
      "woodblock",
      "print",
      "prints",
      "painting*",
      "painter*",
      "art",
      "arts",
      "artist*",
      "museum*",
      "edo",
      "wave",
      "waves",
      "drawing*",
    ],
    jaExclude: ["電波", "絵文字"],
    categories: ["Art & Culture"],
  },
  space: {
    ja: [
      "宇宙",
      "星",
      "惑星",
      "地球",
      "衛星",
      "科学",
      "研究",
      "実験",
      "技術",
      "未来",
      "データ",
      "デジタル",
      "ネット",
      "パソコン",
      "スマホ",
      "発明",
      "人工知能",
      "理論",
      "電波",
    ],
    en: [
      "universe",
      "star",
      "stars",
      "planet*",
      "galaxy",
      "satellite*",
      "rocket*",
      "astronaut*",
      "science",
      "scientific",
      "scientist*",
      "research*",
      "experiment*",
      "technolog*",
      "digital",
      "data",
      "computer*",
      "internet",
      "online",
      "software",
      "ai",
      "future",
      "invent*",
      "innovation*",
      "theory",
      "hypothes*",
      "smartphone*",
    ],
    jaExclude: ["宇宙人"],
    categories: [
      "Science & Tech",
      "Science & Technology",
      "Technology",
      "Technology & Science",
      "Innovation & AI",
      "Research & Data",
      "Earth & Science",
      "Digital Security & Privacy",
      "Possibility & Prediction",
      "Inference & Speculation",
      "Assumption & Hypothetical",
      "Numbers",
      "Quantity & Extent",
    ],
  },
  ocean: {
    ja: ["海", "港", "船", "島", "魚", "浜", "湖", "海外"],
    en: [
      "sea",
      "ocean*",
      "beach*",
      "coast*",
      "port",
      "ship*",
      "boat*",
      "island*",
      "fish*",
      "lake*",
      "river*",
      "overseas",
      "abroad",
      "voyage*",
    ],
    jaExclude: ["海辺", "雲海", "漁港"],
    categories: [],
  },
  city: {
    ja: [
      "都会",
      "会社",
      "社員",
      "残業",
      "出張",
      "会議",
      "上司",
      "給料",
      "店",
      "渋滞",
      "ビル",
      "夜景",
      "夜中",
      "深夜",
      "交通",
      "客",
    ],
    en: [
      "city",
      "town",
      "urban",
      "office*",
      "company",
      "companies",
      "overtime",
      "meeting*",
      "boss",
      "salary",
      "customer*",
      "traffic",
      "building*",
      "downtown",
      "night",
      "street*",
      "business*",
    ],
    categories: [
      "Work",
      "Work & Business",
      "Work & Money",
      "Business",
      "Society",
      "Society & Public Affairs",
      "Money",
      "Economy & Business",
      "Banking & Investment",
      "Personal Finance",
      "Employment Conditions",
      "Public Facilities",
    ],
  },
  mountains: {
    ja: [
      "山",
      "森",
      "林",
      "樹",
      "草",
      "自然",
      "環境",
      "動物",
      "鳥",
      "植物",
      "公園",
      "緑",
      "空気",
    ],
    en: [
      "mountain*",
      "forest*",
      "woods",
      "tree",
      "trees",
      "nature",
      "natural",
      "environment*",
      "animal*",
      "bird*",
      "plant",
      "plants",
      "hike",
      "hiking",
      "field*",
      "park",
      "parks",
      "green",
      "wildlife",
    ],
    jaExclude: ["沢山", "富士山", "登山", "山頂"],
    categories: ["Nature"],
  },
  washi: {
    ja: [
      "勉強",
      "大学",
      "学習",
      "学ぶ",
      "留学",
      "読書",
      "本屋",
      "書く",
      "書類",
      "手紙",
      "漢字",
      "言葉",
      "日本語",
      "作文",
      "論文",
      "意見",
      "敬語",
    ],
    en: [
      "study",
      "studies",
      "studying",
      "studied",
      "learn*",
      "lesson*",
      "book",
      "books",
      "read",
      "reading",
      "write",
      "writing",
      "letter*",
      "language*",
      "kanji",
      "essay*",
      "report*",
      "document*",
      "opinion*",
      "argument*",
      "knowledge",
      "honorific*",
    ],
    categories: [
      "Language Learning",
      "Academic Reading",
      "Opinions & Arguments",
      "Questions",
      "Summary & Conclusion",
      "Work & School",
    ],
  },
  cycling: {
    ja: ["自転車", "ペダル", "坂道", "サイクリング", "漕"],
    en: ["bicycle*", "bike", "bikes", "cycl*", "pedal*"],
    categories: ["Daily Actions", "Common Verbs", "Town & Travel"],
  },
  kite: {
    ja: ["凧", "揚げ", "飛ば", "飛ぶ", "飛ん", "空高"],
    en: ["kite*", "fly", "flies", "flying", "flew", "soar*"],
    jaExclude: ["唐揚げ", "飛行機"],
    categories: ["N2 Reading", "Common Adjectives", "Adjectives", "Family"],
  },
  enoden: {
    ja: ["江ノ電", "路面電車", "踏切", "鎌倉", "単線", "沿線"],
    en: ["tram*", "streetcar*", "kamakura", "level crossing", "railroad*"],
    categories: ["Travel", "Transportation", "Trains & Journeys"],
  },
  toro: {
    ja: ["灯籠", "流す", "流れ", "流され", "供養", "静か", "思い出"],
    en: [
      "float*",
      "drift*",
      "flow",
      "flows",
      "flowing",
      "stream*",
      "memor*",
      "remember*",
      "lantern*",
    ],
    jaExclude: ["流行"],
    categories: ["Abstract Concepts", "State & Condition", "Feelings & Moods"],
  },
  hotaru: {
    ja: ["蛍", "光る", "光", "輝", "きらきら", "夏の夜"],
    en: [
      "firefl*",
      "glow*",
      "shine",
      "shines",
      "shining",
      "sparkl*",
      "twinkl*",
      "bright*",
      "light",
      "lights",
    ],
    jaExclude: ["観光", "光景", "日光"],
    categories: ["Nature", "Nature & Animals", "Environment"],
  },
  kanransha: {
    ja: ["観覧車", "遊園地", "回る", "回し", "デート", "恋人", "夜景"],
    en: ["ferris", "amusement", "date", "dating", "rotat*", "spin*", "romant*"],
    categories: [
      "Science & Tech",
      "Media",
      "Time",
      "Appearance & Impression",
      "Relationships",
    ],
  },
  aquarium: {
    ja: ["水族館", "クラゲ", "水槽", "深海", "潜"],
    en: [
      "aquarium*",
      "jellyfish",
      "deep",
      "dive*",
      "diving",
      "underwater",
      "marine",
    ],
    categories: [
      "Science & Technology",
      "Technology",
      "Scope & Reference",
      "Research & Data",
    ],
  },
  surf: {
    ja: ["サーフィン", "波乗り", "湘南", "ビーチ", "バランス"],
    en: ["surf*", "balanc*", "board", "wave", "waves"],
    categories: [
      "Travel",
      "Hobbies & Free Time",
      "Sports",
      "Concession & Contrast",
      "Common Adjectives",
    ],
  },
  balloon: {
    ja: ["気球", "風船", "浮か", "浮く", "上昇", "増え", "増加", "膨ら"],
    en: [
      "balloon*",
      "rise",
      "rises",
      "rising",
      "risen",
      "increas*",
      "inflat*",
      "upward*",
    ],
    jaExclude: ["浮世絵"],
    categories: [
      "N2 Reading",
      "Emotions",
      "Change & Progression",
      "Adjectives",
      "Assumption & Hypothetical",
    ],
  },
  ekiden: {
    ja: ["駅伝", "マラソン", "走る", "走っ", "走り", "選手", "応援", "リレー"],
    en: [
      "run",
      "runs",
      "running",
      "ran",
      "runner*",
      "marathon*",
      "relay*",
      "athlete*",
      "race",
      "races",
    ],
    categories: [
      "Sports",
      "Time & Sequence",
      "Public Life",
      "Society & Public Life",
    ],
  },
  undokai: {
    ja: ["運動会", "綱引き", "玉入れ", "紅白", "引っ張", "チーム"],
    en: ["sports day", "tug", "pull", "pulled", "pulling", "pulls", "team*"],
    categories: ["Numbers", "Family", "Addition & Emphasis", "Fitness & Gym"],
  },
  laundry: {
    ja: [
      "洗濯",
      "干す",
      "干し",
      "乾",
      "ベランダ",
      "布団",
      "タオル",
      "シャツ",
      "洗う",
    ],
    en: [
      "laundry",
      "wash",
      "washes",
      "washing",
      "washed",
      "dry",
      "dried",
      "drying",
      "towel*",
      "shirt*",
      "futon*",
      "balcon*",
    ],
    categories: [
      "Daily Vocabulary",
      "Daily Actions",
      "Home & Chores",
      "Rooms & Household Items",
    ],
  },
  demae: {
    ja: ["出前", "配達", "届", "宅配", "バイク", "運ぶ", "送る", "郵便"],
    en: [
      "deliver*",
      "motorbike*",
      "scooter*",
      "package*",
      "parcel*",
      "courier*",
      "send",
      "sent",
      "mail",
    ],
    categories: ["Daily Actions", "Postal Services", "Public Life", "Work"],
  },
  deer: {
    ja: ["鹿", "奈良", "せんべい", "お辞儀"],
    en: ["deer", "nara", "fawn*", "antler*"],
    categories: ["Nature", "Reason & Grounds", "Social Convention & Custom"],
  },
  unkai: {
    ja: ["雲", "雲海", "夜明け", "山頂", "霧", "朝日", "見下ろ"],
    en: ["cloud*", "fog*", "mist*", "dawn", "horizon*", "beyond", "above"],
    categories: [
      "Abstract Concepts",
      "Nature",
      "Possibility & Prediction",
      "Change & Progression",
    ],
  },
  camping: {
    ja: ["キャンプ", "テント", "焚き火", "火", "星空", "野外", "アウトドア"],
    en: [
      "camp",
      "camps",
      "camping",
      "tent*",
      "fire",
      "fires",
      "campfire*",
      "bonfire*",
      "outdoor*",
    ],
    jaExclude: ["花火", "火曜", "火事", "火災"],
    categories: ["Hobbies & Free Time", "Inference & Speculation"],
  },
  ski: {
    ja: [
      "スキー",
      "スノーボード",
      "ゲレンデ",
      "滑る",
      "滑っ",
      "リフト",
      "斜面",
    ],
    en: [
      "ski",
      "skis",
      "skiing",
      "skier*",
      "slide*",
      "slid",
      "slip*",
      "slope*",
      "lift",
      "lifts",
    ],
    categories: ["Sports", "Fitness & Gym", "Weather & Climate"],
  },
  dogWalk: {
    ja: ["犬", "散歩", "ペット", "飼", "子犬", "公園"],
    en: [
      "dog",
      "dogs",
      "puppy",
      "puppies",
      "pet",
      "pets",
      "walk",
      "walks",
      "walking",
      "walked",
      "leash",
    ],
    categories: [
      "Daily Vocabulary",
      "Health",
      "Nature & Animals",
      "Health & Body",
    ],
  },
  manekineko: {
    ja: ["招き猫", "商売", "繁盛", "招", "開店", "儲", "売上", "利益", "経営"],
    en: [
      "profit*",
      "earn*",
      "earning*",
      "welcom*",
      "invit*",
      "prosper*",
      "revenue*",
      "fortune",
      "beckoning",
      "lucky cat*",
    ],
    categories: [
      "Business Basics",
      "Money",
      "Personal Finance",
      "Banking & Investment",
      "Economy & Business",
    ],
  },
  rainbow: {
    ja: ["虹", "雨上がり", "水たまり", "長靴", "カッパ", "跳"],
    en: [
      "rainbow*",
      "puddle*",
      "jump*",
      "splash*",
      "boots",
      "raincoat*",
      "hop",
      "hopped",
      "hopping",
    ],
    categories: [
      "Daily Vocabulary",
      "Weather",
      "Emotions",
      "Condition & Cause",
    ],
  },
  mochitsuki: {
    ja: ["餅", "杵", "臼", "お正月", "新年", "お祝い", "祝"],
    en: ["mochi", "rice cake*", "pound*", "new year*"],
    categories: [
      "Daily Actions",
      "Common Verbs",
      "Family",
      "Food & Cooking",
      "Social Convention & Custom",
      "Degree & Limit",
      "Volition & Effort",
    ],
  },
  shishimai: {
    ja: ["獅子", "魔除", "厄", "舞"],
    en: ["lion*", "bite*", "biting", "bit", "ward off"],
    jaExclude: ["お見舞", "見舞"],
    categories: [
      "Arts & Entertainment",
      "Art & Culture",
      "Social Convention & Custom",
    ],
  },
  ukai: {
    ja: ["鵜", "篝火", "漁師", "漁", "松明", "長良"],
    en: ["cormorant*", "torch*", "fisherm*", "flame*", "blaze*"],
    jaExclude: ["漁港", "漁船"],
    categories: ["Travel", "Inference & Speculation", "Tradition"],
  },
  snowMonkey: {
    ja: ["猿", "サル", "露天", "地獄谷", "温まる", "温め"],
    en: ["monkey*", "ape", "apes", "warm", "warmer", "warmth", "warming"],
    categories: ["Nature", "Health", "State & Condition", "Weather & Climate"],
  },
  tsurumai: {
    ja: ["鶴", "丹頂", "北海道", "優雅", "舞う", "羽"],
    en: ["crane", "cranes", "wing*", "feather*", "hokkaido", "graceful"],
    jaExclude: ["折り鶴", "千羽"],
    categories: ["Nature", "Abstract Concepts", "Nature & Animals"],
  },
  fujidana: {
    ja: ["藤", "紫", "棚", "蜂", "咲き誇", "垂れ"],
    en: [
      "wisteria",
      "purple",
      "violet",
      "bee",
      "bees",
      "trellis",
      "hang",
      "hangs",
      "hanging",
      "hung",
    ],
    jaExclude: ["紫外線", "本棚"],
    categories: ["Nature", "Adjectives", "Emotions"],
  },
  chabatake: {
    ja: ["茶畑", "茶摘み", "新茶", "静岡", "緑茶", "摘む", "摘ん"],
    en: [
      "tea field*",
      "green tea",
      "pick",
      "picks",
      "picking",
      "picked",
      "tea leaves",
    ],
    categories: [
      "Food",
      "Environment",
      "Adjectives",
      "Environment & Sustainability",
    ],
  },
  furin: {
    ja: ["風鈴", "涼しい", "涼", "鈴", "音色", "ガラス", "そよ風", "響"],
    en: [
      "chime*",
      "breeze*",
      "glass*",
      "cool",
      "cooler",
      "coolness",
      "sound",
      "sounds",
    ],
    categories: [
      "Common Adjectives",
      "Emotions",
      "Weather",
      "Concession & Resignation",
    ],
  },
  kabuki: {
    ja: ["歌舞伎", "舞台", "役者", "芝居", "劇", "演じ", "演技", "幕", "拍手"],
    jaExclude: ["紙芝居"],
    en: [
      "kabuki",
      "stage",
      "stages",
      "actor*",
      "actress*",
      "theater*",
      "theatre*",
      "perform*",
      "curtain*",
      "drama*",
      "applau*",
    ],
    categories: [
      "Media",
      "Arts & Entertainment",
      "Appearance & Impression",
      "Abstract Concepts",
    ],
  },
  taiko: {
    ja: ["太鼓", "叩", "リズム", "鼓動", "打つ"],
    en: [
      "drum*",
      "beat",
      "beats",
      "beating",
      "rhythm*",
      "taiko",
      "hit",
      "hits",
      "hitting",
      "strike*",
      "struck",
    ],
    categories: [
      "Public Life",
      "Time",
      "Emphasis & Insistence",
      "Necessity & Obligation",
    ],
  },
  takoyaki: {
    ja: ["たこ焼き", "蛸", "タコ", "焼く", "焼き", "大阪", "関西", "ソース"],
    en: [
      "takoyaki",
      "octopus",
      "grill*",
      "bake*",
      "baking",
      "osaka",
      "kansai",
      "sauce*",
      "fry",
      "fried",
    ],
    jaExclude: ["日焼"],
    categories: [
      "Daily Vocabulary",
      "Daily Actions",
      "Food & Cooking",
      "Cooking",
      "Dining Out",
    ],
  },
  gacha: {
    ja: [
      "ガチャ",
      "カプセル",
      "おもちゃ",
      "駄菓子",
      "玩具",
      "当たり",
      "くじ",
      "景品",
    ],
    en: [
      "capsule*",
      "toy",
      "toys",
      "candy",
      "candies",
      "sweets",
      "prize*",
      "lottery",
      "random*",
    ],
    categories: [
      "Daily Vocabulary",
      "Hobbies & Free Time",
      "Science & Tech",
      "Possibility & Prediction",
    ],
  },
  shogi: {
    ja: ["将棋", "駒", "盤", "対局", "戦略", "囲碁", "碁", "一手", "勝負"],
    en: [
      "shogi",
      "chess",
      "strateg*",
      "tactic*",
      "opponent*",
      "piece",
      "pieces",
      "move",
      "moves",
      "moved",
    ],
    categories: [
      "Position",
      "Business Basics",
      "Hobbies & Free Time",
      "Judgement & Evaluation",
      "Comparison & Contrast",
      "Inference & Speculation",
    ],
  },
  library: {
    ja: [
      "図書館",
      "図書",
      "本棚",
      "司書",
      "借り",
      "返却",
      "辞書",
      "小説",
      "物語",
      "文学",
      "調べ",
    ],
    en: [
      "library",
      "librar*",
      "novel*",
      "story",
      "stories",
      "dictionar*",
      "borrow*",
      "literature",
    ],
    jaExclude: ["借金"],
    categories: [
      "N2 Reading",
      "Media",
      "Reason & Grounds",
      "Language Learning",
      "Academic Reading",
    ],
  },
  kissaten: {
    ja: ["喫茶", "コーヒー", "珈琲", "カフェ", "紅茶", "休憩", "待ち合わせ"],
    en: ["coffee", "cafe*", "café", "latte", "espresso", "tea break"],
    categories: [
      "N2 Reading",
      "Time",
      "Hobbies & Free Time",
      "Habitual Actions & Recurring Patterns",
      "Advice & Recommendation",
    ],
  },
  playground: {
    ja: [
      "ブランコ",
      "滑り台",
      "シーソー",
      "砂場",
      "遊具",
      "公園",
      "遊ぶ",
      "遊ん",
    ],
    en: [
      "playground*",
      "swing",
      "swings",
      "swinging",
      "seesaw*",
      "sandbox*",
      "jungle gym",
    ],
    categories: [
      "Common Adjectives",
      "Common Verbs",
      "Family",
      "Position",
      "Childcare",
    ],
  },
  harvest: {
    ja: ["稲刈り", "収穫", "案山子", "かかし", "豊作", "刈", "実り"],
    en: ["harvest*", "scarecrow*", "reap*", "grain*", "wheat", "sickle*"],
    categories: [
      "Work",
      "Environment",
      "Result & Consequence",
      "Expectation & Result",
    ],
  },
  harbor: {
    ja: [
      "漁港",
      "漁船",
      "港町",
      "魚市場",
      "出港",
      "船乗り",
      "貿易",
      "輸出",
      "輸入",
    ],
    en: [
      "harbor*",
      "harbour*",
      "fishing boat*",
      "trade",
      "trading",
      "export*",
      "import*",
      "cargo",
      "sailor*",
      "fishing port*",
    ],
    categories: ["Work", "Business Basics", "Economy & Business", "Travel"],
  },
  yukimatsuri: {
    ja: ["雪まつり", "雪祭", "氷像", "札幌", "彫刻", "像", "イルミネーション"],
    en: ["sculpt*", "statue*", "illuminat*", "sapporo", "snow festival"],
    jaExclude: ["想像", "映像", "画像", "現像", "銅像以外"],
    categories: ["Public Life", "Travel", "Society & Public Life"],
  },
  origami: {
    ja: ["折り紙", "折り鶴", "折る", "折っ", "千羽", "紙"],
    en: ["origami", "fold", "folds", "folding", "folded", "paper", "papers"],
    jaExclude: ["手紙", "紙芝居"],
    categories: [
      "Abstract Concepts",
      "Emotions",
      "Purpose & Intention",
      "Similarity & Equivalence",
      "Common Adjectives",
    ],
  },
  tanuki: {
    ja: [
      "狸",
      "たぬき",
      "タヌキ",
      "化け",
      "化かす",
      "騙",
      "偽",
      "正体",
      "変身",
      "ふり",
      "振り",
    ],
    en: [
      "raccoon*",
      "tanuki",
      "trick*",
      "pretend*",
      "disguis*",
      "fake*",
      "deceiv*",
      "fool*",
    ],
    jaExclude: ["お化け", "振り返", "振り込"],
    categories: [
      "Appearance & Impression",
      "Appearance & Hearsay",
      "Contradiction & Paradox",
    ],
  },
  kitsune: {
    ja: [
      "狐",
      "キツネ",
      "嫁",
      "花嫁",
      "結婚",
      "婚約",
      "天気雨",
      "不思議",
      "神秘",
    ],
    en: ["fox", "foxes", "bride*", "wedding*", "marr*", "mysterious", "wonder"],
    categories: ["Weddings & Ceremonies", "Family & Relationships"],
  },
  ninja: {
    ja: ["忍", "隠", "秘密", "密か", "こっそり", "内緒", "素早"],
    en: [
      "ninja*",
      "hide",
      "hides",
      "hid",
      "hidden",
      "hiding",
      "secret*",
      "sneak*",
      "stealth*",
      "swift*",
    ],
    jaExclude: ["忍耐"],
    categories: [
      "Digital Security & Privacy",
      "Crime & Public Safety",
      "Safety & Society",
    ],
  },
  ufo: {
    ja: ["宇宙人", "未確認", "謎", "突然", "急に", "奇妙", "不明", "正体不明"],
    en: [
      "alien*",
      "ufo*",
      "strange*",
      "sudden*",
      "weird*",
      "odd",
      "unknown",
      "mystery",
    ],
    categories: ["Expectation & Result", "Assumption & Hypothetical"],
  },
  whale: {
    ja: ["鯨", "クジラ", "巨大", "莫大", "膨大", "イルカ", "海面"],
    en: ["whale*", "huge", "giant*", "enormous", "vast", "massive", "dolphin*"],
    categories: ["Quantity & Extent", "Degree & Extremity", "Degree & Limit"],
  },
  karakuri: {
    ja: [
      "時計",
      "からくり",
      "仕組み",
      "仕掛け",
      "歯車",
      "正確",
      "定刻",
      "機構",
      "人形",
    ],
    en: [
      "clock*",
      "mechanism*",
      "gear*",
      "precise*",
      "precision",
      "punctual*",
      "doll*",
      "o'clock",
    ],
    categories: [
      "Time",
      "Time Management",
      "Time & Sequence",
      "Timing & Opportunity",
      "Simultaneity & Sequence",
    ],
  },
  daruma: {
    ja: [
      "だるま",
      "達磨",
      "目標",
      "諦め",
      "粘",
      "合格",
      "必勝",
      "挑戦",
      "努力",
      "頑張",
      "転ぶ",
    ],
    en: [
      "daruma",
      "goal*",
      "persever*",
      "persist*",
      "challeng*",
      "effort*",
      "determin*",
      "give up",
      "gave up",
      "fall down",
    ],
    categories: [
      "Volition & Effort",
      "Continuity & Persistence",
      "Attempt & Trial",
      "Expectation & Result",
    ],
  },
  yokai: {
    ja: [
      "妖怪",
      "お化け",
      "化け物",
      "幽霊",
      "怖",
      "恐ろし",
      "恐怖",
      "不気味",
      "気味",
      "怪",
    ],
    en: [
      "ghost*",
      "monster*",
      "scare",
      "scared",
      "scary",
      "fear*",
      "afraid",
      "spook*",
      "creep*",
      "haunt*",
    ],
    jaExclude: ["怪我", "恐縮", "恐れ入"],
    categories: [
      "Warning & Caution",
      "Character & Feelings",
      "Emotions & Attitudes",
    ],
  },
  stargaze: {
    ja: ["観測", "望遠鏡", "流れ星", "天体", "星座", "観察", "発見", "夜空"],
    en: [
      "observ*",
      "telescope*",
      "meteor*",
      "constellation*",
      "discover*",
      "stargaz*",
      "shooting star*",
    ],
    categories: [
      "Earth & Science",
      "Research & Data",
      "Possibility & Prediction",
    ],
  },
  beetle: {
    ja: [
      "虫",
      "昆虫",
      "カブト",
      "クワガタ",
      "捕まえ",
      "捕まる",
      "捕",
      "蝉",
      "セミ",
      "網",
    ],
    en: [
      "insect*",
      "bug",
      "bugs",
      "beetle*",
      "catch",
      "catches",
      "catching",
      "caught",
      "cicada*",
      "butterfl*",
    ],
    jaExclude: ["逮捕", "泣き虫", "虫歯"],
    categories: ["Hobbies & Free Time", "Nature & Animals", "Childcare"],
  },
  dragon: {
    ja: ["龍", "竜", "稲妻", "勢い", "迫力", "威力", "強力", "昇", "伝説の"],
    en: [
      "dragon*",
      "mighty",
      "powerful",
      "power",
      "force*",
      "legendary",
      "rise",
      "rising",
    ],
    categories: [
      "Changes & Trends",
      "Degree & Extremity",
      "Emphasis & Insistence",
      "Exaggeration & Understatement",
    ],
  },
  ramen: {
    ja: [
      "ラーメン",
      "麺",
      "替え玉",
      "スープ",
      "すする",
      "啜",
      "大盛",
      "うどん",
      "そば",
    ],
    en: ["ramen", "noodle*", "soup*", "slurp*", "broth", "udon", "soba"],
    categories: ["Dining Out", "Food", "Cooking"],
  },
  robot: {
    ja: [
      "ロボット",
      "機械",
      "工場",
      "自動",
      "製造",
      "製品",
      "生産",
      "組み立て",
      "組立",
      "部品",
    ],
    en: [
      "robot*",
      "machine*",
      "factory",
      "factories",
      "automat*",
      "manufactur*",
      "product",
      "products",
      "production",
      "assembl*",
      "part",
      "parts",
    ],
    categories: [
      "Science & Tech",
      "Innovation & AI",
      "Quality & Manufacturing",
      "Technology",
    ],
  },
  omikuji: {
    ja: [
      "おみくじ",
      "占",
      "吉",
      "運命",
      "幸運",
      "予想",
      "予測",
      "将来",
      "縁起",
    ],
    en: [
      "fortune*",
      "fate*",
      "destiny",
      "predict*",
      "forecast*",
      "prophec*",
      "omen*",
    ],
    jaExclude: ["不吉"],
    categories: [
      "Possibility & Prediction",
      "Inference & Speculation",
      "Assumption & Hypothetical",
    ],
  },
  himawari: {
    ja: [
      "向日葵",
      "ひまわり",
      "太陽",
      "日差し",
      "明るい",
      "元気",
      "眩し",
      "日光",
      "陽気",
    ],
    en: [
      "sunflower*",
      "sun",
      "sunny",
      "sunshine",
      "sunlight",
      "bright*",
      "cheer*",
      "energetic",
      "lively",
    ],
    categories: [
      "Nature & Seasons",
      "Emotions & Attitudes",
      "Personality & Character",
      "Feelings & Moods",
    ],
  },
  kamishibai: {
    ja: [
      "紙芝居",
      "物語",
      "昔話",
      "伝説",
      "語る",
      "語り",
      "童話",
      "絵本",
      "話し手",
    ],
    en: [
      "story",
      "stories",
      "storytell*",
      "tale",
      "tales",
      "legend*",
      "narrat*",
      "fairy",
      "picture book*",
      "picture-card*",
      "kamishibai",
    ],
    categories: [
      "Childcare",
      "Arts & Entertainment",
      "Listing & Exemplification",
      "Media",
    ],
  },
  gust: {
    ja: [
      "強風",
      "突風",
      "吹",
      "風が",
      "風に",
      "風で",
      "そよ風",
      "北風",
      "飛ばされ",
      "飛ばす",
    ],
    en: [
      "wind",
      "winds",
      "windy",
      "blow",
      "blows",
      "blew",
      "blown",
      "blowing",
      "gust*",
      "breez*",
    ],
    categories: [
      "Change & Progression",
      "Actions & Changes",
      "Weather & Climate",
      "Changes & Trends",
    ],
  },
  ama: {
    ja: ["海女", "潜", "深い", "深さ", "真珠", "貝", "海底", "息", "水中"],
    en: [
      "dive",
      "dives",
      "diving",
      "diver*",
      "deep",
      "deeper",
      "depth*",
      "pearl*",
      "shell*",
      "underwater",
      "breath*",
    ],
    jaExclude: ["潜在", "息子", "休息", "利息", "消息"],
    categories: [
      "Environment & Sustainability",
      "Environment",
      "Nature & Animals",
    ],
  },
  starTrain: {
    ja: ["銀河", "夢", "幻想", "鉄道", "汽車", "旅立", "憧れ", "列車"],
    en: [
      "dream*",
      "fantas*",
      "imagin*",
      "railway*",
      "railroad*",
      "steam train*",
      "longing",
    ],
    categories: [
      "Trains & Journeys",
      "Purpose & Intention",
      "Assumption & Hypothetical",
    ],
  },
  seri: {
    ja: [
      "競り",
      "市場",
      "マグロ",
      "鮪",
      "卸",
      "値段",
      "価格",
      "相場",
      "落札",
      "入札",
      "売買",
    ],
    en: [
      "auction*",
      "bid",
      "bids",
      "bidding",
      "wholesale*",
      "tuna",
      "market",
      "markets",
      "price*",
      "pricing",
    ],
    categories: [
      "Economy & Business",
      "Retail & Customer Service",
      "Money & Shopping",
    ],
  },
};

/** Text of an item, split by how strongly each part speaks for a theme. */
export interface AmbienceSource {
  id: number | string;
  /** Word / pattern / expression and its meaning. */
  primary: readonly (string | undefined)[];
  /** Subcategory first, then category. */
  categories: readonly (string | undefined)[];
  /** Phrase, example sentence, and their translations. */
  context: readonly (string | undefined)[];
}

const WEIGHT_PRIMARY = 4;
const WEIGHT_SUBCATEGORY = 3;
const WEIGHT_CATEGORY = 2;
const WEIGHT_CONTEXT = 1;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface CompiledRule {
  theme: AmbienceTheme;
  ja: readonly string[];
  jaExclude: readonly string[];
  en: RegExp | null;
  categories: ReadonlySet<string>;
}

const COMPILED: readonly CompiledRule[] = THEME_ORDER.map((theme) => {
  const rule = RULES[theme];
  const alternatives = rule.en.map((w) =>
    w.endsWith("*") ? `${escapeRegExp(w.slice(0, -1))}[a-z]*` : escapeRegExp(w),
  );
  return {
    theme,
    ja: rule.ja,
    jaExclude: rule.jaExclude ?? [],
    en: alternatives.length
      ? new RegExp(`(?:^|[^a-z])(?:${alternatives.join("|")})(?![a-z])`, "i")
      : null,
    categories: new Set(rule.categories),
  };
});

function textHits(rule: CompiledRule, text: string): number {
  if (!text) return 0;
  let hits = 0;
  let cleaned = text;
  for (const ex of rule.jaExclude) cleaned = cleaned.split(ex).join(" ");
  for (const k of rule.ja) {
    if (cleaned.includes(k)) {
      hits++;
      break; // one Japanese hit per text is enough
    }
  }
  if (rule.en && rule.en.test(cleaned)) hits++;
  return hits;
}

/** Score of every theme for one item (exported for tests). */
export function scoreAmbience(
  source: AmbienceSource,
): Record<AmbienceTheme, number> {
  const scores = Object.fromEntries(THEME_ORDER.map((t) => [t, 0])) as Record<
    AmbienceTheme,
    number
  >;
  const [subcategory, category] = source.categories;
  for (const rule of COMPILED) {
    let score = 0;
    for (const text of source.primary) {
      if (text) score += WEIGHT_PRIMARY * textHits(rule, text);
    }
    if (subcategory && rule.categories.has(subcategory))
      score += WEIGHT_SUBCATEGORY;
    if (category && category !== subcategory && rule.categories.has(category)) {
      score += WEIGHT_CATEGORY;
    }
    for (const text of source.context) {
      if (text) score += WEIGHT_CONTEXT * textHits(rule, text);
    }
    scores[rule.theme] = score;
  }
  return scores;
}

/** Small stable string hash (FNV-1a). */
export function stableHash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** The theme for one item. Same item → same theme, always. */
export function resolveAmbience(source: AmbienceSource): AmbienceTheme {
  const scores = scoreAmbience(source);
  let bestScore = 0;
  for (const theme of THEME_ORDER)
    bestScore = Math.max(bestScore, scores[theme]);
  if (bestScore > 0) {
    // A tie (typically a category shared by a family of scenes) is broken by
    // the item's own hash: neighbouring words vary, each word stays stable.
    const tied = THEME_ORDER.filter((t) => scores[t] === bestScore);
    return tied[stableHash(`${source.id}:tie`) % tied.length]!;
  }
  const pick = stableHash(String(source.id)) % NEUTRAL_THEMES.length;
  return NEUTRAL_THEMES[pick]!;
}

/* ── Adapters for each content type ─────────────────────────────── */

interface VocabLike {
  id: number;
  word: string;
  meaning: string;
  category?: string;
  subcategory?: string;
  phrase?: string;
  phraseMeaning?: string;
  sentence?: string;
  sentenceMeaning?: string;
}

/** Vocabulary words and quiz questions (both share this shape). */
export function ambienceForVocab(item: VocabLike): AmbienceTheme {
  return resolveAmbience({
    id: `v${item.id}`,
    primary: [item.word, item.meaning],
    categories: [item.subcategory, item.category],
    context: [
      item.phrase,
      item.phraseMeaning,
      item.sentence,
      item.sentenceMeaning,
    ],
  });
}

interface GrammarLike {
  id: number;
  pattern: string;
  meaning: string;
  category?: string;
  subcategory?: string;
  sentence?: string;
  sentenceMeaning?: string;
}

export function ambienceForGrammar(item: GrammarLike): AmbienceTheme {
  return resolveAmbience({
    id: `g${item.id}`,
    // A grammar pattern itself carries no theme; its meaning rarely does.
    primary: [item.meaning],
    categories: [item.subcategory, item.category],
    // The example sentence is where the picture lives — weigh it up.
    context: [
      item.sentence,
      item.sentenceMeaning,
      item.sentence,
      item.sentenceMeaning,
    ],
  });
}

interface OnomatopoeiaLike {
  id: string;
  japanese: string;
  meaning: string;
  exampleJapanese?: string;
  exampleEnglish?: string;
}

export function ambienceForOnomatopoeia(item: OnomatopoeiaLike): AmbienceTheme {
  return resolveAmbience({
    id: `o${item.id}`,
    primary: [item.meaning],
    categories: [],
    context: [
      item.exampleJapanese,
      item.exampleEnglish,
      item.exampleJapanese,
      item.exampleEnglish,
    ],
  });
}

/* ── Kanji echo ─────────────────────────────────────────────────── */

/** Themes that write the current word's kanji into the scenery. */
export const GLYPH_THEMES: ReadonlySet<AmbienceTheme> = new Set<AmbienceTheme>([
  "neon",
  "tanabata",
  "yatai",
  "machiya",
  "shodo",
  "classroom",
  "kaitenSushi",
  "konbini",
  "kite",
  "toro",
  "manekineko",
  "shogi",
  "library",
  "daruma",
  "ramen",
  "omikuji",
  "kamishibai",
]);

const KANJI = /[\u3400-\u4dbf\u4e00-\u9fff々]/u;

/**
 * Up to three kanji from the item's own word or pattern, for the signs,
 * wish strips, noren and lanterns. Empty when the text has no kanji — the
 * scenes then fall back to their own stock characters.
 */
export function ambienceGlyphs(text: string | undefined | null): string {
  if (!text) return "";
  const out: string[] = [];
  for (const ch of text) {
    if (ch === "々" && out.length === 0) continue;
    if (KANJI.test(ch) && !out.includes(ch)) out.push(ch);
    if (out.length === 3) break;
  }
  return out.join("");
}
