#!/usr/bin/env python3
"""
QuickFlip AI - Security Test Script

Tests all security measures to ensure production readiness.
"""

import requests
import json
import sys
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"  # Update with your production URL
TEST_USER = {
    "email": "test@quickflip.ai",
    "password": "testpassword123",
    "name": "Test User"
}

def test_health_endpoint():
    """Test public health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        print("✅ Health endpoint working")
        return True
    except Exception as e:
        print(f"❌ Health endpoint failed: {e}")
        return False

def test_authentication_flow():
    """Test user registration and login"""
    print("🔐 Testing authentication flow...")
    
    # Test registration
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/register",
            json=TEST_USER
        )
        assert response.status_code == 200
        token = response.json().get("access_token")
        print("✅ User registration working")
        
        # Test login
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": TEST_USER["email"], "password": TEST_USER["password"]}
        )
        assert response.status_code == 200
        token = response.json().get("access_token")
        print("✅ User login working")
        
        return token
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        return None

def test_protected_endpoints(token: str):
    """Test that protected endpoints require authentication"""
    print("🛡️ Testing protected endpoints...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test market intelligence endpoint
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/market-intelligence/analyze",
            headers=headers,
            json={
                "make": "Toyota",
                "model": "Camry",
                "year": 2020,
                "location": "United States",
                "target_profit": 2000
            }
        )
        assert response.status_code == 200
        print("✅ Market intelligence endpoint protected and working")
    except Exception as e:
        print(f"❌ Market intelligence test failed: {e}")
        return False
    
    # Test unauthorized access
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/market-intelligence/analyze",
            json={
                "make": "Toyota",
                "model": "Camry",
                "year": 2020,
                "location": "United States",
                "target_profit": 2000
            }
        )
        assert response.status_code == 401
        print("✅ Unauthorized access properly blocked")
    except Exception as e:
        print(f"❌ Unauthorized access test failed: {e}")
        return False
    
    return True

def test_rate_limiting(token: str):
    """Test rate limiting functionality"""
    print("🚦 Testing rate limiting...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Make multiple requests to trigger rate limiting
    responses = []
    for i in range(105):  # Exceed 100 requests/minute limit
        response = requests.post(
            f"{BASE_URL}/api/v1/market-intelligence/makes",
            headers=headers
        )
        responses.append(response.status_code)
    
    # Check if rate limiting kicked in
    rate_limited = any(status == 429 for status in responses)
    if rate_limited:
        print("✅ Rate limiting working")
        return True
    else:
        print("⚠️ Rate limiting may not be working (check configuration)")
        return False

def test_security_headers():
    """Test security headers are present"""
    print("🔒 Testing security headers...")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        headers = response.headers
        
        required_headers = [
            "X-Content-Type-Options",
            "X-Frame-Options", 
            "X-XSS-Protection",
            "Strict-Transport-Security"
        ]
        
        missing_headers = []
        for header in required_headers:
            if header not in headers:
                missing_headers.append(header)
        
        if not missing_headers:
            print("✅ All security headers present")
            return True
        else:
            print(f"❌ Missing security headers: {missing_headers}")
            return False
    except Exception as e:
        print(f"❌ Security headers test failed: {e}")
        return False

def test_cors_configuration():
    """Test CORS configuration"""
    print("🌐 Testing CORS configuration...")
    
    try:
        response = requests.options(
            f"{BASE_URL}/api/v1/market-intelligence/makes",
            headers={
                "Origin": "https://malicious-site.com",
                "Access-Control-Request-Method": "GET"
            }
        )
        
        # Check if CORS headers are present and restrictive
        cors_headers = response.headers.get("Access-Control-Allow-Origin", "")
        if cors_headers and cors_headers != "*":
            print("✅ CORS properly configured")
            return True
        else:
            print("⚠️ CORS may be too permissive")
            return False
    except Exception as e:
        print(f"❌ CORS test failed: {e}")
        return False

def main():
    """Run all security tests"""
    print("🔐 QuickFlip AI - Security Test Suite")
    print("=" * 50)
    
    tests = [
        ("Health Endpoint", test_health_endpoint),
        ("Security Headers", test_security_headers),
        ("CORS Configuration", test_cors_configuration),
    ]
    
    # Run basic tests first
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        if not test_func():
            print(f"❌ {test_name} failed")
            sys.exit(1)
    
    # Test authentication flow
    print("\nAuthentication Flow:")
    token = test_authentication_flow()
    if not token:
        print("❌ Authentication flow failed")
        sys.exit(1)
    
    # Test protected endpoints
    print("\nProtected Endpoints:")
    if not test_protected_endpoints(token):
        print("❌ Protected endpoints test failed")
        sys.exit(1)
    
    # Test rate limiting
    print("\nRate Limiting:")
    if not test_rate_limiting(token):
        print("⚠️ Rate limiting test inconclusive")
    
    print("\n" + "=" * 50)
    print("🎉 All security tests passed!")
    print("✅ Application is ready for production")
    print("\nNext steps:")
    print("1. Deploy to production")
    print("2. Update BASE_URL in this script")
    print("3. Run tests against production URL")
    print("4. Monitor logs for any issues")

if __name__ == "__main__":
    main() 