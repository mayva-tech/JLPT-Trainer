# -*- coding: utf-8 -*-
"""
Assign courseLevel / familyId / isPrimary / aliases to all grammar items,
rebuild family-based grammarLessons, and emit verify + gap reports.

Does NOT delete any of the 500 raw records.
"""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

root = Path(r"C:\Projects\jlpt-n2-video-player")
grammar_path = root / "src/data/grammar.ts"
items = json.loads((root / "scripts/_grammar_items_dump.json").read_text(encoding="utf-8"))

# Re-apply Final-list jlpt separation (lost if grammar.ts was reverted to pre-N3 commit).
TO_N3 = {
    5017, 5021, 5031, 5032, 5073, 5074, 5075, 5081, 5082, 5089,
    5111, 5125, 5131, 5137, 5143, 5145, 5344, 5367,
}
TO_N2 = {5114, 5144, 5198, 5227, 5312, 5431}
for i in items:
    if i["id"] in TO_N3:
        i["jlpt"] = "N3"
    elif i["id"] in TO_N2:
        i["jlpt"] = "N2"


# ── Normalization ────────────────────────────────────────────────────────────

KANJI_ALIASES = [
    ("挙句", "あげく"),
    ("挙げ句", "あげく"),
    ("上げ句", "あげく"),
    ("過ぎない", "すぎない"),
    ("関わらず", "かかわらず"),
    ("関らず", "かかわらず"),
    ("当たって", "あたって"),
    ("当たり", "あたり"),
    ("基づ", "もとづ"),
    ("応じて", "おうじて"),
    ("応えて", "こたえて"),
    ("伴って", "ともなって"),
    ("伴い", "ともない"),
    ("従って", "したがって"),
    ("従い", "したがい"),
    ("対して", "たいして"),
    ("関して", "かんして"),
    ("比べ", "くらべ"),
    ("限り", "かぎり"),
    ("限って", "かぎって"),
    ("限る", "かぎる"),
    ("限らず", "かぎらず"),
    ("際して", "さいして"),
    ("先立", "さきだ"),
    ("亘って", "わたって"),
    ("渡って", "わたって"),
    ("わたって", "わたって"),
    ("経て", "へて"),
    ("他ない", "ほかない"),
    ("他ならない", "ほかならない"),
    ("相違ない", "そういない"),
    ("違いない", "ちがいない"),
    ("決まって", "きまって"),
    ("等しい", "ひとしい"),
    ("恐れ", "おそれ"),
    ("得ない", "えない"),
    ("得る", "える"),
    ("済む", "すむ"),
    ("済まない", "すまない"),
    ("抜き", "ぬき"),
    ("除いて", "のぞいて"),
    ("除き", "のぞき"),
    ("問わず", "とわず"),
    ("中心", "ちゅうしん"),
    ("通して", "とおして"),
    ("通じて", "つうじて"),
    ("沿って", "そって"),
    ("即して", "そくして"),
    ("折に", "おりに"),
    ("最中", "さいちゅう"),
    ("次第", "しだい"),
    ("以来", "いらい"),
    ("初めて", "はじめて"),
    ("一方", "いっぽう"),
    ("反面", "はんめん"),
    ("半面", "はんめん"),
    ("契機", "けいき"),
    ("きっかけ", "きっかけ"),
    ("末に", "すえに"),
    ("結果", "けっか"),
]


def normalize_pattern(p: str) -> str:
    p = p.replace("〜", "～").replace("~", "～").replace("／", "/")
    p = re.sub(r"\s+", "", p)
    p = p.lstrip("～")
    for a, b in KANJI_ALIASES:
        p = p.replace(a, b)
    return p


def primary_stem(p: str) -> str:
    """First slash-segment, normalized, for coarse grouping."""
    n = normalize_pattern(p)
    return re.split(r"[/、]", n)[0].strip("～")


# ── Explicit multi-member N2 CORE families (seed) ────────────────────────────
# Each entry: familyId, title, list of stem matchers (substring of normalized pattern)
# First matching item becomes primary preference order.

