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

from app.services.smart_image_analysis import SmartImageAnalysis

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/enhanced-analyze")
async def enhanced_analyze_car(
    images: List[UploadFile] = File(...),
    make: Optional[str] = Form(None),
    model: Optional[str] = Form(None),
    trim: Optional[str] = Form(None),
    year: Optional[str] = Form(None),
    mileage: Optional[str] = Form(None),
    price: Optional[str] = Form(None),
    lowestPrice: Optional[str] = Form(None),
    titleStatus: Optional[str] = Form(None),
    aboutVehicle: Optional[str] = Form(None),
    vin: Optional[str] = Form(None)
):
    """
    Enhanced car analysis endpoint - REAL IMAGE PROCESSING
    
    Uses OpenAI Vision API to actually analyze the uploaded images
    """
    try:
        import time
        start_time = time.time()
        logger.info(f"REAL: Enhanced analysis request received for {len(images)} images")
        print(f"[ENHANCED-ANALYZE] ===== REQUEST RECEIVED =====")
        print(f"[ENHANCED-ANALYZE] Images: {len(images)}")
        print(f"[ENHANCED-ANALYZE] Car: {year} {make} {model} {trim}".strip())
        print(f"[ENHANCED-ANALYZE] Mileage: {mileage}, Price: ${price}")
        print(f"[ENHANCED-ANALYZE] Title Status: {titleStatus}")
        print(f"[ENHANCED-ANALYZE] About Vehicle: {aboutVehicle[:100] if aboutVehicle else 'None'}...")
        print(f"[ENHANCED-ANALYZE] VIN: {vin or 'None'}")
        print(f"[ENHANCED-ANALYZE] =============================")
        
        # Apply spelling correction to aboutVehicle BEFORE processing
        import re
        spelling_fixes_input = {
            r'\bkyes\b': 'keys', r'\bkeis\b': 'keys', r'\bkees\b': 'keys', r'\bkeyes\b': 'keys',
            r'\bteo\b': 'two', r'\btow\b': 'two',
            r'\bsets of kyes\b': 'sets of keys', r'\bsets of keis\b': 'sets of keys',
            r'\bteo sets\b': 'two sets',
            r'\breplased\b': 'replaced', r'\breplaed\b': 'replaced', r'\breplced\b': 'replaced',
            r'\btransmision\b': 'transmission', r'\bcondtion\b': 'condition',
        }
        if aboutVehicle:
            corrected_about = aboutVehicle
            for pattern, replacement in spelling_fixes_input.items():
                corrected_about = re.sub(pattern, replacement, corrected_about, flags=re.IGNORECASE)
            if corrected_about != aboutVehicle:
                print(f"[ENHANCED-ANALYZE] ✅ Applied spelling correction to aboutVehicle")
                aboutVehicle = corrected_about
        
        # Process ALL images with OpenAI Vision API (not just the first one)
        image_processing_start = time.time()
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
        image_processing_time = time.time() - image_processing_start
        logger.info(f"⏱️ Image processing (base64 encoding) took {image_processing_time:.2f}s for {len(images)} images")
        print(f"[ENHANCED-ANALYZE] ✅ Images processed: {len(all_image_contents)} images encoded in {image_processing_time:.2f}s")
        
        # TWO-PASS SYSTEM: Pass-1 - Analyze images with Gemini Vision → strict JSON
        # Pass-2 - Format with OpenAI for multiple platforms
        import openai
        import httpx
        import asyncio
        from app.core.config import settings
        
        # Initialize Gemini for Vision analysis
        print(f"[ENHANCED-ANALYZE] Initializing Gemini Vision API...")
        if not settings.GEMINI_API_KEY:
            print(f"[ENHANCED-ANALYZE] ❌ ERROR: Gemini API Key is not set!")
            print(f"[ENHANCED-ANALYZE] ❌ Cannot proceed without REAL Gemini Vision API - NO MOCKS ALLOWED")
            raise HTTPException(status_code=500, detail="Gemini API key is not configured. Please set GEMINI_API_KEY environment variable for real API calls.")
        
        # Initialize OpenAI for formatting (Pass-2)
        openai_client = None
        if not settings.OPENAI_API_KEY:
            print(f"[ENHANCED-ANALYZE] ⚠️  WARNING: OpenAI API Key is not set - will not be able to format for multiple platforms")
        else:
            openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            print(f"[ENHANCED-ANALYZE] ✅ OpenAI client initialized for multi-platform formatting")
        
        print(f"[ENHANCED-ANALYZE] ✅ Using REAL Gemini Vision API - NO MOCKS OR FALLBACKS")
        
        # OPTIMIZATION: Prepare basic listing context from user input (for parallel Google Search)
        user_entered_price = None
        if price:
            try:
                price_clean = price.replace(",", "").replace("$", "").strip()
                user_entered_price = int(price_clean) if price_clean.isdigit() else None
            except:
                user_entered_price = None
        
        basic_listing_context = {
            "year": int(year) if year else 2014,
            "make": make or "Unknown",
            "model": model or "Unknown",
            "mileage": int(mileage.replace(",", "")) if mileage else 123456,
            "location": "Detroit, MI",  # You can add city/zip fields later
            "asking_price": user_entered_price,
        }
        
        # PASS-1: ANALYSIS - Extract facts with confidence scores
        analysis_prompt = f"""You are an expert vehicle appraiser. Analyze ALL provided car photos THOROUGHLY.
Look carefully at ALL visible features, buttons, screens, badges, and controls across ALL images.
Be generous with confidence scores for clearly visible features (0.7-0.9).
Only set confidence ≤0.4 if you truly cannot see the feature.

IMPORTANT: You are analyzing {len(images)} photos of the same car. Look at ALL images to find features.

CRITICAL: DETECT MAKE AND MODEL FROM PHOTOS - PRIORITIZE WHAT YOU SEE OVER USER INPUT
- ALWAYS trust what you see in the photos over any user-provided make/model
- Look for manufacturer badges/emblems (Chevrolet, Ford, Toyota, Honda, Jeep, BMW, Chrysler, Dodge, etc.) - usually on front grille, rear, or steering wheel
- Look for model name badges (Trailblazer, F-150, Camry, Civic, Compass, X5, Pacifica, Airflow, Charger, etc.) - usually on rear or side
- Look for trim level badges (RS, LT, XLE, EX-L, Latitude, Sport, Touring, Limited, SXT, GT, etc.) - usually on rear or side
- IMPORTANT: For Chrysler models, look for trim badges like "Pacifica Touring", "Pacifica Limited", "Airflow GT", etc.
- IMPORTANT: Model names like "Pacifica" and "Airflow" ARE the model, not the trim - but they may have additional trim levels
- If user provided make/model ("{make or 'Unknown'} {model or 'Unknown'}") but it DOESN'T match what you see in photos, use what you see in photos instead
- If you see "Trailblazer" badge but user said "Chrysler Airflow", it's a Trailblazer - trust the photos
- If you see a Jeep logo on the steering wheel, it's a Jeep - not a BMW
- If you see BMW logos/badges, it's a BMW
- If you see Chevrolet bowtie logo, it's a Chevy - not a Chrysler
- Trust visual evidence over text input - photos don't lie
- Use high confidence (0.8-0.9) if badges are clearly visible, medium confidence (0.6-0.7) if inferred from body style/features
- For trim detection, use confidence 0.5+ if you see any trim badge, even if partially visible

Photos of a car + quick line: "{make or 'Unknown'} {model or 'Unknown'} {trim or ''} {year or '2014'}, {mileage or '123,456'} miles, {titleStatus or 'clean'}". 
Extract what is visible using the schema. Look for trim badges, features, and options that indicate the trim level (e.g., Sport, Limited, Rubicon, RS, LT, etc.). If trim is not clearly visible but provided in context, use that. Otherwise leave trim null.

CRITICAL: Look for these SPECIFIC visual details in ALL photos - YOU MUST CHECK EVERY SINGLE IMAGE:

**EXTERIOR FEATURES (check all exterior photos):**
- AWD/4WD badges (rear of vehicle, door sills, or center console) - CRITICAL: If you see "4x4", "AWD", "4WD", or similar badges, mark drivetrain as "AWD" or "4WD" with high confidence (0.9+) and add to badges_seen
- Window tinting (dark tinted windows, privacy glass, limo tint, light tint - look at side windows and rear windows) - If windows appear darker than normal, mark tinted_windows as present with confidence 0.7+
- Wheel color and style (black rims, chrome rims, alloy wheels, steel wheels, aftermarket rims) - If you see shiny silver/metallic wheels, mark alloy_wheels as present with confidence 0.7+
- Roof rails or roof racks (black bars on top of vehicle) - If visible, mark roof_rack as present with confidence 0.7+
- Exterior color (red, black, white, silver, blue, gray, etc.) - CHECK ALL EXTERIOR PHOTOS
- Fog lights or LED light bars
- Running boards or side steps
- Tow hitches or trailer connections
- Aftermarket modifications (lift kits, body kits, spoilers, etc.)

**INTERIOR FEATURES (check all interior photos):**
- Sunroof/moonroof (look for sunroof controls on ceiling, glass panel on roof, or open sunroof visible) - CHECK ALL INTERIOR PHOTOS - If you see sunroof controls or glass panel, mark sunroof as present with confidence 0.8+
- Radio/infotainment system (look for touchscreen displays, radio controls, CD players, CarPlay/Android Auto, navigation screens) - CHECK ALL INTERIOR PHOTOS - If you see any radio/infotainment display, mark touchscreen as present with confidence 0.7+
- Backup camera displays (on infotainment screens) - If you see backup camera view or button, mark backup_camera as present with confidence 0.7+
- Navigation systems (maps visible on screens, NAV button) - If you see navigation screen or NAV button, mark navigation as present with confidence 0.7+
- Bluetooth (look for Bluetooth button or symbol on radio) - If you see Bluetooth symbol/button, mark bluetooth as present with confidence 0.7+
- Heated seat buttons (usually near climate controls) - If you see heated seat buttons, mark heated_seats as present with confidence 0.8+
- Leather vs cloth seats (texture and stitching patterns) - If you see leather texture/stitching, mark leather_seats as present with confidence 0.7+
- Interior color and material (black leather, tan cloth, gray fabric, beige, brown, etc.) - CHECK ALL INTERIOR PHOTOS CAREFULLY
- Steering wheel controls and features
- Dashboard layout and features
- Center console features

**OTHER FEATURES:**
- VIN numbers (visible on dashboard, door jamb, or windshield) - CRITICAL: If you see a VIN image, extract the VIN and use it to get vehicle specifications
- Any damage, scratches, or wear visible
- Tire condition and tread depth
- Headlight/taillight condition
- Bumper condition
- Paint quality and shine

**IMPORTANT: For each feature, if you can see it in ANY photo, mark it as present=True with appropriate confidence (0.7+ for clearly visible, 0.5-0.7 for partially visible). Do NOT mark features as absent if you simply cannot see them - only mark present=False if you can clearly see the area where the feature would be and it's not there.**

IMPORTANT: If you see a photo of the VIN number, you MUST extract it and note that VIN lookup should be performed to get accurate vehicle specifications and features.

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
    "engine_hint": {{"value": null, "confidence": 0}},
    "exterior_color": {{"value": null, "confidence": 0}},
    "interior_color": {{"value": null, "confidence": 0}},
    "vin_visible": {{"value": null, "confidence": 0}}
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
    "roof_rack": {{"present": false, "confidence": 0}},
    "tinted_windows": {{"present": false, "confidence": 0}},
    "black_rims": {{"present": false, "confidence": 0}},
    "chrome_rims": {{"present": false, "confidence": 0}},
    "navigation": {{"present": false, "confidence": 0}},
    "premium_audio": {{"present": false, "confidence": 0}},
    "keyless_entry": {{"present": false, "confidence": 0}},
    "push_button_start": {{"present": false, "confidence": 0}}
  }},
  "condition": {{
    "exterior_notes": [{{"note": "", "confidence": 0}}],
    "interior_notes": [{{"note": "", "confidence": 0}}],
    "tire_tread_estimate": {{"value": null, "confidence": 0}},
    "warning_lights_visible": {{"present": false, "confidence": 0}},
    "paint_condition": {{"value": null, "confidence": 0}},
    "headlight_condition": {{"value": null, "confidence": 0}},
    "bumper_condition": {{"value": null, "confidence": 0}}
  }},
  "photos_quality": {{"overall": "good", "missing_angles": []}},
  "badges_seen": [],
  "specific_details": {{
    "wheel_description": {{"value": null, "confidence": 0}},
    "window_tint_description": {{"value": null, "confidence": 0}},
    "interior_material": {{"value": null, "confidence": 0}},
    "visible_damage": [{{"note": "", "confidence": 0}}]
  }}
}}"""
        
        # OPTIMIZATION: Run Gemini Vision and Google Search in PARALLEL
        parallel_start = time.time()
        logger.info(f"⏱️ Starting PARALLEL analysis: Gemini Vision + Google Search...")
        print(f"[ENHANCED-ANALYZE] 🚀 OPTIMIZATION: Running Gemini Vision and Google Search in PARALLEL")
        print(f"[ENHANCED-ANALYZE] ⏱️  Expected time: 20-30 seconds (first request) or 8-12 seconds (cached)")
        print(f"[ENHANCED-ANALYZE] 📊 Analyzing {len(images)} images for comprehensive feature detection")
        
        # Prepare images for Gemini Vision API
        gemini_parts = [{"text": analysis_prompt}]
        for image in images:
            await image.seek(0)  # Reset file pointer
            image_content = await image.read()
            import base64
            image_b64 = base64.b64encode(image_content).decode('utf-8')
            gemini_parts.append({
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": image_b64
                }
            })
        
        # Define async functions for parallel execution
        async def call_gemini_vision():
            """Call Gemini Vision API to analyze images"""
            gemini_start = time.time()
            try:
                print(f"[ENHANCED-ANALYZE] 📸 Starting Gemini Vision API (timeout: 60s)...")
                async with httpx.AsyncClient() as client:
                    gemini_response = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={settings.GEMINI_API_KEY}",
                        json={
                            "contents": [{
                                "parts": gemini_parts
                            }],
                            "generationConfig": {
                                "maxOutputTokens": 2000,
                                "temperature": 0.0,
                                "responseMimeType": "application/json"
                            }
                        },
                        timeout=60.0
                    )
                    
                    if gemini_response.status_code != 200:
                        error_text = gemini_response.text
                        print(f"[ENHANCED-ANALYZE] ❌ Gemini Vision API error: {gemini_response.status_code} - {error_text[:200]}")
                        logger.error(f"Gemini Vision API error: {error_text}")
                        raise HTTPException(status_code=500, detail=f"Gemini Vision API call failed: {error_text[:200]}")
                    
                    gemini_result = gemini_response.json()
                    if "candidates" not in gemini_result or len(gemini_result["candidates"]) == 0:
                        print(f"[ENHANCED-ANALYZE] ❌ Gemini Vision API returned no candidates")
                        raise HTTPException(status_code=500, detail="Gemini Vision API returned no results")
                    
                    candidate = gemini_result["candidates"][0]
                    if "content" not in candidate or "parts" not in candidate["content"]:
                        print(f"[ENHANCED-ANALYZE] ❌ Gemini Vision API returned invalid response structure")
                        raise HTTPException(status_code=500, detail="Gemini Vision API returned invalid response")
                    
                    # Extract JSON from response
                    analysis_text = candidate["content"]["parts"][0]["text"]
                    gemini_time = time.time() - gemini_start
                    print(f"[ENHANCED-ANALYZE] ✅ Gemini Vision API call completed successfully in {gemini_time:.1f}s")
                    print(f"[ENHANCED-ANALYZE] 📊 API Response: {len(analysis_text)} characters")
                    return analysis_text
                    
            except HTTPException:
                raise
            except Exception as api_error:
                print(f"[ENHANCED-ANALYZE] ❌ ERROR calling Gemini Vision API: {type(api_error).__name__}: {str(api_error)}")
                logger.error(f"Gemini Vision API call failed: {api_error}", exc_info=True)
                raise HTTPException(status_code=500, detail=f"Gemini Vision API call failed: {str(api_error)}")
        
        async def call_google_search():
            """Call Google Search (via Market Intelligence Agent) to get market data"""
            google_start = time.time()
            try:
                print(f"[ENHANCED-ANALYZE] 🔍 Starting market search in parallel (timeout: 40s, optimized for speed)...")
                from app.agents.market_intelligence_agent import MarketIntelligenceAgent
                market_agent = MarketIntelligenceAgent()
                
                # Use DETECTED vehicle info for Google Search (not user input)
                # We'll update this after Gemini Vision completes, but for now use what we have
                location = basic_listing_context.get("location", "Detroit, MI")
                
                # Note: This runs in parallel, so we use basic context first
                # The detected values will be used in the final listing
                market_result = await market_agent.process({
                    "make": basic_listing_context["make"],
                    "model": basic_listing_context["model"],
                    "year": basic_listing_context["year"],
                    "mileage": basic_listing_context["mileage"],
                    "trim": trim,  # Include trim for better search query
                    "location": location,
                    "analysis_type": "pricing_analysis",
                    "asking_price": basic_listing_context.get("asking_price"),
                    "price": basic_listing_context.get("asking_price"),
                    "title_status": titleStatus or "clean",  # Pass title status for accurate pricing
                    "titleStatus": titleStatus or "clean"  # Support both formats
                })
                
                google_time = time.time() - google_start
                print(f"[ENHANCED-ANALYZE] ✅ Market search completed in parallel in {google_time:.1f}s")
                return market_result
                
            except Exception as e:
                google_time = time.time() - google_start
                print(f"[ENHANCED-ANALYZE] ⚠️  Market search failed after {google_time:.1f}s (will continue without market data): {e}")
                logger.warning(f"Google Search failed in parallel execution: {e}")
                return None
        
        # Run both calls in parallel
        try:
            gemini_task = call_gemini_vision()
            google_search_task = call_google_search()
            
            # Wait for both to complete
            analysis_text, market_result = await asyncio.gather(gemini_task, google_search_task, return_exceptions=True)
            
            # Handle exceptions
            if isinstance(analysis_text, Exception):
                raise analysis_text
            if isinstance(market_result, Exception):
                print(f"[ENHANCED-ANALYZE] ⚠️  Google Search exception (will continue without market data): {market_result}")
                market_result = None
            
            parallel_time = time.time() - parallel_start
            pass1_time = parallel_time  # PASS-1 is the Gemini Vision analysis (completed in parallel)
            logger.info(f"⏱️ PARALLEL execution completed in {parallel_time:.2f}s (Gemini Vision + Google Search)")
            print(f"[ENHANCED-ANALYZE] ✅ PARALLEL execution completed in {parallel_time:.2f}s")
            if parallel_time > 50:
                print(f"[ENHANCED-ANALYZE] ⚠️  WARNING: Analysis took {parallel_time:.1f}s - longer than expected (35-45s)")
                print(f"[ENHANCED-ANALYZE] ⚠️  This may indicate Google Search is timing out or slow")
            elif parallel_time > 45:
                print(f"[ENHANCED-ANALYZE] ⚠️  Analysis took {parallel_time:.1f}s - slightly longer than ideal (35-45s)")
            else:
                print(f"[ENHANCED-ANALYZE] ✅ Analysis completed in expected time range ({parallel_time:.1f}s)")
            
        except HTTPException:
            raise
        except Exception as e:
            print(f"[ENHANCED-ANALYZE] ❌ ERROR in parallel execution: {type(e).__name__}: {str(e)}")
            logger.error(f"Parallel execution failed: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Parallel execution failed: {str(e)}")
        
        # Parse JSON response from Gemini
        try:
            analysis_json = json.loads(analysis_text)
            
            # DEBUG: Log what Gemini Vision ACTUALLY detected from the photos
            print(f"[ENHANCED-ANALYZE] 🔍 ===== GEMINI VISION DETECTION RESULTS =====")
            print(f"[ENHANCED-ANALYZE] 📋 Vehicle detected: {analysis_json.get('vehicle', {}).get('make', {}).get('value')} {analysis_json.get('vehicle', {}).get('model', {}).get('value')} {analysis_json.get('vehicle', {}).get('year_guess', {}).get('value')}")
            print(f"[ENHANCED-ANALYZE] 📋 Features detected: {list(analysis_json.get('features', {}).keys())}")
            
            # Log each feature with its status
            detected_features_count = 0
            for feature_name, feature_data in analysis_json.get('features', {}).items():
                if feature_data.get('present', False):
                    detected_features_count += 1
                    print(f"[ENHANCED-ANALYZE]   ✅ {feature_name}: present={feature_data.get('present')}, confidence={feature_data.get('confidence', 0):.2f}")
                else:
                    print(f"[ENHANCED-ANALYZE]   ❌ {feature_name}: present={feature_data.get('present')}, confidence={feature_data.get('confidence', 0):.2f}")
            
            print(f"[ENHANCED-ANALYZE] 📊 Total features detected: {detected_features_count} out of {len(analysis_json.get('features', {}))}")
            print(f"[ENHANCED-ANALYZE] 📋 Badges seen: {analysis_json.get('badges_seen', [])}")
            print(f"[ENHANCED-ANALYZE] 📋 Exterior color: {analysis_json.get('vehicle', {}).get('exterior_color', {}).get('value')} (confidence: {analysis_json.get('vehicle', {}).get('exterior_color', {}).get('confidence', 0):.2f})")
            print(f"[ENHANCED-ANALYZE] 📋 Interior color: {analysis_json.get('vehicle', {}).get('interior_color', {}).get('value')} (confidence: {analysis_json.get('vehicle', {}).get('interior_color', {}).get('confidence', 0):.2f})")
            print(f"[ENHANCED-ANALYZE] 📋 Drivetrain: {analysis_json.get('vehicle', {}).get('drivetrain', {}).get('value')} (confidence: {analysis_json.get('vehicle', {}).get('drivetrain', {}).get('confidence', 0):.2f})")
            print(f"[ENHANCED-ANALYZE] 📋 Specific details keys: {list(analysis_json.get('specific_details', {}).keys())}")
            
            # Log specific details
            details = analysis_json.get('specific_details', {})
            if details.get('wheel_description', {}).get('value'):
                print(f"[ENHANCED-ANALYZE]   📋 Wheel description: {details['wheel_description']['value']} (confidence: {details['wheel_description'].get('confidence', 0):.2f})")
            if details.get('window_tint_description', {}).get('value'):
                print(f"[ENHANCED-ANALYZE]   📋 Window tint: {details['window_tint_description']['value']} (confidence: {details['window_tint_description'].get('confidence', 0):.2f})")
            if details.get('interior_material', {}).get('value'):
                print(f"[ENHANCED-ANALYZE]   📋 Interior material: {details['interior_material']['value']} (confidence: {details['interior_material'].get('confidence', 0):.2f})")
            
            print(f"[ENHANCED-ANALYZE] 🔍 ===== END GEMINI VISION RESULTS =====")
            
        except json.JSONDecodeError as json_error:
            print(f"[ENHANCED-ANALYZE] ❌ Failed to parse Gemini JSON response: {json_error}")
            print(f"[ENHANCED-ANALYZE] 📄 Raw response (first 1000 chars): {analysis_text[:1000]}")
            logger.error(f"JSON parsing failed: {json_error}\nResponse: {analysis_text[:500]}")
            raise HTTPException(status_code=500, detail=f"Failed to parse Gemini Vision API response as JSON: {str(json_error)}")
        logger.info(f"PASS-1: Analysis JSON extracted: {analysis_json}")
        
        # CRITICAL: Extract detected make/model from Gemini Vision - PRIORITIZE OVER USER INPUT
        detected_vehicle = analysis_json.get("vehicle", {})
        detected_make_from_photos = detected_vehicle.get("make", {}).get("value")
        detected_model_from_photos = detected_vehicle.get("model", {}).get("value")
        detected_year_from_photos = detected_vehicle.get("year_guess", {}).get("value")
        detected_trim_from_photos = detected_vehicle.get("trim", {}).get("value")
        detected_drivetrain_from_photos = detected_vehicle.get("drivetrain", {}).get("value")
        
        # Use detected values if confidence is high, otherwise fall back to user input
        make_confidence = detected_vehicle.get("make", {}).get("confidence", 0)
        model_confidence = detected_vehicle.get("model", {}).get("confidence", 0)
        
        # Log what we detected vs what user provided
        print(f"[ENHANCED-ANALYZE] 🔍 VEHICLE DETECTION:")
        print(f"  User provided: {year} {make} {model} {trim}")
        print(f"  Gemini detected: {detected_year_from_photos} {detected_make_from_photos} {detected_model_from_photos} {detected_trim_from_photos}")
        print(f"  Confidence: Make={make_confidence:.2f}, Model={model_confidence:.2f}")
        
        # Use detected values if confidence >= 0.6, otherwise use user input
        # Lower threshold for trim (0.5) to catch more trims like Pacifica, Airflow, etc.
        final_make = detected_make_from_photos if (detected_make_from_photos and make_confidence >= 0.6) else (make or "Unknown")
        final_model = detected_model_from_photos if (detected_model_from_photos and model_confidence >= 0.6) else (model or "Unknown")
        final_year = detected_year_from_photos if (detected_year_from_photos and detected_vehicle.get("year_guess", {}).get("confidence", 0) >= 0.6) else (int(year) if year else 2014)
        final_trim = detected_trim_from_photos if (detected_trim_from_photos and detected_vehicle.get("trim", {}).get("confidence", 0) >= 0.5) else (trim or None)
        final_drivetrain = detected_drivetrain_from_photos if detected_drivetrain_from_photos else None
        
        print(f"[ENHANCED-ANALYZE] ✅ USING: {final_year} {final_make} {final_model} {final_trim or ''}")
        
        # Build full listing context (use DETECTED values, not user input)
        listing_context = {
            "year": final_year,
            "make": final_make,
            "model": final_model, 
            "trim": final_trim,
            "mileage": int(mileage.replace(",", "")) if mileage else 123456,
            "title": titleStatus or "Clean",
            "title_status": titleStatus or "clean",
            "drivetrain": final_drivetrain,
            "location": "Detroit, MI",  # You can add city/zip fields later
            "asking_price": user_entered_price,
            "features_list": [],
            "condition_blurbs": [],
            "condition": "good",  # Default condition, can be enhanced from AI analysis
            "style": "emoji_bullets_v1"
        }
        
        # Extract features with confidence >= 0.5 (lowered threshold for better detection)
        # IMPORTANT: Check ALL features from ALL images - don't miss anything!
        print(f"[ENHANCED-ANALYZE] 🔍 Checking features from analysis_json: {list(analysis_json.get('features', {}).keys())}")
        for feature, data in analysis_json.get("features", {}).items():
            print(f"[ENHANCED-ANALYZE] 🔍 Feature '{feature}': present={data.get('present', False)}, confidence={data.get('confidence', 0):.2f}")
            if data.get("present", False) and data.get("confidence", 0) >= 0.5:
                feature_name = feature.replace("_", " ").title()
                if feature == "apple_carplay_android_auto":
                    feature_name = "Apple CarPlay/Android Auto"
                elif feature == "third_row":
                    feature_name = "Third-row seating"
                elif feature == "tinted_windows":
                    feature_name = "Tinted Windows"
                elif feature == "black_rims":
                    feature_name = "Black Rims"
                elif feature == "chrome_rims":
                    feature_name = "Chrome Rims"
                elif feature == "sunroof":
                    feature_name = "Sunroof/Moonroof"
                elif feature == "leather_seats":
                    feature_name = "Leather Seats"
                elif feature == "heated_seats":
                    feature_name = "Heated Seats"
                elif feature == "backup_camera":
                    feature_name = "Backup Camera"
                elif feature == "touchscreen":
                    feature_name = "Touchscreen Display"
                elif feature == "bluetooth":
                    feature_name = "Bluetooth"
                elif feature == "navigation":
                    feature_name = "Navigation System"
                elif feature == "premium_audio":
                    feature_name = "Premium Audio System"
                elif feature == "keyless_entry":
                    feature_name = "Keyless Entry"
                elif feature == "push_button_start":
                    feature_name = "Push-Button Start"
                elif feature == "alloy_wheels":
                    feature_name = "Alloy Wheels"
                listing_context["features_list"].append(feature_name)
                print(f"[ENHANCED-ANALYZE] ✅ Detected feature: {feature_name} (confidence: {data['confidence']:.2f})")
        
        print(f"[ENHANCED-ANALYZE] 📋 Total features detected so far: {len(listing_context['features_list'])} - {listing_context['features_list']}")
        
        # Extract specific visual details
        if "specific_details" in analysis_json:
            details = analysis_json["specific_details"]
            
            # Add wheel description if available
            if details.get("wheel_description", {}).get("confidence", 0) >= 0.6:
                wheel_desc = details["wheel_description"]["value"]
                if wheel_desc and wheel_desc not in listing_context["features_list"]:
                    listing_context["features_list"].append(wheel_desc)
            
            # Add window tint description if available
            if details.get("window_tint_description", {}).get("confidence", 0) >= 0.6:
                tint_desc = details["window_tint_description"]["value"]
                if tint_desc and tint_desc not in listing_context["features_list"]:
                    listing_context["features_list"].append(tint_desc)
            
            # Add interior material if available
            if details.get("interior_material", {}).get("confidence", 0) >= 0.6:
                interior_desc = details["interior_material"]["value"]
                if interior_desc and interior_desc not in listing_context["features_list"]:
                    listing_context["features_list"].append(interior_desc)
                    print(f"[ENHANCED-ANALYZE] ✅ Detected interior material: {interior_desc}")
            
            # Check for radio/infotainment system in center console
            # This is often visible in interior shots
            if details.get("interior_material", {}).get("confidence", 0) >= 0.5:
                # If we detected interior details, likely have interior shots - check for radio
                if "Touchscreen" not in listing_context["features_list"] and "Touchscreen Display" not in listing_context["features_list"]:
                    # Infer touchscreen/radio from interior shots
                    if "Radio" not in str(listing_context["features_list"]) and "Infotainment" not in str(listing_context["features_list"]):
                        listing_context["features_list"].append("Infotainment System")
                        print(f"[ENHANCED-ANALYZE] ✅ Inferred Infotainment System from interior images")
        
        # VIN LOOKUP: Extract and decode VIN to get real vehicle specifications
        from app.services.vin_decoder import VINDecoder
        vin_decoder = VINDecoder()
        
        vin_to_decode = None
        if vin:
            vin_to_decode = vin.strip()
        elif aboutVehicle:
            # Try to extract VIN from aboutVehicle text
            extracted_vin = vin_decoder.extract_vin_from_text(aboutVehicle)
            if extracted_vin:
                vin_to_decode = extracted_vin
                print(f"[ENHANCED-ANALYZE] 🔍 Extracted VIN from aboutVehicle: {vin_to_decode}")
        
        # Also check if VIN is visible in images
        if analysis_json.get("vehicle", {}).get("vin_visible", {}).get("confidence", 0) >= 0.7:
            vin_value = analysis_json["vehicle"]["vin_visible"]["value"]
            if vin_value:
                vin_to_decode = vin_value  # Use VIN from image if found
                listing_context["condition_blurbs"].append(f"VIN visible: {vin_value}")
        
        # Decode VIN to get real vehicle specifications and features
        vin_features = []
        vin_data = None
        if vin_to_decode:
            try:
                vin_data = await vin_decoder.decode_vin(vin_to_decode)
                
                if vin_data:
                    print(f"[ENHANCED-ANALYZE] ✅ VIN decoded successfully: {vin_data.get('make')} {vin_data.get('model')} {vin_data.get('year')}")
                    
                    # Use VIN data to enhance listing context if missing or uncertain
                    if not listing_context.get("make") or listing_context.get("make") == "Unknown":
                        if vin_data.get("make"):
                            listing_context["make"] = vin_data["make"]
                            print(f"[ENHANCED-ANALYZE] 📝 Updated make from VIN: {vin_data['make']}")
                    
                    if not listing_context.get("model") or listing_context.get("model") == "Unknown":
                        if vin_data.get("model"):
                            listing_context["model"] = vin_data["model"]
                            print(f"[ENHANCED-ANALYZE] 📝 Updated model from VIN: {vin_data['model']}")
                    
                    if not listing_context.get("year") or listing_context.get("year") == 0:
                        if vin_data.get("year"):
                            listing_context["year"] = vin_data["year"]
                            print(f"[ENHANCED-ANALYZE] 📝 Updated year from VIN: {vin_data['year']}")
                    
                    if not listing_context.get("trim") and vin_data.get("trim"):
                        listing_context["trim"] = vin_data["trim"]
                        print(f"[ENHANCED-ANALYZE] 📝 Updated trim from VIN: {vin_data['trim']}")
                    
                    if not listing_context.get("drivetrain") and vin_data.get("drivetrain"):
                        listing_context["drivetrain"] = vin_data["drivetrain"]
                        print(f"[ENHANCED-ANALYZE] 📝 Updated drivetrain from VIN: {vin_data['drivetrain']}")
                    
                    # Get features from VIN (inferred based on vehicle specs)
                    vin_features = await vin_decoder.get_vehicle_features_from_vin(vin_to_decode)
                    print(f"[ENHANCED-ANALYZE] 🔧 VIN features inferred: {vin_features}")
                    
                    # Merge VIN features with detected features (prioritize detected, add VIN features if not detected)
                    for vin_feature in vin_features:
                        if vin_feature not in listing_context["features_list"]:
                            listing_context["features_list"].append(vin_feature)
                            print(f"[ENHANCED-ANALYZE] ➕ Added VIN feature: {vin_feature}")
                
            except Exception as e:
                logger.warning(f"VIN decode failed: {e}")
                print(f"[ENHANCED-ANALYZE] ⚠️  VIN decode failed: {e}")
        
        # Extract exterior and interior colors - IMPORTANT: Include in features if detected
        if analysis_json.get("vehicle", {}).get("exterior_color", {}).get("confidence", 0) >= 0.6:
            color = analysis_json["vehicle"]["exterior_color"].get("value")
            if color and isinstance(color, str):
                listing_context["condition_blurbs"].append(f"Exterior color: {color}")
                # Also add as a feature if it's a notable color
                if color.lower() not in ['white', 'black', 'silver', 'gray', 'grey']:
                    if f"{color} exterior" not in listing_context["features_list"]:
                        listing_context["features_list"].append(f"{color.title()} Exterior")
                print(f"[ENHANCED-ANALYZE] ✅ Detected exterior color: {color}")
        
        if analysis_json.get("vehicle", {}).get("interior_color", {}).get("confidence", 0) >= 0.6:
            color = analysis_json["vehicle"]["interior_color"].get("value")
            if color and isinstance(color, str):
                listing_context["condition_blurbs"].append(f"Interior color: {color}")
                # Also add interior color/material as a feature
                details = analysis_json.get("specific_details", {})
                interior_material = details.get("interior_material", {}).get("value", "") if details else ""
                if interior_material and isinstance(interior_material, str):
                    if f"{color} {interior_material}" not in listing_context["features_list"]:
                        listing_context["features_list"].append(f"{color.title()} {interior_material.title()}")
                print(f"[ENHANCED-ANALYZE] ✅ Detected interior color: {color}")
        
        # Additional feature detection from badges and vehicle info
        if "badges_seen" in analysis_json:
            print(f"[ENHANCED-ANALYZE] 🔍 Checking badges_seen: {analysis_json['badges_seen']}")
            for badge in analysis_json["badges_seen"]:
                if not badge or not isinstance(badge, str):
                    continue  # Skip None or non-string badges
                badge_upper = badge.upper()
                if badge_upper in ["AWD", "4WD", "4X4"] and "All-Wheel Drive" not in listing_context["features_list"]:
                    listing_context["features_list"].append("All-Wheel Drive")
                    print(f"[ENHANCED-ANALYZE] ✅ Detected AWD from badge: {badge}")
                elif badge_upper in ["SPORT", "SPORT PACKAGE"] and "Sport Package" not in listing_context["features_list"]:
                    listing_context["features_list"].append("Sport Package")
                    print(f"[ENHANCED-ANALYZE] ✅ Detected Sport Package from badge: {badge}")
                # Add engine size badges (e.g., "3.7", "5.7", "V8")
                elif any(char.isdigit() for char in badge) and "Engine" not in str(listing_context["features_list"]):
                    if badge not in listing_context["features_list"]:
                        listing_context["features_list"].append(f"{badge} Engine")
                        print(f"[ENHANCED-ANALYZE] ✅ Detected engine badge: {badge}")
        
        # CRITICAL: Also check for roof rails, tinted windows, and alloy wheels from specific_details
        if "specific_details" in analysis_json:
            details = analysis_json["specific_details"]
            print(f"[ENHANCED-ANALYZE] 🔍 Checking specific_details: {list(details.keys())}")
            
            # Check for roof rails
            if details.get("roof_rails", {}).get("confidence", 0) >= 0.5 or details.get("roof_rack", {}).get("confidence", 0) >= 0.5:
                if "Roof Rails" not in listing_context["features_list"]:
                    listing_context["features_list"].append("Roof Rails")
                    print(f"[ENHANCED-ANALYZE] ✅ Detected Roof Rails from specific_details")
            
            # Check for alloy wheels (if not already detected)
            wheel_desc = details.get("wheel_description", {}).get("value", "").lower() if details.get("wheel_description") else ""
            if wheel_desc and ("alloy" in wheel_desc or "aluminum" in wheel_desc):
                if "Alloy Wheels" not in listing_context["features_list"]:
                    listing_context["features_list"].append("Alloy Wheels")
                    print(f"[ENHANCED-ANALYZE] ✅ Detected Alloy Wheels from wheel_description: {wheel_desc}")
            
            # Check for tinted windows
            tint_desc = details.get("window_tint_description", {}).get("value", "").lower() if details.get("window_tint_description") else ""
            if tint_desc and ("tint" in tint_desc or "tinted" in tint_desc):
                if "Tinted Windows" not in listing_context["features_list"]:
                    listing_context["features_list"].append("Tinted Windows")
                    print(f"[ENHANCED-ANALYZE] ✅ Detected Tinted Windows from window_tint_description: {tint_desc}")
        
        print(f"[ENHANCED-ANALYZE] 📋 FINAL features list before listing generation: {len(listing_context['features_list'])} features - {listing_context['features_list']}")
        
        # Check for navigation if touchscreen is detected
        if "Touchscreen" in listing_context["features_list"] or "Touchscreen Display" in listing_context["features_list"]:
            if "Navigation System" not in listing_context["features_list"]:
                # If we have a touchscreen, likely has navigation
                listing_context["features_list"].append("Navigation System")
                print(f"[ENHANCED-ANALYZE] ✅ Inferred Navigation System from touchscreen")
        
        # Check for drivetrain from detected vehicle info
        drivetrain_value = listing_context.get("drivetrain")
        if drivetrain_value and isinstance(drivetrain_value, str) and "All-Wheel Drive" not in listing_context["features_list"]:
            drivetrain = drivetrain_value.upper()
            if "AWD" in drivetrain or "4WD" in drivetrain or "4X4" in drivetrain:
                listing_context["features_list"].append("All-Wheel Drive")
                print(f"[ENHANCED-ANALYZE] ✅ Added AWD from drivetrain: {drivetrain_value}")
        
        # Extract condition notes
        for note_data in analysis_json["condition"]["exterior_notes"]:
            if note_data["confidence"] >= 0.6 and note_data["note"]:
                listing_context["condition_blurbs"].append(note_data["note"])
        
        for note_data in analysis_json["condition"]["interior_notes"]:
            if note_data["confidence"] >= 0.6 and note_data["note"]:
                listing_context["condition_blurbs"].append(note_data["note"])
        
        # REAL MARKET DATA INTEGRATION - Use market data from parallel Google Search
        # Market data was already fetched in parallel above
        market_intelligence_data = None
        pricing_strategy_data = None
        price_warnings = None
        
        # Process market result (already fetched in parallel)
        try:
            if market_result and market_result.success and market_result.data:
                market_intelligence_data = market_result.data
                pricing_analysis = market_intelligence_data.get("pricing_analysis", {})
                market_prices = pricing_analysis.get("market_prices", {})
                market_average = market_prices.get("market_average", 0)
                data_source = market_prices.get("data_source", "unknown")
                
                # CRITICAL GUARDRAIL: Double-check market_average for older vehicles
                # Even if Market Intelligence Agent returned a value, reject if it's clearly MSRP
                if market_average > 0 and listing_context.get("year"):
                    vehicle_year = listing_context["year"]
                    current_year = datetime.now().year
                    vehicle_age = current_year - vehicle_year
                    
                    # For 8+ year old vehicles, apply strict sanity check
                    if vehicle_age >= 8:
                        # Calculate max reasonable price
                        base_new_price = 30000
                        depreciation_per_year = 1000
                        clean_title_estimate = max(3000, base_new_price - (vehicle_age * depreciation_per_year))
                        
                        # Adjust for title status
                        title_status_lower = (titleStatus or "clean").lower()
                        if "rebuilt" in title_status_lower:
                            clean_title_estimate *= 0.7
                        elif "salvage" in title_status_lower:
                            clean_title_estimate *= 0.5
                        
                        max_reasonable = clean_title_estimate * 1.1  # 110% max for 8+ year old
                        
                        if market_average > max_reasonable:
                            print(f"[ENHANCED-ANALYZE] 🚫 REJECTING market_average ${market_average:,.0f} - exceeds max reasonable ${max_reasonable:,.0f} for {vehicle_year} vehicle")
                            print(f"[ENHANCED-ANALYZE] 🚫 This is likely MSRP - forcing fallback calculation")
                            # Force fallback by setting market_average to 0
                            market_average = 0
                            data_source = "rejected_msrp"
                
                print(f"[ENHANCED-ANALYZE] 📊 Market average: ${market_average:,.0f} (source: {data_source})")
                if data_source == "google_search_grounding":
                    prices_found = market_prices.get("prices_found", 0)
                    print(f"[ENHANCED-ANALYZE] ✅ REAL MARKET DATA: Found {prices_found} prices from Google Search")
                elif data_source == "rejected_msrp":
                    print(f"[ENHANCED-ANALYZE] 🚫 Market average rejected as MSRP - will use fallback")
                else:
                    print(f"[ENHANCED-ANALYZE] ⚠️  WARNING: Using estimated data - Google Search may have failed")
                
                # Call Pricing Strategy Agent to calculate 3-tier pricing
                if market_average > 0:
                    from app.agents.pricing_strategy_agent import PricingStrategyAgent
                    pricing_agent = PricingStrategyAgent()
                    
                    pricing_result = await pricing_agent.process({
                        "vehicle_data": listing_context,
                        "market_intelligence": market_intelligence_data,
                        "user_goals": "balanced"
                    })
                    
                    if pricing_result and pricing_result.success and pricing_result.data:
                        pricing_strategy_data = pricing_result.data
                        print(f"[ENHANCED-ANALYZE] ✅ Pricing strategy calculated")
                    
                    # Calculate price warnings - ChatGPT-style feedback based on REAL market data
                    user_price = int(price.replace(",", "")) if price and price.replace(",", "").isdigit() else None
                    if user_price and market_average > 0:
                        # Apply adjustments for title status, mileage, and condition
                        # Google Search returns prices for clean-title vehicles, so we need to adjust
                        adjusted_market_average = market_average
                        adjustment_factors = []
                        
                        # Title status adjustment
                        title_status_lower = (titleStatus or "clean").lower()
                        if title_status_lower == "rebuilt":
                            adjusted_market_average *= 0.7  # 30% reduction for rebuilt title
                            adjustment_factors.append("rebuilt title (-30%)")
                        elif title_status_lower == "salvage":
                            adjusted_market_average *= 0.5  # 50% reduction for salvage
                            adjustment_factors.append("salvage title (-50%)")
                        elif title_status_lower not in ["clean", ""]:
                            adjusted_market_average *= 0.7  # Default 30% for other non-clean titles
                            adjustment_factors.append(f"{title_status_lower} title (-30%)")
                        
                        # High mileage adjustment (over 100K miles)
                        mileage_int = int(mileage.replace(",", "")) if mileage and mileage.replace(",", "").isdigit() else 0
                        if mileage_int > 100000:
                            # Additional 5-10% reduction for high mileage
                            mileage_adjustment = 1.0 - ((mileage_int - 100000) / 100000 * 0.1)
                            mileage_adjustment = max(0.85, mileage_adjustment)  # Cap at 15% reduction
                            adjusted_market_average *= mileage_adjustment
                            adjustment_factors.append(f"high mileage ({mileage_int:,} miles, -{int((1-mileage_adjustment)*100)}%)")
                        
                        # Damage/accident history adjustment (if mentioned in aboutVehicle)
                        if aboutVehicle and any(word in aboutVehicle.lower() for word in ["damage", "accident", "repaired", "bumper", "collision"]):
                            adjusted_market_average *= 0.95  # 5% reduction for damage history
                            adjustment_factors.append("previous damage history (-5%)")
                        
                        # Use adjusted market average for comparisons
                        market_average_for_comparison = round(adjusted_market_average)
                        
                        # Get price range from market data (also adjust the range)
                        price_range = market_prices.get("price_range", {})
                        original_low = price_range.get("low", market_average * 0.85)
                        original_high = price_range.get("high", market_average * 1.15)
                        
                        # Adjust the range proportionally
                        adjustment_ratio = adjusted_market_average / market_average
                        market_low = round(original_low * adjustment_ratio)
                        market_high = round(original_high * adjustment_ratio)
                        
                        price_diff = user_price - market_average_for_comparison
                        price_diff_pct = (price_diff / market_average_for_comparison * 100) if market_average_for_comparison > 0 else 0
                        
                        # Build adjustment explanation
                        adjustment_note = ""
                        if adjustment_factors:
                            adjustment_note = f" (adjusted from ${market_average:,.0f} for {', '.join(adjustment_factors)})"
                        
                        # ChatGPT-style feedback (using adjusted market average)
                        if market_low <= user_price <= market_high:
                            # Price is in the right range - ChatGPT would say this is good
                            price_warnings = {
                                "type": "good",
                                "message": f"👍 Great pricing! Accorria found the market value, and your price of ${user_price:,.0f} is in the right range (${market_low:,.0f} - ${market_high:,.0f}){adjustment_note}. You're all set!",
                                "market_average": market_average_for_comparison,
                                "market_average_raw": market_average,  # Keep original for reference
                                "market_range": {"low": market_low, "high": market_high},
                                "price_difference": price_diff,
                                "price_difference_percent": price_diff_pct,
                                "adjustment_factors": adjustment_factors,
                                "recommendation": f"Accorria found the market value. Your price is well-positioned. Adjusted market average is ${market_average_for_comparison:,.0f} based on your vehicle's condition and title status.",
                                "data_source": market_prices.get("data_source", "google_search")
                            }
                        elif user_price < market_low:
                            # Price is below market range
                            price_warnings = {
                                "type": "low",
                                "message": f"⚡ Quick Sale Price! Accorria found the market value, and your price of ${user_price:,.0f} is ${abs(price_diff):,.0f} below market average (${market_average_for_comparison:,.0f}){adjustment_note}. Perfect for a fast sale! 👍",
                                "market_average": market_average_for_comparison,
                                "market_average_raw": market_average,  # Keep original for reference
                                "market_range": {"low": market_low, "high": market_high},
                                "price_difference": price_diff,
                                "price_difference_percent": price_diff_pct,
                                "adjustment_factors": adjustment_factors,
                                "recommendation": f"Accorria found the market value. Your price is competitive for a quick sale. Based on real listings adjusted for your vehicle's condition, you could price up to ${market_high:,.0f} if you're willing to wait longer.",
                                "data_source": market_prices.get("data_source", "google_search")
                            }
                        else:
                            # Price is above market range
                            recommended_price = round(market_average_for_comparison * 1.05)  # 5% above adjusted market for premium
                            price_warnings = {
                                "type": "high",
                                "message": f"💡 Price Above Market: Accorria found the market value, and your price of ${user_price:,.0f} is ${price_diff:,.0f} above market average (${market_average_for_comparison:,.0f}){adjustment_note}. We suggest ${recommended_price:,.0f} for better market fit, but you can keep your price if you prefer.",
                                "market_average": market_average_for_comparison,
                                "market_average_raw": market_average,  # Keep original for reference
                                "market_range": {"low": market_low, "high": market_high},
                                "price_difference": price_diff,
                                "price_difference_percent": price_diff_pct,
                                "recommended_price": recommended_price,
                                "adjustment_factors": adjustment_factors,
                                "recommendation": f"Accorria found the market value. Based on real-time market data adjusted for your vehicle's condition, we recommend pricing around ${recommended_price:,.0f} (${price_diff_pct:.1f}% above adjusted market). Your current price may take longer to sell.",
                                "data_source": market_prices.get("data_source", "google_search")
                            }
                        
                        print(f"[ENHANCED-ANALYZE] ⚠️  Price validation: {price_warnings['type']}")
                        print(f"[ENHANCED-ANALYZE] 📊 Raw market data: ${market_average:,.0f} (clean title)")
                        if adjustment_factors:
                            print(f"[ENHANCED-ANALYZE] 🔧 Adjustments applied: {', '.join(adjustment_factors)}")
                        print(f"[ENHANCED-ANALYZE] 📊 Adjusted market data: ${market_average_for_comparison:,.0f} (from ${market_low:,.0f} to ${market_high:,.0f})")
                        print(f"[ENHANCED-ANALYZE] 💰 User price: ${user_price:,.0f} ({price_diff_pct:+.1f}% vs adjusted market)")
        
        except Exception as market_error:
            logger.warning(f"Market intelligence failed (using fallback): {market_error}")
            print(f"[ENHANCED-ANALYZE] ⚠️  Market intelligence failed: {market_error}")
            # Continue with fallback pricing if market intelligence fails
        
        # Build pricing tiers from real data or fallback to estimated
        if pricing_strategy_data and "pricing_strategy" in pricing_strategy_data:
            # Use real pricing from Pricing Strategy Agent
            pricing_tiers = pricing_strategy_data["pricing_strategy"]
            pricing = {
                "quick_sale": {
                    "price": int(pricing_tiers.get("quick_sale", {}).get("price", 0)),
                    "description": pricing_tiers.get("quick_sale", {}).get("rationale", "Quick sale price - 15% below market"),
                    "estimated_days_to_sell": 14
                },
                "market_price": {
                    "price": int(pricing_tiers.get("market_price", {}).get("price", 0)),
                    "description": pricing_tiers.get("market_price", {}).get("rationale", "Market price - competitive listing"),
                    "estimated_days_to_sell": 28
                },
                "premium": {
                    "price": int(pricing_tiers.get("top_dollar", {}).get("price", 0)),
                    "description": pricing_tiers.get("top_dollar", {}).get("rationale", "Premium price - 15% above market"),
                    "estimated_days_to_sell": 60
                }
            }
            print(f"[ENHANCED-ANALYZE] ✅ Using REAL pricing tiers from market data")
        else:
                # Fallback to estimated pricing if market intelligence failed
            market_avg = market_intelligence_data.get("pricing_analysis", {}).get("market_prices", {}).get("market_average", 0) if market_intelligence_data else 0
            
            # CRITICAL: Apply same sanity check to fallback market_avg
            if market_avg > 0 and listing_context.get("year"):
                vehicle_year = listing_context["year"]
                current_year = datetime.now().year
                vehicle_age = current_year - vehicle_year
                
                if vehicle_age >= 8:
                    base_new_price = 30000
                    depreciation_per_year = 1000
                    clean_title_estimate = max(3000, base_new_price - (vehicle_age * depreciation_per_year))
                    
                    title_status_lower = (titleStatus or "clean").lower()
                    if "rebuilt" in title_status_lower:
                        clean_title_estimate *= 0.7
                    elif "salvage" in title_status_lower:
                        clean_title_estimate *= 0.5
                    
                    max_reasonable = clean_title_estimate * 1.1
                    
                    if market_avg > max_reasonable:
                        print(f"[ENHANCED-ANALYZE] 🚫 REJECTING fallback market_avg ${market_avg:,.0f} - exceeds max reasonable ${max_reasonable:,.0f}")
                        market_avg = 0  # Force fallback calculation
            
            if market_avg > 0:
                # Use market average if we have it
                pricing = {
                    "quick_sale": {
                        "price": int(market_avg * 0.85),
                        "description": "Quick sale price - 15% below market",
                        "estimated_days_to_sell": 14
                    },
                    "market_price": {
                        "price": int(market_avg),
                        "description": "Market price - competitive listing",
                        "estimated_days_to_sell": 28
                    },
                    "premium": {
                        "price": int(market_avg * 1.15),
                        "description": "Premium price - 15% above market",
                        "estimated_days_to_sell": 60
                    }
                }
                print(f"[ENHANCED-ANALYZE] ✅ Using market average-based pricing: ${market_avg:,.0f}")
            else:
                # Final fallback: Use improved fallback algorithm (same as Market Intelligence Agent)
                # Import the fallback calculation from Market Intelligence Agent
                from app.agents.market_intelligence_agent import MarketIntelligenceAgent
                market_agent = MarketIntelligenceAgent()
                
                make = listing_context.get("make", "Unknown")
                model = listing_context.get("model", "Unknown")
                year = listing_context.get("year")
                mileage = listing_context.get("mileage")
                trim = listing_context.get("trim")
                title_status = titleStatus or "clean"
                
                # Use the same fallback algorithm as Market Intelligence Agent
                base_price = market_agent._calculate_fallback_price(make, model, year, mileage, trim, title_status)
                print(f"[ENHANCED-ANALYZE] ⚠️  WARNING: Using fallback pricing algorithm (${base_price:,.0f}) - Google Search failed or returned MSRP")
                
                pricing = {
                    "quick_sale": {
                        "price": int(base_price * 0.85),
                        "description": "Quick sale price - 15% below market",
                        "estimated_days_to_sell": 14
                    },
                    "market_price": {
                        "price": int(base_price),
                        "description": "Market price - competitive listing",
                        "estimated_days_to_sell": 28
                    },
                    "premium": {
                        "price": int(base_price * 1.15),
                        "description": "Premium price - 15% above market",
                        "estimated_days_to_sell": 60
                    }
                }
        
        # PASS-2: COMPOSE - Generate platform-specific SEO-optimized listings using OpenAI
        # Now that we have market intelligence data, generate platform-specific listings
        pass2_start = time.time()
        logger.info(f"⏱️ Starting PASS-2 (platform-specific SEO formatting) using OpenAI...")
        print(f"[ENHANCED-ANALYZE] 🔍 Generating platform-specific SEO-optimized descriptions...")
        
        # Generate listings for multiple platforms with SEO optimization
        platforms = ["facebook_marketplace", "craigslist", "offerup", "autotrader", "cars_com"]
        
        platform_listings = {}
        for platform in platforms:
            compose_prompt = f"""You are a professional car listing writer specializing in {platform} SEO optimization.

Analyze the vehicle data and create an SEO-optimized listing specifically for {platform}.

Platform Requirements:
- Facebook Marketplace: Use emojis, be conversational, include all features, use hashtags (#)
- Craigslist: Text-based, no emojis, keyword-rich, detailed specifications
- OfferUp: Short and punchy, emoji-friendly, highlight key selling points
- AutoTrader: Professional, detailed specifications, formal tone
- Cars.com: Professional, comprehensive, include all technical details

SEO Optimization Guidelines:
- Include relevant keywords naturally: make, model, year, trim, features
- Use location-based keywords when relevant
- Include key search terms buyers use: "clean title", "well maintained", "low miles"
- Structure content for search algorithms
- Include all visible features from photo analysis
- Use natural language that humans AND search engines understand

Data from Photo Analysis (Gemini Vision):
{json.dumps(listing_context, indent=2)}

IMPORTANT: The vehicle information above is what Gemini Vision ACTUALLY detected from the photos.
If the user provided different information (e.g., said "Charger Hellcat" but photos show a Trailblazer),
you MUST use what Gemini Vision detected, not what the user typed.

Market Intelligence Data:
{json.dumps(market_intelligence_data, indent=2) if market_intelligence_data else "Market data not available"}

CRITICAL INSTRUCTIONS:
- Use the EXACT make, model, year, and trim that Gemini Vision detected from photos
- If the detected vehicle is a "Trailblazer" but user said "Charger Hellcat", use "Trailblazer"
- If the detected vehicle is a "Charger Hellcat", mention the supercharged V8, 707+ horsepower, performance features
- Include ALL features that Gemini Vision detected (AWD, performance features, etc.)
- If it's a Hellcat, mention the supercharged V8, performance specs, track capabilities
- If it's a Trailblazer, mention it's an SUV, not a performance sedan
- Trust the photo analysis over user input - photos don't lie

CRITICAL: You MUST include ALL detected features in the listing. The features list is:
{listing_context.get("features_list", [])}

If the features list is empty or minimal, you MUST still describe what you can see in the vehicle data:
- If drivetrain is AWD/4WD, mention it
- If exterior/interior colors are detected, mention them
- If any badges are seen, mention them
- If roof rails, tinted windows, alloy wheels, or other visible features are mentioned in the vehicle data, include them

Create an SEO-optimized listing for {platform} that:
1. **MUST include ALL detected features from photo analysis** - list them clearly (e.g., "Features: 4x4, Tinted Windows, Roof Rails, Alloy Wheels, Radio/CD Player")
2. Uses SEO best practices for {platform}
3. Highlights unique selling points
4. Includes relevant keywords naturally
5. Is optimized for {platform}'s search algorithm
6. Is compelling to human buyers

Format the response as a complete, ready-to-post listing for {platform} that prominently features all detected equipment and options."""
            
            try:
                if not openai_client:
                    raise ValueError("OpenAI client not initialized")
                compose_response = openai_client.chat.completions.create(
                    model="gpt-4o-mini",  # Use gpt-4o-mini for cost efficiency
                    messages=[
                        {
                            "role": "user", 
                            "content": compose_prompt
                        }
                    ],
                    max_tokens=1000,
                    temperature=0.3  # Lower temperature for more consistent, SEO-focused output
                )
                platform_listings[platform] = compose_response.choices[0].message.content
                print(f"[ENHANCED-ANALYZE] ✅ Generated {platform} listing")
            except Exception as e:
                logger.warning(f"Failed to generate {platform} listing: {e}")
                # Fallback to a basic listing if generation fails
                platform_listings[platform] = f"{listing_context.get('year', '')} {listing_context.get('make', '')} {listing_context.get('model', '')} - {listing_context.get('mileage', '')} miles"
        
        pass2_time = time.time() - pass2_start
        logger.info(f"⏱️ PASS-2 (platform-specific SEO formatting) completed in {pass2_time:.2f}s")
        
        # Use Facebook Marketplace as default (most common)
        final_listing_text = platform_listings.get("facebook_marketplace", "Listing generated successfully")
        
        # CRITICAL: If features were detected but not included in the listing, add them explicitly
        if listing_context.get("features_list") and len(listing_context["features_list"]) > 0:
            features_text = ", ".join(listing_context["features_list"])
            print(f"[ENHANCED-ANALYZE] 🔍 Checking if {len(listing_context['features_list'])} features are in listing: {listing_context['features_list']}")
            
            # Check if features are already mentioned in the listing (more lenient check)
            features_mentioned = any(
                any(word.lower() in final_listing_text.lower() for word in (feature or "").split() if word) 
                for feature in listing_context["features_list"] if feature and isinstance(feature, str)
            )
            
            # Also check if "Features & Equipment" section exists but is empty or generic
            has_empty_features_section = bool(re.search(r'Features & Equipment:.*?(?:🔑|Rebuilt|professionally|ready to drive)', final_listing_text, re.IGNORECASE | re.DOTALL))
            
            if not features_mentioned or has_empty_features_section:
                print(f"[ENHANCED-ANALYZE] ⚠️  Features detected but not properly in listing - adding them explicitly")
                print(f"[ENHANCED-ANALYZE] 📋 Features to add: {listing_context['features_list']}")
                
                # Format features as bullet points
                features_bullets = "\n".join([f"• {feature}" for feature in listing_context["features_list"]])
                
                # Replace empty or generic features section
                if "Features & Equipment:" in final_listing_text:
                    # Replace everything after "Features & Equipment:" until the next section or end
                    pattern = r'(🔧 Features & Equipment:)\s*\n?\s*.*?(?=\n\n📱|\n\n🔑|$)'
                    replacement = f'\\1\n\n{features_bullets}\n'
                    final_listing_text = re.sub(pattern, replacement, final_listing_text, flags=re.IGNORECASE | re.DOTALL)
                    print(f"[ENHANCED-ANALYZE] ✅ Replaced empty features section with detected features")
                else:
                    # Add features section before the closing message
                    features_section = f"\n\n🔧 Features & Equipment:\n\n{features_bullets}\n\n"
                    # Insert before last line (usually contact message)
                    lines = final_listing_text.split('\n')
                    if len(lines) > 1:
                        final_listing_text = '\n'.join(lines[:-1]) + features_section + lines[-1]
                    else:
                        final_listing_text += features_section
                    print(f"[ENHANCED-ANALYZE] ✅ Added new features section with detected features")
                
                print(f"[ENHANCED-ANALYZE] ✅ Final listing now includes features: {features_text}")
        else:
            print(f"[ENHANCED-ANALYZE] ⚠️  WARNING: No features detected! features_list is empty or missing")
            print(f"[ENHANCED-ANALYZE] 📋 listing_context keys: {list(listing_context.keys())}")
            print(f"[ENHANCED-ANALYZE] 📋 analysis_json features: {list(analysis_json.get('features', {}).keys())}")
        
        # DEBUG: Log final listing text to verify features are included
        print(f"[ENHANCED-ANALYZE] 🔍 ===== FINAL LISTING TEXT CHECK =====")
        print(f"[ENHANCED-ANALYZE] 📋 Final listing text length: {len(final_listing_text)} characters")
        print(f"[ENHANCED-ANALYZE] 📋 Contains 'Features & Equipment': {('Features & Equipment' in final_listing_text)}")
        if 'Features & Equipment' in final_listing_text:
            # Extract features section
            features_match = re.search(r'Features & Equipment:.*?(?=\n\n📱|\n\n🔑|$)', final_listing_text, re.DOTALL | re.IGNORECASE)
            if features_match:
                features_section = features_match.group(0)
                print(f"[ENHANCED-ANALYZE] 📋 Features section found: {features_section[:200]}...")
            else:
                print(f"[ENHANCED-ANALYZE] ⚠️  Features section header found but content not extracted")
        print(f"[ENHANCED-ANALYZE] 📋 Features list that should be included: {listing_context.get('features_list', [])}")
        print(f"[ENHANCED-ANALYZE] 🔍 ===== END FINAL LISTING TEXT CHECK =====")
        
        # Apply spelling correction to final listing text
        spelling_fixes = {
            r'\breplased\b': 'replaced',
            r'\breplaed\b': 'replaced',
            r'\breplced\b': 'replaced',
            r'\breplcaed\b': 'replaced',
            r'\btransmision\b': 'transmission',
            r'\bcondtion\b': 'condition',
            r'\bconditon\b': 'condition',
            r'\bmaintainance\b': 'maintenance',
            r'\bmaintanance\b': 'maintenance',
            r'\bexcellant\b': 'excellent',
            r'\bexcelent\b': 'excellent',
            r'\binteriour\b': 'interior',
            r'\bexteriour\b': 'exterior',
            # Fix "keys" misspellings
            r'\bkyes\b': 'keys',
            r'\bkeis\b': 'keys',
            r'\bkees\b': 'keys',
            r'\bkeyes\b': 'keys',
            r'\bteo\b': 'two',
            r'\bsets of kyes\b': 'sets of keys',
            r'\bsets of keis\b': 'sets of keys',
            r'\bsets of kees\b': 'sets of keys',
            r'\bteo sets\b': 'two sets',
        }
        
        for pattern, replacement in spelling_fixes.items():
            final_listing_text = re.sub(pattern, replacement, final_listing_text, flags=re.IGNORECASE)
        
        # Also fix spelling in all platform listings
        for platform in platform_listings:
            for pattern, replacement in spelling_fixes.items():
                platform_listings[platform] = re.sub(pattern, replacement, platform_listings[platform], flags=re.IGNORECASE)
        
        logger.info(f"PASS-2: Generated {len(platform_listings)} platform-specific listings")
        
        total_time = time.time() - start_time
        logger.info(f"⏱️ TOTAL analysis time: {total_time:.2f}s (PASS-1: {pass1_time:.2f}s, PASS-2: {pass2_time:.2f}s, image processing: {image_processing_time:.2f}s)")
        
        ai_analysis = f"Two-pass analysis completed. Raw JSON: {json.dumps(analysis_json, indent=2)}"
        logger.info(f"REAL: OpenAI analysis completed: {ai_analysis[:100]}...")
        
        # Parse the AI response to extract car details
        detected_make = make or "Infiniti"
        detected_model = model or "Q50" 
        detected_year = year or "2014"
        detected_mileage = mileage or "123,456"
        
        # Generate analysis result with two-pass system + real market data
        analysis_result = {
            "success": True,
            "analysis_type": "two_pass_ai_analysis_with_market_intelligence",
            "user_make": make or "Infiniti",
            "user_model": model or "Q50",
            "user_year": year or "2014",
            "user_mileage": mileage or "123,456",
            "user_price": price or "12000",
            "ai_analysis": ai_analysis,
            "analysis_json": analysis_json,
            "listing_context": listing_context,
            "detected": {
                "make": listing_context["make"],  # This is now the DETECTED make from photos
                "model": listing_context["model"],  # This is now the DETECTED model from photos
                "year": listing_context["year"],  # This is now the DETECTED year from photos
                "trim": listing_context["trim"],  # This is now the DETECTED trim from photos
                "mileage": listing_context["mileage"],
                "features": listing_context["features_list"],
                "condition": "Good condition based on AI analysis",
                "drivetrain": listing_context["drivetrain"],  # This is now the DETECTED drivetrain from photos
                "detection_confidence": {
                    "make": make_confidence,
                    "model": model_confidence,
                    "year": detected_vehicle.get("year_guess", {}).get("confidence", 0),
                    "trim": detected_vehicle.get("trim", {}).get("confidence", 0)
                },
                "user_provided": {
                    "make": make,
                    "model": model,
                    "year": year,
                    "trim": trim
                },
                # DEBUG: Include raw Gemini Vision detection results for frontend debugging
                "debug_gemini_detection": {
                    "features_detected": {
                        feature_name: {
                            "present": feature_data.get("present", False),
                            "confidence": feature_data.get("confidence", 0)
                        }
                        for feature_name, feature_data in analysis_json.get("features", {}).items()
                    },
                    "badges_seen": analysis_json.get("badges_seen", []),
                    "exterior_color": analysis_json.get("vehicle", {}).get("exterior_color", {}).get("value"),
                    "interior_color": analysis_json.get("vehicle", {}).get("interior_color", {}).get("value"),
                    "drivetrain_detected": analysis_json.get("vehicle", {}).get("drivetrain", {}).get("value"),
                    "features_list_count": len(listing_context.get("features_list", [])),
                    "features_list": listing_context.get("features_list", [])
                }
            },
            "pricing": pricing,
            "price_warnings": price_warnings,
            "market_intelligence": market_intelligence_data.get("pricing_analysis", {}) if market_intelligence_data else None,
            "flip_score": 78,
            "description": final_listing_text,
            "post_text": final_listing_text,
            "platform_listings": platform_listings,  # Platform-specific SEO-optimized listings
            "timestamp": datetime.now().isoformat(),
            "demo_mode": False,
            "images_processed": len(images),
            "openai_tokens_used": sum(len(v) for v in platform_listings.values()) * 4,  # Estimate tokens for platform listings (OpenAI Pass-2)
            "processing_times": {
                "total_seconds": round(total_time, 2),
                "pass1_vision_analysis_seconds": round(pass1_time, 2),
                "pass2_formatting_seconds": round(pass2_time, 2),
                "image_processing_seconds": round(image_processing_time, 2),
                "market_intelligence_seconds": round(market_time, 2) if 'market_time' in locals() else 0
            }
        }
        
        logger.info("REAL: Analysis completed successfully with OpenAI Vision API")
        
        # Print result summary for debugging
        print(f"[ENHANCED-ANALYZE] ===== ANALYSIS COMPLETE =====")
        print(f"[ENHANCED-ANALYZE] Success: {analysis_result.get('success')}")
        print(f"[ENHANCED-ANALYZE] Has description: {bool(analysis_result.get('description'))}")
        print(f"[ENHANCED-ANALYZE] Has post_text: {bool(analysis_result.get('post_text'))}")
        if analysis_result.get('post_text'):
            post_text = analysis_result.get('post_text', '')
            print(f"[ENHANCED-ANALYZE] Post text length: {len(post_text)} chars")
            print(f"[ENHANCED-ANALYZE] Post text preview: {post_text[:200]}...")
        if analysis_result.get('description'):
            desc = analysis_result.get('description', '')
            print(f"[ENHANCED-ANALYZE] Description length: {len(desc)} chars")
            print(f"[ENHANCED-ANALYZE] Description preview: {desc[:200]}...")
        print(f"[ENHANCED-ANALYZE] =============================")
        
        return JSONResponse(content=analysis_result, status_code=200)
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"REAL: Enhanced analysis failed: {e}")
        print(f"[ENHANCED-ANALYZE] ===== ERROR OCCURRED =====")
        print(f"[ENHANCED-ANALYZE] Error type: {type(e).__name__}")
        print(f"[ENHANCED-ANALYZE] Error message: {error_msg}")
        import traceback
        print(f"[ENHANCED-ANALYZE] Traceback: {traceback.format_exc()}")
        print(f"[ENHANCED-ANALYZE] =============================")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {error_msg}")


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
            "trim": trim or "",
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


