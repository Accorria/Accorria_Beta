"""
QuickFlip AI - Listening Agent
Combines patterns from Google ADK samples:
- Marketing Agency: Multi-tool orchestration
- RAG: Knowledge retrieval and content generation
- Customer Service: Conversational workflows
- Brand Search Optimization: Market research and optimization
"""

import asyncio
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from app.models import Car, User  # Use your comprehensive models
from sqlalchemy.orm import Session
from .image_analysis_agent import ImageAnalysisAgent

logger = logging.getLogger(__name__)

@dataclass
class CarDetails:
    """Input data for car analysis"""
    year: int
    make: str
    model: str
    mileage: int
    condition: str = "good"
    features: Optional[List[str]] = None
    images: Optional[List[str]] = None

@dataclass
class MarketAnalysis:
    """Market research results"""
    estimated_price: float
    market_range: tuple[float, float]
    similar_listings: List[Dict[str, Any]]
    market_trend: str
    confidence_score: float

@dataclass
class ListingDraft:
    """Generated listing content"""
    title: str
    description: str
    suggested_price: float
    keywords: List[str]
    negotiation_range: tuple[float, float]
    created_at: datetime

class ListenAgent:
    """
    Listening Agent for QuickFlip AI
    Analyzes cars and generates optimized listing drafts
    """
    
    def __init__(self):
        self.name = "listen_agent_v1"
        self.version = "1.0.0"
        self.tools = {
            "describe_car": self.describe_car,
            "fetch_market_price": self.fetch_market_price,
            "generate_listing_text": self.generate_listing_text,
            "analyze_negotiation": self.analyze_negotiation
        }
    
    async def process_car(self, car_details: CarDetails) -> Dict[str, Any]:
        """
        Main workflow: Process car details and generate listing draft
        """
        try:
            logger.info(f"Processing car: {car_details.year} {car_details.make} {car_details.model}")
            
            # Step 1: Describe the car (RAG pattern)
            car_description = await self.describe_car(car_details)
            
            # Step 2: Fetch market pricing (Brand Search Optimization pattern)
            market_analysis = await self.fetch_market_price(car_details)
            
            # Step 3: Generate listing text (RAG pattern)
            listing_draft = await self.generate_listing_text(car_details, market_analysis)
            
            # Step 4: Analyze negotiation strategy (Customer Service pattern)
            negotiation_analysis = await self.analyze_negotiation(market_analysis, listing_draft)
            
            return {
                "success": True,
                "car_description": car_description,
                "market_analysis": market_analysis,
                "listing_draft": listing_draft,
                "negotiation_analysis": negotiation_analysis,
                "processed_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing car: {e}")
            return {
                "success": False,
                "error": str(e),
                "processed_at": datetime.utcnow().isoformat()
            }
    
    async def describe_car(self, car_details: CarDetails) -> Dict[str, Any]:
        """
        Tool 1: Describe car based on details (RAG pattern)
        """
        # TODO: Integrate with AI brain for intelligent description
        description = f"{car_details.year} {car_details.make} {car_details.model}"
        
        if car_details.mileage < 50000:
            condition_note = "Low mileage, excellent condition"
        elif car_details.mileage < 100000:
            condition_note = "Good mileage, well maintained"
        else:
            condition_note = "Higher mileage, check maintenance history"
        
        return {
            "description": description,
            "condition_note": condition_note,
            "key_features": car_details.features or [],
            "mileage_category": "low" if car_details.mileage < 50000 else "medium" if car_details.mileage < 100000 else "high"
        }
    
    async def fetch_market_price(self, car_details: CarDetails) -> MarketAnalysis:
        """
        Tool 2: Fetch market pricing (Brand Search Optimization pattern)
        """
        # TODO: Integrate with Google Search API or car pricing APIs
        base_price = 15000  # Mock base price
        
        # Simple pricing logic (replace with real API calls)
        if car_details.mileage < 50000:
            price_multiplier = 1.2
        elif car_details.mileage < 100000:
            price_multiplier = 1.0
        else:
            price_multiplier = 0.8
        
        estimated_price = base_price * price_multiplier
        
        return MarketAnalysis(
            estimated_price=estimated_price,
            market_range=(estimated_price * 0.9, estimated_price * 1.1),
            similar_listings=[
                {"price": estimated_price * 0.95, "mileage": car_details.mileage - 5000},
                {"price": estimated_price * 1.05, "mileage": car_details.mileage + 5000}
            ],
            market_trend="stable",
            confidence_score=0.85
        )
    
    async def generate_listing_text(self, car_details: CarDetails, market_analysis: MarketAnalysis) -> ListingDraft:
        """
        Tool 3: Generate listing text (RAG pattern)
        """
        # TODO: Integrate with AI brain for intelligent content generation
        title = f"{car_details.year} {car_details.make} {car_details.model} - {car_details.mileage:,} miles"
        
        description = f"""
        {car_details.year} {car_details.make} {car_details.model} with {car_details.mileage:,} miles.
        
        This {car_details.condition} condition vehicle is priced competitively at ${market_analysis.estimated_price:,.0f}.
        
        Key Features:
        • {car_details.year} model year
        • {car_details.mileage:,} miles
        • {car_details.condition} condition
        • Market-competitive pricing
        
        Contact for more details and to schedule a viewing.
        """.strip()
        
        keywords = [car_details.make, car_details.model, str(car_details.year), "used car", "for sale"]
        
        return ListingDraft(
            title=title,
            description=description,
            suggested_price=market_analysis.estimated_price,
            keywords=keywords,
            negotiation_range=(market_analysis.estimated_price * 0.95, market_analysis.estimated_price * 1.05),
            created_at=datetime.utcnow()
        )
    
    async def analyze_negotiation(self, market_analysis: MarketAnalysis, listing_draft: ListingDraft) -> Dict[str, Any]:
        """
        Tool 4: Analyze negotiation strategy (Customer Service pattern)
        """
        # TODO: Integrate with AI brain for negotiation intelligence
        min_price = listing_draft.negotiation_range[0]
        max_price = listing_draft.negotiation_range[1]
        
        return {
            "min_acceptable_price": min_price,
            "max_target_price": max_price,
            "negotiation_margin": max_price - min_price,
            "price_flexibility": "medium",
            "recommended_strategy": "Start at suggested price, be flexible within 5% range",
            "market_positioning": "competitive" if market_analysis.confidence_score > 0.8 else "aggressive"
        }