FAMILY_SEEDS: list[tuple[str, str, list[str]]] = [
    ("certainty-judgment", "Certainty & Judgment", ["にちがいない", "にそういない", "にきまっている"]),
    ("condition-concession", "Condition Concession", ["にしても", "にしろ", "にせよ"]),
    ("no-alternative", "No Alternative", ["ざるをえない", "ざるを得ない", "ほかない", "よりほかない", "しかない"]),
    ("formal-timing", "Formal Timing", ["に際して", "にあたって", "にあたり", "際に", "際／"]),
    ("gradual-change", "Gradual Change", ["につれて", "にしたがって", "にしたがい", "にともなって", "にともない", "とともに"]),
    ("trigger-opportunity", "Trigger & Opportunity", ["をきっかけ", "をけいき", "を機に", "をきに"]),
    ("strong-feeling", "Strong Feeling", ["てたまらない", "てならない", "てしかたがない", "てしょうがない"]),
    ("explanation-wake", "Explanation わけ", ["わけではない", "というわけではない", "わけでもない", "わけがない", "わけにはいかない", "ないわけにはいかない", "というわけだ", "わけだ"]),
    ("not-only", "Not Only…But Also", ["ばかりか", "ばかりでなく", "のみならず", "はもとより", "はもちろん"]),
    ("limits-kagiru", "Limits 限る", ["にかぎる", "にかぎり", "にかぎって", "にかぎらず"]),
    ("regardless", "Regardless", ["にかかわらず", "にかかわりなく", "をとわず", "によらず"]),
    ("basis-source", "Basis & Source", ["をもとに", "にもとづいて", "にもとづき"]),
    ("viewpoint", "Viewpoint", ["からみると", "からみれば", "からみて", "からすると", "からすれば", "からして", "にしたら", "にすれば", "にしてみれば"]),
    ("mono-family", "もの Family", ["ものだから", "ものなら", "ようものなら", "ものではない", "ものがある", "ものか", "ものの", "ものを", "ものだ", "もので"]),
    ("koto-family", "こと Family", ["ことだから", "ことに", "ことなく", "ことだ", "ことは～が", "ことは"]),
    ("appearance-tendency", "Appearance & Tendency", ["がちだ", "がち", "気味", "っぽい"]),
    ("possibility-risk", "Possibility & Risk", ["かねない", "かねる", "おそれがある", "っこない", "ようがない", "ようもない", "える", "えない"]),
    ("obligation-must", "Obligation", ["べきだ", "べきではない", "てはいられない", "てばかりはいられない", "ずにはいられない", "ないではいられない"]),
    ("cause-consequence", "Cause & Consequence", ["あげく", "すえに", "あまり", "ばかりに", "だけに", "だけあって", "だけのことはある"]),
    ("since-now-that", "Since / Now That", ["以上は", "以上", "上は", "からには", "からこそ"]),
    ("contrast-concession", "Contrast & Concession", ["にもかかわらず", "くせに", "わりに", "にしては", "とはいえ", "といっても", "からといって", "どころか", "どころではない", "どころではなく"]),
    ("contrast-aspect", "Contrast Aspects", ["いっぽうで", "はんめん", "にはんして", "にはんする"]),
    ("addition", "Addition", ["上に", "にくわえて", "にくわえ"]),
    ("listing-pairs", "Listing Pairs", ["やら", "だの"]),
    ("emphasis-sae", "Emphasis さえ／すら／こそ", ["でさえ", "さえ", "すら", "こそ"]),
    ("exception-nuki", "Exception & Exclusion", ["ぬきで", "ぬきにして", "ぬきには", "をのぞいて", "をのぞき", "はべつとして", "はべつにして", "はさておき", "はともかく"]),
    ("extent-degree", "Extent & Degree", ["くらいなら", "ぐらいなら", "てまで", "までして", "てでも", "てこそ"]),
    ("time-sequence", "Time & Sequence", ["ていらい", "てはじめて", "うえで", "しだい", "かとおもうと", "かとおもったら", "ところだった", "たところ", "たところが", "さいちゅう", "にさきだって", "にいたって", "にいたるまで", "にかけて", "にわたって", "にわたり", "つつある", "たびに"]),
    ("conditions-assumptions", "Conditions & Assumptions", ["としたら", "とすれば", "とすると", "としても", "ないことには", "てからでないと", "てからでなければ", "ないかぎり", "しだいで", "しだいでは", "によっては", "ばあいによっては", "たところで"]),
    ("judgment-limit", "Judgment Limits", ["にすぎない", "にほかならない", "にひとしい", "ないことはない", "なくはない", "なくもない", "とはかぎらない", "ないともかぎらない"]),
    ("means-relation", "Means & Relation", ["によって", "により", "をとおして", "をつうじて", "をちゅうしん", "をめぐって", "をめぐる", "にそって", "にそくして", "において", "における", "にかんして", "にたいして", "にくらべて", "にかけては"]),
    ("change-direction", "One-way Change", ["いっぽうだ", "ばかりだ"]),
    ("response-oujiru", "Response 応じ／応え", ["におうじて", "におうじ", "にこたえて", "にこたえ"]),
    ("state-completion", "State & Completion", ["がたい", "だらけ", "っぱなし", "きる", "きれる", "きれない", "かのよう"]),
    ("feelings-eval", "Feelings & Evaluation", ["ことか", "だけまし", "てもはじまらない", "にこしたことはない"]),
    ("thanks-blame", "Thanks & Blame", ["おかげで", "おかげだ", "せいで", "せいか", "けっか", "につき", "ことから", "ところから"]),
    ("appearance-ge", "Appearance げ", ["げ"]),
    ("halfway-kake", "Halfway かけ", ["かけだ", "かける", "かけの", "かけ"]),
    ("mai-conjecture", "Conjecture まい", ["まい"]),
    ("kiru-only", "きり / っきり", ["っきり", "きり"]),
]

