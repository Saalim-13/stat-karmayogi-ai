from app.services import metrics


def test_metrics_records_bloom_distribution() -> None:
    metrics.record_quiz([{"bloom": "Remember"}, {"bloom": "Apply"}, {"bloom": "Apply"}])
    result = metrics.statistics()
    assert result["mcq_bloom_distribution"]["Apply"] >= 2
    assert result["gap_detection_consistent"] is True
