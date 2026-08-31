"""Competency Digital Twin: living competency state plus journey history."""

from __future__ import annotations

from app.services.competency_engine import ROLE_MODELS, build_competency_state, role_id_from_label


def mastery_label(current: int, required: int) -> str:
    if current >= required:
        return "MASTERED"
    if current >= required - 5:
        return "NEAR MASTERY"
    if current >= 70:
        return "CONSOLIDATING"
    if current >= 55:
        return "LEARNING"
    return "FOUNDATION"


def attach_journeys(states: list[dict], journeys: dict[str, list[int]]) -> list[dict]:
    out = []
    for row in states:
        path = journeys.get(row["competency_id"]) or [row["current"]]
        if path[-1] != row["current"]:
            path = [*path, row["current"]]
        out.append({**row, "journey": path, "mastery": mastery_label(row["current"], row["required"])})
    return out


def build_twin(payload: dict) -> dict:
    role = payload.get("role") or "Statistical Officer"
    diagnostics = {k: int(v) for k, v in (payload.get("diagnostics") or {}).items()}
    practice = {k: int(v) for k, v in (payload.get("practice") or {}).items()}
    journeys = payload.get("journeys") or {}
    states = attach_journeys(
        build_competency_state(role, diagnostics, practice, payload.get("custom_targets")),
        journeys,
    )
    rid = role_id_from_label(role)
    overall = round(sum(item["current"] for item in states) / max(1, len(states)))
    required_avg = round(sum(item["required"] for item in states) / max(1, len(states)))
    return {
        "learner": payload.get("name") or "Learner",
        "role": ROLE_MODELS[rid]["label"],
        "role_id": rid,
        "language": payload.get("language") or "en",
        "overall_current": overall,
        "overall_required": required_avg,
        "overall_gap": max(0, required_avg - overall),
        "competencies": states,
        "loop": [
            "ASSESS",
            "UNDERSTAND",
            "IDENTIFY GAP",
            "PRIORITIZE",
            "PERSONALIZE",
            "TEACH",
            "PRACTICE",
            "ASSESS",
            "DETECT MISCONCEPTION",
            "REVISE",
            "RETEST",
            "VERIFY MASTERY",
            "UPDATE DIGITAL TWIN",
            "RECOMMEND NEXT ACTION",
        ],
        "disclaimer": "This twin is computed from learner evidence in this session. It is not an official personnel score.",
    }
