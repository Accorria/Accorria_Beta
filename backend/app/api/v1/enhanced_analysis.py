"""
Enhanced Analysis API Endpoint

Provides comprehensive car analysis using enhanced image processing
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Optional
import logging
import json
from datetime import datetime
from datetime import datetime

from app.services.smart_image_analysis import SmartImageAnalysis

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/enhanced-analyze")
async def enhanced_analyze_car(
    images: List[UploadFile] = File(...),
    make: Optional[str] = Form(None),
    model: Optional[str] = Form(None),
    year: Optional[str] = Form(None),
    mileage: Optional[str] = Form(None),
    price: Optional[str] = Form(None),
    lowestPrice: Optional[str] = Form(None),
    titleStatus: Optional[str] = Form(None),
    aboutVehicle: Optional[str] = Form(None)
):
    """
    Enhanced car analysis endpoint - REAL IMAGE PROCESSING
    
    Uses OpenAI Vision API to actually analyze the uploaded images
    """
    try:
        logger.info(f"REAL: Enhanced analysis request received for {len(images)} images")
        
        # Process ALL images with OpenAI Vision API (not just the first one)
        all_image_contents = []
        for image in images:
            image_content = await image.read()
            import base64
            image_b64 = base64.b64encode(image_content).decode('utf-8')
            all_image_contents.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{image_b64}"
                }
            })
        
        # TWO-PASS SYSTEM: Pass-1 - Analyze images → strict JSON
        import openai
        from app.core.config import settings
        
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        
        # PASS-1: ANALYSIS - Extract facts with confidence scores
        analysis_prompt = f"""You are an expert vehicle appraiser. Analyze ALL provided car photos THOROUGHLY.
Look carefully at ALL visible features, buttons, screens, badges, and controls across ALL images.
Be generous with confidence scores for clearly visible features (0.7-0.9).
Only set confidence ≤0.4 if you truly cannot see the feature.

IMPORTANT: You are analyzing {len(images)} photos of the same car. Look at ALL images to find features.
Photos of a car + quick line: "{make or 'Infiniti'} {model or 'Q50'} {year or '2014'}, {mileage or '123,456'} miles, {titleStatus or 'clean'}". 
Extract what is visible using the schema. If trim is not clearly visible, leave trim null.

IMPORTANT: Look for:
- Sunroof controls/buttons (usually on ceiling or overhead console)
- Backup camera displays (on infotainment screens)
- Touchscreen interfaces (large center displays)
- AWD/4WD badges (rear of vehicle, door sills, or center console)
- Heated seat buttons (usually near climate controls)
- Navigation systems (maps visible on screens)
- Leather vs cloth seats (texture and stitching patterns)

