import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "development"
    APP_SECRET_KEY: str = "super-secret-careersaathi-jwt-key-change-in-prod-32chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./careersaathi.db"
    
    # AI Providers
    AI_PROVIDER: str = "auto"  # 'gemini', 'openai', 'auto', or 'mock'
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    # File limits
    MAX_RESUME_SIZE_MB: int = 5
    RESUME_STORAGE_DIR: str = "./storage/resumes"
    
    # Rate limits
    AI_REQUESTS_PER_MINUTE: int = 15

settings = Settings()
