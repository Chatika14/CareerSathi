# CareerSaathi AI — Technical Architecture

## 1. System Overview

```
                      +---------------------------------------+
                      |       React 19 + TypeScript SPA       |
                      |   (Vite, Tailwind CSS, TanStack Query)|
                      +-------------------+-------------------+
                                          |
                                          | HTTPS / REST (JWT Auth)
                                          v
                      +-------------------+-------------------+
                      |         FastAPI Python 3.13           |
                      |      (Uvicorn ASGI, Pydantic v2)      |
                      +---------+----------+----------+-------+
                                |          |          |
         +----------------------+          |          +----------------------+
         |                                 |                                 |
         v                                 v                                 v
+------------------+             +--------------------+            +-------------------+
|  SQLAlchemy 2.0  |             | AI Provider Engine |            |  Private Storage  |
|  Async Database  |             |  - Google Gemini   |            |  - PDF Resumes    |
|  (SQLite / PG)   |             |  - OpenAI          |            |  - Text Extractor |
+------------------+             |  - Offline Rubrics |            +-------------------+
                                 +--------------------+
```

## 2. Frontend Architecture
- **Framework:** React 19 + Vite 6 + TypeScript (Strict Mode).
- **Styling & Tokens:** Tailwind CSS with centralized design tokens (`--background`, `--surface`, `--primary`, `--success`, `--danger`).
- **State Management & Caching:** TanStack React Query for server state caching and client-side AuthContext for JWT session persistence.
- **Form Handling:** Controlled inputs with immediate validation.

## 3. Backend Architecture
- **Framework:** FastAPI with asynchronous endpoints.
- **Data Access:** SQLAlchemy 2.0 with `AsyncSession`, supporting both SQLite (local development with `aiosqlite`) and PostgreSQL / Supabase via `DATABASE_URL`.
- **Security:** Bcrypt password hashing and stateless HS256 JWT tokens with role verification (`student` vs `admin`).
- **Document Processing:** Server-side `pypdf` extraction enforcing a 5MB size limit and MIME validation.
