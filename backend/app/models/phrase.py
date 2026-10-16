import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class PhraseStatus(str, enum.Enum):
    draft = "draft"
    under_review = "under_review"
    approved = "approved"
    published = "published"
    rejected = "rejected"
    archived = "archived"


class Phrase(Base):
    __tablename__ = "phrases"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id", ondelete="CASCADE"), nullable=False, index=True)
    kannada_text = Column(String(500), nullable=False)
    english_meaning = Column(String(500), nullable=False)
    transliteration = Column(String(500), nullable=False)
    context = Column(Text, nullable=True)
    example = Column(Text, nullable=True)
    formality_note = Column(String(200), nullable=True)
    status = Column(String(20), nullable=False, default=PhraseStatus.draft.value)
    display_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    scenario = relationship("Scenario", back_populates="phrases")
    reviews = relationship("PhraseReview", back_populates="phrase", cascade="all, delete-orphan")
    saved_by = relationship("SavedPhrase", back_populates="phrase", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Phrase(id={self.id}, kannada={self.kannada_text[:30]})>"


class PhraseReview(Base):
    __tablename__ = "phrase_reviews"

    id = Column(Integer, primary_key=True, index=True)
    phrase_id = Column(Integer, ForeignKey("phrases.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_identifier = Column(String(200), nullable=False)
    review_status = Column(String(20), nullable=False)  # approved / rejected / needs_revision
    comments = Column(Text, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    phrase = relationship("Phrase", back_populates="reviews")

    def __repr__(self):
        return f"<PhraseReview(id={self.id}, phrase_id={self.phrase_id}, status={self.review_status})>"
