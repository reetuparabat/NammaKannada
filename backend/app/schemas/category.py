from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    icon: str
    display_order: int
    scenario_count: Optional[int] = 0

    model_config = {"from_attributes": True}


class CategoryDetail(CategoryOut):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
