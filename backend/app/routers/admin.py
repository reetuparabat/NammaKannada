"""
Protected admin endpoints for content management.
Requires HTTP Basic Auth.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.security.auth import require_admin
from app.models.phrase import Phrase, PhraseStatus, PhraseReview
from app.models.scenario import Scenario
from app.models.category import Category
from app.schemas.phrase import PhraseCreate, PhraseUpdate, PhraseOut, PhraseDetail
from app.services.phrase_service import create_phrase, update_phrase, transition_phrase_status

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/content", dependencies=[Depends(require_admin)])
def list_admin_content(db: Session = Depends(get_db)):
    """Return all content regardless of status for admin review."""
    phrases = db.query(Phrase).order_by(Phrase.status, Phrase.id).all()
    return {
        "phrases": [
            {
                "id": p.id,
                "scenario_id": p.scenario_id,
                "kannada_text": p.kannada_text,
                "english_meaning": p.english_meaning,
                "transliteration": p.transliteration,
                "status": p.status,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in phrases
        ],
        "total": len(phrases),
    }


@router.post("/content/phrases", response_model=PhraseOut, dependencies=[Depends(require_admin)])
def admin_create_phrase(data: PhraseCreate, db: Session = Depends(get_db)):
    """Create a new phrase in draft status."""
    scenario = db.query(Scenario).filter(Scenario.id == data.scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    phrase = create_phrase(db, data.model_dump())
    return phrase


@router.patch("/content/phrases/{phrase_id}", response_model=PhraseOut)
def admin_update_phrase(
    phrase_id: int,
    data: PhraseUpdate,
    admin_user: str = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update phrase fields. If published, linguistic modifications automatically revert status to draft."""
    phrase = db.query(Phrase).filter(Phrase.id == phrase_id).first()
    if not phrase:
        raise HTTPException(status_code=404, detail="Phrase not found")
    return update_phrase(db, phrase, data.model_dump(exclude_none=True), admin_user=admin_user)


@router.post("/content/phrases/{phrase_id}/submit-review", response_model=PhraseOut, dependencies=[Depends(require_admin)])
def submit_for_review(phrase_id: int, db: Session = Depends(get_db)):
    phrase = db.query(Phrase).filter(Phrase.id == phrase_id).first()
    if not phrase:
        raise HTTPException(status_code=404, detail="Phrase not found")
    phrase, error = transition_phrase_status(db, phrase, PhraseStatus.under_review.value)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return phrase


@router.post("/content/phrases/{phrase_id}/approve", response_model=PhraseOut)
def approve_phrase(
    phrase_id: int,
    comments: str = "",
    admin_user: str = Depends(require_admin),
    db: Session = Depends(get_db)
):
    phrase = db.query(Phrase).filter(Phrase.id == phrase_id).first()
    if not phrase:
        raise HTTPException(status_code=404, detail="Phrase not found")
    phrase, error = transition_phrase_status(db, phrase, PhraseStatus.approved.value)
    if error:
        raise HTTPException(status_code=400, detail=error)
    review = PhraseReview(
        phrase_id=phrase_id,
        reviewer_identifier=admin_user,
        review_status="approved",
        comments=comments,
    )
    db.add(review)
    db.commit()
    return phrase


@router.post("/content/phrases/{phrase_id}/publish", response_model=PhraseOut, dependencies=[Depends(require_admin)])
def publish_phrase(phrase_id: int, db: Session = Depends(get_db)):
    phrase = db.query(Phrase).filter(Phrase.id == phrase_id).first()
    if not phrase:
        raise HTTPException(status_code=404, detail="Phrase not found")
    phrase, error = transition_phrase_status(db, phrase, PhraseStatus.published.value)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return phrase


@router.post("/content/phrases/{phrase_id}/archive", response_model=PhraseOut, dependencies=[Depends(require_admin)])
def archive_phrase(phrase_id: int, db: Session = Depends(get_db)):
    phrase = db.query(Phrase).filter(Phrase.id == phrase_id).first()
    if not phrase:
        raise HTTPException(status_code=404, detail="Phrase not found")
    phrase, error = transition_phrase_status(db, phrase, PhraseStatus.archived.value)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return phrase


@router.post("/content/phrases/{phrase_id}/reject", response_model=PhraseOut)
def reject_phrase(
    phrase_id: int,
    comments: str = "",
    admin_user: str = Depends(require_admin),
    db: Session = Depends(get_db)
):
    phrase = db.query(Phrase).filter(Phrase.id == phrase_id).first()
    if not phrase:
        raise HTTPException(status_code=404, detail="Phrase not found")
    phrase, error = transition_phrase_status(db, phrase, PhraseStatus.rejected.value)
    if error:
        raise HTTPException(status_code=400, detail=error)
    review = PhraseReview(
        phrase_id=phrase_id,
        reviewer_identifier=admin_user,
        review_status="rejected",
        comments=comments,
    )
    db.add(review)
    db.commit()
    return phrase
