"""Phrase retrieval and search service."""
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from typing import List, Optional
from app.models.phrase import Phrase, PhraseStatus
from app.models.scenario import Scenario
from app.models.category import Category
from app.schemas.phrase import PhraseSearchResult

MAX_SEARCH_RESULTS = 50
MAX_QUERY_LENGTH = 200


def get_published_phrases_for_scenario(db: Session, scenario_id: int) -> List[Phrase]:
    return (
        db.query(Phrase)
        .filter(Phrase.scenario_id == scenario_id, Phrase.status == PhraseStatus.published.value)
        .order_by(Phrase.display_order)
        .all()
    )


def get_phrase_by_id(db: Session, phrase_id: int) -> Optional[Phrase]:
    return db.query(Phrase).filter(Phrase.id == phrase_id).first()


def get_published_phrase_by_id(db: Session, phrase_id: int) -> Optional[Phrase]:
    return db.query(Phrase).filter(
        Phrase.id == phrase_id,
        Phrase.status == PhraseStatus.published.value
    ).first()


# Colloquial and semantic synonym dictionary for Kanglish / Everyday English queries
SEARCH_SYNONYMS = {
    "cost": ["price", "eshtu", "bele", "rate", "fare", "ticket"],
    "price": ["cost", "eshtu", "bele", "rate", "fare", "ticket"],
    "rate": ["price", "cost", "eshtu", "bele"],
    "fare": ["ticket", "auto", "meter", "eshtu", "bele"],
    "ticket": ["fare", "bus", "train", "metro", "kodi", "bele"],
    "upi": ["online", "qr", "google", "phonepe", "paytm", "gpay", "scan", "payment"],
    "gpay": ["upi", "google", "online", "qr", "payment"],
    "phonepe": ["upi", "online", "qr", "payment"],
    "pay": ["payment", "kattabeeku", "kodi", "bill", "online"],
    "food": ["oota", "dose", "coffee", "tindi", "meals", "parcel", "khaara"],
    "coffee": ["tea", "chaha", "filter", "bisi", "kodi"],
    "dosa": ["masala", "dose", "garigari", "chutney"],
    "water": ["neeru", "bisi", "can", "tap"],
    "spicy": ["khaara", "kadime", "medium", "sihi"],
    "spice": ["khaara", "kadime"],
    "sweet": ["sihi", "chutney"],
    "rent": ["baadige", "advance", "deposit", "mane", "room", "pg"],
    "house": ["mane", "baadige", "room", "flat"],
    "room": ["mane", "kothadi", "pg"],
    "where": ["elli", "yelli", "ellide", "daari", "station", "stop"],
    "stop": ["nillisi", "bus", "elli"],
    "left": ["edagade", "tirugi"],
    "right": ["right", "tagolli", "munde"],
    "straight": ["munde", "neeravaagi"],
    "near": ["hattira", "hattiradalle"],
    "far": ["doora", "thumba"],
    "how": ["hege", "yaavaaga", "eshtu"],
    "thanks": ["dhanyavada", "thank you", "dhanyavaadagalu"],
    "hello": ["namaskara", "namaste", "oota"],
    "slow": ["nidhaanavaagi", "slowly"],
    "adjust": ["svalpa", "cooperate"],
    "medicine": ["maatre", "syrup", "tablet", "doctor", "fever", "jvara"],
    "doctor": ["hospital", "clinic", "prescription", "fever", "jvara"],
    "fever": ["jvara", "maatre", "cold", "doctor"],
    "pain": ["novu", "thale", "headache"],
    "headache": ["thale", "novu", "maatre"],
}

