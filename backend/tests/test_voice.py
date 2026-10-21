"""
Unit & Integration Tests for Voice Translation and Transcription API.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_voice_status():
    """Verify that the voice status endpoint returns supported language metadata."""
    response = client.get("/api/v1/voice/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"
    assert any(lang["code"] == "en" for lang in data["supported_languages"])
    assert any(lang["code"] == "kn" for lang in data["supported_languages"])
    assert len(data["translation_directions"]) == 2


def test_translate_english_to_kannada():
    """Verify English to Kannada translation returns valid Kannada text."""
    payload = {
        "text": "How are you?",
        "source_language": "en",
        "target_language": "kn"
    }
    response = client.post("/api/v1/voice/translate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["source_language"] == "en"
    assert data["target_language"] == "kn"
    assert len(data["translated_text"].strip()) > 0
    # Kannada Unicode block is U+0C80 to U+0CFF
    has_kannada_char = any('\u0c80' <= char <= '\u0cff' for char in data["translated_text"])
    assert has_kannada_char, f"Expected Kannada characters, got: {data['translated_text']}"


def test_translate_kannada_to_english():
    """Verify Kannada to English translation returns valid English text."""
    payload = {
        "text": "ನೀವು ಹೇಗಿದ್ದೀರಿ?",
        "source_language": "kn",
        "target_language": "en"
    }
    response = client.post("/api/v1/voice/translate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["source_language"] == "kn"
    assert data["target_language"] == "en"
    assert len(data["translated_text"].strip()) > 0
    # Should contain ASCII/English alphabet
    assert any(char.isalpha() for char in data["translated_text"])


def test_translate_validation_empty_text():
    """Verify that empty text is rejected with validation error."""
    payload = {
        "text": "   ",
        "source_language": "en",
        "target_language": "kn"
    }
    response = client.post("/api/v1/voice/translate", json=payload)
    assert response.status_code in (400, 422)


def test_translate_validation_same_language():
    """Verify that identical source and target languages are rejected."""
    payload = {
        "text": "Hello",
        "source_language": "en",
        "target_language": "en"
    }
    response = client.post("/api/v1/voice/translate", json=payload)
    assert response.status_code in (400, 422)


def test_translate_validation_unsupported_language():
    """Verify that unsupported language codes are rejected."""
    payload = {
        "text": "Hello",
        "source_language": "fr",
        "target_language": "kn"
    }
    response = client.post("/api/v1/voice/translate", json=payload)
    assert response.status_code in (400, 422)


def test_transcribe_empty_file():
    """Verify that empty audio upload is rejected."""
    files = {"file": ("empty.wav", b"", "audio/wav")}
    response = client.post("/api/v1/voice/transcribe", files=files, data={"language": "en"})
    assert response.status_code in (400, 422)


def test_transcribe_invalid_language():
    """Verify that invalid transcription language is rejected."""
    files = {"file": ("test.wav", b"RIFF....WAVEfmt ....data....", "audio/wav")}
    response = client.post("/api/v1/voice/transcribe", files=files, data={"language": "es"})
    assert response.status_code == 400
