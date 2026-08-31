from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.services.recommender import recommend_courses
from app.services.igot_adapter import catalogue_adapter
from app.services.igot_integration import igot_service

router = APIRouter(prefix="/api/igot", tags=["igot"])


class GapIn(BaseModel):
    competency_id: str
    gap: float = Field(ge=0)
    priority: str = "moderate"


class RecommendRequest(BaseModel):
    gaps: list[GapIn]
    limit: int = Field(default=6, ge=1, le=12)


@router.post("/recommend", response_model=None)
def recommend(req: RecommendRequest) -> dict | JSONResponse:
    try:
        items = recommend_courses([g.model_dump() for g in req.gaps], req.limit)
        return {"recommendations": items}
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"error": "Could not generate recommendations, please try again"},
        )


@router.get("/status")
def integration_status() -> dict:
    """Discloses whether the app is using demo data or a real connector."""
    return {**catalogue_adapter.status(), **igot_service.status()}


@router.get("/mock/courses")
def mock_courses() -> dict:
    return {"mode": igot_service.mode, "courses": igot_service.get_courses()}


@router.get("/mock/profile/{learner_id}")
def mock_profile(learner_id: str) -> dict:
    return igot_service.get_learner_profile(learner_id)


@router.post("/mock/sync-progress")
def mock_sync() -> dict:
    return igot_service.sync_progress("demo-learner", {"local_only": True})
