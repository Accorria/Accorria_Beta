#!/usr/bin/env python3
"""
Test script for QuickFlip AI live endpoints
Run this to test your deployed backend
"""

import requests
import json
from datetime import datetime

# Your live backend URL
BASE_URL = "https://quickflip-ai-backend-w6jnqqf33q-uc.a.run.app"

def test_health():
    """Test the health endpoint"""
    print("🏥 Testing Health Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Health check passed!")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_flip_car():
    """Test the flip car endpoint"""
    print("\n🚗 Testing Flip Car Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/flip-car-test", timeout=30)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Flip car test passed!")
            data = response.json()
            print(f"Agent: {data.get('agent', 'Unknown')}")
            print(f"Confidence: {data.get('confidence', 'Unknown')}")
            print(f"Status: {data.get('status', 'Unknown')}")
            if 'firestore' in data:
                print(f"Firestore: {data['firestore']}")
        else:
            print(f"❌ Flip car test failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_root():
    """Test the root endpoint"""
    print("\n🏠 Testing Root Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Root endpoint passed!")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Root endpoint failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Run all tests"""
    print("🧪 QuickFlip AI Live Endpoint Tests")
    print("=" * 50)
    print(f"Testing URL: {BASE_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 50)
    
    test_health()
    test_root()
    test_flip_car()
    
    print("\n" + "=" * 50)
    print("🏁 Tests completed!")
    print("\n📱 You can now test these endpoints from your phone:")
    print(f"   Health: {BASE_URL}/health")
    print(f"   Flip Car Test: {BASE_URL}/api/v1/flip-car-test")
    print(f"   Root: {BASE_URL}/")

if __name__ == "__main__":
    main() 