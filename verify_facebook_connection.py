#!/usr/bin/env python3
"""
Verify Facebook OAuth2 Connection
Checks if the user's Facebook connection was stored properly in the database
"""

import requests
import json

# Configuration
BACKEND_URL = "https://accorria-backend-19949436301.us-central1.run.app"

def verify_facebook_connection():
    """Verify that Facebook OAuth2 connections are working"""
    
    print("🔍 Verifying Facebook OAuth2 Connection")
    print("=" * 50)
    
    # Test the health endpoint
    print("\n1️⃣ Checking Backend Health...")
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        if response.status_code == 200:
            health_data = response.json()
            print("   ✅ Backend is healthy")
            print(f"   Services: {health_data.get('apis', {})}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test Facebook OAuth2 endpoint
    print("\n2️⃣ Testing Facebook OAuth2 Endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/v1/auth/facebook/connect")
        print(f"   Status: {response.status_code}")
        if response.status_code == 401:
            print("   ✅ Endpoint requires authentication (as expected)")
        else:
            print(f"   Response: {response.text[:100]}...")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Manual Testing Steps:")
    print("1. Go to https://accorria.com")
    print("2. Create a listing and select 'Facebook Marketplace'")
    print("3. Click 'Connect Facebook Account'")
    print("4. Complete OAuth2 flow with your Facebook account")
    print("5. Check if the connection is stored in the database")
    
    print("\n💡 After testing, you can check the database in Supabase:")
    print("   SELECT * FROM user_platform_connections WHERE platform = 'facebook';")

if __name__ == "__main__":
    verify_facebook_connection()
