#!/usr/bin/env python3

import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv("backend/.env")

app = FastAPI(title="QuickFlip AI - Test API")

# Test endpoint
@app.get("/")
async def root():
    return {"message": "QuickFlip AI is running!", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "quickflip-ai"}

# Test OpenAI connection
@app.get("/test-openai")
async def test_openai():
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # Test with a simple request
        client = openai.Client(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Say 'QuickFlip AI test successful'"}],
            max_tokens=10
        )
        
        return {
            "status": "success",
            "message": response.choices[0].message.content.strip(),
            "api_configured": True
        }
    except Exception as e:
        return {
            "status": "error", 
            "message": str(e),
            "api_configured": bool(os.getenv("OPENAI_API_KEY"))
        }

class CarAnalysisRequest(BaseModel):
    description: str
    location: str = "United States"

@app.post("/api/v1/car-analysis/test")
async def test_car_analysis(request: CarAnalysisRequest):
    """Simple test endpoint for car analysis"""
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        client = openai.Client(api_key=api_key)
        
        prompt = f"""Analyze this car description and provide basic details:

Description: {request.description}
Location: {request.location}

Please respond with a JSON object containing:
- make: estimated car make
- model: estimated car model  
- year: estimated year (if mentioned)
- estimated_price: rough price estimate
- condition: estimated condition
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200
        )
        
        return {
            "success": True,
            "analysis": response.choices[0].message.content.strip(),
            "input": {
                "description": request.description,
                "location": request.location
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 