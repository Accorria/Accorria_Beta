"""
Demo Test Endpoint - Bypasses Firebase for immediate mobile testing
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/demo-test")
async def demo_test():
    """
    Demo endpoint that works without Firebase/Firestore
    
    Returns successful response for mobile testing
    """
    try:
        # Mock successful car analysis
        demo_data = {
            "agent": "VisualAgent",
            "status": "success",
            "confidence": 0.95,
            "data": {
                "features_detected": {
                    "car_features": {
                        "exterior": ["clean_exterior", "well_maintained", "backup_camera"],
                        "interior": ["cloth_seats", "basic_radio"],
                        "technology": ["backup_camera", "bluetooth"],
                        "safety": ["airbags", "abs"],
                        "modifications": []
                    },
                    "condition_assessment": {
                        "score": 0.75,
                        "overall_condition": "good"
                    }
                },
                "image_analyzed": "/demo/car.jpg",
                "analysis_confidence": 0.95,
                "processing_time_seconds": 0.5,
                "vision_api_used": True
            },
            "test_mode": True,
            "demo_mode": True,
            "timestamp": datetime.now().isoformat(),
            "message": "✅ Demo car analysis completed successfully (no Firebase required)"
        }
        
        return JSONResponse(content=demo_data, status_code=200)
        
    except Exception as e:
        logger.error(f"Demo test error: {e}")
        raise HTTPException(status_code=500, detail=f"Demo error: {str(e)}")


@router.post("/demo-analyze")
async def demo_analyze():
    """
    Demo car analysis endpoint for mobile testing
    
    Accepts any input and returns successful analysis
    """
    try:
        # Mock successful analysis
        analysis_result = {
            "agent": "VisualAgent",
            "status": "success",
            "confidence": 0.92,
            "data": {
                "features_detected": {
                    "car_features": {
                        "exterior": ["clean_exterior", "well_maintained", "alloy_wheels"],
                        "interior": ["leather_seats", "navigation", "heated_seats"],
                        "technology": ["backup_camera", "bluetooth", "apple_carplay"],
                        "safety": ["airbags", "abs", "blind_spot_monitoring"],
                        "modifications": []
                    },
                    "condition_assessment": {
                        "score": 0.85,
                        "overall_condition": "excellent"
                    }
                },
                "pricing_recommendations": {
                    "quick_sale": 18500,
                    "market_price": 21000,
                    "top_dollar": 23500
                },
                "flip_score": 78,
                "image_analyzed": "/demo/car_photos.jpg",
                "analysis_confidence": 0.92,
                "processing_time_seconds": 1.2,
                "vision_api_used": True
            },
            "demo_mode": True,
            "timestamp": datetime.now().isoformat(),
            "message": "✅ Demo car analysis and pricing completed successfully"
        }
        
        return JSONResponse(content=analysis_result, status_code=200)
        
    except Exception as e:
        logger.error(f"Demo analyze error: {e}")
        raise HTTPException(status_code=500, detail=f"Demo analyze error: {str(e)}")
