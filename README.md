# CareerSaathi AI

> **Your Skills. Your Career. Your Future.**
> A genuine, minimalist career-development and campus placement-preparation web application for college students and early-career job seekers.

---

## 1. Product Overview

CareerSaathi AI unifies assessment, learning roadmaps, skills gap analysis, resume reviews, mock interviews, and application tracking into a coherent student journey:

$$\text{Assess} \longrightarrow \text{Recommend} \longrightarrow \text{Learn} \longrightarrow \text{Practice} \longrightarrow \text{Evaluate} \longrightarrow \text{Improve} \longrightarrow \text{Apply}$$

### Non-Negotiable Product Principles
- **No Fabricated Placement Guarantees:** CareerSaathi never claims 100% placement guarantees or simulates arbitrary "ATS scores". All scores are designated as **CareerSaathi Review Scores** or **Preparation Indicators** based on measurable actions.
- **Genuine Persistence:** All roadmap tasks, notes, assessment answers, skills, resumes, interview feedback, and job applications are securely persisted in a relational database.
- **Safe Offline Fallback:** If live external LLM API keys (Gemini / OpenAI) are not configured, the application executes structured offline evaluation rubrics clearly labeled as offline heuristics.

---

## 2. Tech Stack

- **Frontend:** React 19, TypeScript (Strict Mode), Vite, Tailwind CSS, Lucide Icons, TanStack Query, React Router v6.
- **Backend:** Python 3.13, FastAPI, Pydantic v2, SQLAlchemy 2.0 (Async), Uvicorn ASGI, PyJWT, Bcrypt, PyPDF.
- **Database:** SQLite (default local zero-setup driver with `aiosqlite`) or PostgreSQL / Supabase via `DATABASE_URL`.
- **AI Engine:** Google Gemini, OpenAI, or intelligent offline domain rubrics.

---

## 3. Quick Start & Local Setup

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+) with pip

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv .venv

# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS / Linux:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Initialize and seed database with curated careers, practice questions & demo accounts
python -m app.seed

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend API will be running at: `http://localhost:8000`  
API Swagger Docs available at: `http://localhost:8000/docs`

### 2. Frontend Setup
In a new terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend application will be running at: `http://localhost:5173`

---

## 4. Pre-Seeded Evaluation Accounts

The database seed automatically creates two accounts for instant testing:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Demo Student** | `student@careersaathi.ai` | `StudentPass123!` | Complete student dashboard, roadmap, skills, resume analysis, mock interview drills, job tracking. |
| **Demo Admin** | `admin@careersaathi.ai` | `AdminPass123!` | Admin metrics console, user directory, job listing manager, question bank creator. |

*You can also click the 1-click fill buttons on the `/login` screen.*

---

## 5. Running Automated Tests & Production Builds

### Run Backend Tests (Unit + End-to-End Journey)
```bash
cd backend
.\.venv\Scripts\pytest
```
*Executes all API health checks, role authorizations, and the complete 14-step critical student journey.*

### Run Frontend Production Build & Type-Check
```bash
cd frontend
npm run build
```

---

## 6. Environment Variables (`.env.example`)

```dotenv
# Frontend
VITE_API_BASE_URL=http://localhost:8000

# Backend
APP_ENV=development
APP_SECRET_KEY=change-this-in-production-to-a-secure-random-32-char-string
FRONTEND_ORIGIN=http://localhost:5173

# Database (Default uses local SQLite with async driver; can switch to PostgreSQL / Supabase)
DATABASE_URL=sqlite+aiosqlite:///./careersaathi.db

# AI Provider ("auto", "gemini", "openai", or "mock")
AI_PROVIDER=auto
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# Limits & Storage
MAX_RESUME_SIZE_MB=5
RESUME_STORAGE_DIR=./storage/resumes
AI_REQUESTS_PER_MINUTE=15
```

---

## 7. Documentation Index
- [Product Specification](docs/PRODUCT_SPEC.md)
- [Technical Architecture](docs/ARCHITECTURE.md)
- [Database Schema & Dictionary](docs/DATABASE.md)
- [API Endpoints Reference](docs/API.md)
- [AI Workflows & Safety Guardrails](docs/AI_WORKFLOWS.md)
