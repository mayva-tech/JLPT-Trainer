#!/usr/bin/env python3
"""Update N2 lesson categories, titles, and YouTube titles in lessons.ts."""

from __future__ import annotations

import re
from pathlib import Path

LESSONS_PATH = Path("src/data/lessons.ts")

CATEGORIES: dict[int, str] = {
    1: "Daily Life",
    2: "Daily Life",
    3: "Daily Life",
    4: "Daily Life",
    5: "Daily Life",
    6: "Work & Business",
    7: "Work & Business",
    8: "Daily Life",
    9: "Daily Life",
    10: "Daily Life",
    11: "Daily Life",
    12: "Daily Life",
    13: "Daily Life",
    14: "Society & Public Affairs",
    15: "Daily Life",
    16: "Daily Life",
    17: "Daily Life",
    18: "Technology & Science",
    19: "Daily Life",
    20: "Daily Life",
    21: "Daily Life",
    22: "Society & Public Affairs",
    23: "Daily Life",
    24: "Daily Life",
    25: "Society & Public Affairs",
    26: "Work & Business",
    27: "Daily Life",
    28: "Daily Life",
    29: "Daily Life",
    30: "Daily Life",
    31: "Work & Business",
    32: "Society & Public Affairs",
    33: "Daily Life",
    34: "Daily Life",
    35: "Technology & Science",
    36: "Daily Life",
    37: "Daily Life",
    38: "Daily Life",
    39: "Work & Business",
    40: "Daily Life",
    41: "Daily Life",
    42: "Daily Life",
    43: "Daily Life",
    44: "Daily Life",
    45: "Work & Business",
    46: "Society & Public Affairs",
    47: "Technology & Science",
    48: "Daily Life",
    49: "Work & Business",
    50: "Daily Life",
    51: "Daily Life",
    52: "Daily Life",
    53: "Work & Business",
    54: "Work & Business",
    55: "Work & Business",
    56: "Academic & Abstract",
    57: "Academic & Abstract",
    58: "Academic & Abstract",
    59: "Academic & Abstract",
    60: "Society & Public Affairs",
    61: "Society & Public Affairs",
    62: "Work & Business",
    63: "Work & Business",
    64: "Society & Public Affairs",
    65: "Society & Public Affairs",
    66: "Society & Public Affairs",
    67: "Society & Public Affairs",
    68: "Society & Public Affairs",
    69: "Technology & Science",
    70: "Academic & Abstract",
    71: "Academic & Abstract",
    72: "Academic & Abstract",
    73: "Work & Business",
    74: "Academic & Abstract",
    75: "Academic & Abstract",
}

YOUTUBE_TOPICS: dict[int, str] = {
    1: "Shopping and Supermarket",
    2: "Apartment and Renting",
    3: "Weather and Forecast",
    4: "Transportation and Trains",
    5: "Health and Hospital",
    6: "Work and Office",
    7: "Money and Banking",
    8: "Cooking and Kitchen",
    9: "School and Study",
    10: "Communication and Manners",
    11: "Fashion and Clothing",
    12: "Travel and Accommodation",
    13: "Daily Routine and Home Life",
    14: "Environment and Nature",
    15: "Social Manners and Etiquette",
    16: "Medicine and Pharmacy",
    17: "Community and Neighbourhood",
    18: "Technology and Internet",
    19: "Sport and Exercise",
    20: "Emotions and Mental Health",
    21: "Dining Out and Restaurant",
    22: "Insurance and Legal Matters",
    23: "Family and Relationships",
    24: "Housing Maintenance and Repairs",
    25: "Media and News",
    26: "Job Hunting and Career",
    27: "Postal Services and Deliveries",
    28: "Childcare and Early Education",
    29: "Public Facilities and Government Offices",
    30: "Art and Culture",
    31: "Banking and Investment",
    32: "Emergency and Disaster Preparedness",
    33: "Fitness and Gym",
    34: "Kitchen Equipment and Cooking Techniques",
    35: "Innovation and AI Technology",
    36: "Pregnancy and Childbirth",
    37: "Real Estate and Home Buying",
    38: "Traffic and Driving",
    39: "Office Equipment and Meetings",
    40: "Volunteering and Charity",
    41: "Aging and Elder Care",
    42: "Weddings and Ceremonies",
    43: "Retail and Customer Service",
    44: "Language Learning and Study Abroad",
    45: "Time Management and Productivity",
    46: "Funerals and Bereavement",
    47: "Home Appliances and Electronics",
    48: "Sleep and Rest",
    49: "Networking and Social Connections",
    50: "Personal Finance and Budgeting",
    51: "Advanced Weather and Climate",
    52: "Social Etiquette and Consideration",
    53: "Workplace Communication",
    54: "Decisions and Problem Solving",
    55: "Quality and Manufacturing",
    56: "Research and Data",
    57: "Opinions and Arguments",
    58: "Personality and Character",
    59: "Conflict and Relationships",
    60: "Rules and Compliance",
    61: "Government and Politics",
    62: "Economy and Business Conditions",
    63: "Employment Conditions",
    64: "Environment and Sustainability",
    65: "Crime and Public Safety",
    66: "Accidents and Insurance",
    67: "News and Public Information",
    68: "Digital Security and Privacy",
    69: "Science and Technology",
    70: "Changes and Trends",
    71: "Causes and Consequences",
    72: "Possibility and Prediction",
    73: "Evaluation and Comparison",
    74: "Academic Reading",
    75: "High-Frequency Abstract Verbs",
}

TITLE_OVERRIDES: dict[int, str] = {
    74: "JLPT N2 Academic Reading Vocabulary #74",
    75: "JLPT N2 High-Frequency Abstract Verbs #75",
}

SUBTITLE_OVERRIDES: dict[int, str] = {
    75: "Abstract • High-Frequency Verbs",
}


def main() -> None:
    text = LESSONS_PATH.read_text(encoding="utf-8")
    blocks = list(
        re.finditer(
            r'(\{\s*id: "lesson-(\d+)",.*?vocabularyIds: idRange\(\d+\),\s*\})',
            text,
            re.DOTALL,
        )
    )

    if len(blocks) != 75:
        raise SystemExit(f"expected 75 N2 lesson blocks, found {len(blocks)}")

    for match in reversed(blocks):
        block = match.group(1)
        lesson_num = int(match.group(2))
        if lesson_num < 1 or lesson_num > 75:
            continue

        category = CATEGORIES[lesson_num]
        youtube = f'JLPT N2 Vocabulary #{lesson_num} | {YOUTUBE_TOPICS[lesson_num]}'

        new_block = block
        new_block = re.sub(
            r'category: "[^"]+"',
            f'category: "{category}"',
            new_block,
            count=1,
        )
        new_block = re.sub(
            r'youtubeTitle: "[^"]+"',
            f'youtubeTitle: "{youtube}"',
            new_block,
            count=1,
        )

        if lesson_num in TITLE_OVERRIDES:
            new_block = re.sub(
                r'title: "[^"]+"',
                f'title: "{TITLE_OVERRIDES[lesson_num]}"',
                new_block,
                count=1,
            )
        if lesson_num in SUBTITLE_OVERRIDES:
            new_block = re.sub(
                r'subtitle: "[^"]+"',
                f'subtitle: "{SUBTITLE_OVERRIDES[lesson_num]}"',
                new_block,
                count=1,
            )

        text = text[: match.start(1)] + new_block + text[match.end(1) :]

    LESSONS_PATH.write_text(text, encoding="utf-8")
    print("Updated lessons.ts categories, YouTube titles, and lesson 74/75 titles")


if __name__ == "__main__":
    main()
