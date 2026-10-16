"""Conversation retrieval and validation service."""
from sqlalchemy.orm import Session
from typing import Optional, List, Set
from app.models.conversation import Conversation, ConversationStep, ConversationOption
from app.models.scenario import Scenario


def get_published_conversation(db: Session, scenario_id: int) -> Optional[Conversation]:
    """Return the published conversation for a scenario, with steps and options."""
    conv = (
        db.query(Conversation)
        .filter(
            Conversation.scenario_id == scenario_id,
            Conversation.is_published == True,
        )
        .first()
    )
    return conv


def get_step_by_id(db: Session, step_id: int) -> Optional[ConversationStep]:
    return db.query(ConversationStep).filter(ConversationStep.id == step_id).first()


def get_option_result(db: Session, option_id: int) -> Optional[ConversationOption]:
    """Return option with is_correct and feedback — only after user selects."""
    return db.query(ConversationOption).filter(ConversationOption.id == option_id).first()


def validate_conversation(db: Session, conversation: Conversation) -> List[str]:
    """Validate the conversation graph. Returns a list of error strings."""
    errors = []

    if not conversation.steps:
        errors.append("Conversation has no steps")
        return errors

    step_ids: Set[int] = {s.id for s in conversation.steps}

    if conversation.start_step_id not in step_ids:
        errors.append(f"start_step_id {conversation.start_step_id} not in steps")

    for step in conversation.steps:
        if step.step_type == "choice" and not step.options:
            errors.append(f"Step {step.id} is type 'choice' but has no options")
        for opt in step.options:
            if opt.next_step_id and opt.next_step_id not in step_ids:
                errors.append(f"Option {opt.id} references non-existent step {opt.next_step_id}")

    return errors
