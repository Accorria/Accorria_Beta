#!/usr/bin/env python3
"""
Test script for platform posting integrations
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.services.platform_poster import PlatformPoster, ListingData
from app.services.facebook_marketplace import get_facebook_config
from app.services.craigslist_poster import get_craigslist_config

async def test_platform_posting():
    """Test the platform posting functionality"""
    
    print("🚀 Testing Platform Posting Integrations")
    print("=" * 50)
    
    # Check configurations
    print("\n📋 Checking API Configurations:")
    
    facebook_config = get_facebook_config()
    if facebook_config:
        print("✅ Facebook Marketplace API configured")
        print(f"   - Page ID: {facebook_config['page_id']}")
        print(f"   - Access Token: {'*' * 10}...{facebook_config['access_token'][-4:]}")
    else:
        print("❌ Facebook Marketplace API not configured")
        print("   Set FACEBOOK_ACCESS_TOKEN and FACEBOOK_PAGE_ID environment variables")
    
    craigslist_config = get_craigslist_config()
    if craigslist_config:
        print("✅ Craigslist API configured")
        print(f"   - Email: {craigslist_config['email']}")
        print(f"   - Password: {'*' * len(craigslist_config['password'])}")
    else:
        print("❌ Craigslist API not configured")
        print("   Set CRAIGSLIST_EMAIL and CRAIGSLIST_PASSWORD environment variables")
    
    # Create test listing data
    test_listing = ListingData(
        title="2020 Toyota Camry - Clean, Well Maintained",
        description="Excellent condition 2020 Toyota Camry with only 45,000 miles. Clean title, no accidents, regular maintenance. Perfect for daily commuting or family use. Features include Bluetooth, backup camera, and great fuel economy.",
        price=18500.0,
        make="Toyota",
        model="Camry",
        year=2020,
        mileage=45000,
        images=[],  # No images for testing
        location="United States",
        condition="good",
        features=["Bluetooth", "Backup Camera", "Clean Title"]
    )
    
    print(f"\n📝 Test Listing Data:")
    print(f"   - Title: {test_listing.title}")
    print(f"   - Price: ${test_listing.price:,.2f}")
    print(f"   - Make/Model: {test_listing.year} {test_listing.make} {test_listing.model}")
    print(f"   - Mileage: {test_listing.mileage:,} miles")
    
    # Test platform poster
    print(f"\n🔄 Testing Platform Poster:")
    
    platform_poster = PlatformPoster()
    
    # Test with available platforms
    available_platforms = []
    if facebook_config:
        available_platforms.append("facebook_marketplace")
    if craigslist_config:
        available_platforms.append("craigslist")
    
    if not available_platforms:
        print("❌ No platforms configured for testing")
        print("   Please configure at least one platform API")
        return
    
    print(f"   Testing platforms: {', '.join(available_platforms)}")
    
    try:
        results = await platform_poster.post_listing(test_listing, available_platforms)
        
        print(f"\n📊 Posting Results:")
        for result in results:
            platform = result.platform
            success = result.success
            
            if success:
                print(f"   ✅ {platform}: SUCCESS")
                print(f"      - Listing ID: {result.listing_id}")
                print(f"      - URL: {result.url}")
                print(f"      - Posted at: {result.posted_at}")
            else:
                print(f"   ❌ {platform}: FAILED")
                print(f"      - Error: {result.error_message}")
                
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
    
    print(f"\n🎯 Test Summary:")
    print(f"   - Platforms tested: {len(available_platforms)}")
    print(f"   - Successful postings: {len([r for r in results if r.success])}")
    print(f"   - Failed postings: {len([r for r in results if not r.success])}")

async def test_individual_platforms():
    """Test individual platform integrations"""
    
    print("\n🔧 Testing Individual Platform Integrations")
    print("=" * 50)
    
    # Test Facebook Marketplace
    print("\n📘 Testing Facebook Marketplace:")
    facebook_config = get_facebook_config()
    if facebook_config:
        try:
            from app.services.facebook_marketplace import FacebookMarketplaceAPI, FacebookListingData
            
            fb_api = FacebookMarketplaceAPI(
                access_token=facebook_config["access_token"],
                page_id=facebook_config["page_id"]
            )
            
            # Test API connection
            async with fb_api as api:
                # Test getting page info
                url = f"{fb_api.api_base_url}/{fb_api.page_id}"
                params = {"access_token": fb_api.access_token, "fields": "name,id"}
                
                if not fb_api.session:
                    raise RuntimeError("Session not initialized")
                    
                async with fb_api.session.get(url, params=params) as response:
                    if response.status == 200:
                        page_info = await response.json()
                        print(f"   ✅ Connected to Facebook Page: {page_info.get('name', 'Unknown')}")
                    else:
                        print(f"   ❌ Failed to connect to Facebook Page: {response.status}")
                        
        except Exception as e:
            print(f"   ❌ Facebook API test failed: {str(e)}")
    else:
        print("   ⚠️  Facebook API not configured")
    
    # Test Craigslist
    print("\n📋 Testing Craigslist:")
    craigslist_config = get_craigslist_config()
    if craigslist_config:
        try:
            from app.services.craigslist_poster import CraigslistPoster
            
            cl_poster = CraigslistPoster(
                email=craigslist_config["email"],
                password=craigslist_config["password"]
            )
            
            # Test connection to Craigslist
            async with cl_poster as api:
                if not api.session:
                    raise RuntimeError("Session not initialized")
                    
                async with api.session.get("https://www.craigslist.org") as response:
                    if response.status == 200:
                        print("   ✅ Connected to Craigslist")
                    else:
                        print(f"   ❌ Failed to connect to Craigslist: {response.status}")
                        
        except Exception as e:
            print(f"   ❌ Craigslist test failed: {str(e)}")
    else:
        print("   ⚠️  Craigslist not configured")

if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run tests
    asyncio.run(test_platform_posting())
    asyncio.run(test_individual_platforms())
    
    print("\n✨ Testing complete!")
    print("\n📝 Next Steps:")
    print("   1. Configure your platform API credentials in .env file")
    print("   2. Test with real listings")
    print("   3. Monitor posting results and errors")
    print("   4. Implement error handling and retry logic") 