from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.services.category_service import get_scenario_by_id
from app.services.phrase_service import (
    get_published_phrases_for_scenario, get_published_phrase_by_id, search_phrases
)
from app.services.conversation_service import get_published_conversation
from app.services.quiz_service import get_quiz_questions, score_quiz
from app.schemas.scenario import ScenarioOut, ScenarioDetail
from app.schemas.phrase import PhraseOut, PhraseSearchResult
from app.schemas.conversation import ConversationOut, ConversationStepOut, ConversationOptionOut
from app.schemas.quiz import QuizOut, QuizQuestionOut, QuizOptionOut, QuizSubmit, QuizResult
from app.models.scenario import Scenario

router = APIRouter(tags=["scenarios & phrases"])


@router.get("/scenarios/{scenario_id}", response_model=ScenarioOut)
def get_scenario(scenario_id: int, db: Session = Depends(get_db)):
    s = get_scenario_by_id(db, scenario_id)
    if not s:
        raise HTTPException(status_code=404, detail="Scenario not found")
    from sqlalchemy import func
    from app.models.phrase import Phrase, PhraseStatus
    count = db.query(func.count(Phrase.id)).filter(
        Phrase.scenario_id == s.id, Phrase.status == PhraseStatus.published.value
    ).scalar()
    return ScenarioOut(
        id=s.id, category_id=s.category_id, title=s.title, slug=s.slug,
        description=s.description, learning_objectives=s.learning_objectives,
        estimated_minutes=s.estimated_minutes, difficulty=s.difficulty,
        display_order=s.display_order, phrase_count=count or 0,
    )


@router.get("/scenarios/{scenario_id}/phrases", response_model=List[PhraseOut])
def get_scenario_phrases(scenario_id: int, db: Session = Depends(get_db)):
    s = get_scenario_by_id(db, scenario_id)
    if not s:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return get_published_phrases_for_scenario(db, scenario_id)


@router.get("/scenarios/{scenario_id}/conversation", response_model=ConversationOut)
def get_scenario_conversation(scenario_id: int, db: Session = Depends(get_db)):
    s = get_scenario_by_id(db, scenario_id)
    if not s:
        raise HTTPException(status_code=404, detail="Scenario not found")
    conv = get_published_conversation(db, scenario_id)
    if not conv:
        raise HTTPException(status_code=404, detail="No published conversation for this scenario")

    steps_out = []
    for step in conv.steps:
        options_out = [
            ConversationOptionOut(
                id=opt.id,
                option_text=opt.option_text,
                option_kannada=opt.option_kannada,
                option_transliteration=opt.option_transliteration,
                next_step_id=opt.next_step_id,
                display_order=opt.display_order,
            )
            for opt in sorted(step.options, key=lambda o: o.display_order)
        ]
        steps_out.append(ConversationStepOut(
            id=step.id,
            speaker=step.speaker,
            message=step.message,
            message_kannada=step.message_kannada,
            message_transliteration=step.message_transliteration,
            step_type=step.step_type,
            display_order=step.display_order,
            options=options_out,
        ))

    return ConversationOut(
        id=conv.id,
        scenario_id=conv.scenario_id,
        title=conv.title,
        description=conv.description,
        start_step_id=conv.start_step_id,
        steps=steps_out,
    )


@router.get("/scenarios/{scenario_id}/quiz", response_model=QuizOut)
def get_scenario_quiz(scenario_id: int, db: Session = Depends(get_db)):
    s = get_scenario_by_id(db, scenario_id)
    if not s:
        raise HTTPException(status_code=404, detail="Scenario not found")
    questions = get_quiz_questions(db, scenario_id)
    if not questions:
        raise HTTPException(status_code=404, detail="No quiz found for this scenario")

    questions_out = []
    for q in questions:
        options_out = [
            QuizOptionOut(
                id=opt.id,
                option_text=opt.option_text,
                option_kannada=opt.option_kannada,
                display_order=opt.display_order,
                # is_correct is NOT included here
            )
            for opt in q.options
        ]
        questions_out.append(QuizQuestionOut(
            id=q.id,
            question_text=q.question_text,
            question_kannada=q.question_kannada,
            question_type=q.question_type,
            display_order=q.display_order,
            options=options_out,
        ))

    return QuizOut(
        scenario_id=scenario_id,
        questions=questions_out,
        total_questions=len(questions_out),
    )


@router.post("/scenarios/{scenario_id}/quiz/submit", response_model=QuizResult)
def submit_quiz(scenario_id: int, submission: QuizSubmit, db: Session = Depends(get_db)):
    s = get_scenario_by_id(db, scenario_id)
    if not s:
        raise HTTPException(status_code=404, detail="Scenario not found")
    if not submission.answers:
        raise HTTPException(status_code=400, detail="No answers submitted")
    return score_quiz(db, scenario_id, submission)


@router.get("/phrases/search", response_model=List[PhraseSearchResult])
def search(
    q: str = Query(default="", max_length=200, description="Search query"),
    db: Session = Depends(get_db)
):
    if not q.strip():
        return []
    return search_phrases(db, q)


@router.get("/phrases/{phrase_id}", response_model=PhraseOut)
def get_phrase(phrase_id: int, db: Session = Depends(get_db)):
    phrase = get_published_phrase_by_id(db, phrase_id)
    if not phrase:
        raise HTTPException(status_code=404, detail="Phrase not found or not published")
    return phrase
