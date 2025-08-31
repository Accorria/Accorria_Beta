"""
Market Intelligence API endpoints

Provides endpoints for:
- Market analysis and intelligence
- Competitor research
- Pricing recommendations
- Demand analysis
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.agents import MarketIntelligenceAgent
from app.core.database import get_sync_db as get_db
from sqlalchemy.orm import Session
from app.utils.auth import get_current_user

router = APIRouter()

class MarketIntelligenceRequest(BaseModel):
    """Request model for market intelligence analysis"""
    make: str = Field(..., description="Car make")
    model: str = Field(..., description="Car model")
    year: Optional[int] = Field(None, description="Car year")
    mileage: Optional[int] = Field(None, description="Car mileage")
    location: str = Field("United States", description="Location for analysis")
    radius_miles: int = Field(50, description="Search radius in miles")
    target_profit: float = Field(2000, description="Target profit amount")
    risk_tolerance: str = Field("medium", description="Risk tolerance level")
    analysis_type: str = Field("comprehensive", description="Type of analysis")

class MarketIntelligenceResponse(BaseModel):
    """Response model for market intelligence analysis"""
    success: bool
    timestamp: str
    analysis_type: str
    data: Dict[str, Any]
    processing_time: float
    confidence: float
    error_message: Optional[str] = None

@router.post("/market-intelligence/analyze", response_model=MarketIntelligenceResponse)
async def analyze_market_intelligence(
    request: MarketIntelligenceRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze market intelligence for a specific make and model.
    
    This endpoint provides comprehensive market analysis including:
    - Make/Model popularity and demand analysis
    - Competitor research in the local area
    - Pricing trends and market data
    - Profit threshold recommendations
    - Risk assessment and mitigation strategies
    """
    try:
        # Log the authenticated user
        user_email = current_user.get("email", "unknown")
        print(f"Market intelligence analysis requested by: {user_email}")
        
        # Initialize the market intelligence agent
        agent = MarketIntelligenceAgent()
        
        # Prepare input data
        input_data = {
            "make": request.make,
            "model": request.model,
            "year": request.year,
            "mileage": request.mileage,
            "location": request.location,
            "radius_miles": request.radius_miles,
            "target_profit": request.target_profit,
            "risk_tolerance": request.risk_tolerance,
            "analysis_type": request.analysis_type
        }
        
        # Process the request
        result = await agent.execute(input_data)
        
        return MarketIntelligenceResponse(
            success=result.success,
            timestamp=result.timestamp.isoformat(),
            analysis_type=request.analysis_type,
            data=result.data,
            processing_time=result.processing_time,
            confidence=result.confidence,
            error_message=result.error_message
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market intelligence analysis failed: {str(e)}")

@router.get("/market-intelligence/makes")
async def get_popular_makes(current_user: dict = Depends(get_current_user)):
    """
    Get list of popular car makes for analysis.
    
    Returns makes that are commonly analyzed for car flipping opportunities.
    """
    agent = MarketIntelligenceAgent()
    return {
        "popular_makes": agent.popular_makes,
        "high_demand_models": agent.high_demand_models
    }

@router.get("/market-intelligence/models/{make}")
async def get_models_for_make(
    make: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get list of models for a specific make.
    
    Args:
        make: Car make (e.g., Toyota, Honda)
    """
    agent = MarketIntelligenceAgent()
    make = make.title()
    
    if make in agent.high_demand_models:
        return {
            "make": make,
            "models": agent.high_demand_models[make],
            "is_high_demand": True
        }
    else:
        return {
            "make": make,
            "models": [],
            "is_high_demand": False,
            "message": f"No specific model data for {make}. Consider using comprehensive analysis."
        }

@router.post("/market-intelligence/quick-analysis")
async def quick_market_analysis(
    make: str,
    model: str,
    location: str = "United States",
    current_user: dict = Depends(get_current_user)
):
    """
    Quick market analysis for a specific make and model.
    
    Provides rapid market insights without comprehensive analysis.
    """
    try:
        agent = MarketIntelligenceAgent()
        
        input_data = {
            "make": make,
            "model": model,
            "location": location,
            "analysis_type": "quick"
        }
        
        result = await agent.execute(input_data)
        
        return {
            "success": result.success,
            "data": result.data,
            "processing_time": result.processing_time
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quick analysis failed: {str(e)}")

@router.post("/market-intelligence/competitor-search")
async def competitor_search(
    make: str,
    model: str,
    location: str = "United States",
    radius_miles: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """
    Search for competitors in the local market.
    
    Analyzes similar vehicles for sale in the specified area.
    """
    try:
        agent = MarketIntelligenceAgent()
        
        input_data = {
            "make": make,
            "model": model,
            "location": location,
            "radius_miles": radius_miles,
            "analysis_type": "competitor_search"
        }
        
        result = await agent.execute(input_data)
        
        return {
            "success": result.success,
            "competitors": result.data.get("competitors", []),
            "market_insights": result.data.get("market_insights", {})
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Competitor search failed: {str(e)}")

@router.post("/market-intelligence/profit-thresholds")
async def calculate_profit_thresholds(
    make: str,
    model: str,
    purchase_price: float,
    target_profit: float,
    location: str = "United States",
    current_user: dict = Depends(get_current_user)
):
    """
    Calculate profit thresholds and recommendations.
    
    Provides pricing strategy based on market data and profit goals.
    """
    try:
        agent = MarketIntelligenceAgent()
        
        input_data = {
            "make": make,
            "model": model,
            "purchase_price": purchase_price,
            "target_profit": target_profit,
            "location": location,
            "analysis_type": "profit_analysis"
        }
        
        result = await agent.execute(input_data)
        
        return {
            "success": result.success,
            "profit_analysis": result.data.get("profit_analysis", {}),
            "pricing_recommendations": result.data.get("pricing_recommendations", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profit analysis failed: {str(e)}") 