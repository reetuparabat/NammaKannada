"""
Translation Service for NammaKannada.
Provides resilient, production-grade bidirectional English <-> Kannada translation
with a clean provider abstraction, error classification, controlled retries, and fallback.
"""
import html
import logging
import ssl
import time
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

import httpx
from fastapi import HTTPException, status

from app.config import settings

logger = logging.getLogger("nammakannada.translation")

# Regional locale mappings if required by providers
LOCALE_MAP = {
    "en": "en-IN",
    "kn": "kn-IN",
}

# ---------------------------------------------------------------------------
# SSL Helper for resilient cross-platform HTTPS (Windows & Linux)
# ---------------------------------------------------------------------------
def _get_ssl_context():
    """
    Produce an SSL context that works reliably on both Windows and Linux containers.
    Tries truststore first (for Windows native cert store and system store), then falls back to default.
    """
    try:
        import truststore
        return truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    except Exception:
        pass
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return True


# ---------------------------------------------------------------------------
# Translation Exception Hierarchy
# ---------------------------------------------------------------------------
class TranslationError(Exception):
    """Base exception for translation failures."""
    pass


class TranslationRateLimitError(TranslationError):
    """Provider rate limit or quota exceeded (HTTP 429). Should NOT be retried on same provider."""
    pass


class TranslationAuthError(TranslationError):
    """Provider authentication failed (HTTP 401/403). Should NOT be retried."""
    pass


class TranslationTimeoutError(TranslationError):
    """Provider request timed out. May be retried once if transient."""
    pass


class TranslationNetworkError(TranslationError):
    """Network connection failure. May be retried once if transient."""
    pass


class TranslationUnsupportedError(TranslationError):
    """Language pair is unsupported by this provider."""
    pass