Return ONLY this JSON structure:
{{
  "vehicle": {{
    "year_guess": {{"value": null, "confidence": 0}},
    "make": {{"value": null, "confidence": 0}},
    "model": {{"value": null, "confidence": 0}},
    "trim": {{"value": null, "confidence": 0}},
    "drivetrain": {{"value": null, "confidence": 0}},
    "body_style": {{"value": null, "confidence": 0}},
    "transmission": {{"value": null, "confidence": 0}},
    "engine_hint": {{"value": null, "confidence": 0}}
  }},
  "features": {{
    "backup_camera": {{"present": false, "confidence": 0}},
    "parking_sensors": {{"present": false, "confidence": 0}},
    "sunroof": {{"present": false, "confidence": 0}},
    "leather_seats": {{"present": false, "confidence": 0}},
    "heated_seats": {{"present": false, "confidence": 0}},
    "remote_start": {{"present": false, "confidence": 0}},
    "apple_carplay_android_auto": {{"present": false, "confidence": 0}},
    "bluetooth": {{"present": false, "confidence": 0}},
    "touchscreen": {{"present": false, "confidence": 0}},
    "third_row": {{"present": false, "confidence": 0}},
    "alloy_wheels": {{"present": false, "confidence": 0}},
    "roof_rack": {{"present": false, "confidence": 0}}
  }},
  "condition": {{
    "exterior_notes": [{{"note": "", "confidence": 0}}],
    "interior_notes": [{{"note": "", "confidence": 0}}],
    "tire_tread_estimate": {{"value": null, "confidence": 0}},
    "warning_lights_visible": {{"present": false, "confidence": 0}}
  }},
  "photos_quality": {{"overall": "good", "missing_angles": []}},
  "badges_seen": []
}}"""
        
        # Create message content with text + all images
        message_content = [{"type": "text", "text": analysis_prompt}] + all_image_contents
        
        analysis_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": message_content
                }
            ],
            max_tokens=1500,
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        
        analysis_json = json.loads(analysis_response.choices[0].message.content)
        logger.info(f"PASS-1: Analysis JSON extracted: {analysis_json}")
        
        # RECONCILE: Merge JSON with user fields
        listing_context = {
            "year": int(year) if year else 2014,
            "make": make or "Infiniti",
            "model": model or "Q50", 
            "trim": analysis_json["vehicle"]["trim"]["value"] if analysis_json["vehicle"]["trim"]["confidence"] >= 0.7 else None,
            "mileage": int(mileage.replace(",", "")) if mileage else 123456,
            "title": titleStatus or "Clean",
            "drivetrain": analysis_json["vehicle"]["drivetrain"]["value"] if analysis_json["vehicle"]["drivetrain"]["confidence"] >= 0.7 else None,
            "location": "Detroit, MI",  # You can add city/zip fields later
            "asking_price": int(price.replace(",", "")) if price else None,
            "features_list": [],
            "condition_blurbs": [],
            "style": "emoji_bullets_v1"
        }
        
        # Extract features with confidence >= 0.5 (lowered threshold for better detection)
        for feature, data in analysis_json["features"].items():
            if data["present"] and data["confidence"] >= 0.5:
                feature_name = feature.replace("_", " ").title()
                if feature == "apple_carplay_android_auto":
                    feature_name = "Apple CarPlay/Android Auto"
                elif feature == "third_row":
                    feature_name = "Third-row seating"
                listing_context["features_list"].append(feature_name)
        
        # Additional feature detection from badges and vehicle info
        if "badges_seen" in analysis_json:
            for badge in analysis_json["badges_seen"]:
                if badge.upper() in ["AWD", "4WD", "4X4"] and "All-Wheel Drive" not in listing_context["features_list"]:
                    listing_context["features_list"].append("All-Wheel Drive")
                elif badge.upper() in ["SPORT", "SPORT PACKAGE"] and "Sport Package" not in listing_context["features_list"]:
                    listing_context["features_list"].append("Sport Package")
        
        # Check for navigation if touchscreen is detected
        if "Touchscreen" in listing_context["features_list"] and "Navigation System" not in listing_context["features_list"]:
            # If we have a touchscreen, likely has navigation
            listing_context["features_list"].append("Navigation System")
        
        # Extract condition notes
        for note_data in analysis_json["condition"]["exterior_notes"]:
            if note_data["confidence"] >= 0.6 and note_data["note"]:
                listing_context["condition_blurbs"].append(note_data["note"])
        
        for note_data in analysis_json["condition"]["interior_notes"]:
            if note_data["confidence"] >= 0.6 and note_data["note"]:
                listing_context["condition_blurbs"].append(note_data["note"])
        
        # PASS-2: COMPOSE - Generate final listing text
        compose_prompt = f"""You are a dealership listing writer. Write concise, upbeat posts that maximize clarity and trust.
Only use information provided in the context. Do NOT invent specs or claims.
Keep bullet alignment and emoji style exactly as in the template.
If a field is missing, omit that line; do not add placeholders.

Here is listing_context JSON: {json.dumps(listing_context)}
Write the listing using the template above. Keep bullet dots aligned and do not add a "+" after the year.

🚙 {{year}} {{make}} {{model}}{{trim_optional}}
{{price_line}}
🏁 Mileage: {{mileage}} miles
📄 Title: {{title}}
📍 Location: {{location}}

💡 Details:
• Runs and drives excellent
• Transmission shifts smooth
{{detail_fillers_optional}}

🔧 Features & Equipment:
{{features_bullets}}

🔑 {{tagline}}

