"""Boundary for a future iGOT Karmayogi connector.

The demo intentionally uses a local catalogue: it does not authenticate with,
read from, or write to iGOT. A production connector can implement
``CourseCatalogueAdapter`` and be selected through configuration without
changing recommendation logic.
"""
from typing import Protocol

from app.data.catalogue import COMPETENCIES, COURSES


class CourseCatalogueAdapter(Protocol):
    name: str

    def courses(self) -> list[dict]: ...

    def competencies(self) -> dict: ...

    def status(self) -> dict: ...


class LocalDemoIgotAdapter:
    name = "local-demo-catalogue"

    def courses(self) -> list[dict]:
        return COURSES

    def competencies(self) -> dict:
        return COMPETENCIES

    def status(self) -> dict:
        return {
            "mode": "LOCAL_DEMO_DATA",
            "adapter": self.name,
            "live_igot_connected": False,
            "message": "Course recommendations use the bundled demonstration catalogue. Configure a credentialed adapter when official API access is available.",
        }


catalogue_adapter: CourseCatalogueAdapter = LocalDemoIgotAdapter()
