"""Measurable training impact from actual before/after competency vectors."""

from __future__ import annotations


def _delta(before: dict[str, int], after: dict[str, int]) -> list[dict]:
    keys = sorted(set(before) | set(after))
    rows = []
    for key in keys:
        b = int(before.get(key, 0))
        a = int(after.get(key, 0))
        rows.append({"competency_id": key, "before": b, "after": a, "points": a - b})
    return rows


def training_impact_score(
    pre: int | None,
    post: int | None,
    retention: int | None,
    practice_accuracy: int | None,
    application: int | None,
) -> dict:
    parts = []
    if pre is not None and post is not None:
        parts.append(("pre_post", max(0, post - pre), 0.35))
    if retention is not None and post is not None:
        parts.append(("retention", max(0, 100 - abs(post - retention)), 0.25))
    if practice_accuracy is not None:
        parts.append(("practice", practice_accuracy, 0.2))
    if application is not None:
        parts.append(("application", application, 0.2))
    if not parts:
        return {"score": None, "components": [], "note": "Insufficient evidence. Complete pre, post, or practice first."}
    weight_sum = sum(w for _, _, w in parts)
    score = round(sum(value * w for _, value, w in parts) / weight_sum)
    return {
        "score": min(100, score),
        "components": [{"name": name, "value": value, "weight": w} for name, value, w in parts],
        "note": "Calculated from recorded learner signals only. Not a monetary ROI.",
    }


def impact_report(payload: dict) -> dict:
    before = {k: int(v) for k, v in (payload.get("before") or {}).items()}
    after = {k: int(v) for k, v in (payload.get("after") or {}).items()}
    required = {k: int(v) for k, v in (payload.get("required") or {}).items()}
    rows = _delta(before, after)
    gap_before = sum(max(0, required.get(r["competency_id"], r["before"]) - r["before"]) for r in rows)
    gap_after = sum(max(0, required.get(r["competency_id"], r["after"]) - r["after"]) for r in rows)
    closed = max(0, gap_before - gap_after)
    closure_pct = round(closed / gap_before * 100) if gap_before else 100
    pre = payload.get("pre")
    post = payload.get("post")
    retention = payload.get("retention")
    value = {
        "minutes_invested": int(payload.get("minutes_invested") or 0),
        "topics_mastered": int(payload.get("topics_mastered") or 0),
        "competency_points": sum(max(0, r["points"]) for r in rows),
        "questions_improved": int(payload.get("questions_improved") or 0),
        "misconceptions_resolved": int(payload.get("misconceptions_resolved") or 0),
        "gap_reduction": closed,
    }
    return {
        "rows": rows,
        "gap_before": gap_before,
        "gap_after": gap_after,
        "gap_closed": closed,
        "gap_closure_pct": closure_pct,
        "training_impact": training_impact_score(
            pre, post, retention, payload.get("practice_accuracy"), payload.get("application")
        ),
        "learning_value": value,
        "evidence": {"pre": pre, "post": post, "retention": retention},
        "demo": bool(payload.get("demo")),
    }
