"""Government statistics simulator: workforce-readiness scenarios. No official figures invented."""

SCENES = [
    {
        "id": "household-survey",
        "title": "You are analysing a household survey extract.",
        "context": "The extract shows missing values, sampling imbalance across strata, outliers, and item non-response. This is a teaching dataset, not an official release.",
        "prompt": "What should you investigate first?",
        "options": [
            "Document missingness and non-response before interpreting totals.",
            "Publish the unweighted mean as a national estimate.",
            "Drop every incomplete household without recording a reason.",
            "Replace missing income with a round number to look complete.",
        ],
        "correct_index": 0,
        "competency_id": "D-QUA",
        "rubric": {
            "reasoning": "Quality review precedes interpretation.",
            "method": "Missingness and non-response are design/quality issues, not cosmetics.",
            "data_quality": "High",
            "interpretation": "Do not invent a national total from an unclean extract.",
        },
        "explanation": "Start with data quality: missingness, duplicates, and non-response. Do not treat the extract as a publishable estimate.",
    },
    {
        "id": "substitution",
        "title": "A listed household is difficult to contact.",
        "context": "Field teams sometimes want to replace a selected household with a neighbour.",
        "prompt": "What is the defensible action?",
        "options": [
            "Follow the approved callback and substitution protocol and record the outcome.",
            "Interview the nearest willing neighbour without documentation.",
            "Delete the household from the sample frame silently.",
            "Ask a relative in another city to answer by memory.",
        ],
        "correct_index": 0,
        "competency_id": "D-SAM",
        "rubric": {
            "reasoning": "Unplanned substitution can bias the sample.",
            "method": "Use the survey’s approved field protocol.",
            "data_quality": "High",
            "interpretation": "Coverage is a design property, not a convenience choice.",
        },
        "explanation": "Approved substitution and callback rules protect the sample. Informal neighbour swaps are not a method.",
    },
]


def evaluate(scene_id: str, choice: int) -> dict:
    scene = next((item for item in SCENES if item["id"] == scene_id), SCENES[0])
    correct = choice == scene["correct_index"]
    return {
        "scene_id": scene["id"],
        "correct": correct,
        "competency_id": scene["competency_id"],
        "rubric": scene["rubric"],
        "explanation": scene["explanation"],
        "source_kind": "ai_generated_teaching_scenario",
        "note": "DEMO scenario. Not an official case file.",
    }


def catalogue() -> list[dict]:
    return [{k: v for k, v in scene.items() if k != "rubric"} | {"has_rubric": True} for scene in SCENES]
