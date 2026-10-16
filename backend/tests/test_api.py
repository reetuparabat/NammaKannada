"""
Comprehensive API and Business Logic Tests for NammaKannada.
Tests all endpoints: Health, Categories, Scenarios, Phrases, Search,
Conversations, Quizzes, Offline Manifest, and Admin Workflow.
"""
import pytest

# ─── 1. Health & Root Endpoints ─────────────────────────────────────

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "ok"
    assert "version" in data


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "NammaKannada API" in data["name"]
    assert "/docs" in data["docs"]


# ─── 2. Categories Endpoints ────────────────────────────────────────

def test_list_categories(client):
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) >= 4
    # Check that required categories exist
    names = [c["name"] for c in categories]
    assert any("Transportation" in n for n in names)
    assert any("Shopping" in n for n in names)
    assert any("Education" in n or "College" in n for n in names)
    assert any("Healthcare" in n for n in names)

    # Check each has scenario count
    for c in categories:
        assert c["scenario_count"] > 0
        assert "slug" in c
        assert "icon" in c


def test_get_category_detail(client):
    response = client.get("/api/v1/categories/1")
    assert response.status_code == 200
    cat = response.json()
    assert cat["id"] == 1
    assert "name" in cat
    assert cat["scenario_count"] >= 3


def test_get_category_not_found(client):
    response = client.get("/api/v1/categories/99999")
    assert response.status_code == 404


