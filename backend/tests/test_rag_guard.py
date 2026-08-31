from app.core import vectorstore


def test_empty_knowledge_base_returns_insufficient_grounded_data(monkeypatch) -> None:
    class EmptyCollection:
        def count(self): return 0
    monkeypatch.setattr(vectorstore, "collection", lambda: EmptyCollection())
    result = vectorstore.retrieve_grounded("What is sampling?")
    assert result["status"] == "insufficient_grounded_data"
    assert result["chunks"] == []
