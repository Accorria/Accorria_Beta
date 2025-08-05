"""
Car Analysis API endpoints

Provides endpoints for:
- Image-based car analysis
- Market intelligence integration
- Price recommendations
- Comprehensive car evaluation
"""

from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.agents import ListeningAgent, MarketIntelligenceAgent
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.api.v1.auth import get_current_user

router = APIRouter()

class CarAnalysisRequest(BaseModel):
    """Request model for car analysis with details"""
    make: str = Field(..., description="Car make")
    model: str = Field(..., description="Car model")
    year: Optional[int] = Field(None, description="Car year")
    mileage: Optional[int] = Field(None, description="Car mileage")
    color: Optional[str] = Field(None, description="Car color")
    condition: Optional[str] = Field(None, description="Car condition")
    location: str = Field("United States", description="Location for analysis")
    target_profit: float = Field(2000, description="Target profit amount")

class CarAnalysisResponse(BaseModel):
    """Response model for car analysis"""
    success: bool
    timestamp: str
    image_analysis: Dict[str, Any]
    market_intelligence: Dict[str, Any]
    price_recommendations: Dict[str, Any]
    confidence_score: float
    processing_time: float
    error_message: Optional[str] = None

@router.post("/car-analysis/analyze-images", response_model=CarAnalysisResponse)
async def analyze_car_images(
    images: list[UploadFile] = File(..., description="Up to 15 car images"),
    location: str = Form("United States"),
    target_profit: float = Form(2000),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze car images and provide comprehensive market intelligence.
    
    This endpoint:
    1. Analyzes uploaded car images using AI
    2. Detects make, model, year, color, etc.
    3. Provides market intelligence and pricing recommendations
    4. Suggests optimal pricing strategy
    """
    try:
        if len(images) > 15:
            raise HTTPException(status_code=400, detail="Maximum 15 images allowed.")
        
        # Read image bytes
        image_bytes = [await img.read() for img in images]
        
        # Step 1: Analyze images using ListeningAgent
        listening_agent = ListeningAgent(db)
        image_analysis_result = await listening_agent.extract_details_from_images(image_bytes)
        
        # Step 2: Run market intelligence analysis
        market_agent = MarketIntelligenceAgent()
        
        # Prepare market intelligence input
        market_input = {
            "make": image_analysis_result.get("make", "Toyota"),
            "model": image_analysis_result.get("model", "Camry"),
            "year": image_analysis_result.get("year"),
            "mileage": image_analysis_result.get("mileage"),
            "location": location,
            "target_profit": target_profit,
            "analysis_type": "comprehensive"
        }
        
        market_result = await market_agent.execute(market_input)
        
        # Step 3: Generate price recommendations
        price_recommendations = await _generate_price_recommendations(
            image_analysis_result, 
            market_result.data if market_result.success else {},
            target_profit
        )
        
        return CarAnalysisResponse(
            success=True,
            timestamp=datetime.now().isoformat(),
            image_analysis=image_analysis_result,
            market_intelligence=market_result.data if market_result.success else {},
            price_recommendations=price_recommendations,
            confidence_score=image_analysis_result.get("confidence_score", 0.0),
            processing_time=0.0
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Car analysis failed: {str(e)}")

@router.post("/car-analysis/analyze-with-details", response_model=CarAnalysisResponse)
async def analyze_car_with_details(
    request: CarAnalysisRequest,
    images: Optional[list[UploadFile]] = File(None, description="Optional car images"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze car with provided details and optional images.
    
    This endpoint combines manual details with AI image analysis for comprehensive evaluation.
    """
    try:
        # Step 1: Combine manual details with image analysis
        combined_details = {
            "make": request.make,
            "model": request.model,
            "year": request.year,
            "mileage": request.mileage,
            "color": request.color,
            "condition": request.condition
        }
        
        # Step 2: Analyze images if provided
        if images:
            if len(images) > 15:
                raise HTTPException(status_code=400, detail="Maximum 15 images allowed.")
            
            image_bytes = [await img.read() for img in images]
            listening_agent = ListeningAgent(db)
            image_analysis_result = await listening_agent.extract_details_from_images(image_bytes)
            
            # Merge image analysis with manual details
            for key, value in image_analysis_result.items():
                if value and key in combined_details and not combined_details[key]:
                    combined_details[key] = value
            
            # Use image analysis for mileage if not provided manually
            if not combined_details.get("mileage") and image_analysis_result.get("mileage"):
                combined_details["mileage"] = image_analysis_result["mileage"]
        
        # Step 3: Run market intelligence analysis
        market_agent = MarketIntelligenceAgent()
        
        market_input = {
            "make": combined_details["make"],
            "model": combined_details["model"],
            "year": combined_details["year"],
            "mileage": combined_details["mileage"],
            "location": request.location,
            "target_profit": request.target_profit,
            "analysis_type": "comprehensive"
        }
        
        market_result = await market_agent.execute(market_input)
        
        # Step 4: Generate price recommendations
        price_recommendations = await _generate_price_recommendations(
            combined_details,
            market_result.data if market_result.success else {},
            request.target_profit
        )
        
        return CarAnalysisResponse(
            success=True,
            timestamp=datetime.now().isoformat(),
            image_analysis=combined_details,
            market_intelligence=market_result.data if market_result.success else {},
            price_recommendations=price_recommendations,
            confidence_score=combined_details.get("confidence_score", 0.0),
            processing_time=0.0
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Car analysis failed: {str(e)}")

async def _generate_price_recommendations(
    car_details: Dict[str, Any], 
    market_data: Dict[str, Any], 
    target_profit: float
) -> Dict[str, Any]:
    """
    Generate comprehensive price recommendations based on car details and market data.
    """
    
    # Extract market pricing data
    pricing_analysis = market_data.get("pricing_analysis", {})
    market_prices = pricing_analysis.get("market_prices", {})
    
    # Calculate base market value
    base_price = market_prices.get("average_price", 15000)
    min_price = market_prices.get("min_price", base_price * 0.8)
    max_price = market_prices.get("max_price", base_price * 1.2)
    
    # Adjust for mileage
    mileage = car_details.get("mileage", 50000)
    mileage_adjustment = 1.0
    
    # Ensure mileage is a valid number
    if mileage is None:
        mileage = 50000
    elif not isinstance(mileage, (int, float)):
        try:
            mileage = int(mileage)
        except (ValueError, TypeError):
            mileage = 50000
    
    if mileage < 30000:
        mileage_adjustment = 1.15  # Low mileage premium
    elif mileage < 60000:
        mileage_adjustment = 1.05  # Good mileage
    elif mileage < 100000:
        mileage_adjustment = 0.95  # Average mileage
    else:
        mileage_adjustment = 0.85  # High mileage discount
    
    # Calculate recommended prices
    adjusted_base_price = base_price * mileage_adjustment
    
    # Price recommendations for different strategies
    price_recommendations = {
        "quick_sale": {
            "price": adjusted_base_price * 0.9,
            "description": "Quick sale price - 10% below market",
            "estimated_days_to_sell": 7,
            "profit_potential": target_profit * 0.7
        },
        "market_price": {
            "price": adjusted_base_price,
            "description": "Market price - competitive listing",
            "estimated_days_to_sell": 14,
            "profit_potential": target_profit
        },
        "premium": {
            "price": adjusted_base_price * 1.1,
            "description": "Premium price - 10% above market",
            "estimated_days_to_sell": 30,
            "profit_potential": target_profit * 1.3
        },
        "optimal": {
            "price": adjusted_base_price * 0.95,
            "description": "Optimal price - balanced approach",
            "estimated_days_to_sell": 10,
            "profit_potential": target_profit * 0.9
        }
    }
    
    # Add market context
    market_context = {
        "market_trend": pricing_analysis.get("price_trends", {}).get("trend", "stable"),
        "seasonal_factors": pricing_analysis.get("seasonal_factors", {}),
        "competitor_count": market_data.get("competitor_research", {}).get("competitor_count", 0),
        "demand_level": market_data.get("make_model_analysis", {}).get("demand_analysis", {}).get("demand_level", "medium")
    }
    
    return {
        "price_recommendations": price_recommendations,
        "market_context": market_context,
        "base_price": base_price,
        "adjusted_base_price": adjusted_base_price,
        "mileage_adjustment": mileage_adjustment,
        "target_profit": target_profit,
        "recommended_strategy": "optimal"  # Default recommendation
    } 