"""
Pydantic schemas for Voice Translation and Transcription.
"""
from pydantic import BaseModel, Field, model_validator
from typing import Optional


class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="Text to translate")
    source_language: str = Field(..., description="Source language code ('en' or 'kn')")
    target_language: str = Field(..., description="Target language code ('en' or 'kn')")

    @model_validator(mode="after")
    def validate_languages(self):
        valid_langs = {"en", "kn"}
        src = self.source_language.strip().lower()
        tgt = self.target_language.strip().lower()

        if src not in valid_langs:
            raise ValueError(f"Invalid source_language: '{self.source_language}'. Must be 'en' or 'kn'.")
        if tgt not in valid_langs:
            raise ValueError(f"Invalid target_language: '{self.target_language}'. Must be 'en' or 'kn'.")
        if src == tgt:
            raise ValueError("source_language and target_language cannot be the same.")

        self.source_language = src
        self.target_language = tgt
        self.text = self.text.strip()
        if not self.text:
            raise ValueError("Text cannot be empty or whitespace only.")
        return self


class TranslationResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str
    provider: Optional[str] = "mymemory"
    transliteration: Optional[str] = None


class TranscriptionResponse(BaseModel):
    recognized_text: str
    language: str
    status: str = "success"
    confidence: Optional[float] = None
