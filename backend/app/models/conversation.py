from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    start_step_id = Column(Integer, nullable=True)  # set after steps are created
    is_published = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    scenario = relationship("Scenario", back_populates="conversations")
    steps = relationship("ConversationStep", back_populates="conversation",
                         cascade="all, delete-orphan", order_by="ConversationStep.display_order",
                         foreign_keys="ConversationStep.conversation_id")

    def __repr__(self):
        return f"<Conversation(id={self.id}, title={self.title})>"


class ConversationStep(Base):
    __tablename__ = "conversation_steps"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    speaker = Column(String(50), nullable=False)  # e.g. "system", "user", "narrator"
    message = Column(Text, nullable=False)
    message_kannada = Column(Text, nullable=True)
    message_transliteration = Column(Text, nullable=True)
    step_type = Column(String(20), nullable=False, default="prompt")  # prompt | choice | end
    display_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    conversation = relationship("Conversation", back_populates="steps",
                                foreign_keys=[conversation_id])
    options = relationship("ConversationOption", back_populates="step",
                           cascade="all, delete-orphan",
                           foreign_keys="ConversationOption.step_id")

    def __repr__(self):
        return f"<ConversationStep(id={self.id}, speaker={self.speaker})>"


class ConversationOption(Base):
    __tablename__ = "conversation_options"

    id = Column(Integer, primary_key=True, index=True)
    step_id = Column(Integer, ForeignKey("conversation_steps.id", ondelete="CASCADE"), nullable=False, index=True)
    option_text = Column(Text, nullable=False)
    option_kannada = Column(Text, nullable=True)
    option_transliteration = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=False, default=True)
    next_step_id = Column(Integer, ForeignKey("conversation_steps.id"), nullable=True)
    feedback = Column(Text, nullable=True)
    feedback_kannada = Column(Text, nullable=True)
    display_order = Column(Integer, nullable=False, default=0)

    # Relationships
    step = relationship("ConversationStep", back_populates="options", foreign_keys=[step_id])
    next_step = relationship("ConversationStep", foreign_keys=[next_step_id])

    def __repr__(self):
        return f"<ConversationOption(id={self.id}, step_id={self.step_id})>"
