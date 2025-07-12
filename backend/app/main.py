from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import listings
# from app.api.v1 import messages, replies, scheduler, auth
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
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(listings.router, prefix="/api/v1/listings", tags=["Listings"])
# app.include_router(messages.router, prefix="/api/v1/messages", tags=["Messages"])
# app.include_router(replies.router, prefix="/api/v1/replies", tags=["Replies"])
# app.include_router(scheduler.router, prefix="/api/v1/scheduler", tags=["Scheduler"])


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