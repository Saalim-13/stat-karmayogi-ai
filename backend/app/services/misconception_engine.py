"""Classify likely reasons for incorrect answers from option contrast."""

from __future__ import annotations

from typing import Literal

Kind = Literal[
    "conceptual_misunderstanding",
    "calculation_error",
    "terminology_confusion",
    "misinterpretation",
    "prerequisite_gap",
    "careless_mistake",
]

PAIRS: list[tuple[str, str, Kind, str]] = [
    ("stratified", "cluster", "terminology_confusion", "The learner may be mixing stratified sampling with cluster sampling."),
    ("lfpr", "unemployment", "conceptual_misunderstanding", "Labour-force participation is being confused with unemployment."),
    ("cws", "usual", "terminology_confusion", "Current weekly status is being confused with usual status."),
    ("cpi", "wpi", "terminology_confusion", "CPI is being confused with WPI."),
    ("weight", "census", "conceptual_misunderstanding", "Sampling weights are being treated as a census substitute."),
]


def classify(question: str, correct: str, selected: str | None, competency_id: str | None) -> dict:
    blob = f"{question} {correct} {selected or ''}".lower()
    kind: Kind = "misinterpretation"
    reason = "The selected option does not match the source-supported definition."
    for a, b, mapped, text in PAIRS:
        if a in blob and b in blob:
            kind, reason = mapped, text
            break
    if selected and "calculate" in blob:
        kind = "calculation_error"
        reason = "The stem asks for a calculation; the mismatch may be arithmetic rather than the concept."
    if competency_id == "F-DA" and selected and "cause" in blob:
        kind = "prerequisite_gap"
        reason = "Causal language on a regression item often signals a missing prerequisite on association vs causation."
    return {
        "kind": kind,
        "reason": reason,
        "competency_id": competency_id,
        "remediation": {
            "simple_explanation": "Restate the definition in one sentence, then name what it is not.",
            "comparison": "Place the correct term beside the nearest look-alike term.",
            "example": "Use a small official-statistics scenario, not a fabricated national estimate.",
            "practice": "Ask one diagnostic item, then one application item.",
            "retest": "Retest after a short gap; mastery is verified by the retest, not the first correction.",
        },
    }
