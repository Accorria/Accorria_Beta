from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.listings import router as listings_router
from app.api.v1.user import router as user_router
from app.api.v1.market_intelligence import router as market_intelligence_router
from app.api.v1.messages import router as messages_router
from app.api.v1.replies import router as replies_router
from app.api.v1.scheduler import router as scheduler_router
from app.api.v1.auth import router as auth_router
from app.api.v1.car_analysis import router as car_analysis_router
from app.api.v1.platform_posting import router as platform_posting_router
from app.api.v1 import auth, listings, messages, replies, scheduler, platform_posting, deals
# from app.services.message_monitor import start_message_monitor


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 Starting QuickFlip AI...")
    
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Start background services
    # start_message_monitor()
    
    yield
    
    # Shutdown
    print("🛑 Shutting down QuickFlip AI...")


app = FastAPI(
    title="QuickFlip AI API",
    description="Car selling co-pilot platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Include routers
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(listings.router, prefix="/api/v1", tags=["Listings"])
app.include_router(user_router, prefix="/api/v1", tags=["User"])
app.include_router(market_intelligence_router, prefix="/api/v1", tags=["Market Intelligence"])
app.include_router(messages.router, prefix="/api/v1", tags=["Messages"])
app.include_router(replies.router, prefix="/api/v1", tags=["AI Replies"])
app.include_router(scheduler.router, prefix="/api/v1", tags=["Scheduler"])
app.include_router(car_analysis_router, prefix="/api/v1", tags=["Car Analysis"])
app.include_router(platform_posting.router, prefix="/api/v1", tags=["Platform Posting"])
app.include_router(deals.router, prefix="/api/v1", tags=["Deals"])


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
        "database": "connected",
        "services": {
            "message_monitor": "running",
            "ai_reply_generator": "ready",
            "browser_automation": "ready"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 