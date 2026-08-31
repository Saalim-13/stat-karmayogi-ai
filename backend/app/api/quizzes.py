from typing import Literal

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.core.vectorstore import ingest_text
from app.services.bloom_quiz import generate_quiz
from app.core.security import require_roles

router = APIRouter(prefix="/api/mcq", tags=["mcq"])

Bloom = Literal["Remember", "Understand", "Apply", "Analyse"]


class GenerateQuizRequest(BaseModel):
    text: str = Field(min_length=40)
    source_name: str = "pasted-notes.txt"
    bloom_mix: list[Bloom] | None = None
    ingest: bool = True


@router.post("/generate", response_model=None)
def generate(req: GenerateQuizRequest, _: dict = Depends(require_roles("statistical-officer", "data-analyst", "survey-officer"))) -> dict | JSONResponse:
    try:
        if req.ingest:
            ingest_text(req.text, req.source_name)
        quiz = generate_quiz(req.text, req.source_name, req.bloom_mix)
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"error": "Could not generate quiz, please try again"},
        )
    if not quiz["questions"]:
        return JSONResponse(
            status_code=422,
            content={"error": "Insufficient source evidence to generate grounded questions. Add more statistical content and try again."},
        )
    return quiz
