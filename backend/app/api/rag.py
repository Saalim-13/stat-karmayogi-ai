from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.core.vectorstore import ingest_text, retrieve_grounded

router = APIRouter(prefix="/api/rag", tags=["rag"])


class IngestRequest(BaseModel):
    text: str = Field(min_length=20)
    source_name: str = "manual.txt"


@router.post("/ingest", response_model=None)
def ingest(req: IngestRequest) -> dict | JSONResponse:
    try:
        count = ingest_text(req.text, req.source_name)
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"error": "Could not ingest source material, please try again"},
        )
    return {"chunks": count, "source_name": req.source_name}


class QueryRequest(BaseModel):
    query: str = Field(min_length=3)
    k: int = Field(default=4, ge=1, le=8)


@router.post("/query")
def query(req: QueryRequest) -> dict:
    try:
        return retrieve_grounded(req.query, req.k)
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Knowledge retrieval is temporarily unavailable; no ungrounded answer was produced.") from exc
