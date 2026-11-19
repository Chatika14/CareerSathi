from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, AsyncSessionLocal
from app.seed import seed_database
from app.api.v1 import (
    auth, careers, assessments, roadmaps, skills,
    resumes, chat, interviews, practice, jobs,
    applications, dashboard, notifications, admin
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables and initial seed data exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await seed_database(session)
    yield

app = FastAPI(
    title="CareerSaathi AI API",
    description="Backend services for CareerSaathi AI career development and placement preparation.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.APP_ENV,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0"
    }

# API v1 Routers
api_v1_prefix = "/api/v1"
app.include_router(auth.router, prefix=f"{api_v1_prefix}/auth", tags=["Authentication"])
app.include_router(auth.router, prefix=f"{api_v1_prefix}", tags=["Profile"])  # for /me
app.include_router(careers.router, prefix=f"{api_v1_prefix}/careers", tags=["Careers"])
app.include_router(assessments.router, prefix=f"{api_v1_prefix}/assessments", tags=["Assessments"])
app.include_router(roadmaps.router, prefix=f"{api_v1_prefix}/roadmaps", tags=["Roadmaps"])
app.include_router(skills.router, prefix=f"{api_v1_prefix}/skills", tags=["Skills"])
app.include_router(resumes.router, prefix=f"{api_v1_prefix}/resumes", tags=["Resumes"])
app.include_router(chat.router, prefix=f"{api_v1_prefix}/chat", tags=["Chat"])
app.include_router(interviews.router, prefix=f"{api_v1_prefix}/interviews", tags=["Interviews"])
app.include_router(practice.router, prefix=f"{api_v1_prefix}/practice", tags=["Practice"])
app.include_router(jobs.router, prefix=f"{api_v1_prefix}/jobs", tags=["Jobs"])
app.include_router(applications.router, prefix=f"{api_v1_prefix}/applications", tags=["Applications"])
app.include_router(dashboard.router, prefix=f"{api_v1_prefix}/dashboard", tags=["Dashboard"])
app.include_router(notifications.router, prefix=f"{api_v1_prefix}/notifications", tags=["Notifications"])
app.include_router(admin.router, prefix=f"{api_v1_prefix}/admin", tags=["Admin"])
