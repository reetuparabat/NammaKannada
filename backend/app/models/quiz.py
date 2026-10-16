import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class QuestionType(str, enum.Enum):
    multiple_choice = "multiple_choice"
    meaning_match = "meaning_match"
    situation_match = "situation_match"


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    question_kannada = Column(Text, nullable=True)
    question_type = Column(String(30), nullable=False, default=QuestionType.multiple_choice.value)
    explanation = Column(Text, nullable=True)
    display_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    scenario = relationship("Scenario", back_populates="quiz_questions")
    options = relationship("QuizOption", back_populates="question",
                           cascade="all, delete-orphan",
                           order_by="QuizOption.display_order")

    def __repr__(self):
        return f"<QuizQuestion(id={self.id}, scenario_id={self.scenario_id})>"


class QuizOption(Base):
    __tablename__ = "quiz_options"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    option_text = Column(Text, nullable=False)
    option_kannada = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=False, default=False)
    display_order = Column(Integer, nullable=False, default=0)

    # Relationships
    question = relationship("QuizQuestion", back_populates="options")

    def __repr__(self):
        return f"<QuizOption(id={self.id}, question_id={self.question_id}, correct={self.is_correct})>"