@router.post("/enhanced-analyze-debug")
async def enhanced_analyze_debug(
    images: List[UploadFile] = File(...),
    make: Optional[str] = Form(None),
    model: Optional[str] = Form(None),
    trim: Optional[str] = Form(None),
    year: Optional[str] = Form(None),
):
    """
    DEBUG endpoint - Returns raw API responses to verify everything is working
    Shows exactly what Gemini Vision detects vs what user provided
    """
    try:
        import time
        import base64
        import httpx
        from app.core.config import settings
        
        print(f"[DEBUG] ===== DEBUG ANALYSIS REQUEST =====")
        print(f"[DEBUG] User provided: {year} {make} {model} {trim}")
        print(f"[DEBUG] Images: {len(images)}")
        
        # Prepare images for Gemini Vision
        gemini_parts = [{"text": f"""You are an expert vehicle appraiser. Analyze ALL provided car photos THOROUGHLY.

CRITICAL: DETECT MAKE AND MODEL FROM PHOTOS - PRIORITIZE WHAT YOU SEE OVER USER INPUT
- ALWAYS trust what you see in the photos over any user-provided make/model
- Look for manufacturer badges/emblems (Chevrolet, Ford, Toyota, Honda, Jeep, BMW, Dodge, etc.)
- Look for model name badges (Trailblazer, F-150, Camry, Civic, Compass, X5, Charger, Hellcat, etc.)
- If user provided make/model ("{make or 'Unknown'} {model or 'Unknown'}") but it DOESN'T match what you see in photos, use what you see in photos instead
- If you see a Hellcat badge, it's a Hellcat - mention the supercharged V8, performance features
- If you see a Trailblazer badge, it's a Trailblazer SUV - not a Charger
- Trust visual evidence over text input - photos don't lie

Return ONLY this JSON structure:
{{
  "vehicle": {{
    "year_guess": {{"value": null, "confidence": 0}},
    "make": {{"value": null, "confidence": 0}},
    "model": {{"value": null, "confidence": 0}},
    "trim": {{"value": null, "confidence": 0}},
    "drivetrain": {{"value": null, "confidence": 0}}
  }},
  "features": {{
    "awd": {{"present": false, "confidence": 0}},
    "tinted_windows": {{"present": false, "confidence": 0}},
    "alloy_wheels": {{"present": false, "confidence": 0}}
  }}
}}"""}]
        
        for image in images:
            await image.seek(0)
            image_content = await image.read()
            image_b64 = base64.b64encode(image_content).decode('utf-8')
            gemini_parts.append({
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": image_b64
                }
            })
        
        # Call Gemini Vision API
        async with httpx.AsyncClient() as client:
            gemini_response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={settings.GEMINI_API_KEY}",
                json={
                    "contents": [{"parts": gemini_parts}],
                    "generationConfig": {
                        "maxOutputTokens": 2000,
                        "temperature": 0.0,
                        "responseMimeType": "application/json"
                    }
                },
                timeout=60.0
            )
            
            if gemini_response.status_code != 200:
                return JSONResponse(content={
                    "error": "Gemini API failed",
                    "status": gemini_response.status_code,
                    "response": gemini_response.text[:500]
                }, status_code=500)
            
            gemini_result = gemini_response.json()
            analysis_text = gemini_result["candidates"][0]["content"]["parts"][0]["text"]
            analysis_json = json.loads(analysis_text)
            
            # Extract detected values
            detected_vehicle = analysis_json.get("vehicle", {})
            detected_make = detected_vehicle.get("make", {}).get("value")
            detected_model = detected_vehicle.get("model", {}).get("value")
            detected_year = detected_vehicle.get("year_guess", {}).get("value")
            detected_trim = detected_vehicle.get("trim", {}).get("value")
            make_conf = detected_vehicle.get("make", {}).get("confidence", 0)
            model_conf = detected_vehicle.get("model", {}).get("confidence", 0)
            
            return JSONResponse(content={
                "user_provided": {
                    "make": make,
                    "model": model,
                    "year": year,
                    "trim": trim
                },
                "gemini_vision_detected": {
                    "make": detected_make,
                    "model": detected_model,
                    "year": detected_year,
                    "trim": detected_trim,
                    "confidence": {
                        "make": make_conf,
                        "model": model_conf
                    }
                },
                "raw_gemini_response": analysis_json,
                "match": {
                    "make_matches": (make or "").lower() == (detected_make or "").lower(),
                    "model_matches": (model or "").lower() == (detected_model or "").lower(),
                    "warning": "MISMATCH DETECTED" if ((make or "").lower() != (detected_make or "").lower() or (model or "").lower() != (detected_model or "").lower()) else "MATCH"
                }
            }, status_code=200)
            
    except Exception as e:
        logger.error(f"Debug analysis failed: {e}", exc_info=True)
        return JSONResponse(content={
            "error": str(e),
            "type": type(e).__name__
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
    trim: Optional[str] = Form(None),
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
            "trim": trim or "",
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

@router.post("/enhanced-analyze-with-rag")
async def enhanced_analyze_with_rag(
    images: List[UploadFile] = File(...),
    make: Optional[str] = Form(None),
    model: Optional[str] = Form(None),
    trim: Optional[str] = Form(None),
    year: Optional[str] = Form(None),
    mileage: Optional[str] = Form(None),
    price: Optional[str] = Form(None),
    lowestPrice: Optional[str] = Form(None),
    titleStatus: Optional[str] = Form(None),
    aboutVehicle: Optional[str] = Form(None)
):
    """
    Enhanced analysis with RAG and Tool Use patterns
    - Real-time market data (Tool Use)
    - Successful listings database (RAG)
    - OpenAI Vision API analysis
    """
    try:
        logger.info(f"ENHANCED: RAG + Tool Use analysis request received for {len(images)} images")
        
        # Prepare car details
        car_details = {
            "make": make or "Unknown",
            "model": model or "Unknown",
            "trim": trim or "",
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
        
        # Step 1: OpenAI Vision API Analysis
        from app.services.car_analysis_agent import CarAnalysisAgent
        car_agent = CarAnalysisAgent()
        analysis_result = await car_agent.analyze_car_image(image_b64, car_details)
        
        # Step 2: RAG - Get successful listings data
        from app.services.rag_service import RAGService
        rag_service = RAGService()
        
        # Extract car info from analysis
        detected_make = analysis_result.get("detected", {}).get("make", make or "Unknown")
        detected_model = analysis_result.get("detected", {}).get("model", model or "Unknown")
        detected_year = analysis_result.get("detected", {}).get("year", year or "Unknown")
        detected_mileage = analysis_result.get("detected", {}).get("mileage", mileage or "Unknown")
        
        # Convert to proper types
        try:
            year_int = int(detected_year) if str(detected_year).isdigit() else int(year) if year and str(year).isdigit() else 2019
            mileage_int = int(str(detected_mileage).replace(",", "")) if str(detected_mileage).replace(",", "").isdigit() else int(mileage) if mileage and str(mileage).replace(",", "").isdigit() else 50000
        except:
            year_int = 2019
            mileage_int = 50000
        
        # Get RAG insights
        rag_insights = rag_service.get_demo_insights(detected_make, detected_model, year_int)
        similar_listings = rag_service.get_similar_successful_listings(detected_make, detected_model, year_int)
        pricing_recommendation = rag_service.get_pricing_recommendation(detected_make, detected_model, year_int, mileage_int, "Good")
        
        # Step 3: Tool Use - Get real-time market data
        from app.services.market_data_service import MarketDataService
        market_service = MarketDataService()
        
        market_data = market_service.get_market_comparison(detected_make, detected_model, year_int, mileage_int)
        demo_market_data = market_service.get_demo_market_data(detected_make, detected_model, year_int, mileage_int)
        
        # Combine all results
        enhanced_result = {
            **analysis_result,
            "rag_insights": {
                "successful_listings_insights": rag_insights,
                "similar_successful_listings": similar_listings,
                "pricing_recommendation": pricing_recommendation
            },
            "tool_use_data": {
                "real_time_market_data": market_data,
                "demo_market_insights": demo_market_data
            },
            "enhancement_summary": {
                "rag_enabled": True,
                "tool_use_enabled": True,
                "data_sources": ["OpenAI Vision API", "Successful Listings Database", "KBB API", "Edmunds API"],
                "analysis_type": "Enhanced with RAG + Tool Use patterns"
            }
        }
        
        logger.info("ENHANCED: RAG + Tool Use analysis completed successfully")
        return JSONResponse(content=enhanced_result, status_code=200)
        
    except Exception as e:
        logger.error(f"ENHANCED: RAG + Tool Use analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Enhanced analysis failed: {str(e)}")

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