# Secondary mega-families (N2_SECONDARY) — keep in inventory, one teaching family each
SECONDARY_SEEDS: list[tuple[str, str, list[str]]] = [
    ("secondary-honorifics", "Honorifics & Humble Forms", ["お～になる", "お〜になる", "お～する", "お〜する", "でございます", "させていただく", "いたす", "れる / られる", "れる/られる"]),
    ("secondary-voice", "Voice & Benefactives", ["せる / させる", "（ら）れる", "(ら)れる", "させられる", "てもらう", "ていただく", "てくれる", "てあげる", "まいとする"]),
    ("secondary-hearsay-impression", "Hearsay & Impression", ["と言われている", "とされている", "と見られる", "と思われる", "に見える", "ふりをする", "気がする", "感がある", "らしくない", "に違いなかった"]),
    ("secondary-formal-written", "Formal Written Connectors", ["に鑑みて", "に相まって", "を踏まえて", "のもとで", "をはじめ", "に向けて", "に努める", "ついでに"]),
    ("secondary-discourse", "Discourse & Topic", ["といえば", "とか～とか", "とか〜とか", "もいいところだ", "つまるところ", "結局のところ", "ならともかく", "はまだしも", "ならまだしも"]),
]

# Subcategory → default secondary family for leftovers that look non-core
SECONDARY_SUBCAT = {
    "Honorific & Humble Expressions",
    "Voice & Benefactive",
}


def stem_match(norm_pat: str, matcher: str) -> bool:
    """Match grammar stems without swallowing longer unrelated forms."""
    m = normalize_pattern(matcher).lstrip("～")
    if not m:
        return False
    parts = [
        p.strip("～")
        for p in re.split(r"[/、～]", norm_pat)
        if p.strip("～")
    ]
    ok_affixes = {
        "",
        "に",
        "と",
        "を",
        "が",
        "は",
        "で",
        "も",
        "の",
        "て",
        "な",
        "だ",
        "です",
        "して",
        "する",
        "より",
        "という",
        "と言",
        "として",
        "にして",
    }
    for part in parts:
        if part == m:
            return True
        if len(m) >= 2 and part.startswith(m):
            suffix = part[len(m) :]
            if suffix in ok_affixes or len(suffix) <= 1:
                return True
        if len(m) >= 3 and part.endswith(m):
            prefix = part[: -len(m)]
            if prefix in ok_affixes or len(prefix) <= 1:
                return True
    if len(m) <= 2:
        return any(p == m for p in parts)
    return False


# ── Assign ───────────────────────────────────────────────────────────────────

assignments: dict[int, dict] = {}  # id -> meta


def assign(item, family_id, course_level, is_primary, aliases=None):
    assignments[item["id"]] = {
        "courseLevel": course_level,
        "familyId": family_id,
        "isPrimary": is_primary,
        "aliases": aliases or [],
    }


# Index by id
by_id = {i["id"]: i for i in items}
n2 = [i for i in items if i["jlpt"] == "N2"]
n1 = [i for i in items if i["jlpt"] == "N1"]
n3 = [i for i in items if i["jlpt"] == "N3"]
assigned_ids: set[int] = set()

# 1) N1 / N3 tracks — one family per item (or small groups by subcategory)
for i in n1:
    fid = f"n1-{i['id']}"
    assign(i, fid, "N1", True)
    assigned_ids.add(i["id"])

