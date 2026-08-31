# Stat-Karmayogi AI — hackathon coding rules

You are building Stat-Karmayogi AI: an AI capacity-building demo for India’s Official Statistical System (MoSPI / NSO / NSSTA) aligned to Mission Karmayogi and iGOT.

## Stack (do not change without asking)

- Backend: FastAPI under `backend/app/`
- Frontend: Next.js App Router under `frontend/app/`
- UI: Tailwind + shadcn-style components in `frontend/components/`
- RAG: LangChain + local Chroma in `backend/app/core/`
- Quiz logic: Bloom’s taxonomy in `backend/app/services/`

## Product constraints

- Keep the demo loop tight: dashboard → generate MCQs → iGOT recommendations.
- Prefer iGOT Karmayogi courses over NSSTA classroom programmes when scores are close.
- Quizzes must cite a source excerpt. Never invent official estimates or claim live iGOT credit sync.
- Offline-first: rule-based Bloom quiz generation must work without an LLM key. LLM is optional enrichment.
- Do not scrape iGOT. Use the curated catalogue in `backend/app/data/catalogue.py`.

## Code style

- Python: type hints, Pydantic models for every request/response, no wildcard imports.
- TypeScript: no `any`. Server calls go through `frontend/lib/api.ts`.
- Keep endpoints thin; put generation and ranking in `services/`.
- Vector store config stays in `core/`. Do not open Chroma from API routers.

## API contracts

- `POST /api/mcq/generate` — body `{ text, source_name, bloom_mix? }` → quiz
- `POST /api/igot/recommend` — body `{ gaps: [{ competency_id, gap, priority }] }` → ranked courses
- `POST /api/rag/ingest` — body `{ text, source_name }` → chunk count
- CORS must allow the Next.js origin (default `http://localhost:3000`).

## UI

- Navy / saffron / cream visual language. Tricolor bar at the top.
- Pages that exist for the pitch: Dashboard, Quiz. Do not add extra nav unless asked.
- Show Bloom level on every MCQ. Show “why this course” on every recommendation.
