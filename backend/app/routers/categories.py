from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.services.category_service import (
    get_all_categories, get_category_by_id,
    get_scenarios_for_category
)
from app.schemas.category import CategoryOut
from app.schemas.scenario import ScenarioOut

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    """Return all active learning categories with scenario counts."""
    return get_all_categories(db)


@router.get("/{category_id}", response_model=CategoryOut)
def get_category(category_id: int, db: Session = Depends(get_db)):
    cat = get_category_by_id(db, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    from app.schemas.category import CategoryOut as CO
    from sqlalchemy import func
    from app.models.scenario import Scenario
    count = db.query(func.count(Scenario.id)).filter(
        Scenario.category_id == cat.id, Scenario.is_active == True
    ).scalar()
    return CO(
        id=cat.id, name=cat.name, slug=cat.slug,
        description=cat.description, icon=cat.icon,
        display_order=cat.display_order, scenario_count=count or 0,
    )


@router.get("/{category_id}/scenarios", response_model=List[ScenarioOut])
def list_category_scenarios(category_id: int, db: Session = Depends(get_db)):
    cat = get_category_by_id(db, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return get_scenarios_for_category(db, category_id)