class ListenerAgent:
    def __init__(self, db: Session):
        self.db = db
        # Initialize the image analysis agent
        self.image_agent = ImageAnalysisAgent()

    async def extract_details_from_images(self, images: List[bytes]) -> dict:
        """
        Extract car details from images using AI analysis.
        
        Args:
            images: List of image bytes
            
        Returns:
            Dictionary containing detected car information
        """
        try:
            # Use the image analysis agent to analyze the images
            analysis_result = await self.image_agent.analyze_car_images(images)
            
            if analysis_result.get("success"):
                detected_info = analysis_result.get("detected_info", {})
                return {
                    "make": detected_info.get("make"),
                    "model": detected_info.get("model"),
                    "year": detected_info.get("year"),
                    "color": detected_info.get("color"),
                    "vin": detected_info.get("vin"),
                    "mileage": detected_info.get("mileage"),
                    "inferred_from_images": True,
                    "confidence_score": analysis_result.get("confidence_score", 0.0),
                    "images": images  # Store images for saving
                }
            else:
                # Fallback to basic detection
                logger.warning("Image analysis failed, using fallback")
                return {
                    "make": "Toyota",
                    "model": "Camry",
                    "year": 2020,
                    "color": "White",
                    "inferred_from_images": True,
                    "confidence_score": 0.1,
                    "images": images
                }
                
        except Exception as e:
            logger.error(f"Error in image analysis: {e}")
            # Fallback to basic detection
            return {
                "make": "Toyota",
                "model": "Camry",
                "year": 2020,
                "color": "White",
                "inferred_from_images": True,
                "confidence_score": 0.0,
                "images": images
            }

    async def process_images_and_details(
        self,
        images: List[bytes],
        vin: Optional[str] = None,
        make: Optional[str] = None,
        model: Optional[str] = None,
        year: Optional[int] = None,
        user_id: Optional[int] = None,
    ):
        # 1. Extract details from images
        details = await self.extract_details_from_images(images)
        # 2. Overwrite with manual input if provided
        if make: details["make"] = make
        if model: details["model"] = model
        if year: details["year"] = year
        details["user_id"] = user_id
        # 3. Save to DB and return the car dict
        car = self.save_listing(details)
        return car.to_dict() if car else None

    def save_listing(self, car_data: dict):
        # Save the car listing to the database
        car = Car(
            user_id=car_data.get("user_id"),
            make=car_data.get("make"),
            model=car_data.get("model"),
            year=car_data.get("year"),
            images=car_data.get("images"),
            color=car_data.get("color"),
            status="ready",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            title=f"{car_data.get('year', '')} {car_data.get('make', '')} {car_data.get('model', '')}",
            description="Auto-generated by Listener Agent.",
            price=car_data.get("price", 0.0),
            mileage=car_data.get("mileage", 0),
            platform="listener_agent"
        )
        self.db.add(car)
        self.db.commit()
        self.db.refresh(car)
        return car

# Global instance
listen_agent = ListenAgent()

async def run_listen_agent(car_details: CarDetails) -> Dict[str, Any]:
    """Convenience function to run the listening agent"""
    return await listen_agent.process_car(car_details) 