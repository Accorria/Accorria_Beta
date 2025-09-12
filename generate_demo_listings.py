#!/usr/bin/env python3
"""
Generate demo listings for Accorria car analysis system
"""

import requests
import json
import os
from pathlib import Path

def test_car_analysis(image_path, car_data):
    """Test car analysis with given image and data"""
    
    print(f"\n🖼️  Testing with image: {image_path}")
    
    # Check if image exists
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return None
    
    # Get image size
    image_size = os.path.getsize(image_path) / (1024 * 1024)  # MB
    print(f"📏 Image size: {image_size:.1f} MB")
    
    # Prepare the request
    backend_url = "http://localhost:8000"
    endpoint = f"{backend_url}/analyze-car"
    
    print(f"📡 Backend URL: {backend_url}")
    print("🚀 Sending request to car listing generator...")
    
    # Prepare data
    data = {
        "make": car_data["make"],
        "model": car_data["model"], 
        "year": car_data["year"],
        "mileage": car_data["mileage"],
        "location": car_data["location"],
        "title_status": car_data["title_status"],
        "description": car_data["description"]
    }
    
    print(f"📊 Data being sent: {data}")
    
    try:
        # Send request
        with open(image_path, 'rb') as image_file:
            files = {'image': image_file}
            
            import time
            start_time = time.time()
            
            response = requests.post(endpoint, data=data, files=files, timeout=30)
            
            processing_time = time.time() - start_time
            print(f"⏱️  Processing time: {processing_time:.1f} seconds")
            print(f"📊 Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Success! Car analysis results:")
                print(json.dumps(result, indent=2))
                
                # Extract key info
                if "image_analysis" in result:
                    analysis = result["image_analysis"]
                    print(f"\n🔍 Car Analysis Summary:")
                    print(f"   Make: {analysis.get('make', 'Unknown')}")
                    print(f"   Model: {analysis.get('model', 'Unknown')}")
                    print(f"   Year: {analysis.get('year', 'Unknown')}")
                    print(f"   Condition: {analysis.get('condition', 'Unknown')}")
                    print(f"   Features: {analysis.get('features', [])}")
                
                if "pricing_recommendations" in result:
                    pricing = result["pricing_recommendations"]
                    print(f"\n💰 Pricing Recommendations:")
                    print(f"   market_low: {pricing.get('market_low', 'Unknown')}")
                    print(f"   market_high: {pricing.get('market_high', 'Unknown')}")
                    print(f"   recommended_price: {pricing.get('recommended_price', 'Unknown')}")
                    print(f"   listing_price: {pricing.get('listing_price', 'Unknown')}")
                    print(f"   negotiation_room: {pricing.get('negotiation_room', 'Unknown')}")
                    print(f"   pricing_strategy: {pricing.get('pricing_strategy', 'Unknown')}")
                
                return result
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"Response: {response.text}")
                return None
                
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return None

def main():
    """Generate demo listings for different cars"""
    
    print("🚗 ACCORRIA DEMO LISTING GENERATOR")
    print("=" * 50)
    
    # Demo car data
    demo_cars = [
        {
            "image": "frontend/public/pic1.jpg",
            "data": {
                "make": "Honda",
                "model": "Civic", 
                "year": "2019",
                "mileage": "45000",
                "location": "Detroit, MI",
                "title_status": "clean",
                "description": "Please analyze this Honda Civic and provide details"
            }
        },
        {
            "image": "frontend/public/pic2.jpg", 
            "data": {
                "make": "Toyota",
                "model": "Camry",
                "year": "2017", 
                "mileage": "78000",
                "location": "Detroit, MI",
                "title_status": "clean",
                "description": "Please analyze this Toyota Camry and provide details"
            }
        },
        {
            "image": "frontend/public/pic3.jpg",
            "data": {
                "make": "Ford",
                "model": "F-150",
                "year": "2015",
                "mileage": "120000", 
                "location": "Detroit, MI",
                "title_status": "clean",
                "description": "Please analyze this Ford F-150 and provide details"
            }
        }
    ]
    
    results = []
    
    for i, car in enumerate(demo_cars, 1):
        print(f"\n{'='*20} DEMO {i} {'='*20}")
        
        result = test_car_analysis(car["image"], car["data"])
        if result:
            results.append({
                "demo": i,
                "car": car["data"],
                "result": result
            })
    
    print(f"\n{'='*50}")
    print(f"🎉 DEMO GENERATION COMPLETE!")
    print(f"✅ Generated {len(results)} successful demo listings")
    print(f"📊 Ready to show {len(results)} different car examples")
    
    # Save results to file
    output_file = "demo_listings_results.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"💾 Results saved to: {output_file}")
    print(f"🚀 Ready to demo to 100 people!")

if __name__ == "__main__":
    main()
