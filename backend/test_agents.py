#!/usr/bin/env python3
"""
Test script for QuickFlips.ai agents
"""

import asyncio
import sys
import os

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.agents import (
    DataExtractionAgent,
    PricingStrategyAgent,
    ContentGenerationAgent,
    VisualAgent,
    MarketIntelligenceAgent
)

async def test_data_extraction_agent():
    """Test the Data Extraction Agent"""
    print("🧪 Testing Data Extraction Agent...")
    
    agent = DataExtractionAgent()
    
    # Test case 1: Complete vehicle description
    test_input = {
        "text": "2014 Chevy Cruze, 148k miles, rebuilt title, good condition, black color"
    }
    
    result = await agent.process(test_input)
    
    if result.success:
        print("✅ Data Extraction Agent - SUCCESS")
        print(f"   Extracted: {result.data['extracted_data']}")
        print(f"   Confidence: {result.data['confidence_score']}")
        print(f"   Missing fields: {result.data['missing_fields']}")
    else:
        print("❌ Data Extraction Agent - FAILED")
        print(f"   Error: {result.data.get('error', 'Unknown error')}")

async def test_pricing_strategy_agent():
    """Test the Pricing Strategy Agent"""
    print("\n🧪 Testing Pricing Strategy Agent...")
    
    agent = PricingStrategyAgent()
    
    # Test case with vehicle data and market intelligence
    test_input = {
        "vehicle_data": {
            "year": 2014,
            "make": "chevrolet",
            "model": "cruze",
            "mileage": 148000,
            "condition": "good",
            "title_status": "rebuilt"
        },
        "market_intelligence": {
            "market_comps": [
                {"price": 12000, "year": 2014, "mileage": 150000},
                {"price": 13500, "year": 2014, "mileage": 140000},
                {"price": 11000, "year": 2014, "mileage": 160000}
            ],
            "demand_analysis": {"demand_level": "medium"},
            "price_trends": {"trend": "stable"}
        },
        "user_goals": "balanced"
    }
    
    result = await agent.process(test_input)
    
    if result.success:
        print("✅ Pricing Strategy Agent - SUCCESS")
        pricing = result.data['pricing_strategy']
        print(f"   Quick Sale: ${pricing['quick_sale']['price']:,}")
        print(f"   Market Price: ${pricing['market_price']['price']:,}")
        print(f"   Top Dollar: ${pricing['top_dollar']['price']:,}")
        
        flip_score = result.data['flip_score']
        print(f"   FlipScore: {flip_score['score']}/100")
        print(f"   Recommendation: {flip_score['recommendation']}")
    else:
        print("❌ Pricing Strategy Agent - FAILED")
        print(f"   Error: {result.data.get('error', 'Unknown error')}")

async def test_content_generation_agent():
    """Test the Content Generation Agent"""
    print("\n🧪 Testing Content Generation Agent...")
    
    agent = ContentGenerationAgent()
    
    # Test case with vehicle data and pricing strategy
    test_input = {
        "vehicle_data": {
            "year": 2014,
            "make": "chevrolet",
            "model": "cruze",
            "mileage": 148000,
            "condition": "good",
            "title_status": "rebuilt",
            "features": ["bluetooth", "backup camera", "alloy wheels"]
        },
        "pricing_strategy": {
            "market_price": {"price": 11500}
        },
        "platform": "facebook"
    }
    
    result = await agent.process(test_input)
    
    if result.success:
        print("✅ Content Generation Agent - SUCCESS")
        content = result.data['content']
        print(f"   Title: {content['title']}")
        print(f"   Description length: {content['content_length']['description_length']} chars")
        print(f"   Feature bullets: {len(content['feature_bullets'])} items")
        print(f"   SEO Score: {content['seo_optimized']['score']}/100")
    else:
        print("❌ Content Generation Agent - FAILED")
        print(f"   Error: {result.data.get('error', 'Unknown error')}")

async def test_visual_agent():
    """Test the Visual Agent (mock data)"""
    print("\n🧪 Testing Visual Agent...")
    
    agent = VisualAgent()
    
    # Test with mock image data
    test_input = {
        "image_data": b"mock_image_data",
        "car_info": {}
    }
    
    result = await agent.process(test_input)
    
    if result.success:
        print("✅ Visual Agent - SUCCESS")
        print(f"   Vision API used: {result.data.get('vision_api_used', False)}")
        print(f"   Processing time: {result.data.get('processing_time_seconds', 0):.2f}s")
    else:
        print("❌ Visual Agent - FAILED")
        print(f"   Error: {result.data.get('error', 'Unknown error')}")

async def test_market_intelligence_agent():
    """Test the Market Intelligence Agent"""
    print("\n🧪 Testing Market Intelligence Agent...")
    
    agent = MarketIntelligenceAgent()
    
    # Test case
    test_input = {
        "make": "chevrolet",
        "model": "cruze",
        "year": 2014,
        "mileage": 148000,
        "location": "United States",
        "target_profit": 2000,
        "analysis_type": "comprehensive"
    }
    
    result = await agent.execute(test_input)
    
    if result.success:
        print("✅ Market Intelligence Agent - SUCCESS")
        print(f"   Analysis type: {result.data.get('analysis_type', 'N/A')}")
        print(f"   Market data available: {bool(result.data.get('market_data', {}))}")
    else:
        print("❌ Market Intelligence Agent - FAILED")
        print(f"   Error: {result.data.get('error', 'Unknown error')}")

async def main():
    """Run all agent tests"""
    print("🚗 QuickFlips.ai Agent Testing Suite")
    print("=" * 50)
    
    try:
        await test_data_extraction_agent()
        await test_pricing_strategy_agent()
        await test_content_generation_agent()
        await test_visual_agent()
        await test_market_intelligence_agent()
        
        print("\n" + "=" * 50)
        print("🎉 All agent tests completed!")
        print("✅ Ready to build the complete workflow")
        
    except Exception as e:
        print(f"\n❌ Test suite failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
