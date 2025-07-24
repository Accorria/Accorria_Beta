from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "QuickFlip AI"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "postgresql://quickflip_user:QuickData@localhost:5432/quickflip_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "https://quickflip-ai.vercel.app"
    ]
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    
    # Google API
    GOOGLE_API_KEY: Optional[str] = None
    
    # Google Cloud
    GOOGLE_CLOUD_PROJECT: Optional[str] = None
    GOOGLE_CLOUD_STORAGE_BUCKET: Optional[str] = None
    
    # Twilio (SMS)
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    
    # SendGrid (Email)
    SENDGRID_API_KEY: Optional[str] = None
    SENDGRID_FROM_EMAIL: Optional[str] = None
    
    # Google Cloud Storage
    GOOGLE_CLOUD_CREDENTIALS_PATH: Optional[str] = None
    
    # Platform API Keys
    FACEBOOK_ACCESS_TOKEN: Optional[str] = None
    OFFERUP_API_KEY: Optional[str] = None
    CARGURUS_API_KEY: Optional[str] = None
    
    # Browser Automation
    PLAYWRIGHT_HEADLESS: bool = True
    PLAYWRIGHT_SLOW_MO: int = 1000  # milliseconds
    
    # Message Monitoring
    MESSAGE_POLL_INTERVAL: int = 300  # 5 minutes
    MAX_MESSAGE_AGE_HOURS: int = 24
    
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
        "SECRET_KEY",
        "DATABASE_URL",
        "REDIS_URL"
    ]
    
    missing_settings = []
    for setting in required_settings:
        if not getattr(settings, setting):
            missing_settings.append(setting)
    
    if missing_settings:
        raise ValueError(f"Missing required settings: {', '.join(missing_settings)}")


# Validate on import
validate_settings() 