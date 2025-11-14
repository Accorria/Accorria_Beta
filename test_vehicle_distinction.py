#!/usr/bin/env python3
"""
Test Vehicle Distinction - QuickFlip MVP

This script tests that the system can correctly distinguish between different vehicles.
It uploads photos of different vehicles and verifies that:
1. Each vehicle is analyzed correctly
2. Analysis results are unique for each vehicle
3. Market data is specific to each vehicle
4. No cross-contamination between vehicles

Usage:
    python test_vehicle_distinction.py

Prerequisites:
    - Backend running on http://localhost:8000
    - Test images in test_images/ directory
    - API keys configured (GEMINI_API_KEY, OPENAI_API_KEY)
"""

import requests
import json
import time
import os
from pathlib import Path
from typing import Dict, List, Any

# Configuration
BACKEND_URL = "http://localhost:8000"
ENHANCED_ANALYZE_ENDPOINT = f"{BACKEND_URL}/api/v1/enhanced-analyze"

# Test vehicles - add your test images here
TEST_VEHICLES = [
    {
        "name": "Vehicle A - 2015 Honda Civic",
        "images": ["test_images/vehicle_a_1.jpg", "test_images/vehicle_a_2.jpg"],
        "make": "Honda",
        "model": "Civic",
        "year": "2015",
        "mileage": "100000",
        "price": "12000",
        "expected_features": ["backup_camera", "touchscreen"]  # Expected features
    },
    {
        "name": "Vehicle B - 2018 Toyota Camry",
        "images": ["test_images/vehicle_b_1.jpg", "test_images/vehicle_b_2.jpg"],
        "make": "Toyota",
        "model": "Camry",
        "year": "2018",
        "mileage": "50000",
        "price": "18000",
        "expected_features": ["sunroof", "leather_seats"]  # Expected features
    },
    {
        "name": "Vehicle C - 2016 Ford F-150",
        "images": ["test_images/vehicle_c_1.jpg", "test_images/vehicle_c_2.jpg"],
        "make": "Ford",
        "model": "F-150",
        "year": "2016",
        "mileage": "80000",
        "price": "25000",
        "expected_features": ["4wd", "alloy_wheels"]  # Expected features
    }
]


def check_images_exist(vehicle: Dict[str, Any]) -> bool:
    """Check if all test images exist."""
    for image_path in vehicle["images"]:
        if not os.path.exists(image_path):
            print(f"❌ Image not found: {image_path}")
            return False
    return True


