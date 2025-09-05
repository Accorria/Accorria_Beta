"""
Accorria - Main FastAPI Application

Entry point for the Accorria backend API.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
import asyncio
import time

from app.core.config import settings
from app.core.database import async_engine, Base
from app.api.v1 import (
    auth as auth_router,
    flip_car as flip_car_router,
    listings,
    user as user_router,
    market_intelligence as market_intelligence_router,
    messages,
    replies,
    scheduler,
    car_analysis as car_analysis_router,
    platform_posting,
    car_listing_generator as car_listing_generator_router,
    deals,
    vision_test,
    supabase_auth,
    demo_test,
    public_analysis,
    enhanced_analysis,
    debug_status_router,
    data_test_router,
    analytics,
    chat as chat_router
)
from app.middleware import rate_limit_middleware, cleanup_rate_limits
from app.core.security import (
    SecurityConfig, 
    AuthenticationManager, 
    AuthorizationManager,
    RateLimitManager,
    SecurityAudit,
    InputValidation,
    SECURITY_HEADERS
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    print("🚀 Starting Accorria...")
    
    # Start rate limit cleanup task
    cleanup_task = asyncio.create_task(cleanup_rate_limits())
    
    yield
    
    # Shutdown
    print("🛑 Shutting down Accorria...")
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="Accorria API",
    description="Car selling co-pilot platform API",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiting exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security middleware stack
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Rate-Limit-Remaining"]
)

# Rate limiting middleware
app.middleware("http")(rate_limit_middleware)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Accorria Backend",
        "version": "1.0.0",
        "apis": {
            "openai_vision": "configured",
            "openai": "configured", 
            "supabase": "configured"
        }
    }

# Enhanced security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add comprehensive security headers to all responses"""
    response = await call_next(request)
    
    # Add all security headers from configuration
    for header, value in SECURITY_HEADERS.items():
        response.headers[header] = value
    
    return response

@app.middleware("http")
async def security_audit_middleware(request: Request, call_next):
    """Audit all API access for security monitoring"""
    start_time = time.time()
    
    # Get user ID from request state (set by auth middleware)
    user_id = getattr(request.state, 'user_id', 'anonymous')
    
    # Process request
    response = await call_next(request)
    
    # Calculate processing time
    process_time = time.time() - start_time
    
    # Log API access for security audit
    SecurityAudit.log_api_access(
        user_id=user_id,
        endpoint=request.url.path,
        method=request.method,
        status_code=response.status_code
    )
    
    # Add processing time header
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

@app.middleware("http")
async def input_validation_middleware(request: Request, call_next):
    """Validate and sanitize input data"""
    # For POST/PUT requests, validate input
    if request.method in ["POST", "PUT"]:
        try:
            # Get request body
            body = await request.body()
            if body:
                # Skip UTF-8 validation for multipart/form-data (image uploads)
                content_type = request.headers.get("content-type", "")
                if "multipart/form-data" not in content_type:
                    # Only validate text-based requests
                    body_str = body.decode('utf-8')
                    if len(body_str) > 1000000:  # 1MB limit
                        return Response(
                            content="Request body too large",
                            status_code=413
                        )
        except Exception as e:
            logger.warning(f"Input validation error: {e}")
    
    response = await call_next(request)
    return response

# Include routers
app.include_router(auth_router.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(supabase_auth.router, prefix="/api/v1/supabase", tags=["Supabase Auth"])
app.include_router(flip_car_router.router, prefix="/api/v1", tags=["Flip Car"])
app.include_router(listings.router, prefix="/api/v1/listings", tags=["Listings"])
app.include_router(user_router.router, prefix="/api/v1", tags=["User"])
app.include_router(market_intelligence_router.router, prefix="/api/v1", tags=["Market Intelligence"])
app.include_router(messages.router, prefix="/api/v1/messages", tags=["Messages"])
app.include_router(replies.router, prefix="/api/v1", tags=["AI Replies"])
app.include_router(scheduler.router, prefix="/api/v1", tags=["Scheduler"])
app.include_router(car_analysis_router.router, prefix="/api/v1", tags=["Car Analysis"])
app.include_router(platform_posting.router, prefix="/api/v1", tags=["Platform Posting"])
app.include_router(car_listing_generator_router.router, prefix="/api/v1", tags=["Car Listing Generator"])
app.include_router(deals.router, prefix="/api/v1", tags=["Deals"])
app.include_router(vision_test.router, prefix="/api/v1", tags=["Vision API Testing"])
app.include_router(demo_test.router, prefix="/api/v1", tags=["Demo Testing"])
app.include_router(public_analysis.router, prefix="/api/v1", tags=["Public Analysis"])
app.include_router(enhanced_analysis.router, prefix="/api/v1", tags=["Enhanced Analysis"])
app.include_router(debug_status_router, prefix="/api/v1", tags=["Debug"])
app.include_router(data_test_router, prefix="/api/v1", tags=["Data Testing"])
app.include_router(analytics.router, prefix="/api/v1", tags=["Analytics"])
app.include_router(chat_router.router, prefix="/api/v1/chat", tags=["Chat"])

# Test endpoint
@app.get("/test")
async def test_endpoint():
    return {"message": "Test endpoint working!"}

# Chat endpoint
@app.post("/chat/enhanced")
async def enhanced_chat(request: Request):
    """
    Enhanced chat endpoint for Accorria AI agent
    """
    try:
        body = await request.json()
        messages = body.get("messages", [])
        
        # Simple response for testing
        return {
            "response": "Hello! I'm Accorria's AI agent. I'm here to help you list cars and homes for sale. How can I assist you today?",
            "success": True
        }
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        return {"error": f"Chat service error: {str(e)}", "success": False}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Accorria API",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "message": "Something went wrong"}
    )


if __name__ == "__main__":
    import uvicorn
    import os
    
    # Use PORT environment variable or default to 8000
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    ) 