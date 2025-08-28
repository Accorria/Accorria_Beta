from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Accorria"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # Database (fallback for local development)
    DATABASE_URL: str = "sqlite:///./accorria.db"
    
    # Redis (optional for caching)
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://10.0.0.67:3000",
        "http://10.0.0.67:3001",
        "http://localhost:5173",
        "https://accorria.vercel.app",
        "https://accorria.com",
        "https://www.accorria.com",
        "https://quickflip-ai.vercel.app",
        "https://quickflip-ai.vercel.app",
        "https://accorria.com",
        "https://www.accorria.com",
        "*"  # Allow all origins for development and mobile testing
    ]
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    
    # Google API
    GOOGLE_API_KEY: Optional[str] = None
    
    # Platform API Keys (optional for MVP)
    FACEBOOK_ACCESS_TOKEN: Optional[str] = None
    OFFERUP_API_KEY: Optional[str] = None
    CARGURUS_API_KEY: Optional[str] = None
    
    # AI Reply Settings
    MIN_REPLY_DELAY_MINUTES: int = 1
    MAX_REPLY_DELAY_MINUTES: int = 30
    AI_REPLY_ENABLED: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Allow extra fields from environment


# Create settings instance
settings = Settings()

# Validate required settings
def validate_settings():
    """Validate that all required settings are present"""
    required_settings = [
        "SECRET_KEY"
    ]
    
    missing_settings = []
    for setting in required_settings:
        if not getattr(settings, setting):
            missing_settings.append(setting)
    
    if missing_settings:
        raise ValueError(f"Missing required settings: {', '.join(missing_settings)}")


# Validate on import
validate_settings() 