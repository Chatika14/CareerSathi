import json
import httpx
from typing import List, Dict, Any, Optional
from app.services.ai.base import AIProvider
from app.config import settings

class OpenAIProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model or settings.OPENAI_MODEL or "gpt-4o-mini"
        self.base_url = "https://api.openai.com/v1/chat/completions"

    @property
    def name(self) -> str:
        return "openai"

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    async def generate_text(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1500
    ) -> str:
        if not self.is_configured:
            raise ValueError("OpenAI API key is not configured.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(self.base_url, headers=headers, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"OpenAI API error ({resp.status_code}): {resp.text}")
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def generate_structured(
        self,
        messages: List[Dict[str, str]],
        response_schema: Dict[str, Any]
    ) -> Dict[str, Any]:
        if not self.is_configured:
            raise ValueError("OpenAI API key is not configured.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        # Force JSON response
        system_found = False
        msgs = []
        for m in messages:
            if m.get("role") == "system":
                msgs.append({"role": "system", "content": m["content"] + "\nReturn ONLY valid JSON."})
                system_found = True
            else:
                msgs.append(m)
        if not system_found:
            msgs.insert(0, {"role": "system", "content": "You are a structured career advisor. Return ONLY valid JSON."})

        payload = {
            "model": self.model,
            "messages": msgs,
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(self.base_url, headers=headers, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"OpenAI API error ({resp.status_code}): {resp.text}")
            data = resp.json()
            raw_content = data["choices"][0]["message"]["content"]
            return json.loads(raw_content)