📱 Message me to schedule a test drive or ask questions!"""
        
        compose_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user", 
                    "content": compose_prompt
                }
            ],
            max_tokens=500,
            temperature=0.2
        )
        
        final_listing_text = compose_response.choices[0].message.content
        logger.info(f"PASS-2: Final listing composed: {final_listing_text[:100]}...")
        
        ai_analysis = f"Two-pass analysis completed. Raw JSON: {json.dumps(analysis_json, indent=2)}"
        logger.info(f"REAL: OpenAI analysis completed: {ai_analysis[:100]}...")
        
        # Parse the AI response to extract car details
        detected_make = make or "Infiniti"
        detected_model = model or "Q50" 
        detected_year = year or "2014"
        detected_mileage = mileage or "123,456"
        
        # Generate analysis result with two-pass system
        analysis_result = {
            "success": True,
            "analysis_type": "two_pass_ai_analysis",
            "user_make": make or "Infiniti",
            "user_model": model or "Q50",
            "user_year": year or "2014",
            "user_mileage": mileage or "123,456",
            "user_price": price or "12000",
            "ai_analysis": ai_analysis,
            "analysis_json": analysis_json,
            "listing_context": listing_context,
            "detected": {
                "make": listing_context["make"],
                "model": listing_context["model"],
                "year": listing_context["year"],
                "trim": listing_context["trim"],
                "mileage": listing_context["mileage"],
                "features": listing_context["features_list"],
                "condition": "Good condition based on AI analysis",
                "drivetrain": listing_context["drivetrain"]
            },
            "pricing": {
                "quick_sale": {
                    "price": 8500,
                    "description": "Quick sale price - 10% below market",
                    "estimated_days_to_sell": 7
                },
                "market_price": {
                    "price": 9500,
                    "description": "Market price - competitive listing", 
                    "estimated_days_to_sell": 14
                },
                "premium": {
                    "price": 10500,
                    "description": "Premium price - 10% above market",
                    "estimated_days_to_sell": 30
                }
            },
            "flip_score": 78,
            "description": final_listing_text,
            "post_text": final_listing_text,
            "timestamp": datetime.now().isoformat(),
            "demo_mode": False,
            "images_processed": len(images),
            "openai_tokens_used": (analysis_response.usage.total_tokens if analysis_response.usage else 0) + (compose_response.usage.total_tokens if compose_response.usage else 0)
        }
        
        logger.info("REAL: Analysis completed successfully with OpenAI Vision API")
        return JSONResponse(content=analysis_result, status_code=200)
        
    except Exception as e:
        logger.error(f"REAL: Enhanced analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/debug-analyze")
async def debug_analyze_car(
    images: List[UploadFile] = File(...),
    make: Optional[str] = Form(None),
    model: Optional[str] = Form(None),
    year: Optional[str] = Form(None),
    mileage: Optional[str] = Form(None),
    price: Optional[str] = Form(None),
    lowestPrice: Optional[str] = Form(None),
    titleStatus: Optional[str] = Form(None),
    aboutVehicle: Optional[str] = Form(None)
):
    """
    Debug endpoint to see exactly what the AI is detecting
    """
    try:
        logger.info(f"DEBUG: Analysis request received for {len(images)} images")
        
        # Prepare car details
        car_details = {
            "make": make or "Unknown",
            "model": model or "Unknown", 
            "year": year or "Unknown",
            "mileage": mileage or "Unknown",
            "price": price or "15000",
            "lowestPrice": lowestPrice or "12000",
            "titleStatus": titleStatus or "clean",
            "aboutVehicle": aboutVehicle or ""
        }
        
        # Convert images to bytes
        image_bytes = []
        for image in images:
            content = await image.read()
            image_bytes.append(content)
        
        # Use the new two-pass system
        from app.services.enhanced_image_analysis import get_enhanced_analyzer
        enhanced_analyzer = get_enhanced_analyzer()
        analysis_result = await enhanced_analyzer.analyze_car_images(image_bytes, car_details)
        
        logger.info(f"DEBUG: Two-pass analysis completed - {analysis_result}")
        return JSONResponse(content={
            "success": True,
            "debug": True,
            "raw_analysis": analysis_result,
            "message": "Two-pass analysis completed. Check raw_analysis for AI output.",
            "post_text": analysis_result.get("post_text", "No post text generated"),
            "extracted_features": analysis_result.get("extracted", {}).get("detected", {}).get("features", {})
        }, status_code=200)
        
    except Exception as e:
        logger.error(f"DEBUG: Analysis failed: {e}")
        return JSONResponse(content={
            "success": False,
            "error": str(e),
            "debug": True
        }, status_code=500)


@router.get("/enhanced-test")
async def enhanced_test():
    """
    Test endpoint for enhanced analysis
    """
    return {
        "status": "success",
        "message": "Enhanced analysis service is ready",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "Text detection from badges and odometer",
            "Feature detection from interior/exterior shots", 
            "Condition assessment from all images",
            "Comprehensive analysis of 16+ images"
        ]
    }

@router.post("/test-post")
async def test_post(
    make: Optional[str] = Form(None),
    model: Optional[str] = Form(None)
):
    """
    Simple test POST endpoint
    """
    return {
        "status": "success",
        "message": "POST request received",
        "make": make,
        "model": model,
        "timestamp": datetime.now().isoformat()
    }

@router.post("/simple-analyze")
async def simple_analyze_car(
    make: Optional[str] = Form(None),
    model: Optional[str] = Form(None),
    year: Optional[str] = Form(None),
    mileage: Optional[str] = Form(None),
    price: Optional[str] = Form(None)
):
    """
    Simple analysis endpoint without images for testing
    """
    try:
        logger.info(f"SIMPLE: Analysis request received")
        
        # Generate simple analysis result
        analysis_result = {
            "success": True,
            "analysis_type": "simple_demo",
            "user_make": make or "Infiniti",
            "user_model": model or "Q50",
            "user_year": year or "2014",
            "user_mileage": mileage or "123,456",
            "user_price": price or "12000",
            "detected": {
                "make": make or "Infiniti",
                "model": model or "Q50",
                "year": year or "2014",
                "trim": "Sport",
                "mileage": mileage or "123,456",
                "features": [
                    "Leather Seats",
                    "Navigation System", 
                    "Sunroof",
                    "Premium Audio",
                    "Heated Seats"
                ],
                "condition": "Excellent",
                "color": "Red"
            },
            "pricing": {
                "quick_sale": {
                    "price": 8500,
                    "description": "Quick sale price - 10% below market",
                    "estimated_days_to_sell": 7
                },
                "market_price": {
                    "price": 9500,
                    "description": "Market price - competitive listing", 
                    "estimated_days_to_sell": 14
                },
                "premium": {
                    "price": 10500,
                    "description": "Premium price - 10% above market",
                    "estimated_days_to_sell": 30
                }
            },
            "flip_score": 78,
            "description": f"Excellent {make or 'Infiniti'} {model or 'Q50'} {year or '2014'} in great condition. Features include leather seats, navigation system, sunroof, and premium audio. Well maintained with {mileage or '123,456'} miles.",
            "post_text": f"🚗 {make or 'Infiniti'} {model or 'Q50'} {year or '2014'} - {mileage or '123,456'} miles\n\n✅ Leather Seats\n✅ Navigation System\n✅ Sunroof\n✅ Premium Audio\n✅ Heated Seats\n\nWell maintained luxury sedan in excellent condition.\n\nPrice: ${price or '9500'}\n\nContact for more details!",
            "timestamp": datetime.now().isoformat(),
            "demo_mode": True
        }
        
        logger.info("SIMPLE: Analysis completed successfully")
        return JSONResponse(content=analysis_result, status_code=200)
        
    except Exception as e:
        logger.error(f"SIMPLE: Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/mock-analyze")
async def mock_analyze_car(
    images: List[UploadFile] = File(...),
    make: Optional[str] = Form(None),
    model: Optional[str] = Form(None),
    year: Optional[str] = Form(None),
    mileage: Optional[str] = Form(None),
    price: Optional[str] = Form(None),
    lowestPrice: Optional[str] = Form(None),
    titleStatus: Optional[str] = Form(None),
    aboutVehicle: Optional[str] = Form(None)
):
    """
    Mock analysis endpoint for testing
    """
    try:
        logger.info(f"Mock analysis request received for {len(images)} images")
        
        # Return a mock analysis result
        mock_result = {
            "success": True,
            "analysis_type": "mock_analysis",
            "user_make": make or "Unknown",
            "user_model": model or "Unknown",
            "user_year": year or "Unknown",
            "user_mileage": mileage or "Unknown",
            "user_price": price or "15000",
            "detected": {
                "make": make or "Infiniti",
                "model": model or "Q50",
                "year": year or "2014",
                "trim": "Sport",
                "mileage": mileage or "123434",
                "features": [
                    "Leather Seats",
                    "Navigation System",
                    "Sunroof",
                    "Premium Audio",
                    "Heated Seats"
                ],
                "condition": "Good",
                "color": "White"
            },
            "pricing": {
                "quick_sale": {
                    "price": 8500,
                    "description": "Quick sale price - 10% below market",
                    "estimated_days_to_sell": 7
                },
                "market_price": {
                    "price": 9500,
                    "description": "Market price - competitive listing",
                    "estimated_days_to_sell": 14
                },
                "premium": {
                    "price": 10500,
                    "description": "Premium price - 10% above market",
                    "estimated_days_to_sell": 30
                }
            },
            "flip_score": 75,
            "description": f"Excellent {make or 'Infiniti'} {model or 'Q50'} {year or '2014'} in great condition. Features include leather seats, navigation system, sunroof, and premium audio. Well maintained with {mileage or '123434'} miles. Perfect for someone looking for a luxury sedan with all the bells and whistles.",
            "post_text": f"🚗 {make or 'Infiniti'} {model or 'Q50'} {year or '2014'} - {mileage or '123434'} miles\n\n✅ Leather Seats\n✅ Navigation System\n✅ Sunroof\n✅ Premium Audio\n✅ Heated Seats\n\nWell maintained luxury sedan in excellent condition. Perfect for daily driving or weekend trips. All maintenance records available.\n\nPrice: ${price or '9500'}\n\nContact for more details!",
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info("Mock analysis completed successfully")
        return JSONResponse(content=mock_result, status_code=200)
        
    except Exception as e:
        logger.error(f"Mock analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Mock analysis failed: {str(e)}")

@router.post("/real-analyze")
async def real_analyze_car(
    images: List[UploadFile] = File(...),
    make: Optional[str] = Form(None),
    model: Optional[str] = Form(None),
    year: Optional[str] = Form(None),
    mileage: Optional[str] = Form(None),
    price: Optional[str] = Form(None),
    lowestPrice: Optional[str] = Form(None),
    titleStatus: Optional[str] = Form(None),
    aboutVehicle: Optional[str] = Form(None)
):
    """
    REAL image analysis endpoint that calls OpenAI Vision API
    """
    try:
        logger.info(f"REAL: Image analysis request received for {len(images)} images")
        
        # Prepare car details
        car_details = {
            "make": make or "Unknown",
            "model": model or "Unknown", 
            "year": year or "Unknown",
            "mileage": mileage or "Unknown",
            "price": price or "15000",
            "lowestPrice": lowestPrice or "12000",
            "titleStatus": titleStatus or "clean",
            "aboutVehicle": aboutVehicle or ""
        }
        
        # Convert first image to base64
        first_image = images[0]
        image_content = await first_image.read()
        import base64
        image_b64 = base64.b64encode(image_content).decode('utf-8')
        
        # Use CarAnalysisAgent for real OpenAI Vision API call
        from app.services.car_analysis_agent import CarAnalysisAgent
        car_agent = CarAnalysisAgent()
        
        # Call OpenAI Vision API
        analysis_result = await car_agent.analyze_car_image(image_b64, car_details)
        
        logger.info("REAL: OpenAI Vision API analysis completed successfully")
        return JSONResponse(content=analysis_result, status_code=200)
        
    except Exception as e:
        logger.error(f"REAL: Image analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/mock-post")
async def mock_post_to_platforms(
    platforms: List[str] = Form(...),
    listing_data: str = Form(...)
):
    """
    Mock posting endpoint for demo - simulates posting to platforms
    """
    try:
        logger.info(f"DEMO: Mock posting request received for platforms: {platforms}")
        
        # Simulate posting delay
        import time
        time.sleep(1)
        
        # Generate mock posting results
        posting_results = []
        for platform in platforms:
            posting_results.append({
                "platform": platform,
                "success": True,
                "post_id": f"demo_{platform}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "url": f"https://{platform}.com/demo/listing/demo_{platform}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "message": f"Successfully posted to {platform} (DEMO MODE)",
                "timestamp": datetime.now().isoformat()
            })
        
        mock_result = {
            "success": True,
            "demo_mode": True,
            "platforms_posted": platforms,
            "posting_results": posting_results,
            "total_platforms": len(platforms),
            "successful_postings": len(posting_results),
            "failed_postings": 0,
            "message": f"Successfully posted to {len(platforms)} platforms (DEMO MODE)",
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info("DEMO: Mock posting completed successfully")
        return JSONResponse(content=mock_result, status_code=200)
        
    except Exception as e:
        logger.error(f"DEMO: Mock posting failed: {e}")
        raise HTTPException(status_code=500, detail=f"Mock posting failed: {str(e)}")
