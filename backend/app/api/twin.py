from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.audit import record
from app.services.digital_twin import build_twin
from app.services.forecast import early_warnings, forecast
from app.services.impact_engine import impact_report
from app.services.misconception_engine import classify
from app.services.orchestrator import next_best_action, time_aware_plan
from app.services.learning_intelligence import build_learning_intelligence
from app.services.competency_engine import scoring_method

router = APIRouter(prefix="/api/twin", tags=["twin"])


class TwinRequest(BaseModel):
    name: str = "Learner"
    role: str = "Statistical Officer"
    language: str = "en"
    daily_minutes: int = Field(default=20, ge=5, le=240)
    diagnostics: dict[str, int] = Field(default_factory=dict)
    practice: dict[str, int] = Field(default_factory=dict)
    journeys: dict[str, list[int]] = Field(default_factory=dict)
    custom_targets: dict[str, int] | None = None


class ImpactRequest(BaseModel):
    before: dict[str, int]
    after: dict[str, int]
    required: dict[str, int] = Field(default_factory=dict)
    pre: int | None = None
    post: int | None = None
    retention: int | None = None
    practice_accuracy: int | None = None
    application: int | None = None
    minutes_invested: int = 0
    topics_mastered: int = 0
    questions_improved: int = 0
    misconceptions_resolved: int = 0
    demo: bool = False


class MisconceptionRequest(BaseModel):
    question: str = Field(min_length=3, max_length=3000)
    correct: str = Field(min_length=1, max_length=1000)
    selected: str | None = None
    competency_id: str | None = None


class ForecastRequest(BaseModel):
    current: int = Field(ge=0, le=100)
    target: int = Field(ge=0, le=100)
    velocity_points_per_session: float = 4
    sessions_available: int = Field(default=6, ge=0, le=60)
    with_intervention: bool = True


class WarningRequest(BaseModel):
    recent_accuracy: int = 0
    days_inactive: int = 0
    retention: int = 100
    persistent_misconception: str | None = None
    days_to_deadline: int = 99
    gap: int = 0
    weak_topic: str | None = None


class TimePlanRequest(BaseModel):
    available_minutes: int = Field(ge=5, le=180)
    language: str = "en"
    topic: str = "Sampling"


class LearningIntelligenceRequest(BaseModel):
    topic: str = Field(default="Sampling", max_length=120)
    mastery: int = Field(default=45, ge=0, le=100)
    accuracy: int | None = Field(default=None, ge=0, le=100)
    mistakes: int = Field(default=0, ge=0, le=50)
    days_since_review: int = Field(default=0, ge=0, le=3650)
    confidence: str = Field(default="medium", max_length=30)
    gap: int | None = Field(default=None, ge=0, le=100)
    preference: str = Field(default="Examples first", max_length=80)
    target: int = Field(default=85, ge=0, le=100)
    daily_minutes: int = Field(default=20, ge=5, le=240)
    days: int = Field(default=30, ge=1, le=365)
    focus_first: bool = True


@router.post("/state")
def twin_state(req: TwinRequest) -> dict:
    record("learner", "twin.refresh", req.name)
    return build_twin(req.model_dump())


@router.get("/scoring-method")
def twin_scoring_method() -> dict:
    return scoring_method()


@router.post("/next-action")
def twin_next(req: TwinRequest) -> dict:
    record("orchestrator", "next_action", req.name)
    return next_best_action(req.model_dump())


@router.post("/impact")
def twin_impact(req: ImpactRequest) -> dict:
    return impact_report(req.model_dump())


@router.post("/misconception")
def twin_misconception(req: MisconceptionRequest) -> dict:
    return classify(req.question, req.correct, req.selected, req.competency_id)


@router.post("/forecast")
def twin_forecast(req: ForecastRequest) -> dict:
    return forecast(
        req.current,
        req.target,
        req.velocity_points_per_session,
        req.sessions_available,
        req.with_intervention,
    )


@router.post("/warnings")
def twin_warnings(req: WarningRequest) -> dict:
    return {"warnings": early_warnings(req.model_dump())}


@router.post("/time-plan")
def twin_time_plan(req: TimePlanRequest) -> dict:
    return time_aware_plan(req.available_minutes, req.language, req.topic)


@router.post("/learning-intelligence")
def learning_intelligence(req: LearningIntelligenceRequest) -> dict:
    record("orchestrator", "learning_intelligence", req.topic)
    return build_learning_intelligence(req.model_dump())
