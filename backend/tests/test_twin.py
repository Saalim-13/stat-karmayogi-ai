from app.services.competency_engine import build_competency_state
from app.services.digital_twin import build_twin
from app.services.impact_engine import impact_report
from app.services.misconception_engine import classify
from app.services.orchestrator import next_best_action


def test_gap_is_required_minus_current() -> None:
    rows = build_competency_state(
        "Statistical Officer",
        {"D-SAM": 48, "D-QUA": 67, "F-DA": 42, "D-NSS": 72},
        {},
    )
    sampling = next(item for item in rows if item["competency_id"] == "D-SAM")
    assert sampling["required"] == 85
    assert sampling["current"] == 48
    assert sampling["gap"] == 37
    assert sampling["priority"] == "Critical"


def test_next_action_targets_largest_gap() -> None:
    result = next_best_action(
        {
            "name": "Priya",
            "role": "Statistical Officer",
            "language": "ta",
            "daily_minutes": 20,
            "diagnostics": {"D-SAM": 48, "D-QUA": 67, "F-DA": 42, "D-NSS": 72},
        }
    )
    assert result["action"]["why"]["competency"] == "Sampling"
    assert result["action"]["why"]["gap"] == 37
    assert "Tamil" in result["action"]["recommended"]["learning_session"]


def test_impact_gap_closure() -> None:
    report = impact_report(
        {
            "before": {"D-SAM": 48, "D-QUA": 61, "F-DA": 42},
            "after": {"D-SAM": 82, "D-QUA": 79, "F-DA": 68},
            "required": {"D-SAM": 85, "D-QUA": 80, "F-DA": 75},
            "pre": 51,
            "post": 81,
            "retention": 77,
            "minutes_invested": 20,
            "demo": True,
        }
    )
    assert report["gap_before"] == 89
    assert report["gap_after"] == 11
    assert report["gap_closed"] == 78
    sampling = next(item for item in report["rows"] if item["competency_id"] == "D-SAM")
    assert sampling["points"] == 34


def test_misconception_stratified_cluster() -> None:
    result = classify(
        "Why is stratified sampling used?",
        "To sample within strata",
        "Because it is the same as cluster sampling",
        "D-SAM",
    )
    assert result["kind"] == "terminology_confusion"


def test_twin_journey_appended() -> None:
    twin = build_twin(
        {
            "name": "Priya",
            "diagnostics": {"D-SAM": 70},
            "journeys": {"D-SAM": [48, 61, 70]},
        }
    )
    sampling = next(item for item in twin["competencies"] if item["competency_id"] == "D-SAM")
    assert sampling["journey"] == [48, 61, 70]


def test_gap_scoring_for_three_role_profiles() -> None:
    officer = build_competency_state("Statistical Officer", {"D-SAM": 48}, {})
    analyst = build_competency_state("Data Analyst", {"F-DA": 76}, {"F-DA": 86})
    survey = build_competency_state("Survey Officer", {"D-FLD": 90}, {})
    assert next(row for row in officer if row["competency_id"] == "D-SAM")["gap"] == 37
    assert next(row for row in analyst if row["competency_id"] == "F-DA")["current"] == 80
    assert next(row for row in analyst if row["competency_id"] == "F-DA")["priority"] == "Medium"
    assert next(row for row in survey if row["competency_id"] == "D-FLD")["priority"] == "On track"
