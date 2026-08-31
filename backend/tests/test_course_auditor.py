from app.services.course_auditor import audit_course


def test_audit_labels_absent_role_requirements_as_missing() -> None:
    result = audit_course("This lesson explains sampling weights and stratified sampling.", "Statistical Officer")
    sampling = next(row for row in result["coverage"] if row["competency_id"] == "D-SAM")
    integrity = next(row for row in result["coverage"] if row["competency_id"] == "B-INT")
    assert sampling["coverage"] == "Covered"
    assert integrity["coverage"] == "Missing"
