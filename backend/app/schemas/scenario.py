from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class ScenarioOut(BaseModel):
    id: int
    category_id: int
    title: str
    slug: str
    description: str
    learning_objectives: Optional[str] = None
    estimated_minutes: int
    difficulty: str
    display_order: int
    phrase_count: Optional[int] = 0

    model_config = {"from_attributes": True}


class ScenarioDetail(ScenarioOut):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
