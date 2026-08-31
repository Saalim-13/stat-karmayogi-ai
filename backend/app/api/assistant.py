from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.learning_assistant import chat, explain_answer

router = APIRouter(prefix="/api/assistant", tags=["assistant"])


class ChatRequest(BaseModel):
    message: str = Field(min_length=3, max_length=3000)
    language: str = Field(default="en", max_length=12)
    learner_name: str | None = None
    role: str | None = None
    weak_topic: str | None = None
    current_competency: int | None = None
    goal: str | None = None


class ExplainRequest(BaseModel):
    question: str = Field(min_length=3, max_length=3000)
    correct_answer: str = Field(min_length=1, max_length=1000)
    selected_answer: str | None = Field(default=None, max_length=1000)
    competency_id: str | None = None


@router.post("/chat")
def assistant_chat(req: ChatRequest) -> dict:
    return chat(
        req.message,
        req.language,
        context={
            "learner_name": req.learner_name,
            "role": req.role,
            "weak_topic": req.weak_topic,
            "current_competency": req.current_competency,
            "goal": req.goal,
        },
    )


@router.post("/explain-answer")
def assistant_explain(req: ExplainRequest) -> dict:
    return explain_answer(req.question, req.correct_answer, req.selected_answer, req.competency_id)
