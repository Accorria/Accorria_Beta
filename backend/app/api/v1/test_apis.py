"""
API Connectivity Test Endpoint

Tests connectivity and functionality of all integrated external APIs
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse
import logging
import time
from typing import Dict, Any
import os

from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/test-apis")
async def test_all_apis():
    """
    Test connectivity and functionality of all external APIs
    
    Returns:
        JSON response with status of each API including:
        - Connection status
        - Response time
        - Error messages (if any)
        - Configuration status
    """
    results = {
        "timestamp": time.time(),
        "apis": {}
    }
    
    # Test 1: OpenAI API
    try:
        logger.info("Testing OpenAI API...")
        start_time = time.time()
        
        if not settings.OPENAI_API_KEY:
            results["apis"]["openai"] = {
                "status": "not_configured",
                "configured": False,
                "error": "OPENAI_API_KEY not set in environment",
                "purpose": "Image analysis, chat, text generation",
                "response_time_ms": None
            }
        else:
            try:
                import openai
                client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
                
                # Simple test call - list models
                test_response = client.models.list()
                response_time = (time.time() - start_time) * 1000  # Convert to ms
                
                # Check if gpt-4o is available
                model_names = [model.id for model in test_response.data]
                has_gpt4o = any("gpt-4o" in name or "gpt-4" in name for name in model_names)
                
                results["apis"]["openai"] = {
                    "status": "connected",
                    "configured": True,
                    "response_time_ms": round(response_time, 2),
                    "models_available": len(model_names),
                    "has_gpt4o": has_gpt4o,
                    "purpose": "Image analysis (Vision API), chat, text generation",
                    "usage": "Primary API for car image analysis and AI features",
                    "error": None
                }
                logger.info(f"✅ OpenAI API test successful ({response_time:.2f}ms)")
                
            except Exception as e:
                response_time = (time.time() - start_time) * 1000
                results["apis"]["openai"] = {
                    "status": "error",
                    "configured": True,
                    "response_time_ms": round(response_time, 2),
                    "error": str(e),
                    "purpose": "Image analysis, chat, text generation",
                    "usage": "Primary API for car image analysis"
                }
                logger.error(f"❌ OpenAI API test failed: {e}")
                
    except Exception as e:
        results["apis"]["openai"] = {
            "status": "test_failed",
            "configured": False,
            "error": f"Test execution failed: {str(e)}",
            "purpose": "Image analysis, chat, text generation"
        }
        logger.error(f"❌ OpenAI API test execution failed: {e}")
    
    # Test 2: Supabase
    try:
        logger.info("Testing Supabase...")
        start_time = time.time()
        
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            results["apis"]["supabase"] = {
                "status": "not_configured",
                "configured": False,
                "error": "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set",
                "purpose": "Database and user authentication",
                "response_time_ms": None
            }
        else:
            try:
                from supabase import create_client
                client = create_client(
                    supabase_url=settings.SUPABASE_URL,
                    supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY
                )
                
                # Simple test - try to query a table (this will fail gracefully if tables don't exist)
                # Just check if we can connect
                test_response = client.table("_test_connection").select("*").limit(1).execute()
                response_time = (time.time() - start_time) * 1000
                
                results["apis"]["supabase"] = {
                    "status": "connected",
                    "configured": True,
                    "response_time_ms": round(response_time, 2),
                    "url": settings.SUPABASE_URL,
                    "purpose": "Database and user authentication",
                    "usage": "Primary database and auth system",
                    "error": None
                }
                logger.info(f"✅ Supabase test successful ({response_time:.2f}ms)")
                
            except Exception as e:
                response_time = (time.time() - start_time) * 1000
                error_str = str(e)
                # Check if it's a connection error vs table not found
                if "relation" in error_str.lower() or "does not exist" in error_str.lower():
                    # Connection works, just table doesn't exist (this is OK for connection test)
                    results["apis"]["supabase"] = {
                        "status": "connected",
                        "configured": True,
                        "response_time_ms": round(response_time, 2),
                        "url": settings.SUPABASE_URL,
                        "purpose": "Database and user authentication",
                        "usage": "Primary database and auth system",
                        "note": "Connection successful (table query failed, but that's expected for connection test)",
                        "error": None
                    }
                    logger.info(f"✅ Supabase connection test successful ({response_time:.2f}ms)")
                else:
                    results["apis"]["supabase"] = {
                        "status": "error",
                        "configured": True,
                        "response_time_ms": round(response_time, 2),
                        "error": error_str,
                        "purpose": "Database and user authentication"
                    }
                    logger.error(f"❌ Supabase test failed: {e}")
                    
    except Exception as e:
        results["apis"]["supabase"] = {
            "status": "test_failed",
            "configured": False,
            "error": f"Test execution failed: {str(e)}",
            "purpose": "Database and user authentication"
        }
        logger.error(f"❌ Supabase test execution failed: {e}")
    
    # Test 3: Google Cloud Vision API
    try:
        logger.info("Testing Google Cloud Vision API...")
        start_time = time.time()
        
        google_creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        
        if not google_creds_path:
            results["apis"]["google_vision"] = {
                "status": "not_configured",
                "configured": False,
                "error": "GOOGLE_APPLICATION_CREDENTIALS not set",
                "purpose": "Alternative image analysis (optional)",
                "response_time_ms": None
            }
        else:
            try:
                from google.cloud import vision
                
                # Check if credentials file exists
                if not os.path.exists(google_creds_path):
                    results["apis"]["google_vision"] = {
                        "status": "error",
                        "configured": True,
                        "error": f"Credentials file not found at {google_creds_path}",
                        "purpose": "Alternative image analysis (optional)",
                        "response_time_ms": None
                    }
                else:
                    # Try to initialize client (this will validate credentials)
                    client = vision.ImageAnnotatorClient()
                    response_time = (time.time() - start_time) * 1000
                    
                    results["apis"]["google_vision"] = {
                        "status": "connected",
                        "configured": True,
                        "response_time_ms": round(response_time, 2),
                        "credentials_path": google_creds_path,
                        "purpose": "Alternative image analysis (optional)",
                        "usage": "Fallback/secondary image analysis",
                        "error": None
                    }
                    logger.info(f"✅ Google Vision API test successful ({response_time:.2f}ms)")
                    
            except Exception as e:
                response_time = (time.time() - start_time) * 1000
                results["apis"]["google_vision"] = {
                    "status": "error",
                    "configured": True,
                    "response_time_ms": round(response_time, 2),
                    "error": str(e),
                    "purpose": "Alternative image analysis (optional)"
                }
                logger.error(f"❌ Google Vision API test failed: {e}")
                
    except ImportError:
        results["apis"]["google_vision"] = {
            "status": "not_installed",
            "configured": False,
            "error": "google-cloud-vision package not installed",
            "purpose": "Alternative image analysis (optional)"
        }
    except Exception as e:
        results["apis"]["google_vision"] = {
            "status": "test_failed",
            "configured": False,
            "error": f"Test execution failed: {str(e)}",
            "purpose": "Alternative image analysis (optional)"
        }
        logger.error(f"❌ Google Vision API test execution failed: {e}")
    
    # Test 4: Facebook OAuth/API
    try:
        logger.info("Testing Facebook API configuration...")
        
        facebook_app_id = os.getenv("FACEBOOK_APP_ID")
        facebook_app_secret = os.getenv("FACEBOOK_APP_SECRET")
        
        if not facebook_app_id or not facebook_app_secret:
            results["apis"]["facebook"] = {
                "status": "not_configured",
                "configured": False,
                "error": "FACEBOOK_APP_ID or FACEBOOK_APP_SECRET not set",
                "purpose": "Facebook OAuth and Marketplace posting",
                "response_time_ms": None
            }
        else:
            results["apis"]["facebook"] = {
                "status": "configured",
                "configured": True,
                "app_id": facebook_app_id[:8] + "..." if facebook_app_id else None,
                "purpose": "Facebook OAuth and Marketplace posting",
                "usage": "Posting to Facebook Marketplace (user accounts)",
                "note": "Credentials configured - full test requires OAuth flow",
                "error": None
            }
            logger.info("✅ Facebook API credentials configured")
            
    except Exception as e:
        results["apis"]["facebook"] = {
            "status": "test_failed",
            "configured": False,
            "error": f"Test execution failed: {str(e)}",
            "purpose": "Facebook OAuth and Marketplace posting"
        }
        logger.error(f"❌ Facebook API test execution failed: {e}")
    
    # Test 5: Gemini API (for Vision and Google Search)
    try:
        logger.info("Testing Gemini API...")
        start_time = time.time()
        
        if not settings.GEMINI_API_KEY:
            results["apis"]["gemini"] = {
                "status": "not_configured",
                "configured": False,
                "error": "GEMINI_API_KEY not set in environment",
                "purpose": "Image analysis (Vision API) and Google Search Grounding",
                "response_time_ms": None
            }
        else:
            try:
                import httpx
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}",
                        json={
                            "contents": [{
                                "parts": [{"text": "Say 'Hello' in one word"}]
                            }],
                            "generationConfig": {
                                "maxOutputTokens": 10,
                                "temperature": 0.1
                            }
                        },
                        timeout=10.0
                    )
                    
                    response_time = (time.time() - start_time) * 1000
                    
                    if response.status_code == 200:
                        results["apis"]["gemini"] = {
                            "status": "connected",
                            "configured": True,
                            "response_time_ms": round(response_time, 2),
                            "purpose": "Image analysis (Vision API) and Google Search Grounding",
                            "usage": "Primary API for car image analysis and market data",
                            "error": None
                        }
                        logger.info(f"✅ Gemini API test successful ({response_time:.2f}ms)")
                    else:
                        results["apis"]["gemini"] = {
                            "status": "error",
                            "configured": True,
                            "response_time_ms": round(response_time, 2),
                            "error": f"Status {response.status_code}: {response.text[:100]}",
                            "purpose": "Image analysis (Vision API) and Google Search Grounding"
                        }
                        logger.error(f"❌ Gemini API test failed: {response.status_code}")
                        
            except Exception as e:
                response_time = (time.time() - start_time) * 1000
                results["apis"]["gemini"] = {
                    "status": "error",
                    "configured": True,
                    "response_time_ms": round(response_time, 2),
                    "error": str(e),
                    "purpose": "Image analysis (Vision API) and Google Search Grounding"
                }
                logger.error(f"❌ Gemini API test failed: {e}")
                
    except Exception as e:
        results["apis"]["gemini"] = {
            "status": "test_failed",
            "configured": False,
            "error": f"Test execution failed: {str(e)}",
            "purpose": "Image analysis (Vision API) and Google Search Grounding"
        }
        logger.error(f"❌ Gemini API test execution failed: {e}")
    
    # Test 6: Google Search Grounding (via Gemini)
    try:
        logger.info("Testing Google Search Grounding...")
        start_time = time.time()
        
        if not settings.GEMINI_API_KEY:
            results["apis"]["google_search"] = {
                "status": "not_configured",
                "configured": False,
                "error": "GEMINI_API_KEY not set (required for Google Search)",
                "purpose": "Real-time market pricing data via Google Search",
                "response_time_ms": None
            }
        else:
            try:
                import httpx
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}",
                        json={
                            "contents": [{
                                "parts": [{
                                    "text": "Search Google for: '2020 Nissan Rogue price'. Return just the market average price as a number."
                                }]
                            }],
                            "tools": [{
                                "googleSearch": {}
                            }],
                            "generationConfig": {
                                "maxOutputTokens": 50,
                                "temperature": 0.1
                            }
                        },
                        timeout=30.0
                    )
                    
                    response_time = (time.time() - start_time) * 1000
                    
                    if response.status_code == 200:
                        results["apis"]["google_search"] = {
                            "status": "connected",
                            "configured": True,
                            "response_time_ms": round(response_time, 2),
                            "purpose": "Real-time market pricing data via Google Search",
                            "usage": "Getting current market prices for vehicles",
                            "error": None
                        }
                        logger.info(f"✅ Google Search Grounding test successful ({response_time:.2f}ms)")
                    else:
                        results["apis"]["google_search"] = {
                            "status": "error",
                            "configured": True,
                            "response_time_ms": round(response_time, 2),
                            "error": f"Status {response.status_code}: {response.text[:100]}",
                            "purpose": "Real-time market pricing data via Google Search"
                        }
                        logger.error(f"❌ Google Search Grounding test failed: {response.status_code}")
                        
            except Exception as e:
                response_time = (time.time() - start_time) * 1000
                results["apis"]["google_search"] = {
                    "status": "error",
                    "configured": True,
                    "response_time_ms": round(response_time, 2),
                    "error": str(e),
                    "purpose": "Real-time market pricing data via Google Search"
                }
                logger.error(f"❌ Google Search Grounding test failed: {e}")
                
    except Exception as e:
        results["apis"]["google_search"] = {
            "status": "test_failed",
            "configured": False,
            "error": f"Test execution failed: {str(e)}",
            "purpose": "Real-time market pricing data via Google Search"
        }
        logger.error(f"❌ Google Search Grounding test execution failed: {e}")
    
    # Test 7: eBay API
    try:
        logger.info("Testing eBay API configuration...")
        
        ebay_app_id = os.getenv("EBAY_APP_ID")
        ebay_dev_id = os.getenv("EBAY_DEV_ID")
        ebay_cert_id = os.getenv("EBAY_CERT_ID")
        
        if not ebay_app_id or not ebay_dev_id or not ebay_cert_id:
            results["apis"]["ebay"] = {
                "status": "not_configured",
                "configured": False,
                "error": "EBAY_APP_ID, EBAY_DEV_ID, or EBAY_CERT_ID not set",
                "purpose": "eBay Motors posting",
                "response_time_ms": None
            }
        else:
            results["apis"]["ebay"] = {
                "status": "configured",
                "configured": True,
                "app_id": ebay_app_id[:8] + "..." if ebay_app_id else None,
                "purpose": "eBay Motors posting",
                "usage": "Posting to eBay Motors (user accounts)",
                "note": "Credentials configured - full test requires OAuth token",
                "error": None
            }
            logger.info("✅ eBay API credentials configured")
            
    except Exception as e:
        results["apis"]["ebay"] = {
            "status": "test_failed",
            "configured": False,
            "error": f"Test execution failed: {str(e)}",
            "purpose": "eBay Motors posting"
        }
        logger.error(f"❌ eBay API test execution failed: {e}")
    
    # Calculate summary
    total_apis = len(results["apis"])
    connected_apis = sum(1 for api in results["apis"].values() if api.get("status") == "connected")
    configured_apis = sum(1 for api in results["apis"].values() if api.get("configured", False))
    
    results["summary"] = {
        "total_apis_tested": total_apis,
        "connected": connected_apis,
        "configured": configured_apis,
        "not_configured": total_apis - configured_apis,
        "critical_apis": {
            "openai": results["apis"].get("openai", {}).get("status") == "connected",
            "gemini": results["apis"].get("gemini", {}).get("status") == "connected",
            "google_search": results["apis"].get("google_search", {}).get("status") == "connected",
            "supabase": results["apis"].get("supabase", {}).get("status") == "connected"
        },
        "all_critical_apis_working": (
            results["apis"].get("openai", {}).get("status") == "connected" and
            results["apis"].get("gemini", {}).get("status") == "connected" and
            results["apis"].get("google_search", {}).get("status") == "connected" and
            results["apis"].get("supabase", {}).get("status") == "connected"
        )
    }
    
    return JSONResponse(content=results)

