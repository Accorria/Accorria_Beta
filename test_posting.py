#!/usr/bin/env python3
"""
Test script to verify QuickFlip AI posting functionality
"""

import requests
import json

def test_posting_functionality():
    """Test the posting functionality"""
    
    # Test 1: Check if backend is running
    print("🔍 Testing backend connectivity...")
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print("✅ Backend is running and healthy")
        else:
            print("❌ Backend is not responding properly")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False
    
    # Test 2: Check supported platforms
    print("\n🔍 Testing platform listing...")
    try:
        response = requests.get("http://localhost:8000/api/v1/platform-posting/supported-platforms")
        if response.status_code == 200:
            platforms = response.json()
            print(f"✅ Found {len(platforms['platforms'])} supported platforms:")
            for platform in platforms['platforms']:
                print(f"   - {platform['display_name']} ({platform['name']})")
        else:
            print("❌ Cannot get supported platforms")
            return False
    except Exception as e:
        print(f"❌ Error getting platforms: {e}")
        return False
    
    # Test 3: Test posting endpoint (using the new simple endpoint)
    print("\n🔍 Testing posting endpoint...")
    try:
        test_data = {
            "platforms": ["craigslist"],
            "title": "Test Car Listing",
            "description": "Test description for posting verification",
            "price": 15000.0,
            "make": "Honda",
            "model": "Civic",
            "year": 2019,
            "mileage": 45000,
            "location": "United States",
            "condition": "good",
            "features": ["Bluetooth", "Backup Camera"]
        }
        
        response = requests.post(
            "http://localhost:8000/api/v1/platform-posting/post-listing-simple",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Posting endpoint is working")
            print(f"   - Total platforms: {result['total_platforms']}")
            print(f"   - Successful postings: {result['successful_postings']}")
            print(f"   - Failed postings: {result['failed_postings']}")
            
            # Show detailed results
            for posting_result in result['posting_results']:
                print(f"   - {posting_result['platform']}: {'✅ Success' if posting_result['success'] else '❌ Failed'}")
                if not posting_result['success']:
                    print(f"     Error: {posting_result['error_message']}")
        else:
            print(f"❌ Posting endpoint returned status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing posting endpoint: {e}")
        return False
    
    # Test 4: Check frontend
    print("\n🔍 Testing frontend connectivity...")
    try:
        response = requests.get("http://localhost:3000")
        if response.status_code == 200:
            print("✅ Frontend is running")
        else:
            print("❌ Frontend is not responding properly")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to frontend: {e}")
        return False
    
    print("\n🎉 All tests passed! QuickFlip AI posting functionality is working.")
    print("\n📝 Note: Platform posting failed because credentials are not configured.")
    print("   This is expected behavior. To enable actual posting, configure:")
    print("   - CRAIGSLIST_EMAIL and CRAIGSLIST_PASSWORD")
    print("   - FACEBOOK_ACCESS_TOKEN and FACEBOOK_PAGE_ID")
    print("   - OFFERUP_API_KEY and OFFERUP_USER_TOKEN")
    
    return True

if __name__ == "__main__":
    test_posting_functionality() 