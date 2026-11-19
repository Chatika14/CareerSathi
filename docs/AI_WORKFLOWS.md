# CareerSaathi AI — AI Workflows & Provider Architecture

## 1. Provider Adapter Architecture
The backend isolates LLM calls behind the `AIProvider` abstract base class (`app.services.ai.base.AIProvider`):
- `GeminiProvider`: Connects to Google Generative Language API via direct HTTPS with structured JSON output.
- `OpenAIProvider`: Connects to OpenAI chat completions endpoint enforcing JSON schema formatting.
- `MockOfflineProvider`: Fully offline domain heuristic evaluator.

## 2. Selection Mode (`AI_PROVIDER` Setting)
Configured via `AI_PROVIDER` in `backend/.env`:
- `auto`: Uses Gemini if `GEMINI_API_KEY` is present; else uses OpenAI if `OPENAI_API_KEY` is present; otherwise falls back to `offline-heuristics`.
- `gemini`: Enforces Google Gemini (`gemini-1.5-flash`).
- `openai`: Enforces OpenAI (`gpt-4o-mini`).
- `mock`: Uses offline heuristic rubrics directly.

## 3. Strict Safety Guardrails
1. **Resume Untrusted Boundary:** Resumes are treated as untrusted text. Embedded instructions that attempt system prompt overrides are ignored.
2. **Context Minimization:** Only permitted student context (target role, branch, degree, current roadmap progress) is attached to the chat prompt; resumes and sensitive credentials are not sent over chat.
3. **Transparent Limitations:** All guidance assessment responses and interview evaluations explicitly include limitations disclaimers.
4. **Usage Audit Logging:** All model interactions record feature name, provider, latency, and status in the `ai_usage_logs` table.
