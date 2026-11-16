from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Academic Attendance & Leave Management System"
    API_V1_STR: str = "/api/v1"
    
    # Database URL: Supports PostgreSQL (Supabase) and falls back to SQLite for local development/testing
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./academic.db")
    
    # Supabase Settings
    SUPABASE_URL: Optional[str] = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
    SUPABASE_ANON_KEY: Optional[str] = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_JWT_SECRET: Optional[str] = os.getenv("SUPABASE_JWT_SECRET", "super-secret-supabase-jwt-key-for-local-development")
    
    # Local JWT fallback secret for dev & testing
    SECRET_KEY: str = os.getenv("SECRET_KEY", "bca-final-year-project-smart-academic-secure-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")


settings = Settings()
