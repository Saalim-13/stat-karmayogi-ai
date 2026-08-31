"""Role competency model and transparent gap calculation.

Required levels are configurable demonstration targets, not official
government job specifications.
"""

from __future__ import annotations

from typing import Literal

Priority = Literal["Critical", "High", "Medium", "On track"]

# Scoring method used everywhere in the demo:
# current = 60% diagnostic + 40% practice when both exist; otherwise use the
# available evidence; otherwise the 45% unassessed baseline. Gap is always
# max(0, required - current). These are configurable demo weights, not a
# personnel-evaluation formula.
DIAGNOSTIC_WEIGHT = 0.60
PRACTICE_WEIGHT = 0.40
UNASSESSED_BASELINE = 45

ROLE_MODELS: dict[str, dict] = {
    "statistical-officer": {
        "label": "Statistical Officer",
        "description": "Produces, validates and interprets official statistics.",
        "targets": {
            "D-SAM": 85,
            "D-QUA": 80,
            "F-DA": 75,
            "D-NSS": 85,
            "B-INT": 90,
            "F-DIG": 70,
        },
    },
    "survey-officer": {
        "label": "Survey Officer",
        "description": "Manages collection quality and survey-method implementation.",
        "targets": {
            "D-SAM": 85,
            "D-NSS": 80,
            "D-FLD": 85,
            "D-QUA": 75,
            "B-INT": 90,
            "F-DIG": 65,
        },
    },
    "data-analyst": {
        "label": "Data Analyst",
        "description": "Transforms validated statistical data into reliable insight.",
        "targets": {
            "F-DA": 85,
            "F-DIG": 80,
            "D-QUA": 75,
            "D-SAM": 70,
            "B-INT": 90,
            "D-NSS": 65,
        },
    },
    "data-processing": {
        "label": "Data Entry / Processing",
        "description": "Supports accurate capture, validation and processing of survey data.",
        "targets": {"D-FLD": 80, "D-QUA": 80, "F-DIG": 75, "B-INT": 90, "D-SAM": 60},
    },
    "research": {
        "label": "Research role",
        "description": "Interprets official statistics and documents methods transparently.",
        "targets": {"F-DA": 85, "D-NSS": 75, "D-SAM": 75, "D-QUA": 80, "B-INT": 90},
    },
    "training-hr": {
        "label": "Training / HR role",
        "description": "Designs capacity-building using competency evidence, not only completions.",
        "targets": {"F-DA": 70, "D-QUA": 70, "B-INT": 85, "F-DIG": 70},
    },
    "admin": {
        "label": "Admin",
        "description": "Manages authorised configuration and aggregate capacity-building insights.",
        "targets": {},
    },
}

LABELS = {
    "D-SAM": "Sampling",
    "D-QUA": "Data Quality",
    "F-DA": "Regression / Analysis",
    "D-NSS": "Survey Methodology",
    "B-INT": "Integrity & Confidentiality",
    "F-DIG": "Digital skills",
    "D-FLD": "Field operations",
}


def role_id_from_label(role: str) -> str:
    lowered = role.lower()
    mapping = [
        ("survey", "survey-officer"),
        ("analyst", "data-analyst"),
        ("entry", "data-processing"),
        ("processing", "data-processing"),
        ("research", "research"),
        ("training", "training-hr"),
        ("hr", "training-hr"),
    ]
    for token, rid in mapping:
        if token in lowered:
            return rid
    return "statistical-officer"


def priority_for_gap(gap: int) -> Priority:
    if gap >= 35:
        return "Critical"
    if gap >= 20:
        return "High"
    if gap > 0:
        return "Medium"
    return "On track"


def blend_current(diagnostic: int | None, practice: int | None, baseline: int = UNASSESSED_BASELINE) -> int:
    if diagnostic is not None and practice is not None:
        return max(0, min(100, round(diagnostic * DIAGNOSTIC_WEIGHT + practice * PRACTICE_WEIGHT)))
    if practice is not None:
        return practice
    if diagnostic is not None:
        return diagnostic
    return baseline


def build_competency_state(
    role: str,
    diagnostics: dict[str, int],
    practice: dict[str, int],
    custom_targets: dict[str, int] | None = None,
) -> list[dict]:
    rid = role_id_from_label(role)
    targets = {**ROLE_MODELS[rid]["targets"], **(custom_targets or {})}
    rows: list[dict] = []
    for cid, required in targets.items():
        current = blend_current(diagnostics.get(cid), practice.get(cid))
        gap = max(0, required - current)
        rows.append(
            {
                "competency_id": cid,
                "label": LABELS.get(cid, cid),
                "required": required,
                "current": current,
                "gap": gap,
                "priority": priority_for_gap(gap),
            }
        )
    return sorted(rows, key=lambda row: row["gap"], reverse=True)


def scoring_method() -> dict:
    """Human-readable method used in evaluators' explainability views."""
    return {
        "current_competency": f"{int(DIAGNOSTIC_WEIGHT * 100)}% diagnostic + {int(PRACTICE_WEIGHT * 100)}% practice when both are available; otherwise use the available evidence.",
        "unassessed_baseline": UNASSESSED_BASELINE,
        "gap": "max(0, required competency − current competency)",
        "priority_thresholds": {"Critical": "gap ≥ 35", "High": "gap ≥ 20", "Medium": "gap 1–19", "On track": "gap = 0"},
        "note": "Targets and weights are configurable demonstration policy values, not official government job requirements.",
    }