for i in n3:
    fid = f"n3-{primary_stem(i['pattern']) or i['id']}"
    # merge N3 with same stem
    existing = next(
        (
            a
            for a in assignments.values()
            if a["courseLevel"] == "N3_REVIEW" and a["familyId"] == fid
        ),
        None,
    )
    if existing:
        # find primary id with this family
        prim = next(iid for iid, a in assignments.items() if a["familyId"] == fid and a["isPrimary"])
        assign(i, fid, "N3_REVIEW", False)
        # add alias on primary later
    else:
        assign(i, fid, "N3_REVIEW", True)
    assigned_ids.add(i["id"])

# Fix N3 family ids collision - regroup
n3_groups: dict[str, list] = defaultdict(list)
for i in n3:
    n3_groups[primary_stem(i["pattern"]) or str(i["id"])].append(i)
for stem, group in n3_groups.items():
    fid = f"n3-{stem}"
    group = sorted(group, key=lambda x: x["id"])
    for j, it in enumerate(group):
        aliases = []
        if j == 0 and len(group) > 1:
            aliases = [g["pattern"] for g in group[1:]]
        assign(it, fid, "N3_REVIEW", j == 0, aliases if j == 0 else [])

# 2) Seed CORE families on N2
for family_id, title, matchers in FAMILY_SEEDS:
    members = []
    for i in n2:
        if i["id"] in assigned_ids:
            continue
        np = normalize_pattern(i["pattern"])
        if any(stem_match(np, m) for m in matchers):
            members.append(i)
    if not members:
        continue
    # Prefer shorter common teaching form as primary; stable by id
    def primary_score(it):
        np = normalize_pattern(it["pattern"])
        # prefer exact early matcher hits
        for rank, m in enumerate(matchers):
            if stem_match(np, m):
                return (rank, len(np), it["id"])
        return (99, len(np), it["id"])

    members = sorted(members, key=primary_score)
    # Cap huge accidental matches (e.g. ほど matching everything)
    if family_id in ("extent-degree", "time-sequence", "conditions-assumptions", "means-relation", "mono-family", "explanation-wake"):
        # keep all matched — these are intentional broad families
        pass
    # Deduplicate if too many false positives for ほど alone
    if family_id == "extent-degree":
        members = [
            m
            for m in members
            if any(
                stem_match(normalize_pattern(m["pattern"]), x)
                for x in ["くらいなら", "ぐらいなら", "てまで", "までして", "てでも", "てこそ"]
            )
            or (
                "ほど" in normalize_pattern(m["pattern"])
                and "ほど～ない" not in normalize_pattern(m["pattern"])
                and "ほど〜ない" not in m["pattern"]
            )
        ]
    if family_id == "means-relation":
        # avoid swallowing everything with として/について — keep formal relation set
        allowed = [
            "によって",
            "により",
            "をとおして",
            "をつうじて",
            "をちゅうしん",
            "をめぐって",
            "をめぐる",
            "にそって",
            "にそくして",
            "において",
            "における",
            "にかんして",
            "にたいして",
            "にくらべて",
            "にかけては",
        ]
        members = [
            m
            for m in members
            if any(stem_match(normalize_pattern(m["pattern"]), a) for a in allowed)
        ]

    if not members:
        continue
    for j, it in enumerate(members):
        aliases = [x["pattern"] for x in members[1:]] if j == 0 and len(members) > 1 else []
        assign(it, family_id, "N2_CORE", j == 0, aliases)
        assigned_ids.add(it["id"])

# 3) Secondary seeds
for family_id, title, matchers in SECONDARY_SEEDS:
    members = []
    for i in n2:
        if i["id"] in assigned_ids:
            continue
        np = normalize_pattern(i["pattern"])
        raw = i["pattern"]
        if any(stem_match(np, m) or m in raw for m in matchers):
            members.append(i)
    if not members:
        continue
    members = sorted(members, key=lambda x: x["id"])
    for j, it in enumerate(members):
        aliases = [x["pattern"] for x in members[1:]] if j == 0 and len(members) > 1 else []
        assign(it, family_id, "N2_SECONDARY", j == 0, aliases)
        assigned_ids.add(it["id"])

# 4) Remaining N2: merge by normalized primary stem; classify CORE vs SECONDARY
remain = [i for i in n2 if i["id"] not in assigned_ids]
stem_groups: dict[str, list] = defaultdict(list)
for i in remain:
    stem_groups[primary_stem(i["pattern"]) or str(i["id"])].append(i)

