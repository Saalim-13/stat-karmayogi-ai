"""Repository interfaces and SQLite implementation for learner evidence."""

from __future__ import annotations

import json
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from uuid import uuid4

from app.core.database import connection
from app.services.competency_engine import LABELS, ROLE_MODELS


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class LearnerRepository(ABC):
    @abstractmethod
    def create_user(self, name: str, role_id: str, email: str | None, language: str, goal: str | None) -> dict: ...
    @abstractmethod
    def get_user(self, user_id: str) -> dict | None: ...
    @abstractmethod
    def save_assessment(self, user_id: str, score: int, kind: str, evidence: dict) -> dict: ...
    @abstractmethod
    def record_quiz_attempt(self, user_id: str, question_id: str, competency_id: str | None, correct: bool, difficulty: str | None) -> dict: ...
    @abstractmethod
    def record_progress(self, user_id: str, competency_id: str, current_score: int, required_score: int, source: str) -> dict: ...
    @abstractmethod
    def learner_summary(self, user_id: str) -> dict | None: ...
    @abstractmethod
    def create_identity(self, name: str, email: str, role_id: str, password_hash: str, language: str) -> dict: ...
    @abstractmethod
    def get_user_by_email(self, email: str) -> dict | None: ...


class SQLiteLearnerRepository(LearnerRepository):
    def _seed_reference_data(self) -> None:
        with connection() as conn:
            for role_id, role in ROLE_MODELS.items():
                conn.execute("INSERT OR IGNORE INTO roles(id, label, description) VALUES (?, ?, ?)", (role_id, role["label"], role["description"]))
            for competency_id, label in LABELS.items():
                conn.execute("INSERT OR IGNORE INTO competencies(id, label) VALUES (?, ?)", (competency_id, label))

    def create_user(self, name: str, role_id: str, email: str | None, language: str, goal: str | None) -> dict:
        self._seed_reference_data()
        user_id, created_at = str(uuid4()), _now()
        with connection() as conn:
            conn.execute("INSERT INTO users(id, name, email, role_id, preferred_language, goal, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", (user_id, name, email, role_id, language, goal, created_at))
        return self.get_user(user_id) or {}

    def create_identity(self, name: str, email: str, role_id: str, password_hash: str, language: str) -> dict:
        self._seed_reference_data()
        user_id, created_at = str(uuid4()), _now()
        with connection() as conn:
            conn.execute("INSERT INTO users(id, name, email, role_id, preferred_language, created_at, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)", (user_id, name, email.lower(), role_id, language, created_at, password_hash))
        return self.get_user(user_id) or {}

    def get_user_by_email(self, email: str) -> dict | None:
        with connection() as conn:
            row = conn.execute("SELECT u.id, u.name, u.email, u.preferred_language, u.goal, u.created_at, u.password_hash, r.id AS role_id, r.label AS role FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = ?", (email.lower(),)).fetchone()
        return dict(row) if row else None

    def get_user(self, user_id: str) -> dict | None:
        with connection() as conn:
            row = conn.execute("SELECT u.id, u.name, u.email, u.preferred_language, u.goal, u.created_at, r.id AS role_id, r.label AS role FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?", (user_id,)).fetchone()
        return dict(row) if row else None

    def _exists(self, conn, user_id: str) -> None:
        if not conn.execute("SELECT 1 FROM users WHERE id = ?", (user_id,)).fetchone():
            raise KeyError("Learner not found")

    def save_assessment(self, user_id: str, score: int, kind: str, evidence: dict) -> dict:
        result = {"id": str(uuid4()), "user_id": user_id, "score": score, "kind": kind, "evidence": evidence, "completed_at": _now()}
        with connection() as conn:
            self._exists(conn, user_id)
            conn.execute("INSERT INTO assessments(id, user_id, score, kind, evidence_json, completed_at) VALUES (?, ?, ?, ?, ?, ?)", (result["id"], user_id, score, kind, json.dumps(evidence), result["completed_at"]))
        return result

    def record_quiz_attempt(self, user_id: str, question_id: str, competency_id: str | None, correct: bool, difficulty: str | None) -> dict:
        result = {"id": str(uuid4()), "user_id": user_id, "question_id": question_id, "competency_id": competency_id, "correct": correct, "difficulty": difficulty, "attempted_at": _now()}
        with connection() as conn:
            self._exists(conn, user_id)
            conn.execute("INSERT INTO quiz_attempts(id, user_id, question_id, competency_id, correct, difficulty, attempted_at) VALUES (?, ?, ?, ?, ?, ?, ?)", (result["id"], user_id, question_id, competency_id, int(correct), difficulty, result["attempted_at"]))
        return result

    def record_progress(self, user_id: str, competency_id: str, current_score: int, required_score: int, source: str) -> dict:
        result = {"id": str(uuid4()), "user_id": user_id, "competency_id": competency_id, "current_score": current_score, "required_score": required_score, "source": source, "recorded_at": _now()}
        with connection() as conn:
            self._exists(conn, user_id)
            conn.execute("INSERT INTO progress_history(id, user_id, competency_id, current_score, required_score, source, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?)", (result["id"], user_id, competency_id, current_score, required_score, source, result["recorded_at"]))
        return result

    def learner_summary(self, user_id: str) -> dict | None:
        user = self.get_user(user_id)
        if not user:
            return None
        with connection() as conn:
            assessments = [dict(row) for row in conn.execute("SELECT id, score, kind, completed_at FROM assessments WHERE user_id = ? ORDER BY completed_at DESC", (user_id,))]
            attempts = conn.execute("SELECT COUNT(*) AS total, COALESCE(ROUND(AVG(correct) * 100), 0) AS accuracy FROM quiz_attempts WHERE user_id = ?", (user_id,)).fetchone()
            progress = [dict(row) for row in conn.execute("SELECT competency_id, current_score, required_score, source, recorded_at FROM progress_history WHERE user_id = ? ORDER BY recorded_at DESC", (user_id,))]
        return {"user": user, "assessments": assessments, "quiz_evidence": dict(attempts), "progress_history": progress}


learner_repository = SQLiteLearnerRepository()
