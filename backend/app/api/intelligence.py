from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.services.detective import DATASET, PLANTED, evaluate as eval_detective
from app.services.document_intelligence import analyse_document
from app.services.glossary import entries
from app.services.knowledge_graph import get_graph
from app.services.simulator import catalogue, evaluate as eval_scene
from app.services.course_auditor import audit_course
from app.core.security import require_roles

router = APIRouter(prefix="/api/intelligence", tags=["intelligence"])


class DocumentIn(BaseModel):
    text: str = Field(min_length=40)
    source_name: str = "uploaded-notes.txt"
    ingest: bool = True


class DetectiveIn(BaseModel):
    found_codes: list[str] = Field(default_factory=list)


class SimulatorIn(BaseModel):
    scene_id: str
    choice: int = Field(ge=0, le=5)


class CourseAuditIn(BaseModel):
    course_text: str = Field(min_length=40, max_length=30000)
    role: str = Field(default="Statistical Officer", max_length=120)


@router.post("/document")
def document(req: DocumentIn) -> dict:
    return analyse_document(req.text, req.source_name, req.ingest)


@router.get("/graph")
def graph() -> dict:
    return get_graph()


@router.get("/glossary")
def glossary(language: str = "en") -> dict:
    return {"language": language, "entries": entries(language), "note": "Technical terms remain in English."}


@router.get("/detective")
def detective_case() -> dict:
    return {
        "demo": True,
        "rows": DATASET,
        "codes": [item["code"] for item in PLANTED],
        "instructions": "Select every data-quality issue you can see. DEMO DATA only.",
    }


@router.post("/detective/evaluate")
def detective_eval(req: DetectiveIn) -> dict:
    return eval_detective(req.found_codes)


@router.get("/simulator")
def simulator_list() -> dict:
    return {"scenes": catalogue(), "note": "DEMO teaching scenarios. Not official case files."}


@router.post("/simulator/evaluate")
def simulator_eval(req: SimulatorIn) -> dict:
    return eval_scene(req.scene_id, req.choice)


@router.post("/course-audit")
def course_audit(req: CourseAuditIn, _: dict = Depends(require_roles("admin"))) -> dict:
    return audit_course(req.course_text, req.role)
