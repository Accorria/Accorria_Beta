from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router

# Create FastAPI app instance
app = FastAPI(
    title="QuickFlip AI API",
    description="Car selling co-pilot platform API",
    version="1.0.0"
)

# Enable CORS for all origins (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router with all our endpoints
app.include_router(router)

@app.get("/")
async def health_check():
    """
    Health check endpoint to verify the API is running
    Returns a simple status message
    """
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 