from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserProgressOut(BaseModel):
    scenario_id: int
    completed_conversation: bool
    completed_quiz: bool
    quiz_score: Optional[float] = None
    quiz_total: Optional[int] = None
    last_accessed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UserProgressCreate(BaseModel):
    scenario_id: int
    session_id: str
    completed_conversation: Optional[bool] = None
    completed_quiz: Optional[bool] = None
    quiz_score: Optional[float] = None
    quiz_total: Optional[int] = None


class SavedPhraseOut(BaseModel):
    phrase_id: int
    kannada_text: str
    english_meaning: str
    transliteration: str
    context: Optional[str] = None
    scenario_title: Optional[str] = None
    category_name: Optional[str] = None
    saved_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
