#!/usr/bin/env python3
"""
Script to add 5-6 more test cars to the dashboard for demo purposes.
These cars will have platform tracking, group information, and realistic data.
"""

import json
import os
from datetime import datetime, timedelta

def create_test_cars():
    """Create 6 additional test cars with realistic data"""
    
    # Get existing test listings
    existing_cars = []
    if os.path.exists('frontend/public/test_cars.json'):
        with open('frontend/public/test_cars.json', 'r') as f:
            existing_cars = json.load(f)
    
    # New test cars with platform tracking and group info
    new_cars = [
        {
            "id": "car_001",
            "make": "Toyota",
            "model": "Camry",
            "year": "2018",
            "mileage": "85000",
            "price": "16500",
            "condition": "Good",
            "titleStatus": "clean",
            "location": "Detroit, MI",
            "description": "Well-maintained Toyota Camry with clean title. Regular oil changes and maintenance records available.",
            "images": ["/test_cars/camry_2018_1.jpg"],
            "platforms": [
                {
                    "name": "Facebook Marketplace",
                    "icon": "📘",
                    "url": "https://facebook.com/marketplace/item/123456",
                    "posted": "2024-01-15",
                    "views": 45,
                    "messages": 3,
                    "groups": ["Detroit Cars & Trucks", "Metro Detroit Auto Sales"]
                },
                {
                    "name": "Craigslist",
                    "icon": "📋",
                    "url": "https://detroit.craigslist.org/cto/123456789.html",
                    "posted": "2024-01-15",
                    "views": 23,
                    "messages": 1,
                    "groups": ["Detroit Cars & Trucks"]
                }
            ],
            "totalViews": 68,
            "totalMessages": 4,
            "soldFor": 0,
            "status": "active",
            "createdAt": "2024-01-15T10:30:00Z"
        },
        {
            "id": "car_002",
            "make": "Honda",
            "model": "Accord",
            "year": "2019",
            "mileage": "72000",
            "price": "18900",
            "condition": "Excellent",
            "titleStatus": "clean",
            "location": "Romulus, MI",
            "description": "One-owner Honda Accord in excellent condition. All service records available.",
            "images": ["/test_cars/accord_2019_1.jpg"],
            "platforms": [
                {
                    "name": "Facebook Marketplace",
                    "icon": "📘",
                    "url": "https://facebook.com/marketplace/item/123457",
                    "posted": "2024-01-12",
                    "views": 67,
                    "messages": 5,
                    "groups": ["Romulus Cars & Trucks", "Metro Detroit Auto Sales"]
                },
                {
                    "name": "eBay Motors",
                    "icon": "🛒",
                    "url": "https://ebay.com/itm/123456789",
                    "posted": "2024-01-12",
                    "views": 89,
                    "messages": 2,
                    "groups": []
                }
            ],
            "totalViews": 156,
            "totalMessages": 7,
            "soldFor": 0,
            "status": "active",
            "createdAt": "2024-01-12T14:20:00Z"
        },
        {
            "id": "car_003",
            "make": "Ford",
            "model": "F-150",
            "year": "2017",
            "mileage": "95000",
            "price": "22500",
            "condition": "Good",
            "titleStatus": "clean",
            "location": "Warren, MI",
            "description": "Ford F-150 XLT with towing package. Great for work or recreation.",
            "images": ["/test_cars/f150_2017_1.jpg"],
            "platforms": [
                {
                    "name": "Facebook Marketplace",
                    "icon": "📘",
                    "url": "https://facebook.com/marketplace/item/123458",
                    "posted": "2024-01-10",
                    "views": 123,
                    "messages": 8,
                    "groups": ["Detroit Cars & Trucks", "Michigan Truck Sales"]
                },
                {
                    "name": "Craigslist",
                    "icon": "📋",
                    "url": "https://detroit.craigslist.org/cto/123456790.html",
                    "posted": "2024-01-10",
                    "views": 45,
                    "messages": 3,
                    "groups": ["Detroit Cars & Trucks"]
                },
                {
                    "name": "AutoTrader",
                    "icon": "🚗",
                    "url": "https://autotrader.com/cars-for-sale/123456789",
                    "posted": "2024-01-10",
                    "views": 78,
                    "messages": 4,
                    "groups": []
                }
            ],
            "totalViews": 246,
            "totalMessages": 15,
            "soldFor": 0,
            "status": "active",
            "createdAt": "2024-01-10T09:15:00Z"
        },
        {
            "id": "car_004",
            "make": "Chevrolet",
            "model": "Malibu",
            "year": "2020",
            "mileage": "45000",
            "price": "19900",
            "condition": "Excellent",
            "titleStatus": "clean",
            "location": "Sterling Heights, MI",
            "description": "Low-mileage Chevrolet Malibu with premium features. Still under warranty.",
            "images": ["/test_cars/malibu_2020_1.jpg"],
            "platforms": [
                {
                    "name": "Facebook Marketplace",
                    "icon": "📘",
                    "url": "https://facebook.com/marketplace/item/123459",
                    "posted": "2024-01-08",
                    "views": 89,
                    "messages": 6,
                    "groups": ["Metro Detroit Auto Sales", "Sterling Heights Cars"]
                },
                {
                    "name": "Cars.com",
                    "icon": "🚙",
                    "url": "https://cars.com/vehicledetail/123456789",
                    "posted": "2024-01-08",
                    "views": 67,
                    "messages": 2,
                    "groups": []
                }
            ],
            "totalViews": 156,
            "totalMessages": 8,
            "soldFor": 0,
            "status": "active",
            "createdAt": "2024-01-08T16:45:00Z"
        },
        {
            "id": "car_005",
            "make": "Nissan",
            "model": "Altima",
            "year": "2016",
            "mileage": "110000",
            "price": "12500",
            "condition": "Fair",
            "titleStatus": "clean",
            "location": "Dearborn, MI",
            "description": "Reliable Nissan Altima with higher mileage but well-maintained. Great value.",
            "images": ["/test_cars/altima_2016_1.jpg"],
            "platforms": [
                {
                    "name": "Facebook Marketplace",
                    "icon": "📘",
                    "url": "https://facebook.com/marketplace/item/123460",
                    "posted": "2024-01-05",
                    "views": 34,
                    "messages": 2,
                    "groups": ["Dearborn Cars & Trucks", "Metro Detroit Auto Sales"]
                },
                {
                    "name": "Craigslist",
                    "icon": "📋",
                    "url": "https://detroit.craigslist.org/cto/123456791.html",
                    "posted": "2024-01-05",
                    "views": 28,
                    "messages": 1,
                    "groups": ["Dearborn Cars & Trucks"]
                }
            ],
            "totalViews": 62,
            "totalMessages": 3,
            "soldFor": 0,
            "status": "active",
            "createdAt": "2024-01-05T11:30:00Z"
        },
        {
            "id": "car_006",
            "make": "Jeep",
            "model": "Wrangler",
            "year": "2015",
            "mileage": "78000",
            "price": "28500",
            "condition": "Good",
            "titleStatus": "clean",
            "location": "Livonia, MI",
            "description": "Jeep Wrangler with aftermarket upgrades. Perfect for off-road adventures.",
            "images": ["/test_cars/wrangler_2015_1.jpg"],
            "platforms": [
                {
                    "name": "Facebook Marketplace",
                    "icon": "📘",
                    "url": "https://facebook.com/marketplace/item/123461",
                    "posted": "2024-01-03",
                    "views": 156,
                    "messages": 12,
                    "groups": ["Livonia Cars & Trucks", "Michigan Jeep Enthusiasts"]
                },
                {
                    "name": "eBay Motors",
                    "icon": "🛒",
                    "url": "https://ebay.com/itm/123456790",
                    "posted": "2024-01-03",
                    "views": 234,
                    "messages": 8,
                    "groups": []
                },
                {
                    "name": "AutoTrader",
                    "icon": "🚗",
                    "url": "https://autotrader.com/cars-for-sale/123456790",
                    "posted": "2024-01-03",
                    "views": 89,
                    "messages": 5,
                    "groups": []
                }
            ],
            "totalViews": 479,
            "totalMessages": 25,
            "soldFor": 0,
            "status": "active",
            "createdAt": "2024-01-03T13:20:00Z"
        }
    ]
    
    # Combine existing and new cars
    all_cars = existing_cars + new_cars
    
    # Save to file
    with open('frontend/public/test_cars.json', 'w') as f:
        json.dump(all_cars, f, indent=2)
    
    print(f"✅ Added {len(new_cars)} new test cars!")
    print("📊 Cars added:")
    for car in new_cars:
        print(f"  - {car['year']} {car['make']} {car['model']} (${car['price']})")
        print(f"    Platforms: {', '.join([p['name'] for p in car['platforms']])}")
        print(f"    Groups: {', '.join([g for p in car['platforms'] for g in p['groups']])}")
        print()
    
    print("🎯 Features added:")
    print("  - Platform tracking (Facebook, Craigslist, eBay, AutoTrader, Cars.com)")
    print("  - Group tracking (Detroit Cars & Trucks, Romulus Cars & Trucks, etc.)")
    print("  - Realistic views and messages per platform")
    print("  - Listing duration tracking")
    print("  - Location-based data")

if __name__ == "__main__":
    create_test_cars()