# Subcategories that should be secondary when singleton/misc
SECONDARY_SUBS = {
    "Honorific & Humble Expressions",
    "Passive & Causative",
    "Causative",
    "Benefactives",
    "Social Convention & Custom",
    "Honorifics",
}

core_singleton_count = 0
for stem, group in sorted(stem_groups.items(), key=lambda x: x[0]):
    group = sorted(group, key=lambda x: x["id"])
    # Decide course level
    sub = group[0].get("subcategory") or ""
    is_sec = sub in SECONDARY_SUBS or any(
        k in sub for k in ("Honorific", "Humble", "Benefactive", "Causative", "Passive", "Social Convention")
    )
    # Also secondary if pattern looks like basic conjugation teaching
    for it in group:
        p = it["pattern"]
        if re.search(r"(させる|られる|てもらう|てくれる|てあげる|ていただく)", p):
            is_sec = True

    level = "N2_SECONDARY" if is_sec else "N2_CORE"
    # family id
    safe = re.sub(r"[^a-zA-Z0-9ぁ-んァ-ン一-龯]+", "-", stem).strip("-")[:40] or str(group[0]["id"])
    prefix = "sec-" if is_sec else "core-"
    fid = f"{prefix}{safe}"

    # Avoid colliding with seed ids
    if fid in {a["familyId"] for a in assignments.values()}:
        fid = f"{fid}-{group[0]['id']}"

    for j, it in enumerate(group):
        aliases = [x["pattern"] for x in group[1:]] if j == 0 and len(group) > 1 else []
        assign(it, fid, level, j == 0, aliases)
        assigned_ids.add(it["id"])
        if level == "N2_CORE" and j == 0:
            core_singleton_count += 1

# 5) If CORE families still way above 135, demote smallest/latest singleton CORE families to SECONDARY buckets
from collections import Counter

fam_members: dict[str, list[int]] = defaultdict(list)
fam_level: dict[str, str] = {}
fam_primary: dict[str, int] = {}
for iid, meta in assignments.items():
    if by_id[iid]["jlpt"] != "N2":
        continue
    fam_members[meta["familyId"]].append(iid)
    fam_level[meta["familyId"]] = meta["courseLevel"]
    if meta["isPrimary"]:
        fam_primary[meta["familyId"]] = iid

core_fams = [f for f, lv in fam_level.items() if lv == "N2_CORE"]
sec_fams = [f for f, lv in fam_level.items() if lv == "N2_SECONDARY"]
print(f"Before demotion: core_fams={len(core_fams)} sec_fams={len(sec_fams)} n2_items={len(n2)}")

# Demote singleton core families over target into secondary theme buckets by subcategory
TARGET_CORE = 130
TARGET_SEC = 22
if len(core_fams) > TARGET_CORE:
    singletons = [
        f
        for f in core_fams
        if len(fam_members[f]) == 1 and f.startswith("core-")
    ]
    singletons.sort(key=lambda f: fam_primary.get(f, 0), reverse=True)
    excess = len(core_fams) - TARGET_CORE
    to_demote = singletons[:excess]
    buckets: dict[str, list[int]] = defaultdict(list)
    for f in to_demote:
        iid = fam_primary[f]
        sub = by_id[iid].get("subcategory") or "Misc"
        buckets[sub].append(iid)
    for sub, ids in buckets.items():
        safe = re.sub(r"[^a-zA-Z0-9]+", "-", sub).strip("-").lower()[:30]
        fid = f"sec-bucket-{safe}"
        n = 0
        base = fid
        while any(assignments[i]["familyId"] == fid for i in assignments):
            n += 1
            fid = f"{base}-{n}"
        ids = sorted(ids)
        for j, iid in enumerate(ids):
            aliases = [by_id[x]["pattern"] for x in ids[1:]] if j == 0 and len(ids) > 1 else []
            assign(by_id[iid], fid, "N2_SECONDARY", j == 0, aliases)

# Merge excess secondary families into theme buckets until TARGET_SEC
fam_members = defaultdict(list)
fam_level = {}
fam_primary = {}
for iid, meta in assignments.items():
    if by_id[iid]["jlpt"] != "N2":
        continue
    fam_members[meta["familyId"]].append(iid)
    fam_level[meta["familyId"]] = meta["courseLevel"]
    if meta["isPrimary"]:
        fam_primary[meta["familyId"]] = iid

