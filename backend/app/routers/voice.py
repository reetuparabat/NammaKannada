"""
Voice API Router for NammaKannada.
Handles bidirectional speech-to-text transcription and text translation.
"""
from fastapi import APIRouter, File, Form, UploadFile, status
from app.schemas.voice import TranslationRequest, TranslationResponse, TranscriptionResponse
from app.services.translation_service import translate_text
from app.services.transcription_service import transcribe_audio_file
from app.config import settings

router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/translate", response_model=TranslationResponse, status_code=status.HTTP_200_OK)
def translate(payload: TranslationRequest):
    """
    Translate text between English and Kannada.
    
    Supported directions:
    - English -> Kannada (en -> kn)
    - Kannada -> English (kn -> en)
    """
    result = translate_text(
        text=payload.text,
        source_lang=payload.source_language,
        target_lang=payload.target_language,
    )
    return TranslationResponse(**result)


@router.post("/transcribe", response_model=TranscriptionResponse, status_code=status.HTTP_200_OK)
async def transcribe(
    file: UploadFile = File(...),
    language: str = Form(default="en"),
):
    """
    Transcribe uploaded audio file into text.
    
    Expected language: 'en' (English) or 'kn' (Kannada).
    Supported audio format: WAV (recommended).
    """
    result = await transcribe_audio_file(file=file, language=language)
    return TranscriptionResponse(**result)


@router.get("/status", status_code=status.HTTP_200_OK)
def voice_status():
    """
    Check voice service status and supported capabilities.
    """
    return {
        "status": "active",
        "supported_languages": [
            {"code": "en", "name": "English", "locale": "en-IN"},
            {"code": "kn", "name": "Kannada (ಕನ್ನಡ)", "locale": "kn-IN"},
        ],
        "translation_directions": [
            {"source": "en", "target": "kn", "description": "English to Kannada"},
            {"source": "kn", "target": "en", "description": "Kannada to English"},
        ],
        "translation_provider": settings.translation_provider,
        "max_audio_upload_mb": settings.max_audio_upload_mb,
    }