# ---------------------------------------------------------------------------
# Abstract Provider Interface
# ---------------------------------------------------------------------------
class BaseTranslationProvider(ABC):
    """Abstract base class for genuine translation providers."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Unique provider identifier."""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Return True if required keys or endpoints are configured."""
        pass

    @abstractmethod
    def supports_pair(self, source: str, target: str) -> bool:
        """Return True if this provider supports the requested language pair."""
        pass

    @abstractmethod
    def translate(self, text: str, source: str, target: str, timeout: float) -> str:
        """
        Execute genuine text translation.
        Raises TranslationError subclasses on failure.
        """
        pass


# ---------------------------------------------------------------------------
# Provider 1: Official Google Cloud Translation API (REST v2)
# ---------------------------------------------------------------------------
class GoogleCloudOfficialProvider(BaseTranslationProvider):
    """
    Official Google Cloud Translation v2 REST API.
    Used when GOOGLE_TRANSLATE_API_KEY is configured in environment variables.
    """

    @property
    def name(self) -> str:
        return "google_cloud"

    def is_configured(self) -> bool:
        return bool(settings.google_translate_api_key)

    def supports_pair(self, source: str, target: str) -> bool:
        valid = {"en", "kn"}
        return source in valid and target in valid

    def translate(self, text: str, source: str, target: str, timeout: float) -> str:
        url = "https://translation.googleapis.com/language/translate/v2"
        params = {"key": settings.google_translate_api_key}
        payload = {
            "q": text,
            "source": source,
            "target": target,
            "format": "text",
        }
        ssl_ctx = _get_ssl_context()
        try:
            with httpx.Client(verify=ssl_ctx, timeout=timeout) as client:
                resp = client.post(url, params=params, json=payload)
                if resp.status_code == 429:
                    raise TranslationRateLimitError("Google Cloud Translation quota exceeded.")
                if resp.status_code in (401, 403):
                    raise TranslationAuthError("Google Cloud Translation API key invalid or unauthorized.")
                resp.raise_for_status()

                data = resp.json()
                translations = data.get("data", {}).get("translations", [])
                if not translations:
                    raise TranslationError("No translation returned in Google Cloud response.")

                translated_text = translations[0].get("translatedText", "")
                return html.unescape(translated_text.strip())

        except (httpx.TimeoutException, httpx.ConnectTimeout) as e:
            raise TranslationTimeoutError(f"Google Cloud Translation timed out: {e}")
        except httpx.NetworkError as e:
            raise TranslationNetworkError(f"Google Cloud Translation network error: {e}")
        except httpx.HTTPStatusError as e:
            raise TranslationError(f"Google Cloud HTTP error {e.response.status_code}")


# ---------------------------------------------------------------------------
# Provider 2: Official Microsoft Azure Translator API
# ---------------------------------------------------------------------------
class AzureTranslatorProvider(BaseTranslationProvider):
    """
    Official Microsoft Azure Cognitive Services Translator API.
    Used when AZURE_TRANSLATOR_KEY is configured in environment variables.
    """

    @property
    def name(self) -> str:
        return "azure"

    def is_configured(self) -> bool:
        return bool(settings.azure_translator_key)

    def supports_pair(self, source: str, target: str) -> bool:
        valid = {"en", "kn"}
        return source in valid and target in valid

    def translate(self, text: str, source: str, target: str, timeout: float) -> str:
        endpoint = "https://api.cognitive.microsofttranslator.com/translate"
        params = {
            "api-version": "3.0",
            "from": source,
            "to": target,
        }
        headers = {
            "Ocp-Apim-Subscription-Key": settings.azure_translator_key,
            "Ocp-Apim-Subscription-Region": settings.azure_translator_region or "global",
            "Content-Type": "application/json",
        }
        payload = [{"text": text}]
        ssl_ctx = _get_ssl_context()

        try:
            with httpx.Client(verify=ssl_ctx, timeout=timeout) as client:
                resp = client.post(endpoint, params=params, headers=headers, json=payload)
                if resp.status_code == 429:
                    raise TranslationRateLimitError("Azure Translator rate limit exceeded.")
                if resp.status_code in (401, 403):
                    raise TranslationAuthError("Azure Translator credentials invalid.")
                resp.raise_for_status()

                data = resp.json()
                if not data or not isinstance(data, list):
                    raise TranslationError("Invalid response format from Azure Translator.")

                translations = data[0].get("translations", [])
                if not translations:
                    raise TranslationError("No translation returned by Azure Translator.")

                return html.unescape(translations[0].get("text", "").strip())

        except (httpx.TimeoutException, httpx.ConnectTimeout) as e:
            raise TranslationTimeoutError(f"Azure Translator timed out: {e}")
        except httpx.NetworkError as e:
            raise TranslationNetworkError(f"Azure Translator network error: {e}")
        except httpx.HTTPStatusError as e:
            raise TranslationError(f"Azure Translator HTTP error {e.response.status_code}")


# ---------------------------------------------------------------------------
# Provider 3: Google Client API (Direct JSON endpoint, no HTML scraping)
# ---------------------------------------------------------------------------
class GoogleClientApiProvider(BaseTranslationProvider):
    """
    Direct Google Client API endpoint (translate_a/single).
    Produces direct structured JSON responses. Does not scrape HTML.
    Supports bidirectional English <-> Kannada.
    """

    @property
    def name(self) -> str:
        return "google_client"

    def is_configured(self) -> bool:
        return True

    def supports_pair(self, source: str, target: str) -> bool:
        valid = {"en", "kn"}
        return source in valid and target in valid

    def translate(self, text: str, source: str, target: str, timeout: float) -> str:
        url = "https://translate.googleapis.com/translate_a/single"
        params = {
            "client": "gtx",
            "sl": source,
            "tl": target,
            "dt": "t",
            "q": text,
        }
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
        }
        ssl_ctx = _get_ssl_context()

        try:
            with httpx.Client(verify=ssl_ctx, timeout=timeout, follow_redirects=True) as client:
                resp = client.get(url, params=params, headers=headers)
                if resp.status_code == 429:
                    raise TranslationRateLimitError("Google Client API rate limited (429).")
                if resp.status_code in (401, 403):
                    raise TranslationAuthError(f"Google Client API forbidden ({resp.status_code}).")
                resp.raise_for_status()

                data = resp.json()
                if not data or not isinstance(data, list) or not data[0]:
                    raise TranslationError("Empty or malformed JSON array in Google Client API response.")

                # Sentences are broken into multiple chunks in data[0]
                chunks = []
                for sentence in data[0]:
                    if sentence and isinstance(sentence, list) and sentence[0]:
                        chunks.append(sentence[0])

                if not chunks:
                    raise TranslationError("No translated chunks returned by Google Client API.")

                translated_text = "".join(chunks).strip()
                return html.unescape(translated_text)

        except (httpx.TimeoutException, httpx.ConnectTimeout) as e:
            raise TranslationTimeoutError(f"Google Client API timed out: {e}")
        except httpx.NetworkError as e:
            raise TranslationNetworkError(f"Google Client API network error: {e}")
        except httpx.HTTPStatusError as e:
            raise TranslationError(f"Google Client API HTTP error {e.response.status_code}")


# ---------------------------------------------------------------------------
# Provider 4: MyMemory API (Direct REST with Email Quota Support)
# ---------------------------------------------------------------------------
class MyMemoryApiProvider(BaseTranslationProvider):
    """
    Direct REST API provider for MyMemory (api.mymemory.translated.net).
    Supports email parameter (de) to unlock 10,000 words/day dedicated quota,
    preventing shared cloud IP exhaustion on Render.
    """

    @property
    def name(self) -> str:
        return "mymemory"

    def is_configured(self) -> bool:
        return True

    def supports_pair(self, source: str, target: str) -> bool:
        valid = {"en", "kn"}
        return source in valid and target in valid

    def translate(self, text: str, source: str, target: str, timeout: float) -> str:
        url = "https://api.mymemory.translated.net/get"
        langpair = f"{source}|{target}"
        params: Dict[str, Any] = {
            "q": text,
            "langpair": langpair,
        }

        # Passing a configured email raises daily free limit from 1k to 10k words
        # and attributes the quota to the email rather than the shared Render IP.
        if settings.mymemory_email:
            params["de"] = settings.mymemory_email.strip()
        if settings.mymemory_api_key:
            params["key"] = settings.mymemory_api_key.strip()

        headers = {
            "User-Agent": "NammaKannada/1.0 (Language Learning Platform; contact: reetuparabat662@gmail.com)",
            "Accept": "application/json",
        }
        ssl_ctx = _get_ssl_context()

        try:
            with httpx.Client(verify=ssl_ctx, timeout=timeout, follow_redirects=True) as client:
                resp = client.get(url, params=params, headers=headers)
                if resp.status_code == 429:
                    raise TranslationRateLimitError("MyMemory daily quota exceeded (HTTP 429).")
                resp.raise_for_status()

                data = resp.json()
                if not data:
                    raise TranslationError("Empty JSON returned from MyMemory.")

                # Check MyMemory internal status codes
                res_status = data.get("responseStatus")
                if res_status in (429, 403) or data.get("quotaFinished"):
                    raise TranslationRateLimitError("MyMemory quota finished for today.")

                translated = data.get("responseData", {}).get("translatedText")
                if not translated:
                    # Try matches fallback
                    matches = data.get("matches", [])
                    if matches and isinstance(matches, list) and matches[0].get("translation"):
                        translated = matches[0]["translation"]

                if not translated or not isinstance(translated, str):
                    raise TranslationError("No translation found in MyMemory response.")

                res = translated.strip()
                if "MYMEMORY WARNING:" in res:
                    # Quota message appended
                    res = res.split("MYMEMORY WARNING:")[0].strip()
                    if not res:
                        raise TranslationRateLimitError("MyMemory quota limit warning returned.")

                return html.unescape(res)

        except (httpx.TimeoutException, httpx.ConnectTimeout) as e:
            raise TranslationTimeoutError(f"MyMemory request timed out: {e}")
        except httpx.NetworkError as e:
            raise TranslationNetworkError(f"MyMemory network error: {e}")
        except httpx.HTTPStatusError as e:
            raise TranslationError(f"MyMemory HTTP error {e.response.status_code}")


# ---------------------------------------------------------------------------
# Provider 5: LibreTranslate (Self-hosted or hosted instance)
# ---------------------------------------------------------------------------
class LibreTranslateProvider(BaseTranslationProvider):
    """
    LibreTranslate open-source API provider.
    Used when LIBRETRANSLATE_URL is configured.
    """

    @property
    def name(self) -> str:
        return "libretranslate"

    def is_configured(self) -> bool:
        return bool(settings.libretranslate_url)

    def supports_pair(self, source: str, target: str) -> bool:
        valid = {"en", "kn"}
        return source in valid and target in valid

    def translate(self, text: str, source: str, target: str, timeout: float) -> str:
        base_url = settings.libretranslate_url.rstrip("/")
        url = f"{base_url}/translate"
        payload: Dict[str, Any] = {
            "q": text,
            "source": source,
            "target": target,
            "format": "text",
        }
        if settings.libretranslate_api_key:
            payload["api_key"] = settings.libretranslate_api_key

        ssl_ctx = _get_ssl_context()
        try:
            with httpx.Client(verify=ssl_ctx, timeout=timeout) as client:
                resp = client.post(url, json=payload)
                if resp.status_code == 429:
                    raise TranslationRateLimitError("LibreTranslate rate limit exceeded.")
                if resp.status_code in (401, 403):
                    raise TranslationAuthError("LibreTranslate unauthorized.")
                resp.raise_for_status()

                data = resp.json()
                translated = data.get("translatedText", "")
                if not translated:
                    raise TranslationError("No translatedText in LibreTranslate response.")
                return html.unescape(translated.strip())

        except (httpx.TimeoutException, httpx.ConnectTimeout) as e:
            raise TranslationTimeoutError(f"LibreTranslate timed out: {e}")
        except httpx.NetworkError as e:
            raise TranslationNetworkError(f"LibreTranslate network error: {e}")
        except httpx.HTTPStatusError as e:
            raise TranslationError(f"LibreTranslate HTTP error {e.response.status_code}")


# ---------------------------------------------------------------------------
# Provider Registry & Prioritized Dispatcher
# ---------------------------------------------------------------------------
def _get_providers() -> List[BaseTranslationProvider]:
    """
    Return the prioritized list of translation providers based on environment configuration.
    Official paid/authenticated APIs take precedence when configured.
    """
    providers: List[BaseTranslationProvider] = []

    # 1. Official Google Cloud API if key is present
    google_cloud = GoogleCloudOfficialProvider()
    if google_cloud.is_configured():
        providers.append(google_cloud)

    # 2. Official Azure Translator if key is present
    azure = AzureTranslatorProvider()
    if azure.is_configured():
        providers.append(azure)

    # 3. Google Client JSON API (fast, robust, bidirectional, no scraping)
    providers.append(GoogleClientApiProvider())

    # 4. MyMemory API (with email quota elevation)
    providers.append(MyMemoryApiProvider())

    # 5. LibreTranslate if configured
    libre = LibreTranslateProvider()
    if libre.is_configured():
        providers.append(libre)

    return providers


# ---------------------------------------------------------------------------
# Primary Translation Service Entry Point
# ---------------------------------------------------------------------------
def translate_text(text: str, source_lang: str, target_lang: str) -> Dict[str, Any]:
    """
    Translate text between English and Kannada using genuine, production-grade translation providers.
    
    Implements:
    - Input validation.
    - Error classification (RateLimit, Auth, Network, Timeout).
    - Controlled retries for transient failures only.
    - Automated fallback between providers.
    - Safe logging (no API keys, no private user text logged).
    
    Args:
        text: Non-empty string to translate.
        source_lang: 'en' or 'kn'
        target_lang: 'kn' or 'en'
        
    Returns:
        dict with: translated_text, source_language, target_language, provider, transliteration.
    """
    clean_text = text.strip()
    if not clean_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot translate empty or whitespace text."
        )

    src = source_lang.strip().lower()
    tgt = target_lang.strip().lower()

    if src not in ("en", "kn") or tgt not in ("en", "kn"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported language pair: '{source_lang}' to '{target_lang}'. Only 'en' <-> 'kn' are supported."
        )

    if src == tgt:
        return {
            "translated_text": clean_text,
            "source_language": src,
            "target_language": tgt,
            "provider": "identity",
            "transliteration": None,
        }

    timeout = float(getattr(settings, "translation_timeout_seconds", 8.0))
    providers = _get_providers()
    failures_log: List[str] = []

    for provider in providers:
        if not provider.is_configured() or not provider.supports_pair(src, tgt):
            continue

        # Up to 2 attempts for transient failures only (1 initial + 1 retry)
        max_attempts = 2
        for attempt in range(1, max_attempts + 1):
            start_time = time.time()
            try:
                translated = provider.translate(clean_text, src, tgt, timeout)
                duration_ms = round((time.time() - start_time) * 1000, 2)

                if translated and translated.strip():
                    logger.info(
                        f"Translation succeeded with provider='{provider.name}', "
                        f"pair='{src}->{tgt}', duration={duration_ms}ms"
                    )
                    return {
                        "translated_text": translated.strip(),
                        "source_language": src,
                        "target_language": tgt,
                        "provider": provider.name,
                        "transliteration": None,
                    }

            except (TranslationRateLimitError, TranslationAuthError) as non_retryable:
                duration_ms = round((time.time() - start_time) * 1000, 2)
                err_type = type(non_retryable).__name__
                logger.warning(
                    f"Provider '{provider.name}' failed ({err_type}) in {duration_ms}ms: {non_retryable}. "
                    "Non-retryable; falling back immediately."
                )
                failures_log.append(f"{provider.name}: {err_type}")
                break  # Do not retry rate-limiting or auth errors; move to next provider

            except (TranslationTimeoutError, TranslationNetworkError) as transient_err:
                duration_ms = round((time.time() - start_time) * 1000, 2)
                err_type = type(transient_err).__name__
                logger.warning(
                    f"Provider '{provider.name}' transient error attempt {attempt}/{max_attempts} "
                    f"in {duration_ms}ms: {transient_err}"
                )
                if attempt < max_attempts:
                    time.sleep(0.5)
                    continue
                else:
                    failures_log.append(f"{provider.name}: {err_type}")
                    break

            except Exception as e:
                duration_ms = round((time.time() - start_time) * 1000, 2)
                logger.warning(
                    f"Provider '{provider.name}' unexpected error in {duration_ms}ms: {type(e).__name__}"
                )
                failures_log.append(f"{provider.name}: {type(e).__name__}")
                break

    # All configured genuine providers were exhausted
    logger.error(
        f"All translation providers exhausted for '{src}->{tgt}'. Failures: {', '.join(failures_log)}"
    )
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Translation service is temporarily unavailable. All configured providers were unreachable or rate-limited. Please try again shortly."
    )