def test_list_category_scenarios(client):
    response = client.get("/api/v1/categories/1/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) >= 3
    for s in scenarios:
        assert s["category_id"] == 1
        assert "title" in s
        assert "learning_objectives" in s
        assert "difficulty" in s


# ─── 3. Scenario & Phrase Details ───────────────────────────────────

def test_get_scenario_detail(client):
    response = client.get("/api/v1/scenarios/1")
    assert response.status_code == 200
    s = response.json()
    assert s["id"] == 1
    assert "title" in s
    assert s["phrase_count"] > 0


def test_get_scenario_phrases(client):
    response = client.get("/api/v1/scenarios/1/phrases")
    assert response.status_code == 200
    phrases = response.json()
    assert len(phrases) >= 4
    for p in phrases:
        assert "kannada_text" in p
        assert "english_meaning" in p
        assert "transliteration" in p
        assert p["status"] == "published"


def test_get_phrase_by_id(client):
    response = client.get("/api/v1/phrases/1")
    assert response.status_code == 200
    phrase = response.json()
    assert phrase["id"] == 1
    assert phrase["kannada_text"]
    assert phrase["english_meaning"]
    assert phrase["transliteration"]


def test_get_phrase_not_found(client):
    response = client.get("/api/v1/phrases/99999")
    assert response.status_code == 404


# ─── 4. Search Functionality ─────────────────────────────────────────

def test_search_phrases_empty(client):
    response = client.get("/api/v1/phrases/search?q=")
    assert response.status_code == 200
    assert response.json() == []


def test_search_phrases_query(client):
    # Search for common english or transliteration words
    response = client.get("/api/v1/phrases/search?q=bus")
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0
    first = results[0]
    assert "kannada_text" in first
    assert "english_meaning" in first
    assert "scenario_title" in first


# ─── 5. Conversation Engine ─────────────────────────────────────────

def test_get_scenario_conversation(client):
    response = client.get("/api/v1/scenarios/1/conversation")
    assert response.status_code == 200
    conv = response.json()
    assert conv["scenario_id"] == 1
    assert len(conv["steps"]) > 0
    assert conv["start_step_id"] is not None

    # Check that steps have dialogue and options
    has_options = any(len(step["options"]) > 0 for step in conv["steps"])
    assert has_options


# ─── 6. Quiz Engine & Scoring ───────────────────────────────────────

def test_get_scenario_quiz(client):
    response = client.get("/api/v1/scenarios/1/quiz")
    assert response.status_code == 200
    quiz = response.json()
    assert quiz["scenario_id"] == 1
    assert quiz["total_questions"] >= 2
    assert len(quiz["questions"]) >= 2

    # Verify that correct answer flags are NOT leaked to the client
    for q in quiz["questions"]:
        assert "question_text" in q
        assert len(q["options"]) >= 2
        for opt in q["options"]:
            assert "is_correct" not in opt


def test_submit_quiz_scoring(client):
    # Fetch quiz to inspect question and option IDs
    quiz_res = client.get("/api/v1/scenarios/1/quiz")
    quiz = quiz_res.json()
    assert len(quiz["questions"]) > 0

    # Submit an answer for each question using first option
    answers = [
        {"question_id": q["id"], "selected_option_id": q["options"][0]["id"]}
        for q in quiz["questions"]
    ]

    submit_res = client.post(
        "/api/v1/scenarios/1/quiz/submit",
        json={"answers": answers},
    )
    assert submit_res.status_code == 200
    result = submit_res.json()
    assert result["total"] == len(quiz["questions"])
    assert "score" in result
    assert "percentage" in result
    assert "passed" in result
    assert len(result["answers"]) == len(quiz["questions"])

    # Detailed feedback must be present for review
    first_result = result["answers"][0]
    assert "question_text" in first_result
    assert "is_correct" in first_result
    assert "explanation" in first_result


def test_submit_quiz_empty_answers(client):
    res = client.post("/api/v1/scenarios/1/quiz/submit", json={"answers": []})
    assert res.status_code == 400


# ─── 7. Offline Manifest ────────────────────────────────────────────

def test_offline_manifest(client):
    response = client.get("/api/v1/offline/manifest")
    assert response.status_code == 200
    manifest = response.json()
    assert "version" in manifest
    assert "categories" in manifest
    assert len(manifest["categories"]) >= 4

    # Verify nested structure for offline storage
    cat = manifest["categories"][0]
    assert "scenarios" in cat
    assert len(cat["scenarios"]) > 0
    scen = cat["scenarios"][0]
    assert "phrases" in scen
    assert len(scen["phrases"]) > 0
    phrase = scen["phrases"][0]
    assert "kannada_text" in phrase
    assert "english_meaning" in phrase


# ─── 8. Admin Security & Content Lifecycle ──────────────────────────

def test_admin_content_unauthorized(client):
    response = client.get("/api/v1/admin/content")
    assert response.status_code == 401


def test_admin_content_authorized(client, admin_auth):
    response = client.get("/api/v1/admin/content", headers=admin_auth)
    assert response.status_code == 200
    data = response.json()
    assert "phrases" in data
    assert data["total"] > 0


def test_admin_phrase_lifecycle(client, admin_auth):
    """
    Test complete editorial workflow:
    Create (Draft) -> Submit for Review -> Approve -> Publish -> Archive
    """
    # 1. Create a draft phrase
    create_payload = {
        "scenario_id": 1,
        "kannada_text": "ಪರೀಕ್ಷಾರ್ಥ ವಾಕ್ಯ",
        "english_meaning": "Test phrase for editorial workflow",
        "transliteration": "Parikshaartha vaakya",
        "context": "Automated workflow testing",
        "example": "ಪರೀಕ್ಷಾರ್ಥ ಉದಾಹರಣೆ",
        "formality_note": "Formal",
    }
    create_res = client.post(
        "/api/v1/admin/content/phrases",
        json=create_payload,
        headers=admin_auth,
    )
    assert create_res.status_code == 200
    phrase = create_res.json()
    phrase_id = phrase["id"]
    assert phrase["status"] == "draft"

    # 2. Submit for review
    review_res = client.post(
        f"/api/v1/admin/content/phrases/{phrase_id}/submit-review",
        headers=admin_auth,
    )
    assert review_res.status_code == 200
    assert review_res.json()["status"] == "under_review"

    # 3. Approve
    approve_res = client.post(
        f"/api/v1/admin/content/phrases/{phrase_id}/approve",
        headers=admin_auth,
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "approved"

    # 4. Publish
    publish_res = client.post(
        f"/api/v1/admin/content/phrases/{phrase_id}/publish",
        headers=admin_auth,
    )
    assert publish_res.status_code == 200
    assert publish_res.json()["status"] == "published"

    # 5. Archive
    archive_res = client.post(
        f"/api/v1/admin/content/phrases/{phrase_id}/archive",
        headers=admin_auth,
    )
    assert archive_res.status_code == 200
    assert archive_res.json()["status"] == "archived"


def test_unauthorized_user_cannot_approve_or_publish(client):
    """
    Ensure endpoints for approval and publishing strictly reject unauthenticated users.
    """
    app_res = client.post("/api/v1/admin/content/phrases/1/approve")
    assert app_res.status_code == 401

    pub_res = client.post("/api/v1/admin/content/phrases/1/publish")
    assert pub_res.status_code == 401


def test_modifying_published_phrase_reverts_to_draft(client, admin_auth):
    """
    Editing linguistic content of an approved/published phrase must automatically
    revert its status back to 'draft' to require re-review.
    """
    # 1. Create, review, approve and publish a test phrase
    create_res = client.post(
        "/api/v1/admin/content/phrases",
        json={
            "scenario_id": 1,
            "kannada_text": "ಮೂಲ ವಾಕ್ಯ",
            "english_meaning": "Original published phrase",
            "transliteration": "Moola vaakya",
        },
        headers=admin_auth,
    )
    p_id = create_res.json()["id"]
    client.post(f"/api/v1/admin/content/phrases/{p_id}/submit-review", headers=admin_auth)
    client.post(f"/api/v1/admin/content/phrases/{p_id}/approve", headers=admin_auth)
    pub_res = client.post(f"/api/v1/admin/content/phrases/{p_id}/publish", headers=admin_auth)
    assert pub_res.json()["status"] == "published"

    # 2. Modify the phrase's English meaning as an admin
    update_res = client.patch(
        f"/api/v1/admin/content/phrases/{p_id}",
        json={"english_meaning": "Altered meaning that requires re-verification"},
        headers=admin_auth,
    )
    assert update_res.status_code == 200
    updated_phrase = update_res.json()
    # Must have reverted to draft!
    assert updated_phrase["status"] == "draft"


def test_draft_phrase_excluded_from_search_and_manifest(client, admin_auth):
    """
    Draft or unapproved phrases must NOT be returned in public search or offline manifest.
    """
    secret_term = "SuperSecretDraftQuery99"
    create_res = client.post(
        "/api/v1/admin/content/phrases",
        json={
            "scenario_id": 1,
            "kannada_text": "ರಹಸ್ಯ ವಾಕ್ಯ",
            "english_meaning": secret_term,
            "transliteration": "Rahasya vaakya",
        },
        headers=admin_auth,
    )
    assert create_res.status_code == 200
    assert create_res.json()["status"] == "draft"

    # Search should NOT return this phrase
    search_res = client.get(f"/api/v1/phrases/search?q={secret_term}")
    assert search_res.status_code == 200
    results = search_res.json()
    assert len(results) == 0

    # Offline manifest should NOT contain this phrase
    manifest_res = client.get("/api/v1/offline/manifest")
    assert manifest_res.status_code == 200
    manifest_text = str(manifest_res.json())
    assert secret_term not in manifest_text

