from __future__ import annotations

import hashlib
import re
from typing import Literal

Bloom = Literal["Remember", "Understand", "Apply", "Analyse"]

DISTRACTOR_BANK: dict[str, list[str]] = {
    "CPI": ["WPI", "IIP", "GDP deflator", "Sensex"],
    "WPI": ["CPI", "IIP", "GVA", "repo rate"],
    "IIP": ["CPI", "WPI", "fiscal deficit", "HDI"],
    "GVA": ["GDP at market prices only", "fiscal deficit", "CPI", "LFPR"],
    "GDP": ["GVA at basic prices only", "WPI", "PLFS", "SDMX"],
    "LFPR": ["WPR", "unemployment rate", "GVA", "IIP"],
    "WPR": ["LFPR", "unemployment rate", "CPI", "GSBPM"],
    "PLFS": ["ASI", "Economic Census only", "WPI", "Union Budget"],
    "GSBPM": ["SDMX", "FRACs", "GSTN", "UPI"],
    "SDMX": ["GSBPM", "Aadhaar", "IFSC", "NIC code"],
    "CAPI": ["PAPI only", "CATI exclusively", "postal census", "manual ledgers"],
    "NSS": ["ASI", "RBI household survey only", "NFHS exclusively", "AISHE"],
    "CWS": ["usual principal status", "lifetime status", "census night", "base year"],
}

TERM_TO_COMP = {
    "CPI": "D-PRI",
    "WPI": "D-PRI",
    "IIP": "D-PRI",
    "GVA": "D-NAS",
    "GDP": "D-NAS",
    "LFPR": "D-NSS",
    "WPR": "D-NSS",
    "PLFS": "D-NSS",
    "GSBPM": "D-QUA",
    "SDMX": "D-QUA",
    "CAPI": "D-FLD",
    "NSS": "D-SAM",
    "CWS": "D-NSS",
    "sampling": "D-SAM",
    "confidential": "B-INT",
    "SDG": "D-SDG",
}

KEYWORD_COMP = [
    ("confidential", "B-INT"),
    ("plfs", "D-NSS"),
    ("sampling", "D-SAM"),
    ("gva", "D-NAS"),
    ("gsbpm", "D-QUA"),
    ("capi", "D-FLD"),
    ("sdg", "D-SDG"),
    ("igot", "F-DIG"),
]


def _hash_id(value: str) -> str:
    return "q-" + hashlib.sha1(value.encode()).hexdigest()[:10]


def _sentences(text: str) -> list[str]:
    cleaned = re.sub(r"\s+", " ", text).strip()
    parts = re.split(r"(?<=[.?!])\s+", cleaned)
    return [s.strip() for s in parts if 50 <= len(s.strip()) <= 320]


def _shuffle(items: list[str], seed: int) -> list[str]:
    out = list(items)
    s = seed or 1
    for i in range(len(out) - 1, 0, -1):
        s = (s * 16807) % 2147483647
        j = s % (i + 1)
        out[i], out[j] = out[j], out[i]
    return out


def _find_key(sentence: str) -> tuple[str, str] | None:
    keys = sorted(DISTRACTOR_BANK, key=len, reverse=True)
    for key in keys:
        match = re.search(rf"\b{re.escape(key)}\b", sentence, re.I)
        if match:
            return key, match.group(0)
    quoted = re.search(r"\b([A-Z]{2,}(?:\s[A-Z]{2,}){0,3})\b", sentence)
    if quoted and len(quoted.group(1)) >= 3:
        return quoted.group(1), quoted.group(1)
    return None


def _infer_competency(text: str, key: str | None = None) -> str | None:
    if key:
        for term, cid in TERM_TO_COMP.items():
            if term.lower() in key.lower():
                return cid
    lower = text.lower()
    for keyword, cid in KEYWORD_COMP:
        if keyword in lower:
            return cid
    return None


def _mcq(
    question: str,
    options: list[str],
    correct: str,
    explanation: str,
    bloom: Bloom,
    excerpt: str,
    competency_id: str | None,
) -> dict | None:
    unique: list[str] = []
    for opt in options:
        if opt not in unique:
            unique.append(opt)
    if len(unique) < 4:
        for filler in ["base year", "listing", "deflator", "stratum"]:
            if len(unique) >= 4:
                break
            if filler not in unique:
                unique.append(filler)
    shuffled = _shuffle(unique[:4], len(question))
    try:
        correct_index = next(i for i, o in enumerate(shuffled) if o.lower() == correct.lower())
    except StopIteration:
        return None
    return {
        "id": _hash_id(question + excerpt),
        "question": question,
        "options": shuffled,
        "correct_index": correct_index,
        "explanation": explanation,
        "bloom": bloom,
        "competency_id": competency_id,
        "source_excerpt": excerpt,
        "topic": competency_id,
        "difficulty": "Beginner" if bloom in {"Remember", "Understand"} else "Advanced",
        "learning_objective": f"Use the source excerpt to apply {competency_id or 'the stated concept'}.",
        "source_reference": excerpt,
    }


