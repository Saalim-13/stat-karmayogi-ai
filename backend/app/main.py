from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.quizzes import router as quiz_router
from app.api.rag import router as rag_router
from app.api.recommendations import router as igot_router
from app.api.assistant import router as assistant_router
from app.api.twin import router as twin_router
from app.api.intelligence import router as intelligence_router
from app.api.learners import router as learner_router
from app.api.auth import router as auth_router
from app.core.config import settings
from app.core.database import initialize_database
from app.core.langchain_config import llm_available
from app.data.catalogue import COMPETENCIES, COURSES
from app.core.security import require_roles
from app.services.metrics import statistics
from fastapi import Depends

app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(quiz_router)
app.include_router(igot_router)
app.include_router(rag_router)
app.include_router(assistant_router)
app.include_router(twin_router)
app.include_router(intelligence_router)
app.include_router(learner_router)
app.include_router(auth_router)


@app.on_event("startup")
def startup() -> None:
    initialize_database()


@app.get("/api/health")
def health() -> dict:
    return {"ok": True, "llm": llm_available(), "ai_assistant": llm_available() and bool(settings.openai_model.strip()), "name": settings.app_name}


@app.get("/api/catalogue")
def catalogue() -> dict:
    return {"courses": COURSES, "competencies": COMPETENCIES}


@app.get("/api/admin/stats")
def admin_stats(_: dict = Depends(require_roles("admin"))) -> dict:
    return statistics()
