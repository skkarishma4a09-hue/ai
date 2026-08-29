"""
AgriMind LLM Service Abstraction
Supports Gemini, OpenAI-compatible APIs, and local/fallback providers.
Configured via environment variables: AI_PROVIDER, AI_API_KEY / GEMINI_API_KEY, AI_MODEL.
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

class BaseLLMProvider:
    def is_available(self) -> bool:
        raise NotImplementedError

    def generate_json(self, prompt: str, system_instruction: str = "") -> Dict[str, Any]:
        raise NotImplementedError

    def generate_text(self, prompt: str, system_instruction: str = "") -> str:
        raise NotImplementedError


class GeminiLLMProvider(BaseLLMProvider):
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-3.7-flash"):
        self.api_key = api_key or os.getenv("AI_API_KEY") or os.getenv("GEMINI_API_KEY")
        self.model_name = model or os.getenv("AI_MODEL", "gemini-3.7-flash")
        self.fallback_models = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview", "gemini-flash-latest"]
        self._client = None
        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(
                    api_key=self.api_key,
                    http_options={'headers': {'User-Agent': 'aistudio-build'}}
                )
            except Exception as e:
                logger.warning(f"Failed to initialize google-genai Client: {e}")
                self._client = None

    def is_available(self) -> bool:
        return bool(self.api_key and self._client)

    def _call_with_fallback(self, contents: str, config: Optional[Dict] = None):
        last_error = None
        models_to_try = [self.model_name] + [m for m in self.fallback_models if m != self.model_name]
        for m in models_to_try:
            try:
                if config:
                    return self._client.models.generate_content(
                        model=m,
                        contents=contents,
                        config=config
                    )
                else:
                    return self._client.models.generate_content(
                        model=m,
                        contents=contents
                    )
            except Exception as err:
                last_error = err
                logger.warning(f"Model {m} encountered error: {err}. Trying fallback model...")
                continue
        raise last_error or RuntimeError("All Gemini models are unavailable.")

    def generate_json(self, prompt: str, system_instruction: str = "") -> Dict[str, Any]:
        if not self.is_available():
            raise RuntimeError("AI provider is not configured.")

        full_prompt = f"{system_instruction}\n\nTask:\n{prompt}\n\nReturn strictly valid JSON only."
        response = self._call_with_fallback(
            contents=full_prompt,
            config={'response_mime_type': 'application/json'}
        )
        text = response.text or "{}"
        try:
            return json.loads(text)
        except Exception:
            # Fallback if markdown wrapped
            cleaned = text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            return json.loads(cleaned.strip())

    def generate_text(self, prompt: str, system_instruction: str = "") -> str:
        if not self.is_available():
            raise RuntimeError("AI provider is not configured.")

        full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
        response = self._call_with_fallback(contents=full_prompt)
        return response.text or ""


class OpenAILLMProvider(BaseLLMProvider):
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o"):
        self.api_key = api_key or os.getenv("AI_API_KEY") or os.getenv("OPENAI_API_KEY")
        self.model_name = model or os.getenv("AI_MODEL", "gpt-4o")
        self._client = None
        if self.api_key:
            try:
                import requests
                self._requests = requests
            except ImportError:
                pass

    def is_available(self) -> bool:
        return bool(self.api_key)

    def generate_json(self, prompt: str, system_instruction: str = "") -> Dict[str, Any]:
        if not self.is_available():
            raise RuntimeError("AI provider is not configured.")

        import requests
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_instruction or "You are an agricultural AI expert. Respond in strict JSON format."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"}
        }
        res = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        content = res.json()["choices"][0]["message"]["content"]
        return json.loads(content)

    def generate_text(self, prompt: str, system_instruction: str = "") -> str:
        if not self.is_available():
            raise RuntimeError("AI provider is not configured.")

        import requests
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_instruction or "You are an agricultural AI expert."},
                {"role": "user", "content": prompt}
            ]
        }
        res = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]


class LLMService:
    def __init__(self):
        self.provider_name = os.getenv("AI_PROVIDER", "gemini").lower()
        self.model_name = os.getenv("AI_MODEL", "gemini-3.7-flash")
        self.api_key = os.getenv("AI_API_KEY") or os.getenv("GEMINI_API_KEY")

        if self.provider_name == "openai":
            self.provider = OpenAILLMProvider(self.api_key, self.model_name)
        else:
            self.provider = GeminiLLMProvider(self.api_key, self.model_name)

    def is_available(self) -> bool:
        return self.provider.is_available()

    def get_status(self) -> Dict[str, Any]:
        return {
            "provider": self.provider_name,
            "model": self.model_name,
            "configured": self.is_available(),
            "message": "AI provider is ready" if self.is_available() else "AI provider is not configured"
        }

    def generate_json(self, prompt: str, system_instruction: str = "") -> Dict[str, Any]:
        if not self.is_available():
            raise RuntimeError("AI provider is not configured.")
        return self.provider.generate_json(prompt, system_instruction)

    def generate_text(self, prompt: str, system_instruction: str = "") -> str:
        if not self.is_available():
            raise RuntimeError("AI provider is not configured.")
        return self.provider.generate_text(prompt, system_instruction)

# Singleton instance for application reuse
llm_service = LLMService()
