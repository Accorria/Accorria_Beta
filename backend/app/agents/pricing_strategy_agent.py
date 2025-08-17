"""
Pricing Strategy Agent - Generates 3-tier pricing strategy and FlipScore

This agent takes vehicle data and market intelligence to generate:
- Quick Sale price (sell fast)
- Market Price (balanced)
- Top Dollar price (premium)
- FlipScore (0-100 resale potential)
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
from .base_agent import BaseAgent, AgentOutput
import logging
import json

logger = logging.getLogger(__name__)


class PricingStrategyAgent(BaseAgent):
    """Pricing Strategy Agent - Generates pricing strategies and FlipScore"""
    
    def __init__(self, config=None):
        super().__init__("pricing_strategy_agent", config)
        
        # Base pricing multipliers for different strategies
        self.pricing_multipliers = {
            "quick_sale": 0.85,  # 15% below market for fast sale
            "market_price": 1.0,  # Market rate
            "top_dollar": 1.15   # 15% above market for premium
        }
        
        # Title status impact on pricing
        self.title_status_impact = {
            "clean": 1.0,
            "rebuilt": 0.7,    # 30% reduction
            "salvage": 0.5,    # 50% reduction
            "junk": 0.3,       # 70% reduction
            "parts": 0.2       # 80% reduction
        }
        
        # Condition impact on pricing
        self.condition_impact = {
            "excellent": 1.1,   # 10% premium
            "good": 1.0,        # Market rate
            "fair": 0.85,       # 15% reduction
            "poor": 0.7         # 30% reduction
        }
    
    async def process(self, input_data: Dict[str, Any]) -> AgentOutput:
        """
        Generate pricing strategy and FlipScore
        
        Args:
            input_data: Dict containing:
                - vehicle_data: Dict (year, make, model, mileage, condition, title_status)
                - market_intelligence: Dict (market_comps, demand_analysis, price_trends)
                - user_goals: str (optional: 'quick_sale', 'max_profit', 'balanced')
        
        Returns:
            AgentOutput with pricing strategy and FlipScore
        """
        start_time = datetime.now()
        
        try:
            vehicle_data = input_data.get("vehicle_data", {})
            market_intelligence = input_data.get("market_intelligence", {})
            user_goals = input_data.get("user_goals", "balanced")
            
            if not vehicle_data:
                raise ValueError("No vehicle data provided")
            
            # Generate pricing strategy
            pricing_strategy = await self._generate_pricing_strategy(
                vehicle_data, market_intelligence, user_goals
            )
            
            # Calculate FlipScore
            flip_score = await self._calculate_flip_score(
                vehicle_data, market_intelligence, pricing_strategy
            )
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return AgentOutput(
                agent_name=self.name,
                timestamp=datetime.now(),
                success=True,
                data={
                    "pricing_strategy": pricing_strategy,
                    "flip_score": flip_score,
                    "recommendation": self._get_recommendation(flip_score, user_goals),
                    "processing_time": processing_time
                },
                confidence=0.9,
                processing_time=processing_time
            )
            
        except Exception as e:
            logger.error(f"Pricing strategy agent error: {e}")
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return AgentOutput(
                agent_name=self.name,
                timestamp=datetime.now(),
                success=False,
                data={"error": str(e)},
                confidence=0.0,
                processing_time=processing_time,
                error_message=str(e)
            )
    
    async def _generate_pricing_strategy(self, vehicle_data: Dict, market_intelligence: Dict, user_goals: str) -> Dict[str, Any]:
        """
        Generate 3-tier pricing strategy
        """
        # Get base market value
        base_value = self._get_base_market_value(vehicle_data, market_intelligence)
        
        # Apply adjustments for vehicle condition and title status
        adjusted_value = self._apply_vehicle_adjustments(base_value, vehicle_data)
        
        # Generate 3 pricing tiers
        pricing_strategy = {
            "quick_sale": {
                "price": round(adjusted_value * self.pricing_multipliers["quick_sale"], 2),
                "rationale": "Priced 15% below market for quick sale (2-4 weeks)",
                "time_to_sell": "2-4 weeks",
                "risk_level": "low"
            },
            "market_price": {
                "price": round(adjusted_value * self.pricing_multipliers["market_price"], 2),
                "rationale": "Market rate pricing for balanced time-to-sale (4-8 weeks)",
                "time_to_sell": "4-8 weeks",
                "risk_level": "medium"
            },
            "top_dollar": {
                "price": round(adjusted_value * self.pricing_multipliers["top_dollar"], 2),
                "rationale": "Premium pricing for maximum profit (8-12 weeks)",
                "time_to_sell": "8-12 weeks",
                "risk_level": "high"
            },
            "base_market_value": base_value,
            "adjusted_value": adjusted_value,
            "pricing_factors": self._get_pricing_factors(vehicle_data, market_intelligence)
        }
        
        return pricing_strategy
    
    def _get_base_market_value(self, vehicle_data: Dict, market_intelligence: Dict) -> float:
        """
        Get base market value from market intelligence
        """
        # Use market comps if available
        market_comps = market_intelligence.get("market_comps", [])
        if market_comps:
            # Calculate average from comps
            prices = [comp.get("price", 0) for comp in market_comps if comp.get("price")]
            if prices:
                return sum(prices) / len(prices)
        
        # Fallback: Use basic pricing based on year and make
        year = vehicle_data.get("year", 2020)
        make = vehicle_data.get("make", "").lower()
        mileage = vehicle_data.get("mileage", 100000)
        
        # Basic pricing logic (simplified)
        base_price = 15000  # Default base price
        
        # Adjust for year
        year_factor = 1.0 + (year - 2020) * 0.05  # Newer cars worth more
        
        # Adjust for mileage
        mileage_factor = 1.0 - (mileage - 50000) / 100000 * 0.3  # Higher mileage = lower value
        
        # Adjust for make (premium brands)
        make_factor = 1.0
        premium_makes = ['bmw', 'mercedes', 'audi', 'lexus', 'acura', 'infiniti']
        if make in premium_makes:
            make_factor = 1.2
        
        return base_price * year_factor * mileage_factor * make_factor
    
    def _apply_vehicle_adjustments(self, base_value: float, vehicle_data: Dict) -> float:
        """
        Apply adjustments for vehicle condition and title status
        """
        adjusted_value = base_value
        
        # Apply title status adjustment
        title_status = vehicle_data.get("title_status", "clean").lower()
        title_multiplier = self.title_status_impact.get(title_status, 1.0)
        adjusted_value *= title_multiplier
        
        # Apply condition adjustment
        condition = vehicle_data.get("condition", "good").lower()
        condition_multiplier = self.condition_impact.get(condition, 1.0)
        adjusted_value *= condition_multiplier
        
        return adjusted_value
    
    def _get_pricing_factors(self, vehicle_data: Dict, market_intelligence: Dict) -> Dict[str, Any]:
        """
        Get factors that influenced pricing
        """
        factors = {
            "title_status_impact": self.title_status_impact.get(
                vehicle_data.get("title_status", "clean").lower(), 1.0
            ),
            "condition_impact": self.condition_impact.get(
                vehicle_data.get("condition", "good").lower(), 1.0
            ),
            "market_demand": market_intelligence.get("demand_analysis", {}).get("demand_level", "medium"),
            "price_trend": market_intelligence.get("price_trends", {}).get("trend", "stable"),
            "competition": len(market_intelligence.get("market_comps", []))
        }
        
        return factors
    
    async def _calculate_flip_score(self, vehicle_data: Dict, market_intelligence: Dict, pricing_strategy: Dict) -> Dict[str, Any]:
        """
        Calculate FlipScore (0-100) and rationale
        """
        score = 50  # Base score
        factors = []
        
        # Title status impact
        title_status = vehicle_data.get("title_status", "clean").lower()
        if title_status == "clean":
            score += 20
            factors.append("Clean title (+20 points)")
        elif title_status == "rebuilt":
            score += 10
            factors.append("Rebuilt title (+10 points)")
        elif title_status == "salvage":
            score -= 20
            factors.append("Salvage title (-20 points)")
        else:
            score -= 30
            factors.append(f"{title_status.title()} title (-30 points)")
        
        # Condition impact
        condition = vehicle_data.get("condition", "good").lower()
        if condition == "excellent":
            score += 15
            factors.append("Excellent condition (+15 points)")
        elif condition == "good":
            score += 10
            factors.append("Good condition (+10 points)")
        elif condition == "fair":
            score += 5
            factors.append("Fair condition (+5 points)")
        elif condition == "poor":
            score -= 15
            factors.append("Poor condition (-15 points)")
        
        # Mileage impact
        mileage = vehicle_data.get("mileage", 100000)
        if mileage < 50000:
            score += 15
            factors.append("Low mileage (+15 points)")
        elif mileage < 100000:
            score += 10
            factors.append("Average mileage (+10 points)")
        elif mileage < 150000:
            score += 5
            factors.append("High mileage (+5 points)")
        else:
            score -= 10
            factors.append("Very high mileage (-10 points)")
        
        # Market demand impact
        demand_level = market_intelligence.get("demand_analysis", {}).get("demand_level", "medium")
        if demand_level == "high":
            score += 10
            factors.append("High market demand (+10 points)")
        elif demand_level == "medium":
            score += 5
            factors.append("Medium market demand (+5 points)")
        else:
            score -= 5
            factors.append("Low market demand (-5 points)")
        
        # Price trend impact
        price_trend = market_intelligence.get("price_trends", {}).get("trend", "stable")
        if price_trend == "increasing":
            score += 10
            factors.append("Rising prices (+10 points)")
        elif price_trend == "stable":
            score += 5
            factors.append("Stable prices (+5 points)")
        else:
            score -= 5
            factors.append("Falling prices (-5 points)")
        
        # Ensure score is between 0 and 100
        score = max(0, min(100, score))
        
        # Determine recommendation
        if score >= 80:
            recommendation = "Excellent flip candidate"
        elif score >= 60:
            recommendation = "Good flip candidate"
        elif score >= 40:
            recommendation = "Fair flip candidate"
        else:
            recommendation = "Poor flip candidate"
        
        return {
            "score": score,
            "factors": factors,
            "recommendation": recommendation,
            "confidence": 0.85
        }
    
    def _get_recommendation(self, flip_score: Dict, user_goals: str) -> str:
        """
        Get pricing recommendation based on FlipScore and user goals
        """
        score = flip_score.get("score", 50)
        
        if user_goals == "quick_sale":
            return "Use Quick Sale pricing for fast turnaround"
        elif user_goals == "max_profit":
            if score >= 70:
                return "Use Top Dollar pricing - high FlipScore supports premium pricing"
            else:
                return "Use Market Price pricing - moderate FlipScore suggests balanced approach"
        else:  # balanced
            if score >= 80:
                return "Use Top Dollar pricing - excellent FlipScore"
            elif score >= 60:
                return "Use Market Price pricing - good FlipScore"
            else:
                return "Use Quick Sale pricing - lower FlipScore suggests faster sale"
    
    def get_capabilities(self) -> List[str]:
        """Return list of capabilities this agent provides"""
        return [
            "Generate 3-tier pricing strategy (Quick Sale, Market Price, Top Dollar)",
            "Calculate FlipScore (0-100 resale potential)",
            "Apply vehicle condition and title status adjustments",
            "Consider market demand and price trends",
            "Provide pricing rationale for each tier",
            "Estimate time-to-sell for each pricing strategy",
            "Assess risk levels for different pricing approaches",
            "Generate personalized recommendations based on user goals"
        ]
