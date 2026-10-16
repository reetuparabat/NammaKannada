"""Category and Scenario service layer."""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.models.category import Category
from app.models.scenario import Scenario
from app.models.phrase import Phrase, PhraseStatus
from app.schemas.category import CategoryOut
from app.schemas.scenario import ScenarioOut


def get_all_categories(db: Session) -> List[CategoryOut]:
    """Return all active categories with scenario counts."""
    results = []
    categories = db.query(Category).filter(Category.is_active == True).order_by(Category.display_order).all()
    for cat in categories:
        count = db.query(func.count(Scenario.id)).filter(
            Scenario.category_id == cat.id,
            Scenario.is_active == True
        ).scalar()
        out = CategoryOut(
            id=cat.id,
            name=cat.name,
            slug=cat.slug,
            description=cat.description,
            icon=cat.icon,
            display_order=cat.display_order,
            scenario_count=count or 0,
        )
        results.append(out)
    return results


def get_category_by_slug(db: Session, slug: str) -> Optional[Category]:
    return db.query(Category).filter(Category.slug == slug, Category.is_active == True).first()


def get_category_by_id(db: Session, category_id: int) -> Optional[Category]:
    return db.query(Category).filter(Category.id == category_id, Category.is_active == True).first()


def get_scenarios_for_category(db: Session, category_id: int) -> List[ScenarioOut]:
    scenarios = (
        db.query(Scenario)
        .filter(Scenario.category_id == category_id, Scenario.is_active == True)
        .order_by(Scenario.display_order)
        .all()
    )
    results = []
    for s in scenarios:
        count = db.query(func.count(Phrase.id)).filter(
            Phrase.scenario_id == s.id,
            Phrase.status == PhraseStatus.published.value,
        ).scalar()
        out = ScenarioOut(
            id=s.id,
            category_id=s.category_id,
            title=s.title,
            slug=s.slug,
            description=s.description,
            learning_objectives=s.learning_objectives,
            estimated_minutes=s.estimated_minutes,
            difficulty=s.difficulty,
            display_order=s.display_order,
            phrase_count=count or 0,
        )
        results.append(out)
    return results


def get_scenario_by_slug(db: Session, slug: str) -> Optional[Scenario]:
    return db.query(Scenario).filter(Scenario.slug == slug, Scenario.is_active == True).first()


def get_scenario_by_id(db: Session, scenario_id: int) -> Optional[Scenario]:
    return db.query(Scenario).filter(Scenario.id == scenario_id, Scenario.is_active == True).first()
