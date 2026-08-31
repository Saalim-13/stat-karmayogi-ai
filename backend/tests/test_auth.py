from fastapi.testclient import TestClient

from app.main import app


def test_quiz_generation_requires_a_learner_token() -> None:
    client = TestClient(app)
    response = client.post("/api/mcq/generate", json={"text": "The Periodic Labour Force Survey is a source of labour force statistics in India."})
    assert response.status_code == 401


def test_admin_only_course_audit_rejects_a_learner_token(tmp_path, monkeypatch) -> None:
    from app import repositories
    from app.api import auth
    from app.core import database

    database_url = f"sqlite:///{tmp_path / 'auth.db'}"
    monkeypatch.setattr(database.settings, "database_url", database_url)
    database.initialize_database(database_url)
    repository = repositories.SQLiteLearnerRepository()
    monkeypatch.setattr(repositories, "learner_repository", repository)
    monkeypatch.setattr(auth, "learner_repository", repository)
    client = TestClient(app)
    registered = client.post("/api/auth/register", json={"name": "Asha", "email": "asha@example.test", "password": "safe-demo-password"})
    token = registered.json()["access_token"]
    response = client.post("/api/intelligence/course-audit", json={"course_text": "This course teaches sampling and data quality in official statistics."}, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
