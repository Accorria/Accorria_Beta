"""
Enhanced Analysis API Endpoint

Provides comprehensive car analysis using enhanced image processing
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Optional
import logging
from datetime import datetime

from app.services.enhanced_image_analysis import enhanced_analyzer

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/enhanced-analyze")
async def enhanced_analyze_car(
    images: List[UploadFile] = File(...),
    make: Optional[str] = Form(None),
    model: Optional[str] = Form(None),
    year: Optional[str] = Form(None),
    mileage: Optional[str] = Form(None),
    price: Optional[str] = Form(None),
    lowestPrice: Optional[str] = Form(None),
    titleStatus: Optional[str] = Form(None),
    aboutVehicle: Optional[str] = Form(None)
):
    """
    Enhanced car analysis endpoint
    
    Analyzes multiple car images to extract detailed information:
    - Make, model, year from badges and text
    - Mileage from odometer photos
    - Interior features from dashboard/interior shots
    - Exterior features from body shots
    - Condition assessment from all images
    """
    try:
        logger.info(f"Enhanced analysis request received for {len(images)} images")
        
        # Prepare car details
        car_details = {
            "make": make or "Unknown",
            "model": model or "Unknown", 
            "year": year or "Unknown",
            "mileage": mileage or "Unknown",
            "price": price or "15000",
            "lowestPrice": lowestPrice or "12000",
            "titleStatus": titleStatus or "clean",
            "aboutVehicle": aboutVehicle or ""
        }
        
        # Convert images to bytes
        image_bytes = []
        for image in images:
            content = await image.read()
            image_bytes.append(content)
        
        # Perform enhanced analysis
        analysis_result = await enhanced_analyzer.analyze_car_images(image_bytes, car_details)
        
        logger.info("Enhanced analysis completed successfully")
        return JSONResponse(content=analysis_result, status_code=200)
        
    except Exception as e:
        logger.error(f"Enhanced analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/enhanced-test")
async def enhanced_test():
    """
    Test endpoint for enhanced analysis
    """
    return {
        "status": "success",
        "message": "Enhanced analysis service is ready",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "Text detection from badges and odometer",
            "Feature detection from interior/exterior shots", 
            "Condition assessment from all images",
            "Comprehensive analysis of 16+ images"
        ]
    }
