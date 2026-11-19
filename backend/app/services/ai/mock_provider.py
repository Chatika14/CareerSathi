import re
from typing import List, Dict, Any
from app.services.ai.base import AIProvider

class MockOfflineProvider(AIProvider):
    """
    Offline fallback provider for environments where external LLM keys
    (Gemini or OpenAI) have not been configured yet.
    Returns deterministic, safe rubric structures clearly labelled as offline heuristics.
    """
    @property
    def name(self) -> str:
        return "offline-heuristics"

    @property
    def is_configured(self) -> bool:
        return True

    async def generate_text(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1500
    ) -> str:
        last_message = messages[-1]["content"].lower() if messages else ""
        if "interview" in last_message:
            return (
                "Regarding your interview preparation: Focus on structuring your answers using the "
                "STAR method (Situation, Task, Action, Result). For technical questions, always state "
                "your assumptions, clarify edge cases, and discuss time and space complexity upfront."
            )
        elif "resume" in last_message:
            return (
                "To optimize your resume: quantify your achievements (e.g. 'reduced latency by 25%'), "
                "place relevant technical projects near the top, and ensure your core tech stack "
                "matches the role requirements."
            )
        elif "roadmap" in last_message or "learn" in last_message:
            return (
                "For your learning path, focus on strong fundamental concepts before diving into advanced "
                "frameworks. Practice building full-stack CRUD applications and solve data structure problems "
                "consistently 3-4 days a week."
            )
        else:
            return (
                "I am your CareerSaathi AI career development assistant. "
                "I can help you review your technical competencies, clarify roadmap milestones, "
                "provide structured interview feedback, and recommend practice topics."
            )

    async def generate_structured(
        self,
        messages: List[Dict[str, str]],
        response_schema: Dict[str, Any]
    ) -> Dict[str, Any]:
        # Inspect system and prompt context to determine which schema to satisfy
        prompt_blob = " ".join([m.get("content", "") for m in messages]).lower()

        if "resume" in prompt_blob:
            return {
                "review_score": 78.5,
                "score_breakdown": {
                    "impact_and_metrics": 72.0,
                    "technical_skills_relevance": 85.0,
                    "structure_and_clarity": 80.0,
                    "action_verbs": 77.0
                },
                "parsed_sections": {
                    "education": "Present",
                    "skills": "Identified",
                    "projects": "2 Projects Found",
                    "experience": "Internship/Academic"
                },
                "strengths": [
                    "Clear contact details and education section.",
                    "Demonstrated foundational knowledge in modern web stacks.",
                    "Project titles are concise and readable."
                ],
                "missing_elements": [
                    "Lack of quantified metrics (percentages, users, latency, throughput).",
                    "Missing live demo links or GitHub repository URLs for projects.",
                    "Summary section could be more target-role focused."
                ],
                "actionable_suggestions": [
                    {
                        "section": "Projects",
                        "issue": "Bullet points describe duties rather than measurable results.",
                        "suggestion": "Rewrite bullet points using: 'Accomplished [X] as measured by [Y] by doing [Z]'."
                    },
                    {
                        "section": "Skills",
                        "issue": "Skills are listed without proficiency grouping.",
                        "suggestion": "Categorize your skills into 'Languages', 'Frameworks', 'Databases', and 'DevOps/Tools'."
                    }
                ],
                "mode": "offline_rubric"
            }

        elif "interview" in prompt_blob:
            return {
                "correctness_score": 8,
                "clarity_score": 7,
                "completeness_score": 7,
                "strengths": [
                    "Addressed the primary question directly.",
                    "Mentioned practical edge cases."
                ],
                "improvements": [
                    "Explain the trade-offs of the chosen data structure or approach.",
                    "Be explicit regarding time and space complexity."
                ],
                "sample_better_answer": (
                    "A well-rounded response clearly defines the problem boundaries, "
                    "proposes an initial baseline solution, analyzes its complexity, "
                    "and then optimizes the critical bottleneck with concrete algorithmic examples."
                )
            }

        elif "roadmap" in prompt_blob:
            return {
                "phases": [
                    {
                        "title": "Phase 1: Core Fundamentals & Data Modeling",
                        "description": "Master foundational syntax, data structures, and relational schema design.",
                        "tasks": [
                            {
                                "title": "Relational Data Modeling & SQL Queries",
                                "description": "Design normalized schemas, master multi-table joins, indexes, and transactions.",
                                "estimated_hours": 6.0,
                                "resource_url": "https://developer.mozilla.org"
                            },
                            {
                                "title": "Core Algorithm & Complexity Analysis",
                                "description": "Practice Big-O time and space complexity analysis across arrays, hash maps, and trees.",
                                "estimated_hours": 8.0,
                                "resource_url": "https://leetcode.com"
                            }
                        ]
                    },
                    {
                        "title": "Phase 2: Production Services & APIs",
                        "description": "Build resilient RESTful APIs with structured validation, authentication, and error handling.",
                        "tasks": [
                            {
                                "title": "JWT Authentication & Role-Based Access",
                                "description": "Implement stateless token-based authentication and secure password hashing.",
                                "estimated_hours": 5.0,
                                "resource_url": "https://fastapi.tiangolo.com"
                            },
                            {
                                "title": "API Design & Structured Pydantic Validation",
                                "description": "Create clean endpoints adhering to REST conventions with request/response schemas.",
                                "estimated_hours": 6.0,
                                "resource_url": "https://docs.pydantic.dev"
                            }
                        ]
                    },
                    {
                        "title": "Phase 3: Real-World Capstone & Interview Readiness",
                        "description": "Integrate end-to-end features, write automated tests, and simulate mock interviews.",
                        "tasks": [
                            {
                                "title": "Full-Stack Portfolio Project Deployment",
                                "description": "Deploy frontend and backend with environment configuration and automated builds.",
                                "estimated_hours": 10.0,
                                "resource_url": "https://github.com"
                            },
                            {
                                "title": "System Design & Behavioral Mock Interviews",
                                "description": "Practice communicating technical decisions and the STAR behavioral framework.",
                                "estimated_hours": 6.0,
                                "resource_url": "https://careersaathi.ai"
                            }
                        ]
                    }
                ]
            }

        elif "assessment" in prompt_blob or "career" in prompt_blob:
            return {
                "recommendations": [
                    {
                        "career_slug": "full-stack-developer",
                        "title": "Full-Stack Developer",
                        "alignment_score": 88,
                        "reasoning": [
                            "Student demonstrated interest in both UI craftsmanship and backend API architecture.",
                            "Has existing familiarity with JavaScript/TypeScript and database concepts."
                        ],
                        "skills_to_develop": ["System Design", "Cloud Infrastructure", "Advanced Caching"],
                        "confidence_label": "High Alignment"
                    },
                    {
                        "career_slug": "backend-developer",
                        "title": "Backend Developer",
                        "alignment_score": 82,
                        "reasoning": [
                            "Strong interest in business logic, concurrency, and data persistence pipelines."
                        ],
                        "skills_to_develop": ["Microservices", "Message Queues", "Profiling"],
                        "confidence_label": "Solid Fit"
                    }
                ],
                "summary": "Your profile demonstrates a balanced inclination towards end-to-end product engineering.",
                "limitations": [
                    "Guidance is derived from self-reported answers and offline domain heuristics.",
                    "Not a guarantee of placement or specific employer eligibility."
                ]
            }

        return {}
