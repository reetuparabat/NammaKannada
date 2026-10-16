"""Offline manifest endpoint - returns metadata for cacheable published content."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.category import Category
from app.models.scenario import Scenario
from app.models.phrase import Phrase, PhraseStatus
from app.config import settings
from datetime import datetime, timezone

router = APIRouter(prefix="/offline", tags=["offline"])


@router.get("/manifest")
def get_offline_manifest(db: Session = Depends(get_db)):
    """
    Returns metadata for all published content that can be cached offline.
    The frontend uses this to populate IndexedDB.
    """
    categories = db.query(Category).filter(Category.is_active == True).all()
    manifest = {
        "version": settings.app_version,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "categories": [],
    }

    for cat in categories:
        scenarios = db.query(Scenario).filter(
            Scenario.category_id == cat.id,
            Scenario.is_active == True,
        ).all()

        cat_data = {
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "icon": cat.icon,
            "scenarios": [],
        }

        for s in scenarios:
            phrases = db.query(Phrase).filter(
                Phrase.scenario_id == s.id,
                Phrase.status == PhraseStatus.published.value,
            ).all()

            phrases_data = [
                {
                    "id": p.id,
                    "kannada_text": p.kannada_text,
                    "english_meaning": p.english_meaning,
                    "transliteration": p.transliteration,
                    "context": p.context,
                }
                for p in phrases
            ]

            cat_data["scenarios"].append({
                "id": s.id,
                "title": s.title,
                "slug": s.slug,
                "phrases": phrases_data,
            })

        manifest["categories"].append(cat_data)

    return manifest