sec_fams = [f for f, lv in fam_level.items() if lv == "N2_SECONDARY"]
if len(sec_fams) > TARGET_SEC:
    # Prefer merging generated core-/sec- singletons and buckets, keep named seeds
    seed_sec_ids = {fid for fid, _, _ in SECONDARY_SEEDS}
    mergeable = sorted(
        [f for f in sec_fams if f not in seed_sec_ids],
        key=lambda f: (len(fam_members[f]), fam_primary.get(f, 0)),
    )
    while len([f for f, lv in fam_level.items() if lv == "N2_SECONDARY"]) > TARGET_SEC and len(mergeable) >= 2:
        a = mergeable.pop(0)
        b = mergeable.pop(0)
        ids = sorted(set(fam_members[a] + fam_members[b]))
        fid = f"sec-merged-{ids[0]}"
        for j, iid in enumerate(ids):
            aliases = [by_id[x]["pattern"] for x in ids[1:]] if j == 0 and len(ids) > 1 else []
            assign(by_id[iid], fid, "N2_SECONDARY", j == 0, aliases)
        # refresh
        fam_members = defaultdict(list)
        fam_level = {}
        fam_primary = {}
        for iid, meta in assignments.items():
            if by_id[iid]["jlpt"] != "N2":
                continue
            fam_members[meta["familyId"]].append(iid)
            fam_level[meta["familyId"]] = meta["courseLevel"]
            if meta["isPrimary"]:
                fam_primary[meta["familyId"]] = iid
        mergeable = sorted(
            [
                f
                for f, lv in fam_level.items()
                if lv == "N2_SECONDARY" and f not in seed_sec_ids
            ],
            key=lambda f: (len(fam_members[f]), fam_primary.get(f, 0)),
        )

# Recompute family stats
fam_members = defaultdict(list)
fam_level = {}
fam_primary = {}
fam_title_hint = {}
for iid, meta in assignments.items():
    fam_members[meta["familyId"]].append(iid)
    fam_level[meta["familyId"]] = meta["courseLevel"]
    if meta["isPrimary"]:
        fam_primary[meta["familyId"]] = iid
        fam_title_hint[meta["familyId"]] = by_id[iid]["pattern"]

core_fams = sorted([f for f, lv in fam_level.items() if lv == "N2_CORE"])
sec_fams = sorted([f for f, lv in fam_level.items() if lv == "N2_SECONDARY"])
n3_fams = sorted([f for f, lv in fam_level.items() if lv == "N3_REVIEW"])
n1_fams = sorted([f for f, lv in fam_level.items() if lv == "N1"])

unassigned = [i["id"] for i in items if i["id"] not in assignments]
print(
    f"Final families: core={len(core_fams)} secondary={len(sec_fams)} "
    f"total_n2={len(core_fams)+len(sec_fams)} n3={len(n3_fams)} n1={len(n1_fams)} unassigned={len(unassigned)}"
)
assert not unassigned, unassigned
assert all(iid in assignments for iid in by_id)

# Ensure exactly one primary per family
for fid, members in fam_members.items():
    prims = [iid for iid in members if assignments[iid]["isPrimary"]]
    if len(prims) != 1:
        # fix
        members_sorted = sorted(members)
        for iid in members_sorted:
            assignments[iid]["isPrimary"] = iid == members_sorted[0]
        fam_primary[fid] = members_sorted[0]

# ── Patch grammar.ts items with new fields ───────────────────────────────────

src = grammar_path.read_text(encoding="utf-8")

def js_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)

def inject_fields(src_text: str) -> str:
    """After each jlpt line, insert course fields if missing."""
    def repl(m):
        item_id = int(m.group(1))
        jlpt_line = m.group(0)
        meta = assignments[item_id]
        aliases = meta["aliases"]
        alias_line = ""
        if aliases:
            alias_line = f"\n    aliases: [{', '.join(js_str(a) for a in aliases)}],"
        # If already has courseLevel, skip
        # Match only the opening id+jlpt block
        jlpt = by_id[item_id]["jlpt"]
        return (
            f'    id: {item_id},\n'
            f'    jlpt: "{jlpt}",\n'
            f'    courseLevel: "{meta["courseLevel"]}",\n'
            f'    familyId: {js_str(meta["familyId"])},\n'
            f'    isPrimary: {"true" if meta["isPrimary"] else "false"},'
            f'{alias_line}'
        )

    # Replace `id: NNNN,\n    jlpt: "Nx",` blocks
    pattern = re.compile(
        r'    id: (\d+),\r?\n    jlpt: "(N[123])",'
    )
    # Avoid double-inject
    if "courseLevel:" in src_text:
        # strip existing course fields first
        src_text = re.sub(
            r'\r?\n    courseLevel: "[^"]+",\r?\n    familyId: "[^"]+",\r?\n    isPrimary: (?:true|false),(?:\r?\n    aliases: \[[^\]]*\],)?',
            "",
            src_text,
        )
    new_text, n = pattern.subn(repl, src_text)
    print(f"Injected course fields into {n} items")
    if n != 500:
        raise SystemExit(f"Expected 500 injections, got {n}")
    return new_text

