"""Build the small, attributed data extract used by the critique webpage.

Run from the repository root: python3 scripts/build_data.py
The source CSVs remain untouched. Percentages in AusPlay are stored as fractions.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "data"
STATES = {
    "NSW": "Ausplay_NSW",
    "VIC": "Ausplay_VIC",
    "QLD": "Ausplay_QLD",
    "SA": "Ausplay_SA",
    "WA": "AusPlay_WA",
    "TAS": "Ausplay_TAS",
    "NT": "Ausplay_NT",
    "ACT": "AusPlay_ACT",
}
GSS_STATES = {"NSW": "NSW", "VIC": "Vic", "QLD": "Qld", "SA": "SA", "WA": "WA", "TAS": "Tas", "NT": "NT", "ACT": "ACT"}


def rows(path: Path):
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def source_file(folder: Path, predicate):
    for path in sorted(folder.glob("*.csv")):
        data = rows(path)
        if data and predicate(data):
            return path, data
    raise FileNotFoundError(f"No matching CSV in {folder}")


def num(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def get_row(data, key, value):
    return next(row for row in data if row.get(key) == value)


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    time = rows(ROOT / "How_Australians_use_their_time/table_1_1_time_spent_on_activity_by_sex.csv")
    routines = []
    for label, activity in [
        ("Personal care", "Personal care for self"),
        ("Work & study", "Employment and education"),
        ("Unpaid work", "Unpaid work"),
        ("Free time", "Free time"),
    ]:
        row = get_row(time, "Activity", activity)
        routines.append({"activity": label, "minutes": num(row["Average time spent per day of total population - Persons(b) - minutes"])})
    time_gender = []
    for label, activity in [("Housework", "Housework"), ("Child care", "Looking after children (14 years and under)(c)"), ("Free time", "Free time")]:
        row = get_row(time, "Activity", activity)
        for sex, col in [("Men", "Males"), ("Women", "Females")]:
            time_gender.append({"activity": label, "sex": sex, "minutes": num(row[f"Average time spent per day of total population - {col} - minutes"])})

    sport = []
    activities = []
    for state, folder_name in STATES.items():
        folder = ROOT / folder_name
        _, weekly_rows = source_file(folder, lambda data: "At least once per week participation - Participation rate - Total" in data[0] and data[0].get("Category") == "Total")
        total = weekly_rows[0]
        sport.append({
            "state": state,
            "weekly": round(num(total["At least once per week participation - Participation rate - Total"]) * 100, 1),
            "three": round(num(total["At least three times per week participation - Participation rate - Total"]) * 100, 1),
            "yearly": round(num(total["At least once per year participation - Participation rate - Total"]) * 100, 1),
        })
        _, activity_rows = source_file(folder, lambda data: data[0].get("Category") == "Adventure racing" and "Total# - Participation rate" in data[0] and any(r.get("Category") == "Walking (Recreational)" for r in data))
        for label, activity in [("Walking", "Walking (Recreational)"), ("Swimming", "Swimming"), ("Cycling", "Cycling")]:
            row = get_row(activity_rows, "Category", activity)
            activities.append({"state": state, "activity": label, "rate": round(num(row["Total# - Participation rate"]) * 100, 1)})
    national_rows = rows(next((ROOT / "AusPlay_NATIONAL").glob("table_02_*.csv")))
    national_total = national_rows[0]
    sport.append({
        "state": "AUS",
        "weekly": round(num(national_total["At least once per week participation - Participation rate - Total"]) * 100, 1),
        "three": round(num(national_total["At least three times per week participation - Participation rate - Total"]) * 100, 1),
        "yearly": round(num(national_total["At least once per year participation - Participation rate - Total"]) * 100, 1),
    })

    gss_count = rows(ROOT / "General_Social_Survey/table_6_2_social_experiences_by_state_and_territory.csv")
    gss_rate = rows(ROOT / "General_Social_Survey/table_6_4_social_experiences_by_state_and_territory.csv")
    cultural_row = get_row(gss_count, "Characteristic", "Has attended any selected cultural venues and events in the last 12 months")
    cultural_rate_row = get_row(gss_rate, "Characteristic", "Has attended any selected cultural venues and events in the last 12 months")
    volunteer_row = get_row(gss_count, "Characteristic", "Has undertaken unpaid voluntary work through an organisation in last 12 months")
    loneliness_row = get_row(gss_rate, "Characteristic", "Often feel very lonely (Strongly agree / Somewhat agree)")
    community = []
    for state, prefix in GSS_STATES.items():
        community.append({
            "state": state,
            "cultural_thousands": num(cultural_row[f"{prefix} - Estimate ('000)"]),
            "cultural_rate": num(cultural_rate_row[f"{prefix} - Proportion (%)"]),
            "volunteer_thousands": num(volunteer_row[f"{prefix} - Estimate ('000)"]),
            "lonely": num(loneliness_row[f"{prefix} - Proportion (%)"]),
        })
    community.append({"state": "AUS", "cultural_thousands": num(cultural_row["Australia - Estimate ('000)"]), "cultural_rate": num(cultural_rate_row["Australia - Proportion (%)"]), "volunteer_thousands": num(volunteer_row["Australia - Estimate ('000)"]), "lonely": num(loneliness_row["Australia - Proportion (%)"])})

    volunteer_hours_rows = rows(ROOT / "General_Social_Survey/table_12_2_annual_hours_of_voluntary_work_by_gender_and_age.csv")
    volunteer_hours_row = next(row for row in volunteer_hours_rows if row["Category"] == "Persons(a)" and row["Characteristic"].startswith("Persons aged 15 years"))
    volunteer_hours = [
        {"band": "1–20 hours", "thousands": num(volunteer_hours_row["Annual hours spent volunteering - 1 - 20 hours - Estimate ('000)"])},
        {"band": "21–99 hours", "thousands": num(volunteer_hours_row["Annual hours spent volunteering - 21 - 99 hours"])},
        {"band": "100+ hours", "thousands": num(volunteer_hours_row["Annual hours spent volunteering - 100 hours or more"])},
    ]

    trend_rows = rows(ROOT / "General_Social_Survey/table_1_4_social_experiences_by_sex_2019_2020_and_gender_2025.csv")
    trends = []
    for label, characteristic in [
        ("Formal volunteering", "Has undertaken unpaid voluntary work through an organisation in last 12 months"),
        ("Social groups", "Social groups"),
        ("Support groups", "Community support groups"),
    ]:
        row = get_row(trend_rows, "Characteristic", characteristic)
        for year, column in [(2019, "2019 - Total persons - Proportion (%)"), (2025, "2025 - Total persons(b) - Proportion (%)")]:
            trends.append({"series": label, "year": year, "rate": num(row[column])})

    trust = []
    questions = [
        ("People", "Feels most people can be trusted"),
        ("Healthcare", "Feels the healthcare system can be trusted"),
        ("Police", "Feels police can be trusted"),
        ("Justice", "Feels the justice system can be trusted"),
    ]
    answers = [
        ("Agree", "Strongly agree / Somewhat agree"),
        ("Neutral", "Neither agree nor disagree"),
        ("Disagree", "Somewhat disagree / Strongly disagree"),
    ]
    for state, prefix in list(GSS_STATES.items()) + [("AUS", "Australia")]:
        for label, category in questions:
            for answer, characteristic in answers:
                row = next(r for r in gss_rate if r["Category"] == category and r["Characteristic"] == characteristic)
                trust.append({"state": state, "question": label, "answer": answer, "rate": num(row[f"{prefix} - Proportion (%)"])})

    satisfaction_rows = rows(ROOT / "General_Social_Survey/table_8_2_overall_life_satisfaction_by_sex_2014_2019_2020_and_gender_2025.csv")
    satisfaction = []
    for age in ["15-24", "35-44", "65 years and over"]:
        row = get_row(satisfaction_rows, "Characteristic", age)
        for year, column in [(2014, "2014 - Total persons - Mean score"), (2019, "2019 - Total persons - Mean score"), (2020, "2020 - Total persons - Mean score"), (2025, "2025 - Total persons(c) - Mean score")]:
            satisfaction.append({"age": "65+" if age.startswith("65") else age, "year": year, "score": num(row[column])})

    # Centroids are only the symbol locations; the map shapes are ABS boundaries.
    centroids = {"WA": [122.8, -26.2], "NT": [133.4, -19.2], "SA": [135.6, -30.0], "QLD": [145.2, -22.2], "NSW": [148.7, -32.0], "VIC": [144.8, -37.0], "TAS": [146.7, -42.1], "ACT": [149.1, -35.5]}
    for row in community:
        if row["state"] in centroids:
            row["longitude"], row["latitude"] = centroids[row["state"]]

    data = {"routines": routines, "time_gender": time_gender, "sport": sport, "activities": activities, "community": community, "volunteer_hours": volunteer_hours, "trends": trends, "trust": trust, "satisfaction": satisfaction}
    (OUT / "charts.json").write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {OUT / 'charts.json'}")
    print("State rates:", {row["state"]: row["weekly"] for row in sport})


if __name__ == "__main__":
    build()
