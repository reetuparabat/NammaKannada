from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    """Minimal user model for future authenticated features."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), nullable=False, unique=True, index=True)
    email = Column(String(200), nullable=True, unique=True, index=True)
    hashed_password = Column(String(200), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    is_admin = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    progress = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")
    saved_phrases = relationship("SavedPhrase", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"


class UserProgress(Base):
    """Tracks which scenarios a user has completed and their quiz scores."""
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id", ondelete="CASCADE"), nullable=False, index=True)
    # For anonymous users, use a session identifier from frontend
    session_id = Column(String(100), nullable=True, index=True)
    completed_conversation = Column(Boolean, nullable=False, default=False)
    completed_quiz = Column(Boolean, nullable=False, default=False)
    quiz_score = Column(Float, nullable=True)
    quiz_total = Column(Integer, nullable=True)
    last_accessed_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="progress")
    scenario = relationship("Scenario", back_populates="user_progress")

    def __repr__(self):
        return f"<UserProgress(id={self.id}, scenario_id={self.scenario_id})>"


class SavedPhrase(Base):
    """Saved/bookmarked phrases for a user."""
    __tablename__ = "saved_phrases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    phrase_id = Column(Integer, ForeignKey("phrases.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(String(100), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Unique: one save per phrase per user (or session)
    __table_args__ = (
        UniqueConstraint("user_id", "phrase_id", name="uq_user_phrase"),
    )

    # Relationships
    user = relationship("User", back_populates="saved_phrases")
    phrase = relationship("Phrase", back_populates="saved_by")

    def __repr__(self):
        return f"<SavedPhrase(id={self.id}, phrase_id={self.phrase_id})>"
