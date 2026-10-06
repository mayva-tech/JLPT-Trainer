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
  // Wide, calm scenes
  | "space"
  | "ocean"
  | "city"
  | "mountains"
  | "washi"
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
  | "ukiyoe";

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
      "花見",
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
      "祭",
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
      "festival*",
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
    categories: ["Sports", "Fitness & Gym"],
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
    categories: [
      "Aging & Elder Care",
      "Change & Progression",
      "Changes & Trends",
    ],
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
      "スキー",
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
      "ski",
      "skiing",
      "scarf",
    ],
    jaExclude: ["かき氷", "雪国"],
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
      "trip",
      "trips",
      "journey*",
      "tourist*",
      "tourism",
      "sightseeing",
      "climb*",
    ],
    categories: ["Travel", "Town & Travel", "Places", "Nature & Seasons"],
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
      "おみくじ",
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
      "fortune*",
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
    categories: [
      "Continuity & Persistence",
      "Habitual Actions & Recurring Patterns",
    ],
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
      "platform*",
      "commut*",
    ],
    categories: [
      "Transportation",
      "Trains & Journeys",
      "Traffic & Driving",
      "Quality & Manufacturing",
      "Time Management",
    ],
  },
  tanabata: {
    ja: ["七夕", "願", "天の川", "短冊", "夢", "希望", "祈願", "目標"],
    en: ["wish*", "hope*", "milky", "tanabata", "dream*", "goal*", "aim*"],
    categories: [
      "Purpose & Intention",
      "Volition & Effort",
      "Purpose, Tendency & Formal Expression",
    ],
  },
  koi: {
    ja: ["鯉", "池", "金魚", "錦", "泳"],
    en: ["koi", "carp", "pond*", "goldfish", "swim*"],
    jaExclude: ["鯉のぼり"],
    categories: ["Nature & Animals"],
  },
  yatai: {
    ja: [
      "屋台",
      "ラーメン",
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
      "麺",
      "注文",
      "定食",
    ],
    en: [
      "ramen",
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
      "noodle*",
      "cook*",
      "stall*",
      "izakaya",
      "order*",
    ],
    categories: [
      "Food",
      "Food & Cooking",
      "Cooking",
      "Dining Out",
      "Kitchen Equipment",
    ],
  },
  washitsu: {
    ja: [
      "和室",
      "畳",
      "障子",
      "茶",
      "襖",
      "床の間",
      "部屋",
      "正座",
      "客間",
      "掃除",
      "片付",
      "礼",
      "挨拶",
      "おもてなし",
    ],
    en: [
      "tea",
      "room",
      "rooms",
      "tatami",
      "guest*",
      "bow",
      "bowed",
      "tidy*",
      "clean*",
      "greet*",
      "hospitality",
      "polite*",
      "manners",
      "etiquette",
    ],
    categories: [
      "Home",
      "Rooms & Household Items",
      "Home & Chores",
      "Etiquette",
      "Etiquette & Consideration",
      "Honorific & Humble Expressions",
    ],
  },
  tanbo: {
    ja: ["田んぼ", "田舎", "米", "稲", "農", "収穫", "畑", "村", "野菜"],
    en: [
      "rice",
      "paddy",
      "paddies",
      "farm*",
      "harvest*",
      "crop*",
      "agricultur*",
      "countryside",
      "village*",
      "vegetable*",
      "rural",
    ],
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
      "買い物",
      "商品",
      "値段",
      "割引",
      "セール",
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
      "shop",
      "shops",
      "shopping",
      "store*",
      "price*",
      "discount*",
      "sale*",
      "media",
    ],
    categories: [
      "Media",
      "News & Media",
      "Media & News",
      "Hobbies & Free Time",
      "Fashion",
      "Shopping",
      "Money & Shopping",
      "Retail & Customer Service",
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
      "ロボット",
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
      "robot*",
      "future",
      "invent*",
      "innovation*",
      "theory",
      "hypothes*",
      "smartphone*",
    ],
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
    ja: ["海", "港", "船", "島", "魚", "浜", "湖", "釣", "海外"],
    en: [
      "sea",
      "ocean*",
      "beach*",
      "coast*",
      "port",
      "harbor*",
      "harbour*",
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
    jaExclude: ["海辺"],
    categories: [],
  },
  city: {
    ja: [
      "都会",
      "会社",
      "社員",
      "残業",
      "通勤",
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
      "colleague*",
      "salary",
      "customer*",
      "traffic",
      "building*",
      "downtown",
      "night",
      "street*",
      "crowd*",
      "business*",
    ],
    categories: [
      "Work",
      "Work & Business",
      "Work & Money",
      "Business Basics",
      "Business",
      "Office & Meetings",
      "Workplace Communication",
      "Public Life",
      "Society",
      "Society & Public Life",
      "Society & Public Affairs",
      "Money",
      "Economy & Business",
      "Banking & Investment",
      "Personal Finance",
      "Job Hunting",
      "Employment Conditions",
      "Networking",
      "Postal Services",
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
      "散歩",
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
      "camping",
      "walk",
      "walking",
    ],
    jaExclude: ["沢山", "富士山", "登山"],
    categories: ["Nature"],
  },
  washi: {
    ja: [
      "勉強",
      "学校",
      "大学",
      "学生",
      "学習",
      "学ぶ",
      "留学",
      "授業",
      "宿題",
      "試験",
      "読書",
      "図書",
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
      "school*",
      "student*",
      "teacher*",
      "class",
      "classes",
      "lesson*",
      "exam*",
      "homework",
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
      "library",
      "knowledge",
      "honorific*",
    ],
    categories: [
      "School",
      "School & Learning",
      "Language Learning",
      "Academic Reading",
      "N2 Reading",
      "Formal Written Register",
      "Formal & Written Expressions",
      "Opinions & Arguments",
      "Communication",
      "Questions",
      "Summary & Conclusion",
      "Work & School",
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
  let best: AmbienceTheme | null = null;
  let bestScore = 0;
  for (const theme of THEME_ORDER) {
    if (scores[theme] > bestScore) {
      best = theme;
      bestScore = scores[theme];
    }
  }
  if (best) return best;
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
