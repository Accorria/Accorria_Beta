"""
Market Intelligence Agent for QuickFlip AI

This agent specializes in:
1. Analyzing car makes and models for market opportunities
2. Researching competitors in the local area
3. Analyzing pricing trends and market data
4. Setting profitable thresholds for car flipping
5. Providing comprehensive market intelligence
"""

import asyncio
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
import json
from .base_agent import BaseAgent, AgentOutput

logger = logging.getLogger(__name__)


class MarketIntelligenceAgent(BaseAgent):
    """
    Market Intelligence Agent for comprehensive car market analysis.
    
    This agent provides:
    - Make/Model analysis and scoring
    - Competitor research and analysis
    - Pricing trend analysis
    - Profit threshold recommendations
    - Market opportunity identification
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__("market_intelligence_agent", config)
        
        # Market data sources (in production, these would be real APIs)
        self.market_data_sources = {
            "kbb": "Kelley Blue Book",
            "edmunds": "Edmunds",
            "cargurus": "CarGurus",
            "autotrader": "AutoTrader",
            "facebook_marketplace": "Facebook Marketplace",
            "craigslist": "Craigslist"
        }
        
        # Popular makes and models for quick analysis
        self.popular_makes = [
            "Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes-Benz",
            "Audi", "Lexus", "Hyundai", "Kia", "Mazda", "Subaru", "Volkswagen"
        ]
        
        # High-demand models (good for flipping)
        self.high_demand_models = {
            "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma", "4Runner"],
            "Honda": ["Accord", "Civic", "CR-V", "Pilot", "Odyssey"],
            "Ford": ["F-150", "Mustang", "Escape", "Explorer", "Bronco"],
            "Chevrolet": ["Silverado 1500", "Equinox", "Malibu", "Tahoe"],
            "Nissan": ["Altima", "Sentra", "Rogue", "Pathfinder"],
            "BMW": ["3 Series", "5 Series", "X3", "X5"],
            "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE"]
        }
    
    async def process(self, input_data: Dict[str, Any]) -> AgentOutput:
        """
        Process market intelligence request.
        
        Args:
            input_data: Contains make, model, location, and analysis type
            
        Returns:
            Comprehensive market intelligence analysis
        """
        try:
            analysis_type = input_data.get("analysis_type", "comprehensive")
            
            if analysis_type == "make_model_analysis":
                result = await self._analyze_make_model(input_data)
            elif analysis_type == "competitor_research":
                result = await self._research_competitors(input_data)
            elif analysis_type == "pricing_analysis":
                result = await self._analyze_pricing(input_data)
            elif analysis_type == "threshold_setting":
                result = await self._set_profit_thresholds(input_data)
            else:  # comprehensive
                result = await self._comprehensive_analysis(input_data)
            
            return AgentOutput(
                agent_name=self.name,
                timestamp=datetime.now(),
                success=True,
                data=result,
                confidence=0.85,
                processing_time=0.0
            )
            
        except Exception as e:
            logger.error(f"Market intelligence processing failed: {str(e)}")
            return AgentOutput(
                agent_name=self.name,
                timestamp=datetime.now(),
                success=False,
                data={},
                confidence=0.0,
                processing_time=0.0,
                error_message=str(e)
            )
    
    async def _analyze_make_model(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze specific make and model for market opportunities."""
        make = input_data.get("make", "").title()
        model = input_data.get("model", "").title()
        location = input_data.get("location", "United States")
        
        # Analyze make popularity and demand
        make_score = self._calculate_make_score(make)
        model_score = self._calculate_model_score(make, model)
        
        # Market demand analysis
        demand_analysis = await self._analyze_market_demand(make, model, location)
        
        # Profit potential analysis
        profit_potential = await self._analyze_profit_potential(make, model, location)
        
        return {
            "make_model_analysis": {
                "make": make,
                "model": model,
                "location": location,
                "make_score": make_score,
                "model_score": model_score,
                "overall_score": (make_score + model_score) / 2,
                "demand_analysis": demand_analysis,
                "profit_potential": profit_potential,
                "recommendation": self._generate_make_model_recommendation(make_score, model_score, demand_analysis)
            }
        }
    
    async def _research_competitors(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Research competitors in the local area."""
        make = input_data.get("make", "").title()
        model = input_data.get("model", "").title()
        location = input_data.get("location", "United States")
        radius_miles = input_data.get("radius_miles", 50)
        
        # Simulate competitor research
        competitors = await self._find_competitors(make, model, location, radius_miles)
        
        # Analyze competitor pricing
        pricing_analysis = await self._analyze_competitor_pricing(competitors)
        
        # Market positioning
        market_position = await self._analyze_market_position(competitors, input_data.get("target_price"))
        
        return {
            "competitor_research": {
                "location": location,
                "radius_miles": radius_miles,
                "competitors_found": len(competitors),
                "competitors": competitors,
                "pricing_analysis": pricing_analysis,
                "market_position": market_position,
                "recommendations": self._generate_competitor_recommendations(competitors, pricing_analysis)
            }
        }
    
    async def _analyze_pricing(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze pricing trends and market data."""
        make = input_data.get("make", "").title()
        model = input_data.get("model", "").title()
        year = input_data.get("year")
        mileage = input_data.get("mileage")
        location = input_data.get("location", "United States")
        
        # Get market pricing data
        market_prices = await self._get_market_prices(make, model, year, mileage, location)
        
        # Analyze price trends
        price_trends = await self._analyze_price_trends(make, model, location)
        
        # Seasonal adjustments
        seasonal_factors = self._calculate_seasonal_factors()
        
        # Price recommendations
        price_recommendations = self._generate_price_recommendations(market_prices, price_trends, seasonal_factors)
        
        return {
            "pricing_analysis": {
                "make": make,
                "model": model,
                "year": year,
                "mileage": mileage,
                "location": location,
                "market_prices": market_prices,
                "price_trends": price_trends,
                "seasonal_factors": seasonal_factors,
                "price_recommendations": price_recommendations
            }
        }
    
    async def _set_profit_thresholds(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Set profitable thresholds for car flipping."""
        make = input_data.get("make", "").title()
        model = input_data.get("model", "").title()
        target_profit = input_data.get("target_profit", 2000)
        risk_tolerance = input_data.get("risk_tolerance", "medium")
        
        # Calculate acquisition thresholds
        acquisition_thresholds = await self._calculate_acquisition_thresholds(make, model, target_profit, risk_tolerance)
        
        # Calculate selling thresholds
        selling_thresholds = await self._calculate_selling_thresholds(make, model, target_profit, risk_tolerance)
        
        # Risk analysis
        risk_analysis = self._analyze_risk_factors(make, model, risk_tolerance)
        
        return {
            "profit_thresholds": {
                "make": make,
                "model": model,
                "target_profit": target_profit,
                "risk_tolerance": risk_tolerance,
                "acquisition_thresholds": acquisition_thresholds,
                "selling_thresholds": selling_thresholds,
                "risk_analysis": risk_analysis,
                "recommendations": self._generate_threshold_recommendations(acquisition_thresholds, selling_thresholds, risk_analysis)
            }
        }
    
    async def _comprehensive_analysis(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive market intelligence analysis."""
        # Run all analyses in parallel
        tasks = [
            self._analyze_make_model(input_data),
            self._research_competitors(input_data),
            self._analyze_pricing(input_data),
            self._set_profit_thresholds(input_data)
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Compile comprehensive report
        comprehensive_report = {
            "timestamp": datetime.now().isoformat(),
            "make_model_analysis": results[0] if not isinstance(results[0], Exception) else {"error": str(results[0])},
            "competitor_research": results[1] if not isinstance(results[1], Exception) else {"error": str(results[1])},
            "pricing_analysis": results[2] if not isinstance(results[2], Exception) else {"error": str(results[2])},
            "profit_thresholds": results[3] if not isinstance(results[3], Exception) else {"error": str(results[3])},
            "executive_summary": self._generate_executive_summary(results),
            "action_items": self._generate_action_items(results)
        }
        
        return comprehensive_report
    
    def _calculate_make_score(self, make: str) -> float:
        """Calculate popularity score for a make."""
        if make in self.popular_makes:
            return 0.8 + (self.popular_makes.index(make) * 0.01)
        return 0.5  # Average score for less popular makes
    
    def _calculate_model_score(self, make: str, model: str) -> float:
        """Calculate demand score for a specific model."""
        if make in self.high_demand_models and model in self.high_demand_models[make]:
            return 0.9
        return 0.6  # Average score for other models
    
    async def _analyze_market_demand(self, make: str, model: str, location: str) -> Dict[str, Any]:
        """Analyze market demand for a make/model combination."""
        # Simulate market demand analysis
        base_demand = 0.7
        if make in self.popular_makes:
            base_demand += 0.2
        if make in self.high_demand_models and model in self.high_demand_models[make]:
            base_demand += 0.1
        
        return {
            "demand_level": base_demand,
            "demand_category": "high" if base_demand > 0.8 else "medium" if base_demand > 0.6 else "low",
            "seasonal_variation": 0.1,
            "trend_direction": "stable"
        }
    
    async def _analyze_profit_potential(self, make: str, model: str, location: str) -> Dict[str, Any]:
        """Analyze profit potential for a make/model."""
        # Simulate profit potential analysis
        base_potential = 0.6
        if make in self.popular_makes:
            base_potential += 0.2
        if make in self.high_demand_models and model in self.high_demand_models[make]:
            base_potential += 0.2
        
        return {
            "profit_potential": base_potential,
            "potential_category": "high" if base_potential > 0.8 else "medium" if base_potential > 0.6 else "low",
            "estimated_profit_range": {
                "min": 1000,
                "max": 5000,
                "average": 2500
            },
            "risk_factors": ["market volatility", "seasonal changes"]
        }
    
    async def _find_competitors(self, make: str, model: str, location: str, radius_miles: int) -> List[Dict[str, Any]]:
        """Find competitors in the local area."""
        # Simulate competitor search
        competitors = []
        for i in range(5):  # Simulate 5 competitors
            competitors.append({
                "id": f"comp_{i}",
                "title": f"{make} {model} - Good Condition",
                "price": 15000 + (i * 500),
                "mileage": 50000 + (i * 10000),
                "year": 2018 + (i % 3),
                "location": f"{location} Area",
                "platform": "Facebook Marketplace" if i % 2 == 0 else "Craigslist",
                "days_listed": 3 + i,
                "condition": "Good" if i % 2 == 0 else "Excellent"
            })
        
        return competitors
    
    async def _analyze_competitor_pricing(self, competitors: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze competitor pricing patterns."""
        if not competitors:
            return {"error": "No competitors found"}
        
        prices = [comp["price"] for comp in competitors]
        avg_price = sum(prices) / len(prices)
        min_price = min(prices)
        max_price = max(prices)
        
        return {
            "average_price": avg_price,
            "price_range": {"min": min_price, "max": max_price},
            "price_distribution": {
                "low": len([p for p in prices if p < avg_price * 0.9]),
                "average": len([p for p in prices if avg_price * 0.9 <= p <= avg_price * 1.1]),
                "high": len([p for p in prices if p > avg_price * 1.1])
            },
            "pricing_strategy": "competitive" if len([p for p in prices if p < avg_price]) > len(prices) / 2 else "premium"
        }
    
    async def _analyze_market_position(self, competitors: List[Dict[str, Any]], target_price: Optional[float]) -> Dict[str, Any]:
        """Analyze market positioning relative to competitors."""
        if not competitors:
            return {"error": "No competitors found"}
        
        avg_competitor_price = sum(comp["price"] for comp in competitors) / len(competitors)
        
        if target_price:
            if target_price < avg_competitor_price * 0.9:
                position = "aggressive"
            elif target_price > avg_competitor_price * 1.1:
                position = "premium"
            else:
                position = "competitive"
        else:
            position = "unknown"
        
        return {
            "market_position": position,
            "average_competitor_price": avg_competitor_price,
            "price_difference": target_price - avg_competitor_price if target_price else None,
            "recommended_positioning": "competitive" if position == "unknown" else position
        }
    
    async def _get_market_prices(self, make: str, model: str, year: Optional[int], mileage: Optional[int], location: str) -> Dict[str, Any]:
        """Get market pricing data from various sources."""
        # Simulate market price data
        base_price = 15000
        if year:
            base_price += (year - 2015) * 500
        if mileage:
            base_price -= (mileage - 50000) * 0.1
        
        return {
            "kbb_value": base_price * 0.95,
            "edmunds_value": base_price * 1.02,
            "cargurus_value": base_price * 0.98,
            "market_average": base_price,
            "price_range": {
                "low": base_price * 0.85,
                "high": base_price * 1.15
            }
        }
    
    async def _analyze_price_trends(self, make: str, model: str, location: str) -> Dict[str, Any]:
        """Analyze price trends over time."""
        # Simulate price trend analysis
        return {
            "trend_direction": "stable",
            "trend_strength": 0.3,
            "seasonal_pattern": "summer_peak",
            "forecast": {
                "next_month": "stable",
                "next_quarter": "slight_increase",
                "next_year": "moderate_increase"
            }
        }
    
    def _calculate_seasonal_factors(self) -> Dict[str, float]:
        """Calculate seasonal adjustment factors."""
        current_month = datetime.now().month
        
        # Seasonal factors (1.0 = no adjustment)
        seasonal_factors = {
            "spring": 1.05,  # March-May
            "summer": 1.10,  # June-August
            "fall": 0.95,    # September-November
            "winter": 0.90   # December-February
        }
        
        if 3 <= current_month <= 5:
            current_season = "spring"
        elif 6 <= current_month <= 8:
            current_season = "summer"
        elif 9 <= current_month <= 11:
            current_season = "fall"
        else:
            current_season = "winter"
        
        return {
            "current_season": current_season,
            "adjustment_factor": seasonal_factors[current_season],
            "seasonal_factors": seasonal_factors
        }
    
    def _generate_price_recommendations(self, market_prices: Dict[str, Any], price_trends: Dict[str, Any], seasonal_factors: Dict[str, Any]) -> Dict[str, Any]:
        """Generate price recommendations based on market data."""
        avg_market_price = market_prices["market_average"]
        seasonal_adjustment = seasonal_factors["adjustment_factor"]
        
        return {
            "recommended_buy_price": avg_market_price * 0.85 * seasonal_adjustment,
            "recommended_sell_price": avg_market_price * 1.15 * seasonal_adjustment,
            "target_profit_margin": 0.20,
            "price_strategy": "market_based",
            "timing_recommendation": "buy_now" if seasonal_adjustment < 1.0 else "wait_for_seasonal_drop"
        }
    
    async def _calculate_acquisition_thresholds(self, make: str, model: str, target_profit: float, risk_tolerance: str) -> Dict[str, Any]:
        """Calculate maximum acquisition price thresholds."""
        # Simulate acquisition threshold calculation
        market_value = 15000  # Base market value
        
        risk_multipliers = {
            "low": 0.90,
            "medium": 0.85,
            "high": 0.80
        }
        
        max_acquisition = market_value * risk_multipliers.get(risk_tolerance, 0.85) - target_profit
        
        return {
            "max_acquisition_price": max_acquisition,
            "target_acquisition_price": max_acquisition * 0.95,
            "walk_away_price": max_acquisition * 1.05,
            "risk_tolerance": risk_tolerance
        }
    
    async def _calculate_selling_thresholds(self, make: str, model: str, target_profit: float, risk_tolerance: str) -> Dict[str, Any]:
        """Calculate minimum selling price thresholds."""
        # Simulate selling threshold calculation
        market_value = 15000  # Base market value
        
        min_selling = market_value + target_profit
        
        return {
            "min_selling_price": min_selling,
            "target_selling_price": min_selling * 1.05,
            "aspirational_price": min_selling * 1.15,
            "quick_sale_price": min_selling * 0.95
        }
    
    def _analyze_risk_factors(self, make: str, model: str, risk_tolerance: str) -> Dict[str, Any]:
        """Analyze risk factors for the make/model combination."""
        risk_factors = []
        risk_score = 0.5  # Base risk score
        
        if make not in self.popular_makes:
            risk_factors.append("less_popular_make")
            risk_score += 0.2
        
        if make in self.high_demand_models and model not in self.high_demand_models[make]:
            risk_factors.append("less_popular_model")
            risk_score += 0.1
        
        return {
            "risk_score": risk_score,
            "risk_level": "high" if risk_score > 0.7 else "medium" if risk_score > 0.4 else "low",
            "risk_factors": risk_factors,
            "mitigation_strategies": self._generate_risk_mitigation_strategies(risk_factors)
        }
    
    def _generate_risk_mitigation_strategies(self, risk_factors: List[str]) -> List[str]:
        """Generate strategies to mitigate identified risks."""
        strategies = []
        
        if "less_popular_make" in risk_factors:
            strategies.append("Focus on niche buyers and specialty markets")
            strategies.append("Consider longer holding period")
        
        if "less_popular_model" in risk_factors:
            strategies.append("Emphasize unique features and benefits")
            strategies.append("Target specific buyer demographics")
        
        return strategies
    
    def _generate_make_model_recommendation(self, make_score: float, model_score: float, demand_analysis: Dict[str, Any]) -> str:
        """Generate recommendation based on make/model analysis."""
        overall_score = (make_score + model_score) / 2
        
        if overall_score > 0.8 and demand_analysis["demand_category"] == "high":
            return "Excellent opportunity - High demand and strong market presence"
        elif overall_score > 0.6 and demand_analysis["demand_category"] in ["high", "medium"]:
            return "Good opportunity - Solid demand with manageable risk"
        else:
            return "Proceed with caution - Lower demand or higher risk factors"
    
    def _generate_competitor_recommendations(self, competitors: List[Dict[str, Any]], pricing_analysis: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on competitor analysis."""
        recommendations = []
        
        if len(competitors) < 3:
            recommendations.append("Limited competition - opportunity for premium pricing")
        elif len(competitors) > 10:
            recommendations.append("High competition - focus on competitive pricing and unique value proposition")
        
        if pricing_analysis.get("pricing_strategy") == "premium":
            recommendations.append("Market supports premium pricing - emphasize quality and features")
        else:
            recommendations.append("Competitive market - focus on value and quick turnover")
        
        return recommendations
    
    def _generate_threshold_recommendations(self, acquisition_thresholds: Dict[str, Any], selling_thresholds: Dict[str, Any], risk_analysis: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on threshold analysis."""
        recommendations = []
        
        if risk_analysis["risk_level"] == "high":
            recommendations.append("High risk deal - consider lower acquisition price or pass")
        elif risk_analysis["risk_level"] == "low":
            recommendations.append("Low risk deal - can be more aggressive with pricing")
        
        profit_margin = (selling_thresholds["target_selling_price"] - acquisition_thresholds["target_acquisition_price"]) / acquisition_thresholds["target_acquisition_price"]
        
        if profit_margin > 0.25:
            recommendations.append("High profit potential - prioritize this deal")
        elif profit_margin < 0.15:
            recommendations.append("Low profit margin - consider passing or negotiating better terms")
        
        return recommendations
    
    def _generate_executive_summary(self, results: List[Any]) -> Dict[str, Any]:
        """Generate executive summary from all analysis results."""
        # Extract key metrics from results
        make_model_score = 0.0
        competitor_count = 0
        avg_price = 0.0
        profit_potential = 0.0
        
        try:
            if hasattr(results[0], 'get') and results[0].get('make_model_analysis'):
                make_model_score = results[0]['make_model_analysis'].get('overall_score', 0.0)
        except:
            pass
        
        try:
            if hasattr(results[1], 'get') and results[1].get('competitor_research'):
                competitor_count = results[1]['competitor_research'].get('competitors_found', 0)
        except:
            pass
        
        try:
            if hasattr(results[2], 'get') and results[2].get('pricing_analysis'):
                avg_price = results[2]['pricing_analysis'].get('market_prices', {}).get('market_average', 0.0)
        except:
            pass
        
        try:
            if hasattr(results[3], 'get') and results[3].get('profit_thresholds'):
                profit_potential = results[3]['profit_thresholds'].get('target_profit', 0.0)
        except:
            pass
        
        return {
            "overall_score": make_model_score,
            "market_opportunity": "high" if make_model_score > 0.7 and competitor_count < 5 else "medium" if make_model_score > 0.5 else "low",
            "key_metrics": {
                "make_model_score": make_model_score,
                "competitor_count": competitor_count,
                "average_market_price": avg_price,
                "profit_potential": profit_potential
            },
            "recommendation": self._generate_overall_recommendation(make_model_score, competitor_count, profit_potential)
        }
    
    def _generate_overall_recommendation(self, make_model_score: float, competitor_count: int, profit_potential: float) -> str:
        """Generate overall recommendation based on all factors."""
        if make_model_score > 0.8 and competitor_count < 5 and profit_potential > 2000:
            return "STRONG BUY - Excellent opportunity with high profit potential and low competition"
        elif make_model_score > 0.6 and competitor_count < 8 and profit_potential > 1500:
            return "BUY - Good opportunity with solid profit potential"
        elif make_model_score > 0.5 and profit_potential > 1000:
            return "CONSIDER - Moderate opportunity, proceed with caution"
        else:
            return "PASS - Low opportunity or high risk factors"
    
    def _generate_action_items(self, results: List[Any]) -> List[str]:
        """Generate actionable items from analysis results."""
        action_items = []
        
        # Add action items based on analysis results
        action_items.append("Set up price alerts for target make/model combinations")
        action_items.append("Monitor competitor listings for pricing changes")
        action_items.append("Prepare negotiation strategy based on market analysis")
        action_items.append("Set up automated market monitoring")
        
        return action_items
    
    def get_capabilities(self) -> List[str]:
        """Return list of capabilities this agent provides."""
        return [
            "Make and model market analysis",
            "Competitor research and analysis",
            "Pricing trend analysis",
            "Profit threshold calculation",
            "Market opportunity identification",
            "Risk assessment and mitigation",
            "Seasonal market analysis",
            "Comprehensive market intelligence reporting"
        ] 