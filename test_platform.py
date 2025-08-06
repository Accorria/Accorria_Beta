#!/usr/bin/env python3
"""
QuickFlip AI Platform Test Script
"""

import requests
import json

def test_backend():
    """Test backend API"""
    try:
        # Test health endpoint
        response = requests.get("https://quickflip-ai-backend-691352445702.us-central1.run.app/health", timeout=10)
        print(f"✅ Backend Health: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.text}")
        
        # Test registration
        data = {
            "email": "test@quickflip.ai",
            "password": "test123",
            "name": "Test User"
        }
        response = requests.post(
            "https://quickflip-ai-backend-691352445702.us-central1.run.app/api/v1/auth/register",
            json=data,
            timeout=10
        )
        print(f"✅ Registration: {response.status_code}")
        if response.status_code == 200:
            print(f"   Token: {response.json().get('access_token', 'N/A')[:20]}...")
            
    except Exception as e:
        print(f"❌ Backend Error: {e}")

def test_frontend():
    """Test frontend"""
    try:
        response = requests.get("https://quickflip-ai.vercel.app", timeout=10)
        print(f"✅ Frontend: {response.status_code}")
        if "QuickFlip AI" in response.text:
            print("   ✅ Landing page loaded correctly")
    except Exception as e:
        print(f"❌ Frontend Error: {e}")

if __name__ == "__main__":
    print("🚀 Testing QuickFlip AI Platform...")
    print("=" * 50)
    
    test_backend()
    test_frontend()
    
    print("=" * 50)
    print("🎯 Platform Status Check Complete!") 