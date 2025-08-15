"""
Supabase Service for QuickFlip AI
Handles database operations using Supabase
"""

from typing import Dict, List, Optional, Any
from app.core.supabase_config import get_supabase
import logging

logger = logging.getLogger(__name__)

class SupabaseService:
    """Service class for Supabase operations"""
    
    def __init__(self):
        self.supabase = get_supabase()
    
    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user"""
        try:
            response = self.supabase.auth.sign_up({
                "email": user_data["email"],
                "password": user_data["password"]
            })
            return response.user
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    async def sign_in_user(self, email: str, password: str) -> Dict[str, Any]:
        """Sign in a user"""
        try:
            response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            return response.user
        except Exception as e:
            logger.error(f"Error signing in user: {e}")
            raise
    
    async def create_car_listing(self, listing_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new car listing"""
        try:
            response = self.supabase.table("car_listings").insert(listing_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating car listing: {e}")
            raise
    
    async def get_car_listings(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get car listings"""
        try:
            query = self.supabase.table("car_listings").select("*")
            if user_id:
                query = query.eq("user_id", user_id)
            response = query.execute()
            return response.data
        except Exception as e:
            logger.error(f"Error getting car listings: {e}")
            raise
    
    async def update_car_listing(self, listing_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update a car listing"""
        try:
            response = self.supabase.table("car_listings").update(updates).eq("id", listing_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating car listing: {e}")
            raise
    
    async def delete_car_listing(self, listing_id: str) -> bool:
        """Delete a car listing"""
        try:
            response = self.supabase.table("car_listings").delete().eq("id", listing_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting car listing: {e}")
            raise
    
    async def create_analysis(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a car analysis"""
        try:
            response = self.supabase.table("car_analyses").insert(analysis_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating analysis: {e}")
            raise
    
    async def get_analyses(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get car analyses"""
        try:
            query = self.supabase.table("car_analyses").select("*")
            if user_id:
                query = query.eq("user_id", user_id)
            response = query.execute()
            return response.data
        except Exception as e:
            logger.error(f"Error getting analyses: {e}")
            raise

# Global instance
supabase_service = SupabaseService()
