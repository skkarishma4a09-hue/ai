"""
Voice Service: Handles server-side audio speech synthesis dispatch and localization formatting
for AgriMind Autonomous Voice Assistant.
"""

from typing import Dict, Any, Optional
import os


class VoiceService:
    def __init__(self):
        self.default_language = "en"
        self.supported_languages = ["en", "te", "hi"]

    def synthesize_speech(self, text: str, language: str = "en", speed: str = "normal") -> Dict[str, Any]:
        """
        Processes text-to-speech request. Returns structured speech payload
        and safe playback metadata.
        """
        if not text or not text.strip():
            return {"success": False, "error": "Empty text provided"}

        lang = language if language in self.supported_languages else self.default_language
        clean_text = text.replace("*", "").replace("#", "").replace("_", "").strip()

        # Safe response payload for browser Web Speech API & fallback streaming
        return {
            "success": True,
            "text": clean_text,
            "language": lang,
            "speed": speed,
            "client_tts_fallback": True,
            "message": "Speech synthesized successfully. Ready for client-side Web Speech playback."
        }


_voice_service = VoiceService()

def get_voice_service() -> VoiceService:
    return _voice_service