src = inject_fields(src)

# ── Rebuild grammarLessons from families ─────────────────────────────────────

SEED_TITLES = {fid: title for fid, title, _ in FAMILY_SEEDS + SECONDARY_SEEDS}

def family_title(fid: str) -> str:
    if fid in SEED_TITLES:
        return SEED_TITLES[fid]
    prim = by_id[fam_primary[fid]]
    return prim["pattern"]


def family_subtitle(fid: str) -> str:
    level = fam_level[fid]
    if level == "N2_CORE":
        return "N2 Core"
    if level == "N2_SECONDARY":
        return "N2 Secondary"
    if level == "N3_REVIEW":
        return "N3 Review"
    return "N1"


# Order: core families (seed order first, then alpha), then secondary, then n3, then n1
seed_order = [fid for fid, _, _ in FAMILY_SEEDS if fid in fam_level]
seed_order += [fid for fid, _, _ in SECONDARY_SEEDS if fid in fam_level]
rest_core = sorted([f for f in core_fams if f not in seed_order])
rest_sec = sorted([f for f in sec_fams if f not in seed_order])
ordered_n2 = [f for f in seed_order if f in core_fams] + rest_core + [f for f in seed_order if f in sec_fams] + rest_sec
# unique preserve order
seen = set()
ordered_n2_u = []
for f in ordered_n2:
    if f not in seen and f in fam_level and fam_level[f] in ("N2_CORE", "N2_SECONDARY"):
        seen.add(f)
        ordered_n2_u.append(f)

ordered_all = ordered_n2_u + sorted(n3_fams) + sorted(n1_fams)

lesson_entries = []
for idx, fid in enumerate(ordered_all, start=1):
    members = sorted(fam_members[fid], key=lambda iid: (0 if assignments[iid]["isPrimary"] else 1, iid))
    level = fam_level[fid]
    if level in ("N2_CORE", "N2_SECONDARY"):
        lesson_id = f"grammar-lesson-{idx:03d}"
        title_prefix = "JLPT N2 Grammar"
    elif level == "N3_REVIEW":
        lesson_id = f"n3-grammar-lesson-{idx:03d}"
        title_prefix = "JLPT N3 Review"
    else:
        lesson_id = f"n1-grammar-lesson-{idx:03d}"
        title_prefix = "JLPT N1 Grammar"
    title = family_title(fid)
    lesson_entries.append(
        {
            "id": lesson_id,
            "familyId": fid,
            "courseLevel": level,
            "title": f"{title_prefix} — {title}",
            "subtitle": family_subtitle(fid),
            "youtubeTitle": f"{title_prefix} | {title}",
            "grammarIds": members,
            "index": idx,
        }
    )

# Replace grammarLessons array in file
lessons_start = src.find("export const grammarLessons: GrammarLesson[] = [")
if lessons_start < 0:
    raise SystemExit("grammarLessons not found")
# Find end of array before getGrammarById
lessons_end = src.find("\nexport function getGrammarById", lessons_start)
if lessons_end < 0:
    raise SystemExit("getGrammarById not found")

def fmt_lesson(L):
    ids = ", ".join(str(i) for i in L["grammarIds"])
    return f'''  {{
    id: "{L["id"]}",
    title: {js_str(L["title"])},
    subtitle: {js_str(L["subtitle"])},
    youtubeTitle: {js_str(L["youtubeTitle"])},
    category: "Grammar",
    subcategories: [{js_str(L["courseLevel"])}, {js_str(L["familyId"])}],
    grammarIds: [{ids}],
  }}'''

lessons_body = ",\n".join(fmt_lesson(L) for L in lesson_entries)
new_lessons = (
    "export const grammarLessons: GrammarLesson[] = [\n"
    + lessons_body
    + ",\n];\n\n"
)
# Keep grammarIdRange helper? can remove unused — replace whole section from function grammarIdRange
helper_start = src.find("function grammarIdRange")
if helper_start < 0:
    helper_start = lessons_start
