"""
Unit & Integration Tests for Translation Provider Abstraction & Resilience.
Tests:
- Real English -> Kannada and Kannada -> English translation
- Empty input validation
- Invalid language pair validation
- Provider rate-limiting fallback (no retry on 429)
- Provider transient timeout with controlled retry
- Invalid credentials error classification
- All providers unavailable (raises 503 Service Unavailable)
"""
import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from app.services.translation_service import (
    translate_text,
    BaseTranslationProvider,
    TranslationRateLimitError,
    TranslationAuthError,
    TranslationTimeoutError,
    TranslationNetworkError,
    TranslationError,
    _get_providers,
)


def test_real_english_to_kannada():
    """Verify real bidirectional translation from English to Kannada."""
    res = translate_text("How are you?", "en", "kn")
    assert res["source_language"] == "en"
    assert res["target_language"] == "kn"
    assert len(res["translated_text"]) > 0
    # Must contain Kannada unicode characters
    assert any('\u0c80' <= c <= '\u0cff' for c in res["translated_text"])


def test_real_kannada_to_english():
    """Verify real bidirectional translation from Kannada to English."""
    res = translate_text("ನೀವು ಹೇಗಿದ್ದೀರಿ?", "kn", "en")
    assert res["source_language"] == "kn"
    assert res["target_language"] == "en"
    assert len(res["translated_text"]) > 0
    assert any(c.isalpha() for c in res["translated_text"])


def test_validation_empty_input():
    """Verify empty or whitespace string is rejected with HTTP 400."""
    with pytest.raises(HTTPException) as exc_info:
        translate_text("   ", "en", "kn")
    assert exc_info.value.status_code == 400
    assert "Cannot translate empty" in exc_info.value.detail


def test_validation_invalid_language_pair():
    """Verify unsupported language code is rejected with HTTP 400."""
    with pytest.raises(HTTPException) as exc_info:
        translate_text("Hello", "es", "kn")
    assert exc_info.value.status_code == 400
    assert "Unsupported language pair" in exc_info.value.detail


def test_provider_rate_limiting_fallback():
    """
    Verify that if a primary provider hits rate limiting (429),
    it is NOT retried on the same provider, and falls back cleanly to the secondary provider.
    """
    mock_p1 = MagicMock(spec=BaseTranslationProvider)
    mock_p1.name = "mock_primary"
    mock_p1.is_configured.return_value = True
    mock_p1.supports_pair.return_value = True
    mock_p1.translate.side_effect = TranslationRateLimitError("Daily quota finished")

    mock_p2 = MagicMock(spec=BaseTranslationProvider)
    mock_p2.name = "mock_secondary"
    mock_p2.is_configured.return_value = True
    mock_p2.supports_pair.return_value = True
    mock_p2.translate.return_value = "ಧನ್ಯವಾದಗಳು"

    with patch("app.services.translation_service._get_providers", return_value=[mock_p1, mock_p2]):
        res = translate_text("Thank you", "en", "kn")

    # Primary should only be called ONCE (no retry on rate-limit)
    assert mock_p1.translate.call_count == 1
    # Secondary should be called and succeed
    assert mock_p2.translate.call_count == 1
    assert res["translated_text"] == "ಧನ್ಯವಾದಗಳು"
    assert res["provider"] == "mock_secondary"


def test_provider_transient_timeout_retry():
    """
    Verify that a transient network/timeout error is retried once before succeeding.
    """
    mock_p1 = MagicMock(spec=BaseTranslationProvider)
    mock_p1.name = "mock_flaky"
    mock_p1.is_configured.return_value = True
    mock_p1.supports_pair.return_value = True
    # First attempt fails with transient timeout, second attempt succeeds
    mock_p1.translate.side_effect = [
        TranslationTimeoutError("Gateway timeout"),
        "ನಮಸ್ಕಾರ"
    ]

    with patch("app.services.translation_service._get_providers", return_value=[mock_p1]):
        with patch("time.sleep", return_value=None):
            res = translate_text("Hello", "en", "kn")

    assert mock_p1.translate.call_count == 2
    assert res["translated_text"] == "ನಮಸ್ಕಾರ"
    assert res["provider"] == "mock_flaky"


def test_provider_auth_error_fallback():
    """
    Verify that an invalid API key / authentication error (401/403)
    does not retry and immediately falls back.
    """
    mock_p1 = MagicMock(spec=BaseTranslationProvider)
    mock_p1.name = "mock_bad_key"
    mock_p1.is_configured.return_value = True
    mock_p1.supports_pair.return_value = True
    mock_p1.translate.side_effect = TranslationAuthError("Invalid API key")

    mock_p2 = MagicMock(spec=BaseTranslationProvider)
    mock_p2.name = "mock_backup"
    mock_p2.is_configured.return_value = True
    mock_p2.supports_pair.return_value = True
    mock_p2.translate.return_value = "ಹೌದು"

    with patch("app.services.translation_service._get_providers", return_value=[mock_p1, mock_p2]):
        res = translate_text("Yes", "en", "kn")

    assert mock_p1.translate.call_count == 1
    assert mock_p2.translate.call_count == 1
    assert res["translated_text"] == "ಹೌದು"
    assert res["provider"] == "mock_backup"


def test_all_providers_unavailable():
    """
    Verify that when all providers fail, a clean HTTP 503 is returned with descriptive detail.
    """
    mock_p1 = MagicMock(spec=BaseTranslationProvider)
    mock_p1.name = "p1"
    mock_p1.is_configured.return_value = True
    mock_p1.supports_pair.return_value = True
    mock_p1.translate.side_effect = TranslationNetworkError("Network unreachable")

    mock_p2 = MagicMock(spec=BaseTranslationProvider)
    mock_p2.name = "p2"
    mock_p2.is_configured.return_value = True
    mock_p2.supports_pair.return_value = True
    mock_p2.translate.side_effect = TranslationRateLimitError("Quota exhausted")

    with patch("app.services.translation_service._get_providers", return_value=[mock_p1, mock_p2]):
        with patch("time.sleep", return_value=None):
            with pytest.raises(HTTPException) as exc_info:
                translate_text("Test phrase", "en", "kn")

    assert exc_info.value.status_code == 503
    assert "temporarily unavailable" in exc_info.value.detail
