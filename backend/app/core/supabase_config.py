"""
Supabase Configuration for Plazoria
Simplified database and auth setup using Supabase
"""

from supabase import create_client, Client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase: Client = None

def init_supabase():
    """Initialize Supabase client"""
    global supabase
    try:
        supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY
        )
        logger.info("Supabase client initialized successfully")
        return supabase
    except Exception as e:
        logger.error(f"Failed to initialize Supabase: {e}")
        raise

def get_supabase() -> Client:
    """Get Supabase client instance"""
    global supabase
    if supabase is None:
        supabase = init_supabase()
    return supabase

# Initialize on import
try:
    init_supabase()
except Exception as e:
    logger.warning(f"Supabase initialization failed: {e}")
    # Continue without Supabase for local development
