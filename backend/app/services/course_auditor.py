"""Transparent course-to-competency coverage checks for trainer review."""

from __future__ import annotations

from app.services.competency_engine import LABELS, ROLE_MODELS, role_id_from_label

SIGNALS = {
    "D-SAM": ("sampling", "sample", "stratified", "cluster", "weight"),
    "D-QUA": ("quality", "gsbpm", "validation", "missing", "outlier"),
    "F-DA": ("analysis", "regression", "correlation", "interpret"),
    "D-NSS": ("survey", "plfs", "lfpr", "fieldwork"),
    "B-INT": ("confidential", "integrity", "privacy", "ethics"),
    "F-DIG": ("digital", "sdmx", "metadata", "capi"),
    "D-FLD": ("field", "callback", "enumerat", "interview"),
}


def audit_course(course_text: str, role: str) -> dict:
    lowered = course_text.lower()
    role_id = role_id_from_label(role)
    required = ROLE_MODELS[role_id]["targets"]
    rows = []
    for competency_id, target in required.items():
        hits = [signal for signal in SIGNALS.get(competency_id, ()) if signal in lowered]
        coverage = "Covered" if len(hits) >= 2 else "Partially covered" if hits else "Missing"
        rows.append({"competency_id": competency_id, "competency": LABELS.get(competency_id, competency_id), "required": target, "coverage": coverage, "evidence_terms": hits})
    rows.sort(key=lambda row: (row["coverage"] != "Missing", -row["required"]))
    missing = [row["competency"] for row in rows if row["coverage"] == "Missing"]
    partial = [row["competency"] for row in rows if row["coverage"] == "Partially covered"]
    return {"role": ROLE_MODELS[role_id]["label"], "coverage": rows, "summary": {"covered": sum(row["coverage"] == "Covered" for row in rows), "partial": len(partial), "missing": len(missing)}, "recommendation": "Add a learning objective, worked example and mapped assessment item for: " + ", ".join((missing + partial)[:3]) if missing or partial else "Coverage signals exist for every configured competency. A trainer should still review quality, prerequisites and assessment alignment.", "disclaimer": "This is a transparent keyword-based curriculum aid for trainer review, not an official accreditation or content-quality approval."}
