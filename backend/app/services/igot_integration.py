"""iGOT integration layer. Official endpoints are not invented.

STAT KARMAYOGI AI → iGOTIntegrationService → adapter → official APIs (when authorised).
The bundled provider is MockiGOTProvider, labelled DEMO / MOCK.
"""

from __future__ import annotations

from typing import Protocol

from app.data.catalogue import COMPETENCIES, COURSES
from app.services.igot_adapter import LocalDemoIgotAdapter, catalogue_adapter


class IgotProvider(Protocol):
    name: str
    mode: str

    def get_courses(self) -> list[dict]: ...
    def get_resources(self) -> list[dict]: ...
    def get_learner_profile(self, learner_id: str) -> dict: ...
    def sync_progress(self, learner_id: str, payload: dict) -> dict: ...
    def sync_completion(self, learner_id: str, course_id: str) -> dict: ...
    def get_training_history(self, learner_id: str) -> list[dict]: ...
    def status(self) -> dict: ...


class MockIgotProvider:
    name = "MockiGOTProvider"
    mode = "DEMO / MOCK"

    def get_courses(self) -> list[dict]:
        return COURSES

    def get_resources(self) -> list[dict]:
        return [
            {
                "id": course["id"],
                "title": course["title"],
                "type": "catalogue-course",
                "igot_url": course["igot_url"],
                "source": "LOCAL_DEMO_DATA",
            }
            for course in COURSES
        ]

    def get_learner_profile(self, learner_id: str) -> dict:
        return {
            "learner_id": learner_id,
            "source": "DEMO / MOCK",
            "credits": None,
            "note": "No live iGOT profile is retrieved.",
        }

    def sync_progress(self, learner_id: str, payload: dict) -> dict:
        return {
            "ok": False,
            "synced": False,
            "learner_id": learner_id,
            "mode": self.mode,
            "message": "Progress is stored locally in this demo. Official sync requires authorised APIs.",
            "received_keys": sorted(payload.keys()),
        }

    def sync_completion(self, learner_id: str, course_id: str) -> dict:
        return {
            "ok": False,
            "synced": False,
            "learner_id": learner_id,
            "course_id": course_id,
            "mode": self.mode,
            "message": "Completion is not written to iGOT in this demonstration.",
        }

    def get_training_history(self, learner_id: str) -> list[dict]:
        return [
            {
                "learner_id": learner_id,
                "event": "local-demo-history-empty",
                "source": "DEMO / MOCK",
            }
        ]

    def status(self) -> dict:
        base = catalogue_adapter.status()
        return {
            **base,
            "provider": self.name,
            "mode": self.mode,
            "live_igot_connected": False,
            "interfaces": [
                "getCourses",
                "getResources",
                "getLearnerProfile",
                "syncProgress",
                "syncCompletion",
                "getTrainingHistory",
            ],
            "architecture": [
                "STAT KARMAYOGI AI",
                "iGOTIntegrationService",
                "iGOT Adapter",
                "Official iGOT APIs (not connected)",
            ],
        }


igot_service: IgotProvider = MockIgotProvider()
local_catalogue = LocalDemoIgotAdapter()
_ = COMPETENCIES
