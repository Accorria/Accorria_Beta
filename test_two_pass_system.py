#!/usr/bin/env python3
"""
Test script for the two-pass AI analysis system
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

async def test_two_pass_system():
    """Test the two-pass analysis system"""
    
    # Set up environment
    os.environ['OPENAI_API_KEY'] = 'your-openai-api-key-here'  # Replace with actual key
    
    try:
        from app.services.enhanced_image_analysis import EnhancedImageAnalyzer
        
        # Create analyzer instance
        analyzer = EnhancedImageAnalyzer()
        print("✅ EnhancedImageAnalyzer initialized successfully")
        
        # Test data
        car_details = {
            "year": "2020",
            "make": "Honda",
            "model": "Civic",
            "trim": "EX",
            "mileage": "45000",
            "price": "18000",
            "titleStatus": "clean",
            "aboutVehicle": "Well maintained, one owner"
        }
        
        # Mock image bytes (you would replace this with actual image data)
        mock_image_bytes = [b"fake_image_data"]
        
        print("🔄 Testing two-pass analysis...")
        result = await analyzer.analyze_car_images(mock_image_bytes, car_details)
        
        print("✅ Two-pass analysis completed!")
        print(f"Success: {result.get('success', False)}")
        print(f"Post text length: {len(result.get('post_text', ''))}")
        print(f"Cover photo index: {result.get('cover_photo_index', 0)}")
        
        if result.get('extracted'):
            extracted = result['extracted']
            if extracted.get('detected'):
                detected = extracted['detected']
                print(f"Detected make: {detected.get('make', {}).get('value', 'None')}")
                print(f"Detected model: {detected.get('model', {}).get('value', 'None')}")
                print(f"Features detected: {detected.get('features', {})}")
        
        return result
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return None

if __name__ == "__main__":
    print("🧪 Testing Two-Pass AI Analysis System")
    print("=" * 50)
    
    result = asyncio.run(test_two_pass_system())
    
    if result:
        print("\n✅ Test completed successfully!")
        print("\n📝 Sample output:")
        print("-" * 30)
        print(result.get('post_text', 'No post text generated'))
    else:
        print("\n❌ Test failed!")
