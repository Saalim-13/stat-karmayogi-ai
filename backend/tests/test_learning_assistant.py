from fastapi.testclient import TestClient

from app.main import app
from app.services import learning_assistant


def test_assistant_uses_offline_fallback_without_key() -> None:
    client = TestClient(app)
    response = client.post("/api/assistant/chat", json={"message": "Explain LFPR in simple words"})
    data = response.json()
    assert response.status_code == 200
    assert data["ai_available"] is False
    assert data["competency_id"] == "D-NSS"
    assert "Key takeaway" in data["answer"]


def test_assistant_rejects_oversized_prompt() -> None:
    client = TestClient(app)
    response = client.post("/api/assistant/chat", json={"message": "x" * 3001})
    assert response.status_code == 422


def test_assistant_uses_mocked_ai_service(monkeypatch) -> None:
    monkeypatch.setattr(learning_assistant, "ai_available", lambda: True)
    monkeypatch.setattr(learning_assistant, "_response", lambda prompt: "Clear AI explanation.\n\nKey takeaway: practise the concept.")
    data = learning_assistant.chat("Explain sampling weights")
    assert data["ai_available"] is True
    assert "AI explanation" in data["answer"]