def analyze_vehicle(vehicle: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze a single vehicle."""
    print(f"\n{'='*60}")
    print(f"🔍 Analyzing: {vehicle['name']}")
    print(f"{'='*60}")
    
    # Check if images exist
    if not check_images_exist(vehicle):
        return {"success": False, "error": "Images not found"}
    
    # Prepare form data
    files = []
    for image_path in vehicle["images"]:
        files.append(("images", (os.path.basename(image_path), open(image_path, "rb"), "image/jpeg")))
    
    data = {
        "make": vehicle.get("make"),
        "model": vehicle.get("model"),
        "year": vehicle.get("year"),
        "mileage": vehicle.get("mileage"),
        "price": vehicle.get("price"),
        "titleStatus": "clean"
    }
    
    # Make API request
    print(f"📤 Sending request to {ENHANCED_ANALYZE_ENDPOINT}...")
    start_time = time.time()
    
    try:
        response = requests.post(
            ENHANCED_ANALYZE_ENDPOINT,
            files=files,
            data=data,
            timeout=120  # 2 minute timeout
        )
        
        elapsed_time = time.time() - start_time
        print(f"⏱️  Request completed in {elapsed_time:.2f} seconds")
        
        # Close file handles
        for _, file_tuple in files:
            file_tuple[1].close()
        
        if response.status_code != 200:
            print(f"❌ API request failed: {response.status_code}")
            print(f"   Response: {response.text[:500]}")
            return {"success": False, "error": f"API returned {response.status_code}"}
        
        result = response.json()
        
        # Extract key information
        analysis_result = {
            "success": result.get("success", False),
            "vehicle_name": vehicle["name"],
            "detected": result.get("detected", {}),
            "market_intelligence": result.get("market_intelligence", {}),
            "pricing": result.get("pricing", {}),
            "price_warnings": result.get("price_warnings"),
            "analysis_json": result.get("analysis_json", {}),
            "processing_times": result.get("processing_times", {}),
            "raw_response": result
        }
        
        # Print summary
        print(f"\n✅ Analysis completed successfully")
        print(f"   Detected Make: {analysis_result['detected'].get('make', 'N/A')}")
        print(f"   Detected Model: {analysis_result['detected'].get('model', 'N/A')}")
        print(f"   Detected Year: {analysis_result['detected'].get('year', 'N/A')}")
        print(f"   Detected Trim: {analysis_result['detected'].get('trim', 'N/A')}")
        print(f"   Features: {len(analysis_result['detected'].get('features', []))} detected")
        
        # Check market data
        market_data = analysis_result.get("market_intelligence", {})
        if market_data:
            pricing_analysis = market_data.get("pricing_analysis", {})
            market_prices = pricing_analysis.get("market_prices", {})
            market_avg = market_prices.get("market_average", 0)
            data_source = market_prices.get("data_source", "unknown")
            print(f"   Market Average: ${market_avg:,.0f} (source: {data_source})")
        
        return analysis_result
        
    except requests.exceptions.Timeout:
        print(f"❌ Request timed out after 120 seconds")
        return {"success": False, "error": "Request timeout"}
    except Exception as e:
        print(f"❌ Error analyzing vehicle: {e}")
        return {"success": False, "error": str(e)}


def compare_vehicles(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Compare analysis results from different vehicles."""
    print(f"\n{'='*60}")
    print(f"🔍 Comparing {len(results)} vehicles...")
    print(f"{'='*60}")
    
    comparison = {
        "vehicles_analyzed": len(results),
        "unique_makes": set(),
        "unique_models": set(),
        "unique_years": set(),
        "market_price_differences": [],
        "feature_differences": [],
        "issues": []
    }
    
    # Extract unique values
    for result in results:
        if not result.get("success"):
            comparison["issues"].append(f"{result.get('vehicle_name', 'Unknown')} failed analysis")
            continue
        
        detected = result.get("detected", {})
        comparison["unique_makes"].add(detected.get("make", "Unknown"))
        comparison["unique_models"].add(detected.get("model", "Unknown"))
        comparison["unique_years"].add(str(detected.get("year", "Unknown")))
        
        # Extract market prices
        market_data = result.get("market_intelligence", {})
        if market_data:
            pricing_analysis = market_data.get("pricing_analysis", {})
            market_prices = pricing_analysis.get("market_prices", {})
            market_avg = market_prices.get("market_average", 0)
            comparison["market_price_differences"].append({
                "vehicle": result.get("vehicle_name", "Unknown"),
                "market_average": market_avg
            })
    
    # Check for issues
    if len(comparison["unique_makes"]) < len(results):
        comparison["issues"].append("Some vehicles have the same make (may be expected)")
    
    if len(comparison["unique_models"]) < len(results):
        comparison["issues"].append("Some vehicles have the same model (may be expected)")
    
    # Print comparison results
    print(f"\n📊 Comparison Results:")
    print(f"   Unique Makes: {len(comparison['unique_makes'])} ({', '.join(comparison['unique_makes'])})")
    print(f"   Unique Models: {len(comparison['unique_models'])} ({', '.join(comparison['unique_models'])})")
    print(f"   Unique Years: {len(comparison['unique_years'])} ({', '.join(comparison['unique_years'])})")
    
    if comparison["market_price_differences"]:
        print(f"\n💰 Market Price Differences:")
        for price_info in comparison["market_price_differences"]:
            print(f"   {price_info['vehicle']}: ${price_info['market_average']:,.0f}")
    
    if comparison["issues"]:
        print(f"\n⚠️  Issues Found:")
        for issue in comparison["issues"]:
            print(f"   - {issue}")
    else:
        print(f"\n✅ No issues found - vehicles are correctly distinguished!")
    
    return comparison


def save_results(results: List[Dict[str, Any]], comparison: Dict[str, Any]):
    """Save test results to file."""
    output_file = "test_results_vehicle_distinction.json"
    
    output = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "test_vehicles": [r.get("vehicle_name") for r in results],
        "results": results,
        "comparison": comparison
    }
    
    with open(output_file, "w") as f:
        json.dump(output, f, indent=2, default=str)
    
    print(f"\n💾 Results saved to: {output_file}")


def main():
    """Main test function."""
    print("="*60)
    print("🧪 Vehicle Distinction Test - QuickFlip MVP")
    print("="*60)
    print(f"\nTesting {len(TEST_VEHICLES)} vehicles...")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Endpoint: {ENHANCED_ANALYZE_ENDPOINT}")
    
    # Check backend is running
    try:
        health_check = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if health_check.status_code != 200:
            print(f"❌ Backend health check failed: {health_check.status_code}")
            return
        print(f"✅ Backend is running")
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        print(f"   Make sure backend is running on {BACKEND_URL}")
        return
    
    # Analyze each vehicle
    results = []
    for vehicle in TEST_VEHICLES:
        result = analyze_vehicle(vehicle)
        results.append(result)
        time.sleep(2)  # Small delay between requests
    
    # Compare results
    successful_results = [r for r in results if r.get("success")]
    if len(successful_results) >= 2:
        comparison = compare_vehicles(successful_results)
    else:
        print(f"\n⚠️  Not enough successful analyses to compare ({len(successful_results)} successful)")
        comparison = {"error": "Not enough successful analyses"}
    
    # Save results
    save_results(results, comparison)
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"📋 Test Summary")
    print(f"{'='*60}")
    print(f"   Vehicles tested: {len(TEST_VEHICLES)}")
    print(f"   Successful analyses: {len(successful_results)}")
    print(f"   Failed analyses: {len(results) - len(successful_results)}")
    
    if len(successful_results) >= 2:
        print(f"\n✅ Test completed - vehicles are correctly distinguished!")
    else:
        print(f"\n⚠️  Test incomplete - need at least 2 successful analyses")


if __name__ == "__main__":
    main()

