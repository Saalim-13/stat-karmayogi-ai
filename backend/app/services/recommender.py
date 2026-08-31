from app.services.igot_adapter import catalogue_adapter


def recommend_courses(gaps: list[dict], limit: int = 6) -> list[dict]:
    competencies = catalogue_adapter.competencies()
    gap_map = {g["competency_id"]: g for g in gaps}
    ranked: list[dict] = []

    for course in catalogue_adapter.courses():
        score = 0.0
        touched: list[str] = []
        for cid in course["competency_ids"]:
            gap = gap_map.get(cid)
            if not gap or gap.get("gap", 0) <= 0:
                continue
            weight = {"critical": 3, "high": 2, "moderate": 1}.get(gap.get("priority", "moderate"), 1)
            score += float(gap["gap"]) * weight
            touched.append(cid)
        if course["provider"] == "iGOT Karmayogi":
            score += 0.4
        if score <= 0:
            continue
        names = [competencies.get(cid, {}).get("short_name", cid) for cid in touched[:3]]
        why = (
            f"Closes gaps in {', '.join(names)}."
            if names
            else "Elective enrichment aligned to your role family."
        )
        ranked.append({"course": course, "score": round(score, 2), "why": why})

    ranked.sort(
        key=lambda row: (
            0 if row["course"]["provider"] == "iGOT Karmayogi" else 1,
            -row["score"],
        )
    )
    return ranked[:limit]
