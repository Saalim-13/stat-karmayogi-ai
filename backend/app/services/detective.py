"""Data Quality Detective: synthetic microdata with planted issues. Not official data."""

DATASET = [
    {"id": "HH-01", "age": "34", "sex": "F", "state": "TN", "income": "18000", "wave": "2024-Q1"},
    {"id": "HH-02", "age": "-2", "sex": "M", "state": "Tamil Nadu", "income": "22000", "wave": "2024-Q1"},
    {"id": "HH-02", "age": "41", "sex": "M", "state": "TN", "income": "22000", "wave": "01/2024"},
    {"id": "HH-03", "age": "29", "sex": "X", "state": "KA", "income": "", "wave": "2024-Q1"},
    {"id": "HH-04", "age": "180", "sex": "F", "state": "KA", "income": "9999999", "wave": "2024-Q1"},
    {"id": "HH-05", "age": "22", "sex": "F", "state": "MH", "income": "n/a", "wave": "2024-Q1"},
]

PLANTED = [
    {"code": "duplicate_id", "row": "HH-02", "detail": "Household id appears twice."},
    {"code": "invalid_age", "row": "HH-02 / HH-04", "detail": "Age is negative or implausibly high."},
    {"code": "inconsistent_state", "row": "HH-02", "detail": "State coded as both TN and Tamil Nadu."},
    {"code": "invalid_category", "row": "HH-03", "detail": "Sex code X is not in the allowed set {M, F}."},
    {"code": "missing_value", "row": "HH-03", "detail": "Income is blank."},
    {"code": "invalid_format", "row": "HH-02 / HH-05", "detail": "Wave and income use inconsistent formats."},
    {"code": "outlier", "row": "HH-04", "detail": "Income is an extreme value relative to the other rows."},
]


def evaluate(found_codes: list[str]) -> dict:
    codes = {item["code"] for item in PLANTED}
    found = set(found_codes)
    missed = sorted(codes - found)
    extra = sorted(found - codes)
    return {
        "demo": True,
        "source_kind": "demo_synthetic_microdata",
        "found": sorted(found & codes),
        "missed": missed,
        "extra": extra,
        "score": round(len(found & codes) / len(codes) * 100),
        "why_it_matters": "Uncorrected identifiers, missing income, and inconsistent geography would distort weighted survey estimates if treated as analysis-ready.",
        "planted": PLANTED,
        "rows": DATASET,
        "note": "DEMO DATA. Not a government microdata file and not an official estimate.",
    }