def search_phrases(db: Session, query: str) -> List[PhraseSearchResult]:
    """Search published phrases by English, Kannada, or transliteration with synonym & multi-token matching."""
    import re
    if not query or not query.strip():
        return []

    raw_q = query.strip()[:MAX_QUERY_LENGTH]
    # Clean punctuation
    clean_q = re.sub(r'[?!.,;:"\'()\[\]{}]', ' ', raw_q).strip()
    q_lower = clean_q.lower()

    if not q_lower:
        return []

    # Get candidate published phrases
    query_builder = (
        db.query(Phrase, Scenario, Category)
        .join(Scenario, Phrase.scenario_id == Scenario.id)
        .join(Category, Scenario.category_id == Category.id)
        .filter(
            Phrase.status == PhraseStatus.published.value,
            Scenario.is_active == True,
            Category.is_active == True,
        )
    )

    # Base tokens
    base_tokens = [t for t in q_lower.split() if len(t) >= 2]
    all_tokens = set(base_tokens)

    # Expand with synonyms
    for t in base_tokens:
        if t in SEARCH_SYNONYMS:
            all_tokens.update(SEARCH_SYNONYMS[t])

    # Build database query conditions
    conditions = [
        func.lower(Phrase.english_meaning).contains(q_lower),
        func.lower(Phrase.transliteration).contains(q_lower),
        Phrase.kannada_text.contains(raw_q),
        func.lower(Scenario.title).contains(q_lower),
    ]

    for tok in all_tokens:
        conditions.extend([
            func.lower(Phrase.english_meaning).contains(tok),
            func.lower(Phrase.transliteration).contains(tok),
            func.lower(Phrase.context).contains(tok),
        ])

    candidates = query_builder.filter(or_(*conditions)).limit(MAX_SEARCH_RESULTS * 3).all()

    # Score candidates based on exact query, base tokens, and synonyms
    scored_results = []
    for phrase, scenario, category in candidates:
        score = 0
        em = (phrase.english_meaning or '').lower()
        tr = (phrase.transliteration or '').lower()
        kn = phrase.kannada_text or ''
        ctx = (phrase.context or '').lower()

        # Exact match bonus
        if q_lower in em:
            score += 100
        if q_lower in tr:
            score += 90
        if raw_q in kn:
            score += 100

        # Base token match (high weight)
        for tok in base_tokens:
            if tok in em:
                score += 20
            if tok in tr:
                score += 18
            if tok in ctx:
                score += 10

        # Synonym token match (moderate weight)
        for tok in all_tokens - set(base_tokens):
            if tok in em:
                score += 12
            if tok in tr:
                score += 10
            if tok in ctx:
                score += 6

        scored_results.append((score, phrase, scenario, category))

    # Sort descending by relevance score
    scored_results.sort(key=lambda x: x[0], reverse=True)

    out = []
    for _, phrase, scenario, category in scored_results[:MAX_SEARCH_RESULTS]:
        out.append(PhraseSearchResult(
            id=phrase.id,
            scenario_id=phrase.scenario_id,
            kannada_text=phrase.kannada_text,
            english_meaning=phrase.english_meaning,
            transliteration=phrase.transliteration,
            context=phrase.context,
            scenario_title=scenario.title,
            category_name=category.name,
        ))
    return out


def create_phrase(db: Session, data: dict) -> Phrase:
    # Explicitly ensure status is always draft upon creation, ignoring any user-submitted status
    clean_data = {k: v for k, v in data.items() if k != "status"}
    phrase = Phrase(**clean_data, status=PhraseStatus.draft.value)
    db.add(phrase)
    db.commit()
    db.refresh(phrase)
    return phrase


def update_phrase(db: Session, phrase: Phrase, data: dict, admin_user: str = "admin") -> Phrase:
    """
    Update phrase fields.
    If the phrase was previously published or approved, modifying any linguistic content
    automatically resets its status to draft, requiring re-review and approval.
    Direct modification of the 'status' field via payload is strictly prohibited.
    """
    clean_data = {k: v for k, v in data.items() if k != "status"}
    content_fields = {"kannada_text", "english_meaning", "transliteration", "context", "example", "formality_note"}
    content_changed = False

    for key, val in clean_data.items():
        if val is not None and getattr(phrase, key, None) != val:
            if key in content_fields:
                content_changed = True
            setattr(phrase, key, val)

    if content_changed and phrase.status in (PhraseStatus.published.value, PhraseStatus.approved.value):
        old_status = phrase.status
        phrase.status = PhraseStatus.draft.value
        from app.models.phrase import PhraseReview
        review = PhraseReview(
            phrase_id=phrase.id,
            reviewer_identifier=admin_user,
            review_status="needs_revision",
            comments=f"Content updated while in {old_status} state. Status automatically reverted to draft for re-review.",
        )
        db.add(review)

    db.commit()
    db.refresh(phrase)
    return phrase


VALID_TRANSITIONS = {
    PhraseStatus.draft.value: [PhraseStatus.under_review.value, PhraseStatus.archived.value],
    PhraseStatus.under_review.value: [PhraseStatus.approved.value, PhraseStatus.rejected.value, PhraseStatus.archived.value],
    PhraseStatus.approved.value: [PhraseStatus.published.value, PhraseStatus.draft.value, PhraseStatus.archived.value],
    PhraseStatus.published.value: [PhraseStatus.archived.value, PhraseStatus.draft.value],
    PhraseStatus.rejected.value: [PhraseStatus.draft.value, PhraseStatus.archived.value],
    PhraseStatus.archived.value: [PhraseStatus.draft.value],
}


def transition_phrase_status(db: Session, phrase: Phrase, new_status: str) -> tuple[Phrase, str | None]:
    """Attempt a status transition. Returns (phrase, error_message)."""
    allowed = VALID_TRANSITIONS.get(phrase.status, [])
    if new_status not in allowed:
        return phrase, f"Cannot transition from '{phrase.status}' to '{new_status}'"
    phrase.status = new_status
    db.commit()
    db.refresh(phrase)
    return phrase, None
