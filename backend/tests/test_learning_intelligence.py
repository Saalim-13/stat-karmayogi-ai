from app.services.learning_intelligence import build_learning_intelligence


def test_repeated_errors_choose_remediation_and_high_memory_risk() -> None:
    result = build_learning_intelligence({"topic": "Sampling", "mastery": 48, "accuracy": 40, "mistakes": 2, "days_since_review": 1})
    assert result["topic_state"]["state"] == "STRUGGLING"
    assert "Worked example" in result["intervention"]["intervention"]
    assert result["revision"]["memory_risk"] == "High"


def test_what_if_is_explicitly_an_estimate() -> None:
    result = build_learning_intelligence({"mastery": 48, "daily_minutes": 60, "days": 30})
    assert result["what_if"]["label"] == "SIMULATION / ESTIMATE"
    assert result["what_if"]["projected"] > 48
