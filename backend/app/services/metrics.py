"""Small in-process quality metrics for the demo admin view."""

from __future__ import annotations

from collections import Counter

from app.core.vectorstore import retrieval_logs
from app.services.competency_engine import build_competency_state

_bloom = Counter()


def record_quiz(questions: list[dict]) -> None:
    _bloom.update(question.get("bloom", "Unknown") for question in questions)


def statistics() -> dict:
    logs = retrieval_logs(100)
    total = len(logs)
    profiles = [
        ("Statistical Officer", {"D-SAM": 48}, {}),
        ("Data Analyst", {"F-DA": 76}, {"F-DA": 86}),
        ("Survey Officer", {"D-FLD": 90}, {}),
    ]
    stable = all(build_competency_state(role, diagnostic, practice) == build_competency_state(role, diagnostic, practice) for role, diagnostic, practice in profiles)
    return {"mcq_bloom_distribution": dict(_bloom), "gap_detection_consistent": stable, "gap_consistency_profiles": len(profiles), "retrieval_hit_rate": round(sum(item["hit"] for item in logs) / total * 100, 1) if total else None, "retrieval_queries_observed": total, "note": "In-process demo metrics reset when the API restarts. Production metrics should be stored in the analytics database."}
