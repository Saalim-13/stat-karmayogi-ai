"""Document → concepts → objectives → competency mapping. No invented official facts."""

from __future__ import annotations

import re

from app.core.vectorstore import ingest_text
from app.services.bloom_quiz import generate_quiz
from app.services.competency_engine import LABELS

CONCEPTS = {
    "sampling": "D-SAM",
    "stratified": "D-SAM",
    "cluster": "D-SAM",
    "weight": "D-SAM",
    "gsbpm": "D-QUA",
    "quality": "D-QUA",
    "plfs": "D-NSS",
    "lfpr": "D-NSS",
    "survey": "D-NSS",
    "regression": "F-DA",
    "correlation": "F-DA",
    "confidential": "B-INT",
    "capi": "D-FLD",
    "sdmx": "F-DIG",
}


def _chunks(text: str, size: int = 420) -> list[str]:
    words = text.split()
    rows, buf = [], []
    for word in words:
        buf.append(word)
        if len(" ".join(buf)) >= size:
            rows.append(" ".join(buf))
            buf = []
    if buf:
        rows.append(" ".join(buf))
    return rows


def analyse_document(text: str, source_name: str, ingest: bool = True) -> dict:
    cleaned = re.sub(r"\s+", " ", text).strip()
    if ingest:
        ingest_text(cleaned, source_name)
    chunks = _chunks(cleaned)
    found: dict[str, int] = {}
    lower = cleaned.lower()
    for term, cid in CONCEPTS.items():
        if term in lower:
            found[cid] = found.get(cid, 0) + lower.count(term)
    topics = [{"term": term, "competency_id": cid} for term, cid in CONCEPTS.items() if term in lower]
    objectives = [
        f"Explain {LABELS.get(cid, cid)} using only statements present in {source_name}."
        for cid in found
    ]
    quiz = generate_quiz(cleaned, source_name) if len(cleaned) >= 40 else {"questions": [], "engine": "bloom-rules"}
    return {
        "source_name": source_name,
        "source_kind": "uploaded",
        "chunk_count": len(chunks),
        "concepts": [{"competency_id": cid, "label": LABELS.get(cid, cid), "mentions": n} for cid, n in found.items()],
        "topics": topics,
        "learning_objectives": objectives or ["Identify the main statistical idea stated in the source without adding unofficial numbers."],
        "questions": quiz.get("questions") or [],
        "competency_ids": list(found),
        "pipeline": [
            "DOCUMENT",
            "TEXT EXTRACTION",
            "CHUNKING",
            "CONCEPT EXTRACTION",
            "TOPIC EXTRACTION",
            "KNOWLEDGE GRAPH",
            "LEARNING OBJECTIVES",
            "QUESTIONS",
            "ASSESSMENT",
            "COMPETENCY MAPPING",
        ],
        "note": "Questions are generated only from source sentences. Missing facts are not fabricated.",
    }
