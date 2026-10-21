"""
Translation Service for NammaKannada.
Provides genuine bidirectional English <-> Kannada translation with multi-provider fallback.
"""
import logging
from typing import Dict, Any
from fastapi import HTTPException, status
from app.config import settings

# Initialize SSL truststore for resilient HTTPS connectivity on Windows
try:
    import truststore
    truststore.inject_into_ssl()
except Exception:
    pass

logger = logging.getLogger("nammakannada.translation")

# Mapping of standard 2-letter codes to regional locales
LOCALE_MAP = {
    "en": "en-IN",
    "kn": "kn-IN",
}


def translate_text(text: str, source_lang: str, target_lang: str) -> Dict[str, Any]:
    """
    Translate text between English and Kannada using genuine translation providers.
    
    Args:
        text: Non-empty string to translate.
        source_lang: 'en' or 'kn'
        target_lang: 'kn' or 'en'
        
    Returns:
        dict with translated_text, source_language, target_language, provider.
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
        }

    # 1. Primary Provider: MyMemory (high quality for Indian regional languages)
    try:
        from deep_translator import MyMemoryTranslator
        src_locale = LOCALE_MAP.get(src, src)
        tgt_locale = LOCALE_MAP.get(tgt, tgt)
        
        translator = MyMemoryTranslator(source=src_locale, target=tgt_locale)
        translated = translator.translate(clean_text)
        
        if translated and isinstance(translated, str) and translated.strip():
            # Clean any MyMemory quota disclaimer if appended
            res = translated.strip()
            if "MYMEMORY WARNING:" in res:
                res = res.split("MYMEMORY WARNING:")[0].strip()
            if res:
                return {
                    "translated_text": res,
                    "source_language": src,
                    "target_language": tgt,
                    "provider": "mymemory",
                }
    except Exception as e:
        logger.warning(f"MyMemory translation encountered an issue: {e}")

    # 2. Secondary Provider: Google Translator fallback
    try:
        from deep_translator import GoogleTranslator
        translator = GoogleTranslator(source=src, target=tgt)
        translated = translator.translate(clean_text)
        if translated and isinstance(translated, str) and translated.strip():
            return {
                "translated_text": translated.strip(),
                "source_language": src,
                "target_language": tgt,
                "provider": "google",
            }
    except Exception as e:
        logger.warning(f"GoogleTranslator fallback encountered an issue: {e}")

    # 3. If all external translation services fail, return a descriptive error
    logger.error("All configured translation providers failed to translate the request.")
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="Translation service is temporarily unavailable. Please verify your internet connection and try again."
    )
