from fastapi.testclient import TestClient

from app.main import app


def test_learner_evidence_persists_across_api_calls(tmp_path, monkeypatch) -> None:
    from app import repositories
    from app.core import database
    from app.api import learners

    database_url = f"sqlite:///{tmp_path / 'learner.db'}"
    monkeypatch.setattr(database.settings, "database_url", database_url)
    database.initialize_database(database_url)
    repository = repositories.SQLiteLearnerRepository()
    monkeypatch.setattr(repositories, "learner_repository", repository)
    monkeypatch.setattr(learners, "learner_repository", repository)

    client = TestClient(app)
    created = client.post("/api/auth/register", json={"name": "Priya", "email": "priya@example.test", "password": "safe-demo-password", "role_id": "statistical-officer", "preferred_language": "ta"})
    assert created.status_code == 201
    user_id = created.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {created.json()['access_token']}"}
    assert client.post(f"/api/learners/{user_id}/assessments", json={"score": 48, "evidence": {"D-SAM": 48}}, headers=headers).status_code == 201
    assert client.post(f"/api/learners/{user_id}/quiz-attempts", json={"question_id": "sampling-1", "competency_id": "D-SAM", "correct": False}, headers=headers).status_code == 201
    assert client.post(f"/api/learners/{user_id}/progress", json={"competency_id": "D-SAM", "current_score": 48, "required_score": 85}, headers=headers).status_code == 201
    summary = client.get(f"/api/learners/{user_id}", headers=headers)
    assert summary.status_code == 200
    assert summary.json()["user"]["preferred_language"] == "ta"
    assert summary.json()["quiz_evidence"]["total"] == 1
    assert summary.json()["progress_history"][0]["competency_id"] == "D-SAM"
