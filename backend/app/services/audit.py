"""In-memory audit trail for demonstration. Replace with a durable store in production."""

from __future__ import annotations

from datetime import datetime, timezone

_EVENTS: list[dict] = []


def record(actor: str, action: str, detail: str) -> dict:
    event = {
        "at": datetime.now(timezone.utc).isoformat(),
        "actor": actor,
        "action": action,
        "detail": detail[:500],
    }
    _EVENTS.append(event)
    return event


def recent(limit: int = 40) -> list[dict]:
    return list(reversed(_EVENTS[-limit:]))
