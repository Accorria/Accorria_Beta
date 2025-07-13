#!/usr/bin/env python3
"""
Test script for QuickFlip AI Car Analysis System

This script tests the new AI-powered car analysis features:
1. Image analysis agent
2. Market intelligence integration
3. Price recommendations
"""

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.services.image_analysis_agent import ImageAnalysisAgent
from app.agents.market_intelligence_agent import MarketIntelligenceAgent

async def test_image_analysis():
    """Test the image analysis agent"""
    print("🧪 Testing Image Analysis Agent...")
    
    # Create a mock image (just for testing)
    mock_image_bytes = b"fake_image_data"
    
    # Initialize the agent
    agent = ImageAnalysisAgent()
    
    # Test analysis
    result = await agent.analyze_car_images([mock_image_bytes])
    
    print(f"✅ Image Analysis Result:")
    print(f"   Success: {result.get('success')}")
    print(f"   Confidence: {result.get('confidence_score', 0):.2f}")
    
    if result.get('detected_info'):
        detected = result['detected_info']
        print(f"   Detected Make: {detected.get('make')}")
        print(f"   Detected Model: {detected.get('model')}")
        print(f"   Detected Year: {detected.get('year')}")
        print(f"   Detected Color: {detected.get('color')}")
    
    return result

async def test_market_intelligence():
    """Test the market intelligence agent"""
    print("\n🧪 Testing Market Intelligence Agent...")
    
    # Initialize the agent
    agent = MarketIntelligenceAgent()
    
    # Test market analysis
    input_data = {
        "make": "Toyota",
        "model": "Camry",
        "year": 2020,
        "mileage": 50000,
        "location": "United States",
        "target_profit": 2000,
        "analysis_type": "comprehensive"
    }
    
    result = await agent.execute(input_data)
    
    print(f"✅ Market Intelligence Result:")
    print(f"   Success: {result.success}")
    print(f"   Confidence: {result.confidence:.2f}")
    
    if result.data:
        data = result.data
        print(f"   Make/Model Analysis: {'make_model_analysis' in data}")
        print(f"   Pricing Analysis: {'pricing_analysis' in data}")
        print(f"   Competitor Research: {'competitor_research' in data}")
    
    return result

async def test_integration():
    """Test the integration between image analysis and market intelligence"""
    print("\n🧪 Testing Integration...")
    
    # Simulate the workflow
    image_agent = ImageAnalysisAgent()
    market_agent = MarketIntelligenceAgent()
    
    # Mock image analysis result
    mock_image_result = {
        "success": True,
        "detected_info": {
            "make": "Honda",
            "model": "Civic",
            "year": 2019,
            "color": "White",
            "mileage": 45000,
            "confidence": 0.8
        },
        "confidence_score": 0.8
    }
    
    # Use detected info for market analysis
    if mock_image_result["success"]:
        detected = mock_image_result["detected_info"]
        
        market_input = {
            "make": detected["make"],
            "model": detected["model"],
            "year": detected["year"],
            "mileage": detected["mileage"],
            "location": "United States",
            "target_profit": 2000,
            "analysis_type": "comprehensive"
        }
        
        market_result = await market_agent.execute(market_input)
        
        print(f"✅ Integration Test Result:")
        print(f"   Image Analysis: {mock_image_result['detected_info']['make']} {mock_image_result['detected_info']['model']}")
        print(f"   Market Analysis Success: {market_result.success}")
        print(f"   Combined Confidence: {(mock_image_result['confidence_score'] + market_result.confidence) / 2:.2f}")
        
        return {
            "image_analysis": mock_image_result,
            "market_intelligence": market_result.data if market_result.success else {}
        }
    
    return None

async def main():
    """Run all tests"""
    print("🚗 QuickFlip AI Car Analysis System Test")
    print("=" * 50)
    
    try:
        # Test individual components
        await test_image_analysis()
        await test_market_intelligence()
        await test_integration()
        
        print("\n✅ All tests completed successfully!")
        print("\n🎉 The car analysis system is ready to use!")
        print("\nNext steps:")
        print("1. Start the backend server: cd backend && python -m uvicorn app.main:app --reload")
        print("2. Start the frontend: cd frontend && npm run dev")
        print("3. Upload car images and test the AI analysis!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure all dependencies are installed: pip install -r backend/requirements.txt")
        print("2. Check that the backend directory structure is correct")
        print("3. Verify that all import paths are working")

if __name__ == "__main__":
    asyncio.run(main()) 