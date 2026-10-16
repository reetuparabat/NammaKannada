from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


class PhraseOut(BaseModel):
    id: int
    scenario_id: int
    kannada_text: str
    english_meaning: str
    transliteration: str
    context: Optional[str] = None
    example: Optional[str] = None
    formality_note: Optional[str] = None
    status: str
    display_order: int

    model_config = {"from_attributes": True}


class PhraseDetail(PhraseOut):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PhraseCreate(BaseModel):
    scenario_id: int
    kannada_text: str
    english_meaning: str
    transliteration: str
    context: Optional[str] = None
    example: Optional[str] = None
    formality_note: Optional[str] = None

    @field_validator("kannada_text")
    @classmethod
    def kannada_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("kannada_text cannot be empty")
        return v.strip()

    @field_validator("english_meaning", "transliteration")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()


class PhraseUpdate(BaseModel):
    kannada_text: Optional[str] = None
    english_meaning: Optional[str] = None
    transliteration: Optional[str] = None
    context: Optional[str] = None
    example: Optional[str] = None
    formality_note: Optional[str] = None


class PhraseSearchResult(BaseModel):
    id: int
    scenario_id: int
    kannada_text: str
    english_meaning: str
    transliteration: str
    context: Optional[str] = None
    scenario_title: Optional[str] = None
    category_name: Optional[str] = None

    model_config = {"from_attributes": True}
