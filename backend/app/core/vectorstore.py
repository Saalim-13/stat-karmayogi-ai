import hashlib
import re
from datetime import datetime, timezone
from typing import Any

from chromadb import PersistentClient
from chromadb.api.models.Collection import Collection

from app.core.config import settings
from app.core.langchain_config import text_splitter

# PersistentClient is a factory function in recent Chroma releases, so it
# cannot be used in a runtime union annotation.
_client: Any | None = None
_retrieval_log: list[dict] = []


class LocalHashEmbedding:
    """Small offline embedding function for the hackathon RAG demo.

    It avoids Chroma's default model download, so ingest and retrieval keep
    working on a laptop with no model credentials or network connection.
    """

    dimensions = 128

    def name(self) -> str:
        return "stat-karmayogi-local-hash"

    def __call__(self, input: list[str]) -> list[list[float]]:
        vectors: list[list[float]] = []
        for document in input:
            vector = [0.0] * self.dimensions
            for token in re.findall(r"[a-z0-9]+", document.lower()):
                digest = hashlib.sha256(token.encode()).digest()
                index = int.from_bytes(digest[:4], "big") % self.dimensions
                vector[index] += 1.0 if digest[4] % 2 else -1.0
            magnitude = sum(value * value for value in vector) ** 0.5
            vectors.append([value / magnitude for value in vector] if magnitude else vector)
        return vectors


def chroma_client() -> Any:
    global _client
    if _client is None:
        _client = PersistentClient(path=settings.chroma_path)
    return _client


def collection() -> Collection:
    return chroma_client().get_or_create_collection(
        name=settings.chroma_collection,
        metadata={"hnsw:space": "cosine"},
        embedding_function=LocalHashEmbedding(),
    )


def ingest_text(text: str, source_name: str) -> int:
    chunks = [c.strip() for c in text_splitter().split_text(text) if c.strip()]
    if not chunks:
        return 0
    col = collection()
    ids = [f"{source_name}-{i}" for i in range(len(chunks))]
    col.upsert(
        ids=ids,
        documents=chunks,
        metadatas=[{"source": source_name} for _ in chunks],
    )
    return len(chunks)


def retrieve_grounded(query: str, k: int = 4) -> dict:
    if not query.strip():
        return {"status": "insufficient_grounded_data", "chunks": [], "reason": "A non-empty query is required."}
    col = collection()
    count = col.count()
    if count == 0:
        result = {"status": "insufficient_grounded_data", "chunks": [], "reason": "No approved material has been indexed yet."}
        _retrieval_log.append({"at": datetime.now(timezone.utc).isoformat(), "query": query[:300], "hit": False, "returned": 0})
        return result
    result = col.query(query_texts=[query], n_results=min(k, count), include=["documents", "metadatas", "distances"])
    docs = result.get("documents") or []
    distances = result.get("distances") or []
    metadata = result.get("metadatas") or []
    items = []
    for index, text in enumerate(docs[0] if docs else []):
        distance = float((distances[0] if distances else [])[index])
        items.append({"text": text, "source": ((metadata[0] if metadata else [])[index]).get("source", "unknown"), "distance": round(distance, 3)})
    query_terms = set(re.findall(r"[a-z0-9]+", query.lower()))
    best_terms = set(re.findall(r"[a-z0-9]+", items[0]["text"].lower())) if items else set()
    lexical_overlap = len(query_terms & best_terms) / max(1, len(query_terms))
    grounded = bool(items) and (lexical_overlap >= 0.2 or items[0]["distance"] <= 0.55)
    output = {"status": "grounded" if grounded else "insufficient_grounded_data", "chunks": items if grounded else [], "reason": None if grounded else "Retrieved material did not contain enough relevant evidence for a grounded answer.", "retrieval": {"chunk_size": 700, "chunk_overlap": 120, "top_k": min(k, count), "best_distance": items[0]["distance"] if items else None, "lexical_overlap": round(lexical_overlap, 2)}}
    _retrieval_log.append({"at": datetime.now(timezone.utc).isoformat(), "query": query[:300], "hit": grounded, "returned": len(output["chunks"]), "best_distance": output["retrieval"]["best_distance"]})
    del _retrieval_log[:-100]
    return output


def similar_chunks(query: str, k: int = 4) -> list[str]:
    """Compatibility helper for current callers that only need source text."""
    return [item["text"] for item in retrieve_grounded(query, k)["chunks"]]


def retrieval_logs(limit: int = 50) -> list[dict]:
    return list(reversed(_retrieval_log[-limit:]))
