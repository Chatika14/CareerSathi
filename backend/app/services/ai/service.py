import time
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.services.ai.base import AIProvider
from app.services.ai.gemini_provider import GeminiProvider
from app.services.ai.openai_provider import OpenAIProvider
from app.services.ai.mock_provider import MockOfflineProvider
from app.models.entities import AIUsageLog

class AIService:
    def __init__(self):
        self.gemini = GeminiProvider()
        self.openai = OpenAIProvider()
        self.mock = MockOfflineProvider()
        self._user_rate_limits: Dict[str, List[float]] = {}

    def get_provider(self) -> AIProvider:
        mode = settings.AI_PROVIDER.lower()
        if mode == "gemini" and self.gemini.is_configured:
            return self.gemini
        elif mode == "openai" and self.openai.is_configured:
            return self.openai
        elif mode == "auto":
            if self.gemini.is_configured:
                return self.gemini
            elif self.openai.is_configured:
                return self.openai
        return self.mock

    def check_rate_limit(self, user_id: str) -> bool:
        now = time.time()
        window = 60.0  # 1 minute
        limit = settings.AI_REQUESTS_PER_MINUTE

        if user_id not in self._user_rate_limits:
            self._user_rate_limits[user_id] = [now]
            return True

        timestamps = [t for t in self._user_rate_limits[user_id] if now - t < window]
        if len(timestamps) >= limit:
            return False

        timestamps.append(now)
        self._user_rate_limits[user_id] = timestamps
        return True

    async def log_usage(
        self,
        db: AsyncSession,
        user_id: Optional[str],
        provider: str,
        model: str,
        feature: str,
        input_tokens: int,
        output_tokens: int,
        latency_ms: int,
        status: str = "success"
    ):
        try:
            log_entry = AIUsageLog(
                user_id=user_id,
                provider=provider,
                model=model,
                feature=feature,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                latency_ms=latency_ms,
                status=status
            )
            db.add(log_entry)
            await db.commit()
        except Exception:
            # Usage logging failure should never crash user transactions
            pass

    async def chat(
        self,
        messages: List[Dict[str, str]],
        student_context: Dict[str, Any],
        user_id: str,
        db: AsyncSession
    ) -> str:
        if not self.check_rate_limit(user_id):
            raise ValueError("Rate limit exceeded. Please wait a minute before sending more messages.")

        provider = self.get_provider()
        context_prompt = (
            f"You are CareerSaathi AI, a calm, disciplined, and supportive career mentor for students.\n"
            f"Student Target Role: {student_context.get('target_role', 'Software Engineering')}\n"
            f"Academic Details: {student_context.get('degree', 'B.Tech')} ({student_context.get('branch', 'CSE')})\n"
            f"Roadmap Progress: {student_context.get('roadmap_progress', '0%')} completed.\n"
            f"Important: Give practical, actionable guidance. Never make unsupported claims about guaranteed hiring. "
            f"Keep advice concise, structured, and encouraging."
        )

        full_messages = [{"role": "system", "content": context_prompt}] + messages
        start_time = time.time()
        try:
            text = await provider.generate_text(full_messages)
            latency = int((time.time() - start_time) * 1000)
            await self.log_usage(
                db, user_id=user_id, provider=provider.name,
                model=getattr(provider, 'model', 'heuristic'),
                feature="chat", input_tokens=len(str(full_messages))//4,
                output_tokens=len(text)//4, latency_ms=latency, status="success"
            )
            return text
        except Exception as e:
            latency = int((time.time() - start_time) * 1000)
            await self.log_usage(
                db, user_id=user_id, provider=provider.name,
                model=getattr(provider, 'model', 'heuristic'),
                feature="chat", input_tokens=0, output_tokens=0,
                latency_ms=latency, status="error"
            )
            raise e

    async def generate_career_assessment(
        self,
        answers: Dict[str, Any],
        profile_context: Dict[str, Any],
        user_id: str,
        db: AsyncSession
    ) -> Dict[str, Any]:
        provider = self.get_provider()
        prompt = (
            f"Analyze the following student self-assessment answers and recommend 2-3 matching career directions.\n"
            f"Student Profile: {profile_context}\n"
            f"Answers: {answers}\n"
            f"Return JSON adhering strictly to: "
            f'{{"recommendations": [{{"career_slug": "slug", "title": "Title", "alignment_score": 85, '
            f'"reasoning": ["point1", "point2"], "skills_to_develop": ["skill1"], "confidence_label": "High Alignment"}}], '
            f'"summary": "Summary string", "limitations": ["Guidance based on self-reported answers."]}}'
        )
        messages = [{"role": "user", "content": prompt}]
        start_time = time.time()
        result = await provider.generate_structured(messages, {})
        latency = int((time.time() - start_time) * 1000)
        await self.log_usage(
            db, user_id=user_id, provider=provider.name,
            model=getattr(provider, 'model', 'heuristic'),
            feature="career_assessment", input_tokens=len(prompt)//4,
            output_tokens=len(str(result))//4, latency_ms=latency
        )
        return result

    async def generate_roadmap(
        self,
        target_role: str,
        weekly_hours: int,
        learning_style: str,
        current_skills: List[str],
        user_id: str,
        db: AsyncSession
    ) -> Dict[str, Any]:
        provider = self.get_provider()
        prompt = (
            f"Generate a customized learning roadmap for target role '{target_role}'.\n"
            f"Available hours per week: {weekly_hours}\n"
            f"Learning style: {learning_style}\n"
            f"Current Skills: {', '.join(current_skills) if current_skills else 'None reported'}\n"
            f"Return JSON with 3 phases, each having 2-3 actionable tasks with titles, descriptions, "
            f"estimated_hours, and suggested resource_url."
        )
        messages = [{"role": "user", "content": prompt}]
        start_time = time.time()
        result = await provider.generate_structured(messages, {})
        latency = int((time.time() - start_time) * 1000)
        await self.log_usage(
            db, user_id=user_id, provider=provider.name,
            model=getattr(provider, 'model', 'heuristic'),
            feature="roadmap_generation", input_tokens=len(prompt)//4,
            output_tokens=len(str(result))//4, latency_ms=latency
        )
        return result

    async def analyze_resume(
        self,
        resume_text: str,
        target_role: Optional[str],
        user_id: str,
        db: AsyncSession
    ) -> Dict[str, Any]:
        provider = self.get_provider()
        prompt = (
            f"Analyze this student resume for the role: {target_role or 'General Software Engineering'}.\n"
            f"Resume Content:\n{resume_text[:4000]}\n\n"
            f"Provide an objective review score (out of 100), score breakdown, identified sections, "
            f"strengths, missing elements, and actionable rewrite suggestions."
        )
        messages = [{"role": "user", "content": prompt}]
        start_time = time.time()
        result = await provider.generate_structured(messages, {})
        latency = int((time.time() - start_time) * 1000)
        await self.log_usage(
            db, user_id=user_id, provider=provider.name,
            model=getattr(provider, 'model', 'heuristic'),
            feature="resume_analysis", input_tokens=len(prompt)//4,
            output_tokens=len(str(result))//4, latency_ms=latency
        )
        return result

    async def evaluate_interview_answer(
        self,
        question: str,
        student_answer: str,
        target_role: str,
        interview_type: str,
        user_id: str,
        db: AsyncSession
    ) -> Dict[str, Any]:
        provider = self.get_provider()
        prompt = (
            f"Evaluate the student's interview response.\n"
            f"Target Role: {target_role}\n"
            f"Interview Type: {interview_type}\n"
            f"Question: {question}\n"
            f"Student Answer: {student_answer}\n\n"
            f"Provide: correctness_score (1-10), clarity_score (1-10), completeness_score (1-10), "
            f"bulleted strengths, bulleted improvements, and an improved sample answer."
        )
        messages = [{"role": "user", "content": prompt}]
        start_time = time.time()
        result = await provider.generate_structured(messages, {})
        latency = int((time.time() - start_time) * 1000)
        await self.log_usage(
            db, user_id=user_id, provider=provider.name,
            model=getattr(provider, 'model', 'heuristic'),
            feature="interview_evaluation", input_tokens=len(prompt)//4,
            output_tokens=len(str(result))//4, latency_ms=latency
        )
        return result

ai_service = AIService()
