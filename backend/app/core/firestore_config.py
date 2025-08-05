"""
Firestore Configuration for QuickFlip AI
Used for Cloud Run deployment when PostgreSQL is not available
"""

from google.cloud import firestore
from typing import Dict, Any, Optional
import json
import logging

logger = logging.getLogger(__name__)

class FirestoreDB:
    """Simple Firestore adapter for testing"""
    
    def __init__(self):
        try:
            self.db = firestore.Client()
            logger.info("✅ Firestore client initialized")
        except Exception as e:
            logger.warning(f"⚠️ Firestore not available: {e}")
            self.db = None
    
    async def save_car_analysis(self, car_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save car analysis to Firestore"""
        if not self.db:
            return {"status": "no_db", "data": car_data}
        
        try:
            doc_ref = self.db.collection('car_analyses').document()
            doc_ref.set(car_data)
            return {"status": "saved", "id": doc_ref.id, "data": car_data}
        except Exception as e:
            logger.error(f"Firestore save error: {e}")
            return {"status": "error", "error": str(e), "data": car_data}
    
    async def get_car_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """Get car analysis from Firestore"""
        if not self.db:
            return None
        
        try:
            doc = self.db.collection('car_analyses').document(analysis_id).get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Firestore get error: {e}")
            return None

# Global instance
firestore_db = FirestoreDB() 