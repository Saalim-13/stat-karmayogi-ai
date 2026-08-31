"""Small database boundary. SQLite now; repositories keep business logic portable."""

from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from app.core.config import settings


def sqlite_path(database_url: str | None = None) -> str:
    url = database_url or settings.database_url
    if not url.startswith("sqlite:///"):
        raise ValueError("This demo database adapter supports sqlite:/// URLs only.")
    path = url.removeprefix("sqlite:///")
    if path != ":memory:":
        Path(path).parent.mkdir(parents=True, exist_ok=True)
    return path


@contextmanager
def connection(database_url: str | None = None) -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(sqlite_path(database_url))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


SCHEMA = """
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY, label TEXT NOT NULL UNIQUE, description TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE,
  role_id TEXT NOT NULL REFERENCES roles(id), preferred_language TEXT NOT NULL DEFAULT 'en',
  goal TEXT, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS competencies (
  id TEXT PRIMARY KEY, label TEXT NOT NULL, description TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100), kind TEXT NOT NULL,
  evidence_json TEXT NOT NULL DEFAULT '{}', completed_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), question_id TEXT NOT NULL,
  competency_id TEXT REFERENCES competencies(id), correct INTEGER NOT NULL CHECK(correct IN (0, 1)),
  difficulty TEXT, attempted_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS progress_history (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  competency_id TEXT NOT NULL REFERENCES competencies(id), current_score INTEGER NOT NULL CHECK(current_score BETWEEN 0 AND 100),
  required_score INTEGER NOT NULL CHECK(required_score BETWEEN 0 AND 100), source TEXT NOT NULL, recorded_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_assessments_user_time ON assessments(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_attempts_user_time ON quiz_attempts(user_id, attempted_at);
CREATE INDEX IF NOT EXISTS idx_progress_user_comp_time ON progress_history(user_id, competency_id, recorded_at);
"""


def initialize_database(database_url: str | None = None) -> None:
    with connection(database_url) as conn:
        conn.executescript(SCHEMA)
        columns = {row["name"] for row in conn.execute("PRAGMA table_info(users)")}
        if "password_hash" not in columns:
            conn.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