def _remember(sentence: str) -> dict | None:
    found = _find_key(sentence)
    if not found:
        return None
    key, span = found
    blanked = re.sub(re.escape(span), "________", sentence, count=1, flags=re.I)
    extras = DISTRACTOR_BANK.get(key, ["GSBPM", "WPI", "LFPR", "IIP"])
    return _mcq(
        question=f'Fill the blank from the learning material:\n“{blanked}”',
        options=[span, *extras],
        correct=span,
        explanation=f'The source states: “{sentence}”',
        bloom="Remember",
        excerpt=sentence,
        competency_id=_infer_competency(sentence, key),
    )


def _understand(sentence: str, index: int) -> dict | None:
    found = _find_key(sentence)
    if not found or found[0] not in DISTRACTOR_BANK:
        return None
    key, span = found
    wrong = DISTRACTOR_BANK[key][index % len(DISTRACTOR_BANK[key])]
    warped = re.sub(re.escape(span), wrong, sentence, count=1, flags=re.I)
    stem = sentence.rstrip(".")
    return _mcq(
        question="Which statement is consistent with the uploaded material?",
        options=[
            stem,
            warped.rstrip("."),
            f"{key} is unrelated to official statistics in India.",
            f"The material defines {key} as a fiscal deficit indicator.",
        ],
        correct=stem,
        explanation=f'Correct wording from the source: “{sentence}”',
        bloom="Understand",
        excerpt=sentence,
        competency_id=_infer_competency(sentence, key),
    )


def _apply(sentence: str) -> dict | None:
    found = _find_key(sentence)
    if not found:
        return None
    key, span = found
    return _mcq(
        question=f"An officer is applying this material in the field. What should they treat as the correct concept for {key}?",
        options=[span, *DISTRACTOR_BANK.get(key, ["GSBPM", "WPI", "LFPR", "IIP"])],
        correct=span,
        explanation=f"Apply the source definition: “{sentence}”",
        bloom="Apply",
        excerpt=sentence,
        competency_id=_infer_competency(sentence, key),
    )


def _analyse(sentence: str, index: int) -> dict | None:
    found = _find_key(sentence)
    if not found or found[0] not in DISTRACTOR_BANK:
        return None
    key, span = found
    distractor = DISTRACTOR_BANK[key][index % len(DISTRACTOR_BANK[key])]
    return _mcq(
        question=f"Compare the source with a common mix-up. Which contrast is accurate?",
        options=[
            f"{span} is described in the material; {distractor} is not a substitute here.",
            f"{distractor} replaces {span} in all official releases.",
            f"{span} and {distractor} are identical indicators.",
            "The excerpt does not support any comparison.",
        ],
        correct=f"{span} is described in the material; {distractor} is not a substitute here.",
        explanation=f"The excerpt supports {span}: “{sentence}”",
        bloom="Analyse",
        excerpt=sentence,
        competency_id=_infer_competency(sentence, key),
    )


GENERATORS = {
    "Remember": lambda s, i: _remember(s),
    "Understand": lambda s, i: _understand(s, i),
    "Apply": lambda s, i: _apply(s),
    "Analyse": lambda s, i: _analyse(s, i),
}


def generate_quiz(text: str, source_name: str, bloom_mix: list[Bloom] | None = None) -> dict:
    levels: list[Bloom] = bloom_mix or ["Remember", "Understand", "Apply", "Analyse"]
    sentences = _sentences(text)
    questions: list[dict] = []
    seen: set[str] = set()

    for i, sentence in enumerate(sentences):
        if len(questions) >= 12:
            break
        level = levels[i % len(levels)]
        item = GENERATORS[level](sentence, i)
        if item and item["question"] not in seen:
            seen.add(item["question"])
            questions.append(item)

    competency_ids = list({q["competency_id"] for q in questions if q.get("competency_id")})
    title_source = re.sub(r"\.[^.]+$", "", source_name)
    output = {
        "id": _hash_id(source_name + str(len(questions))),
        "title": f"MCQ set · {title_source}",
        "source_name": source_name,
        "questions": questions[:12],
        "competency_ids": competency_ids,
        "engine": "bloom-rules",
    }
    from app.services.metrics import record_quiz
    record_quiz(output["questions"])
    return output
