from pydantic import BaseModel
from typing import Optional, List


class ConversationOptionOut(BaseModel):
    id: int
    option_text: str
    option_kannada: Optional[str] = None
    option_transliteration: Optional[str] = None
    next_step_id: Optional[int] = None
    display_order: int
    # NOTE: is_correct and feedback are NOT included in delivery schema
    # They are revealed after user selects an option

    model_config = {"from_attributes": True}


class ConversationOptionResult(BaseModel):
    """Returned after user selects an option."""
    is_correct: bool
    feedback: Optional[str] = None
    feedback_kannada: Optional[str] = None
    next_step_id: Optional[int] = None

    model_config = {"from_attributes": True}


class ConversationStepOut(BaseModel):
    id: int
    speaker: str
    message: str
    message_kannada: Optional[str] = None
    message_transliteration: Optional[str] = None
    step_type: str
    display_order: int
    options: List[ConversationOptionOut] = []

    model_config = {"from_attributes": True}


class ConversationOut(BaseModel):
    id: int
    scenario_id: int
    title: str
    description: Optional[str] = None
    start_step_id: Optional[int] = None
    steps: List[ConversationStepOut] = []

    model_config = {"from_attributes": True}
