"""Quiz delivery and server-side scoring service."""
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from app.models.quiz import QuizQuestion, QuizOption
from app.schemas.quiz import QuizSubmit, QuizResult, QuizAnswerResult


def get_quiz_questions(db: Session, scenario_id: int) -> List[QuizQuestion]:
    """Return quiz questions for a scenario WITHOUT exposing correct answers."""
    return (
        db.query(QuizQuestion)
        .filter(QuizQuestion.scenario_id == scenario_id)
        .order_by(QuizQuestion.display_order)
        .all()
    )


def score_quiz(db: Session, scenario_id: int, submission: QuizSubmit) -> QuizResult:
    """Server-side quiz scoring. Never trusts frontend scores."""
    questions = get_quiz_questions(db, scenario_id)
    if not questions:
        return QuizResult(
            scenario_id=scenario_id,
            score=0, total=0, percentage=0.0, passed=False, answers=[]
        )

    question_map: Dict[int, QuizQuestion] = {q.id: q for q in questions}
    correct_count = 0
    answer_results: List[QuizAnswerResult] = []

    # Track which questions were answered (prevent duplicate submissions)
    answered_question_ids: set = set()

    for answer in submission.answers:
        qid = answer.question_id
        if qid in answered_question_ids:
            continue  # skip duplicate
        answered_question_ids.add(qid)

        question = question_map.get(qid)
        if not question:
            continue  # invalid question id — skip

        # Get the correct option for this question
        correct_option = next((o for o in question.options if o.is_correct), None)
        if not correct_option:
            continue

        # Find the selected option
        selected_option = db.query(QuizOption).filter(
            QuizOption.id == answer.selected_option_id,
            QuizOption.question_id == qid,
        ).first()

        if not selected_option:
            # Invalid option — mark incorrect
            answer_results.append(QuizAnswerResult(
                question_id=qid,
                selected_option_id=answer.selected_option_id,
                is_correct=False,
                correct_option_id=correct_option.id,
                explanation=question.explanation,
                question_text=question.question_text,
            ))
            continue

        is_correct = selected_option.is_correct
        if is_correct:
            correct_count += 1

        answer_results.append(QuizAnswerResult(
            question_id=qid,
            selected_option_id=answer.selected_option_id,
            is_correct=is_correct,
            correct_option_id=correct_option.id,
            explanation=question.explanation,
            question_text=question.question_text,
        ))

    total = len(question_map)
    percentage = round((correct_count / total * 100), 1) if total > 0 else 0.0
    passed = percentage >= 60.0

    return QuizResult(
        scenario_id=scenario_id,
        score=correct_count,
        total=total,
        percentage=percentage,
        passed=passed,
        answers=answer_results,
    )
