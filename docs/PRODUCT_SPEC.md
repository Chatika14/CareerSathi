# CareerSaathi AI — Product Specification

## 1. Product Overview
**CareerSaathi AI** is a personalized career-development and placement-preparation platform engineered specifically for college students and early-career job seekers.
- **Tagline:** Your Skills. Your Career. Your Future.
- **Principle:** Build a genuinely working, minimalist career-development web application without fake dashboards or fabricated statistics.

## 2. Core Product Loop
$$\text{Assess} \longrightarrow \text{Recommend} \longrightarrow \text{Learn} \longrightarrow \text{Practice} \longrightarrow \text{Evaluate} \longrightarrow \text{Improve} \longrightarrow \text{Apply}$$

## 3. Primary Users & Personas
- **Pre-final Year Students:** Need clarity on industry roles, core technical competency benchmarks, and structured milestone roadmaps.
- **Final Year / Placement Candidates:** Need rapid resume reviews, high-frequency aptitude practice, text-based mock interview drills, and verified job tracking.
- **Platform Administrators:** Manage curated career competency frameworks, verified company listings, and practice problem sets.

## 4. MVP Boundaries & Honest Engineering
1. **No Fabricated Placement Guarantees:** CareerSaathi never claims 100% placement guarantees or simulates arbitrary "ATS scores". All scores are clearly designated as **CareerSaathi Review Scores** or **Preparation Indicators** based on measurable actions.
2. **Deterministic Offline Fallback:** When live external LLM API keys (Gemini / OpenAI) are not provided, the system does not crash or emit pseudo-random text. It executes structured offline evaluation rubrics clearly labeled as offline heuristics.
3. **Data Isolation:** Complete server-side authorization ensures students only access and manage their own resumes, chat messages, notes, and applications.
