import json
from pathlib import Path

LESSONS = [
    (51, 4501, "Advanced Weather & Climate", "Weather & Climate", "advanced-weather", ["Weather", "Climate"]),
    (52, 4511, "Social Etiquette & Consideration", "Etiquette & Consideration", "etiquette-consideration", ["Etiquette", "Consideration"]),
    (53, 4521, "Workplace Communication", "Workplace Communication", "workplace-communication", ["Workplace", "Communication"]),
    (54, 4531, "Decisions & Problem Solving", "Decisions & Problem Solving", "decisions-problems", ["Decisions", "Problem Solving"]),
    (55, 4541, "Quality & Manufacturing", "Quality & Manufacturing", "quality-manufacturing", ["Quality", "Manufacturing"]),
    (56, 4551, "Research & Data", "Research & Data", "research-data", ["Research", "Data"]),
    (57, 4561, "Opinions & Arguments", "Opinions & Arguments", "opinions-arguments", ["Opinions", "Arguments"]),
    (58, 4571, "Personality & Character", "Personality & Character", "personality-character", ["Personality", "Character"]),
    (59, 4581, "Conflict & Relationships", "Conflict & Relationships", "conflict-relationships", ["Conflict", "Relationships"]),
    (60, 4591, "Rules & Compliance", "Rules & Compliance", "rules-compliance", ["Rules", "Compliance"]),
    (61, 4601, "Government & Politics", "Government & Politics", "government-politics", ["Government", "Politics"]),
    (62, 4611, "Economy & Business Conditions", "Economy & Business", "economy-business", ["Economy", "Business"]),
    (63, 4621, "Employment Conditions", "Employment Conditions", "employment-conditions", ["Employment", "Labor"]),
    (64, 4631, "Environment & Sustainability", "Environment & Sustainability", "environment-sustainability", ["Environment", "Sustainability"]),
    (65, 4641, "Crime & Public Safety", "Crime & Public Safety", "crime-safety", ["Crime", "Public Safety"]),
    (66, 4651, "Accidents & Insurance", "Accidents & Insurance", "accidents-insurance", ["Accidents", "Insurance"]),
    (67, 4661, "News & Public Information", "News & Media", "news-media", ["News", "Media"]),
    (68, 4671, "Digital Security & Privacy", "Digital Security & Privacy", "digital-security", ["Digital Security", "Privacy"]),
    (69, 4681, "Science & Technology", "Science & Technology", "science-technology", ["Science", "Technology"]),
    (70, 4691, "Changes & Trends", "Changes & Trends", "changes-trends", ["Changes", "Trends"]),
    (71, 4701, "Causes & Consequences", "Causes & Consequences", "causes-consequences", ["Causes", "Consequences"]),
    (72, 4711, "Possibility & Prediction", "Possibility & Prediction", "possibility-prediction", ["Possibility", "Prediction"]),
    (73, 4721, "Evaluation & Comparison", "Evaluation & Comparison", "evaluation-comparison", ["Evaluation", "Comparison"]),
    (74, 4731, "Academic Reading Vocabulary", "Academic Reading", "academic-reading", ["Academic", "Reading"]),
    (75, 4741, "Abstract High-Frequency N2 Verbs", "Abstract Verbs", "abstract-verbs", ["Abstract", "Verbs"]),
]

items = json.loads(Path("scripts/vocab-4501-4750-clean.json").read_text(encoding="utf-8"))
by_id = {x["id"]: x for x in items}

out_dir = Path("scripts/vocab-batches")
out_dir.mkdir(exist_ok=True)

for i in range(0, 25, 5):
    chunk = LESSONS[i : i + 5]
    start = chunk[0][1]
    end = chunk[-1][1] + 9
    payload = {
        "lessons": [
            {
                "lessonNumber": ln,
                "startId": sid,
                "titleTheme": theme,
                "subcategory": sub,
                "folder": folder,
                "subcategories": subs,
                "items": [by_id[sid + j] for j in range(10)],
            }
            for ln, sid, theme, sub, folder, subs in chunk
        ]
    }
    path = out_dir / f"batch-{start}-{end}.json"
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print("wrote", path)
