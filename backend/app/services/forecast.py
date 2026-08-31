"""Transparent competency trajectory estimates. Never presented as guarantees."""


def forecast(current: int, target: int, velocity_points_per_session: float, sessions_available: int, with_intervention: bool) -> dict:
    raw = current + velocity_points_per_session * sessions_available
    without = max(0, min(100, round(current + velocity_points_per_session * sessions_available * 0.45)))
    with_int = max(0, min(100, round(raw + (8 if with_intervention else 0))))
    return {
        "current": current,
        "target": target,
        "estimated_without_intervention": without,
        "estimated_with_recommended_intervention": with_int,
        "likely_to_reach_target": with_int >= target,
        "label": "AI ESTIMATES",
        "disclaimer": "Estimates from recent velocity and available time. Not a guarantee of exam or personnel outcomes.",
    }


def early_warnings(payload: dict) -> list[dict]:
    warnings: list[dict] = []
    accuracy = int(payload.get("recent_accuracy") or 0)
    if accuracy and accuracy < 50:
        warnings.append(
            {
                "code": "low_scores",
                "message": f"Needs support in {payload.get('weak_topic') or 'a priority competency'}.",
                "intervention": "Short diagnostic plus a 20-minute revision on the weakest high-importance topic.",
            }
        )
    if int(payload.get("days_inactive") or 0) >= 5:
        warnings.append(
            {
                "code": "declining_activity",
                "message": "Learning activity has paused.",
                "intervention": "Offer a 10-minute micro-session rather than a long catch-up.",
            }
        )
    if int(payload.get("retention") or 100) < 60:
        warnings.append(
            {
                "code": "poor_retention",
                "message": "Needs support on retention, not only first-pass scores.",
                "intervention": "Spaced revision of missed items, then a retention check.",
            }
        )
    if payload.get("persistent_misconception"):
        warnings.append(
            {
                "code": "misconception",
                "message": str(payload["persistent_misconception"]),
                "intervention": "Comparison explanation, one example, then a targeted retest.",
            }
        )
    if int(payload.get("days_to_deadline") or 99) <= 7 and int(payload.get("gap") or 0) >= 15:
        warnings.append(
            {
                "code": "deadline",
                "message": "Deadline is close while a material gap remains.",
                "intervention": "Protect daily minutes for the single highest-gap competency.",
            }
        )
    return warnings
