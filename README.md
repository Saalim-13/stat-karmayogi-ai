# Stat-Karmayogi AI

Hackathon stack for AI-enabled capacity building in India’s Official Statistical System (MoSPI / NSO / NSSTA), aligned to Mission Karmayogi and iGOT.

Loop: **assess → identify gaps → personalise → learn → practise → reassess → prove improvement**.

## Competition-ready capabilities

- Role-aware **competency intelligence** for Statistical Officer, Data Analyst and Survey Officer: current vs required competency, explainable gap, priority, evidence, and training-impact projection.
- A diagnostic assessment and adaptive practice evidence combined into a browser-local demo competency profile.
- A customisable, evidence-first learning intervention plan (daily time and target duration), with an explicit distinction between projected improvement and a reassessment-verified outcome.
- Source-grounded Bloom-tagged MCQs, scenario practice, answer explanations, and spaced revision.
- iGOT-ready catalogue adapter boundary. The bundled adapter is explicitly `LOCAL_DEMO_DATA`; it makes no live iGOT API, authentication, enrolment, credit-sync, or completion-sync claim. Check `GET /api/igot/status` to surface the mode in a future admin UI.
- Personalized learner flow: friendly onboarding, exam-date countdown, target score, daily capacity, learning preference, a syllabus-mastery heatmap, a topic teaching view, confidence check, and a single explainable “what should I study now?” recommendation.
- `My AI learning profile` converts available local learner evidence into a transparent Learning DNA view; `SIH judge demo` explains the implemented end-to-end workflow and clearly labels simulated impact analytics.
- `Competency Digital Twin` uses the local `LearningOrchestrator` module to make a transparent next-best-action recommendation and gap forecast from topic mastery, target, deadline, importance and recorded practice. Forecasts are explicitly estimates, not guarantees.

## Architecture notes

- `frontend/lib/competency.ts` is the transparent demo competency/priority engine. It blends a diagnostic result with recorded quiz performance and role targets; it is deliberately isolated from UI components so it can later call a persistent competency service.
- `backend/app/services/igot_adapter.py` defines the course-catalogue adapter boundary. Implement a credentialed adapter there only after official iGOT API documentation and authorization are available.
- This hackathon version intentionally keeps learner progress in browser storage. For a production deployment, introduce authenticated users and a database for profile, attempts, recommendations, paths, documents, and auditable training-impact snapshots.
- Learner profile and syllabus state are isolated in `frontend/lib/learner.ts`. QuizForge maps relevant recorded answers to topic-mastery evidence, making the dashboard and syllabus view update as the learner practises.

## Layout

```
stat-karmayogi-ai/
├── .cursorrules
├── backend/app/          # FastAPI
│   ├── core/             # Chroma + LangChain splitter
│   ├── api/              # MCQ, iGOT, RAG
│   └── services/         # Bloom quiz + ranking
└── frontend/             # Next.js App Router
```

## Run

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
PYTHONPATH=. uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. API is `http://localhost:8000`.

For a Render backend service with `backend` as its root directory, use this start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

No OpenAI key is required. Quizzes are generated with Bloom’s taxonomy rules, and the learning assistant provides offline guidance when AI mode is unavailable. Chroma stores ingested chunks locally for RAG query.

## Optional OpenAI learning assistant

The AI Assistant and AI answer explanations are optional enhancements. The API key is used only by FastAPI; never place it in the frontend or a `NEXT_PUBLIC_*` variable.

1. Copy `backend/.env.example` to `backend/.env`.
2. Add your key and chosen model in that backend-only file:

```text
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=your_model_here
```

3. Restart the backend. The `/api/health` response reports whether AI Assistant mode is enabled without revealing the key.

If the key, model, network, or OpenAI service is unavailable, the project continues using its offline quiz and assistant fallback.
