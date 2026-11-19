import json
import httpx
from typing import List, Dict, Any, Optional
from app.services.ai.base import AIProvider
from app.config import settings

class GeminiProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL or "gemini-1.5-flash"
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    @property
    def name(self) -> str:
        return "gemini"

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    def _convert_messages(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        system_instruction = None
        contents = []

        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                system_instruction = {"parts": [{"text": content}]}
            elif role == "assistant":
                contents.append({"role": "model", "parts": [{"text": content}]})
            else:
                contents.append({"role": "user", "parts": [{"text": content}]})

        payload: Dict[str, Any] = {"contents": contents}
        if system_instruction:
            payload["system_instruction"] = system_instruction
        return payload

    async def generate_text(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1500
    ) -> str:
        if not self.is_configured:
            raise ValueError("Gemini API key is not configured.")

        url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
        payload = self._convert_messages(messages)
        payload["generationConfig"] = {
            "temperature": temperature,
            "maxOutputTokens": max_tokens
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"Gemini API error ({resp.status_code}): {resp.text}")
            data = resp.json()
            candidates = data.get("candidates", [])
            if candidates and "content" in candidates[0]:
                parts = candidates[0]["content"].get("parts", [])
                if parts:
                    return parts[0].get("text", "")
            return ""

    async def generate_structured(
        self,
        messages: List[Dict[str, str]],
        response_schema: Dict[str, Any]
    ) -> Dict[str, Any]:
        if not self.is_configured:
            raise ValueError("Gemini API key is not configured.")

        url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
        payload = self._convert_messages(messages)
        payload["generationConfig"] = {
            "temperature": 0.2,
            "responseMimeType": "application/json"
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"Gemini API error ({resp.status_code}): {resp.text}")
            data = resp.json()
            candidates = data.get("candidates", [])
            if candidates and "content" in candidates[0]:
                parts = candidates[0]["content"].get("parts", [])
                if parts:
                    raw_text = parts[0].get("text", "{}")
                    # Clean possible markdown fence
                    cleaned = raw_text.strip()
                    if cleaned.startswith("```json"):
                        cleaned = cleaned[7:]
                    if cleaned.startswith("```"):
                        cleaned = cleaned[3:]
                    if cleaned.endswith("```"):
                        cleaned = cleaned[:-3]
                    return json.loads(cleaned.strip())
            return {}
