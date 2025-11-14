"""
Vision API Test Endpoint for Plazoria
Simple endpoint for testing Google Vision API integration visually
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.vision_analyzer import analyze_car_image_bytes
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/vision/analyze-image")
async def analyze_car_image_endpoint(
    image: UploadFile = File(..., description="Car image to analyze")
):
    """
    Analyze a car image using Google Vision API
    
    This endpoint is specifically for the visual demo interface.
    It accepts an image upload and returns Vision API analysis results.
    """
    try:
        # Validate file type
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await image.read()
        
        # Validate file size (10MB limit)
        if len(image_data) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image too large (max 10MB)")
        
        logger.info(f"Analyzing image: {image.filename} ({len(image_data)} bytes)")
        
        # Analyze with Vision API
        result = await analyze_car_image_bytes(
            image_data, 
            image.filename or "uploaded_image"
        )
        
        if result['success']:
            logger.info(f"Vision analysis successful for {image.filename}")
            return result
        else:
            logger.error(f"Vision analysis failed: {result.get('error', 'Unknown error')}")
            raise HTTPException(status_code=500, detail=result.get('error', 'Analysis failed'))
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Vision API endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Vision analysis failed: {str(e)}")

@router.get("/vision/status")
async def vision_api_status():
    """Check Vision API status"""
    try:
        from app.services.vision_analyzer import VisionAnalyzer
        # Try to initialize the analyzer
        analyzer = VisionAnalyzer()
        return {
            "status": "ready",
            "message": "Google Vision API is ready for analysis",
            "using_adc": True
        }
    except Exception as e:
        return {
            "status": "error", 
            "message": f"Vision API not available: {str(e)}",
            "using_adc": True
        } 