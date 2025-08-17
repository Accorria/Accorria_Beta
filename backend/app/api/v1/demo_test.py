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
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "image_analysis": {
                "make": "Honda",
                "model": "Civic", 
                "year": "2019",
                "mileage": "75000",
                "color": "Silver",
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
                "analysis_confidence": 0.92,
                "processing_time_seconds": 1.2,
                "vision_api_used": True
            },
            "market_intelligence": {
                "pricing_analysis": {
                    "price_trends": {
                        "trend": "stable",
                        "confidence": 0.8
                    }
                },
                "make_model_analysis": {
                    "demand_analysis": {
                        "demand_level": "high",
                        "market_activity": "active"
                    }
                }
            },
            "price_recommendations": {
                "price_recommendations": {
                    "quick_sale": {
                        "price": 15000,
                        "description": "Fast sale price",
                        "estimated_days_to_sell": 7
                    },
                    "market_price": {
                        "price": 18000,
                        "description": "Competitive market price",
                        "estimated_days_to_sell": 14
                    },
                    "top_dollar": {
                        "price": 21000,
                        "description": "Premium pricing",
                        "estimated_days_to_sell": 30
                    }
                }
            },
            "confidence_score": 0.92,
            "processing_time": 1.2,
            "error_message": None,
            "demo_mode": True,
            "message": "✅ Demo car analysis and pricing completed successfully"
        }
        
        return JSONResponse(content=analysis_result, status_code=200)
        
    except Exception as e:
        logger.error(f"Demo analyze error: {e}")
        raise HTTPException(status_code=500, detail=f"Demo analyze error: {str(e)}")
