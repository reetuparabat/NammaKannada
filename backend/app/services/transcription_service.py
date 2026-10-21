"""
Speech Transcription Service for NammaKannada.
Handles audio file uploads, validation, and speech-to-text conversion.
"""
import io
import logging
from typing import Dict, Any
from fastapi import HTTPException, status, UploadFile
from app.config import settings

logger = logging.getLogger("nammakannada.transcription")

LOCALE_MAP = {
    "en": "en-IN",
    "kn": "kn-IN",
}

# Maximum audio payload size in bytes
MAX_BYTES = settings.max_audio_upload_mb * 1024 * 1024


async def transcribe_audio_file(file: UploadFile, language: str) -> Dict[str, Any]:
    """
    Transcribe uploaded audio file into text.
    
    Args:
        file: UploadFile containing audio stream (WAV preferred).
        language: 'en' or 'kn'
        
    Returns:
        dict with recognized_text, language, status, and confidence.
    """
    lang = language.strip().lower()
    if lang not in ("en", "kn"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported language: '{language}'. Must be 'en' or 'kn'."
        )

    # Read audio bytes
    audio_bytes = await file.read()
    if not audio_bytes or len(audio_bytes) < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded audio file is empty or corrupted."
        )

    if len(audio_bytes) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Audio file exceeds maximum size limit of {settings.max_audio_upload_mb}MB."
        )

    # Use speech_recognition
    try:
        import speech_recognition as sr
        recognizer = sr.Recognizer()
        
        # AudioFile accepts WAV, AIFF, or FLAC natively
        audio_stream = io.BytesIO(audio_bytes)
        try:
            with sr.AudioFile(audio_stream) as source:
                audio_data = recognizer.record(source)
        except Exception as fmt_err:
            logger.warning(f"Audio file format parsing error: {fmt_err}")
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Unsupported audio format for backend processing. Please provide audio in WAV format, or use in-browser Web Speech recognition."
            )

        locale = LOCALE_MAP.get(lang, "en-IN")
        
        try:
            transcript = recognizer.recognize_google(audio_data, language=locale)
            if not transcript or not transcript.strip():
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="No speech could be recognized in the provided audio."
                )

            return {
                "recognized_text": transcript.strip(),
                "language": lang,
                "status": "success",
                "confidence": 0.95,
            }
        except sr.UnknownValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No clear speech could be recognized. Please speak clearly into the microphone."
            )
        except sr.RequestError as req_err:
            logger.error(f"Speech recognition service request error: {req_err}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Speech recognition service is temporarily unreachable. Please try again or type your text."
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected transcription error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing the audio."
        )
