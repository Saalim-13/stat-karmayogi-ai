from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.repositories import learner_repository
from app.services.competency_engine import ROLE_MODELS
from app.core.security import require_roles

router = APIRouter(prefix="/api/learners", tags=["learners"])


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    role_id: str
    email: str | None = Field(default=None, max_length=254)
    preferred_language: str = Field(default="en", max_length=12)
    goal: str | None = Field(default=None, max_length=500)


class AssessmentCreate(BaseModel):
    score: int = Field(ge=0, le=100)
    kind: str = Field(default="diagnostic", max_length=40)
    evidence: dict = Field(default_factory=dict)


class QuizAttemptCreate(BaseModel):
    question_id: str = Field(min_length=1, max_length=120)
    competency_id: str | None = Field(default=None, max_length=40)
    correct: bool
    difficulty: str | None = Field(default=None, max_length=40)


class ProgressCreate(BaseModel):
    competency_id: str = Field(min_length=1, max_length=40)
    current_score: int = Field(ge=0, le=100)
    required_score: int = Field(ge=0, le=100)
    source: str = Field(default="assessment", max_length=50)


@router.get("/roles")
def roles() -> dict:
    return {"roles": [{"id": role_id, **role} for role_id, role in ROLE_MODELS.items()]}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_user(req: UserCreate) -> dict:
    if req.role_id not in ROLE_MODELS:
        raise HTTPException(status_code=422, detail="Unsupported role_id")
    try:
        return learner_repository.create_user(req.name, req.role_id, req.email, req.preferred_language, req.goal)
    except Exception as exc:
        raise HTTPException(status_code=409, detail="A learner with this email may already exist") from exc


def _may_access(user_id: str, claims: dict) -> None:
    if claims["sub"] != user_id and claims["role"] != "admin":
        raise HTTPException(status_code=403, detail="You may only access your own learner evidence")


@router.get("/{user_id}")
def summary(user_id: str, claims: dict = Depends(require_roles("statistical-officer", "data-analyst", "survey-officer", "admin"))) -> dict:
    _may_access(user_id, claims)
    result = learner_repository.learner_summary(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Learner not found")
    return result


@router.post("/{user_id}/assessments", status_code=status.HTTP_201_CREATED)
def assessment(user_id: str, req: AssessmentCreate, claims: dict = Depends(require_roles("statistical-officer", "data-analyst", "survey-officer"))) -> dict:
    _may_access(user_id, claims)
    try:
        return learner_repository.save_assessment(user_id, req.score, req.kind, req.evidence)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Learner not found") from exc


@router.post("/{user_id}/quiz-attempts", status_code=status.HTTP_201_CREATED)
def quiz_attempt(user_id: str, req: QuizAttemptCreate, claims: dict = Depends(require_roles("statistical-officer", "data-analyst", "survey-officer"))) -> dict:
    _may_access(user_id, claims)
    try:
        return learner_repository.record_quiz_attempt(user_id, req.question_id, req.competency_id, req.correct, req.difficulty)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Learner not found") from exc


@router.post("/{user_id}/progress", status_code=status.HTTP_201_CREATED)
def progress(user_id: str, req: ProgressCreate, claims: dict = Depends(require_roles("statistical-officer", "data-analyst", "survey-officer"))) -> dict:
    _may_access(user_id, claims)
    try:
        return learner_repository.record_progress(user_id, req.competency_id, req.current_score, req.required_score, req.source)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Learner not found") from exc
