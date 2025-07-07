#!/usr/bin/env python3
"""
Test script for QuickFlip AI's Left Brain / Right Brain system

This demonstrates how the AI brain orchestrator chooses between OpenAI (left brain)
and Google Gemini (right brain) based on the task type.
"""

import asyncio
import os
from ai_brain import create_ai_brain

async def test_ai_brain():
    """Test the AI brain system with different types of tasks"""
    
    # Initialize the AI brain (you'll need to set these environment variables)
    ai_brain = create_ai_brain(
        openai_key=os.getenv("OPENAI_API_KEY", "your-openai-api-key"),
        google_key=os.getenv("GOOGLE_API_KEY", "your-google-api-key")
    )
    
    print("🧠 QuickFlip AI Brain Test")
    print("=" * 50)
    
    # Check brain status
    status = ai_brain.get_brain_status()
    print(f"Left Brain (OpenAI) Available: {status['left_brain_available']}")
    print(f"Right Brain (Google) Available: {status['right_brain_available']}")
    print()
    
    if not status['left_brain_available'] and not status['right_brain_available']:
        print("❌ No AI brains are available!")
        print("Please set your OPENAI_API_KEY and GOOGLE_API_KEY environment variables")
        return
    
    # Test 1: Analytical Task (Should use Left Brain)
    print("🔍 Test 1: Analytical Task (Left Brain)")
    print("-" * 40)
    try:
        response = await ai_brain.think(
            prompt="Analyze the market value of a 2018 Honda Civic with 45,000 miles",
            task_type="analytical"
        )
        print(f"Brain Used: {response.brain_type.value}")
        print(f"Model: {response.model_used}")
        print(f"Response: {response.content[:200]}...")
        print(f"Confidence: {response.confidence}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        print()
    
    # Test 2: Creative Task (Should use Right Brain)
    print("🎨 Test 2: Creative Task (Right Brain)")
    print("-" * 40)
    try:
        response = await ai_brain.think(
            prompt="Write a friendly message to a potential buyer who asked about the car's history",
            task_type="creative"
        )
        print(f"Brain Used: {response.brain_type.value}")
        print(f"Model: {response.model_used}")
        print(f"Response: {response.content[:200]}...")
        print(f"Confidence: {response.confidence}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        print()
    
    # Test 3: Customer Service Task (Should use Right Brain)
    print("💬 Test 3: Customer Service (Right Brain)")
    print("-" * 40)
    try:
        response = await ai_brain.think(
            prompt="A buyer says 'Is this car still available? I'm very interested!'",
            task_type="customer_service"
        )
        print(f"Brain Used: {response.brain_type.value}")
        print(f"Model: {response.model_used}")
        print(f"Response: {response.content[:200]}...")
        print(f"Confidence: {response.confidence}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        print()
    
    # Test 4: Dual Think (Both Brains)
    print("🧠 Test 4: Dual Think (Both Brains)")
    print("-" * 40)
    try:
        responses = await ai_brain.dual_think(
            prompt="What's the best way to price a used car for maximum profit?"
        )
        
        for brain_name, response in responses.items():
            print(f"{brain_name.upper()} BRAIN:")
            print(f"  Model: {response.model_used}")
            print(f"  Response: {response.content[:150]}...")
            print(f"  Confidence: {response.confidence}")
            print()
    except Exception as e:
        print(f"Error: {e}")
        print()
    
    # Test 5: Car Listing Analysis
    print("🚗 Test 5: Car Listing Analysis")
    print("-" * 40)
    try:
        listing_context = {
            "title": "2018 Honda Civic EX",
            "description": "Excellent condition, one owner, clean title. Great fuel economy.",
            "price": 18500,
            "mileage": 45000
        }
        
        response = await ai_brain.think(
            prompt="Analyze this listing for pricing strategy and market positioning",
            task_type="analytical",
            context=listing_context
        )
        print(f"Brain Used: {response.brain_type.value}")
        print(f"Model: {response.model_used}")
        print(f"Analysis: {response.content[:300]}...")
        print(f"Confidence: {response.confidence}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        print()

if __name__ == "__main__":
    # Run the test
    asyncio.run(test_ai_brain()) 