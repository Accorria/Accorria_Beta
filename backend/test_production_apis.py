#!/usr/bin/env python3
"""
Production API Test Script
Tests both chatbot and car analysis APIs to ensure they're ready for production
"""

import requests
import json
import time
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000"  # Change to production URL when testing production
API_BASE_URL = "https://quickflip-ai-backend-691352445702.us-central1.run.app"  # Production URL

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check PASSED")
            print(f"   Status: {data.get('status')}")
            print(f"   Service: {data.get('service')}")
            print(f"   Version: {data.get('version')}")
            return True
        else:
            print(f"❌ Health Check FAILED: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health Check ERROR: {e}")
        return False

def test_chatbot_api():
    """Test the chatbot API (similar to frontend implementation)"""
    print("\n🤖 Testing Chatbot API...")
    try:
        # Test the public chat endpoint (no auth required)
        chat_data = {
            "messages": [
                {"role": "user", "content": "Hello! I want to sell my 2019 Honda Civic. Can you help me?"}
            ]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/public-chat",
            json=chat_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ Chatbot API PASSED")
            print(f"   Response received successfully")
            return True
        else:
            print(f"❌ Chatbot API FAILED: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Chatbot API ERROR: {e}")
        return False

def test_car_analysis_api():
    """Test the car analysis API"""
    print("\n🚗 Testing Car Analysis API...")
    try:
        # Create a simple test image (1x1 pixel PNG)
        test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf6\x178U\x00\x00\x00\x00IEND\xaeB`\x82'
        
        # Test the public analysis endpoint (no auth required)
        files = {'images': ('test_car.png', test_image_data, 'image/png')}
        data = {
            'make': 'Honda',
            'model': 'Civic',
            'year': '2019',
            'mileage': '75000',
            'price': '18000'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/public-analyze-images",
            files=files,
            data=data,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Car Analysis API PASSED")
            print(f"   Analysis completed successfully")
            print(f"   Confidence Score: {result.get('confidence_score', 'N/A')}")
            print(f"   Processing Time: {result.get('processing_time', 'N/A')}s")
            return True
        else:
            print(f"❌ Car Analysis API FAILED: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Car Analysis API ERROR: {e}")
        return False

def test_production_endpoints():
    """Test production endpoints"""
    print("\n🌐 Testing Production Endpoints...")
    try:
        # Test production health check
        response = requests.get(f"{API_BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            print("✅ Production Health Check PASSED")
            return True
        else:
            print(f"❌ Production Health Check FAILED: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Production Health Check ERROR: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 QuickFlip MVP - Production API Test Suite")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_check),
        ("Chatbot API", test_chatbot_api),
        ("Car Analysis API", test_car_analysis_api),
        ("Production Endpoints", test_production_endpoints)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} ERROR: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Your APIs are ready for production!")
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
    
    return passed == total

if __name__ == "__main__":
    main()
