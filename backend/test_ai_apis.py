#!/usr/bin/env python3
"""
Test script for QuickFlip AI APIs

This script tests the OpenAI and Gemini APIs to ensure they're working correctly.
"""

import os
import asyncio
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_openai_api():
    """Test OpenAI API connection"""
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key or api_key == "your-openai-api-key-here":
        print("❌ OpenAI API key not configured")
        return False
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "user", "content": "Hello! Just testing the API connection."}
                    ],
                    "max_tokens": 50
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                print("✅ OpenAI API is working!")
                return True
            else:
                print(f"❌ OpenAI API error: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ OpenAI API test failed: {str(e)}")
        return False

async def test_gemini_api():
    """Test Gemini API connection using Google AI Studio"""
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key or api_key == "your-gemini-api-key-here":
        print("❌ Gemini API key not configured")
        return False
    
    try:
        # Try Google AI Studio API first
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent",
                headers={
                    "x-goog-api-key": api_key,
                    "Content-Type": "application/json"
                },
                json={
                    "contents": [{
                        "parts": [{
                            "text": "Hello! Just testing the API connection."
                        }]
                    }]
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                print("✅ Gemini API is working! (Google AI Studio)")
                return True
            elif response.status_code == 404:
                # Try with v1beta endpoint
                response = await client.post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
                    headers={
                        "x-goog-api-key": api_key,
                        "Content-Type": "application/json"
                    },
                    json={
                        "contents": [{
                            "parts": [{
                                "text": "Hello! Just testing the API connection."
                            }]
                        }]
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    print("✅ Gemini API is working! (v1beta)")
                    return True
                else:
                    print(f"❌ Gemini API error: {response.status_code} - {response.text}")
                    return False
            else:
                print(f"❌ Gemini API error: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Gemini API test failed: {str(e)}")
        return False

async def test_car_listing_generator():
    """Test the car listing generator service"""
    try:
        from app.services.car_listing_generator import CarListingGenerator
        
        generator = CarListingGenerator()
        
        # Test with sample data
        car_details = {
            "make": "Toyota",
            "model": "Camry",
            "year": 2020,
            "price": 25000,
            "mileage": 50000,
            "condition": "Good"
        }
        
        # Create a simple test image (1x1 pixel)
        test_image = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf5\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
        
        result = await generator.generate_car_listing([test_image], car_details)
        
        if result.get("success"):
            print("✅ Car listing generator is working!")
            return True
        else:
            print(f"❌ Car listing generator error: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Car listing generator test failed: {str(e)}")
        return False

async def main():
    """Run all tests"""
    print("🧪 QuickFlip AI API Tests")
    print("=" * 40)
    print()
    
    # Test individual APIs
    openai_working = await test_openai_api()
    print()
    
    gemini_working = await test_gemini_api()
    print()
    
    # Test car listing generator
    generator_working = await test_car_listing_generator()
    print()
    
    # Summary
    print("📊 Test Results:")
    print(f"   OpenAI API: {'✅ Working' if openai_working else '❌ Failed'}")
    print(f"   Gemini API: {'✅ Working' if gemini_working else '❌ Failed'}")
    print(f"   Car Listing Generator: {'✅ Working' if generator_working else '❌ Failed'}")
    print()
    
    if openai_working or gemini_working:
        print("🎉 AI features are ready to use!")
    else:
        print("⚠️  Please configure API keys to use AI features")

if __name__ == "__main__":
    asyncio.run(main()) 