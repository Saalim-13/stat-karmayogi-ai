from app.services.bloom_quiz import generate_quiz


SAMPLE = (
    "The Periodic Labour Force Survey (PLFS) is the principal source of labour-force statistics "
    "for India. LFPR is the labour force participation rate. Current weekly status (CWS) is distinct "
    "from usual principal status. GSBPM is the Generic Statistical Business Process Model used to "
    "document production steps. CPI is the consumer price index used for inflation monitoring. "
    "Unit-level records remain confidential under the Collection of Statistics Act. CAPI devices "
    "support field canvassing with in-built consistency checks. Sampling weights convert sample "
    "counts into population estimates for NSS and PLFS rounds."
)


def test_generate_quiz_covers_bloom_levels() -> None:
    quiz = generate_quiz(SAMPLE, "plfs-notes.txt")
    assert len(quiz["questions"]) >= 4
    blooms = {q["bloom"] for q in quiz["questions"]}
    assert "Remember" in blooms
    assert all(len(q["options"]) == 4 for q in quiz["questions"])
