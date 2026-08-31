"""AI Learning Orchestrator: next-best-action from the Digital Twin."""

from __future__ import annotations

from app.services.digital_twin import build_twin

LANGUAGE_LABELS = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
    "ml": "Malayalam",
    "bn": "Bengali",
    "mr": "Marathi",
    "gu": "Gujarati",
    "pa": "Punjabi",
    "or": "Odia",
    "as": "Assamese",
}


def _minutes_split(available: int) -> dict:
    if available <= 12:
        return {"revision": 3, "practice": 4, "assessment": 3, "mode": "micro"}
    if available <= 25:
        return {"revision": 5, "practice": 10, "assessment": 5, "mode": "sprint"}
    return {
        "foundation": max(8, round(available * 0.2)),
        "learning": max(12, round(available * 0.35)),
        "practice": max(10, round(available * 0.25)),
        "assessment": max(6, round(available * 0.12)),
        "reflection": max(4, available - (round(available * 0.2) + round(available * 0.35) + round(available * 0.25) + round(available * 0.12))),
        "mode": "session",
    }


def next_best_action(payload: dict) -> dict:
    twin = build_twin(payload)
    # A configured target with no learner evidence is an invitation to assess, not
    # enough reason to displace a measured weak competency.  Prefer the largest
    # observed gap whenever diagnostic or practice evidence is available.
    observed = set((payload.get("diagnostics") or {})) | set((payload.get("practice") or {}))
    candidates = [item for item in twin["competencies"] if item["competency_id"] in observed]
    focus = candidates[0] if candidates else (twin["competencies"][0] if twin["competencies"] else None)
    if not focus:
        return {"twin": twin, "action": None}
    minutes = int(payload.get("daily_minutes") or 20)
    lang = LANGUAGE_LABELS.get(str(payload.get("language") or "en"), "English")
    plan = _minutes_split(minutes)
    why = {
        "competency": focus["label"],
        "current": focus["current"],
        "required": focus["required"],
        "gap": focus["gap"],
        "role_importance": "HIGH" if focus["gap"] >= 20 else "MEDIUM",
        "recent_accuracy": focus["current"],
        "exam_relevance": "HIGH",
        "retention_risk": "MEDIUM" if focus["current"] < 70 else "LOW",
        "priority": focus["priority"],
    }
    headline = (
        f"{twin['learner']}, your highest priority is {focus['label']}."
        if focus["gap"]
        else f"{twin['learner']}, retain {focus['label']} with a short check."
    )
    return {
        "twin": twin,
        "action": {
            "headline": headline,
            "why": why,
            "recommended": {
                "language": lang,
                "minutes": minutes if minutes <= 25 else min(minutes, 45),
                "learning_session": f"{min(minutes, 20)}-minute {lang} learning session",
                "practice_questions": 5 if minutes < 40 else 8,
                "adaptive_quiz": True,
                "plan": plan,
            },
            "therefore": f"Priority = {focus['priority']} because gap {focus['gap']} points, role importance {why['role_importance']}, recent accuracy {focus['current']}%.",
        },
    }


def time_aware_plan(available_minutes: int, language: str, topic: str) -> dict:
    lang = LANGUAGE_LABELS.get(language, "English")
    split = _minutes_split(available_minutes)
    return {
        "topic": topic,
        "language": lang,
        "available_minutes": available_minutes,
        "blocks": split,
        "note": "Plan is generated from available time and the current twin priority. It is guidance, not a mandated roster.",
    }
