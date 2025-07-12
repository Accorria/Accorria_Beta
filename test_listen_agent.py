#!/usr/bin/env python3
"""
Test script for QuickFlip AI Listening Agent
"""

import asyncio
import json
from backend.app.services.listen_agent import CarDetails, run_listen_agent

async def test_listen_agent():
    """Test the listening agent with sample car data"""
    
    print("🚗 Testing QuickFlip AI Listening Agent...")
    print("=" * 50)
    
    # Test car data
    test_cars = [
        CarDetails(
            year=2017,
            make="Chevrolet",
            model="Impala",
            mileage=160000,
            condition="good",
            features=["Bluetooth", "Backup Camera", "Leather Seats"]
        ),
        CarDetails(
            year=2020,
            make="Honda",
            model="Civic",
            mileage=45000,
            condition="excellent",
            features=["Apple CarPlay", "Android Auto", "Lane Assist"]
        ),
        CarDetails(
            year=2015,
            make="Toyota",
            model="Camry",
            mileage=120000,
            condition="fair",
            features=["Bluetooth", "Cruise Control"]
        )
    ]
    
    for i, car in enumerate(test_cars, 1):
        print(f"\n📋 Test {i}: {car.year} {car.make} {car.model}")
        print("-" * 30)
        
        try:
            # Run the listening agent
            result = await run_listen_agent(car)
            
            if result["success"]:
                print("✅ Agent processing successful!")
                
                # Display results
                car_desc = result["car_description"]
                market = result["market_analysis"]
                listing = result["listing_draft"]
                negotiation = result["negotiation_analysis"]
                
                print(f"📝 Car Description: {car_desc['description']}")
                print(f"💰 Estimated Price: ${market.estimated_price:,.0f}")
                print(f"📊 Market Range: ${market.market_range[0]:,.0f} - ${market.market_range[1]:,.0f}")
                print(f"🎯 Suggested Price: ${listing.suggested_price:,.0f}")
                print(f"💬 Negotiation Range: ${negotiation['min_acceptable_price']:,.0f} - ${negotiation['max_target_price']:,.0f}")
                print(f"📈 Market Trend: {market.market_trend}")
                print(f"🎯 Strategy: {negotiation['recommended_strategy']}")
                
            else:
                print(f"❌ Agent processing failed: {result['error']}")
                
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Listening Agent Test Complete!")

if __name__ == "__main__":
    asyncio.run(test_listen_agent()) 