from pydantic import BaseModel
from typing import Optional, List, Dict


class QuizOptionOut(BaseModel):
    """Quiz option - is_correct is NOT exposed before submission."""
    id: int
    option_text: str
    option_kannada: Optional[str] = None
    display_order: int

    model_config = {"from_attributes": True}


class QuizQuestionOut(BaseModel):
    id: int
    question_text: str
    question_kannada: Optional[str] = None
    question_type: str
    display_order: int
    options: List[QuizOptionOut] = []

    model_config = {"from_attributes": True}


class QuizOut(BaseModel):
    scenario_id: int
    questions: List[QuizQuestionOut] = []
    total_questions: int

    model_config = {"from_attributes": True}


class QuizAnswerItem(BaseModel):
    question_id: int
    selected_option_id: int


class QuizSubmit(BaseModel):
    answers: List[QuizAnswerItem]


class QuizAnswerResult(BaseModel):
    question_id: int
    selected_option_id: int
    is_correct: bool
    correct_option_id: int
    explanation: Optional[str] = None
    question_text: str


class QuizResult(BaseModel):
    scenario_id: int
    score: int
    total: int
    percentage: float
    passed: bool
    answers: List[QuizAnswerResult]
