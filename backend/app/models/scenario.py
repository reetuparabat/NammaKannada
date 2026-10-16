from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class DifficultyLevel(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=False)
    learning_objectives = Column(Text, nullable=True)  # JSON string
    estimated_minutes = Column(Integer, nullable=False, default=10)
    difficulty = Column(String(20), nullable=False, default="beginner")
    display_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    category = relationship("Category", back_populates="scenarios")
    phrases = relationship("Phrase", back_populates="scenario", order_by="Phrase.id")
    conversations = relationship("Conversation", back_populates="scenario")
    quiz_questions = relationship("QuizQuestion", back_populates="scenario", order_by="QuizQuestion.display_order")
    user_progress = relationship("UserProgress", back_populates="scenario")

    def __repr__(self):
        return f"<Scenario(id={self.id}, title={self.title})>"
