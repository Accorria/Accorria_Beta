"""
Market Intelligence API endpoints

Provides endpoints for:
- Make/Model analysis
- Competitor research
- Pricing analysis
- Profit threshold setting
- Comprehensive market intelligence
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.agents import MarketIntelligenceAgent
from app.core.database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

class MarketIntelligenceRequest(BaseModel):
    """Request model for market intelligence analysis"""
    make: str = Field(..., description="Car make (e.g., Toyota, Honda)")
    model: str = Field(..., description="Car model (e.g., Camry, Civic)")
    year: Optional[int] = Field(None, description="Car year")
    mileage: Optional[int] = Field(None, description="Car mileage")
    location: str = Field("United States", description="Location for analysis")
    radius_miles: int = Field(50, description="Radius for competitor search")
    target_profit: float = Field(2000, description="Target profit amount")
    risk_tolerance: str = Field("medium", description="Risk tolerance: low, medium, high")
    analysis_type: str = Field("comprehensive", description="Type of analysis: make_model_analysis, competitor_research, pricing_analysis, threshold_setting, comprehensive")

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
async def get_popular_makes():
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
async def get_models_for_make(make: str):
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
    location: str = "United States"
):
    """
    Quick market analysis for a make/model combination.
    
    Provides a simplified analysis focusing on key metrics.
    """
    try:
        agent = MarketIntelligenceAgent()
        
        # Quick analysis focusing on make/model scoring
        input_data = {
            "make": make,
            "model": model,
            "location": location,
            "analysis_type": "make_model_analysis"
        }
        
        result = await agent.execute(input_data)
        
        if result.success:
            analysis = result.data.get("make_model_analysis", {})
            return {
                "success": True,
                "make": make,
                "model": model,
                "overall_score": analysis.get("overall_score", 0),
                "make_score": analysis.get("make_score", 0),
                "model_score": analysis.get("model_score", 0),
                "demand_category": analysis.get("demand_analysis", {}).get("demand_category", "unknown"),
                "profit_potential": analysis.get("profit_potential", {}).get("potential_category", "unknown"),
                "recommendation": analysis.get("recommendation", "No recommendation available")
            }
        else:
            return {
                "success": False,
                "error": result.error_message
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quick analysis failed: {str(e)}")

@router.post("/market-intelligence/competitor-search")
async def search_competitors(
    make: str,
    model: str,
    location: str = "United States",
    radius_miles: int = 50
):
    """
    Search for competitors in the local area.
    
    Finds and analyzes competing listings for the specified make/model.
    """
    try:
        agent = MarketIntelligenceAgent()
        
        input_data = {
            "make": make,
            "model": model,
            "location": location,
            "radius_miles": radius_miles,
            "analysis_type": "competitor_research"
        }
        
        result = await agent.execute(input_data)
        
        if result.success:
            research = result.data.get("competitor_research", {})
            return {
                "success": True,
                "location": location,
                "radius_miles": radius_miles,
                "competitors_found": research.get("competitors_found", 0),
                "competitors": research.get("competitors", []),
                "pricing_analysis": research.get("pricing_analysis", {}),
                "market_position": research.get("market_position", {}),
                "recommendations": research.get("recommendations", [])
            }
        else:
            return {
                "success": False,
                "error": result.error_message
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Competitor search failed: {str(e)}")

@router.post("/market-intelligence/profit-thresholds")
async def calculate_profit_thresholds(
    make: str,
    model: str,
    target_profit: float = 2000,
    risk_tolerance: str = "medium"
):
    """
    Calculate profit thresholds for car flipping.
    
    Determines acquisition and selling price thresholds based on target profit and risk tolerance.
    """
    try:
        agent = MarketIntelligenceAgent()
        
        input_data = {
            "make": make,
            "model": model,
            "target_profit": target_profit,
            "risk_tolerance": risk_tolerance,
            "analysis_type": "threshold_setting"
        }
        
        result = await agent.execute(input_data)
        
        if result.success:
            thresholds = result.data.get("profit_thresholds", {})
            return {
                "success": True,
                "make": make,
                "model": model,
                "target_profit": target_profit,
                "risk_tolerance": risk_tolerance,
                "acquisition_thresholds": thresholds.get("acquisition_thresholds", {}),
                "selling_thresholds": thresholds.get("selling_thresholds", {}),
                "risk_analysis": thresholds.get("risk_analysis", {}),
                "recommendations": thresholds.get("recommendations", [])
            }
        else:
            return {
                "success": False,
                "error": result.error_message
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Threshold calculation failed: {str(e)}") 