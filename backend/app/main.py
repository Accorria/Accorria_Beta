"""
QuickFlip AI - Main FastAPI Application

Entry point for the QuickFlip AI backend API.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging
import asyncio

from app.core.config import settings
from app.core.database import engine, Base
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
    vision_test
)
from app.middleware import rate_limit_middleware, cleanup_rate_limits

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    print("🚀 Starting QuickFlip AI...")
    
    # Start rate limit cleanup task
    cleanup_task = asyncio.create_task(cleanup_rate_limits())
    
    yield
    
    # Shutdown
    print("🛑 Shutting down QuickFlip AI...")
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="QuickFlip AI API",
    description="Car selling co-pilot platform API",
    version="1.0.0",
    lifespan=lifespan
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure for production
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting middleware
app.middleware("http")(rate_limit_middleware)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    
    return response

# Include routers
app.include_router(auth_router.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(flip_car_router.router, prefix="/api/v1", tags=["Flip Car"])
app.include_router(listings.router, prefix="/api/v1", tags=["Listings"])
app.include_router(user_router.router, prefix="/api/v1", tags=["User"])
app.include_router(market_intelligence_router.router, prefix="/api/v1", tags=["Market Intelligence"])
app.include_router(messages.router, prefix="/api/v1", tags=["Messages"])
app.include_router(replies.router, prefix="/api/v1", tags=["AI Replies"])
app.include_router(scheduler.router, prefix="/api/v1", tags=["Scheduler"])
app.include_router(car_analysis_router.router, prefix="/api/v1", tags=["Car Analysis"])
app.include_router(platform_posting.router, prefix="/api/v1", tags=["Platform Posting"])
app.include_router(car_listing_generator_router.router, prefix="/api/v1", tags=["Car Listing Generator"])
app.include_router(deals.router, prefix="/api/v1", tags=["Deals"])
app.include_router(vision_test.router, prefix="/api/v1", tags=["Vision API Testing"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "QuickFlip AI API",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": "2024-01-01T00:00:00Z"
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
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 