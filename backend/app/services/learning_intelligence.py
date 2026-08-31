"""Evidence-led learning decisions for the demo competency loop.

This module deliberately does not persist learner data. The caller supplies
minimal, browser-local evidence and receives an explainable recommendation.
"""

from __future__ import annotations

from typing import Literal

TopicState = Literal["CURRENTLY LEARNING", "STRUGGLING", "IMPROVING", "MASTERED", "RETENTION RISK"]


def topic_state(mastery: int, accuracy: int | None, days_since_review: int, mistakes: int) -> TopicState:
    if mastery >= 80 and days_since_review >= 7:
        return "RETENTION RISK"
    if mastery >= 80 and (accuracy is None or accuracy >= 75):
        return "MASTERED"
    if mistakes >= 2 or (accuracy is not None and accuracy < 50):
        return "STRUGGLING"
    if mastery >= 60 or (accuracy is not None and accuracy >= 65):
        return "IMPROVING"
    return "CURRENTLY LEARNING"


def select_intervention(topic: str, gap: int, accuracy: int | None, confidence: str, mistakes: int, preference: str) -> dict:
    if mistakes >= 2 or (accuracy is not None and accuracy < 45):
        intervention = "Worked example + prerequisite explanation"
        why = "Repeated errors suggest a misconception or missing prerequisite; another undifferentiated MCQ would not address it."
    elif gap >= 30:
        intervention = "Short lesson + guided practice"
        why = "The gap is material, so establish the concept before testing application."
    elif confidence.lower() in {"low", "confused"}:
        intervention = "Real-world case study + comparison"
        why = "The learner reports uncertainty; contextual comparison is more useful than increasing question volume."
    elif accuracy is not None and accuracy >= 80:
        intervention = "Role simulation + application question"
        why = "Recent accuracy is strong; the next useful evidence is practical application."
    else:
        intervention = "Adaptive practice set"
        why = "Current evidence supports a short practice cycle followed by a targeted check."
    if "Examples" in preference and "example" not in intervention.lower():
        intervention += " with example first"
    return {"topic": topic, "intervention": intervention, "why": why, "gap": gap}


def difficulty_curve(accuracy: int | None, mistakes: int, confidence: str, mastery: int) -> dict:
    if mistakes >= 2 or (accuracy is not None and accuracy < 50) or confidence.lower() in {"low", "confused"}:
        sequence = ["Beginner diagnostic", "Beginner practice", "Intermediate only after a correct retest"]
        rationale = "Keep the curve gentle while the learner resolves a misconception."
    elif accuracy is not None and accuracy >= 85 and mastery >= 70:
        sequence = ["Intermediate application", "Advanced scenario", "Advanced interpretation"]
        rationale = "Strong, recent evidence supports a move from recall to application."
    else:
        sequence = ["Beginner review", "Intermediate practice", "Intermediate application"]
        rationale = "Increase difficulty one evidence step at a time rather than using a fixed ladder."
    return {"sequence": sequence, "rationale": rationale}


def revision_plan(topic: str, accuracy: int | None, confidence: str, mistakes: int, days_since_review: int) -> dict:
    risk = "High" if mistakes >= 2 or (accuracy is not None and accuracy < 50) else "Medium" if days_since_review >= 7 or confidence.lower() in {"low", "confused"} else "Low"
    if risk == "High":
        due, minutes = "Today", 5
    elif risk == "Medium":
        due, minutes = "Within 2 days", 5
    else:
        due, minutes = "Within 5 days", 3
    return {"topic": topic, "memory_risk": risk, "due": due, "minutes": minutes, "pack": ["one key takeaway", "five flashcards", "three targeted questions"], "why": "Timing adapts to recorded accuracy, confidence, mistake frequency and time since review."}


def what_if(current: int, target: int, daily_minutes: int, days: int, focus_first: bool) -> dict:
    # Conservative, transparent demo assumption: focused practice produces up to
    # 0.18 competency points per study-hour; non-focused study gets 60% of this.
    hours = daily_minutes * days / 60
    projected_gain = round(min(max(0, target - current), hours * 0.18 * (1 if focus_first else 0.6)))
    projected = min(100, current + projected_gain)
    return {"label": "SIMULATION / ESTIMATE", "current": current, "target": target, "daily_minutes": daily_minutes, "days": days, "focus_first": focus_first, "projected": projected, "projected_gain": projected_gain, "assumption": "A configurable conservative learning-rate assumption, not a promise or an employment prediction."}


def build_learning_intelligence(payload: dict) -> dict:
    topic = str(payload.get("topic") or "Sampling")
    mastery = max(0, min(100, int(payload.get("mastery") or 45)))
    accuracy_value = payload.get("accuracy")
    accuracy = max(0, min(100, int(accuracy_value))) if accuracy_value is not None else None
    mistakes = max(0, int(payload.get("mistakes") or 0))
    review_days = max(0, int(payload.get("days_since_review") or 0))
    confidence = str(payload.get("confidence") or "medium")
    gap = max(0, int(payload.get("gap") or 100 - mastery))
    preference = str(payload.get("preference") or "Examples first")
    state = topic_state(mastery, accuracy, review_days, mistakes)
    return {"topic_state": {"topic": topic, "state": state, "mastery": mastery, "accuracy": accuracy}, "intervention": select_intervention(topic, gap, accuracy, confidence, mistakes, preference), "difficulty_curve": difficulty_curve(accuracy, mistakes, confidence, mastery), "revision": revision_plan(topic, accuracy, confidence, mistakes, review_days), "what_if": what_if(mastery, int(payload.get("target") or 85), int(payload.get("daily_minutes") or 20), int(payload.get("days") or 30), bool(payload.get("focus_first", True))), "disclaimer": "Recommendations are generated from the supplied learning evidence. They are guidance, not official personnel or examination decisions."}