src = src[:helper_start] + new_lessons + src[lessons_end:].lstrip("\n")

# Update getGrammarItemsForLesson to use courseLevel for N2 track
old_helper = '''export function getGrammarItemsForLesson(
  lesson: GrammarLesson
): GrammarItem[] {
  const wantN1 = lesson.id.startsWith("n1-");
  // N3 foundations are labeled but kept out of N2/N1 lesson + quiz tracks.
  return getGrammarByIds(lesson.grammarIds).filter((g) =>
    wantN1 ? g.jlpt === "N1" : g.jlpt === "N2"
  );
}'''

new_helper = '''export function getGrammarItemsForLesson(
  lesson: GrammarLesson
): GrammarItem[] {
  const items = getGrammarByIds(lesson.grammarIds);
  if (lesson.id.startsWith("n1-")) {
    return items.filter((g) => g.courseLevel === "N1");
  }
  if (lesson.id.startsWith("n3-")) {
    return items.filter((g) => g.courseLevel === "N3_REVIEW");
  }
  // N2 family lessons: core + secondary only (never N1/N3).
  return items.filter(
    (g) => g.courseLevel === "N2_CORE" || g.courseLevel === "N2_SECONDARY"
  );
}'''

if old_helper in src:
    src = src.replace(old_helper, new_helper)
else:
    # try without comment
    src = re.sub(
        r"export function getGrammarItemsForLesson\([\s\S]*?\n\}",
        new_helper.strip(),
        src,
        count=1,
    )

grammar_path.write_text(src, encoding="utf-8")

# ── Write course catalog JSON for TS module generation ───────────────────────
catalog = {
    "families": [
        {
            "id": fid,
            "title": family_title(fid),
            "courseLevel": fam_level[fid],
            "primaryId": fam_primary[fid],
            "memberIds": sorted(fam_members[fid], key=lambda iid: (0 if assignments[iid]["isPrimary"] else 1, iid)),
            "lessonId": next(L["id"] for L in lesson_entries if L["familyId"] == fid),
        }
        for fid in ordered_all
    ],
    "counts": {
        "rawN2": len(n2),
        "rawN1": len(n1),
        "rawN3": len(n3),
        "coreFamilies": len(core_fams),
        "secondaryFamilies": len(sec_fams),
        "totalN2Families": len(core_fams) + len(sec_fams),
        "n3Families": len(n3_fams),
        "n1Families": len(n1_fams),
        "lessons": len(lesson_entries),
    },
    "n2LessonIds": [L["id"] for L in lesson_entries if L["courseLevel"] in ("N2_CORE", "N2_SECONDARY")],
}
(root / "scripts/_grammar_course_catalog.json").write_text(
    json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8"
)

# Report
report = []
report.append("=== Grammar course migration report ===")
report.append(f"Raw N2 items: {len(n2)}")
report.append(f"Raw N1 items: {len(n1)}")
report.append(f"Raw N3 items: {len(n3)}")
report.append(f"Core N2 families: {len(core_fams)}")
report.append(f"Secondary N2 families: {len(sec_fams)}")
report.append(f"Total N2 families: {len(core_fams)+len(sec_fams)}")
report.append(f"N3 prerequisite families: {len(n3_fams)}")
report.append(f"N1 families: {len(n1_fams)}")
report.append(f"Unassigned items: {len(unassigned)}")
report.append(f"Lessons generated: {len(lesson_entries)}")
report.append("")
report.append("=== N2 CORE families ===")
for f in ordered_n2_u:
    if fam_level[f] != "N2_CORE":
        continue
    ids = fam_members[f]
    pats = [by_id[i]["pattern"] for i in sorted(ids, key=lambda iid: (0 if assignments[iid]["isPrimary"] else 1, iid))]
    report.append(f"{f}\t{len(ids)}\t{' | '.join(pats)}")
report.append("")
report.append("=== N2 SECONDARY families ===")
for f in ordered_n2_u:
    if fam_level[f] != "N2_SECONDARY":
        continue
    ids = fam_members[f]
    pats = [by_id[i]["pattern"] for i in sorted(ids, key=lambda iid: (0 if assignments[iid]["isPrimary"] else 1, iid))]
    report.append(f"{f}\t{len(ids)}\t{' | '.join(pats)}")

(root / "scripts/_grammar_course_report.txt").write_text("\n".join(report), encoding="utf-8")
print("\n".join(report[:30]))
print(f"... full report → scripts/_grammar_course_report.txt")
print("counts", catalog["counts"])
